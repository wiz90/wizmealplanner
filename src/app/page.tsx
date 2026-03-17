'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 配置选项
const GOAL_OPTIONS = [
  { value: '减脂', emoji: '🔥' }, { value: '增肌', emoji: '🏋️' },
  { value: '制作简单', emoji: '⚡' }, { value: '便当', emoji: '🍱' }, { value: '替代外卖', emoji: '🍔' }, { value: '清淡', emoji: '🥗' },
];
const RESTRICTION_OPTIONS = ['海鲜', '牛肉', '猪肉', '鸡肉', '奶制品', '坚果', '麸质', '酒精', '生冷', '辣'];
const DISLIKE_OPTIONS = [{ value: '香菜', emoji: '🌿' }, { value: '内脏', emoji: '🫀' }, { value: '胡萝卜', emoji: '🥕' }, { value: '茄子', emoji: '🍆' }, { value: '青椒', emoji: '🫑' }, { value: '苦瓜', emoji: '🤢' }, { value: '香菇', emoji: '🍄' }, { value: '腐竹', emoji: '🧈' }];
const KITCHEN_OPTIONS = [{ value: '炒锅', emoji: '🍳' }, { value: '平底锅', emoji: '🍳' }, { value: '电饭锅', emoji: '🍚' }, { value: '空气炸锅', emoji: '🍟' }, { value: '微波炉', emoji: '📻' }, { value: '烤箱', emoji: '🥖' }, { value: '电压力锅', emoji: '🥘' }, { value: '汤锅', emoji: '🍲' }, { value: '蒸锅', emoji: '🥟' }];
const STYLE_OPTIONS = [
  { value: '家常中餐', emoji: '🥢' }, { value: '地中海', emoji: '🫒' }, { value: '轻食', emoji: '🥗' }, 
  { value: '日式', emoji: '🍣' }, { value: '韩式', emoji: '🥘' }, { value: '东南亚', emoji: '🍜' }, 
  { value: '高蛋白', emoji: '🥩' }, { value: '川味', emoji: '🌶️' }, { value: '粤菜', emoji: '🦐' },
  { value: '素食', emoji: '🥬' }, { value: '西式', emoji: '🍝' }, { value: '创意菜', emoji: '✨' },
  { value: '沙拉轻食', emoji: '🥗' },
];
const MEAL_OPTIONS = [{ value: '早餐', emoji: '🌅' }, { value: '上午茶', emoji: '☕' }, { value: '午餐', emoji: '☀️' }, { value: '下午茶', emoji: '🍰' }, { value: '晚餐', emoji: '🌙' }];
const DISLIKE_LEVELS = [
  { value: '一点不吃', color: 'bg-red-500' },
  { value: '少吃', color: 'bg-yellow-500' },
  { value: '适量', color: 'bg-green-500' },
];

// 相声报菜名顺序
const MENU_TIPS = [
  "蒸熊掌", "蒸鹿尾", "烧花鸭", "烧雏鸡", "烧子鹅",
  "卤鸭", "卤鸡", "卤蛋", "卤肉", "卤豆腐",
  "酱鸡", "酱鸭", "酱肘子", "酱排骨", "酱牛肉",
  "熏鸡", "熏鸭", "熏肉", "熏鱼", "熏豆腐",
  "烤鸡", "烤鸭", "烤鱼", "烤肉", "烤虾",
  "炒肉片", "炒肉丝", "炒肉丁", "炒鸡蛋", "炒鸭蛋",
  "溜肉片", "溜肉丝", "溜鸡片", "溜鸭片", "溜鱼片",
];

