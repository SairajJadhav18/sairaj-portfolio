"use client";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, RoundedBox, Text, ContactShadows } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

function SetCamera({ progress, reduced }: {progress: React.MutableRefObject<number>; reduced:boolean}) {
 const { camera, pointer } = useThree();
 const target = useRef(new THREE.Vector3());
 useFrame((_,delta)=>{
  const p = reduced ? 0 : progress.current;
  const stops = [new THREE.Vector3(6.7,4.4,8.4),new THREE.Vector3(4.6,2.9,6.0),new THREE.Vector3(.1,1.3,3.0),new THREE.Vector3(.1,1.0,2.55),new THREE.Vector3(5.5,3.6,7.5)];
  const t = Math.min(p*4,3.999), i=Math.floor(t), f=THREE.MathUtils.smoothstep(t-i,0,1);
  target.current.copy(stops[i]).lerp(stops[i+1],f);
  if(!reduced){target.current.x+=pointer.x*.15;target.current.y+=pointer.y*.08;}
  camera.position.lerp(target.current,1-Math.exp(-delta*2.8));
  const look = new THREE.Vector3(0,.55,-.25);
  if(p>.45&&p<.82) look.set(0,.92,-.58);
  camera.lookAt(look);
 });
 return null;
}
function Studio(){
 const halo=useRef<THREE.Mesh>(null);
 useFrame((s,dt)=>{if(halo.current)halo.current.rotation.z+=dt*.12;});
 return <group position={[0,-.1,0]}>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.72,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#e7d4bc" roughness={1}/></mesh>
  <RoundedBox args={[5.8,.24,3.2]} radius={.10} position={[0,-.49,0]} castShadow receiveShadow><meshStandardMaterial color="#a56b4c" roughness={.63}/></RoundedBox>
  {[-2.35,2.35].map(x=>[-1.16,1.16].map(z=><RoundedBox key={`${x}-${z}`} args={[.17,1.22,.17]} radius={.035} position={[x,-1.12,z]} castShadow><meshStandardMaterial color="#5c4034" metalness={.15}/></RoundedBox>))}
  {/* Neon desk edge, under-monitor glow, and ambient LED accents */}
  <mesh position={[0,-.358,1.592]}><boxGeometry args={[5.5,.018,.025]}/><meshBasicMaterial color="#ff935c" toneMapped={false}/></mesh>
  <mesh position={[0,-.35,-1.585]}><boxGeometry args={[5.5,.02,.025]}/><meshBasicMaterial color="#7df2d1" toneMapped={false}/></mesh>
  <pointLight position={[0,.35,-.55]} color="#5bffe4" intensity={2.2} distance={4}/>
  <pointLight position={[2,-.1,1]} color="#ff784d" intensity={2.5} distance={3.5}/>
  <RoundedBox args={[.82,1.35,.95]} radius={.08} position={[1.92,.24,-1.02]} castShadow><meshStandardMaterial color="#282c30" metalness={.55} roughness={.28}/></RoundedBox>
  {[0,.32,.64].map((v,i)=><mesh key={i} position={[2.344,-.15+v,-1.02]} rotation={[0,Math.PI/2,0]}><torusGeometry args={[.115,.017,12,36]}/><meshBasicMaterial color={i===1?"#ff986f":"#77e9d3"} toneMapped={false}/></mesh>)}
  <mesh position={[1.91,.91,-.535]}><boxGeometry args={[.44,.025,.012]}/><meshBasicMaterial color="#ff986f" toneMapped={false}/></mesh>
  <RoundedBox args={[.98,.055,.12]} radius={.03} position={[-1.65,-.3,-1.22]}><meshStandardMaterial color="#36302e"/></RoundedBox>
  {Array.from({length:12},(_,i)=><mesh key={i} position={[-2.09+i*.08,-.262,-1.22]}><boxGeometry args={[.042,.008,.055]}/><meshBasicMaterial color={i%3===0?"#ff9a70":"#79eed7"} toneMapped={false}/></mesh>)}
  <mesh position={[-2.43,.2,-1.15]}><cylinderGeometry args={[.035,.045,1.1,12]}/><meshStandardMaterial color="#4a3934"/></mesh>
  <mesh position={[-2.43,.76,-1.15]} rotation={[0,0,-.35]}><coneGeometry args={[.31,.42,24]}/><meshStandardMaterial color="#d9a37b" emissive="#ffa66e" emissiveIntensity={.28}/></mesh>
  <spotLight position={[-2.43,.64,-1.15]} angle={.8} penumbra={.8} intensity={5} color="#ffb07a" target-position={[-1.8,-.35,-.2]}/>
  <RoundedBox args={[3.1,1.97,.19]} radius={.12} position={[0,1.02,-.72]} castShadow><meshStandardMaterial color="#292524" metalness={.22} roughness={.35}/></RoundedBox>
  <mesh position={[0,1.02,-.609]}><planeGeometry args={[2.87,1.73]}/><meshStandardMaterial color="#0c1820" emissive="#174a4a" emissiveIntensity={.8}/></mesh>
  <Text position={[-1.21,1.54,-.593]} fontSize={.115} anchorX="left" color="#ffb285">SAIRAJ / DEV STUDIO</Text>
  <Text position={[-1.21,1.23,-.593]} fontSize={.22} anchorX="left" color="#fff0df">Ideas into impact.</Text>
  <Text position={[-1.21,.91,-.593]} fontSize={.105} anchorX="left" color="#80f5dc">&gt; build meaningful things_</Text>
  {[0,1,2].map(i=><mesh key={i} position={[-.83+i*.47,.55,-.591]}><planeGeometry args={[.35,.055]}/><meshBasicMaterial color={['#bd7652','#e4b87d','#91a58b'][i]}/></mesh>)}
  <RoundedBox args={[.13,.55,.15]} radius={.025} position={[0,-.22,-.72]}><meshStandardMaterial color="#48413c"/></RoundedBox>
  <RoundedBox args={[.9,.07,.48]} radius={.04} position={[0,-.40,-.68]}><meshStandardMaterial color="#48413c"/></RoundedBox>
  <RoundedBox args={[1.8,.09,.52]} radius={.06} position={[-.25,-.32,.66]} castShadow><meshStandardMaterial color="#292c30" emissive="#4ce4b8" emissiveIntensity={.12}/></RoundedBox>
  {Array.from({length:35},(_,i)=><mesh key={i} position={[-1.04+(i%12)*.143,-.266,.49+Math.floor(i/12)*.14]}><boxGeometry args={[.105,.013,.085]}/><meshStandardMaterial color={i%5===0?"#ff9c7b":"#8cebd4"} emissive={i%5===0?"#ff9c7b":"#8cebd4"} emissiveIntensity={.45}/></mesh>)}
  <RoundedBox args={[.42,.05,.56]} radius={.055} position={[1.14,-.33,.64]}><meshStandardMaterial color="#e8d7c4"/></RoundedBox>
  <RoundedBox args={[.82,.08,1.04]} radius={.05} position={[-1.89,-.32,.5]} rotation={[0,.18,0]} castShadow><meshStandardMaterial color="#c97b58"/></RoundedBox>
  <mesh position={[2,-.08,.45]} castShadow><cylinderGeometry args={[.24,.21,.44,32]}/><meshStandardMaterial color="#f5e6d2"/></mesh>
  <mesh position={[2,.146,.45]}><cylinderGeometry args={[.20,.20,.01,32]}/><meshStandardMaterial color="#563b2e"/></mesh>
  <mesh position={[2.27,-.08,.45]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.135,.04,12,30]}/><meshStandardMaterial color="#f5e6d2"/></mesh>
  <mesh position={[2.24,-.12,-.92]} castShadow><cylinderGeometry args={[.30,.22,.44,8]}/><meshStandardMaterial color="#b86a4d"/></mesh>
  {Array.from({length:9},(_,i)=>{const a=i*2.4;return <mesh key={i} position={[2.24+Math.cos(a)*.20,.19+(i%3)*.12,-.92+Math.sin(a)*.20]} rotation={[.3,0,a]}><sphereGeometry args={[.14,12,12]}/><meshStandardMaterial color={i%2?'#6e8667':'#8a9b77'}/></mesh>})}
  <Float speed={1.2} rotationIntensity={.25} floatIntensity={.35}><mesh position={[-2.65,1.78,.2]} ref={halo}><torusGeometry args={[.34,.075,16,64]}/><meshStandardMaterial color="#c17855" metalness={.35} roughness={.3}/></mesh></Float>
  <Float speed={1.1} rotationIntensity={.3} floatIntensity={.42}><mesh position={[2.65,2.06,-.4]}><icosahedronGeometry args={[.38,1]}/><meshStandardMaterial color="#e0b787" metalness={.15} roughness={.34}/></mesh></Float>
  <Float speed={1.3} rotationIntensity={.22} floatIntensity={.32}><RoundedBox args={[.82,.54,.08]} radius={.05} position={[-2.2,2.72,-1]} rotation={[0,.3,-.16]}><meshStandardMaterial color="#74886c"/></RoundedBox></Float>
  <ContactShadows position={[0,-1.69,0]} opacity={.34} scale={11} blur={2.7} far={5}/>
 </group>
}
export default function CinematicScene({progress,reduced}:{progress:React.MutableRefObject<number>;reduced:boolean}){
 return <div className="cinematic-canvas" aria-hidden="true"><Canvas shadows dpr={[1,1.65]} camera={{position:[6.7,4.4,8.4],fov:38}} gl={{alpha:true,antialias:true}}><color attach="background" args={["#ead8c3"]}/><ambientLight intensity={1.7}/><directionalLight position={[3,8,6]} intensity={3.2} castShadow shadow-mapSize={[1024,1024]}/><pointLight position={[-4,4,1]} color="#ffc994" intensity={2}/><Suspense fallback={null}><Studio/></Suspense><SetCamera progress={progress} reduced={reduced}/></Canvas></div>
}
