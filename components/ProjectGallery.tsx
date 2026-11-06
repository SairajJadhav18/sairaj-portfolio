'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {ArrowLeft,ArrowRight,ArrowUpRight,Github,Maximize2,X} from 'lucide-react';
import {projects} from '@/data/content';

const total=projects.length;
const pad=(n:number)=>String(n).padStart(2,'0');

/**
 * Project gallery with native touch swipe, mouse drag-to-scroll with momentum, keyboard arrows,
 * position dots, and a detail sheet (swipe down to close, swipe sideways to change project).
 */
export default function ProjectGallery({reduced}:{reduced:boolean}){
 const track=useRef<HTMLDivElement>(null);
 const [index,setIndex]=useState(0);
 const [sheet,setSheet]=useState<number|null>(null);
 const [sheetOpen,setSheetOpen]=useState(false);
 const [direction,setDirection]=useState(1);
 const opener=useRef<HTMLElement|null>(null);
 const drag=useRef({down:false,moved:false,suppress:false,startX:0,startLeft:0,lastX:0,lastT:0,v:0,id:-1});

 const slides=()=>Array.from(track.current?.querySelectorAll<HTMLElement>('.project-slide')??[]);
 const offsetOf=(el:HTMLElement,slide:HTMLElement)=>{
  const padLeft=parseFloat(getComputedStyle(el).scrollPaddingLeft)||0;
  return el.scrollLeft+slide.getBoundingClientRect().left-el.getBoundingClientRect().left-padLeft;
 };
 const goTo=useCallback((i:number)=>{
  const el=track.current;const list=slides();if(!el||!list.length)return;
  const target=list[Math.max(0,Math.min(list.length-1,i))];
  el.scrollTo({left:offsetOf(el,target),behavior:reduced?'auto':'smooth'});
 },[reduced]);

 // Keep the counter, dots and arrow states in sync with the scroll position.
 useEffect(()=>{
  const el=track.current;if(!el)return;
  let ticking=false;
  const update=()=>{
   ticking=false;
   const list=slides();if(!list.length)return;
   const atEnd=el.scrollLeft+el.clientWidth>=el.scrollWidth-4;
   if(atEnd){setIndex(list.length-1);return;}
   let best=0,dist=Infinity;
   list.forEach((s,i)=>{const d=Math.abs(offsetOf(el,s)-el.scrollLeft);if(d<dist){dist=d;best=i;}});
   setIndex(best);
  };
  const onScroll=()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}};
  el.addEventListener('scroll',onScroll,{passive:true});
  update();
  return()=>el.removeEventListener('scroll',onScroll);
 },[]);

 // Mouse drag-to-scroll with momentum. Touch and pen use the browser's native swipe + snap.
 const onPointerDown=(e:React.PointerEvent<HTMLDivElement>)=>{
  if(e.pointerType!=='mouse'||e.button!==0)return;
  const el=track.current!;
  drag.current={...drag.current,down:true,moved:false,startX:e.clientX,startLeft:el.scrollLeft,lastX:e.clientX,lastT:performance.now(),v:0,id:e.pointerId};
 };
 const onPointerMove=(e:React.PointerEvent<HTMLDivElement>)=>{
  const d=drag.current;if(!d.down||e.pointerId!==d.id)return;
  const el=track.current!;const dx=e.clientX-d.startX;
  if(!d.moved){
   if(Math.abs(dx)<6)return;
   d.moved=true;el.setPointerCapture(e.pointerId);el.classList.add('is-dragging');
  }
  const now=performance.now();const dt=Math.max(1,now-d.lastT);
  d.v=d.v*.6+((e.clientX-d.lastX)/dt)*.4;d.lastX=e.clientX;d.lastT=now;
  el.scrollLeft=d.startLeft-dx;
 };
 const endDrag=(e:React.PointerEvent<HTMLDivElement>)=>{
  const d=drag.current;if(!d.down||e.pointerId!==d.id)return;
  d.down=false;
  const el=track.current!;
  if(!d.moved)return;
  d.suppress=true;window.setTimeout(()=>{d.suppress=false;},60);
  if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);
  const projected=el.scrollLeft-d.v*260;
  const list=slides();let best=0,dist=Infinity;
  list.forEach((s,i)=>{const dd=Math.abs(offsetOf(el,s)-projected);if(dd<dist){dist=dd;best=i;}});
  goTo(best);
  let done=false;
  const finish=()=>{if(done)return;done=true;el.classList.remove('is-dragging');el.removeEventListener('scrollend',finish);};
  el.addEventListener('scrollend',finish);
  window.setTimeout(finish,700);
 };

 const onKeyDown=(e:React.KeyboardEvent<HTMLDivElement>)=>{
  if(e.target!==e.currentTarget)return;
  if(e.key==='ArrowRight'){e.preventDefault();goTo(index+1);}
  else if(e.key==='ArrowLeft'){e.preventDefault();goTo(index-1);}
  else if(e.key==='Home'){e.preventDefault();goTo(0);}
  else if(e.key==='End'){e.preventDefault();goTo(total-1);}
 };

 const openSheet=(i:number,from?:HTMLElement|null)=>{
  if(drag.current.suppress)return;
  opener.current=from??(document.activeElement as HTMLElement|null);
  setDirection(1);setSheet(i);
  requestAnimationFrame(()=>requestAnimationFrame(()=>setSheetOpen(true)));
 };
 const closeSheet=useCallback(()=>{
  setSheetOpen(false);
  window.setTimeout(()=>{setSheet(null);opener.current?.focus({preventScroll:true});},reduced?0:420);
 },[reduced]);
 const navigate=useCallback((step:number)=>{
  setDirection(step);
  setSheet(s=>{if(s===null)return s;const next=(s+step+total)%total;return next;});
 },[]);
 // Other sections (e.g. the skill network map) can open a project's detail sheet.
 useEffect(()=>{
  const onOpen=(e:Event)=>{const i=(e as CustomEvent<number>).detail;if(typeof i!=='number')return;opener.current=document.activeElement as HTMLElement|null;setDirection(1);setSheet(i);requestAnimationFrame(()=>requestAnimationFrame(()=>setSheetOpen(true)));};
  window.addEventListener('portfolio:open-project',onOpen);
  return()=>window.removeEventListener('portfolio:open-project',onOpen);
 },[]);
 // Keep the gallery aligned with whichever project was last viewed in the sheet.
 useEffect(()=>{if(sheet!==null&&sheetOpen)goTo(sheet);},[sheet,sheetOpen,goTo]);

 return <>
  <div className="project-track" ref={track} role="region" aria-roledescription="carousel" aria-label="Project gallery — use arrow keys, drag, or swipe" tabIndex={0}
   onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={onKeyDown} onDragStart={e=>e.preventDefault()}>
   {projects.map((p,i)=><article className={`project-slide project-tone-${i%4} ${i===index?'is-current':''}`} key={p.title} aria-roledescription="slide" aria-label={`${i+1} of ${total}: ${p.title}`} onClick={e=>{if((e.target as HTMLElement).closest('a'))return;openSheet(i,e.currentTarget.querySelector<HTMLElement>('.project-open'));}}>
    <div className="project-top"><span>{pad(i+1)} / {pad(total)}</span><span>{p.category} · {p.year}</span></div>
    <div className="project-art"><Image src={p.image} alt={`Screenshot of ${p.title} (sample data)`} fill sizes="(max-width: 850px) 90vw, 780px" className="project-image" draggable={false}/><span className="art-stamp">{p.metric}</span></div>
    <div className="project-info"><h3>{p.title}</h3><p>{p.description}</p><div className="project-tags">{p.tech.map(t=><span key={t}>{t}</span>)}</div>
     <button type="button" className="project-open" onClick={e=>{e.stopPropagation();openSheet(i,e.currentTarget);}}>View project details <Maximize2 size={14}/></button>
    </div>
   </article>)}
  </div>
  <div className="gallery-controls">
   <div className="gallery-status"><span className="gallery-count" aria-live="polite">{pad(index+1)} <i>/ {pad(total)}</i></span>
    <div className="gallery-dots" role="tablist" aria-label="Choose a project">{projects.map((p,i)=><button key={p.title} type="button" role="tab" aria-selected={i===index} aria-label={`Go to ${p.title}`} className={i===index?'is-active':''} onClick={()=>goTo(i)}/>)}</div>
   </div>
   <span className="gallery-hint">DRAG, SWIPE OR USE ← → · CLICK A PROJECT FOR DETAILS</span>
   <div className="gallery-buttons"><button type="button" aria-label="Previous project" disabled={index===0} onClick={()=>goTo(index-1)}><ArrowLeft size={20}/></button><button type="button" aria-label="Next project" disabled={index===total-1} onClick={()=>goTo(index+1)}><ArrowRight size={20}/></button></div>
  </div>
  {sheet!==null&&<ProjectSheet index={sheet} open={sheetOpen} direction={direction} onClose={closeSheet} onNavigate={navigate}/>}
 </>;
}

