const fetch = global.fetch || require('node-fetch');

(async () => {
  try {
    const health = await fetch('http://localhost:5000/');
    const text = await health.text();
    console.log('HEALTH', health.status, text);
  } catch (e) {
    console.error('HEALTH ERROR', e.message);
  }

  try {
    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'testuser@example.com', password: '123456' }),
    });
    console.log('SIGNUP STATUS', res.status, res.statusText);
    const body = await res.text();
    console.log('SIGNUP BODY', body);
  } catch (e) {
    console.error('SIGNUP ERROR', e.message);
  }
})();
