'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Menu,X} from 'lucide-react';

const links=[
 {id:'about',label:'About'},
 {id:'projects',label:'Projects'},
 {id:'expertise',label:'Skills'},
 {id:'experience',label:'Experience'},
 {id:'contact',label:'Contact'},
];

/** Fixed navigation: always one click from the résumé, hides on scroll-down, returns on scroll-up. */
export default function SiteNav(){
 const [active,setActive]=useState('');
 const [menu,setMenu]=useState(false);
 const [solid,setSolid]=useState(false);
 const [hidden,setHidden]=useState(false);
 const bar=useRef<HTMLDivElement>(null);
 const sheet=useRef<HTMLDivElement>(null);
 const swipe=useRef({y:0,id:-1});

 useEffect(()=>{
  let last=window.scrollY,ticking=false;
  const update=()=>{
   ticking=false;
   const y=window.scrollY;
   const max=document.documentElement.scrollHeight-window.innerHeight;
   if(bar.current)bar.current.style.transform=`scaleX(${max>0?Math.min(1,y/max):0})`;
   setSolid(y>window.innerHeight*.55);
   const delta=y-last;
   if(Math.abs(delta)>8){setHidden(delta>0&&y>window.innerHeight*1.2);last=y;}
  };
  const onScroll=()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}};
  update();
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll);
  return()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);};
 },[]);

 useEffect(()=>{
  const seen=new Map<string,boolean>();
  const io=new IntersectionObserver(entries=>{
   entries.forEach(e=>seen.set(e.target.id,e.isIntersecting));
   const current=links.find(l=>seen.get(l.id));
   setActive(current?current.id:'');
  },{rootMargin:'-45% 0px -50% 0px'});
  const observe=()=>links.forEach(l=>{const el=document.getElementById(l.id);if(el)io.observe(el);});
  observe();
  // Some sections are loaded lazily; observe them once they appear.
  const retry=window.setTimeout(observe,1500);
  return()=>{io.disconnect();window.clearTimeout(retry);};
 },[]);

 useEffect(()=>{
  if(!menu)return;
  const html=document.documentElement;const prev=html.style.overflow;html.style.overflow='hidden';
  const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(false);};
  document.addEventListener('keydown',onKey);
  return()=>{html.style.overflow=prev;document.removeEventListener('keydown',onKey);};
 },[menu]);

 const onSheetDown=(e:React.PointerEvent)=>{swipe.current={y:e.clientY,id:e.pointerId};};
 const onSheetUp=(e:React.PointerEvent)=>{if(swipe.current.id===e.pointerId&&swipe.current.y-e.clientY>70)setMenu(false);swipe.current.id=-1;};

 return <>
  <header className={`site-nav ${solid?'is-solid':''} ${hidden&&!menu?'is-hidden':''}`}>
   <div className="site-nav-progress" ref={bar} aria-hidden="true"/>
   <a href="#top" className="wordmark" aria-label="Sairaj Jadhav — back to top">SJ<span className="star">✳</span></a>
   <nav className="site-nav-links" aria-label="Sections">
    {links.map(l=><a key={l.id} href={`#${l.id}`} className={active===l.id?'is-active':''} aria-current={active===l.id?'location':undefined}>{l.label}</a>)}
   </nav>
   <div className="site-nav-actions">
    <a className="site-nav-resume" href="/resume.pdf" target="_blank" rel="noopener noreferrer">Résumé <ArrowUpRight size={14}/></a>
    <button type="button" className="site-nav-toggle" aria-expanded={menu} aria-controls="mobile-menu" aria-label={menu?'Close menu':'Open menu'} onClick={()=>setMenu(m=>!m)}>{menu?<X size={20}/>:<Menu size={20}/>}</button>
   </div>
  </header>
  <div id="mobile-menu" ref={sheet} className={`mobile-menu ${menu?'is-open':''}`} inert={!menu} onPointerDown={onSheetDown} onPointerUp={onSheetUp} onClick={e=>{if(e.target===e.currentTarget)setMenu(false);}}>
   <nav aria-label="Mobile sections">
    {links.map((l,i)=><a key={l.id} href={`#${l.id}`} style={{'--i':i} as React.CSSProperties} className={active===l.id?'is-active':''} onClick={()=>setMenu(false)}><span>0{i+1}</span>{l.label}</a>)}
    <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" style={{'--i':links.length} as React.CSSProperties} className="mobile-menu-resume" onClick={()=>setMenu(false)}>View résumé <ArrowUpRight size={18}/></a>
   </nav>
   <p className="mobile-menu-hint">SWIPE UP OR TAP OUTSIDE TO CLOSE</p>
  </div>
 </>;
}
