const http = require('http');

const testPath = (path) => {
  const options = { hostname: 'localhost', port: 5000, path: path, method: 'GET' };
  const req = http.request(options, (res) => {
    console.log(`PATH: ${path} | STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (c) => body += c);
    res.on('end', () => console.log('BODY:', body));
  });
  req.on('error', (e) => console.error('ERR', e.message));
  req.end();
};

testPath('/');
testPath('/api/events');
testPath('/api/auth/me');
