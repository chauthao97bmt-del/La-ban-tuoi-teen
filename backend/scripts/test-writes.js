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
  for (const u of ['9a101', ' 9A102 ', '8a601']) {
    const r = await req('POST', '/api/auth/login', { username: u, password: 'Demo@123' });
    console.log('login', JSON.stringify(u), r.status);
  }
  const login = await req('POST', '/api/auth/login', { username: '8A646', password: 'Demo@123' });
  const token = JSON.parse(login.body).token;
  let r = await req('POST', '/api/assessments/submit', { type: 'RIASEC', answers: [['1', 5]], result: { R: 10, I: 5, A: 3, S: 8, E: 2, C: 1 } }, token);
  console.log('submit', r.status, r.body.slice(0, 150));
  const ch = JSON.parse((await req('GET', '/api/challenges', null, token)).body);
  r = await req('POST', `/api/challenges/${ch[0].id}/complete`, { response: 'Em làm tốt việc A, B, C' }, token);
  console.log('challenge', r.status, r.body.slice(0, 150));
  const car = JSON.parse((await req('GET', '/api/careers', null, token)).body);
  r = await req('POST', `/api/careers/${car[0].id}/explore`, { challengeResponse: 'test', reflection: 'hay' }, token);
  console.log('explore', r.status, r.body.slice(0, 150));
  r = await req('GET', '/api/portfolio', null, token);
  console.log('portfolio', r.status, r.body.slice(0, 150));
  r = await req('POST', '/api/talk/teacher/start', { content: 'Em chào cô', isAnonymous: true }, token);
  console.log('talk teacher', r.status, r.body.slice(0, 150));
  r = await req('POST', '/api/talk/psych/start', { content: 'Em chào cô', isAnonymous: false }, token);
  console.log('talk psych', r.status, r.body.slice(0, 150));
})();
