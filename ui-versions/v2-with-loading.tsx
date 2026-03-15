'use client';

import { useState, useEffect } from 'react';
import { UserProfile, SessionPlan, MealPlan } from '@/types';

const GOAL_OPTIONS = [
  { value: '健康', label: '健康', emoji: '💪', desc: '均衡饮食, 营养全面' },
  { value: '减脂', label: '减脂', emoji: '🔥', desc: '控制热量, 制造热量缺口' },
  { value: '增肌', label: '增肌', emoji: '🏋️', desc: '高蛋白, 力量训练配合' },
  { value: '快手', label: '快手', emoji: '⚡', desc: '30分钟内搞定, 简单方便' },
  { value: '便当', label: '便当', emoji: '🍱', desc: '适合带饭, 好加热' },
  { value: '替代外卖', label: '替代外卖', emoji: '🍔', desc: '省钱卫生, 比外卖健康' },
  { value: '清淡恢复', label: '清淡恢复', emoji: '🥗', desc: '病后调理, 好消化' },
];

const HARD_RESTRICTION_OPTIONS = [
  { value: '海鲜过敏', label: '海鲜过敏', category: '过敏', desc: '虾/蟹/鱼等' },
  { value: '奶制品过敏', label: '奶制品过敏', category: '过敏', desc: '牛奶/奶酪/酸奶等' },
  { value: '坚果过敏', label: '坚果过敏', category: '过敏', desc: '花生/杏仁/核桃等' },
  { value: '麸质过敏', label: '麸质过敏', category: '过敏', desc: '小麦/大麦/面包等' },
  { value: '不吃牛肉', label: '不吃牛肉', category: '宗教/文化', desc: 'Hindu/穆斯林等' },
  { value: '不吃猪肉', label: '不吃猪肉', category: '宗教/文化', desc: '穆斯林/犹太教等' },
  { value: '不吃鸡肉', label: '不吃鸡肉', category: '宗教/文化', desc: '某些宗教' },
  { value: '不吃酒精', label: '不吃酒精', category: '其他', desc: '含酒精食物' },
  { value: '不吃生冷', label: '不吃生冷', category: '口味', desc: '只吃热的熟的' },
  { value: '不吃辣', label: '不吃辣', category: '口味', desc: '一点辣都不行' },
];

const KITCHEN_TOOL_OPTIONS = [
  { value: '炒锅', label: '炒锅', emoji: '🍳', desc: '爆炒、翻炒' },
  { value: '平底锅', label: '平底锅', emoji: '🍳', desc: '煎、烙、少量炒' },
  { value: '电饭锅', label: '电饭锅', emoji: '🍚', desc: '煮饭、煮粥、炖汤' },
  { value: '空气炸锅', label: '空气炸锅', emoji: '🍟', desc: '无油炸、烤' },
  { value: '微波炉', label: '微波炉', emoji: '📻', desc: '加热、速成' },
  { value: '烤箱', label: '烤箱', emoji: '🥖', desc: '烘焙、烤制' },
  { value: '电压力锅', label: '电压力锅', emoji: '🥘', desc: '炖肉、煮豆' },
  { value: '汤锅', label: '汤锅', emoji: '🍲', desc: '煮汤、煮面' },
  { value: '蒸锅', label: '蒸锅', emoji: '🥟', desc: '清蒸、馒头' },
];

const STYLE_OPTIONS = [
  { value: '家常中餐', label: '家常中餐', emoji: '🥢', desc: '西红柿炒蛋、鱼香肉丝' },
  { value: '地中海', label: '地中海', emoji: '🫒', desc: '橄榄油、清淡海鲜' },
  { value: '轻食', label: '轻食', emoji: '🥗', desc: '低卡沙拉、粗粮' },
  { value: '日式简餐', label: '日式简餐', emoji: '🍣', desc: '味噌汤、米饭' },
  { value: '韩式', label: '韩式', emoji: '🥘', desc: '泡菜、烤肉、拌饭' },
  { value: '东南亚', label: '东南亚', emoji: '🍜', desc: '咖喱、椰浆、香料' },
  { value: '高蛋白风格', label: '高蛋白', emoji: '🥩', desc: '鸡胸肉、鱼虾、豆腐' },
];

