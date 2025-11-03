// scripts/cleanupLogs.js
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(dir)) process.exit(0);
const files = fs.readdirSync(dir);
for(const f of files){
  const p = path.join(dir, f);
  try {
    const s = fs.statSync(p);
    const ageDays = (Date.now() - s.mtimeMs) / (1000*60*60*24);
    if (ageDays > 14) fs.unlinkSync(p);
  } catch {}
}
console.log('Cleanup logs done.');
