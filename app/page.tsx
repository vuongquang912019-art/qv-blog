import { getSupabase } from '@/lib/supabase'
export const dynamic='force-dynamic'; export const revalidate=60
type Post={id:string;title:string;category:string;excerpt:string;content:string;cover_gradient:string;cover_image?:string;read_time:string;is_featured?:boolean;position?:number;published_at:string}
async function getPosts():Promise<Post[]>{
  const sb=getSupabase(); if(!sb) return []
  try{
    const {data}=await sb.from('posts').select('*').order('published_at',{ascending:false})
    return (data as Post[])||[]
  }catch{return []}
}
export default async function Home(){
  const posts=await getPosts()
  const featured = posts.find(p=>p.is_featured) || posts[0]
  const rest = posts.filter(p=>p.id!==featured?.id)
  return(
    <main className="min-h-screen">
      <header className="max-w-[1240px] mx-auto px-6 lg:px-8 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-serif font-bold text-xl">QV</div>
          <div><div className="font-serif text-xl leading-none font-semibold tracking-tight">Quang Vương</div><div className="text-[11px] tracking-widest opacity-60 uppercase mt-0.5">Đức Nội • Hà Nội • 2026</div></div>
        </div>
        <a href="/admin" className="text-sm opacity-60 hover:opacity-100 border border-black/10 px-4 py-2 rounded-full bg-white/70 backdrop-blur">Admin →</a>
      </header>

      <section className="max-w-[1240px] mx-auto px-6 lg:px-8 pt-4 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm text-[11px] tracking-widest uppercase mb-8"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>Đang sống chậm tại Đức Nội • {posts.length} bài viết</div>
        <h1 className="font-serif text-[56px] lg:text-[84px] leading-[0.85] tracking-[-0.03em] max-w-4xl">Sống chậm,<br/><span className="opacity-60">làm kỹ.</span></h1>
        <p className="mt-8 text-[18px] leading-relaxed opacity-70 max-w-xl">Góc nhỏ ghi lại hành trình tối giản, làm việc sâu và xây hệ thống ghi chú cho người lười nhưng muốn hiệu quả.</p>
      </section>

      <section className="max-w-[1240px] mx-auto px-6 lg:px-8 pb-24">
        {posts.length===0 ? <div className="clay-card p-12 text-center opacity-60">Chưa có bài viết. Vào /admin để đăng bài đầu tiên.</div> : (
          <div className="grid md:grid-cols-3 gap-8">
            {featured && (
              <article className="featured-card md:col-span-2 p-3 md:p-4 group relative overflow-hidden">
                <div className="h-[320px] md:h-[440px] rounded-[24px] overflow-hidden relative bg-gradient-to-br from-amber-200 to-orange-300">
                  {featured.cover_image ? (
                    <img src={featured.cover_image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"/>
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${featured.cover_gradient||'from-amber-200 to-orange-300'}`}/>
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/90 backdrop-blur px-3.5 py-1.5 rounded-full text-[11px] tracking-widest uppercase font-medium">FEATURED • {featured.category}</span>
                    <span className="bg-black text-white px-3 py-1.5 rounded-full text-[11px]">{featured.read_time}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="font-serif text-[32px] md:text-[40px] leading-[0.95] tracking-tight">{featured.title}</h2>
                  <p className="mt-4 opacity-60 text-[15px] leading-relaxed max-w-2xl">{featured.excerpt}</p>
                </div>
              </article>
            )}

            <div className="md:col-span-1 flex flex-col gap-8">
              {rest.slice(0,2).map(p=>(
                <article key={p.id} className="clay-card p-5 group">
                  <div className="h-[160px] rounded-[18px] overflow-hidden mb-4 bg-gradient-to-br from-violet-100 to-purple-200 relative">
                    {p.cover_image ? <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"/> : <div className={`w-full h-full bg-gradient-to-br ${p.cover_gradient}`}/>}
                  </div>
                  <div className="text-[11px] tracking-widest uppercase opacity-50">{p.category} • {p.read_time}</div>
                  <h3 className="font-serif text-[19px] leading-tight mt-2">{p.title}</h3>
                  <p className="text-[13px] opacity-60 mt-2 line-clamp-2">{p.excerpt}</p>
                </article>
              ))}
            </div>

            {rest.slice(2).map(p=>(
              <article key={p.id} className="clay-card p-6 group">
                <div className="h-[190px] rounded-[20px] overflow-hidden mb-5 bg-gradient-to-br from-emerald-100 to-teal-200 relative">
                  {p.cover_image ? <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"/> : <div className={`w-full h-full bg-gradient-to-br ${p.cover_gradient}`}/>}
                </div>
                <div className="text-[11px] tracking-widest uppercase opacity-50 mb-2">{p.category} • {p.read_time}</div>
                <h3 className="font-serif text-[21px] leading-tight">{p.title}</h3>
                <p className="mt-2 text-[14px] opacity-60 line-clamp-3">{p.excerpt}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="max-w-[1240px] mx-auto px-6 lg:px-8 py-12 border-t border-black/10 flex justify-between text-sm opacity-50"><div>© 2026 Quang Vương</div><div>Sống chậm, làm kỹ.</div></footer>
    </main>
  )
}