const DISLIKE_OPTIONS = [
  { value: '香菜', label: '香菜', emoji: '🌿' },
  { value: '内脏', label: '内脏', emoji: '🫀' },
  { value: '胡萝卜', label: '胡萝卜', emoji: '🥕' },
  { value: '茄子', label: '茄子', emoji: '🍆' },
  { value: '青椒', label: '青椒', emoji: '🫑' },
  { value: '苦瓜', label: '苦瓜', emoji: '🤢' },
  { value: '香菇', label: '香菇', emoji: '🍄' },
  { value: '腐竹', label: '腐竹', emoji: '🧈' },
];

const MEAL_OPTIONS = [
  { value: '早餐', label: '早餐', emoji: '🌅', time: '6:00-9:00', desc: '豆浆油条/牛奶面包' },
  { value: '上午加餐', label: '上午加餐', emoji: '🍎', time: '10:00-11:00', desc: '水果/坚果/酸奶' },
  { value: '午餐', label: '午餐', emoji: '☀️', time: '11:30-13:30', desc: '工作餐，家常菜' },
  { value: '下午加餐', label: '下午加餐', emoji: '🫐', time: '14:30-16:00', desc: '下午饿时垫垫' },
  { value: '晚餐', label: '晚餐', emoji: '🌙', time: '18:00-20:00', desc: '可以稍微丰富点' },
  { value: '宵夜', label: '宵夜', emoji: '🌙', time: '21:00-23:00', desc: '尽量简单' },
];

const BUDGET_OPTIONS = [
  { value: '20-30元/天', label: '20-30元/天', desc: '省钱模式' },
  { value: '30-50元/天', label: '30-50元/天', desc: '普通水平' },
  { value: '50-80元/天', label: '50-80元/天', desc: '稍微宽裕' },
  { value: '80元以上/天', label: '80元以上/天', desc: '不差钱' },
  { value: '无限制', label: '无限制', desc: '随便吃' },
];

const COOKING_TIPS = [
  "🥘 正在切西红柿...", "🍳 锅里倒油烧热...", "🧄 爆香蒜末...", "🥦 准备蔬菜...",
  "🍚 电饭锅煮饭中...", "🥩 腌制鸡胸肉...", "🍲 炖汤ing...", "🧂 撒点盐...",
  "🥢 摆盘中...", "🍳 颠个勺...", "🔥 大火收汁...", "🥗 洗菜中...",
];

const MEAL_EMOJI: Record<string, string> = {
  '早餐': '🌅', '上午加餐': '🍎', '午餐': '☀️', '下午加餐': '🫐', '晚餐': '🌙', '宵夜': '🌙',
};

const DISH_TYPE_COLORS: Record<string, string> = {
  '主菜': 'bg-red-100 text-red-700', '配菜': 'bg-yellow-100 text-yellow-700',
  '蔬菜': 'bg-green-100 text-green-700', '汤': 'bg-blue-100 text-blue-700',
  '主食': 'bg-amber-100 text-amber-700', '小菜': 'bg-purple-100 text-purple-700',
};

