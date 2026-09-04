"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function AdminLogout(){
  const router=useRouter();const [pending,setPending]=useState(false);const [error,setError]=useState(false);
  return <div><button disabled={pending} className="underline disabled:opacity-50" onClick={async()=>{
    setPending(true);setError(false);
    try{const response=await fetch("/api/auth/logout",{method:"POST"});if(!response.ok)throw new Error();router.replace("/admin/login");router.refresh();}
    catch{setError(true);}finally{setPending(false);}
  }}>{pending?"Signing out…":"Sign out"}</button>{error&&<span role="alert"> Sign out failed. Retry.</span>}</div>;
}
