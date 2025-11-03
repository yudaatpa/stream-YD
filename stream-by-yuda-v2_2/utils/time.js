// utils/time.js
const tzOffsetMs = 7 * 60 * 60 * 1000; // Asia/Jakarta (WIB) UTC+7
function fmt(dateStr){
  try{
    const t = new Date(dateStr);
    const local = new Date(t.getTime());
    return local.toISOString().replace('T',' ').slice(0,16);
  }catch(e){ return dateStr; }
}
function nowISO(){
  return new Date(Date.now()).toISOString();
}
module.exports = { fmt, nowISO };
