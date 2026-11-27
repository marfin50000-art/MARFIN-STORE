const BASE=process.env.UPSTASH_REDIS_REST_URL;
const TOKEN=process.env.UPSTASH_REDIS_REST_TOKEN;
const PREFIX='marfin_store_v1:';
async function redis(command){
 if(!BASE||!TOKEN) throw new Error('Redis belum dikonfigurasi di Vercel');
 const res=await fetch(BASE,{method:'POST',headers:{Authorization:'Bearer '+TOKEN,'Content-Type':'application/json'},body:JSON.stringify(command)});
 const data=await res.json(); if(!res.ok||data.error) throw new Error(data.error||'Redis error'); return data.result;
}
module.exports={redis,PREFIX};
   
