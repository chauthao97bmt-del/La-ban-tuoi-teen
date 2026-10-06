const http = require('http');
function req(method, path, body, token) {
  return new Promise((resolve) => {
    const d = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (d) headers['Content-Length'] = Buffer.byteLength(d);
    if (token) headers.Authorization = 'Bearer ' + token;
    const r = http.request({ hostname: '127.0.0.1', port: 3001, path, method, headers }, res => {
      let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    r.on('error', e => resolve({ status: 0, body: e.message }));
    if (d) r.write(d); r.end();
  });
}
(async () => {
  const login = await req('POST', '/api/auth/login', { username: process.argv[2] || '8A101', password: 'Demo@123' });
  const token = JSON.parse(login.body).token;
  const paths = ['/api/assessments/my', '/api/assessments/questions/RIASEC', '/api/assessments/questions/STRENGTHS',
    '/api/assessments/questions/VALUES', '/api/assessments/questions/LEARNING_STYLE', '/api/challenges/my-progress',
    '/api/careers/categories', '/api/careers/bac-si', '/api/portfolio', '/api/goals/my', '/api/mood/history', '/api/journal/my'];
  for (const p of paths) { const r = await req('GET', p, null, token); console.log(p, r.status, r.body.slice(0, 150).replace(/\n/g,' ')); }
})();
