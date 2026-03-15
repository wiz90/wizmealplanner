'use client';

import { useState, useEffect } from 'react';
import { UserProfile, SessionPlan, MealPlan } from '@/types';

// 选项配置
const GOAL_OPTIONS = [
  { value: '健康', label: '健康', emoji: '💪', desc: '均衡饮食, 营养全面' },
  { value: '减脂', label: '减脂', emoji: '🔥', desc: '控制热量, 制造热量缺口' },
  { value: '增肌', label: '增肌', emoji: '🏋️', desc: '高蛋白, 力量训练配合' },
  { value: '快手', label: '快手', emoji: '⚡', desc: '30分钟内搞定, 简单方便' },
  { value: '便当', label: '便当', emoji: '🍱', desc: '适合带饭, 好加热' },
  { value: '替代外卖', label: '替代外卖', emoji: '🍔', desc: '省钱卫生, 比外卖健康' },
  { value: '清淡恢复', label: '清淡恢复', emoji: '🥗', desc: '病后调理, 好消化' },
];

const RESTRICTION_OPTIONS = [
  { value: '海鲜过敏', label: '海鲜过敏', desc: '虾/蟹/鱼等' },
  { value: '奶制品过敏', label: '奶制品过敏', desc: '牛奶/奶酪等' },
  { value: '坚果过敏', label: '坚果过敏', desc: '花生/杏仁等' },
  { value: '麸质过敏', label: '麸质过敏', desc: '小麦/面包等' },
  { value: '不吃牛肉', label: '不吃牛肉', desc: 'Hindu/穆斯林等' },
  { value: '不吃猪肉', label: '不吃猪肉', desc: '穆斯林/犹太教等' },
  { value: '不吃鸡肉', label: '不吃鸡肉', desc: '某些宗教' },
  { value: '不吃酒精', label: '不吃酒精', desc: '含酒精食物' },
  { value: '不吃生冷', label: '不吃生冷', desc: '只吃热的熟的' },
  { value: '不吃辣', label: '不吃辣', desc: '一点辣都不行' },
];

const DISLIKE_OPTIONS = [
  { value: '香菜', emoji: '🌿' }, { value: '内脏', emoji: '🫀' }, { value: '胡萝卜', emoji: '🥕' },
  { value: '茄子', emoji: '🍆' }, { value: '青椒', emoji: '🫑' }, { value: '苦瓜', emoji: '🤢' },
  { value: '香菇', emoji: '🍄' }, { value: '腐竹', emoji: '🧈' },
];

const KITCHEN_TOOLS = [
  { value: '炒锅', emoji: '🍳' }, { value: '平底锅', emoji: '🍳' }, { value: '电饭锅', emoji: '🍚' },
  { value: '空气炸锅', emoji: '🍟' }, { value: '微波炉', emoji: '📻' }, { value: '烤箱', emoji: '🥖' },
  { value: '电压力锅', emoji: '🥘' }, { value: '汤锅', emoji: '🍲' }, { value: '蒸锅', emoji: '🥟' },
];

const STYLE_OPTIONS = [
  { value: '家常中餐', emoji: '🥢', desc: '西红柿炒蛋、鱼香肉丝' },
  { value: '地中海', emoji: '🫒', desc: '橄榄油、清淡海鲜' },
  { value: '轻食', emoji: '🥗', desc: '低卡沙拉、粗粮' },
  { value: '日式简餐', emoji: '🍣', desc: '味噌汤、米饭' },
  { value: '韩式', emoji: '🥘', desc: '泡菜、烤肉、拌饭' },
  { value: '东南亚', emoji: '🍜', desc: '咖喱、椰浆、香料' },
  { value: '高蛋白', emoji: '🥩', desc: '鸡胸肉、鱼虾、豆腐' },
];

const MEAL_OPTIONS = [
  { value: '早餐', emoji: '🌅', desc: '6:00-9:00' },
  { value: '午餐', emoji: '☀️', desc: '11:30-13:30' },
  { value: '晚餐', emoji: '🌙', desc: '18:00-20:00' },
];

const BUDGET_OPTIONS = [
  { value: '20-30元/天', label: '20-30元' }, { value: '30-50元/天', label: '30-50元' },
  { value: '50-80元/天', label: '50-80元' }, { value: '无限制', label: '随便' },
];

