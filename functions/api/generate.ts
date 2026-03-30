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

// 检测 JSON 是否被截断（比 isJsonComplete 更严格）
function looksTruncated(str) {
  const trimmed = str.trim();
  if (!trimmed) return true;
  
  const lastChar = trimmed[trimmed.length - 1];
  
  // 如果最后字符不是 } 或 ]，明显截断
  if (lastChar !== '}' && lastChar !== ']') return true;
  
  // 检查是否截断在字符串内部
  // 找到最后一个 } 或 ] 之后的部分，看引号是否成对
  const lastBraceOrBracket = Math.max(trimmed.lastIndexOf('}'), trimmed.lastIndexOf(']'));
  const afterLastClose = trimmed.substring(lastBraceOrBracket + 1);
  
  // 如果最后一个闭括号后面还有非空白字符（且不是 } 或 ]），说明截断
  if (afterLastClose.trim()) return true;
  
  // 检查截断在字符串内部的情况（最后字符是 } 或 ]，但可能在字符串内）
  // 统计最后一个闭括号之前未转义的引号对数
  const beforeLastClose = trimmed.substring(0, lastBraceOrBracket + 1);
  const quoteMatches = beforeLastClose.match(/(?:[^\\])"/g);
  const quoteCount = quoteMatches ? quoteMatches.length : 0;
  
  // 如果引号数为奇数，说明最后在字符串内部截断
  if (quoteCount % 2 === 1) return true;
  
  // 检查括号匹配是否表明截断
  const openBraces = (trimmed.match(/{/g) || []).length;
  const closeBraces = (trimmed.match(/}/g) || []).length;
  const openBrackets = (trimmed.match(/\[/g) || []).length;
  const closeBrackets = (trimmed.match(/\]/g) || []).length;
  
  // 如果闭括号比开括号多，肯定截断
  if (closeBraces > openBraces || closeBrackets > openBrackets) return true;
  
  return false;
}

// 提取有效 JSON 字符串
function extractJson(str) {
  let jsonStr = str.trim();
  
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
  
  return jsonStr;
}

// 修复并解析 JSON
function parseJsonWithRetry(jsonStr, maxRetries = 2) {
  const strategies = [
    // 策略0: 直接解析
    () => JSON.parse(jsonStr),
    
    // 策略1: 移除行尾逗号
    () => JSON.parse(jsonStr.replace(/,(\s*[}\]])/g, '$1')),
    
    // 策略2: 移除多余逗号
    () => JSON.parse(
      jsonStr.replace(/,\s*,/g, ',').replace(/,\s*]/g, ']').replace(/,\s*}/g, '}')
    ),
    
    // 策略3: 补全缺失括号
    () => {
      let fixed = jsonStr;
      const openBraces = (jsonStr.match(/{/g) || []).length;
      const closeBraces = (jsonStr.match(/}/g) || []).length;
      const openBrackets = (jsonStr.match(/\[/g) || []).length;
      const closeBrackets = (jsonStr.match(/\]/g) || []).length;
      if (openBraces > closeBraces) fixed += '}'.repeat(openBraces - closeBraces);
      if (openBrackets > closeBrackets) fixed += ']'.repeat(openBrackets - closeBrackets);
      return JSON.parse(fixed);
    },
  ];
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      return { success: true, data: strategies[i](), strategy: i };
    } catch (e) {
      if (i === strategies.length - 1) {
        return { success: false, error: e.message, strategy: -1 };
      }
    }
  }
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
    
    const simpleNote = isSimple ? '制作简单：步骤少、食材易获取。' : '';

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

    // MiniMax 请求格式
    const getRequestBody = (daysToGenerate, mealsPerDay) => {
      const simplePrompt = `规划${daysToGenerate}天${styles}菜单。
目标: ${goals}
忌口: ${restrictions}
不爱吃: ${dislikes}
厨具: ${kitchenTools}
${simpleNote}

格式: {"days":[{"day_index":1,"meals":[{"type":"午餐","dishes":[{"dish_type":"主食","recipe":{"recipe_name":"米饭","time_cost":30,"ingredients":["大米100g","水"],"steps":["淘米","加水","煮熟"]}}]}]}]}
只返回JSON，不要其他文字。`;

      return isMiniMax ? {
        model: modelName,
        messages: [
          { role: 'system', content: '只返回JSON。' },
          { role: 'user', content: simplePrompt }
        ],
        temperature: 0.1,
        max_tokens: 4000,
      } : {
        model: modelName,
        messages: [{ role: 'user', content: simplePrompt }],
        temperature: 0.1,
        max_tokens: 4000,
      };
    };
    
    console.log(`[REQUEST] IP: ${clientIP}, Days: ${days}, Model: ${modelName}, API: ${isMiniMax ? 'MiniMax' : 'DeepSeek'}`);
    
    const startTime = Date.now();
    
    // 发送请求
    let response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify(getRequestBody(days, meals)),
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
    
    let jsonStr = extractJson(content);
    
    // 检查 JSON 是否完整，如果不完整则重试
    let parseResult = parseJsonWithRetry(jsonStr);
    
    // 如果解析失败且 JSON 疑似被截断，尝试用更少的 days 重试
    if (!parseResult.success && looksTruncated(jsonStr)) {
      console.log(`[RETRY] JSON incomplete (ends with: "${jsonStr.slice(-20)}"), retrying with 1 day...`);
      
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey,
        },
        body: JSON.stringify(getRequestBody(1, meals)),
      });
      
      if (response.ok) {
        const data2 = await response.json();
        const content2 = data2.choices?.[0]?.message?.content || 
                        data2.choices?.[0]?.message?.reasoning_content || '';
        jsonStr = extractJson(content2);
        parseResult = parseJsonWithRetry(jsonStr);
      }
    }
    
    // 如果仍然失败，返回错误
    if (!parseResult.success) {
      console.log(`[JSON ERROR] All strategies failed: ${parseResult.error}`);
      console.log(`[JSON RAW] ${jsonStr.substring(0, 500)}...`);
      console.log(`[JSON FULL LENGTH] ${jsonStr.length} chars`);
      
      const errorDetail = `AI返回的数据格式错误。请检查AI是否返回了有效的JSON。\n\n` +
                        `错误: ${parseResult.error}\n` +
                        `前500字符: ${jsonStr.substring(0, 200)}...`;
      return new Response(JSON.stringify({ error: '数据解析失败，请重试', detail: errorDetail }), { status: 500, headers });
    }
    
    console.log(`[SUCCESS] Generated ${days} days plan (strategy ${parseResult.strategy})`);
    
    return new Response(JSON.stringify(parseResult.data), { headers });
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
