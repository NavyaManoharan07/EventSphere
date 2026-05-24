const http = require('http');

const options = { hostname: 'localhost', port: 5000, path: '/', method: 'GET' };
const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  let body = '';
  res.on('data', (c) => body += c);
  res.on('end', () => console.log('BODY', body));
});
req.on('error', (e) => console.error('ERR', e.message));
req.end();
