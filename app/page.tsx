import { getSupabase } from '@/lib/supabase'
export const revalidate = 60
export const dynamic = 'force-dynamic'
type Post = { id: string; title: string; category: string; excerpt: string; cover_gradient?: string; read_time: string }
async function getPosts(): Promise<Post[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  try {
    const { data } = await supabase.from('posts').select('*').order('published_at', { ascending: false })
    return (data as Post[]) || []
  } catch { return [] }
}
export default async function Home() {
  const posts = await getPosts()
  return (<main className="min-h-screen p-6 max-w-6xl mx-auto"><h1 className="text-4xl">Quang Vuong - Song cham, lam ky</h1><p className="mt-4">Posts: {posts.length}</p>{posts.length===0 && <div className="mt-4 p-4 bg-amber-100 rounded">Chua co ENV Supabase - them ENV trong Vercel Settings roi Redeploy</div>}<div className="grid md:grid-cols-3 gap-4 mt-8">{posts.map(p=>(<div key={p.id} className="p-4 bg-white rounded shadow"><div>{p.category} - {p.read_time}</div><div className="font-bold">{p.title}</div></div>))}</div></main>)
}
