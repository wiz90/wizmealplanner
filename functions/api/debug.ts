// 调试端点，用于检查 API 问题
export async function onRequest({ request, env }) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // 只处理 GET 请求
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  try {
    // 检查环境变量
    const apiKey = env.CUSTOM_API_KEY || env.DEEPSEEK_API_KEY || '';
    const apiUrl = env.CUSTOM_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    const modelName = env.CUSTOM_MODEL || 'deepseek-chat';
    
    const isMiniMax = apiUrl.includes('minimax');
    
    return new Response(JSON.stringify({
      status: 'ok',
      config: {
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey.length,
        apiUrl,
        modelName,
        isMiniMax,
        // 不显示完整的 API key
        apiKeyPreview: apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}` : 'none'
      },
      timestamp: new Date().toISOString(),
    }), { status: 200, headers });
    
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      error: error.message,
      stack: error.stack,
    }), { status: 500, headers });
  }
}