# 菜单扩展实施计划

## 实施步骤

### Step 1: 扩展生成能力 (API)
- 修改 `functions/api/generate.ts`
- 支持 `generate_full_week: true` 参数
- 返回完整 7 天计划

### Step 2: 周视图 UI
- 在 page.tsx 添加新页面 (page=5)
- 日历网格展示 7 天 × 5 餐
- 支持点击查看详情

### Step 3: 收藏夹功能
- 添加 favorites 数据结构
- 实现收藏/取消收藏交互
- 支持分类和标签

---

## 文件变更

| 文件 | 变更 |
|------|------|
| `functions/api/generate.ts` | 支持整周生成 |
| `src/app/page.tsx` | 新增周视图 + 收藏夹 UI |
| `MENU-EXPANSION.md` | PRD 文档 |

---

## 开始实施

现在开始按顺序实现。完成后会推送 GitHub，部署后你可以测试。