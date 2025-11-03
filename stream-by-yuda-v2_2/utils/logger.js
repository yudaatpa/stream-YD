// utils/logger.js
const fs = require('fs');
const path = require('path');
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const logFile = path.join(logDir, 'app.log');
function log(...args){
  const line = `[${new Date().toISOString()}] ` + args.join(' ') + '\n';
  try { fs.appendFileSync(logFile, line); } catch {}
  console.log(...args);
}
module.exports = { log };
