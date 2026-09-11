import './globals.css'
import { Be_Vietnam_Pro } from 'next/font/google'
const beVietnam = Be_Vietnam_Pro({ subsets: ['vietnamese','latin'], weight: ['400','500','600','700'], display: 'swap' })
export const metadata={title:'Quang Vuong'}
export default function RootLayout({children}:{children:React.ReactNode}){
  return(<html lang="vi"><body className={`${beVietnam.className} antialiased`}>{children}</body></html>)
}
