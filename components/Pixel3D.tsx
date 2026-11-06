'use client';
import {Canvas,useFrame} from '@react-three/fiber';
import {useEffect,useRef} from 'react';
import * as THREE from 'three';
export type PixelMood='idle'|'typing'|'social'|'send'|'name'|'email'|'message'|'copy'|'pet'|'wave';
type Props={mood:PixelMood;trigger:number;pointer:React.MutableRefObject<{x:number;y:number}>;reduced:boolean;active?:boolean};
const white='#f5f6f3',pink='#e6aabd',dark='#111820';
// Facial features sit just in front of the smaller curved visor.
const smileCurve=new THREE.CatmullRomCurve3([
 new THREE.Vector3(-.105,-.255,.701),new THREE.Vector3(-.06,-.305,.713),
 new THREE.Vector3(0,-.318,.717),new THREE.Vector3(.06,-.305,.713),new THREE.Vector3(.105,-.255,.701)
]);
const eyeSmile=(x:number)=>new THREE.CatmullRomCurve3([
 new THREE.Vector3(x-.105,.055,.704),new THREE.Vector3(x-.075,.145,.715),
 new THREE.Vector3(x,.175,.722),new THREE.Vector3(x+.075,.145,.715),
 new THREE.Vector3(x+.105,.055,.704)
]);
function Rounded({position,scale,color,metalness=0.08,roughness=.35}:{position:[number,number,number];scale:[number,number,number];color:string;metalness?:number;roughness?:number}){
 return <mesh position={position} scale={scale} castShadow receiveShadow><sphereGeometry args={[1,32,24]}/><meshStandardMaterial color={color} metalness={metalness} roughness={roughness}/></mesh>;
}
function Robot({mood,trigger,pointer,reduced}:Props){
 const root=useRef<THREE.Group>(null),head=useRef<THREE.Group>(null),left=useRef<THREE.Group>(null),right=useRef<THREE.Group>(null),eyes=useRef<THREE.Group>(null);
 const previous=useRef(trigger),start=useRef(-100),nextBlink=useRef(0),blinkEnd=useRef(0),gaze=useRef({x:0,y:0});
 useFrame((state,dt)=>{
  const t=state.clock.elapsedTime;dt=Math.min(dt,.05);
  if(trigger!==previous.current){previous.current=trigger;start.current=t;}
  const age=t-start.current;
  const pulse=Math.max(0,1-age/1.5);
  const smoothPulse=pulse*pulse*(3-2*pulse);
  gaze.current.x=THREE.MathUtils.damp(gaze.current.x,pointer.current.x,3.3,dt);
  gaze.current.y=THREE.MathUtils.damp(gaze.current.y,pointer.current.y,3.3,dt);
  const x=gaze.current.x,y=gaze.current.y;
  if(t>nextBlink.current){blinkEnd.current=t+.14;nextBlink.current=t+3.5+Math.random()*2.4;}
  const excited=mood==='social'||mood==='wave';
  const listening=['name','email','message','typing'].includes(mood);
  const bounce=['send','copy','pet'].includes(mood)?Math.sin(age*11)*smoothPulse*.16:0;
  if(root.current){
   root.current.position.y=THREE.MathUtils.damp(root.current.position.y,reduced?0:Math.sin(t*1.6)*.026+bounce,5,dt);
   root.current.rotation.z=THREE.MathUtils.damp(root.current.rotation.z,reduced?0:Math.sin(t*.8)*.022+(mood==='pet'?Math.sin(age*9)*smoothPulse*.09:0),5,dt);
  }
  if(head.current){
   head.current.rotation.y=THREE.MathUtils.damp(head.current.rotation.y,reduced?0:x*.32,3.5,dt);
   head.current.rotation.x=THREE.MathUtils.damp(head.current.rotation.x,reduced?0:-y*.19+(listening?-.05:0),3.5,dt);
   head.current.rotation.z=THREE.MathUtils.damp(head.current.rotation.z,reduced?0:(excited?.13:listening?-.09:0)+Math.sin(t*.9)*.025,3.5,dt);
  }
  if(eyes.current){
   eyes.current.position.x=THREE.MathUtils.damp(eyes.current.position.x,reduced?0:x*.115,5,dt);
   eyes.current.position.y=THREE.MathUtils.damp(eyes.current.position.y,reduced?0:y*.065,5,dt);
   const blink=!reduced&&t<blinkEnd.current;
   eyes.current.scale.y=THREE.MathUtils.damp(eyes.current.scale.y,blink?.08:1,25,dt);
  }
  if(left.current)left.current.rotation.z=THREE.MathUtils.damp(left.current.rotation.z,reduced?-.28:-.28+Math.sin(t*1.5)*.06+(listening?.2:0)+(mood==='pet'?smoothPulse*.35:0),4,dt);
  if(right.current)right.current.rotation.z=THREE.MathUtils.damp(right.current.rotation.z,reduced?-.16:-.16+Math.sin(t*(excited?5:2.7))*(excited?.20:.12)+((mood==='wave'||mood==='pet')?smoothPulse*.24:0),4,dt);
 });
 return <group ref={root} position={[0,-.16,0]}>
  {/* Small feet and compact pear-shaped torso. */}
  <Rounded position={[-.31,-1.27,.10]} scale={[.27,.16,.33]} color={white}/>
  <Rounded position={[.31,-1.27,.10]} scale={[.27,.16,.33]} color={white}/>
  <Rounded position={[0,-.70,0]} scale={[.66,.70,.55]} color={white} roughness={.23}/>
  <Rounded position={[0,-.35,.46]} scale={[.41,.24,.10]} color={pink}/>
  <Rounded position={[0,-.97,.55]} scale={[.035,.035,.023]} color="#7c929a"/>
  {/* Relaxed left hand. */}
  <group ref={left} position={[-.63,-.43,.02]}>
   <Rounded position={[-.12,-.22,.04]} scale={[.19,.36,.22]} color={white}/>
   <Rounded position={[-.20,-.23,.20]} scale={[.10,.20,.06]} color={pink}/>
  </group>
  {/* Right arm is outside the head silhouette, with the hand ABOVE the head. */}
  <group ref={right} position={[.76,-.12,.05]}>
   <Rounded position={[.20,.36,.03]} scale={[.20,.44,.23]} color={white}/>
   <Rounded position={[.25,.70,.07]} scale={[.23,.25,.23]} color={white}/>
   <Rounded position={[.30,.74,.25]} scale={[.12,.17,.045]} color={pink}/>
  </group>
  <group ref={head} position={[0,.47,0]}>
   <Rounded position={[0,0,0]} scale={[.87,.73,.65]} color={white} metalness={.12} roughness={.22}/>
   <Rounded position={[0,-.025,.465]} scale={[.735,.51,.24]} color={dark} metalness={.2} roughness={.13}/>
   <Rounded position={[0,.66,.02]} scale={[.23,.035,.19]} color={pink}/>
   <group ref={eyes} position={[0,0,0]}>
    {[-.31,.31].map((x)=><group key={x}>
     <mesh><tubeGeometry args={[eyeSmile(x),28,.020,8,false]}/><meshBasicMaterial color="#fffdfc" toneMapped={false}/></mesh>
    </group>)}
   </group>
   <mesh><tubeGeometry args={[smileCurve,32,.014,8,false]}/><meshBasicMaterial color="#fffdfc" toneMapped={false}/></mesh>
   <Rounded position={[-.53,-.19,.65]} scale={[.067,.022,.020]} color="#f6a9c2"/>
   <Rounded position={[.53,-.19,.65]} scale={[.067,.022,.020]} color="#f6a9c2"/>
  </group>
 </group>;
}
export default function Pixel3D({active=true,...props}:Props){
 return <Canvas dpr={[1,1.5]} camera={{position:[0,.35,7.5],fov:35}} gl={{alpha:true,antialias:true,powerPreference:'low-power'}} style={{width:'100%',height:'100%',touchAction:'pan-y'}} frameloop={active?'always':'never'}>
  <ambientLight intensity={1.7}/>
  <hemisphereLight intensity={1.4} groundColor="#a2b8b1"/>
  <directionalLight position={[-3,5,6]} intensity={2.4}/>
  <pointLight position={[3,2,4]} intensity={18} color="#ffd6e1" distance={9}/>
  <Robot {...props}/>
 </Canvas>;
}