function RecipeCard({ dish }: { dish: any }) {
  const { dish_type, recipe } = dish;
  return (
    <div className="bg-amber-50 rounded-lg p-3 mt-2">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 rounded-full text-xs ${DISH_TYPE_COLORS[dish_type] || 'bg-gray-100 text-gray-700'}`}>{dish_type}</span>
        <span className="text-xs text-gray-400">⏱️约{recipe.time_cost}分钟</span>
      </div>
      <div className="mb-2"><span className="text-xs text-gray-400">食材:</span>
        <div className="flex flex-wrap gap-1 mt-1">{recipe.ingredients.map((ing: string, i: number) => (
          <span key={i} className="px-2 py-0.5 bg-white text-gray-600 text-xs rounded">{ing}</span>))}</div>
      </div>
      <div><span className="text-xs text-gray-400">步骤:</span>
        <ol className="mt-1 text-sm text-gray-600 space-y-0.5">{recipe.steps.map((step: string, i: number) => (
          <li key={i}>{i+1}. {step}</li>))}</ol>
      </div>
    </div>
  );
}

function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
            i+1 === current ? 'bg-blue-500 text-white' : i+1 < current ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {i+1 < current ? '✓' : i+1}
          </div>
          <span className={`ml-1.5 text-sm ${i+1 === current ? 'text-blue-500 font-medium' : 'text-gray-400'}`}>{labels[i]}</span>
          {i < total-1 && <div className={`w-8 h-0.5 mx-1 ${i+1 < current ? 'bg-green-400' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

function LoadingState({ tip }: { tip: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="text-4xl mb-4 animate-bounce">🥘</div>
      <div className="text-lg font-medium text-gray-700 mb-2">{tip}</div>
      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse" style={{width: '60%'}} />
      </div>
      <p className="text-sm text-gray-400 mt-2">AI 正在设计中...</p>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({ goals: [], hard_restrictions: [], kitchen_tools: [], custom_restrictions: [] });
  const [session, setSession] = useState<SessionPlan>({ style_preferences: [], soft_dislikes: [], custom_dislikes: [], days: 3, meals_per_day: ['早餐', '午餐', '晚餐'], person_count: 2, budget: '无限制' });
  const [customRestriction, setCustomRestriction] = useState('');
  const [customDislike, setCustomDislike] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTip, setLoadingTip] = useState('');
  const [result, setResult] = useState<MealPlan | null>(null);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (loading) {
      setLoadingTip(COOKING_TIPS[Math.floor(Math.random() * COOKING_TIPS.length)]);
      const interval = setInterval(() => setLoadingTip(COOKING_TIPS[Math.floor(Math.random() * COOKING_TIPS.length)]), 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleSubmit = async () => {
    if (profile.goals.length === 0 || session.style_preferences.length === 0) { setError('请至少选择一个目标和风格偏好'); return; }
    // 敏感操作确认
    if (!showConfirm) { setShowConfirm(true); return; }
    setShowConfirm(false);
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({profile, session}) });
      const data = await res.json();
      if (data.error) setError(data.error); else { setResult(data); setSelectedDay(1); }
    } catch { setError('生成失败，请重试'); } finally { setLoading(false); }
  };

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) => setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  const addCustom = (v: string, arr: string[], setArr: (v: string[]) => void, setInput: (v: string) => void) => { if (v.trim()) { setArr([...arr, v.trim()]); setInput(''); } };
  const canProceed = () => step === 1 ? profile.goals.length > 0 : step === 2 ? session.style_preferences.length > 0 : true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">🍽️ 饮食规划助手</h1>

        {result ? (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">📄 饮食计划</h2>
              <button onClick={() => { setResult(null); setStep(1); }} className="px-4 py-2 bg-gray-100 rounded-lg text-sm">← 重新规划</button>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 text-sm">
              <span>📅 {result.session_plan?.days || session.days}天</span>
              <span className="mx-3">👥 {result.session_plan?.person_count || session.person_count}人</span>
              <span className="mx-3">🍴 {result.session_plan?.meals_per_day?.length || session.meals_per_day.length}餐/天</span>
              <span className="mx-3">🎯 {result.session_plan?.style_preferences?.join('、') || session.style_preferences.join('、')}</span>
            </div>
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {result.days.map(day => (
                <button key={day.day_index} onClick={() => setSelectedDay(day.day_index)}
                  className={`px-4 py-2 rounded-full text-sm ${selectedDay === day.day_index ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>第{day.day_index}天</button>
              ))}
            </div>
            {result.days.filter(d => d.day_index === selectedDay).map(day => (
              <div key={day.day_index} className="space-y-4">
                {day.meals.map((meal, idx) => (
                  <div key={idx} className="border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{MEAL_EMOJI[meal.type] || '🍽️'}</span>
                      <span className="font-semibold text-xl">{meal.type}</span>
                      <span className="text-sm text-gray-400">({meal.dishes.length}道菜)</span>
                    </div>
                    <div className="space-y-3">
                      {meal.dishes.map((dish, didx) => (
                        <div key={didx}>
                          <div className="font-medium">{dish.recipe.recipe_name}</div>
                          <RecipeCard dish={dish} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <StepIndicator current={step} total={3} labels={['档案', '计划', '生成']} />
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600 text-sm mb-2">❌ {error}</p>
                <button onClick={() => { setError(''); handleSubmit(); }} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm">
                  🔄 重试
                </button>
              </div>
            )}
            {loading && <LoadingState tip={loadingTip} />}

            {step === 1 && !loading && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-800">🎯 你的目标是什么？</h3>
                  <p className="text-sm text-gray-500 mb-3">选择最重要的一个或多个目标</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {GOAL_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => toggle(profile.goals, opt.value, v => setProfile({...profile, goals: v}))}
                        className={`p-3 rounded-xl text-left ${profile.goals.includes(opt.value) ? 'bg-blue-500 text-white' : 'bg-gray-50 border'}`}>
                        <div className="text-2xl mb-1">{opt.emoji}</div>
                        <div className="font-medium">{opt.label}</div>
                        <div className={`text-xs ${profile.goals.includes(opt.value) ? 'text-blue-100' : 'text-gray-400'}`}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-800">🚫 有什么忌口？</h3>
                  <p className="text-sm text-gray-500 mb-3">选择你的禁忌，这些食材绝对不会出现</p>
                  <div className="space-y-2 mb-3">
                    <div><span className="text-xs font-medium text-red-500">过敏</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {HARD_RESTRICTION_OPTIONS.filter(o => o.category === '过敏').map(opt => (
                          <button key={opt.value} onClick={() => toggle(profile.hard_restrictions, opt.value, v => setProfile({...profile, hard_restrictions: v}))}
                            className={`px-3 py-1.5 rounded-full text-sm ${profile.hard_restrictions.includes(opt.value) ? 'bg-red-500 text-white' : 'bg-gray-100'}`} title={opt.desc}>{opt.label}</button>
                        ))}
                      </div>
                    </div>
                    <div><span className="text-xs font-medium text-purple-500">宗教/文化</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {HARD_RESTRICTION_OPTIONS.filter(o => o.category === '宗教/文化').map(opt => (
                          <button key={opt.value} onClick={() => toggle(profile.hard_restrictions, opt.value, v => setProfile({...profile, hard_restrictions: v}))}
                            className={`px-3 py-1.5 rounded-full text-sm ${profile.hard_restrictions.includes(opt.value) ? 'bg-red-500 text-white' : 'bg-gray-100'}`} title={opt.desc}>{opt.label}</button>
                        ))}
                      </div>
                    </div>
                    <div><span className="text-xs font-medium text-gray-500">口味/其他</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {HARD_RESTRICTION_OPTIONS.filter(o => o.category === '口味' || o.category === '其他').map(opt => (
                          <button key={opt.value} onClick={() => toggle(profile.hard_restrictions, opt.value, v => setProfile({...profile, hard_restrictions: v}))}
                            className={`px-3 py-1.5 rounded-full text-sm ${profile.hard_restrictions.includes(opt.value) ? 'bg-red-500 text-white' : 'bg-gray-100'}`} title={opt.desc}>{opt.label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input value={customRestriction} onChange={e => setCustomRestriction(e.target.value)} placeholder="添加自定义禁忌..."
                      className="flex-1 px-3 py-2 border rounded-lg text-sm" onKeyDown={e => e.key === 'Enter' && addCustom(customRestriction, profile.custom_restrictions || [], v => setProfile({...profile, custom_restrictions: v}), setCustomRestriction)} />
                    <button onClick={() => addCustom(customRestriction, profile.custom_restrictions || [], v => setProfile({...profile, custom_restrictions: v}), setCustomRestriction)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">添加</button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-800">🍳 你有哪些厨具？</h3>
                  <p className="text-sm text-gray-500 mb-3">根据你拥有的厨具来推荐菜谱</p>
                  <div className="flex flex-wrap gap-2">
                    {KITCHEN_TOOL_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => toggle(profile.kitchen_tools, opt.value, v => setProfile({...profile, kitchen_tools: v}))}
                        className={`px-4 py-2 rounded-full text-sm ${profile.kitchen_tools.includes(opt.value) ? 'bg-green-500 text-white' : 'bg-gray-100'}`} title={opt.desc}>{opt.emoji} {opt.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && !loading && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-800">🍜 想吃什么风格？</h3>
                  <p className="text-sm text-gray-500 mb-3">选择你喜欢的菜系或风格</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {STYLE_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => toggle(session.style_preferences, opt.value, v => setSession({...session, style_preferences: v}))}
                        className={`p-3 rounded-xl text-left ${session.style_preferences.includes(opt.value) ? 'bg-purple-500 text-white' : 'bg-gray-50 border'}`}>
                        <div className="font-medium">{opt.label}</div>
                        <div className={`text-xs ${session.style_preferences.includes(opt.value) ? 'text-purple-100' : 'text-gray-400'}`}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-800">🤔 有什么不爱吃的？</h3>
                  <p className="text-sm text-gray-500 mb-3">这些食材会尽量少出现</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {DISLIKE_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => toggle(session.soft_dislikes, opt.value, v => setSession({...session, soft_dislikes: v}))}
                        className={`px-3 py-1.5 rounded-full text-sm ${session.soft_dislikes.includes(opt.value) ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}>{opt.emoji} {opt.label}</button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={customDislike} onChange={e => setCustomDislike(e.target.value)} placeholder="添加其他不喜欢..."
                      className="flex-1 px-3 py-2 border rounded-lg text-sm" onKeyDown={e => e.key === 'Enter' && addCustom(customDislike, session.custom_dislikes || [], v => setSession({...session, custom_dislikes: v}), setCustomDislike)} />
                    <button onClick={() => addCustom(customDislike, session.custom_dislikes || [], v => setSession({...session, custom_dislikes: v}), setCustomDislike)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">添加</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-800">📅 计划天数</h3>
                    <div className="flex gap-2">{[1,3,5,7].map(d => (
                      <button key={d} onClick={() => setSession({...session, days: d})}
                        className={`flex-1 py-3 rounded-xl ${session.days === d ? 'bg-indigo-500 text-white' : 'bg-gray-100'}`}>{d}天</button>
                    ))}</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-800">👥 用餐人数</h3>
                    <div className="flex gap-2">{[1,2,3,4].map(n => (
                      <button key={n} onClick={() => setSession({...session, person_count: n})}
                        className={`flex-1 py-3 rounded-xl ${session.person_count === n ? 'bg-pink-500 text-white' : 'bg-gray-100'}`}>{n}</button>
                    ))}</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-800">💰 预算</h3>
                    <select value={session.budget} onChange={e => setSession({...session, budget: e.target.value})} className="w-full p-3 border rounded-xl text-sm">
                      {BUDGET_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label} ({opt.desc})</option>))}
                    </select>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-800">🍴 每天吃几餐？</h3>
                  <p className="text-sm text-gray-500 mb-3">选择你每天需要的餐次</p>
                  <div className="flex flex-wrap gap-2">
                    {MEAL_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => toggle(session.meals_per_day, opt.value, v => setSession({...session, meals_per_day: v}))}
                        className={`px-4 py-2 rounded-full text-sm ${session.meals_per_day.includes(opt.value) ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}
                        title={`${opt.time} ${opt.desc}`}>{opt.emoji} {opt.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && !loading && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">📝 确认你的规划</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                  <p><span className="text-gray-500">目标:</span> {profile.goals.join('、')}</p>
                  <p><span className="text-gray-500">忌口:</span> {[...profile.hard_restrictions, ...(profile.custom_restrictions||[])].join('、') || '无'}</p>
                  <p><span className="text-gray-500">风格:</span> {session.style_preferences.join('、')}</p>
                  <p><span className="text-gray-500">计划:</span> {session.days}天 · {session.person_count}人 · {session.meals_per_day.length}餐/天</p>
                </div>
                
                {/* 确认弹窗 */}
                {showConfirm && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                    <p className="font-medium text-yellow-800 mb-3">⚠️ 确认生成饮食规划?</p>
                    <p className="text-sm text-yellow-700 mb-3">将调用 AI 生成 {session.days} 天的饮食规划，每天 {session.meals_per_day.length} 餐</p>
                    <div className="flex gap-2">
                      <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">取消</button>
                      <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium">
                        {loading ? '生成中...' : '确认生成'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  {!showConfirm && <button onClick={handleSubmit} disabled={loading}
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl disabled:opacity-50">
                    {loading ? '🤔 规划中...' : '🚀 开始生成'}
                  </button>}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-4 border-t">
              <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step===1} className="px-6 py-2 bg-gray-100 rounded-lg disabled:opacity-50">← 上一步</button>
              {step < 3 && <button onClick={() => setStep(s => Math.min(3, s+1))} disabled={!canProceed()} className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50">下一步 →</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
