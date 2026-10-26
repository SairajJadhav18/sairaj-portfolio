"use client";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

type Props={progress:React.MutableRefObject<number>;reduced:boolean};
const colors=['#a82320','#283e50','#e5e4dc','#182b27','#c4a339','#30383d','#b7c1c5','#6a2726'];

// Detailed, original open-wheel racing car model built from lightweight procedural meshes.
// Car nose faces negative Z, toward the start lights and down the circuit.
function RacingWheel({x,z,front}:{x:number;z:number;front:boolean}){
 return <group position={[x,.39,z]}>
  <mesh rotation={[0,0,Math.PI/2]} castShadow>
   <cylinderGeometry args={[front?.39:.44,front?.39:.44,.34,28]}/>
   <meshStandardMaterial color="#0c0e11" roughness={.96}/>
  </mesh>
  <mesh rotation={[0,0,Math.PI/2]} position={[x>0?.18:-.18,0,0]}>
   <cylinderGeometry args={[.22,.22,.015,20]}/>
   <meshStandardMaterial color="#343d43" metalness={.65} roughness={.33}/>
  </mesh>
  <mesh rotation={[0,Math.PI/2,0]} position={[x>0?.195:-.195,0,0]}>
   <torusGeometry args={[front?.31:.35,.017,6,32]}/>
   <meshStandardMaterial color="#e7d6a5" roughness={.7}/>
  </mesh>
  <mesh rotation={[0,Math.PI/2,0]} position={[x>0?.208:-.208,0,0]}>
   <torusGeometry args={[.145,.016,5,24]}/>
   <meshStandardMaterial color="#a9b3b7" metalness={.8} roughness={.26}/>
  </mesh>
 </group>;
}
function Strut({from,to,color="#222c32",radius=.025}:{from:[number,number,number];to:[number,number,number];color?:string;radius?:number}){
 const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to);
 const mid=a.clone().add(b).multiplyScalar(.5);
 const direction=b.clone().sub(a);
 const quaternion=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());
 return <mesh position={mid.toArray()} quaternion={quaternion} castShadow>
  <cylinderGeometry args={[radius,radius,direction.length(),7]}/>
  <meshStandardMaterial color={color} metalness={.6} roughness={.32}/>
 </mesh>;
}
// Independent launch profiles with a minimum safe following gap in each lane.
// Cars can close up behind slower drivers, but never pass through their geometry.
const REACTION=[0,.025,.055,.012,.075,.038,.11,.062];
const ACCELERATION=[1.09,.96,1.17,1.02,.91,1.13,.98,1.07];
const SAFE_FOLLOW_DISTANCE=4.85; // car length (~4.3m) plus clearance
function raceCarPositions(progress:number):number[]{
 const targets:number[]=[];
 for(let index=0;index<8;index++){
  const reaction=REACTION[index];
  const throttle=THREE.MathUtils.clamp((progress-.385-reaction)/(.58-reaction),0,1);
  const launch=Math.pow(throttle,1.55)*ACCELERATION[index];
  const freeZ=6.5+Math.floor(index/2)*4.7-launch*(43+index*.55);
  // Every second car is in the same lane. Maintain physical separation.
  const ahead=index>=2?targets[index-2]:undefined;
  targets[index]=ahead===undefined?freeZ:Math.max(freeZ,ahead+SAFE_FOLLOW_DISTANCE);
 }
 return targets;
}
function Car({lane,index,progress,reduced}:{lane:number;index:number}&Props){
 const ref=useRef<THREE.Group>(null);
 const paint=colors[index];
 const accent=index%3===0?'#f1eee5':index%3===1?'#c9a944':'#222b30';
 useFrame((_,dt)=>{
  if(!ref.current)return;
  const p=reduced?0:progress.current;
  // Each car has its own launch profile, with spacing enforced in its lane.
  const throttle=THREE.MathUtils.clamp((p-.385-REACTION[index])/(.58-REACTION[index]),0,1);
  const z=raceCarPositions(p)[index];
  ref.current.position.z=THREE.MathUtils.damp(ref.current.position.z,z,12,dt);
  ref.current.rotation.z=Math.sin(p*19+index)*.006*throttle;
 });
 return <group ref={ref} position={[lane*2.5,0,6.5+Math.floor(index/2)*4.7]}>
  {/* Low underfloor and tapered center chassis. */}
  <RoundedBox args={[.86,.19,3.55]} radius={.07} position={[0,.28,.02]} castShadow>
   <meshStandardMaterial color="#111820" metalness={.45} roughness={.45}/>
  </RoundedBox>
  <RoundedBox args={[.72,.36,1.82]} radius={.15} position={[0,.49,.18]} castShadow>
   <meshPhysicalMaterial color={paint} metalness={.16} roughness={.43} clearcoat={.32} clearcoatRoughness={.42}/>
  </RoundedBox>
  {/* Sculpted sidepods with narrower front air inlets. */}
  {[-1,1].map(side=><group key={side}>
   <RoundedBox args={[.48,.33,1.28]} radius={.13} position={[side*.59,.44,.43]} castShadow>
    <meshPhysicalMaterial color={paint} metalness={.14} roughness={.48} clearcoat={.25}/>
   </RoundedBox>
   <mesh position={[side*.61,.58,-.26]} rotation={[0,0,side*.15]}>
    <boxGeometry args={[.35,.1,.15]}/>
    <meshStandardMaterial color="#0c151d" metalness={.4}/>
   </mesh>
   <mesh position={[side*.6,.62,.7]} rotation={[0,0,side*.09]}>
    <boxGeometry args={[.38,.025,.52]}/>
    <meshStandardMaterial color={accent} metalness={.35} roughness={.35}/>
   </mesh>
  </group>)}
  {/* Long tapered nose: tip is at negative Z. */}
  <mesh position={[0,.48,-1.17]} rotation={[Math.PI/2,0,0]} castShadow>
   <cylinderGeometry args={[.29,.115,1.65,8,1]}/>
   <meshPhysicalMaterial color={paint} metalness={.15} roughness={.45} clearcoat={.3}/>
  </mesh>
  <RoundedBox args={[.18,.12,.44]} radius={.05} position={[0,.42,-1.95]} castShadow>
   <meshStandardMaterial color={paint} metalness={.4}/>
  </RoundedBox>
  {/* Front wing: layered airfoil elements, endplates, contrasting edge detail. */}
  {[-.16,.05,.22].map((z,i)=><mesh key={z} position={[0,.28+i*.018,-2.02+z]} castShadow>
   <boxGeometry args={[1.82-i*.15,.045,.18]}/>
   <meshStandardMaterial color={i===1?accent:'#101923'} metalness={.54} roughness={.32}/>
  </mesh>)}
  {[-.94,.94].map(x=><mesh key={x} position={[x,.36,-1.96]}>
   <boxGeometry args={[.055,.25,.43]}/><meshStandardMaterial color={paint} metalness={.5}/>
  </mesh>)}
  {/* Rear wing, two elements, uprights, and diffuser. */}
  {[-.12,.1].map((z,i)=><mesh key={z} position={[0,1.08,1.52+z]} castShadow>
   <boxGeometry args={[1.68,.065,.21]}/>
   <meshStandardMaterial color={i?accent:'#141c25'} metalness={.52} roughness={.32}/>
  </mesh>)}
  {[-.82,.82].map(x=><mesh key={x} position={[x,.98,1.52]}>
   <boxGeometry args={[.045,.31,.4]}/><meshStandardMaterial color={paint} metalness={.5}/>
  </mesh>)}
  {[-.47,.47].map(x=><Strut key={x} from={[x*.55,.45,1.29]} to={[x,1.04,1.48]} radius={.033}/>)}
  <mesh position={[0,.24,1.74]}><boxGeometry args={[.83,.13,.19]}/><meshStandardMaterial color="#0c1118"/></mesh>
  {/* Air intake, engine cover, cockpit opening, driver helmet. */}
  <mesh position={[0,.73,.74]} castShadow>
   <boxGeometry args={[.37,.33,.65]}/>
   <meshPhysicalMaterial color={paint} metalness={.15} roughness={.45} clearcoat={.3}/>
  </mesh>
  <mesh position={[0,.73,-.29]}><sphereGeometry args={[.36,18,10,0,Math.PI*2,0,Math.PI*.55]}/>
   <meshStandardMaterial color="#101923" roughness={.38}/></mesh>
  <mesh position={[0,.83,-.3]} castShadow>
   <sphereGeometry args={[.18,16,12]}/>
   <meshPhysicalMaterial color={index%2?'#e9f2f2':'#f5d76b'} roughness={.22} metalness={.18} clearcoat={1}/>
  </mesh>
  <mesh position={[0,.86,-.46]}><boxGeometry args={[.25,.07,.11]}/>
   <meshStandardMaterial color="#131c26" metalness={.4}/></mesh>
  {/* Halo safety structure with center post and side arms. */}
  <Strut from={[0,.72,-.67]} to={[0,1.05,-.56]} radius={.036}/>
  <Strut from={[0,1.05,-.56]} to={[-.28,.94,-.08]} radius={.036}/>
  <Strut from={[0,1.05,-.56]} to={[.28,.94,-.08]} radius={.036}/>
  <Strut from={[-.28,.94,-.08]} to={[-.3,.7,.15]} radius={.036}/>
  <Strut from={[.28,.94,-.08]} to={[.3,.7,.15]} radius={.036}/>
  {/* Four exposed wheels, hubs, and visible suspension arms. */}
  {[-1,1].map(side=>[-1.35,1.18].map(z=><group key={`${side}-${z}`}>
   <RacingWheel x={side*1.03} z={z} front={z<0}/>
   <Strut from={[side*.35,.38,z+.16]} to={[side*.86,.39,z]} radius={.026}/>
   <Strut from={[side*.35,.51,z-.2]} to={[side*.86,.39,z]} radius={.026}/>
  </group>))}
  {/* Tiny non-branded racing number on engine cover. */}
  <mesh position={[0,.696,.32]} rotation={[-Math.PI/2,0,0]}>
   <planeGeometry args={[.28,.33]}/>
   <meshBasicMaterial color={accent} side={THREE.DoubleSide}/>
  </mesh>
  <mesh position={[0,.39,1.84]}><boxGeometry args={[.34,.06,.04]}/>
   <meshBasicMaterial color="#df2629" toneMapped={false}/></mesh>
 </group>;
}
// Instanced spectator geometry keeps the cheering crowd inexpensive to render.
const spectatorColors=['#e9cfb1','#f1bba0','#bc8b70','#8c6257','#e4a6b5','#d2bfe5','#87b7ae','#e9d78d'];
function Grandstand({side,progress,reduced}:{side:-1|1}&Props){
 const bodies=useRef<THREE.InstancedMesh>(null);
 const arms=useRef<THREE.InstancedMesh>(null);
 const dummy=useMemo(()=>new THREE.Object3D(),[]);
 const people=useMemo(()=>Array.from({length:168},(_,i)=>({row:Math.floor(i/42),seat:i%42,phase:i*1.73,shirt:i%8})),[]);
 const colors=useMemo(()=>people.map((person)=>new THREE.Color(spectatorColors[person.shirt])),[people]);
 useEffect(()=>{colors.forEach((c,i)=>bodies.current?.setColorAt(i,c));if(bodies.current?.instanceColor)bodies.current.instanceColor.needsUpdate=true;},[colors]);
 useFrame(({clock})=>{
  const t=clock.elapsedTime;
  const excitement=reduced?.08:.18+THREE.MathUtils.smoothstep(progress.current,.15,.48)*.85;
  for(let i=0;i<people.length;i++){
   const person=people[i];
   const x=side*(8.7+person.row*1.25);
   const z=17-person.seat*1.9;
   const baseY=1.85+person.row*.72;
   const wave=Math.sin(t*5.5+person.phase)*.15*excitement;
   dummy.position.set(x,baseY+wave,z);
   dummy.rotation.set(0,side===1?-.32:.32,Math.sin(t*4.8+person.phase)*.09*excitement);
   dummy.scale.set(.45,.67,.38);dummy.updateMatrix();bodies.current?.setMatrixAt(i,dummy.matrix);
   dummy.position.set(x-side*.26,baseY+.31+wave+Math.abs(Math.sin(t*5.3+person.phase))*.25*excitement,z);
   dummy.rotation.set(0,0,side*(.4+Math.sin(t*5+person.phase)*.7*excitement));
   dummy.scale.set(.13,.5,.15);dummy.updateMatrix();arms.current?.setMatrixAt(i,dummy.matrix);
  }
  if(bodies.current)bodies.current.instanceMatrix.needsUpdate=true;
  if(arms.current)arms.current.instanceMatrix.needsUpdate=true;
 });
 return <group>
  <mesh position={[side*10.4,.43,-22]}><boxGeometry args={[7.4,.85,87]}/><meshStandardMaterial color="#172630" metalness={.25} roughness={.78}/></mesh>
  {Array.from({length:4},(_,row)=><group key={row}>
   <mesh position={[side*(8.7+row*1.25),.7+row*.72,-22]}><boxGeometry args={[1.3,.32,87]}/><meshStandardMaterial color={row%2?'#47555d':'#58636a'} roughness={.8}/></mesh>
   <mesh position={[side*(9.25+row*1.25),.9+row*.72,-22]}><boxGeometry args={[.09,.75,87]}/><meshStandardMaterial color="#273943"/></mesh>
  </group>)}
  <instancedMesh ref={bodies} args={[undefined,undefined,people.length]} frustumCulled={false}>
   <capsuleGeometry args={[.43,.65,3,6]}/><meshStandardMaterial vertexColors roughness={.88}/>
  </instancedMesh>
  <instancedMesh ref={arms} args={[undefined,undefined,people.length]} frustumCulled={false}>
   <capsuleGeometry args={[.33,.75,3,5]}/><meshStandardMaterial color="#e4c1a6" roughness={.9}/>
  </instancedMesh>
  <mesh position={[side*7.05,2.2,-22]}><boxGeometry args={[.14,3.7,87]}/><meshStandardMaterial color="#8a9ba0" transparent opacity={.35}/></mesh>
  {Array.from({length:18},(_,i)=><mesh key={i} position={[side*7.04,3.7,16-i*5]}><boxGeometry args={[.2,.2,.2]}/><meshBasicMaterial color="#f0dbac"/></mesh>)}
 </group>;
}
// Grounded club-racing circuit: galvanized steel, stained concrete, steel trusses,
// safety fencing, pit infrastructure and modest trackside signage. No neon architecture.
function CircuitBackdrop(){
 const sections=Array.from({length:15},(_,i)=>19-i*6.3);
 return <group>
  {([-1,1] as const).map(side=><group key={side}>
   {/* Concrete rear wall and open, tiered grandstand support structure. */}
   <mesh position={[side*15.15,2.2,-25]}><boxGeometry args={[.38,4.4,100]}/><meshStandardMaterial color="#676c69" roughness={.96}/></mesh>
   {sections.map((z,i)=><group key={i}>
    <Strut from={[side*9.2,.3,z]} to={[side*14.8,5.8,z]} color="#414c4d" radius={.10}/>
    <Strut from={[side*14.8,.3,z]} to={[side*14.8,8.2,z]} color="#4d5858" radius={.11}/>
    <Strut from={[side*10.1,6.7,z]} to={[side*17.4,8.4,z]} color="#4b5656" radius={.09}/>
    <Strut from={[side*14.8,5.8,z]} to={[side*17.4,8.4,z]} color="#515c5b" radius={.065}/>
    <Strut from={[side*10.1,6.7,z]} to={[side*14.8,8.2,z]} color="#586262" radius={.065}/>
   </group>)}
   {/* Covered grandstands: layered sweeping roof, realistic steel framing and restrained neon trim. */}
   {Array.from({length:16},(_,i)=><mesh key={i} position={[side*13.65,7.55,17-i*6.25]} rotation={[0,0,-side*.17]}>
    <boxGeometry args={[7.3,.10,6.14]}/><meshStandardMaterial color={i%4===0?'#26313c':'#192530'} metalness={.52} roughness={.46}/>
   </mesh>)}
   {/* Visible front fascia, continuous neon ribbons and overhead canopy lighting. */}
   <mesh position={[side*10.05,6.93,-30]}><boxGeometry args={[.32,.42,99]}/><meshStandardMaterial color="#0c1925" metalness={.6} roughness={.34}/></mesh>
   {[6.79,7.08].map((y,i)=><mesh key={y} position={[side*9.85,y,-30]}><boxGeometry args={[.08,.065,99]}/><meshBasicMaterial color={i===0?'#3fe6ed':'#b777ff'} toneMapped={false}/></mesh>)}
   <mesh position={[side*17.45,8.39,-30]}><boxGeometry args={[.2,.26,99]}/><meshStandardMaterial color="#283445" metalness={.65}/></mesh>
   <mesh position={[side*17.45,8.55,-30]}><boxGeometry args={[.08,.08,99]}/><meshBasicMaterial color="#5e8dff" toneMapped={false}/></mesh>
   {Array.from({length:17},(_,i)=><group key={i} position={[0,0,17-i*6]}>
    <Strut from={[side*10.0,6.75,0]} to={[side*17.4,8.37,0]} color="#81919d" radius={.075}/>
    <mesh position={[side*13.2,7.31,0]}><boxGeometry args={[.45,.07,2.4]}/><meshStandardMaterial color="#f1f6fb" emissive="#b6d9ff" emissiveIntensity={1.5} toneMapped={false}/></mesh>
    <mesh position={[side*9.95,5.75,0]}><boxGeometry args={[.18,.52,2.3]}/><meshStandardMaterial color="#121d2a" roughness={.4}/></mesh>
    <mesh position={[side*9.84,5.75,0]}><boxGeometry args={[.05,.09,1.9]}/><meshBasicMaterial color={i%3===0?'#fb698b':'#46d7ff'} toneMapped={false}/></mesh>
   </group>)}
   <mesh position={[side*10.25,6.86,-31]}><boxGeometry args={[.14,.18,96]}/><meshStandardMaterial color="#929b95" metalness={.45} roughness={.7}/></mesh>
   {/* Narrow service building and realistic dark window bands behind the seating. */}
   <mesh position={[side*19.2,2.3,-29]}><boxGeometry args={[5.6,4.6,102]}/><meshStandardMaterial color="#4c5351" roughness={.94}/></mesh>
   {[1.45,2.75,3.85].map(y=><mesh key={y} position={[side*16.36,y,-29]}><boxGeometry args={[.07,.43,100]}/><meshStandardMaterial color="#202c30" roughness={.45} metalness={.15}/></mesh>)}
   {Array.from({length:24},(_,i)=><mesh key={i} position={[side*16.31,2.74,19-i*4.1]}><boxGeometry args={[.085,3.1,.075]}/><meshStandardMaterial color="#a3a6a0" metalness={.4} roughness={.7}/></mesh>)}
   {/* Trackside concrete barriers, catch fencing and mesh posts. */}
   <mesh position={[side*7.5,.63,-24]}><boxGeometry args={[.56,1.25,100]}/><meshStandardMaterial color="#9b9b8f" roughness={1}/></mesh>
   <mesh position={[side*7.5,1.28,-24]}><boxGeometry args={[.60,.11,100]}/><meshStandardMaterial color="#e0dfd4" roughness={.9}/></mesh>
   {Array.from({length:26},(_,i)=><group key={i} position={[side*7.55,0,19-i*3.9]}>
    <mesh position={[0,2.35,0]}><boxGeometry args={[.055,3.7,.055]}/><meshStandardMaterial color="#828c8b" metalness={.5} roughness={.7}/></mesh>
    <Strut from={[0,3.9,0]} to={[side*.55,4.45,0]} color="#828c8b" radius={.026}/>
   </group>)}
   {[2.1,3.05,3.9].map(y=><mesh key={y} position={[side*7.54,y,-24]}><boxGeometry args={[.024,.025,99]}/><meshStandardMaterial color="#87928e" roughness={.7}/></mesh>)}
   {/* Restrained sponsor-free paddock signs. */}
   {[2,-28,-58].map((z,i)=><group key={z} position={[side*17.05,5.45,z]}>
    <mesh><boxGeometry args={[.22,1.5,9]}/><meshStandardMaterial color={i===1?'#b6b4a8':'#25353a'} roughness={.76}/></mesh>
    {Array.from({length:5},(_,k)=><mesh key={k} position={[-side*.13,0,-3.3+k*1.6]}><boxGeometry args={[.015,.13,1.05]}/><meshBasicMaterial color={i===1?'#343f40':'#c2c5ba'}/></mesh>)}
   </group>)}
   {/* High-definition floodlight arrays with reflective housings and LED emitters. */}
   {[12,-43].map(z=><group key={z} position={[side*23,0,z]}>
    <Strut from={[0,0,0]} to={[0,15,0]} color="#7d8583" radius={.17}/>
    <Strut from={[0,15,0]} to={[0,15,4]} color="#7d8583" radius={.085}/>
    {[-1.5,-.5,.5,1.5].map(x=><group key={x} position={[x,15,4.1]}>
     <mesh><boxGeometry args={[.87,.66,.27]}/><meshStandardMaterial color="#4c5c69" metalness={.72} roughness={.26}/></mesh>
     <mesh position={[0,0,.155]}><boxGeometry args={[.72,.5,.035]}/><meshStandardMaterial color="#e7f0f7" emissive="#d5e9ff" emissiveIntensity={2.7} toneMapped={false}/></mesh>
     {[-.22,0,.22].map(px=>[-.13,.13].map(py=><mesh key={`${px}-${py}`} position={[px,py,.182]}><circleGeometry args={[.065,12]}/><meshBasicMaterial color="#ffffff" toneMapped={false}/></mesh>))}
    </group>)}
    <pointLight position={[0,14.8,4.6]} color="#d8ebff" intensity={26} distance={24} decay={2}/>
   </group>)}
  </group>)}
  {/* Service bridge and a subdued horizon of utility buildings. */}
  <mesh position={[0,10.9,-48]}><boxGeometry args={[36,1.8,1.4]}/><meshStandardMaterial color="#3b4547" metalness={.25} roughness={.83}/></mesh>
  <mesh position={[0,10.9,-47.2]}><boxGeometry args={[33,.42,.05]}/><meshStandardMaterial color="#9a9e96" roughness={.85}/></mesh>
  {Array.from({length:13},(_,i)=>{const x=-77+i*13;const h=3+(i*7%6);return <mesh key={i} position={[x,h/2,-106-(i%3)*4]}><boxGeometry args={[8,h,7]}/><meshStandardMaterial color={i%2?'#4a5455':'#414a4b'} roughness={.97}/></mesh>})}
 </group>;
}
function FlashCameras({progress,reduced}:Props){
 const flashes=useRef<(THREE.Mesh|null)[]>([]);
 useFrame(({clock})=>{
  const t=clock.elapsedTime;
  flashes.current.forEach((m,i)=>{
   if(!m)return;
   const burst=Math.pow(Math.max(0,Math.sin(t*(2.3+i*.21)+i*8.2)),38);
   const mat=m.material as THREE.MeshBasicMaterial;
   mat.opacity=(reduced?.08:.06+THREE.MathUtils.smoothstep(progress.current,.12,.7)*.8)*burst;
   m.scale.setScalar(1+burst*3);
  });
 });
 return <group>{Array.from({length:22},(_,i)=>{
  const side=i%2===0?-1:1;
  return <mesh key={i} ref={el=>{flashes.current[i]=el}} position={[side*(8.1+(i%4)*1.1),3.1+(i%3)*.75,12-Math.floor(i/2)*8]}>
   <sphereGeometry args={[.15,8,8]}/><meshBasicMaterial color="#f8faff" transparent opacity={0} depthWrite={false} toneMapped={false}/>
  </mesh>;
 })}</group>;
}
function Confetti({progress,reduced}:Props){
 const ref=useRef<THREE.InstancedMesh>(null);
 const dummy=useMemo(()=>new THREE.Object3D(),[]);
 const particles=useMemo(()=>Array.from({length:130},(_,i)=>({x:Math.sin(i*27.17)*6.8,z:11-(i*7.33)%42,y:2+(i*3.71)%9,phase:i*1.23,color:i%4})),[]);
 useEffect(()=>{const shades=["#f2d889","#f8e5de","#7bd5b9","#f09c78"];particles.forEach((part,i)=>ref.current?.setColorAt(i,new THREE.Color(shades[part.color])));if(ref.current?.instanceColor)ref.current.instanceColor.needsUpdate=true;},[particles]);
 useFrame(({clock})=>{
  const p=reduced?0:THREE.MathUtils.smoothstep(progress.current,.32,.53);
  for(let i=0;i<particles.length;i++){
   const part=particles[i];const t=clock.elapsedTime;
   dummy.position.set(part.x+Math.sin(t*1.3+part.phase)*.65,part.y-(t*.8+part.phase)%8+4,part.z);
   dummy.rotation.set(t*2+part.phase,t*1.5+part.phase,part.phase);
   dummy.scale.setScalar(p);dummy.updateMatrix();ref.current?.setMatrixAt(i,dummy.matrix);
  }
  if(ref.current)ref.current.instanceMatrix.needsUpdate=true;
 });
 return <instancedMesh ref={ref} args={[undefined,undefined,particles.length]} frustumCulled={false}>
  <planeGeometry args={[.16,.28]}/><meshBasicMaterial vertexColors side={THREE.DoubleSide}/>
 </instancedMesh>;
}
// High-resolution, self-contained countdown digits rendered on the actual 3D light lenses.
function CountdownDigit({number}:{number:number}){
 const texture=useMemo(()=>{
  const canvas=document.createElement('canvas');
  canvas.width=256;canvas.height=256;
  const ctx=canvas.getContext('2d');
  if(ctx){
   ctx.clearRect(0,0,256,256);
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.shadowColor='#ffffff';ctx.shadowBlur=10;
   ctx.fillStyle='#fffaf2';ctx.font='900 190px Arial, sans-serif';
   ctx.fillText(String(number),128,139);
  }
  const map=new THREE.CanvasTexture(canvas);
  map.colorSpace=THREE.SRGBColorSpace;
  map.anisotropy=8;
  return map;
 },[number]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <mesh position={[0,0,.177]}><planeGeometry args={[.59,.59]}/><meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false}/></mesh>;
}
function Race({progress,reduced}:Props){
 const {camera}=useThree();
 const lightRefs=useRef<(THREE.Mesh|null)[]>([]);
 const haloRefs=useRef<(THREE.Mesh|null)[]>([]);
 const launchGlow=useRef<THREE.PointLight>(null);
 useFrame((_,dt)=>{
  const p=reduced?0:progress.current;
  // Fixed starting grid initially; once the lights change, the camera moves with the field.
  const targetZ=24-THREE.MathUtils.smoothstep(p,.42,1)*19;
  camera.position.z=THREE.MathUtils.damp(camera.position.z,targetZ,5,dt);
  camera.position.y=THREE.MathUtils.damp(camera.position.y,9.5-THREE.MathUtils.smoothstep(p,.42,1)*2.8,5,dt);
  camera.lookAt(0,.25,camera.position.z-16);
  const green=p>=.37;
  lightRefs.current.forEach((m,i)=>{
   if(!m)return;
   const red=!green && p>=.065+i*.047;
   const mat=m.material as THREE.MeshStandardMaterial;
   mat.color.set(green?'#47ff94':red?'#ff342b':'#252a30');
   mat.emissive.set(green?'#37ff80':red?'#ff241e':'#06090b');
   mat.emissiveIntensity=green?4.5:red?4:.08;
   const halo=haloRefs.current[i];
   if(halo){const hm=halo.material as THREE.MeshBasicMaterial;hm.color.set(green?'#43ff9a':'#ff392d');hm.opacity=(green||red)?.15:0;}
  });
  if(launchGlow.current){launchGlow.current.color.set(green?'#44ff9c':'#ff4b40');launchGlow.current.intensity=green?30:12;}

 });
 return <>
  <color attach="background" args={['#202c45']}/><fog attach="fog" args={['#202c45',58,145]}/>
  <ambientLight intensity={.75}/><hemisphereLight args={["#a5b8dc","#343a4e",1.25]}/><directionalLight position={[-7,16,6]} intensity={2.2} color="#dbe6ff"/><pointLight ref={launchGlow} position={[0,7,1]} intensity={12} color="#ff6254" distance={26}/>
  <CircuitBackdrop/><Grandstand side={-1} progress={progress} reduced={reduced}/><Grandstand side={1} progress={progress} reduced={reduced}/><FlashCameras progress={progress} reduced={reduced}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.05,-18]}><planeGeometry args={[150,170]}/><meshStandardMaterial color="#56605d" roughness={1}/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,-18]}><planeGeometry args={[12.4,170]}/><meshStandardMaterial color="#343b3a" roughness={.99}/></mesh>
  {[-6.25,6.25].map(x=><mesh key={x} position={[x,.035,-18]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.19,170]}/><meshBasicMaterial color="#e1ddd0"/></mesh>)}
  {[-3.1,0,3.1].map(x=>Array.from({length:22},(_,i)=><mesh key={`${x}-${i}`} position={[x,.045,13-i*5.1]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.09,2.5]}/><meshBasicMaterial color="#b8bbb4"/></mesh>))}
  {Array.from({length:12},(_,i)=><mesh key={i} position={[0,.053,12-i*4.8]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[12.1,.11]}/><meshBasicMaterial color="#e8efeb" transparent opacity={i<4?.7:.28}/></mesh>)}
  {Array.from({length:8},(_,i)=><Car key={i} lane={i%2===0?-1:1} index={i} progress={progress} reduced={reduced}/>)}
  <group position={[0,7.0,-1.6]}>
   <RoundedBox args={[9.2,1.35,.65]} radius={.16}><meshStandardMaterial color="#080e15" metalness={.7} roughness={.3}/></RoundedBox>
   {Array.from({length:5},(_,i)=><group key={i} position={[-3.3+i*1.65,0,.39]}><mesh><cylinderGeometry args={[.54,.54,.24,48]}/><meshStandardMaterial color="#101720" metalness={.72} roughness={.24}/></mesh><mesh position={[0,0,.115]}><torusGeometry args={[.43,.055,10,48]}/><meshStandardMaterial color="#9aa8b6" metalness={.86} roughness={.22}/></mesh><mesh ref={el=>{lightRefs.current[i]=el}} position={[0,0,.09]}><circleGeometry args={[.385,48]}/><meshStandardMaterial color="#292c31" emissive="#090a0b" emissiveIntensity={.2} toneMapped={false}/></mesh><mesh ref={el=>{haloRefs.current[i]=el}} position={[0,0,.14]}><circleGeometry args={[.55,48]}/><meshBasicMaterial color="#ff392d" transparent opacity={0} depthWrite={false}/></mesh><CountdownDigit number={5-i}/></group>)}
  </group>
  {[-7.4,7.4].map(x=><group key={x}>{Array.from({length:15},(_,i)=><mesh key={i} position={[x,1.7,13-i*7]}><boxGeometry args={[.12,3.4,.12]}/><meshStandardMaterial color="#51616c"/></mesh>)}</group>)}
 </>;
}
export default function RaceStartScene({progress,reduced}:Props){return <div className="cinematic-canvas" aria-hidden="true"><Canvas dpr={[1,1.6]} camera={{position:[0,9.5,24],fov:51}} gl={{antialias:true,alpha:false}}><Race progress={progress} reduced={reduced}/></Canvas></div>}
