"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

type Post = { id: string; title: string; category: string; excerpt: string; content: string; cover_gradient: string; read_time: string }

export default function AdminLikeViewer() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [editing, setEditing] = useState<Post | null>(null)
  const [form, setForm] = useState({ title: '', category: 'Công nghệ', excerpt: '', content: '', read_time: '5 phút', cover_gradient: 'from-amber-200 to-orange-300' })

  useEffect(() => {
    if (localStorage.getItem('qv_admin') === 'true') {
      setAuthed(true)
      load()
    }
  }, [])

  const load = async () => {
    const sb = getClient()
    if (!sb) return
    const { data } = await sb.from('posts').select('*').order('published_at', { ascending: false })
    if (data) setPosts(data as Post[])
  }

  const login = () => {
    if (pw === 'quangvuong') {
      localStorage.setItem('qv_admin', 'true')
      setAuthed(true)
      load()
    } else alert('Sai mật khẩu')
  }

  const openNew = () => {
    setForm({ title: '', category: 'Công nghệ', excerpt: '', content: '', read_time: '5 phút', cover_gradient: 'from-amber-200 to-orange-300' })
    setEditing({ id: '', title: '', category: '', excerpt: '', content: '', cover_gradient: '', read_time: '' } as any)
  }

  const openEdit = (p: Post) => {
    setForm({ title: p.title, category: p.category, excerpt: p.excerpt, content: p.content || '', read_time: p.read_time, cover_gradient: p.cover_gradient })
    setEditing(p)
  }

  const save = async () => {
    const sb = getClient()
    if (!sb) return alert('Chưa có ENV')
    if (!form.title) return alert('Nhập tiêu đề')
    if (editing && editing.id) {
      await sb.from('posts').update(form).eq('id', editing.id)
    } else {
      await sb.from('posts').insert([{ ...form, published_at: new Date().toISOString() }])
    }
    setEditing(null)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Xóa bài này?')) return
    const sb = getClient()
    if (!sb) return
    await sb.from('posts').delete().eq('id', id)
    load()
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6E8] p-6">
        <div className="bg-white rounded-[28px] shadow-[8px_8px_24px_rgba(0,0,0,0.07)] p-10 w-full max-w-sm">
          <h1 className="font-serif text-3xl mb-2">Admin</h1>
          <p className="text-sm opacity-60 mb-6">Quang Vương Blog</p>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Mật khẩu" className="w-full border border-black/10 rounded-full px-5 py-3.5 mb-4 outline-none" onKeyDown={e=>e.key==='Enter' && login()} />
          <button onClick={login} className="w-full bg-black text-white rounded-full py-3.5 font-medium">Đăng nhập</button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#FFF6E8]">
      {/* Header y hệt trang người xem */}
      <header className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-serif font-bold text-xl">QV</div>
          <div>
            <div className="font-serif text-xl leading-none font-semibold tracking-tight">Quang Vương • Admin</div>
            <div className="text-[11px] tracking-widest opacity-60 uppercase mt-0.5">Chế độ chỉnh sửa • {posts.length} bài</div>
          </div>
        </div>
        <div className="flex gap-3">
          <a href="/" className="text-sm border border-black/10 rounded-full px-4 py-2 hover:bg-black hover:text-white transition-colors">Xem trang chủ</a>
          <button onClick={() => { localStorage.removeItem('qv_admin'); setAuthed(false) }} className="text-sm opacity-60">Đăng xuất</button>
        </div>
      </header>

      <section className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-4 pb-12">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-[48px] lg:text-[64px] leading-[0.9]">Sống chậm,<br/><span className="opacity-60">làm kỹ.</span> <span className="text-[14px] ml-4 font-sans opacity-40 align-middle">— đang sửa</span></h1>
          <button onClick={openNew} className="bg-black text-white rounded-full px-6 py-3 text-sm font-medium hover:opacity-90">+ Thêm bài mới</button>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 lg:px-8 pb-24">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="font-serif text-4xl">Bài viết mới <span className="text-sm opacity-40 ml-2 font-sans">— bấm vào card để sửa</span></h2>
          <span className="text-sm opacity-50">{posts.length} bài</span>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card thêm mới kiểu dashed */}
          <button onClick={openNew} className="bg-white/60 rounded-[28px] border-2 border-dashed border-black/15 p-6 h-[340px] flex flex-col items-center justify-center hover:bg-white hover:border-black/30 transition-all group">
            <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center text-2xl group-hover:bg-black group-hover:text-white transition-colors">+</div>
            <div className="mt-4 font-medium">Thêm bài mới</div>
            <div className="text-sm opacity-50 mt-1">Tạo bài viết mới</div>
          </button>

          {posts.map(p => (
            <article key={p.id} className="bg-white rounded-[28px] border border-white/60 shadow-[8px_8px_24px_rgba(0,0,0,0.07)] p-6 group relative hover:shadow-[12px_12px_32px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all">
              {/* Nút sửa xóa hiện khi hover */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[12px] hover:opacity-80">✎</button>
                <button onClick={() => del(p.id)} className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-[12px] hover:opacity-80">✕</button>
              </div>

              <div className={`h-[180px] rounded-[20px] mb-6 bg-gradient-to-br ${p.cover_gradient} relative overflow-hidden`}>
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">{p.category}</div>
              </div>
              <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase opacity-50 mb-3">
                <span>{p.category}</span>
                <span>•</span>
                <span>{p.read_time}</span>
              </div>
              <h3 className="font-serif text-[22px] leading-tight">{p.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed opacity-60 line-clamp-3">{p.excerpt}</p>
              <button onClick={() => openEdit(p)} className="mt-4 text-sm underline opacity-60 hover:opacity-100">Bấm để sửa →</button>
            </article>
          ))}
        </div>
      </section>

      {/* Modal chỉnh sửa y hệt phong cách clay */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFF6E8] rounded-[28px] p-2 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-auto">
            <div className="bg-white rounded-[24px] p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl">{editing.id ? 'Sửa bài viết' : 'Bài viết mới'}</h2>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center">✕</button>
              </div>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Tiêu đề" className="w-full border border-black/10 rounded-xl px-4 py-3 mb-3 text-[15px] font-serif" />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border border-black/10 rounded-xl px-4 py-3 text-sm"><option>Công nghệ</option><option>Đời sống</option><option>Setup</option><option>Ghi chú</option></select>
                <input value={form.read_time} onChange={e => setForm({ ...form, read_time: e.target.value })} placeholder="5 phút" className="border border-black/10 rounded-xl px-4 py-3 text-sm" />
              </div>
              <input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Mô tả ngắn (hiển thị trên card)" className="w-full border border-black/10 rounded-xl px-4 py-3 mb-3 text-sm" />
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Nội dung chi tiết..." rows={8} className="w-full border border-black/10 rounded-xl px-4 py-3 mb-3 text-sm" />
              <select value={form.cover_gradient} onChange={e => setForm({ ...form, cover_gradient: e.target.value })} className="w-full border border-black/10 rounded-xl px-4 py-3 mb-6 text-sm">
                <option value="from-amber-200 to-orange-300">Amber → Orange</option>
                <option value="from-blue-200 to-cyan-300">Blue → Cyan</option>
                <option value="from-violet-200 to-purple-300">Violet → Purple</option>
                <option value="from-emerald-200 to-teal-300">Emerald → Teal</option>
                <option value="from-rose-200 to-pink-300">Rose → Pink</option>
              </select>
              <div className="flex gap-3">
                <button onClick={save} className="flex-1 bg-black text-white rounded-full py-3.5 font-medium">{editing.id ? 'Cập nhật' : 'Đăng bài'}</button>
                <button onClick={() => setEditing(null)} className="px-6 border border-black/10 rounded-full py-3.5">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
