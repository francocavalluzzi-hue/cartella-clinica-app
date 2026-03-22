const http = require('http');
const fs = require('fs');
const pages = [
  { path: '/dashboard', out: 'screenshots/dashboard.html' },
  { path: '/patients', out: 'screenshots/patients.html' }
];

if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

function fetchPage(page) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: 'localhost', port: 3001, path: page.path, timeout: 5000 }, (res) => {
      if (res.statusCode >= 400) {
        reject(new Error('Status ' + res.statusCode));
        return;
      }
      const ws = fs.createWriteStream(page.out);
      res.pipe(ws);
      ws.on('finish', () => resolve(page.out));
      ws.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
  });
}

(async () => {
  for (const p of pages) {
    try {
      console.log('Fetching', p.path);
      const out = await fetchPage(p);
      console.log('Saved to', out);
    } catch (e) {
      console.error('Error fetching', p.path, e.message);
    }
  }
})();
