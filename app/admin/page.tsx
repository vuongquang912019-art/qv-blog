"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
function getClient(){ const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; if(!url||!anon) return null; return createClient(url,anon) }
export default function AdminPage(){
  const [authed,setAuthed]=useState(false); const [pw,setPw]=useState(''); const [posts,setPosts]=useState<any[]>([])
  useEffect(()=>{ if(localStorage.getItem('qv_admin')==='true'){ setAuthed(true); load() } },[])
  const login=()=>{ if(pw==='quangvuong'){ localStorage.setItem('qv_admin','true'); setAuthed(true); load() } else alert('Sai') }
  const load=async()=>{ const sb=getClient(); if(!sb) return; const {data}=await sb.from('posts').select('*'); if(data) setPosts(data) }
  if(!authed) return (<div className="p-8"><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="mk"/><button onClick={login}>Login</button></div>)
  return (<div className="p-6"><h1>Admin - {posts.length} posts</h1><div>{posts.map(p=>(<div key={p.id}>{p.title}</div>))}</div></div>)
}
