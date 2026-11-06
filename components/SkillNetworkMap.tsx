'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import Image from 'next/image';
import {ArrowLeft,ArrowRight,Maximize2,Minus,Pause,Play,Plus,Scan} from 'lucide-react';
import {projects} from '@/data/content';
import {buildNetwork,territories,skillGroups,type NetNode,type NetEdge} from '@/data/network';

/* ------------------------------------------------------------------ */
/* Layout: deterministic force simulation + topographic contour lines  */
/* ------------------------------------------------------------------ */
const WORLD={w:1600,h:1000};
type P={x:number;y:number};
type EdgeGeo={a:string;b:string;territory:number;ax:number;ay:number;cx:number;cy:number;bx:number;by:number};
type Layout={nodes:NetNode[];edges:EdgeGeo[];pos:Map<string,P>;adj:Map<string,{to:string;edge:number}[]>;contours:Path2D|null;contourSegs:number[];tour:string[]};

function hash(s:string){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967295;}

function computeLayout():Omit<Layout,'contours'>{
 const {nodes,edges}=buildNetwork();
 const idx=new Map(nodes.map((n,i)=>[n.key,i]));
 const x=new Float64Array(nodes.length),y=new Float64Array(nodes.length);
 const ax=new Float64Array(nodes.length),ay=new Float64Array(nodes.length);
 // Hubs sit on a fixed ring around their territory anchor; items settle between the hubs they use.
 territories.forEach(t=>{
  const hs=nodes.filter(n=>n.kind==='hub'&&n.territory===t.id);
  hs.forEach((h,k)=>{const a=k/hs.length*Math.PI*2+t.id*.7+.4;const i=idx.get(h.key)!;const rx=hs.length>2?215:150,ry=hs.length>2?150:110;x[i]=ax[i]=t.anchor[0]+Math.cos(a)*rx;y[i]=ay[i]=t.anchor[1]+Math.sin(a)*ry;});
 });
 nodes.forEach((n,i)=>{
  if(n.kind==='hub')return;
  const linked=edges.filter(e=>e.a===n.key).map(e=>idx.get(e.b)!);
  const cx=linked.reduce((s,j)=>s+x[j],0)/Math.max(1,linked.length),cy=linked.reduce((s,j)=>s+y[j],0)/Math.max(1,linked.length);
  x[i]=cx+(hash(n.key)-.5)*220;y[i]=cy+(hash(n.key+'y')-.5)*180;
 });
 const links=edges.map(e=>[idx.get(e.a)!,idx.get(e.b)!]);
 const radius=nodes.map(n=>n.kind==='project'?64:n.kind==='hub'?58:40);
 const isHub=nodes.map(n=>n.kind==='hub');
 for(let it=0;it<500;it++){
  const cool=1-it/500;
  links.forEach(([i,j])=>{const dx=x[j]-x[i],dy=y[j]-y[i];const d=Math.hypot(dx,dy)||1;const rest=nodes[i].kind==='project'?150:125;const f=(d-rest)/d*.028;x[i]+=dx*f;y[i]+=dy*f;});
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
   if(isHub[i]&&isHub[j])continue;
   // Elliptical spacing: labels run horizontally, so nodes need more room side-to-side.
   const dx=x[j]-x[i],dy=y[j]-y[i];const d=Math.hypot(dx*.5,dy)||.01;const min=(radius[i]+radius[j])*.62;
   if(d<min){const f=(min-d)/d*.45*(.3+cool*.7);const wi=isHub[i]?0:isHub[j]?1:.5,wj=isHub[j]?0:isHub[i]?1:.5;x[i]-=dx*f*wi*1.6;y[i]-=dy*f*wi;x[j]+=dx*f*wj*1.6;y[j]+=dy*f*wj;}
  }
  nodes.forEach((n,i)=>{if(isHub[i]){x[i]=ax[i];y[i]=ay[i];}x[i]=Math.min(WORLD.w-110,Math.max(60,x[i]));y[i]=Math.min(WORLD.h-50,Math.max(50,y[i]));});
 }
 const pos=new Map<string,P>(nodes.map((n,i)=>[n.key,{x:x[i],y:y[i]}]));
 const geo:EdgeGeo[]=edges.map((e:NetEdge)=>{
  const a=pos.get(e.a)!,b=pos.get(e.b)!;const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;const dx=b.x-a.x,dy=b.y-a.y;
  const bend=(hash(e.a+e.b)>.5?1:-1)*.18;
  return {...e,ax:a.x,ay:a.y,bx:b.x,by:b.y,cx:mx-dy*bend,cy:my+dx*bend};
 });
 const adj=new Map<string,{to:string;edge:number}[]>();
 geo.forEach((e,i)=>{(adj.get(e.a)??adj.set(e.a,[]).get(e.a)!).push({to:e.b,edge:i});(adj.get(e.b)??adj.set(e.b,[]).get(e.b)!).push({to:e.a,edge:i});});
 // Topographic contours from a node-density field (marching squares).
 const step=20,gw=Math.ceil(WORLD.w/step)+1,gh=Math.ceil(WORLD.h/step)+1;const field=new Float32Array(gw*gh);
 const s2=2*130*130;
 for(let gy=0;gy<gh;gy++)for(let gx=0;gx<gw;gx++){let v=0;const px=gx*step,py=gy*step;
  nodes.forEach((n,i)=>{const dx=px-x[i],dy=py-y[i];const d2=dx*dx+dy*dy;if(d2<s2*4)v+=(n.kind==='project'?1.3:n.kind==='hub'?1:.75)*Math.exp(-d2/s2);});
  field[gy*gw+gx]=v;}
 const segs:number[]=[];
 [.22,.45,.75,1.1,1.5,1.95,2.45,3].forEach(level=>{
  for(let gy=0;gy<gh-1;gy++)for(let gx=0;gx<gw-1;gx++){
   const v0=field[gy*gw+gx],v1=field[gy*gw+gx+1],v2=field[(gy+1)*gw+gx+1],v3=field[(gy+1)*gw+gx];
   const c=(v0>level?8:0)|(v1>level?4:0)|(v2>level?2:0)|(v3>level?1:0);if(c===0||c===15)continue;
   const X=gx*step,Y=gy*step;const lerp=(a:number,b:number)=>(level-a)/(b-a);
   const top=[X+lerp(v0,v1)*step,Y],right=[X+step,Y+lerp(v1,v2)*step],bottom=[X+lerp(v3,v2)*step,Y+step],left=[X,Y+lerp(v0,v3)*step];
   const L=(p:number[],q:number[])=>segs.push(p[0],p[1],q[0],q[1]);
   switch(c){case 1:case 14:L(left,bottom);break;case 2:case 13:L(bottom,right);break;case 3:case 12:L(left,right);break;case 4:case 11:L(top,right);break;
    case 5:L(left,top);L(bottom,right);break;case 6:case 9:L(top,bottom);break;case 7:case 8:L(left,top);break;case 10:L(left,bottom);L(top,right);break;}
  }
 });
 const tour=[...nodes.filter(n=>n.kind==='project'),...nodes.filter(n=>n.kind==='concept')].map(n=>n.key);
 return {nodes,edges:geo,pos,adj,contourSegs:segs,tour};
}

