import { Request, Response, NextFunction } from "express";
import { pool } from "../db.ts";

export const seoMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers["user-agent"] || "";
  // LINE crawler can identify as facebookexternalhit, line-poker, or contain "Line/"
  // 注意：不可包含 "line/" — LINE 瀏覽器 UA 也含此字串，會導致無限重導迴圈
  // LINE 的爬蟲 bot 使用 facebookexternalhit 或 line-poker，已涵蓋在下方
  const isCrawler = /facebookexternalhit|line-poker|Twitterbot|googlebot|bingbot|linkedinbot|slackbot/i.test(userAgent)
    && !/Mozilla\/5\.0/i.test(userAgent); // 排除所有真實瀏覽器（含 LINE browser）

  if (!isCrawler) {
    return next();
  }

  try {
    let title = "EUNIE 嶼妳 | 懂妳的能量，平衡妳的生活";
    let description = "透過五行能量卡片，探索內在自我，獲得每日心靈指引與能量平衡。";
    let ogImage = "https://picsum.photos/seed/lumina-og/1200/630";
    
    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
    const url = `${baseUrl}${req.originalUrl}`;

    // Extract report ID from path if not in params (since this might be used as global middleware)
    const reportIdMatch = req.path.match(/^\/report\/([^\/]+)/);
    const reportId = req.params.id || (reportIdMatch ? reportIdMatch[1] : null);

    let seoLang = 'zh';

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

    // Fetch global SEO settings first
    const seoResult = await pool.query("SELECT value FROM site_settings WHERE key = 'seo'");
    if (seoResult.rows.length > 0) {
      const seo = seoResult.rows[0].value;
      title = seo.title || title;
      description = seo.description || description;
      ogImage = seo.og_image || ogImage;
    }

    // If it's a report page, fetch report-specific data
    if (reportId) {
      const reportResult = await pool.query("SELECT * FROM energy_reports WHERE id = $1", [reportId]);
      if (reportResult.rows.length > 0) {
        const report = reportResult.rows[0];
        seoLang = report.lang || 'zh';
        
        if (seoLang === 'ja') {
          title = report.today_theme || seoTranslations.ja.title;
        } else {
          title = report.today_theme || seoTranslations.zh.title;
        }

        // Use selected thumbnail if available
        if (report.share_thumbnail) {
          ogImage = report.share_thumbnail;
        }
        
        // Ensure ogImage is absolute
        if (ogImage.startsWith('/')) {
          ogImage = `${baseUrl}${ogImage}`;
        }
        
        // Language-aware description
        const elementMap: Record<string, Record<string, string>> = {
          zh: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水', none: '平衡' },
          ja: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水', none: 'バランス' }
        };
        const dominant = (report.dominant_element || 'none').toLowerCase();
        const translatedElement = elementMap[seoLang as 'zh' | 'ja']?.[dominant] || report.dominant_element;

        if (seoLang === 'ja') {
          description = `EUNIEでのエネルギー分析結果です。主要な要素：${translatedElement}。`;
        } else {
          description = `這是我在 EUNIE 的能量剖析結果。主導元素：${translatedElement}。`;
        }
      }
    } else {
      // Default language based on query or header if not a report
      const langQuery = req.query.lang as string;
      if (langQuery === 'ja') {
        seoLang = 'ja';
        title = seoTranslations.ja.title;
        description = seoTranslations.ja.description;
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
          // Redirect to the actual SPA route
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
    res.set('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    console.error("SEO Injection Error:", err);
    return next();
  }
};
