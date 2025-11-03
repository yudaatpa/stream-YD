const { spawn } = require('child_process');
const processes = new Map();
function startStream(video, server, key) {
  const cmd = spawn('ffmpeg', ['-stream_loop','-1','-i',video,'-c','copy','-f','flv',`${server}/${key}`]);
  processes.set(key, cmd);
  console.log('🎬 Start:', key);
  return cmd;
}
function stopStream(row) {
  const proc = processes.get(row.stream_key);
  if (proc) proc.kill('SIGINT');
  processes.delete(row.stream_key);
  console.log('⛔ Stop:', row.stream_key);
}
module.exports = { startStream, stopStream };