function route(adj:Layout['adj'],from:string|null,to:string):number[]{
 if(!from||from===to)return [];
 const prev=new Map<string,{node:string;edge:number}>();const q=[from];const seen=new Set([from]);
 while(q.length){const cur=q.shift()!;if(cur===to)break;for(const n of adj.get(cur)??[]){if(seen.has(n.to))continue;seen.add(n.to);prev.set(n.to,{node:cur,edge:n.edge});q.push(n.to);}}
 const path:number[]=[];let cur=to;
 while(cur!==from){const p=prev.get(cur);if(!p)return [];path.unshift(p.edge);cur=p.node;}
 return path;
}

const easeInOut=(t:number)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const quad=(e:EdgeGeo,t:number):P=>{const u=1-t;return {x:u*u*e.ax+2*u*t*e.cx+t*t*e.bx,y:u*u*e.ay+2*u*t*e.cy+t*t*e.by};};

/* ------------------------------------------------------------------ */
export default function SkillNetworkMap(){
 const L=useMemo(()=>computeLayout(),[]);
 const wrap=useRef<HTMLDivElement>(null);
 const canvas=useRef<HTMLCanvasElement>(null);
 const panelRef=useRef<HTMLDivElement>(null);
 const coordRef=useRef<HTMLSpanElement>(null);
 const [selected,setSelected]=useState<string>(L.tour[0]);
 const [playing,setPlaying]=useState(true);
 const [visible,setVisible]=useState(false);
 const st=useRef({
  cam:{x:WORLD.w/2,y:WORLD.h/2,z:1},flight:null as null|{from:{x:number;y:number;z:number};to:{x:number;y:number;z:number};t0:number;dur:number},
  beam:null as null|{segs:{edge:number;fromKey:string}[];t0:number;dur:number},arrive:{key:'',t:-9999},
  hover:null as string|null,selected:L.tour[0],reduced:false,W:0,H:0,dpr:1,portrait:false,
  pointers:new Map<number,P>(),drag:null as null|{x:number;y:number;moved:boolean;camX:number;camY:number;pinch?:{d:number;z:number}},
  packets:[] as {edge:number;t:number;v:number;dir:number}[],
 });
 const nodeByKey=useMemo(()=>new Map(L.nodes.map(n=>[n.key,n])),[L]);
 const contourPath=useMemo(()=>{if(typeof Path2D==='undefined')return null;const p=new Path2D();for(let i=0;i<L.contourSegs.length;i+=4){p.moveTo(L.contourSegs[i],L.contourSegs[i+1]);p.lineTo(L.contourSegs[i+2],L.contourSegs[i+3]);}return p;},[L]);

 // On tall (phone) canvases the map is drawn transposed so it fills the screen instead of a thin strip.
 const baseScale=()=>{const s=st.current;return s.portrait?Math.min(s.W/WORLD.h,s.H/WORLD.w)*1.04:Math.min(s.W/WORLD.w,s.H/WORLD.h)*1.02;};
 const flyTo=useCallback((x:number,y:number,z:number,dur=1150)=>{
  const s=st.current;z=Math.min(4,Math.max(.7,z));
  if(s.reduced){s.cam={x,y,z};s.flight=null;return;}
  s.flight={from:{...s.cam},to:{x,y,z},t0:performance.now(),dur};
 },[]);
 const zoomFor=(n:NetNode)=>n.kind==='project'?1.65:n.kind==='concept'?1.85:1.45;

 // Selection → route beam + camera flight.
 const select=useCallback((key:string,opts:{user?:boolean;reveal?:boolean}={})=>{
  const s=st.current;const from=s.selected;
  if(opts.user)setPlaying(false);
  const r=route(L.adj,from,key);
  let cursor=from;const segs=r.map(edge=>{const e=L.edges[edge];const fromKey=cursor;cursor=e.a===cursor?e.b:e.a;return {edge,fromKey};});
  const dur=Math.min(1700,380+segs.length*330);
  if(!s.reduced&&segs.length)s.beam={segs,t0:performance.now(),dur};
  s.arrive={key,t:performance.now()+(s.reduced?0:dur*.92)};
  s.selected=key;setSelected(key);
  const p=L.pos.get(key)!;flyTo(p.x,p.y,zoomFor(nodeByKey.get(key)!),Math.max(900,dur));
  if(opts.reveal&&window.matchMedia('(max-width:1000px)').matches){
   requestAnimationFrame(()=>{const el=panelRef.current;if(el&&el.getBoundingClientRect().top>window.innerHeight*.7)el.scrollIntoView({behavior:s.reduced?'auto':'smooth',block:'start'});});
  }
 },[L,flyTo,nodeByKey]);
 const step=useCallback((dir:number,user=true)=>{
  const s=st.current;const i=L.tour.indexOf(s.selected);const next=L.tour[((i<0?0:i)+dir+L.tour.length)%L.tour.length];select(next,{user});
 },[L,select]);
 const overview=useCallback(()=>{setPlaying(false);flyTo(WORLD.w/2,WORLD.h/2,1);},[flyTo]);
 const zoomBy=useCallback((f:number)=>{const s=st.current;setPlaying(false);flyTo(s.cam.x,s.cam.y,s.cam.z*f,420);},[flyTo]);

 // Canvas sizing, visibility, input and render loop.
 useEffect(()=>{
  const s=st.current;s.reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(s.reduced)setPlaying(false);
  const cv=canvas.current!,host=wrap.current!;const ctx=cv.getContext('2d')!;
  const resize=()=>{const r=host.getBoundingClientRect();s.dpr=Math.min(2,window.devicePixelRatio||1);s.W=r.width;s.H=r.height;s.portrait=r.height>r.width*1.05;cv.width=Math.round(r.width*s.dpr);cv.height=Math.round(r.height*s.dpr);};
  resize();const ro=new ResizeObserver(resize);ro.observe(host);
  // Initial framing on the first project.
  const first=L.pos.get(s.selected)!;s.cam={x:first.x,y:first.y,z:1.25};
  let raf=0,running=false;
  const io=new IntersectionObserver(([e])=>{setVisible(e.isIntersecting);if(e.isIntersecting&&!document.hidden)start();else stop();},{threshold:.15});
  io.observe(host);
  const onVis=()=>{if(document.hidden)stop();else if(host.getBoundingClientRect().top<window.innerHeight)start();};
  document.addEventListener('visibilitychange',onVis);
  function start(){if(!running){running=true;raf=requestAnimationFrame(frame);}}
  function stop(){running=false;cancelAnimationFrame(raf);}
  const toScreen=(p:P)=>{const sc=baseScale()*s.cam.z;return s.portrait?{x:(p.y-s.cam.y)*sc+s.W/2,y:(p.x-s.cam.x)*sc+s.H/2}:{x:(p.x-s.cam.x)*sc+s.W/2,y:(p.y-s.cam.y)*sc+s.H/2};};
  const toWorld=(x:number,y:number)=>{const sc=baseScale()*s.cam.z;return s.portrait?{x:(y-s.H/2)/sc+s.cam.x,y:(x-s.W/2)/sc+s.cam.y}:{x:(x-s.W/2)/sc+s.cam.x,y:(y-s.H/2)/sc+s.cam.y};};
  const neighbors=(key:string)=>new Set((L.adj.get(key)??[]).map(a=>a.to));
  // Seed ambient packets.
  s.packets=Array.from({length:s.reduced?0:46},(_,i)=>({edge:Math.floor(hash('p'+i)*L.edges.length),t:hash('t'+i),v:.12+hash('v'+i)*.22,dir:hash('d'+i)>.5?1:-1}));
  let last=performance.now();
  function frame(now:number){
   if(!running)return;
   const dt=Math.min(.05,(now-last)/1000);last=now;
   // camera flight with a zoom-out "hop" proportional to distance
   if(s.flight){const f=s.flight;const k=Math.min(1,(now-f.t0)/f.dur);const e=easeInOut(k);
    const dist=Math.hypot(f.to.x-f.from.x,f.to.y-f.from.y);const hop=Math.min(.45,dist/1600);
    s.cam.x=f.from.x+(f.to.x-f.from.x)*e;s.cam.y=f.from.y+(f.to.y-f.from.y)*e;
    s.cam.z=(f.from.z+(f.to.z-f.from.z)*e)*(1-hop*Math.sin(Math.PI*e));if(k>=1)s.flight=null;}
   draw(now,dt);raf=requestAnimationFrame(frame);
  }
  function draw(now:number,dt:number){
   const {W,H,dpr}=s;const sc=baseScale()*s.cam.z;const t=now/1000;
   const sel=s.selected;const nb=neighbors(sel);
   ctx.setTransform(dpr,0,0,dpr,0,0);
   const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a1a20');bg.addColorStop(1,'#0c1418');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
   // world transform
   if(s.portrait)ctx.setTransform(0,sc*dpr,sc*dpr,0,(W/2-s.cam.y*sc)*dpr,(H/2-s.cam.x*sc)*dpr);
   else ctx.setTransform(sc*dpr,0,0,sc*dpr,(W/2-s.cam.x*sc)*dpr,(H/2-s.cam.y*sc)*dpr);
   territories.forEach(tr=>{const g=ctx.createRadialGradient(tr.anchor[0],tr.anchor[1],0,tr.anchor[0],tr.anchor[1],430);g.addColorStop(0,tr.color+'1c');g.addColorStop(1,tr.color+'00');ctx.fillStyle=g;ctx.fillRect(tr.anchor[0]-430,tr.anchor[1]-430,860,860);});
   ctx.lineWidth=1/sc;
   ctx.beginPath();for(let gx=-400;gx<=WORLD.w+400;gx+=50){ctx.moveTo(gx,-400);ctx.lineTo(gx,WORLD.h+400);}for(let gy=-400;gy<=WORLD.h+400;gy+=50){ctx.moveTo(-400,gy);ctx.lineTo(WORLD.w+400,gy);}
   ctx.strokeStyle='rgba(160,220,210,.035)';ctx.stroke();
   ctx.beginPath();for(let gx=-400;gx<=WORLD.w+400;gx+=200){ctx.moveTo(gx,-400);ctx.lineTo(gx,WORLD.h+400);}for(let gy=-400;gy<=WORLD.h+400;gy+=200){ctx.moveTo(-400,gy);ctx.lineTo(WORLD.w+400,gy);}
   ctx.strokeStyle='rgba(160,220,210,.07)';ctx.stroke();
   if(contourPath){ctx.strokeStyle='rgba(150,225,205,.16)';ctx.lineWidth=1.1/sc;ctx.stroke(contourPath);}
   // edges
   L.edges.forEach((e,i)=>{
    const hot=e.a===sel||e.b===sel;const col=territories[e.territory].color;
    ctx.beginPath();ctx.moveTo(e.ax,e.ay);ctx.quadraticCurveTo(e.cx,e.cy,e.bx,e.by);
    if(hot){ctx.strokeStyle=col+'dd';ctx.lineWidth=2.2/sc;ctx.setLineDash([7/sc,9/sc]);ctx.lineDashOffset=-(t*42)/sc*(i%2?1:-1);ctx.stroke();ctx.setLineDash([]);
     ctx.strokeStyle=col+'33';ctx.lineWidth=7/sc;ctx.stroke();}
    else{ctx.strokeStyle=col+(sel?'26':'40');ctx.lineWidth=1.1/sc;ctx.stroke();}
   });
   // screen-space layers
   ctx.setTransform(dpr,0,0,dpr,0,0);
   ctx.globalCompositeOperation='lighter';
   // ambient data packets
   s.packets.forEach(p=>{
    p.t+=p.v*dt*p.dir;if(p.t>1||p.t<0){const pool=Math.random()<.55?(L.adj.get(sel)??[]).map(a=>a.edge):[];p.edge=pool.length?pool[Math.floor(Math.random()*pool.length)]:Math.floor(Math.random()*L.edges.length);p.dir=Math.random()>.5?1:-1;p.t=p.dir>0?0:1;}
    const e=L.edges[p.edge];const w=toScreen(quad(e,p.t));const hot=e.a===sel||e.b===sel;
    ctx.fillStyle=territories[e.territory].color+(hot?'ff':'99');ctx.beginPath();ctx.arc(w.x,w.y,hot?2.6:1.8,0,Math.PI*2);ctx.fill();
   });
   // route beam: a comet that races across every hop between the previous and new selection
   if(s.beam){const b=s.beam;const k=(now-b.t0)/b.dur;
    if(k>=1.25)s.beam=null;else{
     const total=b.segs.length;const head=Math.min(1,k)*total;
     for(let si=0;si<total;si++){
      const seg=b.segs[si];const e=L.edges[seg.edge];const fwd=e.a===seg.fromKey;
      const segHead=Math.min(1,Math.max(0,head-si));if(segHead<=0)continue;
      const fade=k>1?1-(k-1)/.25:1;
      // trail
      ctx.lineCap='round';
      for(let j=0;j<18;j++){
       const a=Math.max(0,segHead-j*.035),bb=Math.max(0,segHead-(j+1)*.035);if(a<=0)break;
       const p1=toScreen(quad(e,fwd?a:1-a)),p2=toScreen(quad(e,fwd?bb:1-bb));
       ctx.strokeStyle=`rgba(210,255,235,${(.9-j*.05)*fade})`;ctx.lineWidth=Math.max(.5,5.5-j*.3);ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();
      }
      // illuminated path behind the comet
      ctx.strokeStyle=`rgba(138,243,189,${.35*fade})`;ctx.lineWidth=3;ctx.beginPath();
      for(let j=0;j<=24;j++){const u=segHead*j/24;const p=toScreen(quad(e,fwd?u:1-u));if(j)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);}ctx.stroke();
      if(segHead<1){const p=toScreen(quad(e,fwd?segHead:1-segHead));const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,26);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.25,'rgba(160,255,210,.6)');g.addColorStop(1,'rgba(138,243,189,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,26,0,Math.PI*2);ctx.fill();}
     }
    }}
   // arrival shockwave + burst
   const age=(now-s.arrive.t)/1000;
   if(age>=0&&age<1.4&&!s.reduced){const p=toScreen(L.pos.get(s.arrive.key)!);
    for(let r=0;r<3;r++){const a=age-r*.14;if(a<0||a>1)continue;ctx.strokeStyle=`rgba(138,243,189,${(1-a)*.8})`;ctx.lineWidth=2.4*(1-a)+.4;ctx.beginPath();ctx.arc(p.x,p.y,14+a*120,0,Math.PI*2);ctx.stroke();}
    if(age<.9){for(let i=0;i<22;i++){const ang=i/22*Math.PI*2+hash(s.arrive.key)*6;const d=10+age*(70+hash(s.arrive.key+i)*80);ctx.fillStyle=`rgba(220,255,240,${1-age/.9})`;ctx.beginPath();ctx.arc(p.x+Math.cos(ang)*d,p.y+Math.sin(ang)*d,1.6,0,Math.PI*2);ctx.fill();}}
   }
   ctx.globalCompositeOperation='source-over';
   // nodes (shapes first), then labels placed greedily to avoid overlaps
   const showConceptLabels=s.cam.z>1.45;
   const rects:{x:number;y:number;w:number;h:number}[]=[];
   const free=(r:{x:number;y:number;w:number;h:number})=>!rects.some(o=>r.x<o.x+o.w&&r.x+r.w>o.x&&r.y<o.y+o.h&&r.y+r.h>o.y)&&r.x>-4&&r.x+r.w<W+4;
   const screen=new Map<string,P>();
   L.nodes.forEach(n=>screen.set(n.key,toScreen(L.pos.get(n.key)!)));
   const onScreen=(p:P)=>p.x>-120&&p.x<W+120&&p.y>-60&&p.y<H+60;
   const alphaFor=(n:NetNode)=>sel&&n.key!==sel&&!nb.has(n.key)&&s.hover!==n.key?.42:1;
   L.nodes.forEach(n=>{
    const p=screen.get(n.key)!;if(!onScreen(p))return;
    const col=territories[n.territory].color;const isSel=n.key===sel,isNb=nb.has(n.key),isHov=s.hover===n.key;
    ctx.globalAlpha=alphaFor(n);
    if(n.kind==='hub'){
     ctx.font='600 11px Inter, Arial, sans-serif';const tw=ctx.measureText(n.label).width;const w=tw+22,h=22;
     ctx.fillStyle=isSel?col:'rgba(9,22,27,.92)';ctx.strokeStyle=col+(isSel||isHov||isNb?'ff':'88');ctx.lineWidth=isSel||isHov?1.8:1;
     ctx.beginPath();ctx.roundRect(p.x-w/2,p.y-h/2,w,h,11);ctx.fill();ctx.stroke();
     ctx.fillStyle=isSel?'#08161b':'#e8f4f0';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n.label,p.x,p.y+.5);
     rects.push({x:p.x-w/2-2,y:p.y-h/2-2,w:w+4,h:h+4});
    }else{
     const r=n.kind==='project'?9:5.5;
     if(n.kind==='project'||isSel||isHov){const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*3.2);g.addColorStop(0,col+'66');g.addColorStop(1,col+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,r*3.2,0,Math.PI*2);ctx.fill();}
     ctx.fillStyle=n.kind==='project'?col:'#0b1a20';ctx.strokeStyle=col;ctx.lineWidth=n.kind==='project'?2:1.6;
     ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
     if(n.kind==='project'){ctx.fillStyle='#08161b';ctx.beginPath();ctx.arc(p.x,p.y,r*.38,0,Math.PI*2);ctx.fill();}
     rects.push({x:p.x-r-2,y:p.y-r-2,w:r*2+4,h:r*2+4});
    }
    if(isSel){
     // targeting reticle
     const R=(n.kind==='hub'?30:n.kind==='project'?24:18)+Math.sin(t*3)*2;ctx.strokeStyle='#ffffff';ctx.lineWidth=1.6;
     for(let c=0;c<4;c++){const a=t*.8+c*Math.PI/2;ctx.beginPath();ctx.arc(p.x,p.y,R,a,a+.6);ctx.stroke();}
     const ph=(t*30)%14;ctx.strokeStyle=col+'aa';ctx.globalAlpha=Math.max(0,1-ph/14);ctx.beginPath();ctx.arc(p.x,p.y,R+8+ph,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
     ctx.strokeStyle='rgba(255,255,255,.16)';ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(p.x,0);ctx.lineTo(p.x,H);ctx.moveTo(0,p.y);ctx.lineTo(W,p.y);ctx.stroke();ctx.setLineDash([]);
    }
    ctx.globalAlpha=1;
   });
   const prio=(n:NetNode)=>n.key===sel?0:s.hover===n.key?1:n.kind==='project'?(nb.has(n.key)?2:3):nb.has(n.key)?4:5;
   L.nodes.filter(n=>n.kind!=='hub').sort((a,b)=>prio(a)-prio(b)).forEach(n=>{
    const p=screen.get(n.key)!;if(!onScreen(p))return;
    const isSel=n.key===sel,isHov=s.hover===n.key,isNb=nb.has(n.key);
    if(!(n.kind==='project'||showConceptLabels||isSel||isHov||isNb))return;
    const r=n.kind==='project'?9:5.5;
    ctx.font=`${n.kind==='project'?'700 12.5px':'500 11px'} Inter, Arial, sans-serif`;ctx.textBaseline='middle';ctx.textAlign='left';
    const full=isSel||isHov;const label=!full&&n.label.length>30?n.label.slice(0,28)+'…':n.label;const tw=ctx.measureText(label).width;const w=tw+10,h=18;
    const options=[{x:p.x+r+6,y:p.y-9},{x:p.x-r-6-w,y:p.y-9},{x:p.x-w/2,y:p.y+r+5},{x:p.x-w/2,y:p.y-r-5-h}];
    let spot=options.find(o=>free({x:o.x,y:o.y,w,h}));
    if(!spot){if(!(isSel||isHov))return;spot=options.find(o=>o.x>-4&&o.x+w<W+4)??{x:Math.min(W-w-4,Math.max(4,p.x-w/2)),y:p.y+r+5};}
    rects.push({x:spot.x,y:spot.y,w,h});
    ctx.globalAlpha=alphaFor(n);
    ctx.fillStyle=isSel?'rgba(8,20,25,.92)':'rgba(8,20,25,.78)';ctx.fillRect(spot.x,spot.y,w,h);
    ctx.fillStyle=n.kind==='project'||isSel?'#ffffff':'#cfe3dd';ctx.fillText(label,spot.x+5,spot.y+h/2+.5);
    ctx.globalAlpha=1;
   });
   // territory labels
   ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='800 11px Inter, Arial, sans-serif';
   territories.forEach(tr=>{const p=toScreen({x:tr.anchor[0],y:tr.anchor[1]+(tr.anchor[1]<500?-235:235)});ctx.fillStyle=tr.color+'b0';ctx.fillText(tr.short.split('').join(String.fromCharCode(8202)),p.x,p.y);});
   // scan line
   if(!s.reduced){const y=((t*80)%(H+200))-100;const g=ctx.createLinearGradient(0,y-60,0,y);g.addColorStop(0,'rgba(138,243,189,0)');g.addColorStop(1,'rgba(138,243,189,.05)');ctx.fillStyle=g;ctx.fillRect(0,y-60,W,60);}
   if(coordRef.current){const c=s.cam;coordRef.current.textContent=`X ${c.x.toFixed(0).padStart(4,'0')} · Y ${c.y.toFixed(0).padStart(4,'0')} · ${(c.z).toFixed(2)}×`;}
  }
  // ---- input ----
  const hit=(x:number,y:number):string|null=>{let best:string|null=null,bd=Infinity;
   for(const n of L.nodes){const p=toScreen(L.pos.get(n.key)!);const d=Math.hypot(p.x-x,p.y-y);const lim=n.kind==='hub'?Math.max(26,n.label.length*3.6):n.kind==='project'?18:13;if(d<lim&&d<bd){bd=d;best=n.key;}}
   return best;};
  const local=(e:PointerEvent)=>{const r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
  const down=(e:PointerEvent)=>{const p=local(e);s.pointers.set(e.pointerId,p);
   if(s.pointers.size===2){const [a,b]=[...s.pointers.values()];s.drag={x:p.x,y:p.y,moved:true,camX:s.cam.x,camY:s.cam.y,pinch:{d:Math.hypot(a.x-b.x,a.y-b.y),z:s.cam.z}};}
   else s.drag={x:p.x,y:p.y,moved:false,camX:s.cam.x,camY:s.cam.y};};
  const move=(e:PointerEvent)=>{const p=local(e);
   if(!s.drag){if(e.pointerType==='mouse'){const h=hit(p.x,p.y);if(h!==s.hover){s.hover=h;cv.style.cursor=h?'pointer':'grab';}}return;}
   s.pointers.set(e.pointerId,p);const d=s.drag;
   if(d.pinch&&s.pointers.size===2){const [a,b]=[...s.pointers.values()];const nd=Math.hypot(a.x-b.x,a.y-b.y);s.flight=null;s.cam.z=Math.min(4,Math.max(.7,d.pinch.z*nd/d.pinch.d));setPlaying(false);return;}
   const dx=p.x-d.x,dy=p.y-d.y;
   if(!d.moved){if(Math.hypot(dx,dy)<7)return;
    // On touch, vertical drags scroll the page (touch-action: pan-y); horizontal drags pan the map.
    if(e.pointerType!=='mouse'&&Math.abs(dy)>Math.abs(dx)){s.drag=null;return;}
    d.moved=true;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';setPlaying(false);}
   const sc=baseScale()*s.cam.z;s.flight=null;if(s.portrait){s.cam.x=d.camX-dy/sc;s.cam.y=d.camY-dx/sc;}else{s.cam.x=d.camX-dx/sc;s.cam.y=d.camY-dy/sc;}};
  const up=(e:PointerEvent)=>{const p=local(e);const d=s.drag;s.pointers.delete(e.pointerId);
   if(s.pointers.size>0){return;}
   s.drag=null;cv.style.cursor=s.hover?'pointer':'grab';
   if(d&&!d.moved){const h=hit(p.x,p.y);if(h)select(h,{user:true,reveal:true});}};
  const wheel=(e:WheelEvent)=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();setPlaying(false);
   const p={x:e.clientX-cv.getBoundingClientRect().left,y:e.clientY-cv.getBoundingClientRect().top};const before=toWorld(p.x,p.y);
   s.flight=null;s.cam.z=Math.min(4,Math.max(.7,s.cam.z*Math.exp(-e.deltaY*.0022)));const after=toWorld(p.x,p.y);s.cam.x+=before.x-after.x;s.cam.y+=before.y-after.y;};
  const leave=()=>{s.hover=null;};
  cv.addEventListener('pointerdown',down);cv.addEventListener('pointermove',move);cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('pointerleave',leave);cv.addEventListener('wheel',wheel,{passive:false});
  return()=>{stop();ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',onVis);
   cv.removeEventListener('pointerdown',down);cv.removeEventListener('pointermove',move);cv.removeEventListener('pointerup',up);cv.removeEventListener('pointercancel',up);cv.removeEventListener('pointerleave',leave);cv.removeEventListener('wheel',wheel);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[L,contourPath]);

 // Guided tour: auto-advances through the network while visible, until the visitor takes over.
 useEffect(()=>{
  if(!playing||!visible)return;
  const id=window.setInterval(()=>step(1,false),5200);
  return()=>window.clearInterval(id);
 },[playing,visible,step]);

 const onKey=(e:React.KeyboardEvent)=>{
  const tag=(e.target as HTMLElement).tagName;if(tag==='INPUT'||tag==='TEXTAREA')return;
  if(e.key==='ArrowRight'){e.preventDefault();step(1);}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}
  else if(e.key==='+'||e.key==='='){zoomBy(1.3);}else if(e.key==='-'){zoomBy(1/1.3);}else if(e.key==='Escape'){overview();}
 };
 // Swipe on the details panel to move through the tour.
 const swipe=useRef({x:0,y:0,id:-1});
 const onPanelDown=(e:React.PointerEvent)=>{if(e.pointerType==='mouse')return;swipe.current={x:e.clientX,y:e.clientY,id:e.pointerId};};
 const onPanelUp=(e:React.PointerEvent)=>{const s=swipe.current;if(s.id!==e.pointerId)return;s.id=-1;const dx=e.clientX-s.x,dy=e.clientY-s.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)step(dx<0?1:-1);};

 const node=nodeByKey.get(selected)!;
 const terr=territories[node.territory];
 const links=(L.adj.get(selected)??[]).map(a=>nodeByKey.get(a.to)!);
 const tourIndex=L.tour.indexOf(selected);
 const openProject=(i:number)=>{window.dispatchEvent(new CustomEvent('portfolio:open-project',{detail:i}));};

 return <section id="expertise" className="netmap-section" aria-labelledby="expertise-heading" onKeyDown={onKey}>
  <div className="netmap-header">
   <div><span className="netmap-kicker">TECHNICAL EXPERTISE / 003</span><h2 id="expertise-heading" className="rise">My skills, <em>connected.</em></h2></div>
   <p>A live map of how my {projects.length} projects and {L.tour.length-projects.length} project concepts link through the skills they share. Tap any node — a signal travels the network to it.</p>
  </div>
  <div className="netmap-layout">
   <div className="netmap-stage">
    <div className="netmap-topbar"><span><span className="netmap-live"/> SKILL NETWORK · {L.nodes.length} NODES · {L.edges.length} LINKS</span><span ref={coordRef} className="netmap-coords" aria-hidden="true"/></div>
    <div className="netmap-canvas" ref={wrap}>
     <canvas ref={canvas} role="img" aria-label="Interactive network map connecting projects and concepts through shared skills. Use the controls or the list below to navigate."/>
     <div className="netmap-controls">
      <button type="button" onClick={()=>zoomBy(1.3)} aria-label="Zoom in"><Plus size={16}/></button>
      <button type="button" onClick={()=>zoomBy(1/1.3)} aria-label="Zoom out"><Minus size={16}/></button>
      <button type="button" onClick={overview} aria-label="Show whole map"><Scan size={16}/></button>
     </div>
     <div className="netmap-tour">
      <button type="button" onClick={()=>step(-1)} aria-label="Previous node"><ArrowLeft size={16}/></button>
      <button type="button" className="netmap-play" onClick={()=>setPlaying(p=>!p)} aria-label={playing?'Pause guided tour':'Play guided tour'}>{playing?<Pause size={15}/>:<Play size={15}/>}<span>{playing?'Touring':'Tour'}</span></button>
      <button type="button" onClick={()=>step(1)} aria-label="Next node"><ArrowRight size={16}/></button>
     </div>
     <span className="netmap-hint">DRAG TO PAN · PINCH OR CTRL + SCROLL TO ZOOM · TAP A NODE</span>
    </div>
    <div className="netmap-legend">{territories.map(t=><button type="button" key={t.id} onClick={()=>{setPlaying(false);flyTo(t.anchor[0],t.anchor[1],1.55);}} style={{'--c':t.color} as React.CSSProperties}><i/>{t.name}</button>)}
     <span className="netmap-legend-key"><i className="k-project"/>Project <i className="k-concept"/>Concept <i className="k-hub"/>Skill</span></div>
   </div>
   <div className="netmap-panel" ref={panelRef} key={selected} onPointerEnter={e=>{if(e.pointerType==='mouse')setPlaying(false);}} onFocus={()=>setPlaying(false)} onPointerDown={onPanelDown} onPointerUp={onPanelUp} style={{'--c':terr.color} as React.CSSProperties}>
    <div className="netmap-panel-top"><span className={`netmap-badge is-${node.kind}`}>{node.kind==='project'?'PROJECT':node.kind==='concept'?'PROJECT CONCEPT':'SKILL HUB'}</span>
     {tourIndex>=0&&<span>{String(tourIndex+1).padStart(2,'0')} / {L.tour.length}</span>}</div>
    {node.kind==='project'&&(()=>{const p=projects[node.projectIndex!];return <>
     <button type="button" className="netmap-media" onClick={()=>openProject(node.projectIndex!)} aria-label={`Open ${p.title} details`}><Image src={p.image} alt={`Screenshot of ${p.title} (sample data)`} fill sizes="(max-width: 1000px) 92vw, 420px"/><span className="art-stamp">{p.metric}</span><span className="netmap-media-open"><Maximize2 size={14}/></span></button>
     <span className="netmap-eyebrow">{p.category} · {p.year}</span><h3>{p.title}</h3><p>{p.description}</p>
     <div className="netmap-tags">{p.tech.map(t=><span key={t}>{t}</span>)}</div>
     <button type="button" className="netmap-cta" onClick={()=>openProject(node.projectIndex!)}>Open full project details <Maximize2 size={14}/></button>
    </>;})()}
    {node.kind==='concept'&&(()=>{const c=node.concept!;return <>
     <div className="netmap-media is-concept"><img src={c.preview} alt={`Interface concept for ${c.title}`} loading="lazy"/><span className="netmap-media-note">CONCEPT PREVIEW · SAMPLE DATA</span></div>
     <span className="netmap-eyebrow">{terr.name}</span><h3>{c.title}</h3><p>{c.summary}</p>
     <div className="netmap-deliverable"><strong>Deliverable</strong>{c.deliverable}</div>
     <div className="netmap-tags">{c.stack.map(t=><span key={t}>{t}</span>)}</div>
     <ul className="netmap-skills">{c.skills.map(s=><li key={s}>{s}</li>)}</ul>
    </>;})()}
    {node.kind==='hub'&&<>
     <span className="netmap-eyebrow">{terr.name}</span><h3>{node.label}</h3>
     <p>Used in {links.filter(l=>l.kind==='project').length} project{links.filter(l=>l.kind==='project').length===1?'':'s'} and {links.filter(l=>l.kind==='concept').length} concept{links.filter(l=>l.kind==='concept').length===1?'':'s'}. Related skills in this area:</p>
     <div className="netmap-tags">{skillGroups[node.territory].items.map(t=><span key={t}>{t}</span>)}</div>
    </>}
    <div className="netmap-links"><h4>{node.kind==='hub'?'Connected work':'Connected through'}</h4>
     <div>{links.sort((a,b)=>(a.kind==='project'?0:1)-(b.kind==='project'?0:1)).map(l=><button type="button" key={l.key} className={`is-${l.kind}`} onClick={()=>select(l.key,{user:true})} style={{'--c':territories[l.territory].color} as React.CSSProperties}><i/>{l.label}</button>)}</div></div>
    <div className="netmap-panel-nav"><button type="button" onClick={()=>step(-1)}><ArrowLeft size={15}/> Previous</button><span>SWIPE · ← →</span><button type="button" onClick={()=>step(1)}>Next <ArrowRight size={15}/></button></div>
   </div>
  </div>
  <details className="netmap-index"><summary>Browse all {L.tour.length} projects and concepts as a list</summary>
   <div>{L.tour.map((k,i)=>{const n=nodeByKey.get(k)!;return <button type="button" key={k} aria-pressed={selected===k} className={selected===k?'is-active':''} onClick={()=>select(k,{user:true,reveal:true})}><span>{String(i+1).padStart(2,'0')}</span>{n.label}<em>{n.kind==='project'?'Project':'Concept'}</em></button>;})}</div>
  </details>
 </section>;
}
