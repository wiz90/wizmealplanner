'use client';

import { useState } from 'react';
import { UserProfile, SessionPlan, MealPlan } from '@/types';

// ============ 常量定义 ============

// 目标选项
const GOAL_OPTIONS = [
  { value: '健康', label: '健康', emoji: '💪', desc: '均衡饮食' },
  { value: '减脂', label: '减脂', emoji: '🔥', desc: '低热量' },
  { value: '增肌', label: '增肌', emoji: '🏋️', desc: '高蛋白' },
  { value: '快手', label: '快手', emoji: '⚡', desc: '30分钟内' },
  { value: '便当', label: '便当', emoji: '🍱', desc: '带饭上班' },
  { value: '替代外卖', label: '替代外卖', emoji: '🍔', desc: '省时省钱' },
  { value: '清淡恢复', label: '清淡恢复', emoji: '🥗', desc: '病后调理' },
];

// 禁忌选项
const HARD_RESTRICTION_OPTIONS = [
  { value: '海鲜过敏', label: '海鲜过敏', category: '过敏' },
  { value: '奶制品过敏', label: '奶制品过敏', category: '过敏' },
  { value: '坚果过敏', label: '坚果过敏', category: '过敏' },
  { value: '麸质过敏', label: '麸质过敏', category: '过敏' },
  { value: '不吃牛肉', label: '不吃牛肉', category: '宗教/文化' },
  { value: '不吃猪肉', label: '不吃猪肉', category: '宗教/文化' },
  { value: '不吃鸡肉', label: '不吃鸡肉', category: '宗教/文化' },
  { value: '不吃酒精', label: '不吃酒精', category: '其他' },
  { value: '不吃生冷', label: '不吃生冷', category: '口味' },
];

// 厨具选项
const KITCHEN_TOOL_OPTIONS = [
  { value: '炒锅', label: '炒锅', emoji: '🍳' },
  { value: '平底锅', label: '平底锅', emoji: '🍳' },
  { value: '电饭锅', label: '电饭锅', emoji: '🍚' },
  { value: '空气炸锅', label: '空气炸锅', emoji: '🍟' },
  { value: '微波炉', label: '微波炉', emoji: '📻' },
  { value: '烤箱', label: '烤箱', emoji: '🥖' },
  { value: '电压力锅', label: '电压力锅', emoji: '🥘' },
  { value: '汤锅', label: '汤锅', emoji: '🍲' },
  { value: '蒸锅', label: '蒸锅', emoji: '🥟' },
];

// 风格偏好
const STYLE_OPTIONS = [
  { value: '家常中餐', label: '家常中餐', emoji: '🥢', desc: '西红柿炒蛋、鱼香肉丝' },
  { value: '地中海', label: '地中海', emoji: '🫒', desc: '橄榄油、清淡海鲜' },
  { value: '轻食', label: '轻食', emoji: '沙拉', desc: '低卡沙拉、粗粮' },
  { value: '日式简餐', label: '日式简餐', emoji: '🍣', desc: '味噌汤、米饭、小菜' },
  { value: '韩式', label: '韩式', emoji: '🥘', desc: '泡菜、烤肉、拌饭' },
  { value: '东南亚', label: '东南亚', emoji: '🍜', desc: '咖喱、椰浆、香料' },
  { value: '高蛋白风格', label: '高蛋白', emoji: '🥩', desc: '鸡胸肉、鱼、豆腐' },
];

// 不喜欢选项
const DISLIKE_OPTIONS = [
  { value: '香菜', label: '香菜' },
  { value: '内脏', label: '内脏' },
  { value: '胡萝卜', label: '胡萝卜' },
  { value: '茄子', label: '茄子' },
  { value: '青椒', label: '青椒' },
  { value: '苦瓜', label: '苦瓜' },
  { value: '香菇', label: '香菇' },
  { value: '腐竹', label: '腐竹' },
];

