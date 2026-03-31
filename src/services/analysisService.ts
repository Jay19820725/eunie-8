import { GoogleGenAI, Type } from "@google/genai";
import { SelectedCards, AnalysisReport, FiveElementValues } from "../core/types";

/**
 * Generates an AI-driven energy analysis report using Gemini.
 * Analyzes card pairs, user associations, and five element values.
 */
export const generateAIAnalysis = async (
  selectedCards: SelectedCards,
  totalScores: FiveElementValues,
  currentLang: 'zh' | 'ja' = 'zh',
  reportType: 'daily' | 'wish' = 'daily',
  wishContext?: { category: string; target: string; content: string },
  historicalScores?: Record<string, number>
): Promise<Partial<AnalysisReport>> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing in analysisService");
    return getFallbackContent(selectedCards, currentLang, reportType);
  }

  // Lazy initialization of AI client
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  // Fetch active prompt from database for the specific language
  let promptTemplate = "";
  
  try {
    const promptResponse = await fetch(`/api/prompts/active?lang=${currentLang}&report_type=${reportType}`);
    if (promptResponse.ok) {
      const activePrompt = await promptResponse.json();
      promptTemplate = activePrompt.content || "";
      console.log(`Fetched active prompt for ${reportType} (${currentLang}), length: ${promptTemplate.length}`);
    } else {
      console.warn(`Failed to fetch active prompt: ${promptResponse.status}`);
    }
  } catch (err) {
    console.warn("Failed to fetch active prompt, using fallback template:", err);
  }

  // Fallback hardcoded prompt if no prompt found in DB
  if (!promptTemplate) {
    if (reportType === 'wish') {
      promptTemplate = currentLang === 'ja'
        ? `
        あなたは現代女性の悩みを癒やし、解決へと導く「靈魂解憂師（Soul Relief Guide）」、EUNIEです。
        東洋の五行思想と潜在意識の投影理論を融合させ、彼女の「悩み」を解決するための最適な「導きの手法」を以下の3つから自動的に選択し、解読を行ってください。
        
        【選択すべき3つの手法】
        1. 手法A：深い洞察（Deep Insight）- 悩みの根源や潜在意識のパターンを解き明かす。繰り返される悩みや深い混乱に最適。
        2. 手法B：行動指引（Action-Oriented）- 具体的な「顕化ワーク」と轉化のステップを提示する。実務的な悩みや行き詰まりを感じている時に最適。
        3. 手法C：視點の轉換（Perspective Shift）- 悩みを「魂のギフト」として再定義する。すぐには変えられない状況や心の平安を求めている時に最適。
        
        【分析の指針】
        - ユーザーの悩み內容を分析し、最も効果的な手法（A, B, または C）を1つ選択してください。
        - 回答は以下の5つのセクションで構成し、最初の4つは「隠喩的、詩的、文学的」な表現を用い、最後は「平易な言葉による要約」としてください：
          1. 【魂の顯影】(soulMirror)：彼女の悩みに直接応え、カードのイメージを彼女の現状の深い反映へと昇華させます。
          2. 【運命の囁き】(destinyWhisper)：カードのキーワード、導きの言葉、そして彼女の現実の苦境を深く縫い合わせ、エネルギーの流れる方向を明らかにします。
          3. 【轉換の導き】(transformationPath)：彼女が気づいていない盲点を見通し、悩みを再定義して、変化のきっかけを提供します。
          4. 【守護の儀式】(healingRitual)：具体的で小さく、儀式感のある行動指針を提示します。
          5. 【平易な言葉による要約】(plainSummary)：上記の核心的なポイントと行動の提案を、最も直感的で温かく、分かりやすい言葉でまとめます。
        - どの手法を選んでも、必ず「具体的な行動」を伴う解決策を提示してください。
        - カードの意味（70%）と悩みの文脈（30%）を融合させ、溫かくも力強い言葉で綴ってください。
        
        【彼女の悩み（心のざわつき）】
        領域: ${wishContext?.category}
        対象/核心: ${wishContext?.target}
        內容: ${wishContext?.content}
        
        【彼女の心の欠片（カードと連想）】
        {{USER_DATA}}
        
        【現在のエネルギーの鼓動】
        {{ENERGY_DATA}}
        
        【過去のエネルギー傾向（直近10回平均）】
        ${historicalScores ? JSON.stringify(historicalScores) : "データなし"}
        `
        : `
        妳是療癒現代女性心靈、指引煩惱出口的「靈魂解憂師（Soul Relief Guide）」，EUNIE。
        妳融合了東方五行平衡論與潛意識投射理論，請根據她的「煩惱內容」，從以下三種「轉化策略」中自動選擇最適合的一種進行解讀：
        
        【三種轉化策略】
        1. 策略 A：深度洞察 (Deep Insight) - 剖析煩惱背後的能量真相與潛意識慣性。適合反覆出現或深層混亂的問題。
        2. 策略 B：行動指引 (Action-Oriented) - 提供具體的「顯化練習」與轉化步驟。適合務實困境或感到停滯不前時。
        3. 策略 C：心靈轉念 (Perspective Shift) - 將煩惱重新定義為靈魂的禮物或邀請。適合無法立即改變現狀或尋求內心平靜時。
        
        【分析原則】
        - 請先判斷她的煩惱性質，並選擇最合適的策略（A, B 或 C）。
        - 妳的回答必須包含以下五個部分，且前四部分請使用「隱喻式、詩意、文學感」的語言，最後一部分為「白話總結」：
          1. 【靈魂的顯影】(soulMirror)：直接回應她的煩惱，將牌面意象轉化為對她現狀的深刻映照。
          2. 【命運的私語】(destinyWhisper)：深度縫合牌面關鍵字、引導文字與她的現實困境，揭示能量的流動方向。
          3. 【轉念的導引】(transformationPath)：透視她未曾察覺的盲點，將煩惱重新定義，提供轉化的契機。
          4. 【守護的儀式】(healingRitual)：提供一個具體、微小且充滿儀式感的行動指引。
          5. 【白話總結】(plainSummary)：用最直白、溫暖且易懂的語言，總結上述的核心重點與行動建議。
        - 無論選擇哪種策略，最終都必須包含「具體的行動指引」，讓她知道如何從當下開始轉化。
        - 以「牌面核心意義」為主要依據（70%），結合煩惱背景，給予深刻、精準且充滿啟發性的指引。
        
        【她的煩惱（心中紛擾）】
        領域: ${wishContext?.category}
        對象/核心: ${wishContext?.target}
        內容: ${wishContext?.content}
        
        【她的心靈碎片（抽卡與連想）】
        {{USER_DATA}}
        
        【當前能量的律動】
        {{ENERGY_DATA}}
        
        【過去能量軌跡（近10次平均）】
        ${historicalScores ? JSON.stringify(historicalScores) : "尚無數據"}
        `;
    } else {
      promptTemplate = currentLang === 'ja'
        ? `
        あなたは現代女性の心に寄り添う「エネルギーの織り手（Energy Weaver）」、EUNIEです。
        東洋の五行思想と潜在意識の投影理論を融合させ、分析者ではなく、温かい伴侶として彼女の心に触れてください。
        
        【分析の指針】
        1. 今この瞬間のエネルギーの「流れ」と「バランス」を詩的に描写してください。
        2. 彼女が自分自身を慈しみ、今の自分を肯定できるようなメッセージを届けてください。
        3. 語り口は軽やかで、微風のように心地よく、安心感を与えるものにしてください。
        
        【彼女の心の欠片（カードと連想）】
        {{USER_DATA}}
        
        【現在のエネルギーの鼓動】
        {{ENERGY_DATA}}
        
        【過去のエネルギー傾向（直近10回平均）】
        ${historicalScores ? JSON.stringify(historicalScores) : "データなし"}
        `
        : `
        妳是守護現代女性心靈的「能量編織者（Energy Weaver）」，EUNIE。
        妳融合了東方五行平衡論與潛意識投射理論，請不要以冷冰冰的分析者身份說話，而是作為一位溫暖的陪伴者，編織當下的能量律動。
        
        【分析原則】
        1. 側重於描述「當前狀態」的流動與平衡，將牌面意義轉化為詩意的生命提醒。
        2. 鼓勵她接納自我，在日常的起伏中看見內在的美麗與力量。
        3. 語氣要詩意、輕柔、充滿療癒感，像是一場與靈魂的溫柔對話。
        
        【她的心靈碎片（抽卡與連想）】
        {{USER_DATA}}
        
        【當前能量的律動】
        {{ENERGY_DATA}}
        
        【過去能量軌跡（近10次平均）】
        ${historicalScores ? JSON.stringify(historicalScores) : "尚無數據"}
        `;
    }
  }

  const userData = selectedCards.pairs?.map((pair, i) => {
    if (currentLang === 'ja') {
      return `
        ペア ${i + 1}:
        - 画像カード: [${pair.image.name}] (五行エネルギー: ${JSON.stringify(pair.image.elements)})
        - 言葉カード: [${pair.word.name}] (五行エネルギー: ${JSON.stringify(pair.word.elements)})
        - ユーザーの連想: "${pair.association}"
      `;
    }
    return `
      配對 ${i + 1}:
      - 圖片卡: [${pair.image.name}] (五行權重: ${JSON.stringify(pair.image.elements)})
      - 文字卡: [${pair.word.name}] (五行權重: ${JSON.stringify(pair.word.elements)})
      - 用戶連想: "${pair.association}"
    `;
  }).join('\n');

  // Ensure placeholders exist, if not, append data to the end of the prompt
  let finalPrompt = promptTemplate;
  
  // Add strict language instruction at the beginning
  const langInstruction = currentLang === 'ja' 
    ? "【重要】必ず日本語 (ja-JP) で回答してください。中国語を混ぜないでください。" 
    : "【重要】請務必使用繁體中文 (zh-TW) 回答。不要夾雜日文。";
  
  finalPrompt = `${langInstruction}\n\n${finalPrompt}`;

  if (finalPrompt.includes('{{USER_DATA}}')) {
    finalPrompt = finalPrompt.replace('{{USER_DATA}}', userData || "");
  } else {
    const label = currentLang === 'ja' ? "【ユーザーデータ】" : "【用戶抽卡與連想資料】";
    finalPrompt += `\n\n${label}\n${userData}`;
  }

  if (finalPrompt.includes('{{ENERGY_DATA}}')) {
    finalPrompt = finalPrompt.replace('{{ENERGY_DATA}}', JSON.stringify(totalScores));
  } else {
    const label = currentLang === 'ja' ? "【エネルギーデータ】" : "【當前五行能量權重】";
    finalPrompt += `\n\n${label}\n${JSON.stringify(totalScores)}`;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: finalPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            todayTheme: { type: Type.STRING },
            cardInterpretation: { type: Type.STRING },
            psychologicalInsight: { type: Type.STRING },
            soulMirror: { type: Type.STRING, description: "靈魂鏡像 / 靈魂的顯影，僅在解惑模式下提供" },
            destinyWhisper: { type: Type.STRING, description: "命運的私語，僅在解惑模式下提供" },
            transformationPath: { type: Type.STRING, description: "轉念的導引，僅在解惑模式下提供" },
            healingRitual: { type: Type.STRING, description: "守護的儀式，僅在解惑模式下提供" },
            plainSummary: { type: Type.STRING, description: "白話總結，僅在解惑模式下提供" },
            fiveElementAnalysis: { type: Type.STRING },
            reflection: { type: Type.STRING },
            actionSuggestion: { type: Type.STRING },
            pairInterpretations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pair_id: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["pair_id", "text"]
              }
            }
          },
          required: reportType === 'wish' 
            ? ["todayTheme", "cardInterpretation", "psychologicalInsight", "fiveElementAnalysis", "reflection", "actionSuggestion", "soulMirror", "destinyWhisper", "transformationPath", "healingRitual", "plainSummary"]
            : ["todayTheme", "cardInterpretation", "psychologicalInsight", "fiveElementAnalysis", "reflection", "actionSuggestion"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    console.log("AI Analysis successful, parsing response...");
    const content = JSON.parse(text);
    
    return {
      ...content,
      lang: currentLang // Store the language tag
    };
  } catch (error) {
    console.error("AI Analysis failed. Error details:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // Fallback static content
    console.warn("Falling back to static content due to AI failure.");
    return getFallbackContent(selectedCards, currentLang, reportType);
  }
};

