const axios = require('axios');
async function getViewers(url){
  try{
    const res=await axios.get(url,{headers:{'User-Agent':'Mozilla/5.0'}});
    const m=res.data.match(/([\d,\.]+)\s+watching/);
    if(m)return parseInt(m[1].replace(/[.,]/g,''));
  }catch(e){}
  return 0;
}
module.exports = { getViewers };
