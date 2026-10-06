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
async function main() {
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  const users = await p.user.findMany({ select: { username: true, role: true, isActive: true } });
  await p.$disconnect();
  let fail = [];
  for (const u of users) {
    const pw = u.username === 'admin' ? 'Admin@123' : 'Demo@123';
    const r = await req('POST', '/api/auth/login', { username: u.username, password: pw });
    if (r.status !== 200) fail.push(`${u.username}(${u.role}) -> ${r.status}`);
  }
  console.log('Total users:', users.length, 'Failed:', fail.length);
  console.log(fail.slice(0, 40).join('\n'));

  const login = await req('POST', '/api/auth/login', { username: '8A101', password: 'Demo@123' });
  const token = JSON.parse(login.body).token;
  for (const path of ['/api/careers', '/api/challenges', '/api/assessments', '/api/assessments/questions', '/api/students/dashboard', '/api/goals', '/api/journal', '/api/mood', '/api/portfolio', '/api/checkin/today']) {
    const r = await req('GET', path, null, token);
    console.log(path, r.status, r.body.slice(0, 120));
  }
}
main();