/**
 * Provides static fallback content when AI analysis fails.
 */
const getFallbackContent = (
  selectedCards: SelectedCards,
  currentLang: 'zh' | 'ja' = 'zh',
  reportType: 'daily' | 'wish' = 'daily'
): Partial<AnalysisReport> => {
  const baseFallback = {
    todayTheme: currentLang === 'ja' ? "流れる時の中で、あなたの魂が安らげる場所を見つけましょう。" : "在流動的時光中，為妳的靈魂尋找一處安放的港灣。",
    cardInterpretation: currentLang === 'ja' ? "あなたが選んだカードは、心の奥底にある静かな願いと、優しく包み込まれたいという渴望を映し出しています。" : "妳選取的牌卡映照出妳內心深處靜謐的期盼，以及渴望被溫柔包裹的靈魂。",
    psychologicalInsight: currentLang === 'ja' ? "現在のあなたは、まるで夜明け前の静寂の中にいるようです。わずかな不安は、新しい光を迎えるための準備にすぎません。" : "當前的妳，宛如置身於黎明前的靜謐。那些微的焦慮，只是為了迎接新光芒而做的準備。",
    fiveElementAnalysis: currentLang === 'ja' ? "エネルギーの起伏は、生命が奏でる美しい旋律です。優勢な要素はあなたを支え、不足している要素は休息の必要性を教えてくれています。" : "能量的起伏是生命奏出的美麗旋律，優勢的元素支撐著妳，不足的元素則在提醒妳休息的必要。",
    reflection: currentLang === 'ja' ? "目を閉じて、自分の鼓動に耳を傾けてみてください。自分に問いかけてみましょう：今の私に、最も必要な「心の抱擁」は何ですか？" : "閉上眼，傾聽自己的心跳，問問自己：現在的我，最需要什麼樣的「心靈擁抱」？",
    actionSuggestion: currentLang === 'ja' ? "今日は自分のために温かいお茶を淹れ、ただ静かにそこにいてください。あなたは、そのままで十分に美しいのですから。" : "今天試著為自己泡一杯熱茶，只是靜靜地存在。因為妳，原本就如此美麗。",
    pairInterpretations: selectedCards.pairs?.map((_, i) => ({
      pair_id: i.toString(),
      text: currentLang === 'ja' ? "このペアは、あなたの内なる静かな対話を象徴しています。" : "這組配對象徵著妳內在靜謐的對話。"
    })) || []
  };

  if (reportType === 'wish') {
    return {
      ...baseFallback,
      soulMirror: currentLang === 'ja' ? "鏡に映るあなたの姿は、静かな湖面のように澄んでいます。" : "鏡中的妳，宛如靜謐湖面般澄澈。",
      destinyWhisper: currentLang === 'ja' ? "風が運ぶ囁きは、新しい始まりを告げています。" : "風中傳來的私語，正預示著新的開始。",
      transformationPath: currentLang === 'ja' ? "視点を変えれば、影は光の存在を証明しています。" : "換個角度看，陰影正是光存在的證明。",
      healingRitual: currentLang === 'ja' ? "今夜は月を見上げ、深呼吸を3回してください。" : "今晚請抬頭望月，並做三次深呼吸。",
      plainSummary: currentLang === 'ja' ? "焦らず、自分を信じて進んでください。小さな一歩が大切です。" : "不要焦慮，相信自己。邁出小小的一步至關重要。"
    };
  }

  return baseFallback;
};
