"use client"
import { useRef, useState } from 'react'
export default function TiltCard({children, className, intensity=15}:{children:React.ReactNode, className?:string, intensity?:number}){
  const ref=useRef<HTMLDivElement>(null)
  const [style,setStyle]=useState<React.CSSProperties>({})
  const onMove=(e:React.MouseEvent)=>{
    const el=ref.current; if(!el) return
    const rect=el.getBoundingClientRect()
    const x=e.clientX-rect.left; const y=e.clientY-rect.top
    const cx=rect.width/2; const cy=rect.height/2
    const rotateY=(x-cx)/intensity; const rotateX=(cy-y)/intensity
    setStyle({transform:`perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px) scale(1.02)`, transition:'transform 0.15s ease-out'})
  }
  const onLeave=()=>setStyle({transform:'perspective(1200px) rotateX(0) rotateY(0) translateZ(0) scale(1)', transition:'transform 0.7s cubic-bezier(0.23,1,0.32,1)'})
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={style} className={className}>{children}</div>
}
