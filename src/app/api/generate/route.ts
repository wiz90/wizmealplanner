import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com',
});

function generateMealPlanPrompt(profile: any, session: any): string {
  const restrictions = [...(profile.hard_restrictions || []), ...(profile.custom_restrictions || [])].join('、') || '无';
  const dislikes = (session.soft_dislikes || []).join('、') || '无';
  const goals = profile.goals?.join('、') || '健康';
  const isSimple = profile.goals?.includes('制作简单');
  
  const simpleNote = isSimple ? '\n【重要】制作简单：选择步骤少（不超过3步）、食材易获取、烹饪难度低的菜谱。' : '';
  
  return `你是专业中餐食谱规划师。只返回JSON。

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

【要求】
1. 每餐必须包含主食+主菜+蔬菜(午餐/晚餐)
2. 严格遵守忌口
3. 食材用中文，步骤清晰
4. 只返回JSON，不要其他文字`;
}

function parseJSON(text: string): any {
  let s = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(s); } catch {}
  s = s.replace(/,\s*([\]}])/g, '$1');
  try { return JSON.parse(s); } catch {}
  const match = s.match(/\{[\s\S]*\}/);
  if (match) {
    let e = match[0].replace(/,\s*([\]}])/g, '$1');
    try { return JSON.parse(e); } catch {}
  }
  throw new Error('Parse failed');
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { profile, session } = await request.json();
    
    console.log(`[Generate] days=${session.days}, style=${session.style_preferences?.join(',')}, people=${session.person_count}`);
    
    if (!session?.style_preferences?.length) {
      return NextResponse.json({ error: '请选择风格' }, { status: 400 });
    }

    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你只返回JSON，不要其他文字。' },
        { role: 'user', content: generateMealPlanPrompt(profile, session) },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || '';
    console.log(`[Generate] Raw response length: ${content.length}`);
    
    const result = parseJSON(content);
    
    if (!result?.days?.length) {
      throw new Error('Invalid response: no days');
    }
    
    const duration = Date.now() - startTime;
    console.log(`[Generate] Success in ${duration}ms`);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[Generate] Failed after ${duration}ms:`, error.message);
    return NextResponse.json({ error: '生成失败: ' + error.message }, { status: 500 });
  }
}
