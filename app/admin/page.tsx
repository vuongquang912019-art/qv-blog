"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'Công nghệ', excerpt: '', content: '', read_time: '5 phút', cover_gradient: 'from-amber-200 to-orange-300' })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (localStorage.getItem('qv_admin') === 'true') {
      setAuthed(true)
      loadPosts()
    }
  }, [])

  const login = () => {
    if (password === 'quangvuong') {
      localStorage.setItem('qv_admin', 'true')
      setAuthed(true)
      loadPosts()
    } else alert('Sai mật khẩu')
  }

  const loadPosts = async () => {
    const sb = getClient()
    if (!sb) return
    setLoading(true)
    const { data } = await sb.from('posts').select('*').order('published_at', { ascending: false })
    if (data) setPosts(data)
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.title) return alert('Nhập tiêu đề')
    const sb = getClient()
    if (!sb) return alert('Chưa có ENV')
    if (editingId) {
      await sb.from('posts').update(form).eq('id', editingId)
    } else {
      await sb.from('posts').insert([{ ...form, published_at: new Date().toISOString() }])
    }
    setForm({ title: '', category: 'Công nghệ', excerpt: '', content: '', read_time: '5 phút', cover_gradient: 'from-amber-200 to-orange-300' })
    setEditingId(null)
    loadPosts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa bài này?')) return
    const sb = getClient()
    if (!sb) return
    await sb.from('posts').delete().eq('id', id)
    loadPosts()
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6E8] p-6">
        <div className="clay-card p-10 w-full max-w-sm">
          <h1 className="font-serif text-3xl mb-2">Admin</h1>
          <p className="text-sm opacity-60 mb-6">Quang Vương Blog</p>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu" className="w-full border border-black/10 rounded-full px-5 py-3.5 mb-4 outline-none focus:border-black/30" onKeyDown={e=>e.key==='Enter' && login()} />
          <button onClick={login} className="w-full bg-black text-white rounded-full py-3.5 font-medium">Đăng nhập</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF6E8] p-6 lg:p-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="font-serif text-4xl">Admin — {posts.length} bài</h1>
          <button onClick={() => { localStorage.removeItem('qv_admin'); setAuthed(false) }} className="text-sm opacity-60 hover:opacity-100">Đăng xuất</button>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-[28px] border border-white/60 shadow-[8px_8px_24px_rgba(0,0,0,0.07)] p-6 h-fit sticky top-6">
            <h2 className="font-semibold mb-5">{editingId ? 'Sửa bài' : 'Thêm bài mới'}</h2>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Tiêu đề" className="w-full border border-black/10 rounded-xl px-4 py-3 mb-3 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border border-black/10 rounded-xl px-4 py-3 text-sm">
                <option>Công nghệ</option><option>Đời sống</option><option>Setup</option><option>Ghi chú</option>
              </select>
              <input value={form.read_time} onChange={e => setForm({ ...form, read_time: e.target.value })} placeholder="5 phút" className="border border-black/10 rounded-xl px-4 py-3 text-sm" />
            </div>
            <input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Mô tả ngắn" className="w-full border border-black/10 rounded-xl px-4 py-3 mb-3 text-sm" />
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Nội dung chi tiết..." rows={6} className="w-full border border-black/10 rounded-xl px-4 py-3 mb-3 text-sm" />
            <select value={form.cover_gradient} onChange={e => setForm({ ...form, cover_gradient: e.target.value })} className="w-full border border-black/10 rounded-xl px-4 py-3 mb-4 text-sm">
              <option value="from-amber-200 to-orange-300">Amber → Orange</option>
              <option value="from-blue-200 to-cyan-300">Blue → Cyan</option>
              <option value="from-violet-200 to-purple-300">Violet → Purple</option>
              <option value="from-emerald-200 to-teal-300">Emerald → Teal</option>
              <option value="from-rose-200 to-pink-300">Rose → Pink</option>
            </select>
            <button onClick={handleSave} className="w-full bg-black text-white rounded-full py-3.5 font-medium hover:opacity-90">{editingId ? 'Cập nhật' : 'Đăng bài'}</button>
            {editingId && <button onClick={() => { setEditingId(null); setForm({ title: '', category: 'Công nghệ', excerpt: '', content: '', read_time: '5 phút', cover_gradient: 'from-amber-200 to-orange-300' }) }} className="w-full mt-3 border border-black/10 rounded-full py-3.5 text-sm">Hủy sửa</button>}
          </div>
          <div className="lg:col-span-2 space-y-4">
            {loading && <div className="opacity-50 text-sm">Đang tải...</div>}
            {posts.map(p => (
              <div key={p.id} className="bg-white rounded-[28px] border border-white/60 shadow-[8px_8px_24px_rgba(0,0,0,0.07)] p-5 flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-widest opacity-50 mb-1">{p.category} • {p.read_time}</div>
                  <div className="font-serif text-lg leading-tight">{p.title}</div>
                  <div className="text-sm opacity-60 mt-1 line-clamp-2">{p.excerpt}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setForm({ title: p.title, category: p.category, excerpt: p.excerpt, content: p.content, read_time: p.read_time, cover_gradient: p.cover_gradient }); setEditingId(p.id); window.scrollTo(0,0) }} className="px-4 py-2 rounded-full border border-black/10 text-sm hover:bg-black hover:text-white">Sửa</button>
                  <button onClick={() => handleDelete(p.id)} className="px-4 py-2 rounded-full bg-red-50 text-red-600 text-sm hover:bg-red-100">Xóa</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