const COOKING_TIPS = [
  "🥘 切西红柿...", "🍳 倒油烧热...", "🧄 爆香蒜末...", "🥦 准备蔬菜...",
  "🍚 煮饭中...", "🥩 腌鸡胸...", "🍲 炖汤...", "🧂 撒盐...",
  "🥢 摆盘...", "🍳 颠勺...", "🔥 收汁...", "🤤 想想就好吃...",
  "😋 流口水...", "👨‍🍳 大厨上身...", "✨ 灵魂调料...",
];

// 加载动画
function LoadingState({ tip }: { tip: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-5xl mb-4 animate-bounce">🥘</div>
      <div className="text-lg font-medium text-gray-800 mb-2">{tip}</div>
      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse" style={{width: '60%'}} />
      </div>
    </div>
  );
}

export default function Home() {
  // 页面: 0=欢迎页, 1=档案, 2=计划, 3=生成结果
  const [page, setPage] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({ goals: [], hard_restrictions: [], kitchen_tools: [], custom_restrictions: [] });
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [customDislike, setCustomDislike] = useState('');
  const [session, setSession] = useState<SessionPlan>({ style_preferences: [], soft_dislikes: [], days: 3, meals_per_day: ['早餐', '午餐', '晚餐'], person_count: 2, budget: '无限制' });
  const [loading, setLoading] = useState(false);
  const [loadingTip, setLoadingTip] = useState('');
  const [result, setResult] = useState<MealPlan | null>(null);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [hasProfile, setHasProfile] = useState(false);

  // 加载
  useEffect(() => {
    const saved = localStorage.getItem('meal_profile');
    if (saved) {
      const p = JSON.parse(saved);
      setProfile(p);
      setHasProfile(true);
    }
    // 加载不爱吃
    const savedDislikes = localStorage.getItem('meal_dislikes');
    if (savedDislikes) setDislikes(JSON.parse(savedDislikes));
  }, []);

  // 加载动画
  useEffect(() => {
    if (loading) {
      setLoadingTip(COOKING_TIPS[Math.floor(Math.random() * COOKING_TIPS.length)]);
      const t = setInterval(() => setLoadingTip(COOKING_TIPS[Math.floor(Math.random() * COOKING_TIPS.length)]), 2000);
      return () => clearInterval(t);
    }
  }, [loading]);

  // 保存档案
  const saveProfile = () => {
    localStorage.setItem('meal_profile', JSON.stringify(profile));
    localStorage.setItem('meal_dislikes', JSON.stringify(dislikes));
    setHasProfile(true);
    setPage(2);
  };

  const handleSubmit = async () => {
    if (profile.goals.length === 0 || session.style_preferences.length === 0) { setError('请选择目标和风格'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ profile, session: {...session, soft_dislikes: dislikes} }) });
      const data = await res.json();
      if (data.error) setError(data.error); else { setResult(data); setPage(3); }
    } catch { setError('生成失败'); } finally { setLoading(false); }
  };

  const toggle = (arr: string[], v: string, setArr: (arr: string[]) => void) => setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  // 0. 欢迎页
  if (page === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">🍽️ 饮食规划助手</h1>
          <p className="text-center text-gray-600 mb-8">智能生成你的专属食谱</p>
          <div className="space-y-4">
            {hasProfile ? (
              <button onClick={() => setPage(2)} className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl">
                🎯 使用上次档案继续
              </button>
            ) : (
              <button onClick={() => setPage(1)} className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl">
                ✨ 开始新的规划
              </button>
            )}
            <button onClick={() => setPage(1)} className="w-full py-4 bg-white text-gray-700 rounded-2xl font-semibold border-2 border-gray-200 hover:border-gray-300">
              📝 {hasProfile ? '修改档案' : '填写档案'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 1. 档案页
  if (page === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">📝 档案设置</h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🎯 目标</h3>
              <div className="grid grid-cols-4 gap-2">
                {GOAL_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => toggle(profile.goals, o.value, v => setProfile({...profile, goals: v}))}
                    className={`p-2 rounded-xl text-center text-sm ${profile.goals.includes(o.value) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    <div className="text-xl">{o.emoji}</div>
                    <div>{o.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🚫 忌口 (绝对不能吃)</h3>
              <div className="flex flex-wrap gap-2">
                {RESTRICTION_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => toggle(profile.hard_restrictions, o.value, v => setProfile({...profile, hard_restrictions: v}))}
                    className={`px-3 py-1.5 rounded-full text-sm ${profile.hard_restrictions.includes(o.value) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🤔 不爱吃 (尽量避免)</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {DISLIKE_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => toggle(dislikes, o.value, setDislikes)}
                    className={`px-3 py-1.5 rounded-full text-sm ${dislikes.includes(o.value) ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {o.emoji} {o.value}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={customDislike} onChange={e => setCustomDislike(e.target.value)} placeholder="添加不爱吃的..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm" onKeyDown={e => e.key === 'Enter' && customDislike && (setDislikes([...dislikes, customDislike]), setCustomDislike(''))} />
                <button onClick={() => customDislike && (setDislikes([...dislikes, customDislike]), setCustomDislike(''))} className="px-4 bg-gray-200 rounded-lg text-sm">添加</button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🍳 厨具</h3>
              <div className="flex flex-wrap gap-2">
                {KITCHEN_TOOLS.map(o => (
                  <button key={o.value} onClick={() => toggle(profile.kitchen_tools, o.value, v => setProfile({...profile, kitchen_tools: v}))}
                    className={`px-3 py-1.5 rounded-full text-sm ${profile.kitchen_tools.includes(o.value) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {o.emoji} {o.value}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={saveProfile} disabled={profile.goals.length === 0}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold disabled:opacity-50">
              保存档案 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. 计划页
  if (page === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">📋 本次计划</h1>
          
          {loading ? <LoadingState tip={loadingTip} /> : (
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>}

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">🍜 风格</h3>
                <div className="grid grid-cols-3 gap-2">
                  {STYLE_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => toggle(session.style_preferences, o.value, v => setSession({...session, style_preferences: v}))}
                      className={`p-3 rounded-xl text-center text-sm ${session.style_preferences.includes(o.value) ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                      <div className="text-xl">{o.emoji}</div>
                      <div>{o.value}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">📅 天数</h3>
                  <div className="flex gap-1">{[1,3,5,7].map(d => (
                    <button key={d} onClick={() => setSession({...session, days: d})}
                      className={`flex-1 py-2 rounded-lg text-sm ${session.days === d ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{d}</button>
                  ))}</div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">👥 人数</h3>
                  <div className="flex gap-1">{[1,2,3,4].map(n => (
                    <button key={n} onClick={() => setSession({...session, person_count: n})}
                      className={`flex-1 py-2 rounded-lg text-sm ${session.person_count === n ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{n}</button>
                  ))}</div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">💰 预算</h3>
                  <select value={session.budget} onChange={e => setSession({...session, budget: e.target.value})} className="w-full p-2 border rounded-lg text-sm">
                    {BUDGET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">🍴 餐次</h3>
                <div className="flex gap-2">
                  {MEAL_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => toggle(session.meals_per_day, o.value, v => setSession({...session, meals_per_day: v}))}
                      className={`flex-1 py-2 rounded-lg text-sm ${session.meals_per_day.includes(o.value) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                      {o.emoji} {o.value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setPage(0)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl">← 返回</button>
                <button onClick={handleSubmit} disabled={profile.goals.length === 0 || session.style_preferences.length === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50">
                  🚀 生成规划
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. 结果页
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">📋 饮食计划</h2>
            <button onClick={() => setPage(0)} className="text-blue-500 text-sm">← 新规划</button>
          </div>
          
          <div className="flex gap-2 mb-4">{result?.days.map(d => (
            <button key={d.day_index} onClick={() => setSelectedDay(d.day_index)}
              className={`px-4 py-2 rounded-full text-sm ${selectedDay === d.day_index ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
              第{d.day_index}天
            </button>
          ))}</div>

          {result?.days.filter(d => d.day_index === selectedDay).map(d => d.meals.map((m, i) => (
            <div key={i} className="mb-4 p-4 border rounded-xl">
              <div className="font-semibold text-gray-800 mb-2">{m.type}</div>
              {m.dishes.map((dish, j) => (
                <div key={j} className="mb-2">
                  <div className="font-medium text-gray-700">{dish.recipe.recipe_name}</div>
                  <div className="text-xs text-gray-500 mt-1">⏱️{dish.recipe.time_cost}分钟</div>
                </div>
              ))}
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}