// 餐次选项
const MEAL_OPTIONS = [
  { value: '早餐', label: '早餐', emoji: '🌅', time: '6:00-9:00' },
  { value: '上午加餐', label: '上午加餐', emoji: '🍎', time: '10:00-11:00' },
  { value: '午餐', label: '午餐', emoji: '☀️', time: '11:30-13:30' },
  { value: '下午加餐', label: '下午加餐', emoji: '🫐', time: '14:30-16:00' },
  { value: '晚餐', label: '晚餐', emoji: '🌙', time: '18:00-20:00' },
  { value: '宵夜', label: '宵夜', emoji: '🌙', time: '21:00-23:00' },
];

// 预算选项
const BUDGET_OPTIONS = [
  { value: '20-30元/天', label: '20-30元/天' },
  { value: '30-50元/天', label: '30-50元/天' },
  { value: '50-80元/天', label: '50-80元/天' },
  { value: '80元以上/天', label: '80元以上/天' },
  { value: '无限制', label: '无限制' },
];

// ============ 组件 ============

const MEAL_EMOJI: Record<string, string> = {
  '早餐': '🌅', '上午加餐': '🍎', '午餐': '☀️',
  '下午加餐': '🫐', '晚餐': '🌙', '宵夜': '🌙',
};

const DISH_TYPE_COLORS: Record<string, string> = {
  '主菜': 'bg-red-100 text-red-700 border-red-200',
  '配菜': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  '蔬菜': 'bg-green-100 text-green-700 border-green-200',
  '汤': 'bg-blue-100 text-blue-700 border-blue-200',
  '主食': 'bg-amber-100 text-amber-700 border-amber-200',
  '小菜': 'bg-purple-100 text-purple-700 border-purple-200',
  '蛋白质': 'bg-pink-100 text-pink-700 border-pink-200',
};