function ProjectSheet({index,open,direction,onClose,onNavigate}:{index:number;open:boolean;direction:number;onClose:()=>void;onNavigate:(step:number)=>void}){
 const p=projects[index];
 const panel=useRef<HTMLDivElement>(null);
 const closeBtn=useRef<HTMLButtonElement>(null);
 const g=useRef({mode:null as null|'x'|'y',x0:0,y0:0,dx:0,dy:0,t0:0,id:-1});

 useEffect(()=>{if(open)closeBtn.current?.focus({preventScroll:true});},[open]);
 useEffect(()=>{
  const html=document.documentElement;const prev=html.style.overflow;html.style.overflow='hidden';
  const onKey=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();onClose();}
   else if(e.key==='ArrowRight'){onNavigate(1);}
   else if(e.key==='ArrowLeft'){onNavigate(-1);}
   else if(e.key==='Tab'&&panel.current){
    const f=Array.from(panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'));
    if(!f.length)return;const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
   }
  };
  document.addEventListener('keydown',onKey);
  return()=>{html.style.overflow=prev;document.removeEventListener('keydown',onKey);};
 },[onClose,onNavigate]);

 // Swipe gestures on the handle/artwork: down closes the sheet, left/right changes project.
 const setDrag=(x:number,y:number)=>{const el=panel.current;if(!el)return;el.style.setProperty('--drag-x',`${x}px`);el.style.setProperty('--drag-y',`${y}px`);};
 const down=(e:React.PointerEvent<HTMLDivElement>)=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  g.current={mode:null,x0:e.clientX,y0:e.clientY,dx:0,dy:0,t0:performance.now(),id:e.pointerId};
 };
 const move=(e:React.PointerEvent<HTMLDivElement>)=>{
  const s=g.current;if(s.id!==e.pointerId)return;
  s.dx=e.clientX-s.x0;s.dy=e.clientY-s.y0;
  if(!s.mode){
   if(Math.hypot(s.dx,s.dy)<8)return;
   s.mode=Math.abs(s.dy)>Math.abs(s.dx)?'y':'x';
   e.currentTarget.setPointerCapture(e.pointerId);
   panel.current?.classList.add('is-dragging');
  }
  if(s.mode==='y')setDrag(0,s.dy>0?s.dy:s.dy*.18);
  else setDrag(s.dx*.55,0);
 };
 const up=(e:React.PointerEvent<HTMLDivElement>)=>{
  const s=g.current;if(s.id!==e.pointerId)return;
  s.id=-1;panel.current?.classList.remove('is-dragging');
  const speed=Math.abs(s.mode==='y'?s.dy:s.dx)/Math.max(1,performance.now()-s.t0);
  if(s.mode==='y'&&s.dy>0&&(s.dy>110||speed>.65)){onClose();setDrag(0,0);return;}
  if(s.mode==='x'&&(Math.abs(s.dx)>70||speed>.5)){onNavigate(s.dx<0?1:-1);}
  setDrag(0,0);
 };
 const toContact=(e:React.MouseEvent)=>{e.preventDefault();onClose();window.setTimeout(()=>document.getElementById('contact')?.scrollIntoView({behavior:'smooth'}),80);};
 const prev=projects[(index-1+total)%total],next=projects[(index+1)%total];

 return <div className={`project-sheet ${open?'is-open':''}`} role="dialog" aria-modal="true" aria-labelledby="project-sheet-title">
  <div className="project-sheet-backdrop" onClick={onClose}/>
  <div className="project-sheet-panel" ref={panel}>
   <div className="project-sheet-grab" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
    <span className="project-sheet-handle" aria-hidden="true"/>
    <div className="project-sheet-top"><span>{pad(index+1)} / {pad(total)} · {p.category} · {p.year}</span><button ref={closeBtn} type="button" className="project-sheet-close" onClick={onClose} onPointerDown={e=>e.stopPropagation()} aria-label="Close project details"><X size={20}/></button></div>
    <div className="project-sheet-media" key={`m-${index}`} style={{'--dir':direction} as React.CSSProperties}>
     <Image src={p.image} alt={`Screenshot of ${p.title} (sample data)`} fill sizes="(max-width: 850px) 100vw, 900px" className="project-sheet-image" draggable={false} priority/>
     <span className="art-stamp">{p.metric}</span>
    </div>
   </div>
   <div className="project-sheet-body" key={`b-${index}`} style={{'--dir':direction} as React.CSSProperties}>
    <h3 id="project-sheet-title">{p.title}</h3>
    <p>{p.description}</p>
    <h4>Tech stack</h4>
    <div className="project-tags">{p.tech.map(t=><span key={t}>{t}</span>)}</div>
    <div className="project-sheet-actions">
     <a href="#contact" className="sheet-btn sheet-btn-primary" onClick={toContact}>Ask me about this project <ArrowRight size={16}/></a>
     <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="sheet-btn">Résumé <ArrowUpRight size={16}/></a>
     <a href="https://github.com/SairajJadhav18" target="_blank" rel="noopener noreferrer" className="sheet-btn"><Github size={16}/> GitHub</a>
    </div>
    <div className="project-sheet-nav">
     <button type="button" onClick={()=>onNavigate(-1)}><ArrowLeft size={16}/><span><small>PREVIOUS</small>{prev.title}</span></button>
     <button type="button" onClick={()=>onNavigate(1)}><span><small>NEXT</small>{next.title}</span><ArrowRight size={16}/></button>
    </div>
    <p className="project-sheet-hint">SWIPE THE IMAGE SIDEWAYS TO BROWSE · SWIPE DOWN OR PRESS ESC TO CLOSE</p>
   </div>
  </div>
 </div>;
}
