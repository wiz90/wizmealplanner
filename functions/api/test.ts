// 测试端点，尝试简单的 API 调用
export async function onRequestPost({ request, env }) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const apiKey = env.CUSTOM_API_KEY || env.DEEPSEEK_API_KEY || '';
    const apiUrl = env.CUSTOM_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    const modelName = env.CUSTOM_MODEL || 'deepseek-chat';
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'No API key configured' }), { status: 500, headers });
    }
    
    const isMiniMax = apiUrl.includes('minimax');
    
    // 非常简单的测试提示
    const testPrompt = `请返回一个简单的 JSON: {"test": "success", "message": "API 工作正常"}`;
    
    const apiBody = isMiniMax ? {
      model: modelName,
      messages: [
        { role: 'system', content: '只返回 JSON，不要有任何其他文字。' },
        { role: 'user', content: testPrompt }
      ],
      temperature: 0.1,
      max_tokens: 100,
    } : {
      model: modelName,
      messages: [{ role: 'user', content: testPrompt }],
      temperature: 0.1,
      max_tokens: 100,
    };
    
    console.log(`[TEST] Making API call to ${apiUrl}, model: ${modelName}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify(apiBody),
    });
    
    const responseText = await response.text();
    console.log(`[TEST] Response status: ${response.status}`);
    console.log(`[TEST] Response body (first 500 chars): ${responseText.substring(0, 500)}`);
    
    if (!response.ok) {
      return new Response(JSON.stringify({
        error: `API error: ${response.status}`,
        response: responseText,
      }), { status: 500, headers });
    }
    
    try {
      const data = JSON.parse(responseText);
      const content = data.choices?.[0]?.message?.content || '';
      
      return new Response(JSON.stringify({
        status: 'success',
        apiStatus: response.status,
        rawResponse: responseText.substring(0, 1000),
        parsedContent: content,
        isJson: (() => {
          try {
            JSON.parse(content);
            return true;
          } catch {
            return false;
          }
        })(),
      }), { status: 200, headers });
      
    } catch (parseError) {
      return new Response(JSON.stringify({
        status: 'parse_error',
        apiStatus: response.status,
        rawResponse: responseText.substring(0, 1000),
        parseError: parseError.message,
      }), { status: 200, headers });
    }
    
  } catch (error) {
    console.log(`[TEST ERROR] ${error.message}`);
    return new Response(JSON.stringify({
      status: 'error',
      error: error.message,
      stack: error.stack,
    }), { status: 500, headers });
  }
}