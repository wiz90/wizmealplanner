# 安全配置指南

## 1. Cloudflare 安全设置

### Rate Limiting (速率限制)
1. 进入 Cloudflare Dashboard → Security → WAF
2. 创建 Rate Limiting Rule:
   - 路径: `/api/generate`
   - 阈值: 每分钟 10 次请求
   - 动作: Block

### DDoS 防护
- 已默认开启
- 确保 "Under Attack Mode" 在需要时启用

### API 密钥管理
- 在 Pages → Settings → Environment Variables 配置
- 不要提交到 Git

---

## 2. 前端安全

### localStorage 安全
```javascript
// 安全解析 localStorage
function safeParseLocalStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.warn(`Failed to parse ${key}:`, e);
    return defaultValue;
  }
}
```

### XSS 防护
- React 默认转义 HTML
- 避免使用 `dangerouslySetInnerHTML`

---

## 3. 监控和日志

### 建议的监控项
1. **API 调用频率** - 异常高频率可能表示攻击
2. **错误率** - 突然升高可能表示问题
3. **响应时间** - 异常慢可能表示资源耗尽

### Cloudflare 日志
- 启用 Analytics → 查看请求统计
- 设置警报: 错误率 > 5%

---

## 4. 应急响应

### 发现攻击时
1. 启用 "Under Attack Mode"
2. 检查 Rate Limiting 规则
3. 查看日志确认攻击模式
4. 考虑更换 API Key

### 数据泄露时
1. 立即更换 API Key
2. 检查是否有敏感数据泄露
3. 通知用户 (如果适用)

---

## 5. 定期检查清单

- [ ] API Key 是否泄露
- [ ] Rate Limiting 是否生效
- [ ] 错误日志是否正常
- [ ] 依赖包是否有安全更新
- [ ] 用户数据是否安全存储