import './globals.css'
export const metadata = { title: 'Quang Vuong Blog', description: 'Blog' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="vi"><body className="bg-[#FFF6E8]">{children}</body></html>)
}
