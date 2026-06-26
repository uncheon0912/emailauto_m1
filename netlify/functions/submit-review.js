exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, {
      ok: false,
      message: 'POST 요청만 사용할 수 있습니다.'
    });
  }

  const endpoint = process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL;

  if (!endpoint) {
    return json(500, {
      ok: false,
      message: 'Netlify 환경변수 GOOGLE_APPS_SCRIPT_WEB_APP_URL이 설정되지 않았습니다.'
    });
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: event.body
    });

    const text = await response.text();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: text
    };
  } catch (error) {
    return json(500, {
      ok: false,
      message: error.message || '신청 처리 중 오류가 발생했습니다.'
    });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(body)
  };
}
