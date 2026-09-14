import { env } from 'cloudflare:workers';
const reply=(body:object,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin && origin!==new URL(request.url).origin)return reply({error:'Please submit this form from the GrayMatter website.'},403);
 if(Number(request.headers.get('content-length')||0)>12000)return reply({error:'Your inquiry is too long.'},413);
 if(!request.headers.get('content-type')?.includes('application/json'))return reply({error:'Unsupported request format.'},415);
 try{
 const raw=await request.text();if(raw.length>12000)return reply({error:'Your inquiry is too long.'},413);
 let data;try{data=JSON.parse(raw)}catch{return reply({error:'Please check the form and try again.'},400)}
 if(!data||typeof data!=='object')return reply({error:'Please complete the form.'},400);
 if(data.website)return reply({error:'Unable to accept this submission.'},400);
 const {name,email,company,size,workflow,consent}=data;
 if(typeof name!=='string'||name.trim().length<2||name.length>100||typeof email!=='string'||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof company!=='string'||company.trim().length<2||company.length>160||!['1–24','25–50','51–100','101–300','301+'].includes(size)||typeof workflow!=='string'||workflow.trim().length<10||workflow.length>2000||consent!==true)return reply({error:'Please enter your name, a valid email, firm, team size and a brief workflow description, and agree to be contacted.'},400);
 if(!env.DB)return reply({error:'Inquiries are temporarily unavailable. Please try again later.'},503);
 const normalized=email.trim().toLowerCase(),now=Date.now();
 const recent=await env.DB.prepare('SELECT id FROM inquiries WHERE email = ? AND created_at > ? LIMIT 1').bind(normalized,now-600000).first<{id:string}>();
 if(recent)return reply({reference:recent.id});
 const id='GM-'+crypto.randomUUID().slice(0,8).toUpperCase();
 await env.DB.prepare('INSERT INTO inquiries (id,name,email,company,size,workflow,consent,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,name.trim(),normalized,company.trim(),size,workflow.trim(),1,now).run();
 return reply({reference:id},201);
 }catch{return reply({error:'Your inquiry could not be saved. Please try again.'},503)}
}
