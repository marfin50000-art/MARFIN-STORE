const {redis,PREFIX}=require('./_redis'); const INITIAL=require('./_products');
module.exports=async(req,res)=>{res.setHeader('Cache-Control','no-store');if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});try{
 const key=PREFIX+'stock'; const pairs=Object.entries(INITIAL);
 for(const [name,value] of pairs) await redis(['HSETNX',key,name,String(value)]);
 const raw=await redis(['HGETALL',key]);const stock={};for(let i=0;i<(raw||[]).length;i+=2)stock[raw[i]]=Number(raw[i+1]);
 res.status(200).json({stock});
 }catch(e){res.status(500).json({error:e.message});}};
   
