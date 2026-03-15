import OpenAI from 'openai';
import { MealPlan, UserProfile, SessionPlan } from '@/types';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com',
});

const SYSTEM_PROMPT = `你是一个专业的饮食规划助手。根据用户档案和计划配置，生成合理的饮食安排。

重要规则：
1. 根据用户的 hard_restrictions（禁忌）和 kitchen_tools（厨具）过滤掉不适合的菜谱
2. 根据用户的 goals（目标）和 style_preferences（风格偏好）优先推荐匹配度高的菜
3. 尽量避免 soft_dislikes（不喜欢的东西）出现
4. 同一道菜在3天内不要重复
5. 每道菜步骤控制在4-7步
6. 时间大致合理即可（10/20/30分钟级）

输出格式：
- 只返回 JSON，不要任何解释
- 使用中文输出菜名和步骤
- 食材用量简单即可`;

function generateMealPlanPrompt(profile: UserProfile, session: SessionPlan): string {
  const mealTypes = session.meals_per_day.join('、');
  
  return `请生成饮食规划：

【用户档案】
- 目标：${profile.goals.join('、')}
- 禁忌：${profile.hard_restrictions.join('、')}
- 厨具：${profile.kitchen_tools.join('、')}

【本次计划】
- 风格偏好：${session.style_preferences.join('、')}
- 不喜欢：${session.soft_dislikes.join('、')}
- 天数：${session.days}天
- 餐数：${mealTypes}

请生成一个 MealPlan JSON 对象，结构如下：
{
  "cycle_id": "cycle_001",
  "profile": {...},
  "session_plan": {...},
  "days": [
    {
      "day_index": 1,
      "meals": [
        {
          "type": "早餐",
          "recipe": {
            "recipe_name": "菜名",
            "tags": ["标签1", "标签2"],
            "time_cost": 20,
            "ingredients": ["食材1 适量", "食材2 100g"],
            "steps": ["步骤1", "步骤2", "步骤3"]
          }
        }
      ]
    }
  ]
}`;
}

export async function generateMealPlan(
  profile: UserProfile,
  session: SessionPlan
): Promise<MealPlan> {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: generateMealPlanPrompt(profile, session) },
    ],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content || '{}';
  
  // 尝试解析 JSON
  try {
    // 尝试找到 JSON 部分（有时模型会输出额外文本）
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as MealPlan;
    }
    return JSON.parse(content) as MealPlan;
  } catch (error) {
    console.error('Failed to parse meal plan:', content);
    throw new Error('Failed to generate meal plan');
  }
}
