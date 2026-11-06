'use client';
import {useLayoutEffect,useRef,type ReactNode} from 'react';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Collapses every static mesh inside it into one draw call per material.
 *
 * The race scene is built from hundreds of tiny procedural meshes (struts, fence
 * posts, track dashes, car parts). Each one is a separate GPU draw call, which is
 * what made scrolling feel heavy. After mount, this component bakes the meshes'
 * transforms into merged geometries grouped by identical material settings and
 * hides the originals, so the scene looks identical but renders far faster.
 *
 * Skipped automatically: instanced meshes, textured materials, and any mesh with
 * `userData={{noMerge:true}}` (use that for meshes animated from useFrame).
 */
type AnyMat=THREE.Material&{color?:THREE.Color;emissive?:THREE.Color;emissiveIntensity?:number;metalness?:number;roughness?:number;map?:THREE.Texture|null};
const KEEP=['position','normal','uv'];
function materialKey(m:AnyMat){
 return [m.type,m.color?.getHexString(),m.emissive?.getHexString(),m.emissiveIntensity,m.metalness,m.roughness,m.transparent,m.opacity,m.toneMapped,m.side,m.vertexColors,m.depthWrite].join('|');
}
function shouldSkip(obj:THREE.Object3D):boolean{
 for(let o:THREE.Object3D|null=obj;o;o=o.parent){if(o.userData?.noMerge)return true;if(o.userData?.mergeRoot)break;}
 return false;
}
export default function StaticMerge({children}:{children:ReactNode}){
 const root=useRef<THREE.Group>(null);
 useLayoutEffect(()=>{
  const group=root.current;if(!group)return;
  group.updateWorldMatrix(true,true);
  const inverse=new THREE.Matrix4().copy(group.matrixWorld).invert();
  const relative=new THREE.Matrix4();
  const buckets=new Map<string,{material:THREE.Material;geometries:THREE.BufferGeometry[];sources:THREE.Mesh[]}>();
  group.traverse(obj=>{
   const mesh=obj as THREE.Mesh;
   if(!mesh.isMesh||(mesh as THREE.InstancedMesh).isInstancedMesh||Array.isArray(mesh.material)||!mesh.visible||shouldSkip(mesh))return;
   const material=mesh.material as AnyMat;
   if(material.map)return;
   const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
   Object.keys(geometry.attributes).forEach(name=>{if(!KEEP.includes(name))geometry.deleteAttribute(name)});
   if(!geometry.attributes.normal)geometry.computeVertexNormals();
   if(!geometry.attributes.uv)geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count*2),2));
   Object.keys(geometry.morphAttributes).forEach(name=>delete geometry.morphAttributes[name]);
   geometry.clearGroups();
   relative.multiplyMatrices(inverse,mesh.matrixWorld);
   geometry.applyMatrix4(relative);
   const key=materialKey(material);
   const bucket=buckets.get(key)??{material,geometries:[],sources:[]};
   bucket.geometries.push(geometry);bucket.sources.push(mesh);buckets.set(key,bucket);
  });
  const created:THREE.Mesh[]=[];const hidden:THREE.Mesh[]=[];
  buckets.forEach(bucket=>{
   if(bucket.sources.length<2){bucket.geometries.forEach(g=>g.dispose());return;}
   const merged=mergeGeometries(bucket.geometries,false);
   bucket.geometries.forEach(g=>g.dispose());
   if(!merged)return;
   merged.computeBoundingSphere();
   const mesh=new THREE.Mesh(merged,bucket.material);
   mesh.matrixAutoUpdate=false;mesh.updateMatrix();
   group.add(mesh);created.push(mesh);
   bucket.sources.forEach(s=>{s.visible=false;hidden.push(s);});
  });
  return()=>{
   created.forEach(m=>{group.remove(m);m.geometry.dispose();});
   hidden.forEach(s=>{s.visible=true;});
  };
 },[]);
 return <group ref={root} userData={{mergeRoot:true}}>{children}</group>;
}
