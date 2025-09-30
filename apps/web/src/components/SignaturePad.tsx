import React, { useRef, useEffect } from 'react';
export default function SignaturePad({onChange}:{onChange:(dataUrl:string)=>void}){
  const ref = useRef<HTMLCanvasElement|null>(null);
  useEffect(()=>{
    const c = ref.current!; const ctx = c.getContext('2d')!;
    let drawing=false, prev: [number,number]|null=null;
    const scale = window.devicePixelRatio || 1;
    c.width = 600*scale; c.height = 200*scale; c.style.width='100%'; c.style.height='120px'; ctx.scale(scale,scale);
    ctx.lineWidth = 2; ctx.lineCap='round'; ctx.strokeStyle='#e5e7eb';
    function pos(e: PointerEvent){ const r = c.getBoundingClientRect(); return [e.clientX-r.left, e.clientY-r.top] as [number,number]; }
    function start(e: PointerEvent){ drawing=true; prev=pos(e); c.setPointerCapture(e.pointerId); }
    function move(e: PointerEvent){ if(!drawing) return; const p=pos(e); ctx.beginPath(); ctx.moveTo(prev![0], prev![1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); prev=p; onChange(c.toDataURL('image/png')); }
    function end(){ drawing=false; prev=null; }
    c.addEventListener('pointerdown', start); c.addEventListener('pointermove', move); window.addEventListener('pointerup', end);
    return ()=>{ c.removeEventListener('pointerdown', start); c.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); }
  },[]);
  return <canvas ref={ref}/>
}
