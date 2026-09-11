"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
function getClient(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL;const k=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!u||!k)return null;return createClient(u,k)}
type Post={id:string;title:string;category:string;excerpt:string;content:string;cover_gradient:string;cover_image?:string;read_time:string;is_featured?:boolean}
type Settings={badge_text:string;hero_line1:string;hero_line2:string;hero_desc:string;location_text:string;site_name:string;theme:string}
const THEMES=[
  {id:'clay-3d', name:'Clay 3D', desc:'3D tilt + blob bay', color:'#FFF6E8'},
  {id:'clay', name:'Warm Clay', desc:'Am ap', color:'#FFF6E8'},
  {id:'minimal', name:'Minimal', desc:'Trang den', color:'#FFFFFF'},
  {id:'midnight', name:'Midnight', desc:'Den', color:'#0A0A0B'},
  {id:'newspaper', name:'Newspaper', desc:'Bao chi', color:'#F6F1E8'},
]
export default function Admin(){
  const [authed,setAuthed]=useState(false);const [pw,setPw]=useState('');const [posts,setPosts]=useState<Post[]>([]);const [editing,setEditing]=useState<Post|null>(null);const [form,setForm]=useState({title:'',category:'Cong nghe',excerpt:'',content:'',read_time:'5 phut',cover_gradient:'from-amber-200 to-orange-300',cover_image:'',is_featured:false});const [settings,setSettings]=useState<Settings>({badge_text:'Dang song cham',hero_line1:'Song cham,',hero_line2:'lam ky.',hero_desc:'Goc nho',location_text:'DUC NOI',site_name:'Quang Vuong',theme:'clay-3d'});const [showSettings,setShowSettings]=useState(false);const [showTheme,setShowTheme]=useState(false);const [preview,setPreview]=useState('');const [uploading,setUploading]=useState(false)
  useEffect(()=>{if(localStorage.getItem('qv_admin')==='true'){setAuthed(true);load(); loadSettings()}},[])
  const load=async()=>{const sb=getClient();if(!sb)return;const {data}=await sb.from('posts').select('*').order('published_at',{ascending:false});if(data)setPosts(data as Post[])}
  const loadSettings=async()=>{const sb=getClient();if(!sb)return;const {data}=await sb.from('site_settings').select('*').eq('id',1).single();if(data)setSettings({badge_text:data.badge_text,hero_line1:data.hero_line1,hero_line2:data.hero_line2,hero_desc:data.hero_desc,location_text:data.location_text,site_name:data.site_name,theme:data.theme||'clay-3d'})}
  const login=()=>{if(pw==='quangvuong'){localStorage.setItem('qv_admin','true');setAuthed(true);load();loadSettings()}else alert('Sai mk')}
  const handleFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if(!file) return
    const reader=new FileReader()
    reader.onload=()=>{const b64=reader.result as string; setPreview(b64); setForm(f=>({...f,cover_image:b64}))}
    reader.readAsDataURL(file)
    setUploading(true)
    try{
      const sb=getClient()
      if(sb){
        const name=`${Date.now()}-${file.name}`
        const {error}=await sb.storage.from('covers').upload(name,file,{upsert:true})
        if(!error){
          const {data}=sb.storage.from('covers').getPublicUrl(name)
          if(data?.publicUrl){setForm(f=>({...f,cover_image:data.publicUrl})); setPreview(data.publicUrl)}
        }else{alert('Upload that bai: '+error.message)}
      }
    }catch{} setUploading(false)
  }
  const openNew=()=>{setForm({title:'',category:'Cong nghe',excerpt:'',content:'',read_time:'5 phut',cover_gradient:'from-amber-200 to-orange-300',cover_image:'',is_featured:false});setPreview('');setEditing({id:'',title:'',category:'',excerpt:'',content:'',cover_gradient:'',cover_image:'',read_time:''} as any)}
  const openEdit=(p:Post)=>{setForm({title:p.title,category:p.category,excerpt:p.excerpt,content:p.content||'',read_time:p.read_time,cover_gradient:p.cover_gradient||'from-amber-200 to-orange-300',cover_image:p.cover_image||'',is_featured:!!p.is_featured});setPreview(p.cover_image||'');setEditing(p)}
  const save=async()=>{
    const sb=getClient();if(!sb)return
    if(!form.title) return alert('Nhap tieu de')
    let res
    if(editing&&editing.id){res=await sb.from('posts').update({...form}).eq('id',editing.id).select()}
    else{res=await sb.from('posts').insert([{...form,published_at:new Date().toISOString()}]).select()}
    if(res.error){alert('Loi: '+res.error.message); return}
    setEditing(null);setPreview('');load()
  }
  const saveSettings=async()=>{
    const sb=getClient();if(!sb)return
    const {error}=await sb.from('site_settings').upsert({id:1,...settings})
    if(error){alert('Loi: '+error.message); return}
    alert('Da luu theme: '+settings.theme); setShowSettings(false)
  }
  const changeTheme=async(t:string)=>{
    const newSettings={...settings, theme:t}
    setSettings(newSettings)
    const sb=getClient();if(!sb)return
    const {error}=await sb.from('site_settings').upsert({id:1,...newSettings})
    if(error){alert('Loi: '+error.message); return}
    alert('Da doi sang '+t+'! F5 trang chu nhe')
  }
  const del=async(id:string)=>{if(!confirm('Xoa?'))return;const sb=getClient();if(!sb)return;await sb.from('posts').delete().eq('id',id);load()}
  if(!authed)return(<div className="min-h-screen flex items-center justify-center bg-[#FFF6E8] p-6"><div className="bg-white rounded-[28px] p-10 w-full max-w-sm shadow"><h1 className="text-3xl font-bold mb-6">Admin v5.1</h1><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Mat khau" className="w-full border rounded-full px-5 py-3 mb-4"/><button onClick={login} className="w-full bg-black text-white rounded-full py-3">Dang nhap</button></div></div>)
  return(
    <main className="min-h-screen bg-[#FFF6E8] p-6">
      <div className="max-w-[1240px] mx-auto flex justify-between items-center mb-8"><div className="flex gap-3 items-center"><div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">QV</div><div><div className="font-bold">Admin v5.1 Fix</div><div className="text-xs opacity-60">{posts.length} bai • {settings.theme}</div></div></div><div className="flex gap-2"><button onClick={()=>setShowTheme(true)} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full px-5 py-2.5 text-sm">Doi Theme</button><button onClick={()=>setShowSettings(true)} className="bg-black text-white rounded-full px-4 py-2 text-sm">Chinh trang chu</button><a href="/" className="border rounded-full px-4 py-2 bg-white text-sm">Xem trang chu</a></div></div>
      <div className="max-w-[1240px] mx-auto mb-8 grid grid-cols-5 gap-3">{THEMES.map(t=>(<button key={t.id} onClick={()=>changeTheme(t.id)} className={`p-4 rounded-[20px] border-2 text-left ${settings.theme===t.id?'border-black bg-white shadow':'border-black/10 bg-white/60'}`}><div className="w-full h-[40px] rounded-[12px] mb-2 border" style={{background:t.color}}></div><div className="font-bold text-sm">{t.name}</div><div className="text-[11px] opacity-60">{t.desc}</div></button>))}</div>
      <div className="max-w-[1240px] mx-auto grid md:grid-cols-3 gap-6">{posts.map(p=>(<div key={p.id} onClick={()=>openEdit(p)} className="bg-white rounded-[28px] p-4 shadow cursor-pointer"><div className="h-[160px] rounded-[16px] bg-gray-100 overflow-hidden">{p.cover_image?<img src={p.cover_image} className="w-full h-full object-cover"/>:<div className={`w-full h-full bg-gradient-to-br ${p.cover_gradient}`}/>}</div><div className="font-bold mt-2">{p.title}</div></div>))}</div>
      {editing && (<div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-[24px] p-6 w-full max-w-lg"><h2 className="font-bold mb-4">{editing.id?'Sua bai':'Bai moi'}</h2><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Tieu de" className="w-full border rounded-xl p-3 mb-2"/><div className="flex gap-2 mb-2"><input value={form.cover_image} onChange={e=>{setForm({...form,cover_image:e.target.value}); setPreview(e.target.value)}} placeholder="Link anh" className="flex-1 border rounded-xl p-3 text-xs"/><label className="px-4 py-3 bg-black text-white rounded-xl text-sm cursor-pointer">{uploading?'...':'Upload'}<input type="file" accept="image/*" className="hidden" onChange={handleFile}/></label></div>{(preview||form.cover_image)&&<img src={preview||form.cover_image} className="rounded-xl mb-3 max-h-[200px] w-full object-cover"/>}<button onClick={save} className="w-full bg-black text-white rounded-full py-3">Luu</button><button onClick={()=>{setEditing(null);setPreview('')}} className="w-full border rounded-full py-3 mt-2">Huy</button></div></div>)}
      {showTheme && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-[24px] p-8 w-full max-w-2xl"><h2 className="font-bold text-2xl mb-6">Doi Theme 1 click</h2><div className="grid grid-cols-2 gap-4">{THEMES.map(t=>(<button key={t.id} onClick={()=>{changeTheme(t.id); setShowTheme(false)}} className={`p-5 rounded-[20px] border-2 ${settings.theme===t.id?'border-black bg-black text-white':'border-black/10'}`}><div className="w-full h-[80px] rounded-[12px] mb-3 border" style={{background:t.color}}></div><div className="font-bold">{t.name}</div></button>))}</div><button onClick={()=>setShowTheme(false)} className="mt-6 w-full border rounded-full py-3">Dong</button></div></div>)}
      {showSettings && (<div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-[24px] p-6 w-full max-w-xl"><h2 className="font-bold mb-4">Chinh trang chu</h2><input value={settings.badge_text} onChange={e=>setSettings({...settings,badge_text:e.target.value})} className="w-full border rounded-xl p-3 mb-2"/><input value={settings.hero_line1} onChange={e=>setSettings({...settings,hero_line1:e.target.value})} className="w-full border rounded-xl p-3 mb-2"/><input value={settings.hero_line2} onChange={e=>setSettings({...settings,hero_line2:e.target.value})} className="w-full border rounded-xl p-3 mb-2"/><textarea value={settings.hero_desc} onChange={e=>setSettings({...settings,hero_desc:e.target.value})} rows={3} className="w-full border rounded-xl p-3 mb-4"/><div className="flex gap-2"><button onClick={saveSettings} className="flex-1 bg-black text-white rounded-full py-3">Luu</button><button onClick={()=>setShowSettings(false)} className="border rounded-full px-6 py-3">Huy</button></div></div></div>)}
    </main>
  )
}
