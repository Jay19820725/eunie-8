import { Request, Response, NextFunction } from "express";
import { pool } from "../db.ts";

export const seoMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers["user-agent"] || "";
  const isCrawler = /facebookexternalhit|line-poker|Twitterbot|googlebot|bingbot|linkedinbot/i.test(userAgent);

  if (!isCrawler) {
    return next();
  }

  try {
    let title = "EUNIE 嶼妳 | 懂妳的能量，平衡妳的生活";
    let description = "透過五行能量卡片，探索內在自我，獲得每日心靈指引與能量平衡。";
    let ogImage = "https://picsum.photos/seed/lumina-og/1200/630";
    const url = `${process.env.APP_URL || 'https://' + req.get('host')}${req.originalUrl}`;

    // Language detection for SEO
    let seoLang = 'zh';
    if (req.params.id) {
      const langResult = await pool.query("SELECT lang FROM energy_reports WHERE id = $1", [req.params.id]);
      if (langResult.rows.length > 0) {
        seoLang = langResult.rows[0].lang || 'zh';
      }
    }

    const seoTranslations: Record<string, { title: string, description: string }> = {
      zh: {
        title: "EUNIE 嶼妳 | 懂妳的能量，平衡妳的生活",
        description: "透過五行能量卡片，探索內在自我，獲得每日心靈指引與能量平衡。"
      },
      ja: {
        title: "EUNIE | あなたのエネルギーを理解し、生活を整える",
        description: "五行エネルギーカードを通じて内なる自己を探索し、日々の心の指引とエネルギーバランスを得る。"
      }
    };

    if (seoLang === 'ja') {
      title = seoTranslations.ja.title;
      description = seoTranslations.ja.description;
    }

    // Fetch global SEO settings
    const seoResult = await pool.query("SELECT value FROM site_settings WHERE key = 'seo'");
    if (seoResult.rows.length > 0) {
      const seo = seoResult.rows[0].value;
      title = seo.title || title;
      description = seo.description || description;
      ogImage = seo.og_image || ogImage;
    }

    // If it's a report page, fetch report-specific data
    if (req.params.id) {
      const reportResult = await pool.query("SELECT * FROM energy_reports WHERE id = $1", [req.params.id]);
      if (reportResult.rows.length > 0) {
        const report = reportResult.rows[0];
        title = report.today_theme || title;
        // Use selected thumbnail if available, otherwise use dominant element image or default
        ogImage = report.share_thumbnail || ogImage;
        
        // Language-aware description
        const reportLang = report.lang || 'zh';
        const elementMap: Record<string, Record<string, string>> = {
          zh: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水', none: '平衡' },
          ja: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水', none: 'バランス' }
        };
        const dominant = (report.dominant_element || 'none').toLowerCase();
        const translatedElement = elementMap[reportLang as 'zh' | 'ja']?.[dominant] || report.dominant_element;

        if (reportLang === 'ja') {
          description = `EUNIEでのエネルギー分析結果です。主要な要素：${translatedElement}。`;
          if (!report.today_theme) {
            title = seoTranslations.ja.title;
          }
        } else {
          description = `這是我在 EUNIE 的能量剖析結果。主導元素：${translatedElement}。`;
          if (!report.today_theme) {
            title = seoTranslations.zh.title;
          }
        }
      }
    }

    const html = `
      <!DOCTYPE html>
      <html lang="${seoLang === 'ja' ? 'ja' : 'zh-TW'}">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta name="description" content="${description}">
        
        <!-- Open Graph / Facebook / LINE -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="${url}">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${ogImage}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="${url}">
        <meta property="twitter:title" content="${title}">
        <meta property="twitter:description" content="${description}">
        <meta property="twitter:image" content="${ogImage}">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="text/javascript">
          window.location.href = "${req.originalUrl}";
        </script>
      </head>
      <body>
        <h1>${title}</h1>
        <p>${description}</p>
        <img src="${ogImage}" alt="Preview Image">
      </body>
      </html>
    `;
    res.send(html);
  } catch (err) {
    console.error("SEO Injection Error:", err);
    next();
  }
};
