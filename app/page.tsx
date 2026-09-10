import { getSupabase } from '@/lib/supabase'
export const dynamic='force-dynamic'
type Post={id:string;title:string;category:string;excerpt:string;cover_gradient:string;cover_image?:string;read_time:string;is_featured?:boolean}
async function getPosts():Promise<Post[]>{const s=getSupabase();if(!s)return[];const {data}=await s.from('posts').select('*').order('published_at',{ascending:false});return (data as Post[])||[]}
export default async function Home(){
  const posts=await getPosts()
  const featured=posts.find(p=>p.is_featured)||posts[0]
  const rest=posts.filter(p=>p.id!==featured?.id)
  return(<main className="min-h-screen max-w-[1240px] mx-auto p-8">
    <header className="flex justify-between"><div className="font-serif text-xl">Quang Vương</div><a href="/admin">Admin</a></header>
    <h1 className="font-serif text-6xl mt-8">Sống chậm,<br/>làm kỹ.</h1>
    <div className="grid md:grid-cols-3 gap-6 mt-12">
      {featured && <div className="md:col-span-2 bg-white rounded-[32px] p-3"><div className="h-[380px] rounded-[24px] overflow-hidden bg-gradient-to-br from-amber-200 to-orange-300">{featured.cover_image?<img src={featured.cover_image} className="w-full h-full object-cover"/>:null}</div><div className="p-4"><div className="font-serif text-3xl">{featured.title}</div><div className="opacity-60">{featured.excerpt}</div></div></div>}
      {rest.map(p=><div key={p.id} className="bg-white rounded-[28px] p-5"><div className="h-[160px] rounded-[16px] overflow-hidden bg-gray-100">{p.cover_image?<img src={p.cover_image} className="w-full h-full object-cover"/>:<div className={`w-full h-full bg-gradient-to-br ${p.cover_gradient}`}/>}</div><div className="font-serif text-lg mt-3">{p.title}</div></div>)}
    </div>
  </main>)
}
