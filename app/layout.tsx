import './globals.css'
import { Be_Vietnam_Pro } from 'next/font/google'
const beVietnam = Be_Vietnam_Pro({ subsets: ['vietnamese','latin'], weight: ['400','500','600','700'], display: 'swap' })
export const metadata={title:'Quang Vương — Sống chậm, làm kỹ.'}
export default function RootLayout({children}:{children:React.ReactNode}){
  return(<html lang="vi"><body className={`${beVietnam.className} bg-[#FFF6E8] text-[#2B2B2B] antialiased`}>{children}</body></html>)
}
