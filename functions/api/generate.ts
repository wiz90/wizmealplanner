// 简单的内存速率限制 (生产环境建议用 Cloudflare Rate Limiting)
const rateLimitMap = new Map();

function checkRateLimit(ip, limit = 20, windowMs = 60000) {
  const now = Date.now();
  const key = ip;
  const record = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs };
  
  // 重置窗口
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }
  
  record.count++;
  rateLimitMap.set(key, record);
  
  return record.count <= limit;
}

export async function onRequestPost({ request, env }) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // 速率限制检查
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!checkRateLimit(clientIP)) {
    console.log(`[RATE LIMIT] IP: ${clientIP}`);
    return new Response(JSON.stringify({ error: '请求过于频繁，请稍后再试' }), { status: 429, headers });
  }

  try {
    const body = await request.json();
    
    // 验证输入结构
    const profile = body.profile || {};
    const session = body.session || {};
    
    // 基本验证
    if (!profile || !session) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), { status: 400, headers });
    }
    
    // 清理和验证用户输入
    const sanitizeInput = (str) => {
      if (typeof str !== 'string') return '';
      return str.replace(/[<>\"\';]/g, '').trim().substring(0, 200);
    };
    
    const restrictions = [...(profile.hard_restrictions || []), ...(profile.custom_restrictions || [])]
      .map(sanitizeInput).filter(Boolean).join('、') || '无';
    const dislikes = (session.soft_dislikes || []).map(sanitizeInput).filter(Boolean).join('、') || '无';
    const goals = (profile.goals || []).map(sanitizeInput).filter(Boolean).join('、') || '健康';
    const isSimple = goals.includes('制作简单') || session.simple_prep === true;
    const kitchenTools = (profile.kitchen_tools || []).map(sanitizeInput).filter(Boolean).join('、') || '无';
    const styles = (session.style_preferences || []).map(sanitizeInput).filter(Boolean).join('、') || '家常中餐';
    const meals = (session.meals_per_day || []).map(sanitizeInput).filter(Boolean).join('、') || '早餐、午餐、晚餐';
    const personCount = Math.min(Math.max(parseInt(session.person_count) || 2, 1), 20);
    const budget = sanitizeInput(session.budget) || '无限制';
    const days = Math.min(Math.max(parseInt(session.days) || 3, 1), 30);
    
    const simpleNote = isSimple ? '\n【重要】制作简单：选择步骤少（不超过3步）、食材易获取、烹饪难度低的菜谱。' : '';
    
    const prompt = `你是专业中餐食谱规划师。只返回JSON。

【用户档案】
- 目标: ${goals}
- 忌口: ${restrictions} (严格遵守)
- 不爱吃: ${dislikes} (尽量避免)
- 厨具: ${kitchenTools}${simpleNote}

【本次计划】
- 天数: ${days}天
- 风格: ${styles}
- 餐次: ${meals}
- 人数: ${personCount}人
- 预算: ${budget}

【重要：中餐饮食结构要求】
每餐必须包含:
- 早餐: 主食(粥/豆浆/牛奶等) + 蛋白质(鸡蛋/豆浆等)
- 午餐: 主食(米饭/面条) + 主菜(肉/鱼/蛋) + 蔬菜
- 晚餐: 主食(米饭/面条) + 主菜(肉/鱼/蛋) + 蔬菜 + 可选汤

【JSON格式】
{
  "days": [
    {
      "day_index": 1,
      "meals": [
        {
          "type": "午餐",
          "dishes": [
            {"dish_type": "主食", "recipe": {"recipe_name": "米饭", "tags": ["主食"], "time_cost": 30, "ingredients": ["大米", "水"], "steps": ["1. 淘米", "2. 加水", "3. 煮熟"]}},
            {"dish_type": "主菜", "recipe": {"recipe_name": "西红柿炒蛋", "tags": ["家常", "简单"], "time_cost": 15, "ingredients": ["西红柿2个", "鸡蛋2个", "盐少许"], "steps": ["1. 西红柿切块", "2. 鸡蛋打散", "3. 炒熟"]}},
            {"dish_type": "蔬菜", "recipe": {"recipe_name": "蒜蓉青菜", "tags": ["清淡"], "time_cost": 5, "ingredients": ["青菜", "蒜蓉"], "steps": ["1. 青菜洗净", "2. 蒜蓉爆香", "3. 翻炒"]}}
          ]
        }
      ]
    }
  ]
}

【严格要求】
1. 严格返回JSON，不要有任何其他文字
2. 每餐必须包含主食+主菜+蔬菜（早餐除外）
3. ${days}天，每天3餐
4. 步骤要简洁明了，不超过3步
5. 食材要家常易获取
6. 每个食材必须包含具体用量，如"鸡蛋2个"、"大米100克"
7. 相同食材必须合并为一条，标注总用量`;

    // 获取 API 配置
    const apiKey = env.CUSTOM_API_KEY || env.DEEPSEEK_API_KEY || '';
    const apiUrl = env.CUSTOM_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    const modelName = env.CUSTOM_MODEL || 'MiniMax-M2.7-highspeed';
    
    if (!apiKey) {
      console.log(`[ERROR] No API key configured`);
      return new Response(JSON.stringify({ error: 'API密钥未配置' }), { status: 500, headers });
    }

    // 判断是否为 MiniMax API
    const isMiniMax = apiUrl.includes('minimax');
    
    // 使用更简单、更明确的提示
    const simplePrompt = `为${personCount}人规划${days}天${styles}菜单。
目标: ${goals}
忌口: ${restrictions}
不爱吃: ${dislikes}
厨具: ${kitchenTools}
${simpleNote}

返回JSON格式:
{
  "days": [{"day_index":1,"meals":[{"type":"早餐","dishes":[{"dish_type":"主食","recipe":{"recipe_name":"菜名","time_cost":10,"ingredients":["食材"],"steps":["步骤"]}}]}]}]
}

只返回JSON，不要其他文字。`;

    // MiniMax 请求格式
    const apiBody = isMiniMax ? {
      model: modelName,
      messages: [
        { role: 'system', content: '只返回JSON。' },
        { role: 'user', content: simplePrompt }
      ],
      temperature: 0.1,  // 非常低的温度以获得最一致的输出
      max_tokens: 4000,  // 增加到 4000
    } : {
      model: modelName,
      messages: [{ role: 'user', content: simplePrompt }],
      temperature: 0.1,
      max_tokens: 4000,
    };
    
    console.log(`[REQUEST] IP: ${clientIP}, Days: ${days}, Model: ${modelName}, API: ${isMiniMax ? 'MiniMax' : 'DeepSeek'}`);
    
    const startTime = Date.now();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify(apiBody),
    });

    const duration = Date.now() - startTime;
    console.log(`[API] Status: ${response.status}, Duration: ${duration}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[API ERROR] ${response.status}: ${errorText}`);
      const errMsg = 'API错误: ' + response.status;
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 500,
        headers,
      });
    }

    const data = await response.json();
    // MiniMax M2.7 可能把内容放在 reasoning_content 里
    const content = data.choices?.[0]?.message?.content || 
                   data.choices?.[0]?.message?.reasoning_content || '';
    
    let jsonStr = content.trim();
    
    // === P0: 容错 JSON 提取 ===
    // 尝试从 markdown 代码块中提取
    if (jsonStr.startsWith('```')) {
      const match = jsonStr.match(/```[\s\S]*?({[\s\S]*})[\s\S]*?```/);
      if (match) {
        jsonStr = match[1];
      } else {
        jsonStr = jsonStr.replace(/```json?/g, '').replace(/```/g, '').trim();
      }
    }
    
    // 提取 { ... } 区间
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }
    
    // 容错修复策略
    let result = null;
    const strategies = [
      // 策略0: 直接解析
      () => { result = JSON.parse(jsonStr); },
      
      // 策略1: 移除行尾逗号 (trailing comma before } or ])
      () => {
        const fixed = jsonStr.replace(/,(\s*[}\]])/g, '$1');
        result = JSON.parse(fixed);
      },
      
      // 策略2: 移除多余逗号 (e.g., [...,])
      () => {
        const fixed = jsonStr
          .replace(/,\s*,/g, ',')           // 双逗号变单
          .replace(/,\s*]/g, ']')            // 数组尾逗号
          .replace(/,\s*}/g, '}');          // 对象尾逗号
        result = JSON.parse(fixed);
      },
      
      // 策略3: 修复被截断的 JSON（补全缺失括号）
      () => {
        const openBraces = (jsonStr.match(/{/g) || []).length;
        const closeBraces = (jsonStr.match(/}/g) || []).length;
        const openBrackets = (jsonStr.match(/\[/g) || []).length;
        const closeBrackets = (jsonStr.match(/\]/g) || []).length;
        let fixed = jsonStr;
        if (openBraces > closeBraces) fixed += '}'.repeat(openBraces - closeBraces);
        if (openBrackets > closeBrackets) fixed += ']'.repeat(openBrackets - closeBrackets);
        result = JSON.parse(fixed);
      },
      
      // 策略5: 提取任何看起来像JSON的部分
      () => {
        // 尝试找到任何 { ... } 结构
        const jsonMatches = jsonStr.match(/{[\s\S]*?}/g);
        if (!jsonMatches || jsonMatches.length === 0) throw new Error('No JSON found');
        
        // 取最长的匹配
        const longestMatch = jsonMatches.reduce((a, b) => a.length > b.length ? a : b);
        
        // 尝试修复常见问题
        let fixed = longestMatch
          .replace(/,\s*,/g, ',')
          .replace(/,\s*]/g, ']')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*([}\])])/g, '$1');
        
        // 确保括号匹配
        const openBraces = (fixed.match(/{/g) || []).length;
        const closeBraces = (fixed.match(/}/g) || []).length;
        const openBrackets = (fixed.match(/\[/g) || []).length;
        const closeBrackets = (fixed.match(/\]/g) || []).length;
        
        if (openBraces > closeBraces) fixed += '}'.repeat(openBraces - closeBraces);
        if (openBrackets > closeBrackets) fixed += ']'.repeat(openBrackets - closeBrackets);
        
        result = JSON.parse(fixed);
      },
    ];
    
    for (let i = 0; i < strategies.length; i++) {
      try {
        strategies[i]();
        if (i > 0) console.log(`[JSON FIX] Strategy ${i} succeeded`);
        break;
      } catch (e) {
        if (i === strategies.length - 1) {
          console.log(`[JSON ERROR] All ${strategies.length} strategies failed: ${e.message}`);
          console.log(`[JSON RAW] ${jsonStr.substring(0, 500)}...`);
          console.log(`[JSON FULL LENGTH] ${jsonStr.length} chars`);
          
          // 返回更详细的错误信息
          const errorDetail = `AI返回的数据格式错误。请检查AI是否返回了有效的JSON。\n\n` +
                            `错误: ${e.message}\n` +
                            `前500字符: ${jsonStr.substring(0, 200)}...`;
          return new Response(JSON.stringify({ error: '数据解析失败，请重试', detail: errorDetail }), { status: 500, headers });
        }
      }
    }
    console.log(`[SUCCESS] Generated ${days} days plan`);
    
    return new Response(JSON.stringify(result), { headers });
  } catch (error) {
    console.log(`[ERROR] ${error.message}`);
    const errMsg = '生成失败: ' + error.message;
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers,
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}