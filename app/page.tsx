import { getSupabase } from '@/lib/supabase'
export const dynamic='force-dynamic'; export const revalidate=60
type Post={id:string;title:string;category:string;excerpt:string;cover_gradient:string;cover_image?:string;read_time:string;is_featured?:boolean}
type Settings={badge_text:string;hero_line1:string;hero_line2:string;hero_desc:string;location_text:string;site_name:string}
async function getPosts():Promise<Post[]>{const sb=getSupabase();if(!sb)return[];const {data}=await sb.from('posts').select('*').order('published_at',{ascending:false});return (data as Post[])||[]}
async function getSettings():Promise<Settings>{
  const sb=getSupabase();
  const defaults:Settings={badge_text:'Đang sống chậm tại Đức Nội',hero_line1:'Sống chậm,',hero_line2:'làm kỹ.',hero_desc:'Góc nhỏ ghi lại hành trình tối giản, làm việc sâu và xây hệ thống ghi chú cho người lười nhưng muốn hiệu quả.',location_text:'ĐỨC NỘI • HÀ NỘI • 2026',site_name:'Quang Vương'}
  if(!sb) return defaults
  try{
    const {data}=await sb.from('site_settings').select('*').eq('id',1).single()
    if(data) return {badge_text:data.badge_text||defaults.badge_text,hero_line1:data.hero_line1||defaults.hero_line1,hero_line2:data.hero_line2||defaults.hero_line2,hero_desc:data.hero_desc||defaults.hero_desc,location_text:data.location_text||defaults.location_text,site_name:data.site_name||defaults.site_name}
  }catch{}
  return defaults
}
export default async function Home(){
  const [posts, settings]=await Promise.all([getPosts(), getSettings()])
  const featured=posts.find(p=>p.is_featured)||posts[0]
  const rest=posts.filter(p=>p.id!==featured?.id)
  return(
    <main className="min-h-screen">
      <header className="max-w-[1240px] mx-auto px-6 lg:px-8 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">QV</div><div><div className="font-bold text-xl">{settings.site_name}</div><div className="text-[11px] tracking-widest opacity-60 uppercase">{settings.location_text}</div></div></div>
        <a href="/admin" className="text-sm border rounded-full px-4 py-2 bg-white">Admin</a>
      </header>
      <section className="max-w-[1240px] mx-auto px-6 lg:px-8 pt-4 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm text-[11px] tracking-widest uppercase mb-8"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>{settings.badge_text} • {posts.length} bài viết</div>
        <h1 className="font-bold text-[56px] lg:text-[84px] leading-[0.85] tracking-tight max-w-4xl">{settings.hero_line1}<br/><span className="opacity-60">{settings.hero_line2}</span></h1>
        <p className="mt-8 text-[18px] leading-relaxed opacity-70 max-w-xl">{settings.hero_desc}</p>
      </section>
      <section className="max-w-[1240px] mx-auto px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {featured && <div className="md:col-span-2 bg-white rounded-[32px] p-3"><div className="h-[380px] rounded-[24px] overflow-hidden bg-gradient-to-br from-amber-200 to-orange-300">{featured.cover_image?<img src={featured.cover_image} className="w-full h-full object-cover"/>:null}</div><div className="p-4"><div className="font-bold text-3xl">{featured.title}</div><div className="opacity-60">{featured.excerpt}</div></div></div>}
          {rest.map(p=><div key={p.id} className="bg-white rounded-[28px] p-4"><div className="h-[160px] rounded-[16px] bg-gray-100 overflow-hidden">{p.cover_image?<img src={p.cover_image} className="w-full h-full object-cover"/>:<div className={`w-full h-full bg-gradient-to-br ${p.cover_gradient}`}/>}</div><div className="font-bold mt-2">{p.title}</div></div>)}
        </div>
      </section>
    </main>
  )
}
