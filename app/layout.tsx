import './globals.css'
export const metadata = { title: 'Quang Vương — Sống chậm, làm kỹ.', description: 'Blog cá nhân' }
export default function RootLayout({ children }: { children: React.ReactNode }){
  return (<html lang="vi"><body className="bg-[#FFF6E8] text-[#2B2B2B] antialiased selection:bg-black selection:text-white">{children}</body></html>)
}
