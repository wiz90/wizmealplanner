export async function onRequestPost({ request, env }) {
  // 允许的域名列表
  const allowedOrigins = [
    'https://wizmealplanner.pages.dev',
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  
  const origin = request.headers.get('Origin') || '';
  const isOriginAllowed = allowedOrigins.includes(origin) || origin.endsWith('.cloudflareapps.dev');
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  // 只有允许的域名才返回 CORS 头
  if (isOriginAllowed) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // 拒绝非法来源
  if (!isOriginAllowed) {
    return new Response(JSON.stringify({ error: '不允许的请求来源' }), { status: 403, headers });
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
    const isSimple = goals.includes('制作简单');
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
    const modelName = env.CUSTOM_MODEL || 'deepseek-chat';
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API密钥未配置' }), { status: 500, headers });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errMsg = 'API错误: ' + response.status;
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 500,
        headers,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    let jsonStr = content.trim();
    
    if (jsonStr.startsWith('```')) {
      const match = jsonStr.match(/```[\s\S]*?({[\s\S]*})[\s\S]*?```/);
      if (match) {
        jsonStr = match[1];
      } else {
        jsonStr = jsonStr.replace(/```json?/g, '').replace(/```/g, '').trim();
      }
    }
    
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }
    
    const result = JSON.parse(jsonStr);
    
    return new Response(JSON.stringify(result), { headers });
  } catch (error) {
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