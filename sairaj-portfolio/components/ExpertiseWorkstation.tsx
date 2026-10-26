"use client";
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { ContactShadows, Float, RoundedBox } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import { skills, projects } from '@/data/content';
import { ArrowUpRight, Code2, Database, Cloud, Users, RotateCcw } from 'lucide-react';

type Props = { selected:number; onSelect:(value:number)=>void };
const palette=['#8ee7ca','#ffad81','#b4a4ff','#8bc9ff'];
function Selectable({index,selected,onSelect,position,children}:{index:number;selected:number;onSelect:(i:number)=>void;position:[number,number,number];children:React.ReactNode}){
 const [hovered,setHovered]=useState(false);
 useEffect(() => () => { document.body.style.cursor = ''; }, []);
 const active=selected===index||hovered;
 return <group position={position} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();onSelect(index)}} onPointerOver={e=>{e.stopPropagation();setHovered(true);document.body.style.cursor='pointer'}} onPointerOut={e=>{e.stopPropagation();setHovered(false);document.body.style.cursor=''}}>
  <mesh position={[0,.055,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[index===2?1.65:index===3?2.1:3.1,index===2?2.4:index===3?1.5:2.0]}/><meshBasicMaterial color={palette[index]} transparent opacity={active?.14:.035} depthWrite={false}/></mesh>
  {children}
 </group>
}
function Workstation({selected,onSelect}:Props){
 return <group rotation={[0,-.12,0]}>
  <ambientLight intensity={2.0}/><directionalLight position={[4,10,7]} intensity={2.5} color="#fff0d7"/>
  <pointLight position={[-2,3,-1]} intensity={13} distance={10} color="#ffc48e"/>
  <pointLight position={[2,2,0]} intensity={7} distance={8} color="#88dfc7"/>
  {/* Miniature cutaway room: two visible walls and a parquet floor. */}
  <RoundedBox args={[9.3,.35,7.5]} radius={.08} position={[0,-.38,0]}><meshStandardMaterial color="#b88661" roughness={.95}/></RoundedBox>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.19,0]}><planeGeometry args={[8.9,7.1]}/><meshStandardMaterial color="#e9c8a5"/></mesh>
  {Array.from({length:11},(_,i)=><mesh key={i} position={[-4.1+i*.82,-.178,0]}><boxGeometry args={[.018,.008,7]}/><meshStandardMaterial color="#c28f69"/></mesh>)}
  <mesh position={[0,1.7,-3.55]}><boxGeometry args={[9.3,3.85,.17]}/><meshStandardMaterial color="#f4dfc8"/></mesh>
  <mesh position={[-4.55,1.7,0]}><boxGeometry args={[.17,3.85,7.5]}/><meshStandardMaterial color="#e9d4bd"/></mesh>
  {/* Trim, pinboard and wall art. */}
  <mesh position={[0,-.02,-3.43]}><boxGeometry args={[9.1,.12,.12]}/><meshStandardMaterial color="#a97b60"/></mesh>
  <mesh position={[-4.43,-.02,0]}><boxGeometry args={[.12,.12,7.2]}/><meshStandardMaterial color="#a97b60"/></mesh>
  <mesh position={[-2.35,2.15,-3.42]}><boxGeometry args={[2.6,1.55,.12]}/><meshStandardMaterial color="#b88c6a"/></mesh>
  <mesh position={[-2.35,2.15,-3.33]}><boxGeometry args={[2.35,1.28,.035]}/><meshStandardMaterial color="#e6c8a1"/></mesh>
  {Array.from({length:9},(_,i)=><mesh key={i} position={[-3.2+(i%3)*.85,2.55-Math.floor(i/3)*.43,-3.29]} rotation={[0,0,(i%3-1)*.12]}><boxGeometry args={[.47,.29,.025]}/><meshStandardMaterial color={['#d88c78','#94b8a1','#e9e3c8'][i%3]}/></mesh>)}
  <mesh position={[2.5,2.2,-3.4]}><boxGeometry args={[1.4,1.5,.13]}/><meshStandardMaterial color="#956a53"/></mesh>
  <mesh position={[2.5,2.2,-3.31]}><boxGeometry args={[1.19,1.28,.025]}/><meshStandardMaterial color="#9fbab2"/></mesh>
  <mesh position={[2.5,2.1,-3.28]}><boxGeometry args={[.65,.18,.015]}/><meshStandardMaterial color="#f6e4c5"/></mesh>
  {/* Window on the left wall, with crossbars. */}
  <mesh position={[-4.42,2.05,-.55]}><boxGeometry args={[.10,2.15,1.75]}/><meshStandardMaterial color="#a37d60"/></mesh>
  <mesh position={[-4.34,2.05,-.55]}><boxGeometry args={[.02,1.87,1.48]}/><meshStandardMaterial color="#9dd6d2" emissive="#76b3b4" emissiveIntensity={.16}/></mesh>
  <mesh position={[-4.28,2.05,-.55]}><boxGeometry args={[.06,.09,1.75]}/><meshStandardMaterial color="#fff0d7"/></mesh>
  <mesh position={[-4.28,2.05,-.55]}><boxGeometry args={[.06,2.15,.09]}/><meshStandardMaterial color="#fff0d7"/></mesh>
  {/* Walnut desk and clickable objects arranged as a small isometric room. */}
  <RoundedBox args={[7.3,.27,2.65]} radius={.1} position={[.28,.86,-1.35]}><meshStandardMaterial color="#9b6b4d" roughness={.75}/></RoundedBox>
  {[-2.9,3.3].map(x=><mesh key={x} position={[x,.32,-1.35]}><boxGeometry args={[.18,1.05,2.2]}/><meshStandardMaterial color="#76513d"/></mesh>)}
  <Selectable index={0} selected={selected} onSelect={onSelect} position={[-1.7,1.05,-1.62]}>
   <RoundedBox args={[2.25,.14,1.4]} radius={.09}><meshStandardMaterial color="#253c40"/></RoundedBox>
   <mesh position={[0,.078,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[2.03,1.2]}/><meshBasicMaterial color="#203c43"/></mesh>
   {Array.from({length:6},(_,i)=><mesh key={i} position={[-.26,.09,-.42+i*.16]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[i%2?.96:1.28,.04]}/><meshBasicMaterial color={i%2?'#e9ad8a':'#a5e4bf'}/></mesh>)}
  </Selectable>
  <Selectable index={1} selected={selected} onSelect={onSelect} position={[.8,1.05,-1.62]}>
   <RoundedBox args={[2.25,.14,1.4]} radius={.09}><meshStandardMaterial color="#263c42"/></RoundedBox>
   <mesh position={[0,.078,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[2.03,1.2]}/><meshBasicMaterial color="#23434a"/></mesh>
   {Array.from({length:6},(_,i)=><mesh key={i} position={[-.78+i*.31,.095,.22]}><boxGeometry args={[.19,.014,.22+(i%4)*.17]}/><meshBasicMaterial color={i%2?'#f0a889':'#9ad9bb'}/></mesh>)}
  </Selectable>
  <Selectable index={2} selected={selected} onSelect={onSelect} position={[3.25,.3,1.2]}>
   <RoundedBox args={[1.25,.45,1.85]} radius={.11}><meshStandardMaterial color="#34434a"/></RoundedBox>
   {[-.49,0,.49].map((z,i)=><mesh key={i} position={[0,.245,z]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.21,.048,8,28]}/><meshBasicMaterial color={palette[i]} toneMapped={false}/></mesh>)}
  </Selectable>
  <Selectable index={3} selected={selected} onSelect={onSelect} position={[-.25,.02,1.7]}>
   <RoundedBox args={[1.85,.15,1.3]} radius={.08}><meshStandardMaterial color="#b9c7b9"/></RoundedBox>
   <mesh position={[0,.085,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[1.61,1.06]}/><meshBasicMaterial color="#d7e9d7"/></mesh>
   {[-.46,0,.46].map((x,i)=><mesh key={i} position={[x,.1,-.1]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.14,24]}/><meshBasicMaterial color={palette[i]}/></mesh>)}
  </Selectable>
  {/* Chair, carpet, keyboard, coffee and potted plants. */}
  <mesh position={[0,-.157,1.75]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[4.7,2.45]}/><meshStandardMaterial color="#a8b99c"/></mesh>
  <RoundedBox args={[1.2,.24,.92]} radius={.22} position={[-2.1,.23,1.45]}><meshStandardMaterial color="#d59d7e"/></RoundedBox>
  <RoundedBox args={[1.2,1.1,.18]} radius={.16} position={[-2.1,.75,1.88]}><meshStandardMaterial color="#c6876c"/></RoundedBox>
  <RoundedBox args={[1.75,.1,.43]} radius={.045} position={[-.65,1.08,-.12]}><meshStandardMaterial color="#eee0c9"/></RoundedBox>
  {Array.from({length:9},(_,i)=><mesh key={i} position={[-1.4+i*.18,1.14,-.12]}><boxGeometry args={[.12,.025,.23]}/><meshStandardMaterial color={i%3===0?'#e8a18a':'#f5f0df'}/></mesh>)}
  <mesh position={[2.2,1.1,-.2]}><cylinderGeometry args={[.22,.2,.25,20]}/><meshStandardMaterial color="#f0d8b5"/></mesh>
  <mesh position={[2.2,1.235,-.2]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.17,20]}/><meshBasicMaterial color="#65473d"/></mesh>
  {[[-3.55,2.55],[3.6,-2.75]].map(([x,z],i)=><group key={i} position={[x,0,z]}>
   <mesh position={[0,.25,0]}><cylinderGeometry args={[.37,.25,.5,8]}/><meshStandardMaterial color="#c58b6c"/></mesh>
   {Array.from({length:6},(_,j)=><mesh key={j} position={[Math.cos(j*1.05)*.28,.75+(.12*(j%2)),Math.sin(j*1.05)*.28]} rotation={[0,0,j*.35]}><sphereGeometry args={[.24,8,6]}/><meshStandardMaterial color={j%2?'#628d70':'#86a887'}/></mesh>)}
  </group>)}
  <ContactShadows position={[0,-.17,0]} opacity={.22} scale={13} blur={2.7} far={6}/>
 </group>
}
const icons=[Code2,Database,Cloud,Users];
// Project indices refer to the canonical project list, so preview images, metrics and
// descriptions stay in sync with the main project gallery.
const relatedProjectIndices = [[1,5],[0,2,3],[3,0],[4,1]];
const projectContext = [
 'Applications built using these programming and web technologies',
 'Examples of data pipelines, analytics and machine learning work',
 'Projects using cloud infrastructure and engineering workflows',
 'Projects involving team development and stakeholder collaboration'
];
export default function ExpertiseWorkstation(){
 const [selected,setSelected]=useState(0);
 const Icon=icons[selected];
 return <section id="expertise" className="expertise-workstation" aria-labelledby="expertise-heading">
  <div className="workstation-header"><div><span className="workstation-kicker">TECHNICAL EXPERTISE / 003</span><h2 id="expertise-heading">Explore my <em>workstation.</em></h2></div><p>Explore a cozy isometric developer room. Hover over a highlighted object and click to discover the skills and projects behind it.</p></div>
  <div className="workstation-layout">
   <div className="workstation-stage"><div className="workstation-stage-top"><span><span className="workstation-live"/> INTERACTIVE WORKSTATION</span><span>HOVER · CLICK · EXPLORE</span></div>
    <div className="workstation-canvas" role="img" aria-label="Isometric 3D developer room with two interactive monitors, a PC tower and a collaboration tablet"><Canvas camera={{position:[10,10,12],fov:43}} dpr={[1,1.7]} gl={{antialias:true}}><Suspense fallback={null}><Workstation selected={selected} onSelect={setSelected}/></Suspense></Canvas></div>
    <div className="workstation-controls" aria-label="Choose a workstation object">{['Code monitor','Data monitor','PC tower','Team tablet'].map((name,i)=><button key={name} className={selected===i?'selected':''} onClick={()=>setSelected(i)} aria-pressed={selected===i}><span>{String(i+1).padStart(2,'0')}</span>{name}</button>)}</div>
   </div>
   <div className="workstation-detail" key={selected}><div className="workstation-detail-top"><span>SELECTED / {String(selected+1).padStart(2,'0')}</span><Icon size={23} strokeWidth={1.5}/></div><span className="workstation-detail-eyebrow">{['THE CODE MONITOR','THE ANALYTICS DISPLAY','THE PC TOWER','THE COLLABORATION TABLET'][selected]}</span><h3>{skills[selected].name}</h3><p>{['Programming languages, web technologies, and APIs used to build and connect applications.','Working with datasets, building pipelines, and presenting findings through reports and dashboards.','Cloud infrastructure, version control, and the tools used to develop and validate projects.','Working with stakeholders, supporting teams, and communicating technical ideas clearly.'][selected]}</p><div className="workstation-skills">{skills[selected].items.map(item=><div key={item}><span className="workstation-skill-dot"/>{item}</div>)}</div>
   <div className="workstation-projects" aria-live="polite">
    <div className="workstation-projects-heading"><span>RELATED PROJECTS</span><span>{String(relatedProjectIndices[selected].length).padStart(2,'0')} SELECTED</span></div>
    <p className="workstation-projects-intro">{projectContext[selected]}</p>
    {relatedProjectIndices[selected].map(index=>{
      const project=projects[index];
      return <a className="workstation-project-link" href="#projects" key={project.title} aria-label={`Explore ${project.title} in the projects section`}>
       <img src={project.image} alt={`${project.title} conceptual project illustration`} loading="lazy"/>
       <span className="workstation-project-copy"><strong>{project.title}</strong><small>{project.category}</small><span>{project.metric}</span></span>
       <ArrowUpRight size={17} aria-hidden="true"/>
      </a>;
    })}
   </div>
   <div className="workstation-detail-footer"><span>EXPLORE MY WORK</span><ArrowUpRight size={17}/></div></div>
  </div>
  <p className="workstation-note"><RotateCcw size={14}/> Hover over the objects to identify them, then click to reveal skills and related projects. Use the buttons for keyboard or touch navigation.</p>
 </section>;
}
