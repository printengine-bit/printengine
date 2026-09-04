"use client";
export default function AdminError({retry}:{retry:()=>void}){
  return <main className="mx-auto max-w-xl p-8"><h1 className="text-2xl font-medium">Administration is temporarily unavailable</h1><p className="mt-4">The request could not be completed. Check the database connection and service logs. If you were saving, reload and verify the record before retrying.</p><button className="mt-5 bg-lime px-5 py-3" onClick={()=>retry()}>Reload administration</button></main>;
}
