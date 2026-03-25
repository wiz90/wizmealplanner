# 饮食规划 Web App - 安全配置说明

## 🔐 已实施的安全措施

### 1. API 安全
- **CORS 限制**: 只允许 `wizmealplanner.pages.dev` 和 `localhost`
- **速率限制**: 20 请求/分钟/IP (内存缓存)
- **输入验证**: 过滤特殊字符，限制长度
- **API Key 保护**: 存储在 Cloudflare 环境变量

### 2. 前端安全
- **localStorage 安全解析**: 添加 try-catch 防止 XSS
- **输入清理**: 用户输入过滤特殊字符
- **数值范围限制**: 人数(1-20), 天数(1-30)

### 3. 日志监控
- 记录请求 IP、时间、参数
- 记录 API 调用状态和时长
- 记录异常和错误

## 🛡️ Cloudflare 配置建议

### 1. Rate Limiting (推荐)
进入 Cloudflare Dashboard → Security → WAF → Rate Limiting Rules

**建议配置:**
- 路径: `/api/generate`
- 阈值: 10 请求/分钟
- 持续时间: 1 分钟

### 2. WAF 规则
- 启用 Cloudflare WAF
- 阻止 SQL 注入、XSS 等常见攻击

### 3. 环境变量
确保以下环境变量已设置:
- `DEEPSEEK_API_KEY` (或 `CUSTOM_API_KEY`)
- `CUSTOM_API_URL` (可选)
- `CUSTOM_MODEL` (可选)

## 🚨 安全最佳实践

### 定期检查
1. **API 使用统计**: 监控 DeepSeek 控制台
2. **日志审查**: 检查异常请求
3. **环境变量**: 定期轮换 API Key

### 应急响应
1. **API Key 泄露**: 立即在 DeepSeek 控制台撤销
2. **异常流量**: 启用 Cloudflare Rate Limiting
3. **安全漏洞**: 更新代码并重新部署

## 📊 监控指标

- 请求成功率: `> 95%`
- 平均响应时间: `< 5秒`
- 异常请求率: `< 1%`

---

**最后更新**: 2026-03-25
**部署地址**: https://wizmealplanner.pages.dev/