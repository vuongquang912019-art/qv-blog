import { getSupabase } from '@/lib/supabase'
import TiltCard from './components/TiltCard'
export const dynamic='force-dynamic'
type Post={id:string;title:string;category:string;excerpt:string;cover_gradient:string;cover_image?:string;read_time:string;is_featured?:boolean}
type Settings={badge_text:string;hero_line1:string;hero_line2:string;hero_desc:string;location_text:string;site_name:string;theme:string}
async function getPosts():Promise<Post[]>{const sb=getSupabase();if(!sb)return[];const {data}=await sb.from('posts').select('*').order('published_at',{ascending:false});return (data as Post[])||[]}
async function getSettings():Promise<Settings>{const d={badge_text:'Dang song cham',hero_line1:'Song cham,',hero_line2:'lam ky.',hero_desc:'Goc nho ghi lai',location_text:'DUC NOI',site_name:'Quang Vuong',theme:'clay-3d'};const sb=getSupabase();if(!sb)return d;try{const {data}=await sb.from('site_settings').select('*').eq('id',1).single();if(data)return{...d,badge_text:data.badge_text||d.badge_text,hero_line1:data.hero_line1||d.hero_line1,hero_line2:data.hero_line2||d.hero_line2,hero_desc:data.hero_desc||d.hero_desc,location_text:data.location_text||d.location_text,site_name:data.site_name||d.site_name,theme:data.theme||d.theme}}catch{}return d}
export default async function Home(){
  const [posts, settings]=await Promise.all([getPosts(), getSettings()])
  const featured=posts.find(p=>p.is_featured)||posts[0]
  const rest=posts.filter(p=>p.id!==featured?.id)
  return(
    <main className={`min-h-screen theme-${settings.theme} relative`}>
      <header className="max-w-[1240px] mx-auto px-6 py-8 flex justify-between"><div className="flex gap-3 items-center"><div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">QV</div><div><div className="font-bold">{settings.site_name}</div><div className="text-xs opacity-60">{settings.location_text}</div></div></div><a href="/admin" className="border rounded-full px-4 py-2 bg-white text-sm">Admin</a></header>
      <section className="max-w-[1240px] mx-auto px-6 pt-4 pb-12"><div className="inline-flex gap-2 px-4 py-2 rounded-full bg-white text-xs mb-8">{settings.badge_text} • {posts.length} bai</div><h1 className="font-bold text-[56px] leading-[0.85]">{settings.hero_line1}<br/><span className="opacity-60">{settings.hero_line2}</span></h1><p className="mt-6 opacity-70 max-w-xl">{settings.hero_desc}</p></section>
      <section className="max-w-[1240px] mx-auto px-6 pb-24 grid md:grid-cols-3 gap-8">
        {featured && (<TiltCard className="md:col-span-2"><div className="clay-card p-3"><div className="h-[400px] rounded-[24px] bg-amber-200 overflow-hidden">{featured.cover_image?<img src={featured.cover_image} className="w-full h-full object-cover"/>:null}</div><div className="p-4 font-bold text-2xl">{featured.title}</div></div></TiltCard>)}
        {rest.map(p=>(<TiltCard key={p.id}><div className="clay-card p-4"><div className="h-[160px] rounded-[16px] bg-gray-100 overflow-hidden">{p.cover_image?<img src={p.cover_image} className="w-full h-full object-cover"/>:<div className={`w-full h-full bg-gradient-to-br ${p.cover_gradient}`}/>}</div><div className="font-bold mt-2">{p.title}</div></div></TiltCard>))}
      </section>
    </main>
  )
}
