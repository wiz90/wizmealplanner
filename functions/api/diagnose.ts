// 诊断端点 - 最简单的测试
export async function onRequest({ request, env }) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ 
      message: 'Send POST to test',
      usage: 'curl -X POST https://wizmealplanner.pages.dev/api/diagnose'
    }), { status: 200, headers });
  }

  try {
    const apiKey = env.CUSTOM_API_KEY || '';
    const apiUrl = env.CUSTOM_API_URL || '';
    const modelName = env.CUSTOM_MODEL || '';
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'No API key' }), { status: 500, headers });
    }

    // 最简单的测试
    const testBody = {
      model: modelName || 'MiniMax-M2.7-highspeed',
      messages: [
        { role: 'system', content: '只返回 {"test": "ok"}' },
        { role: 'user', content: 'test' }
      ],
      temperature: 0.1,
      max_tokens: 100,
    };

    const start = Date.now();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify(testBody),
    });

    const duration = Date.now() - start;
    const rawText = await response.text();

    return new Response(JSON.stringify({
      status: response.status,
      duration: duration + 'ms',
      rawResponse: rawText,
      responseLength: rawText.length,
      isJson: (() => {
        try {
          JSON.parse(rawText);
          return true;
        } catch {
          return false;
        }
      })(),
      config: {
        apiUrl,
        modelName,
        hasKey: !!apiKey,
      }
    }, null, 2), { status: 200, headers });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack,
    }, null, 2), { status: 500, headers });
  }
}