"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

function getClient(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if(!url||!key) return null
  return createClient(url,key)
}

type Post={id:string;title:string;category:string;excerpt:string;content:string;cover_gradient:string;cover_image?:string;read_time:string;is_featured?:boolean}

export default function AdminBeautifulMagazine(){
  const [authed,setAuthed]=useState(false)
  const [pw,setPw]=useState('')
  const [posts,setPosts]=useState<Post[]>([])
  const [layoutMode,setLayoutMode]=useState<'magazine'|'grid'>('magazine')
  const [editing,setEditing]=useState<Post|null>(null)
  const [form,setForm]=useState({title:'',category:'Công nghệ',excerpt:'',content:'',read_time:'5 phút',cover_gradient:'from-amber-200 to-orange-300',cover_image:'',is_featured:false})
  const [uploading,setUploading]=useState(false)

  useEffect(()=>{
    if(localStorage.getItem('qv_admin')==='true'){setAuthed(true); load()}
    const lm=localStorage.getItem('qv_layout') as any
    if(lm) setLayoutMode(lm)
  },[])

  const load=async()=>{
    const sb=getClient(); if(!sb) return
    const {data}=await sb.from('posts').select('*').order('published_at',{ascending:false})
    if(data) setPosts(data as Post[])
  }

  const login=()=>{
    if(pw==='quangvuong'){localStorage.setItem('qv_admin','true'); setAuthed(true); load()} else alert('Sai mật khẩu')
  }

  const handleFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if(!file) return
    setUploading(true)
    try{
      const sb=getClient()
      if(sb){
        const fileName=`${Date.now()}-${file.name.replace(/\s+/g,'-')}`
        const {error}=await sb.storage.from('covers').upload(fileName,file)
        if(!error){
          const {data}=sb.storage.from('covers').getPublicUrl(fileName)
          setForm({...form,cover_image:data.publicUrl})
          setUploading(false)
          return
        }
      }
      const reader=new FileReader()
      reader.onload=()=>{ setForm(f=>({...f,cover_image:reader.result as string})); setUploading(false) }
      reader.readAsDataURL(file)
    }catch{ setUploading(false) }
  }

  const openNew=()=>{
    setForm({title:'',category:'Công nghệ',excerpt:'',content:'',read_time:'5 phút',cover_gradient:'from-amber-200 to-orange-300',cover_image:'',is_featured:false})
    setEditing({id:'',title:'',category:'',excerpt:'',content:'',cover_gradient:'',cover_image:'',read_time:''} as any)
  }
  const openEdit=(p:Post)=>{
    setForm({title:p.title,category:p.category,excerpt:p.excerpt,content:p.content||'',read_time:p.read_time,cover_gradient:p.cover_gradient||'from-amber-200 to-orange-300',cover_image:p.cover_image||'',is_featured:!!p.is_featured})
    setEditing(p)
  }
  const save=async()=>{
    const sb=getClient(); if(!sb) return alert('Chưa có ENV')
    if(!form.title) return alert('Nhập tiêu đề')
    if(editing && editing.id){
      await sb.from('posts').update({...form}).eq('id',editing.id)
      if(form.is_featured){
        for(const p of posts){ if(p.id!==editing.id && p.is_featured){ await sb.from('posts').update({is_featured:false}).eq('id',p.id) } }
      }
    }else{
      await sb.from('posts').insert([{...form,published_at:new Date().toISOString()}])
    }
    setEditing(null); load()
  }
  const del=async(id:string)=>{
    if(!confirm('Xóa bài này?')) return
    const sb=getClient(); if(!sb) return
    await sb.from('posts').delete().eq('id',id); load()
  }
  const toggleFeatured=async(p:Post)=>{
    const sb=getClient(); if(!sb) return
    const newVal=!p.is_featured
    if(newVal){
      for(const other of posts){ if(other.id!==p.id && other.is_featured){ await sb.from('posts').update({is_featured:false}).eq('id',other.id) } }
    }
    await sb.from('posts').update({is_featured:newVal}).eq('id',p.id); load()
  }
  const move=async(id:string,dir:number)=>{
    const idx=posts.findIndex(p=>p.id===id); if(idx<0) return
    const newIdx=idx+dir; if(newIdx<0||newIdx>=posts.length) return
    const newPosts=[...posts]; const [moved]=newPosts.splice(idx,1); newPosts.splice(newIdx,0,moved); setPosts(newPosts)
    const sb=getClient(); if(!sb) return
    for(let i=0;i<newPosts.length;i++){ try{ await sb.from('posts').update({position:i}).eq('id',newPosts[i].id) }catch{} }
  }

  if(!authed){
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6E8] p-6">
        <div className="bg-white rounded-[28px] shadow-[8px_8px_24px_rgba(0,0,0,0.07)] p-10 w-full max-w-sm">
          <h1 className="font-serif text-3xl mb-2">Admin</h1>
          <p className="text-sm opacity-60 mb-6">Quang Vương Blog</p>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Mật khẩu" className="w-full border border-black/10 rounded-full px-5 py-3.5 mb-4 outline-none" onKeyDown={e=>e.key==='Enter' && login()}/>
          <button onClick={login} className="w-full bg-black text-white rounded-full py-3.5 font-medium">Đăng nhập</button>
        </div>
      </div>
    )
  }

  const featured = posts.find(p=>p.is_featured) || posts[0]
  const rest = posts.filter(p=>p.id!==featured?.id)

  return(
    <main className="min-h-screen bg-[#FFF6E8]">
      <header className="max-w-[1240px] mx-auto px-6 lg:px-8 py-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-serif font-bold text-xl">QV</div>
          <div><div className="font-serif text-xl font-semibold tracking-tight">Quang Vương • Admin</div><div className="text-[11px] tracking-widest opacity-60 uppercase">Chỉnh bố cục • {posts.length} bài • {layoutMode}</div></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white rounded-full p-1 shadow-[4px_4px_12px_rgba(0,0,0,0.05)]">
            <button onClick={()=>{setLayoutMode('magazine'); localStorage.setItem('qv_layout','magazine')}} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${layoutMode==='magazine'?'bg-black text-white':'opacity-60 hover:opacity-100'}`}>Tạp chí</button>
            <button onClick={()=>{setLayoutMode('grid'); localStorage.setItem('qv_layout','grid')}} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${layoutMode==='grid'?'bg-black text-white':'opacity-60 hover:opacity-100'}`}>Lưới đều</button>
          </div>
          <a href="/" className="text-sm border border-black/10 rounded-full px-4 py-2 bg-white hover:bg-black hover:text-white transition-colors">Xem trang chủ</a>
          <button onClick={()=>{localStorage.removeItem('qv_admin'); setAuthed(false)}} className="text-sm opacity-60 hover:opacity-100 ml-2">Đăng xuất</button>
        </div>
      </header>

      <section className="max-w-[1240px] mx-auto px-6 lg:px-8 pb-6 flex flex-wrap justify-between items-center gap-4">
        <h1 className="font-serif text-[32px]">Chỉnh bố cục <span className="text-[13px] font-sans opacity-50 ml-2">— bấm ★ để ghim Featured, ↑↓ để đổi thứ tự</span></h1>
        <button onClick={openNew} className="bg-black text-white rounded-full px-6 py-3 text-sm font-medium hover:opacity-90">+ Thêm bài mới</button>
      </section>

      <section className="max-w-[1240px] mx-auto px-6 lg:px-8 pb-24">
        {layoutMode==='magazine' ? (
          <div className="grid md:grid-cols-3 gap-8">
            {featured && (
              <div className="md:col-span-2 bg-white rounded-[32px] border border-white/70 shadow-[8px_8px_24px_rgba(0,0,0,0.07)] p-3 relative group">
                <div className="absolute top-5 right-5 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>toggleFeatured(featured)} className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${featured.is_featured?'bg-yellow-400':'bg-white border border-black/10'}`}>★</button>
                  <button onClick={()=>openEdit(featured)} className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">✎</button>
                  <button onClick={()=>del(featured.id)} className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center">✕</button>
                </div>
                <div className="h-[380px] md:h-[440px] rounded-[24px] overflow-hidden bg-gradient-to-br from-amber-200 to-orange-300">
                  {featured.cover_image ? <img src={featured.cover_image} className="w-full h-full object-cover"/> : <div className={`w-full h-full bg-gradient-to-br ${featured.cover_gradient}`}/>}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3.5 py-1.5 rounded-full text-[11px] tracking-widest uppercase">FEATURED • {featured.category}</div>
                </div>
                <div className="p-5"><div className="font-serif text-[28px] leading-tight">{featured.title}</div><div className="text-sm opacity-60 mt-2 line-clamp-2">{featured.excerpt}</div></div>
              </div>
            )}

            <div className="flex flex-col gap-8">
              <button onClick={openNew} className="bg-white/60 rounded-[28px] border-2 border-dashed border-black/15 h-[160px] flex flex-col items-center justify-center hover:bg-white hover:border-black/30 transition-all group">
                <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center text-2xl group-hover:bg-black group-hover:text-white transition-colors">+</div>
                <div className="mt-3 font-medium text-sm">Thêm bài mới</div>
              </button>
              {rest.slice(0,2).map(p=>(
                <div key={p.id} className="bg-white rounded-[28px] border border-white/70 shadow-[8px_8px_24px_rgba(0,0,0,0.07)] p-4 relative group hover:-translate-y-1 transition-transform">
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={()=>move(p.id,-1)} className="w-7 h-7 rounded-full bg-white border border-black/10 text-xs">↑</button>
                    <button onClick={()=>move(p.id,1)} className="w-7 h-7 rounded-full bg-white border border-black/10 text-xs">↓</button>
                    <button onClick={()=>toggleFeatured(p)} className={`w-7 h-7 rounded-full text-xs ${p.is_featured?'bg-yellow-400':'bg-white border border-black/10'}`}>★</button>
                    <button onClick={()=>openEdit(p)} className="w-7 h-7 rounded-full bg-black text-white text-xs">✎</button>
                    <button onClick={()=>del(p.id)} className="w-7 h-7 rounded-full bg-red-500 text-white text-xs">✕</button>
                  </div>
                  <div className="h-[130px] rounded-[16px] overflow-hidden mb-3 bg-gray-100">{p.cover_image ? <img src={p.cover_image} className="w-full h-full object-cover"/> : <div className={`w-full h-full bg-gradient-to-br ${p.cover_gradient}`}/>}</div>
                  <div className="text-[11px] tracking-widest uppercase opacity-50">{p.category}</div>
                  <div className="font-serif text-[16px] leading-tight mt-1">{p.title}</div>
                </div>
              ))}
            </div>

            {rest.slice(2).map(p=>(
              <div key={p.id} className="bg-white rounded-[28px] border border-white/70 shadow-[8px_8px_24px_rgba(0,0,0,0.07)] p-5 relative group hover:-translate-y-1 transition-transform">
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={()=>move(p.id,-1)} className="w-7 h-7 rounded-full bg-white border text-xs">↑</button>
                  <button onClick={()=>move(p.id,1)} className="w-7 h-7 rounded-full bg-white border text-xs">↓</button>
                  <button onClick={()=>toggleFeatured(p)} className={`w-7 h-7 rounded-full text-xs ${p.is_featured?'bg-yellow-400':'bg-white border'}`}>★</button>
                  <button onClick={()=>openEdit(p)} className="w-7 h-7 rounded-full bg-black text-white text-xs">✎</button>
                  <button onClick={()=>del(p.id)} className="w-7 h-7 rounded-full bg-red-500 text-white text-xs">✕</button>
                </div>
                <div className="h-[180px] rounded-[20px] overflow-hidden mb-4 bg-gray-100">{p.cover_image ? <img src={p.cover_image} className="w-full h-full object-cover"/> : <div className={`w-full h-full bg-gradient-to-br ${p.cover_gradient}`}/>}</div>
                <div className="text-[11px] tracking-widest uppercase opacity-50">{p.category} • {p.read_time}</div>
                <div className="font-serif text-[18px] mt-1 leading-tight">{p.title}</div>
                <div className="text-sm opacity-60 mt-2 line-clamp-2">{p.excerpt}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <button onClick={openNew} className="bg-white/60 rounded-[28px] border-2 border-dashed border-black/15 p-6 h-[340px] flex flex-col items-center justify-center hover:bg-white transition-colors"><div className="w-12 h-12 rounded-full border flex items-center justify-center text-2xl">+</div><div className="mt-3 font-medium">Thêm bài mới</div></button>
            {posts.map(p=>(
              <div key={p.id} className="bg-white rounded-[28px] p-5 shadow-[8px_8px_24px_rgba(0,0,0,0.07)] relative group">
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 z-10">
                  <button onClick={()=>toggleFeatured(p)} className={`w-7 h-7 rounded-full ${p.is_featured?'bg-yellow-400':'bg-white border'}`}>★</button>
                  <button onClick={()=>openEdit(p)} className="w-7 h-7 rounded-full bg-black text-white text-xs">✎</button>
                  <button onClick={()=>del(p.id)} className="w-7 h-7 rounded-full bg-red-500 text-white text-xs">✕</button>
                </div>
                <div className="h-[180px] rounded-[20px] overflow-hidden mb-4 bg-gray-100">{p.cover_image ? <img src={p.cover_image} className="w-full h-full object-cover"/> : <div className={`w-full h-full bg-gradient-to-br ${p.cover_gradient}`}/>}</div>
                <div className="text-[11px] uppercase opacity-50">{p.category}</div><div className="font-serif text-[18px] mt-1">{p.title}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFF6E8] rounded-[28px] p-2 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-auto">
            <div className="bg-white rounded-[24px] p-8">
              <div className="flex justify-between items-center mb-6"><h2 className="font-serif text-2xl">{editing.id?'Sửa bài viết':'Bài viết mới'}</h2><button onClick={()=>setEditing(null)} className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center">✕</button></div>
              <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Tiêu đề" className="w-full border border-black/10 rounded-xl px-4 py-3 mb-3 font-serif text-[18px]"/>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="border border-black/10 rounded-xl px-4 py-3 text-sm"><option>Công nghệ</option><option>Đời sống</option><option>Setup</option><option>Ghi chú</option></select>
                <input value={form.read_time} onChange={e=>setForm({...form,read_time:e.target.value})} placeholder="5 phút" className="border border-black/10 rounded-xl px-4 py-3 text-sm"/>
              </div>
              <input value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} placeholder="Mô tả ngắn" className="w-full border border-black/10 rounded-xl px-4 py-3 mb-3 text-sm"/>
              <textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Nội dung chi tiết..." rows={6} className="w-full border border-black/10 rounded-xl px-4 py-3 mb-3 text-sm"/>
              <div className="mb-3">
                <label className="text-sm font-medium">Ảnh cover (upload hoặc dán link)</label>
                <div className="flex gap-2 mt-2">
                  <input value={form.cover_image} onChange={e=>setForm({...form,cover_image:e.target.value})} placeholder="https://..." className="flex-1 border border-black/10 rounded-xl px-4 py-3 text-sm"/>
                  <label className="px-4 py-3 rounded-xl bg-black text-white text-sm cursor-pointer hover:opacity-90">{uploading?'Đang up...':'Upload'}<input type="file" accept="image/*" className="hidden" onChange={handleFile}/></label>
                </div>
                {form.cover_image && <img src={form.cover_image} className="mt-3 rounded-xl max-h-[200px] w-full object-cover"/>}
              </div>
              <select value={form.cover_gradient} onChange={e=>setForm({...form,cover_gradient:e.target.value})} className="w-full border border-black/10 rounded-xl px-4 py-3 mb-3 text-sm">
                <option value="from-amber-200 to-orange-300">Amber → Orange (fallback)</option>
                <option value="from-blue-200 to-cyan-300">Blue → Cyan</option>
                <option value="from-violet-200 to-purple-300">Violet → Purple</option>
                <option value="from-emerald-200 to-teal-300">Emerald → Teal</option>
                <option value="from-rose-200 to-pink-300">Rose → Pink</option>
              </select>
              <label className="flex items-center gap-2 mb-6 text-sm cursor-pointer"><input type="checkbox" checked={form.is_featured} onChange={e=>setForm({...form,is_featured:e.target.checked})} className="rounded"/> Ghim làm bài Featured to đầu trang</label>
              <div className="flex gap-3"><button onClick={save} className="flex-1 bg-black text-white rounded-full py-3.5 font-medium hover:opacity-90">{editing.id?'Cập nhật':'Đăng bài'}</button><button onClick={()=>setEditing(null)} className="px-6 border border-black/10 rounded-full py-3.5 hover:bg-black/5">Hủy</button></div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