// 报菜名 Loading - 顺序滚动
function LoadingState({ tipIndex }: { tipIndex: number }) {
  const tip = MENU_TIPS[tipIndex % MENU_TIPS.length];
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <img src="/images/caiming.png" alt="蔡明" className="w-32 h-32 mb-4 rounded-full object-cover" />
      <div className="text-3xl font-bold text-gray-900 mb-4 animate-pulse">{tip}</div>
      {/* 进度条 */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 animate-pulse" style={{ width: '100%', animationDuration: '1s' }} />
        </div>
        <div className="text-center text-xs text-gray-500 mt-2">正在准备菜品...</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [page, setPage] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [customRestrictions, setCustomRestrictions] = useState<string[]>([]);
  const [newCustomRestriction, setNewCustomRestriction] = useState('');
  const [kitchen, setKitchen] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<{item: string, level: string}[]>([]);
  const [newDislike, setNewDislike] = useState('');
  const [newDislikeLevel, setNewDislikeLevel] = useState('一点不吃');
  const [style, setStyle] = useState<string[]>([]);
  const [days, setDays] = useState(3);
  const [people, setPeople] = useState(2);
  const [meals, setMeals] = useState<string[]>(['早餐', '午餐', '晚餐']);
  const [budget, setBudget] = useState('无限制');
  const [loading, setLoading] = useState(false);
  const [menuIndex, setMenuIndex] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    const p = localStorage.getItem('meal_profile');
    if (p) {
      const d = JSON.parse(p);
      setGoals(d.goals || []);
      setRestrictions(d.restrictions || []);
      setCustomRestrictions(d.customRestrictions || []);
      setKitchen(d.kitchen || []);
      setDislikes(d.dislikes || []);
    }
  }, []);

  // 报菜名 1s 切换
  useEffect(() => {
    if (loading) {
      const t = setInterval(() => setMenuIndex(i => i + 1), 1000);
      return () => clearInterval(t);
    }
  }, [loading]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };
  const toggle = (arr: string[], v: string) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const addCustomRestriction = () => {
    if (!newCustomRestriction.trim()) return;
    if (!customRestrictions.includes(newCustomRestriction.trim())) {
      setCustomRestrictions([...customRestrictions, newCustomRestriction.trim()]);
    }
    setNewCustomRestriction('');
  };

  const addDislike = () => {
    if (!newDislike.trim()) return;
    if (!dislikes.find(d => d.item === newDislike.trim())) {
      setDislikes([...dislikes, { item: newDislike.trim(), level: newDislikeLevel }]);
    }
    setNewDislike('');
  };

  const removeDislike = (item: string) => setDislikes(dislikes.filter(d => d.item !== item));
  const cycleLevel = (item: string) => {
    setDislikes(dislikes.map(d => {
      if (d.item !== item) return d;
      const idx = DISLIKE_LEVELS.findIndex(l => l.value === d.level);
      const nextIdx = (idx + 1) % DISLIKE_LEVELS.length;
      return { ...d, level: DISLIKE_LEVELS[nextIdx].value };
    }));
  };

  const saveProfile = () => {
    const profileSummary = [
      goals.length > 0 && `目标: ${goals.join('、')}`,
      (restrictions.length > 0 || customRestrictions.length > 0) && `忌口: ${[...restrictions, ...customRestrictions].join('、')}`,
      dislikes.length > 0 && `不爱吃: ${dislikes.map(d => d.item).join('、')}`,
    ].filter(Boolean).join('\n');
    
    const confirmed = confirm(`确认保存以下档案？\n\n${profileSummary}\n\n点击「确定」保存并开始规划，点击「取消」继续修改`);
    if (!confirmed) return;
    
    localStorage.setItem('meal_profile', JSON.stringify({ goals, restrictions, customRestrictions, kitchen, dislikes }));
    showToast('✅ 档案已保存');
    setTimeout(() => setPage(2), 300);
  };

  // 本地生成函数 - 使用预定义菜谱
