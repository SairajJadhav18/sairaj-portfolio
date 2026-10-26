"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, RoundedBox, Text, OrbitControls } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function DeskScene(){
 const group=useRef<THREE.Group>(null);
 useFrame(({pointer},dt)=>{if(group.current){group.current.rotation.y=THREE.MathUtils.damp(group.current.rotation.y,-0.18+pointer.x*.15,2,dt);group.current.rotation.x=THREE.MathUtils.damp(group.current.rotation.x,pointer.y*.055,2,dt);}});
 return <group ref={group} rotation={[0,-.18,0]} position={[0,-.35,0]}>
  {/* Warm wood tabletop and legs */}
  <RoundedBox args={[5.2,.20,2.75]} radius={.09} smoothness={4} position={[0,-.52,0]} castShadow receiveShadow><meshStandardMaterial color="#b78060" roughness={.73}/></RoundedBox>
  {[-2.16,2.16].map(x=><group key={x}><RoundedBox args={[.16,1.15,.17]} radius={.04} position={[x,-1.16,-.88]} castShadow><meshStandardMaterial color="#786052"/></RoundedBox><RoundedBox args={[.16,1.15,.17]} radius={.04} position={[x,-1.16,.88]} castShadow><meshStandardMaterial color="#786052"/></RoundedBox></group>)}
  {/* Monitor, frame and display */}
  <RoundedBox args={[2.65,1.65,.15]} radius={.12} position={[-.34,.75,-.43]} castShadow><meshStandardMaterial color="#3a3734" metalness={.15} roughness={.5}/></RoundedBox>
  <mesh position={[-.34,.75,-.34]}><planeGeometry args={[2.43,1.43]}/><meshStandardMaterial color="#302f30" emissive="#302f30" emissiveIntensity={.2}/></mesh>
  <Text position={[-1.28,1.05,-.333]} fontSize={.115} color="#eac2a5" anchorX="left">&lt;build /&gt;</Text>
  <Text position={[-1.28,.78,-.333]} fontSize={.095} color="#a9c8b2" anchorX="left">const ideas = [</Text>
  <Text position={[-1.16,.56,-.333]} fontSize={.095} color="#f1e7d9" anchorX="left">'design', 'data',</Text>
  <Text position={[-1.16,.36,-.333]} fontSize={.095} color="#e9b08d" anchorX="left">'development'</Text>
  <Text position={[-1.28,.15,-.333]} fontSize={.095} color="#a9c8b2" anchorX="left">];</Text>
  <RoundedBox args={[.16,.52,.17]} radius={.04} position={[-.34,-.32,-.43]} castShadow><meshStandardMaterial color="#5b5752"/></RoundedBox>
  <RoundedBox args={[.86,.07,.55]} radius={.04} position={[-.34,-.39,-.38]} castShadow><meshStandardMaterial color="#5b5752"/></RoundedBox>
  {/* Keyboard, trackpad and notebook */}
  <RoundedBox args={[1.7,.09,.49]} radius={.065} position={[-.36,-.37,.62]} castShadow><meshStandardMaterial color="#e7d6c3"/></RoundedBox>
  {Array.from({length:12},(_,i)=><mesh key={i} position={[-1.06+i*.13,-.318,.57]}><boxGeometry args={[.085,.006,.06]}/><meshStandardMaterial color="#b8a595"/></mesh>)}
  <RoundedBox args={[.42,.045,.5]} radius={.055} position={[.91,-.39,.66]} castShadow><meshStandardMaterial color="#e4d3c0"/></RoundedBox>
  <RoundedBox args={[.78,.08,.98]} radius={.04} position={[-1.72,-.39,.65]} rotation={[0,-.12,0]} castShadow><meshStandardMaterial color="#d8a88f"/></RoundedBox>
  {/* Coffee mug */}
  <mesh position={[1.72,-.19,.35]} castShadow><cylinderGeometry args={[.23,.20,.39,32]}/><meshStandardMaterial color="#f1e5d5" roughness={.38}/></mesh>
  <mesh position={[1.72,.012,.35]}><cylinderGeometry args={[.195,.195,.009,32]}/><meshStandardMaterial color="#6b4637"/></mesh>
  <mesh position={[1.98,-.17,.35]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.13,.044,10,28]}/><meshStandardMaterial color="#f1e5d5"/></mesh>
  {/* Plant */}
  <mesh position={[2.06,-.25,-.75]} castShadow><cylinderGeometry args={[.27,.20,.4,8]}/><meshStandardMaterial color="#b9654b"/></mesh>
  {Array.from({length:7},(_,i)=>{const a=i*Math.PI*2/7;return <mesh key={i} position={[2.06+Math.cos(a)*.16,.08+(i%3)*.10,-.75+Math.sin(a)*.16]} rotation={[.3,0,a]} castShadow><sphereGeometry args={[.12,12,10]}/><meshStandardMaterial color={i%2?"#72866b":"#899b76"}/></mesh>})}
  {/* Floating design tokens */}
  <Float speed={1.5} rotationIntensity={.22} floatIntensity={.35}><mesh position={[1.7,1.8,-.5]}><icosahedronGeometry args={[.26,0]}/><meshStandardMaterial color="#cf8c6d" roughness={.3} metalness={.18}/></mesh></Float>
  <Float speed={1.2} rotationIntensity={.2} floatIntensity={.26}><mesh position={[-2.25,1.55,.2]}><torusGeometry args={[.22,.06,12,36]}/><meshStandardMaterial color="#899b76"/></mesh></Float>
 </group>
}
export default function Workspace3D(){return <div className="workspace-canvas" aria-label="Interactive 3D illustration of a developer's workspace" role="img"><Canvas shadows camera={{position:[6,4.1,7.2],fov:36}} dpr={[1,1.6]} gl={{antialias:true,alpha:true}}><ambientLight intensity={1.7}/><directionalLight position={[3,7,5]} intensity={3.2} castShadow shadow-mapSize={[1024,1024]}/><pointLight position={[-4,3,1]} intensity={1.2} color="#ffe6c9"/><Suspense fallback={null}><DeskScene/><ContactShadows position={[0,-1.85,0]} opacity={.28} scale={9} blur={2.6} far={4}/></Suspense><OrbitControls enablePan={false} enableZoom={false} minPolarAngle={.7} maxPolarAngle={1.5} autoRotate autoRotateSpeed={.22}/></Canvas></div>}
