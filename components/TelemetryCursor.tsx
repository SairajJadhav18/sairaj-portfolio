'use client';
import {useEffect,useRef,useState} from 'react';

/**
 * Decorative cursor that follows the pointer.
 * Performance notes: no React state updates on pointer move (the old version re-rendered the
 * whole page on every mouse move), frame-rate independent easing, and the animation loop
 * sleeps as soon as the cursor has caught up.
 */
export default function TelemetryCursor(){
 const ref=useRef<HTMLDivElement>(null);
 const [enabled,setEnabled]=useState(false);
 useEffect(()=>{
  const fine=window.matchMedia('(pointer:fine)').matches;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setEnabled(fine&&!reduced);
  document.documentElement.classList.toggle('has-telemetry-cursor',fine&&!reduced);
  return()=>document.documentElement.classList.remove('has-telemetry-cursor');
 },[]);
 useEffect(()=>{
  const el=ref.current;if(!enabled||!el)return;
  let frame=0,running=false,last=0,isActive=false;
  let x=-100,y=-100,tx=-100,ty=-100;
  const tick=(now:number)=>{
   const dt=Math.min(.05,(now-last)/1000);last=now;
   const k=1-Math.exp(-dt*30);
   x+=(tx-x)*k;y+=(ty-y)*k;
   el.style.transform=`translate3d(${x}px,${y}px,0)`;
   if(Math.abs(tx-x)+Math.abs(ty-y)>.15)frame=requestAnimationFrame(tick);else running=false;
  };
  const move=(e:PointerEvent)=>{
   if(e.pointerType!=='mouse')return;
   tx=e.clientX;ty=e.clientY;
   if(x<-50){x=tx;y=ty;}
   el.style.opacity='1';
   const on=!!(e.target as HTMLElement|null)?.closest?.('a,button,input,textarea,label,[role="button"],.project-slide,.diorama-hotspot');
   if(on!==isActive){isActive=on;el.classList.toggle('cursor-active',on);}
   if(!running){running=true;last=performance.now();frame=requestAnimationFrame(tick);}
  };
  const leave=()=>{el.style.opacity='0';};
  window.addEventListener('pointermove',move,{passive:true});
  document.documentElement.addEventListener('pointerleave',leave);
  return()=>{window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave);cancelAnimationFrame(frame);};
 },[enabled]);
 if(!enabled)return null;
 return <div ref={ref} className="custom-cursor race-cursor" aria-hidden="true" style={{opacity:0}}><span className="cursor-crosshair">+</span><span className="cursor-ring"/><span className="cursor-dot"/></div>;
}
