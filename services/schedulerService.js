const { getViewers } = require('./viewerService');
const { stopStream } = require('./streamService');

async function monitorStream(stream, db){
  const startTime=Date.now();
  let maxViewers=0, overtime=0;
  const zeroLimit=stream.autostop_h*3600*1000;
  const grace=stream.grace_min*60*1000;
  const maxOver=stream.max_h*3600*1000;

  while(stream.status==='Live'){
    const v=await getViewers(stream.watch_url);
    maxViewers=Math.max(maxViewers,v);
    db.run('UPDATE schedules SET viewers=?,max_viewers=MAX(max_viewers,?) WHERE id=?',[v,v,stream.id]);

    if(Date.now()-startTime>zeroLimit && maxViewers===0){
      stopStream(stream);
      db.run('UPDATE schedules SET status="Stopped (0 viewers)" WHERE id=?',[stream.id]);
      break;
    }

    if(Date.now()>new Date(stream.end).getTime()){
      if(stream.keepalive && v>0){
        if(overtime<maxOver){
          overtime+=grace;
          const newEnd=new Date(Date.now()+grace).toISOString();
          db.run('UPDATE schedules SET end=? WHERE id=?',[newEnd,stream.id]);
        }else{
          stopStream(stream);
          db.run('UPDATE schedules SET status="Stopped (Max overtime)" WHERE id=?',[stream.id]);
          break;
        }
      }else{
        stopStream(stream);
        db.run('UPDATE schedules SET status="Stopped" WHERE id=?',[stream.id]);
        break;
      }
    }
    await new Promise(r=>setTimeout(r,60000));
  }
}
module.exports = { monitorStream };
