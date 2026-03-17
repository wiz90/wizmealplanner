export async function onRequestPost({ request, env }) {
  // Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const { profile, session } = await request.json();
    
    const restrictions = [...(profile.hard_restrictions || []), ...(profile.custom_restrictions || [])].join('、') || '无';
    const dislikes = (session.soft_dislikes || []).join('、') || '无';
    const goals = profile.goals?.join('、') || '健康';
    const isSimple = profile.goals?.includes('制作简单');
    
    const simpleNote = isSimple ? '\n【重要】制作简单：选择步骤少（不超过3步）、食材易获取、烹饪难度低的菜谱。' : '';
    
    const prompt = `你是专业中餐食谱规划师。只返回JSON。

【用户档案】
- 目标: ${goals}
- 忌口: ${restrictions} (严格遵守)
- 不爱吃: ${dislikes} (尽量避免)
- 厨具: ${profile.kitchen_tools?.join('、') || '无'}${simpleNote}

【本次计划】
- 天数: ${session.days}天
- 风格: ${session.style_preferences?.join('、') || '家常中餐'}
- 餐次: ${session.meals_per_day?.join('、') || '早餐、午餐、晚餐'}
- 人数: ${session.person_count || 2}人
- 预算: ${session.budget || '无限制'}

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
3. ${session.days}天，每天3餐
4. 步骤要简洁明了，不超过3步
5. 食材要家常易获取
6. 【重要】每个食材必须包含具体用量，如"鸡蛋2个"、"大米100克"、"猪肉200克"
7. 【重要】相同食材必须合并为一条，标注总用量，如"嫩豆腐 1盒"、"鸡蛋 4个"

    const apiKey = env.DEEPSEEK_API_KEY || '';
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API密钥未配置' }), { status: 500, headers });
    }

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `API错误: ${response.status} - ${errorText}` }), {
        status: 500,
        headers,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response - more robust extraction
    let jsonStr = content.trim();
    
    // Handle markdown code blocks
    if (jsonStr.startsWith('```')) {
      const match = jsonStr.match(/```[\s\S]*?({[\s\S]*})[\s\S]*?```/);
      if (match) {
        jsonStr = match[1];
      } else {
        jsonStr = jsonStr.replace(/```json?/g, '').replace(/```/g, '').trim();
      }
    }
    
    // Find JSON object boundaries
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }
    
    const result = JSON.parse(jsonStr);
    
    return new Response(JSON.stringify(result), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: `生成失败: ${error.message}` }), {
      status: 500,
      headers,
    });
  }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}