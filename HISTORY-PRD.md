# 生成历史功能 PRD

## 1. 核心功能

用户可以查看和管理过去生成的菜单规划历史。

## 2. 功能需求

### 2.1 历史记录列表
- 显示历史生成记录 (按时间倒序)
- 每条记录包含: 生成日期、风格、天数、人数、菜品数量
- 支持分页或无限滚动

### 2.2 历史记录详情
- 点击进入查看详细菜单
- 可以查看完整的天/餐/菜品结构

### 2.3 快速复用
- 从历史记录重新生成相似菜单
- 修改参数后重新生成

### 2.4 删除历史
- 删除单条历史记录
- 清空全部历史

## 3. 数据结构

```typescript
interface HistoryRecord {
  id: string;
  createdAt: string; // ISO date
  profile: {
    goals: string[];
    restrictions: string[];
    kitchen: string[];
  };
  session: {
    style_preferences: string[];
    days: number;
    person_count: number;
    budget: string;
  };
  result: {
    days: DayPlan[];
  };
}
```

## 4. UI 设计

### 4.1 入口
- 欢迎页: "📜 历史记录" 按钮

### 4.2 列表页
- 卡片式列表
- 显示: 日期 + 风格标签 + 天数
- 操作: 查看详情、删除

### 4.3 详情页
- 与结果页类似展示
- 可重新生成

## 5. 优先级

- **P0**: 列表查看 + 详情查看
- **P1**: 快速复用
- **P2**: 删除功能

## 6. 实现计划

1. 存储: localStorage ('meal_history')
2. 生成时自动保存
3. page=5 改造为历史记录页