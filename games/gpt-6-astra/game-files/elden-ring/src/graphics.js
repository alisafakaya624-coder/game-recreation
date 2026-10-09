import * as THREE from '../vendor/three.module.js';
import {seeded,clamp,lerp} from './core.js';
export {THREE};
export const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
export function mergeGeometries(geoms){
 let total=0;const src=geoms.map(g=>{const n=g.index?g.toNonIndexed():g;total+=n.attributes.position.count;return n;});
 const p=new Float32Array(total*3),n=new Float32Array(total*3),uv=new Float32Array(total*2);let at=0;
 for(const g of src){p.set(g.attributes.position.array,at*3);if(g.attributes.normal)n.set(g.attributes.normal.array,at*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,at*2);at+=g.attributes.position.count;}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(p,3));geo.setAttribute('normal',new THREE.BufferAttribute(n,3));geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));geo.computeBoundingSphere();return geo;
}
export class Batcher{
 constructor(root){this.root=root;this.groups=new Map();this.dummy=new THREE.Object3D();}
 put(geo,mat,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){const g=geo.clone();this.dummy.position.set(x,y,z);this.dummy.rotation.set(rx,ry,rz);this.dummy.scale.set(sx,sy,sz);this.dummy.updateMatrix();g.applyMatrix4(this.dummy.matrix);if(!this.groups.has(mat))this.groups.set(mat,[]);this.groups.get(mat).push(g);}
 box(mat,x,y,z,w,h,d,ry=0,rz=0){const geo=new THREE.BoxGeometry(w,h,d),uv=geo.attributes.uv,p=geo.attributes.position,n=geo.attributes.normal;for(let i=0;i<uv.count;i++){if(Math.abs(n.getY(i))>.5)uv.setXY(i,p.getX(i)/3,p.getZ(i)/3);else if(Math.abs(n.getX(i))>.5)uv.setXY(i,p.getZ(i)/3,p.getY(i)/3);else uv.setXY(i,p.getX(i)/3,p.getY(i)/3);}this.put(geo,mat,x,y,z,1,1,1,0,ry,rz);geo.dispose();}
 cylinder(mat,x,y,z,r1,r2,h,segments=10){const g=new THREE.CylinderGeometry(r1,r2,h,segments);this.put(g,mat,x,y,z);g.dispose();}
 finish(){for(const [mat,geoms]of this.groups){if(!geoms.length)continue;const mesh=new THREE.Mesh(mergeGeometries(geoms),mat);mesh.castShadow=true;mesh.receiveShadow=true;this.root.add(mesh);for(const g of geoms)g.dispose();}this.groups.clear();}
}
const noiseGLSL=`float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.3,.7));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}float fbm(vec3 p){float n=0.;float a=.5;for(int i=0;i<5;i++){n+=a*noise(p);p=p*2.03+12.4;a*=.5;}return n;}`;
export function createSky(){
 const mat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{time:{value:0},night:{value:0},tint:{value:new THREE.Color('#8e977c')},storm:{value:0}},vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 vP;uniform float time;uniform float night;uniform vec3 tint;uniform float storm;${noiseGLSL}void main(){vec3 d=normalize(vP);float h=max(d.y,0.);vec3 c=mix(tint*.99,vec3(.16,.25,.23),pow(h,.55));vec3 p=d*3.8+vec3(time*.0007,0.,time*.001);float cloud=fbm(p*2.2);float detail=fbm(p*7.);float density=smoothstep(.38,.67,cloud+.07*detail);float sun=pow(max(0.,dot(d,normalize(vec3(.55,.4,-.6)))),8.);vec3 lit=mix(vec3(.15,.23,.21),vec3(.78,.77,.51),clamp(cloud*1.4+sun*.4,0.,1.));c=mix(c,lit,density*.88);c+=vec3(.3,.26,.1)*sun*.32;c=mix(c,c*vec3(.17,.24,.44),night*.87);float stars=pow(hash(floor(d*1700.)),140.)*night*smoothstep(.05,.4,h);c+=stars;gl_FragColor=vec4(c*(1.-storm*.22),1.);}`});
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(1800,32,24),mat);mesh.frustumCulled=false;return mesh;
}
export async function createMaterials(){
 const loader=new THREE.TextureLoader();
 async function surface(id,color,repeat=1){const [map,normalMap,roughnessMap]=await Promise.all(['diff','nor_gl','rough'].map(async type=>{try{const t=await loader.loadAsync(`assets/${id}_${type}_1k.jpg`);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=4;if(type==='diff')t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}}));return new THREE.MeshStandardMaterial({color,map,normalMap,normalScale:new THREE.Vector2(.8,.8),roughnessMap,roughness:1});}
 const [stone,ground,rock,bark]=await Promise.all([surface('mossy_stone_wall',0xb9b3a1),surface('aerial_grass_rock',0xa4a281),surface('mossy_rock',0xa9afa0),surface('bark_brown_02',0x80725c)]);
 const std=(color,roughness=.82,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const m={stone,ground,rock,bark,stoneLight:stone.clone(),stoneDark:stone.clone(),road:ground.clone(),wood:bark.clone(),gold:std(0x927a43,.4,.7),iron:std(0x5c6869,.48,.8),steel:std(0x969f9d,.4,.85),darkSteel:std(0x3a4947,.52,.75),leather:std(0x392f24),cloth:std(0x6b4b36),clothRed:std(0x532c26),bone:std(0xa19d82),black:std(0x18231d),grass:std(0x687445),leaf:std(0x9b9650),snow:std(0xafb6b1),ash:std(0x92968a),water:new THREE.MeshStandardMaterial({color:0x506b62,roughness:.26,metalness:.55,transparent:true,opacity:.79}),glow:new THREE.MeshBasicMaterial({color:0xf8d487}),blue:new THREE.MeshBasicMaterial({color:0x75d7f3}),fire:new THREE.MeshBasicMaterial({color:0xffb44d}),rot:std(0x703723),purple:std(0x716d97,.4,.4)};
 const clothCanvas=document.createElement('canvas');clothCanvas.width=256;clothCanvas.height=512;const cc=clothCanvas.getContext('2d');cc.fillStyle='#dfd3bd';cc.beginPath();cc.moveTo(14,0);cc.lineTo(240,0);cc.lineTo(253,460);for(let i=12;i>=0;i--)cc.lineTo(i*21,478+(i%3)*13);cc.lineTo(1,451);cc.closePath();cc.fill();const cr=seeded(82);for(let i=0;i<9000;i++){cc.fillStyle=cr()<.5?'#6b5c4e18':'#fff4d912';cc.fillRect(cr()*256,cr()*490,1,1+cr()*7);}cc.strokeStyle='#9f8755';cc.lineWidth=3;cc.strokeRect(20,12,216,445);cc.lineWidth=1;for(let i=0;i<18;i++){cc.beginPath();cc.moveTo(22+i*12,443);cc.lineTo(28+i*12,431);cc.lineTo(34+i*12,443);cc.stroke();}m.cloakMap=new THREE.CanvasTexture(clothCanvas);m.cloakMap.colorSpace=THREE.SRGBColorSpace;
 const metalCanvas=document.createElement('canvas');metalCanvas.width=metalCanvas.height=128;const mc=metalCanvas.getContext('2d');mc.fillStyle='#b1b7b2';mc.fillRect(0,0,128,128);for(let i=0;i<1900;i++){mc.strokeStyle=cr()<.5?'#38413b32':'#e5e1cc38';mc.beginPath();const x=cr()*128,y=cr()*128;mc.moveTo(x,y);mc.lineTo(x+cr()*12,y+cr()*3);mc.stroke();}const metalMap=new THREE.CanvasTexture(metalCanvas);metalMap.colorSpace=THREE.SRGBColorSpace;metalMap.wrapS=metalMap.wrapT=THREE.RepeatWrapping;m.steel.map=metalMap;m.steel.roughness=.58;
 m.stoneLight.color.setHex(0xd2c9ab);m.stoneDark.color.setHex(0x727b6b);m.wood.color.setHex(0x493c2d);m.road.color.setHex(0x9e987c);return m;
}
const blobGeo=new THREE.IcosahedronGeometry(1,1),sphereGeo=new THREE.SphereGeometry(1,12,8);
export function makeCharacter(m,{color=0x6b5141,scale=1,weapon='sword',spectral=false,beast=false,serpent=false}={}){
 const root=new THREE.Group();const body=new THREE.Group();root.add(body);root.scale.setScalar(scale);
 const cloth=new THREE.MeshStandardMaterial({color,map:m.cloakMap,alphaTest:.4,roughness:.93,side:THREE.DoubleSide});
 const metal=spectral?new THREE.MeshStandardMaterial({color:0x80bfcb,emissive:0x397480,emissiveIntensity:.7,transparent:true,opacity:.62,metalness:.6,roughness:.4}):m.steel;
 function mesh(g,mat,x,y,z,sx=1,sy=1,sz=1,parent=body){const o=new THREE.Mesh(g,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 if(beast||serpent){
   mesh(sphereGeo,metal,0,1.1,0,.68,.66,1.45);mesh(sphereGeo,cloth,0,1.45,-1.25,.43,.44,.7);
   for(const side of [-1,1])for(const z of [-.85,.85])mesh(new THREE.CylinderGeometry(.12,.17,1,8),metal,side*.52,.49,z);
   for(let i=0;i<6;i++){const horn=mesh(new THREE.ConeGeometry(.16,.7,7),m.bone,(i%2?1:-1)*(.3+i*.03),1.7+i*.13,-1.2+i*.16);horn.rotation.z=(i%2?-1:1)*.55;}
   for(let i=0;i<5;i++)mesh(sphereGeo,metal,Math.sin(i*.8)*.2,.8+i*.08,1.15+i*.3,.24-i*.025,.23-i*.025,.42);
   const eye=new THREE.MeshBasicMaterial({color:spectral?0x93e8ff:0xf7b14e});mesh(sphereGeo,eye,-.31,1.62,-1.65,.06,.06,.06);mesh(sphereGeo,eye,.31,1.62,-1.65,.06,.06,.06);
   root.userData={body,beast:true,cloth,weaponGroup:new THREE.Group(),shield:new THREE.Group()};return root;
 }
 // Articulated human silhouette, separate plate, mail, leather and cloth layers.
 mesh(new THREE.CylinderGeometry(.27,.22,.63,12),m.darkSteel,0,1.2,0,1,1,.68);
 mesh(sphereGeo,metal,0,1.3,-.065,.315,.33,.18);
 mesh(new THREE.CylinderGeometry(.25,.31,.22,10),metal,0,.9,0,1,1,.72);
 mesh(new THREE.CylinderGeometry(.268,.268,.06,12),m.leather,0,1,0,1,1,.73);
 mesh(new THREE.BoxGeometry(.09,.08,.04),m.gold,0,1,-.21);
 const head=new THREE.Group();head.position.y=1.71;body.add(head);
 mesh(sphereGeo,metal,0,0,0,.185,.215,.18,head);
 mesh(new THREE.BoxGeometry(.29,.095,.035),m.darkSteel,0,-.014,-.188,1,1,1,head);
 mesh(new THREE.BoxGeometry(.026,.13,.04),m.iron,0,-.028,-.213,1,1,1,head);
 mesh(new THREE.BoxGeometry(.026,.22,.32),metal,0,.09,0,1,1,1,head);
 for(const side of [-1,1])for(let i=0;i<5;i++)mesh(sphereGeo,m.gold,side*.17,-.055+i*.034,.055,.012,.012,.012,head);
 for(let i=-2;i<=2;i++)mesh(new THREE.BoxGeometry(.01,.1,.01),m.gold,i*.048,.08,-.185,1,1,1,head);
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.36,1.43,0);body.add(arm);arms.push(arm);
  mesh(sphereGeo,metal,0,-.03,0,.185,.14,.21,arm);
  for(let i=0;i<3;i++)mesh(sphereGeo,metal,side*.014,-.11-i*.05,.005,.177-i*.014,.045,.196-i*.012,arm);
  mesh(new THREE.CylinderGeometry(.115,.085,.3,10),m.darkSteel,0,-.24,0,1,1,1,arm);
  mesh(sphereGeo,metal,0,-.40,-.01,.11,.10,.13,arm);
  mesh(new THREE.CylinderGeometry(.075,.10,.3,10),metal,0,-.53,0,1,1,1,arm);
  mesh(sphereGeo,m.leather,0,-.71,0,.09,.12,.08,arm);
  for(let i=0;i<3;i++)mesh(new THREE.TorusGeometry(.1-i*.006,.015,4,10),m.gold,0,-.42-i*.095,0,1,1,1,arm).rotation.x=Math.PI/2;
  const leg=new THREE.Group();leg.position.set(side*.15,.89,0);body.add(leg);legs.push(leg);
  mesh(new THREE.CylinderGeometry(.13,.10,.38,10),m.leather,0,-.2,0,1,1,1,leg);
  mesh(sphereGeo,metal,0,-.40,-.045,.13,.12,.12,leg);
  mesh(new THREE.CylinderGeometry(.1,.08,.33,10),metal,0,-.59,0,1,1,1,leg);
  mesh(sphereGeo,m.darkSteel,0,-.79,-.085,.12,.1,.21,leg);
  for(let i=0;i<3;i++)mesh(new THREE.BoxGeometry(.21,.025,.24),m.iron,0,-.48-i*.085,-.02,1,1,1,leg);
  // Three overlapping tassets cover the upper thighs.
  for(let i=0;i<3;i++)mesh(new THREE.BoxGeometry(.23,.1,.055),metal,side*.19,.91-i*.065,-.16-i*.006);
 }
 const capeGeo=new THREE.PlaneGeometry(.84,1.28,24,24);const capePos=capeGeo.attributes.position;
 for(let i=0;i<capePos.count;i++){
  const y=capePos.getY(i),x=capePos.getX(i),t=(.64-y)/1.28;
  const hem=t>.96?(Math.sin(x*91)*.03+Math.cos(x*57)*.018)*(t-.96)/.04:0;
  capePos.setXYZ(i,x*(.60+.69*Math.sqrt(t)),y+hem,.025+Math.sin(x*33)*(.035+t*.075)+t*t*.17-Math.abs(x)*.19);
 }
 capeGeo.computeVertexNormals();const cape=mesh(capeGeo,cloth,0,1.05,.235);const capeBase=capePos.array.slice();
 // Layered collar and exposed mail sit above the hanging, folded cloth.
 mesh(new THREE.CylinderGeometry(.22,.30,.19,16,1,true),m.darkSteel,0,1.5,0,1,1,.73);
 for(const side of [-1,1])mesh(sphereGeo,m.gold,side*.21,1.57,.18,.035,.026,.022);
 const shield=new THREE.Group();shield.position.set(-.02,-.46,-.04);shield.rotation.set(.18,0,.2);arms[0].add(shield);
 const shieldShape=new THREE.Shape();shieldShape.moveTo(-.28,.38);shieldShape.lineTo(.28,.38);shieldShape.quadraticCurveTo(.36,.06,.20,-.28);shieldShape.lineTo(0,-.43);shieldShape.lineTo(-.20,-.28);shieldShape.quadraticCurveTo(-.36,.06,-.28,.38);
 const sg=new THREE.ExtrudeGeometry(shieldShape,{depth:.06,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.025,bevelThickness:.018});
 mesh(sg,m.darkSteel,0,0,-.16,1,1,1,shield);mesh(new THREE.BoxGeometry(.035,.65,.03),m.gold,0,0,-.197,1,1,1,shield);mesh(new THREE.BoxGeometry(.45,.027,.03),m.gold,0,.17,-.20,1,1,1,shield);
 const wg=new THREE.Group();wg.position.set(0,-.7,0);arms[1].add(wg);
 setCharacterWeapon({userData:{weaponGroup:wg}},weapon,m);
 // Merge rigid pieces within each articulated joint to reduce browser draw calls.
 for(const parent of [body,head,...arms,...legs,shield]){
  const sets=new Map();for(const o of [...parent.children]){if(!o.isMesh||o===cape)continue;o.updateMatrix();const g=o.geometry.clone().applyMatrix4(o.matrix);if(!sets.has(o.material))sets.set(o.material,[]);sets.get(o.material).push(g);parent.remove(o);}
  for(const [mat,geos]of sets){const merged=new THREE.Mesh(mergeGeometries(geos),mat);merged.castShadow=true;merged.receiveShadow=true;parent.add(merged);geos.forEach(g=>g.dispose());}
 }
 root.userData={body,head,arms,legs,cape,capeBase,cloth,shield,weaponGroup:wg,beast:false};return root;
}
export function makeWeapon(kind,m){
 const g=new THREE.Group();const put=(geo,mat,x,y,z)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o;};
 const long=kind==='greatsword',spear=kind==='spear',staff=kind==='staff',club=kind==='club',axe=kind==='axe';
 if(staff||spear){put(new THREE.CylinderGeometry(.03,.045,2.2,8),m.wood,0,.64,0);put(new THREE.CylinderGeometry(.042,.042,.23,8),m.gold,0,1.6,0);if(staff){put(new THREE.OctahedronGeometry(.13,0),m.blue,0,1.82,0);}else put(new THREE.ConeGeometry(.11,.53,4),m.steel,0,1.97,0);}
 else if(axe||club){put(new THREE.CylinderGeometry(.035,.05,1.1,8),m.wood,0,.35,0);if(axe){const head=put(new THREE.CylinderGeometry(.32,.25,.09,7,1,false,0,Math.PI),m.steel,.07,.87,0);head.rotation.x=Math.PI/2;}else put(new THREE.CylinderGeometry(.13,.10,.56,8),m.wood,0,.84,0);}
 else{put(new THREE.CylinderGeometry(.035,.042,.22,8),m.leather,0,0,0);put(new THREE.SphereGeometry(.065,8,6),m.gold,0,-.16,0);put(new THREE.BoxGeometry(long?.4:.3,.038,.055),m.gold,0,.15,0);const shape=new THREE.Shape();const len=long?1.52:kind==='katana'?1.18:1.01,w=long?.13:.063;shape.moveTo(-w,.17);shape.lineTo(w,.17);shape.lineTo(w*.75,len-.14);shape.lineTo(kind==='katana'?-.045:0,len+.13);shape.lineTo(-w*.8,len-.14);shape.closePath();const blade=new THREE.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:1,steps:1});put(blade,m.steel,0,0,0);put(new THREE.BoxGeometry(.011,len-.32,.031),m.darkSteel,0,len*.52,0);}
 return g;
}
export function setCharacterWeapon(char,kind,m){const wg=char.userData.weaponGroup;if(!wg)return;while(wg.children.length)wg.remove(wg.children[0]);wg.add(makeWeapon(kind,m));wg.rotation.set(-.18,0,-.17);}
export function animateCharacter(char,time,moving,action,blocking=false,crouch=false,mounted=false){
 const d=char.userData;if(!d.body)return;
 if(d.beast){d.body.position.y=Math.sin(time*9)*moving*.09;d.body.rotation.z=Math.sin(time*5)*moving*.055;return;}
 const stride=moving?Math.sin(time*(mounted?10:8.2))*.65:0;
 d.legs[0].rotation.x=mounted?-.8:stride;d.legs[1].rotation.x=mounted?-.8:-stride;
 d.legs[0].rotation.z=mounted?.35:0;d.legs[1].rotation.z=mounted?-.35:0;
 d.arms[0].rotation.set(-stride*.4,0,.12);d.arms[1].rotation.set(stride*.4-.25,0,-.13);
 d.body.position.y=(crouch?-.35:0)+Math.abs(stride)*.04;d.body.rotation.set(crouch?.2:0,0,0);
 if(blocking){d.arms[0].rotation.x=-1.25;d.arms[0].rotation.z=-.3;}
 if(action){if(action.type==='roll'){d.body.rotation.x=-Math.PI*2*action.time/action.total;d.body.position.y+=.2;}else if(action.type==='attack'){
  const t=action.time/action.total;const a=t<.3?t/.3:t<.62?1-(t-.3)/.32:0;
  d.arms[1].rotation.x=-.8-a*1.5;d.arms[1].rotation.z=-.6+Math.sin(t*Math.PI*2)*1.25;d.body.rotation.y=Math.sin(t*Math.PI*2)*.42;
 }else if(action.type==='cast'){d.arms[1].rotation.x=-2.1;d.arms[0].rotation.x=-.9;}else if(action.type==='heal'){d.arms[0].rotation.x=-2.4;}else if(action.type==='parry'){d.arms[0].rotation.set(-1.1,0,-1+action.time*4);}}
 const pos=d.cape.geometry.attributes.position,base=d.capeBase;for(let i=0;i<pos.count;i++){const y=base[i*3+1];pos.setZ(i,base[i*3+2]+Math.sin(time*2.5+base[i*3]*7+y*3)*.04*(.8-y)+moving*Math.sin(time*7+y*5)*.11*(.6-y));}pos.needsUpdate=true;
}
export function makeHorse(m){
 const g=new THREE.Group(),legs=[];const hair=new THREE.MeshStandardMaterial({color:0x8c8a78,roughness:1});
 const add=(geo,mat,x,y,z,sx=1,sy=1,sz=1)=>{const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;g.add(mesh);return mesh;};
 add(sphereGeo,hair,0,1.2,0,.49,.54,1);add(sphereGeo,hair,0,1.65,-.8,.28,.65,.32).rotation.x=.4;add(sphereGeo,hair,0,2,-1.08,.25,.32,.49);add(sphereGeo,m.leather,0,1.69,.15,.5,.12,.58);
 for(const x of [-.31,.31])for(const z of [-.64,.65]){const leg=add(new THREE.CylinderGeometry(.095,.065,1.05,8),hair,x,.55,z);legs.push(leg);add(new THREE.BoxGeometry(.17,.13,.22),m.black,x,.06,z-.02);}
 for(const s of [-1,1]){const horn=add(new THREE.ConeGeometry(.08,.48,8),m.bone,s*.2,2.36,-1.01);horn.rotation.z=-s*.45;add(sphereGeo,m.cloth,s*.54,1.23,.48,.22,.28,.33);}
 const tail=add(new THREE.ConeGeometry(.17,.85,8),m.wood,0,1.12,1.01);tail.rotation.x=-.4;g.userData={legs};return g;
}
let sharedPointTexture;
export function pointTexture(){if(sharedPointTexture)return sharedPointTexture;const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');const gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(255,247,201,1)');gradient.addColorStop(.15,'rgba(255,220,147,.95)');gradient.addColorStop(.42,'rgba(255,211,127,.2)');gradient.addColorStop(1,'rgba(255,199,100,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);sharedPointTexture=new THREE.CanvasTexture(c);return sharedPointTexture;}
export function makeGrace(m){const g=new THREE.Group();const spiral=new THREE.CatmullRomCurve3(Array.from({length:36},(_,i)=>{const t=i/35;return V(Math.cos(t*10)*(.35-t*.25),t*1.7+.1,Math.sin(t*10)*(.35-t*.25));}));const mesh=new THREE.Mesh(new THREE.TubeGeometry(spiral,40,.021,5,false),m.glow);g.add(mesh);const ring=new THREE.Mesh(new THREE.TorusGeometry(.34,.024,5,24),m.gold);ring.rotation.x=Math.PI/2;ring.position.y=.05;g.add(ring);const light=new THREE.PointLight(0xffcd71,5,8,2);light.position.y=.7;g.add(light);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:pointTexture(),color:0xffcb71,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));sprite.position.y=.45;sprite.scale.set(1.7,2.2,1);g.add(sprite);return g;}
export function addErdtree(root,m,seed=2,x=245,y=-12,z=-530){
 const batch=new Batcher(root),rand=seeded(seed),leafTips=[];const bark=m.bark.clone();bark.color.setHex(0xb5a66c);bark.emissive.setHex(0x937222);bark.emissiveIntensity=.7;
 const bright=new THREE.MeshBasicMaterial({color:0xffe6a0});
 function branch(start,end,r1,r2,mat=bark){const mid=start.clone().lerp(end,.55);mid.x+=(rand()-.5)*start.distanceTo(end)*.22;mid.y-=start.distanceTo(end)*.12;mid.z+=(rand()-.5)*10;const curve=new THREE.CatmullRomCurve3([start,mid,end]);const geo=new THREE.TubeGeometry(curve,8,1,6,false);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const t=Math.floor(i/7)/8,center=curve.getPoint(t),r=lerp(r1,r2,t);pos.setXYZ(i,center.x+(pos.getX(i)-center.x)*r,center.y+(pos.getY(i)-center.y)*r,center.z+(pos.getZ(i)-center.z)*r);}geo.computeVertexNormals();batch.put(geo,mat,0,0,0);geo.dispose();}
 const base=V(x,y,z);let top=base.clone();for(let i=0;i<8;i++){const end=V(x+Math.sin(i*.35)*12,y+(i+1)*30,z+Math.sin(i*.7)*9);branch(top,end,17-i*1.55,16-i*1.55);top=end;}
 function grow(p,length,r,angle,depth){const end=p.clone().add(V(Math.cos(angle)*length,length*(.24+rand()*.52),Math.sin(angle)*length*.85));branch(p,end,r,r*.39,depth<2?bright:bark);if(depth<=0){for(let i=0;i<18;i++)leafTips.push(end.x+(rand()-.5)*18,end.y+(rand()-.5)*12,end.z+(rand()-.5)*16);return;}grow(end,length*(.52+rand()*.25),r*.45,angle-.2-rand()*.7,depth-1);grow(end,length*(.5+rand()*.3),r*.42,angle+.1+rand()*.85,depth-1);if(depth>2)grow(end,length*.65,r*.4,angle+1.2,depth-1);}
 for(let i=0;i<15;i++){const p=V(x+rand()*9,y+135+rand()*97,z+(rand()-.5)*8);grow(p,55+rand()*68,3.6+rand()*1.4,rand()*Math.PI*2,4);}
 // Bright longitudinal veins make the trunk read as light without concealing its volume.
 for(let i=0;i<40;i++){const a=rand()*Math.PI*2,r=14+rand()*4;const curve=new THREE.CatmullRomCurve3(Array.from({length:7},(_,j)=>V(x+Math.cos(a)*r*(1-j*.07)+Math.sin(j*.5)*10,y+j*34,z+Math.sin(a)*r*(1-j*.07))));batch.put(new THREE.TubeGeometry(curve,22,.15+rand()*.25,3,false),bright,0,0,0);}
 batch.finish();const pts=leafTips;for(let i=0;i<6500;i++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*170;pts.push(x+Math.cos(a)*r,y+245+rand()*70-Math.pow(r/170,2)*28,z+Math.sin(a)*r*.65);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));const leaves=new THREE.Points(geo,new THREE.PointsMaterial({color:0xf4d67c,size:1.45,transparent:true,opacity:.73,depthWrite:false,map:pointTexture(),blending:THREE.AdditiveBlending}));root.add(leaves);
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:pointTexture(),color:0xfada86,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false}));halo.position.set(x,y+158,z);halo.scale.set(95,360,1);root.add(halo);
}