function RecipeCard({ dish }: { dish: { dish_type: string; recipe: MealPlan['days'][0]['meals'][0]['dishes'][0]['recipe'] } }) {
  const { dish_type, recipe } = dish;
  
  return (
    <div className="bg-amber-50 rounded-lg p-3 mt-2 border border-amber-100">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DISH_TYPE_COLORS[dish_type] || 'bg-gray-100 text-gray-700'}`}>
          {dish_type}
        </span>
        <span className="text-xs text-gray-400">⏱️ 约{recipe.time_cost}分钟</span>
      </div>
      
      <div className="mb-2">
        <span className="text-xs text-gray-400">食材:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {recipe.ingredients.map((ing, i) => (
            <span key={i} className="px-2 py-0.5 bg-white text-gray-600 text-xs rounded border border-gray-200">
              {ing}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <span className="text-xs text-gray-400">步骤:</span>
        <ol className="mt-1 text-sm text-gray-600 space-y-0.5">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-orange-400 font-medium min-w-[16px]">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            i + 1 === current 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
              : i + 1 < current 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : 'bg-gray-200 text-gray-500'
          }`}>
            {i + 1 < current ? '✓' : i + 1}
          </div>
          <span className={`ml-1.5 text-sm ${i + 1 === current ? 'text-blue-500 font-medium' : 'text-gray-400'}`}>
            {labels[i]}
          </span>
          {i < total - 1 && <div className={`w-8 h-0.5 mx-1 ${i + 1 < current ? 'bg-green-400' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(1);
  
  const [profile, setProfile] = useState<UserProfile>({
    goals: [],
    hard_restrictions: [],
    kitchen_tools: [],
    custom_restrictions: [],
  });

  const [session, setSession] = useState<SessionPlan>({
    style_preferences: [],
    soft_dislikes: [],
    custom_dislikes: [],
    days: 3,
    meals_per_day: ['早餐', '午餐', '晚餐'],
    person_count: 2,
    budget: '无限制',
  });

  const [customRestriction, setCustomRestriction] = useState('');
  const [customDislike, setCustomDislike] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealPlan | null>(null);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);

  const handleSubmit = async () => {
    if (profile.goals.length === 0 || session.style_preferences.length === 0) {
      setError('请至少选择一个目标和风格偏好');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, session }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        setSelectedDay(1);
      }
    } catch (err) {
      setError('生成失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter(i => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const addCustom = (value: string, arr: string[], setter: (v: string[]) => void, inputSetter: (v: string) => void) => {
    if (value.trim()) {
      setter([...arr, value.trim()]);
      inputSetter('');
    }
  };

  const canProceed = () => {
    if (step === 1) return profile.goals.length > 0;
    if (step === 2) return session.style_preferences.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">🍽️ 饮食规划助手</h1>

        {result ? (
          // ============ 结果展示 ============
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">📄 饮食计划</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => { setResult(null); setStep(1); }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
                >
                  ← 重新规划
                </button>
              </div>
            </div>

            {/* 计划摘要 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
              <div className="flex flex-wrap gap-4 text-sm">
                <span>📅 {result.session_plan?.days || session.days}天</span>
                <span>👥 {result.session_plan?.person_count || session.person_count}人</span>
                <span>🍴 {result.session_plan?.meals_per_day?.length || session.meals_per_day.length}餐/天</span>
                <span>🎯 {result.session_plan?.style_preferences?.join('、') || session.style_preferences.join('、')}</span>
              </div>
            </div>
            
            {/* Day Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {result.days.map(day => (
                <button
                  key={day.day_index}
                  onClick={() => setSelectedDay(day.day_index)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedDay === day.day_index
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  第 {day.day_index} 天
                </button>
              ))}
            </div>

            {/* Meals */}
            {result.days
              .filter(d => d.day_index === selectedDay)
              .map(day => (
                <div key={day.day_index} className="space-y-4">
                  {day.meals.map((meal, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{MEAL_EMOJI[meal.type] || '🍽️'}</span>
                        <h3 className="font-semibold text-xl text-gray-800">{meal.type}</h3>
                        <span className="text-sm text-gray-400">({meal.dishes.length}道菜)</span>
                      </div>
                      
                      <div className="space-y-3">
                        {meal.dishes.map((dish, didx) => (
                          <div key={didx}>
                            <h4 className="font-medium text-gray-900">{dish.recipe.recipe_name}</h4>
                            <RecipeCard dish={dish as any} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        ) : (
          // ============ 填写流程 ============
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <StepIndicator current={step} total={3} labels={['档案', '计划', '生成']} />

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Step 1: 个人档案 */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-800">🎯 你的目标是什么？</h3>
                  <p className="text-sm text-gray-500 mb-3">选择最重要的一个或多个目标</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {GOAL_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggle(profile.goals, opt.value, v => setProfile({ ...profile, goals: v }))}
                        className={`p-3 rounded-xl text-left transition-all ${
                          profile.goals.includes(opt.value)
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <div className="text-2xl mb-1">{opt.emoji}</div>
                        <div className="font-medium">{opt.label}</div>
                        <div className={`text-xs ${profile.goals.includes(opt.value) ? 'text-blue-100' : 'text-gray-400'}`}>
                          {opt.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-800">🚫 有什么忌口？</h3>
                  <p className="text-sm text-gray-500 mb-3">选择你的禁忌，这些食材绝对不会出现</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {HARD_RESTRICTION_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggle(profile.hard_restrictions, opt.value, v => setProfile({ ...profile, hard_restrictions: v }))}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          profile.hard_restrictions.includes(opt.value)
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customRestriction}
                      onChange={e => setCustomRestriction(e.target.value)}
                      placeholder="添加自定义禁忌..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      onKeyDown={e => e.key === 'Enter' && addCustom(customRestriction, profile.custom_restrictions || [], v => setProfile({ ...profile, custom_restrictions: v }), setCustomRestriction)}
                    />
                    <button
                      onClick={() => addCustom(customRestriction, profile.custom_restrictions || [], v => setProfile({ ...profile, custom_restrictions: v }), setCustomRestriction)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                    >
                      添加
                    </button>
                  </div>
                  {profile.custom_restrictions?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.custom_restrictions.map((item, i) => (
                        <span key={i} className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full flex items-center gap-1">
                          {item}
                          <button onClick={() => {
                            const newList = profile.custom_restrictions?.filter((_, idx) => idx !== i);
                            setProfile({ ...profile, custom_restrictions: newList });
                          }}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-800">🍳 你有哪些厨具？</h3>
                  <p className="text-sm text-gray-500 mb-3">根据你拥有的厨具来推荐菜谱</p>
                  <div className="flex flex-wrap gap-2">
                    {KITCHEN_TOOL_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggle(profile.kitchen_tools, opt.value, v => setProfile({ ...profile, kitchen_tools: v }))}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          profile.kitchen_tools.includes(opt.value)
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {opt.emoji} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: 本次计划 */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-800">🍜 想吃什么风格？</h3>
                  <p className="text-sm text-gray-500 mb-3">选择你喜欢的菜系或风格</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {STYLE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggle(session.style_preferences, opt.value, v => setSession({ ...session, style_preferences: v }))}
                        className={`p-3 rounded-xl text-left transition-all ${
                          session.style_preferences.includes(opt.value)
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <div className="font-medium">{opt.label}</div>
                        <div className={`text-xs ${session.style_preferences.includes(opt.value) ? 'text-purple-100' : 'text-gray-400'}`}>
                          {opt.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-800">🤔 有什么不爱吃的？</h3>
                  <p className="text-sm text-gray-500 mb-3">这些食材会尽量少出现</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {DISLIKE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggle(session.soft_dislikes, opt.value, v => setSession({ ...session, soft_dislikes: v }))}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          session.soft_dislikes.includes(opt.value)
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customDislike}
                      onChange={e => setCustomDislike(e.target.value)}
                      placeholder="添加其他不喜欢..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      onKeyDown={e => e.key === 'Enter' && addCustom(customDislike, session.custom_dislikes || [], v => setSession({ ...session, custom_dislikes: v }), setCustomDislike)}
                    />
                    <button
                      onClick={() => addCustom(customDislike, session.custom_dislikes || [], v => setSession({ ...session, custom_dislikes: v }), setCustomDislike)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                    >
                      添加
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-800">📅 计划天数</h3>
                    <p className="text-sm text-gray-500 mb-3">要规划几天的饮食？</p>
                    <div className="flex gap-2">
                      {[1, 3, 5, 7].map(d => (
                        <button
                          key={d}
                          onClick={() => setSession({ ...session, days: d })}
                          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                            session.days === d
                              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {d}天
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-800">👥 用餐人数</h3>
                    <p className="text-sm text-gray-500 mb-3">跟谁一起吃？</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map(n => (
                        <button
                          key={n}
                          onClick={() => setSession({ ...session, person_count: n })}
                          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                            session.person_count === n
                              ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-800">💰 预算</h3>
                    <p className="text-sm text-gray-500 mb-3">每天花费</p>
                    <select
                      value={session.budget}
                      onChange={e => setSession({ ...session, budget: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm"
                    >
                      {BUDGET_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-800">🍴 每天吃几餐？</h3>
                  <p className="text-sm text-gray-500 mb-3">选择你每天需要的餐次</p>
                  <div className="flex flex-wrap gap-2">
                    {MEAL_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggle(session.meals_per_day, opt.value, v => setSession({ ...session, meals_per_day: v }))}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          session.meals_per_day.includes(opt.value)
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {opt.emoji} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: 确认生成 */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">📝 确认你的规划</h3>
                
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">目标:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.goals.map(g => <span key={g} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{g}</span>)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">忌口:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {[...profile.hard_restrictions, ...(profile.custom_restrictions || [])].length === 0 
                        ? <span className="text-xs text-gray-400">无</span>
                        : [...profile.hard_restrictions, ...(profile.custom_restrictions || [])].map(r => (
                            <span key={r} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">{r}</span>
                          ))
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">风格:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {session.style_preferences.map(s => <span key={s} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">{s}</span>)}
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span>📅 {session.days}天</span>
                    <span>👥 {session.person_count}人</span>
                    <span>🍴 {session.meals_per_day.length}餐/天</span>
                    <span>💰 {session.budget}</span>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl disabled:opacity-50 transition-all hover:scale-105"
                  >
                    {loading ? '🤔 规划中...' : '🚀 开始生成'}
                  </button>
                </div>
              </div>
            )}

            {/* 导航按钮 */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← 上一步
              </button>
              
              {step < 3 ? (
                <button
                  onClick={() => setStep(s => Math.min(3, s + 1))}
                  disabled={!canProceed()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一步 →
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
