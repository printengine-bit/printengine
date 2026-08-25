import { spawn } from "node:child_process";
import path from "node:path";

function run(command,args){
  return new Promise((resolve,reject)=>{
    const child=spawn(command,args,{stdio:"inherit",env:process.env});
    child.once("error",reject);child.once("exit",code=>code===0?resolve():reject(new Error(`${command} exited with code ${code}`)));
  });
}

if(process.env.DATABASE_URL){
  const tsx=path.join(process.cwd(),"node_modules","tsx","dist","cli.mjs");
  await run(process.execPath,[tsx,"scripts/migrate.ts"]);
}else{
  console.warn("DATABASE_URL is not configured; starting storefront with commerce features disabled.");
}

const next=path.join(process.cwd(),"node_modules","next","dist","bin","next");
const child=spawn(process.execPath,[next,"start"],{stdio:"inherit",env:process.env});
child.once("exit",code=>process.exit(code??1));
for(const signal of ["SIGINT","SIGTERM"]){process.on(signal,()=>child.kill(signal));}