const generateLocalPlan = () => {
    // 早餐、午餐、晚餐的菜谱库
    const breakfastRecipes = [
      { recipe_name: "白粥", dish_type: "主食", time_cost: 20, ingredients: ["大米", "水"], steps: ["大米洗净", "加水煮粥", "调味"] },
      { recipe_name: "豆浆", dish_type: "饮品", time_cost: 10, ingredients: ["黄豆", "水"], steps: ["黄豆浸泡", "打成豆浆", "煮沸"] },
      { recipe_name: "油条", dish_type: "主食", time_cost: 15, ingredients: ["面粉", "酵母", "油"], steps: ["和面", "发酵", "油炸"] },
      { recipe_name: "包子", dish_type: "主食", time_cost: 30, ingredients: ["面粉", "酵母", "肉馅"], steps: ["和面", "发酵", "包馅", "蒸熟"] },
      { recipe_name: "煎鸡蛋", dish_type: "主菜", time_cost: 5, ingredients: ["鸡蛋", "盐", "油"], steps: ["鸡蛋打散", "热油煎制", "调味"] },
      { recipe_name: "清汤面", dish_type: "主食", time_cost: 15, ingredients: ["面条", "水", "盐", "葱"], steps: ["煮水", "下面条", "调味撒葱"] },
    ];
    
    const mainDishes = [
      { recipe_name: "西红柿炒蛋", dish_type: "主菜", time_cost: 15, ingredients: ["西红柿", "鸡蛋", "盐", "糖", "油"], steps: ["西红柿切块", "鸡蛋打散", "热油炒蛋", "加入西红柿翻炒", "调味出锅"] },
      { recipe_name: "青椒肉丝", dish_type: "主菜", time_cost: 20, ingredients: ["猪肉", "青椒", "姜", "蒜", "酱油", "盐"], steps: ["猪肉切丝", "青椒切丝", "热油炒肉", "加入青椒翻炒", "调味出锅"] },
      { recipe_name: "糖醋排骨", dish_type: "主菜", time_cost: 40, ingredients: ["排骨", "醋", "糖", "酱油", "料酒"], steps: ["排骨焯水", "炒糖色", "加入排骨", "加调料焖煮", "收汁"] },
      { recipe_name: "红烧肉", dish_type: "主菜", time_cost: 60, ingredients: ["五花肉", "酱油", "糖", "料酒", "姜"], steps: ["五花肉切块", "焯水", "炒糖色", "加入肉块", "焖煮"] },
      { recipe_name: "宫保鸡丁", dish_type: "主菜", time_cost: 25, ingredients: ["鸡胸肉", "花生", "干辣椒", "酱油", "醋"], steps: ["鸡肉切丁", "准备配料", "热油翻炒", "加入调料", "出锅"] },
      { recipe_name: "鱼香肉丝", dish_type: "主菜", time_cost: 25, ingredients: ["猪肉", "木耳", "笋", "酱油", "醋", "糖"], steps: ["食材切丝", "炒肉丝", "加入配菜", "调味", "出锅"] },
    ];
    
    const vegetables = [
      { recipe_name: "蒜蓉青菜", dish_type: "蔬菜", time_cost: 10, ingredients: ["青菜", "蒜", "盐", "油"], steps: ["青菜洗净", "蒜切末", "热油爆香蒜末", "加入青菜翻炒", "调味出锅"] },
      { recipe_name: "炒土豆丝", dish_type: "蔬菜", time_cost: 15, ingredients: ["土豆", "醋", "盐", "干辣椒"], steps: ["土豆切丝", "泡水去淀粉", "热油炒制", "加醋和盐", "出锅"] },
      { recipe_name: "凉拌黄瓜", dish_type: "蔬菜", time_cost: 10, ingredients: ["黄瓜", "蒜", "酱油", "醋", "香油"], steps: ["黄瓜拍碎", "切块", "加入蒜泥", "加调料拌匀"] },
      { recipe_name: "炒西兰花", dish_type: "蔬菜", time_cost: 15, ingredients: ["西兰花", "蒜", "盐", "油"], steps: ["西兰花切块", "焯水", "热油蒜爆", "加入西兰花翻炒", "调味"] },
      { recipe_name: "番茄炒菜花", dish_type: "蔬菜", time_cost: 15, ingredients: ["菜花", "西红柿", "盐", "油"], steps: ["菜花切块", "西红柿切块", "热油翻炒", "加入西红柿", "调味出锅"] },
    ];
    
    const staples = [
      { recipe_name: "米饭", dish_type: "主食", time_cost: 30, ingredients: ["大米", "水"], steps: ["大米洗净", "加水", "电饭煲煮熟"] },
      { recipe_name: "馒头", dish_type: "主食", time_cost: 40, ingredients: ["面粉", "酵母", "水"], steps: ["和面", "发酵", "蒸熟"] },
      { recipe_name: "面条", dish_type: "主食", time_cost: 15, ingredients: ["面条", "水", "卤"], steps: ["煮水", "下面条", "盛入卤汁"] },
      { recipe_name: "炒饭", dish_type: "主食", time_cost: 20, ingredients: ["米饭", "鸡蛋", "火腿", "盐", "油"], steps: ["米饭备好", "鸡蛋炒散", "加入米饭", "加入配料翻炒", "调味"] },
    ];
    
    // 随机选择函数
    const randomPick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    
    // 生成几天的计划
    const daysArray = [];
    for (let i = 0; i < Number(days); i++) {
      daysArray.push({
        day_index: i + 1,
        meals: [
          {
            type: "早餐",
            dishes: [
              { dish_type: "主食", recipe: randomPick(breakfastRecipes) },
            ]
          },
          {
            type: "午餐", 
            dishes: [
              { dish_type: "主食", recipe: randomPick(staples) },
              { dish_type: "主菜", recipe: randomPick(mainDishes) },
              { dish_type: "蔬菜", recipe: randomPick(vegetables) }
            ]
          },
          {
            type: "晚餐",
            dishes: [
              { dish_type: "主食", recipe: randomPick(staples) },
              { dish_type: "主菜", recipe: randomPick(mainDishes) },
              { dish_type: "蔬菜", recipe: randomPick(vegetables) }
            ]
          }
        ]
      });
    }
    
    return { days: daysArray };
  };

  const handleGenerate = async () => {
    if (style.length === 0) { setError('请选择风格'); return; }
    setLoading(true); setError(''); setMenuIndex(0);
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: { 
            goals: goals.length > 0 ? goals : ['健康'], 
            hard_restrictions: restrictions, 
            custom_restrictions: customRestrictions,
            kitchen_tools: kitchen 
          },
          session: { 
            style_preferences: style, 
            soft_dislikes: dislikes.map(d => d.item), 
            days, 
            meals_per_day: meals, 
            person_count: people, 
            budget 
          }
        })
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else { 
        setResult(data); 
        setPage(3);
        // 保存到历史记录
        const history = JSON.parse(localStorage.getItem('meal_history') || '[]');
        history.unshift({ style: [...style], days: Number(days), date: new Date().toLocaleDateString() });
        localStorage.setItem('meal_history', JSON.stringify(history.slice(0, 10)));
      }
    } catch (e) { setError('生成失败，请重试'); }
    finally { setLoading(false); }
  };

  const handleReplace = async () => {
    if (!result) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: { 
            goals: goals.length > 0 ? goals : ['健康'], 
            hard_restrictions: restrictions, 
            custom_restrictions: customRestrictions,
            kitchen_tools: kitchen 
          },
          session: { 
            style_preferences: style, 
            soft_dislikes: dislikes.map(d => d.item), 
            days, 
            meals_per_day: meals, 
            person_count: people, 
            budget 
          }
        })
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else { setResult(data); }
    } catch (e) { setError('换一批失败，请重试'); }
    finally { setLoading(false); }
  };

  const replaceDish = (dayIdx: number, mealIdx: number, dishIdx: number) => {
    if (!result?.days) return;
    const newDays = [...result.days];
    if (newDays[dayIdx]?.meals[mealIdx]?.dishes[dishIdx]) {
      newDays[dayIdx].meals[mealIdx].dishes[dishIdx].recipe.recipe_name = '🔄 点击重新生成';
      setResult({ ...result, days: newDays });
    }
  };

  // ========== 欢迎页 ==========
  if (page === 0) {
    const hasProfile = goals.length > 0 || restrictions.length > 0 || customRestrictions.length > 0 || dislikes.length > 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12">
        <div className="max-w-md mx-auto px-4">
          {/* 欢迎语 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">🍽️ 饮食规划</h1>
            <p className="text-lg text-gray-600 mb-2">智能生成你的专属食谱</p>
            {!hasProfile && (
              <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm mt-4">
                👋 嗨！初次见面～<br/>
                先填写你的饮食偏好，让我为你定制专属菜谱吧！
              </div>
            )}
          </div>
          
          {/* 档案预览卡片 */}
          {hasProfile && (
            <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">📋 我的档案</h3>
                <button onClick={() => setPage(1)} className="text-blue-500 text-sm">修改 →</button>
              </div>
              <div className="space-y-2 text-sm">
                {goals.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">🎯</span>
                    <div><span className="text-gray-500">目标:</span> <span className="text-gray-700">{goals.join('、')}</span></div>
                  </div>
                )}
                {(restrictions.length > 0 || customRestrictions.length > 0) && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">🚫</span>
                    <div><span className="text-gray-500">忌口:</span> <span className="text-gray-700">{[...restrictions, ...customRestrictions].join('、')}</span></div>
                  </div>
                )}
                {dislikes.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">🤔</span>
                    <div><span className="text-gray-500">不爱吃:</span> <span className="text-gray-700">{dislikes.map(d => `${d.level === '过敏' ? '过敏' : '不吃'}${d.item}`).join('、')}</span></div>
                  </div>
                )}
                {kitchen.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">🍳</span>
                    <div><span className="text-gray-500">厨具:</span> <span className="text-gray-700">{kitchen.join('、')}</span></div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button onClick={() => setPage(hasProfile ? 2 : 1)} className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold text-lg shadow-lg">
              {hasProfile ? '🎯 开始规划' : '📝 填写档案'}
            </button>
            {hasProfile && (
              <button onClick={() => setPage(2)} className="w-full py-4 bg-white text-gray-700 rounded-2xl font-semibold border-2 border-gray-200">
                ✨ 新建规划
              </button>
            )}
            <button onClick={() => setPage(5)} className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium">
              📜 历史记录
            </button>
          </div>
          {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full">{toast}</div>}
        </div>
      </div>
    );
  }

  // ========== 档案页 ==========
  if (page === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
        <div className="max-w-xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">📝 档案设置</h1>
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            {/* 目标 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🎯 目标 (可多选)</h3>
              <div className="grid grid-cols-3 gap-2">{GOAL_OPTIONS.map(g => (
                <button key={g.value} onClick={() => setGoals(toggle(goals, g.value))}
                className={`p-3 rounded-xl text-center text-sm ${goals.includes(g.value) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <div className="text-xl">{g.emoji}</div><div>{g.value}</div>
                </button>
              ))}</div>
            </div>

            {/* 忌口 - 预设 + DIY */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🚫 忌口</h3>
              <div className="flex flex-wrap gap-2 mb-3">{RESTRICTION_OPTIONS.map(r => (
                <button key={r} onClick={() => setRestrictions(toggle(restrictions, r))}
                className={`px-3 py-1.5 rounded-full text-sm ${restrictions.includes(r) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{r}</button>
              ))}</div>
              {/* DIY 忌口 */}
              <div className="flex gap-2">
                <input value={newCustomRestriction} onChange={e => setNewCustomRestriction(e.target.value)} placeholder="添加忌口..." className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-900" onKeyDown={e => e.key === 'Enter' && addCustomRestriction()} />
                <button onClick={addCustomRestriction} className="px-4 bg-gray-200 rounded-lg text-sm text-gray-700">添加</button>
              </div>
              {customRestrictions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {customRestrictions.map(r => (
                    <span key={r} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1">
                      {r} <button onClick={() => setCustomRestrictions(customRestrictions.filter(x => x !== r))}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 不爱吃 - 简化样式 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🤔 不爱吃</h3>
              {/* 预设 - 点击切换: 不吃 -> 过敏 -> 移除 */}
              <div className="flex flex-wrap gap-2">{DISLIKE_OPTIONS.map(d => {
                const existing = dislikes.find(x => x.item === d.value);
                return (
                  <button key={d.value} onClick={() => {
                    if (!existing) {
                      setDislikes([...dislikes, { item: d.value, level: '一点不吃' }]);
                    } else if (existing.level === '一点不吃') {
                      setDislikes(dislikes.map(x => x.item === d.value ? { ...x, level: '过敏' } : x));
                    } else {
                      removeDislike(d.value);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm ${existing ? (existing.level === '过敏' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white') : 'bg-gray-100 text-gray-700'}`}>
                    {existing ? (existing.level === '过敏' ? '🤮' : '🚫') : d.emoji} {d.value}
                  </button>
                );
              })}</div>
              {/* DIY */}
              <div className="flex gap-2 mt-3">
                <input value={newDislike} onChange={e => setNewDislike(e.target.value)} placeholder="添加不爱吃的..." className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-900" onKeyDown={e => e.key === 'Enter' && addDislike()} />
                <button onClick={addDislike} className="px-4 bg-gray-200 rounded-lg text-sm text-gray-700">添加</button>
              </div>
            </div>

            {/* 厨具 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🍳 厨具</h3>
              <div className="flex flex-wrap gap-2">{KITCHEN_OPTIONS.map(k => (
                <button key={k.value} onClick={() => setKitchen(toggle(kitchen, k.value))}
                className={`px-3 py-1.5 rounded-full text-sm ${kitchen.includes(k.value) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{k.emoji} {k.value}</button>
              ))}</div>
            </div>

            <button onClick={saveProfile} className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold">保存档案 →</button>
          </div>
          {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full">{toast}</div>}
        </div>
      </div>
    );
  }

  // ========== 计划页 ==========
  if (page === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
        <div className="max-w-xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">📋 本次计划</h1>
          {loading ? <LoadingState tipIndex={menuIndex} /> : (
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error} <button onClick={handleGenerate} className="ml-2 underline">重试</button></div>}
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">🍜 风格</h3>
                <div className="grid grid-cols-3 gap-2">{STYLE_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => setStyle(toggle(style, s.value))}
                  className={`p-3 rounded-xl text-center text-sm ${style.includes(s.value) ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    <div className="text-xl">{s.emoji}</div><div>{s.value}</div>
                  </button>
                ))}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">📅 天数</h3>
                  <div className="flex gap-1">{[1,3,5,7].map(d => <button key={d} onClick={() => setDays(d)} className={`flex-1 py-2 rounded-lg text-sm ${days === d ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{d}</button>)}</div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">📅 自定义</h3>
                  <input 
                    type="number" 
                    min="1" 
                    max="30" 
                    value={days} 
                    onChange={e => setDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                    className="w-full p-2 border rounded-lg text-sm text-gray-700"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">🍴 餐次</h3>
                <div className="flex flex-wrap gap-2">{MEAL_OPTIONS.map(m => (
                  <button key={m.value} onClick={() => setMeals(toggle(meals, m.value))}
                  className={`px-3 py-2 rounded-lg text-sm ${meals.includes(m.value) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{m.emoji} {m.value}</button>
                ))}</div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setPage(0)} className="flex-1 py-3 bg-gray-100 rounded-xl text-gray-700">← 返回</button>
                <button onClick={handleGenerate} disabled={style.length === 0} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50">🚀 生成</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== 结果页 ==========
  if (page === 3) {
  // 计算当天总耗时
  const currentDayMeals = result?.days?.find((d: any) => d.day_index === selectedDay)?.meals || [];
  const totalTime = currentDayMeals.reduce((sum: number, m: any) => {
    return sum + (m.dishes?.reduce((s: number, d: any) => s + (d.recipe?.time_cost || 0), 0) || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* 本次计划 */}
          <div className="bg-blue-50 rounded-xl p-3 mb-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{style.join('、')}</span>
              <span className="mx-2">|</span>
              <span>{days}天</span>
            </div>
            {goals.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">🎯 {goals.join('、')}</div>
            )}
          </div>
          
          {/* 加载中 - 报菜名 */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <img src="/images/caiming.png" alt="蔡明" className="w-24 h-24 rounded-full object-cover mb-4" />
              <div className="text-xl font-bold text-gray-900 mb-2">{MENU_TIPS[menuIndex % MENU_TIPS.length]}</div>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 animate-pulse" style={{width: '60%'}} />
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>
          )}
          
          {/* 天数切换 + 总耗时 */}
          {!loading && result && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2 flex-wrap">
                {result?.days?.map((d: any) => (
                  <button key={d.day_index} onClick={() => setSelectedDay(d.day_index)}
                  className={`px-4 py-2 rounded-full text-sm ${selectedDay === d.day_index ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}>第{d.day_index}天</button>
                ))}
              </div>
              <div className="text-sm text-gray-500">⏱️ 约{totalTime}分钟</div>
            </div>
          )}

          {/* 菜品列表 */}
          {!loading && result && currentDayMeals.map((m: any, mealIdx: number) => (
            <div key={mealIdx} className="mb-4 p-4 border rounded-xl">
              <div className="font-semibold text-gray-900 mb-3">{m.type}</div>
              {m.dishes?.map((dish: any, dishIdx: number) => (
                <DishCard key={dishIdx} dish={dish} onReplace={() => replaceDish(selectedDay - 1, mealIdx, dishIdx)} />
              ))}
            </div>
          ))}

          {/* 底部按钮 */}
          <div className="flex gap-2 mt-6">
            <button onClick={handleReplace} className="flex-1 py-3 bg-gray-100 rounded-xl text-gray-700">🔄 换一批</button>
            <button onClick={() => setPage(4)} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold">📦 备菜清单</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== 备菜页 ==========
if (page === 4) {
  // 解析食材并分类 - 保留用量，合并同类项
  const ingredientMap = new Map<string, string>(); // name -> full ingredient with quantity
  
  const meatKeywords = ['鸡', '鸭', '鹅', '猪', '牛', '羊', '鱼', '虾', '蟹', '肉', '蛋'];
  const veggieKeywords = ['菜', '青', '西红', '土', '萝', '瓜', '椒', '茄', '菇', '木耳', '笋', '豆'];
  const sauceKeywords = ['油', '盐', '酱', '醋', '糖', '味', '鸡精', '淀粉', '胡椒', '蒜', '葱', '姜'];
  
  result?.days?.forEach((d: any) => {
    d.meals?.forEach((m: any) => {
      m.dishes?.forEach((dish: any) => {
        dish.recipe?.ingredients?.forEach((ing: string) => {
          // 提取基础食材名（去掉数字但保留用量描述）
          let baseName = ing.replace(/少许|适量|一些|几/g, '').trim();
          // 提取用量部分
          let quantity = ing.replace(baseName, '').trim();
          
          if (!baseName) return;
          
          // 合并同类项：保留第一个出现的完整食材描述
          if (!ingredientMap.has(baseName)) {
            ingredientMap.set(baseName, ing);
          }
        });
      });
    });
  });
  
  // 按分类组织
  const categories: Record<string, string[]> = { '🥩 肉类': [], '🥬 蔬菜': [], '🧂 调料': [], '🥚 其他': [] };
  
  ingredientMap.forEach((fullIng, baseName) => {
    let added = false;
    for (const k of meatKeywords) { if (baseName.includes(k)) { categories['🥩 肉类'].push(fullIng); added = true; break; } }
    if (!added) for (const k of veggieKeywords) { if (baseName.includes(k)) { categories['🥬 蔬菜'].push(fullIng); added = true; break; } }
    if (!added) for (const k of sauceKeywords) { if (baseName.includes(k)) { categories['🧂 调料'].push(fullIng); added = true; break; } }
    if (!added) categories['🥚 其他'].push(fullIng);
  });

  const toggleCheck = (name: string) => setChecked((p:any) => ({ ...p, [name]: !p[name] }));
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = Object.values(categories).reduce((s: number, c: string[]) => s + c.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">📦 备菜清单</h2>
            <button onClick={() => setPage(3)} className="text-blue-500 text-sm">← 返回</button>
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            已采购 <span className="font-semibold text-green-600">{checkedCount}/{totalCount}</span> 种
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(categories).map(([cat, items]) => (
              items.length > 0 && (
                <div key={cat}>
                  <div className="font-semibold text-gray-700 mb-2">{cat} ({items.length})</div>
                  <div className="space-y-1">
                    {items.sort().map(name => (
                      <label key={name} className={`flex items-center p-2 rounded cursor-pointer ${checked[name] ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <input type="checkbox" checked={!!checked[name]} onChange={() => toggleCheck(name)} className="w-4 h-4 mr-2" />
                        <span className={`text-sm ${checked[name] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          <button onClick={() => setPage(0)} className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold mt-6">✅ 完成</button>
        </div>
      </div>
    </div>
  );
}

// ========== 历史记录页 ==========
if (page === 5) {
  const history = JSON.parse(localStorage.getItem('meal_history') || '[]');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">📜 历史记录</h2>
            <button onClick={() => setPage(0)} className="text-blue-500 text-sm">← 返回</button>
          </div>
          
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-8">暂无历史记录</div>
          ) : (
            <div className="space-y-3">
              {history.map((item: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-xl">
                  <div className="text-sm font-medium text-gray-800">{item.style?.join('、')}</div>
                  <div className="text-xs text-gray-500 mt-1">{Number(item.days)}天 | {item.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 菜品卡片组件 - 可展开做法
function DishCard({ dish, onReplace }: { dish: any, onReplace: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const dishType = dish.dish_type || '菜品';
  
  const typeColors: Record<string, string> = {
    '主食': 'bg-amber-100 text-amber-700',
    '主菜': 'bg-red-100 text-red-700', 
    '蔬菜': 'bg-green-100 text-green-700',
    '蛋白质': 'bg-blue-100 text-blue-700',
    '汤': 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="mb-3 pb-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs ${typeColors[dishType] || 'bg-gray-100 text-gray-700'}`}>{dishType}</span>
            <span className="font-medium text-gray-800">{dish.recipe?.recipe_name}</span>
          </div>
          <div className="text-xs text-gray-500">⏱️ {dish.recipe?.time_cost}分钟</div>
        </div>
        <button onClick={onReplace} className="text-xs text-blue-500 ml-2">换一道</button>
      </div>
      
      {/* 做法 - 可展开 */}
      <button onClick={() => setExpanded(!expanded)} className="mt-2 text-xs text-gray-500 flex items-center gap-1">
        {expanded ? '▲ 收起做法' : '▼ 展开做法'}
      </button>
      {expanded && dish.recipe?.steps && (
        <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg space-y-1">
          {dish.recipe.steps.map((s: string, k: number) => (
            <div key={k} className="leading-relaxed">{s}</div>
          ))}
        </div>
      )}
    </div>
  );
}
}
