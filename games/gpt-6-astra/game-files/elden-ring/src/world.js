import {THREE,V,Batcher,mergeGeometries,makeGrace,makeCharacter,addErdtree,pointTexture} from './graphics.js';
import {seeded,clamp,lerp,dist} from './core.js';
import {REGIONS,BOSSES,WEAPONS} from './data.js';
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
const gauss=(x,z,cx,cz,r)=>Math.exp(-((x-cx)**2+(z-cz)**2)/(r*r));
const palette={limgrave:[0xabb08b,0x53654d],weeping:[0x8a9b89,0x52644d],stormveil:[0x9da792,0x727d62],liurnia:[0x88a2a5,0x637c78],academy:[0x869da9,0x687d79],caria:[0x7f9096,0x4b675d],caelid:[0xb7977e,0x703e30],redmane:[0xbca184,0x825d44],dragonbarrow:[0xa69679,0x74664a],altus:[0xcac090,0x969045],outskirts:[0xc5bc94,0x938951],leyndell:[0xc1b58d,0x9b916b],gelmir:[0x8b9283,0x514a39],volcano:[0x8e795f,0x57452e],snow:[0xb6c7cf,0x9bafa9],snowfield:[0xc4d2d0,0xb1beb3],sol:[0x9dadb5,0x83968f],haligtree:[0xb5c9bd,0x7e9c78],elphael:[0xb9bd9b,0x879270],farum:[0x999d94,0x7a7b6a],ashen:[0xb1a994,0x9b9785],roundtable:[0x544f3a,0x494936],siofra:[0x394858,0x53695f],ainsel:[0x4c5b63,0x3f5851],nokron:[0x465969,0x5a6e69],nokstella:[0x394c60,0x54686b],deeproot:[0x677c67,0x677757],rot:[0x7e665d,0x714036],mohgwyn:[0x735057,0x583537],sewer:[0x555f46,0x4c533b]};
export class World{
 constructor(scene,m){this.scene=scene;this.m=m;this.root=new THREE.Group();scene.add(this.root);this.solid=[];this.objects=[];this.enemies=[];this.graces=[];this.wind={value:0};this.seed=seeded(42);this.map=REGIONS.limgrave;this.id='limgrave';this.pool=[];}
 clear(){this.scene.remove(this.root);const shared=new Set(Object.values(this.m)),materials=new Set();this.root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&!shared.has(o.material))materials.add(o.material);for(const texture of o.userData?.ownedTextures||[])texture.dispose();});materials.forEach(m=>m.dispose?.());this.root=new THREE.Group();this.scene.add(this.root);this.solid=[];this.objects=[];this.enemies=[];this.graces=[];this.pool=[];this.nearGrass=null;this.coverCenter=null;}
 height(x,z){
  if(this.id!=='limgrave'){
   if(['roundtable','academy','leyndell','ashen','volcano','elphael'].includes(this.map.theme))return 0;
   const edges=smooth(30,125,Math.abs(x));return (Math.sin(x*.06)*2+Math.cos(z*.046)*1.5)*edges+smooth(70,145,Math.abs(x))*13;
  }
  let h=3+Math.sin(x*.024)*3+Math.cos(z*.031)*2+Math.sin(x*.063+z*.036)*1.5;
  h+=gauss(x,z,-5,129,42)*11+gauss(x,z,-80,-150,105)*28+gauss(x,z,-180,-325,125)*64;
  h-=gauss(x,z,130,33,65)*10;
  h+=smooth(80,200,-x)*8;
  for(const [cx,cz,r,y]of [[-35,43,22,4],[44,-66,38,7.5],[0,116,7,13.1],[-26,-135,17,24]]){const d=Math.hypot(x-cx,z-cz);h=lerp(h,y,1-smooth(r,r+15,d));}
  if(x>63&&x<76&&z>-83&&z<-67)return 7.5-smooth(-67,-80,-Math.abs(z))*0; // cellar geometry uses its own walk surface
  return h;
 }
 groundAt(x,z){if(this.id==='limgrave'&&x>63&&x<76&&z>-83&&z<-67){if(z>-73)return lerp(7.5,3.6,clamp((-z-67)/6,0,1));return 3.6;}return this.height(x,z);}
 blocked(x,z,y,r=.36){return this.solid.some(s=>y<s.y+s.h-.18&&y+1.6>s.y&&x+r>s.x-s.w/2&&x-r<s.x+s.w/2&&z+r>s.z-s.d/2&&z-r<s.z+s.d/2);}
 collider(x,y,z,w,h,d){this.solid.push({x,y,z,w,h,d});}
 box(x,y,z,w,h,d,mat=this.m.stone,solid=false,ry=0){this.batch.box(mat,x,y+h/2,z,w,h,d,ry);if(solid)this.collider(x,y,z,w,h,d);}
 column(x,y,z,r,h,mat=this.m.stone){this.batch.cylinder(mat,x,y+h/2,z,r*.82,r,h,10);this.batch.cylinder(mat,x,y+.12,z,r*1.32,r*1.4,.24,10);this.batch.cylinder(mat,x,y+h-.14,z,r*1.35,r*1.17,.28,10);}
 arch(x,y,z,r=2,h=4,depth=.8,ry=0,mat=this.m.stone){
  const s=new THREE.Shape(),t=Math.max(.32,r*.145);s.moveTo(-r,0);s.quadraticCurveTo(-r,r*1.25,0,r*1.85);s.quadraticCurveTo(r,r*1.25,r,0);s.lineTo(r-t,0);s.quadraticCurveTo(r-t,r*1.15,0,(r-t)*1.85);s.quadraticCurveTo(-r+t,r*1.15,-r+t,0);s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:.055,bevelSize:.045,bevelSegments:1,steps:1,curveSegments:8});this.batch.put(geo,mat,x,y+h,z-depth/2,1,1,1,0,ry,0);geo.dispose();
  const dx=Math.cos(ry)*(r-t*.42),dz=-Math.sin(ry)*(r-t*.42),pier=Math.max(.31,r*.11);this.column(x-dx,y,z-dz,pier,h,mat);this.column(x+dx,y,z+dz,pier,h,mat);
 }
 wall(x,y,z,w,h,d,crenels=true,mat=this.m.stone,solid=true){this.box(x,y,z,w,h,d,mat,solid);this.box(x,y+h-.15,z,w+.28,.22,d+.3,this.m.stoneLight);if(crenels)for(let px=x-w/2+.5;px<x+w/2;px+=1.8)this.box(px,y+h,z,.75,.95,d+.2,mat);for(let px=x-w/2;px<=x+w/2;px+=6)this.box(px,y,z,.75,h+1,d+.6,this.m.stoneDark);}
 tower(x,y,z,r,h,roof=false,mat=this.m.stone){
  this.batch.cylinder(mat,x,y+h/2,z,r,r*1.08,h,12);this.collider(x,y,z,r*1.7,h,r*1.7);
  for(const hy of [1,h*.48,h-.7])this.batch.cylinder(this.m.stoneLight,x,y+hy,z,r+0.23,r+.23,.3,12);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;this.box(x+Math.cos(a)*r,y+h,z+Math.sin(a)*r,.65,1.3,.65,mat);if(i%2===0){this.box(x+Math.cos(a)*(r+.03),y+h*.6,z+Math.sin(a)*(r+.03),.33,1.9,.2,this.m.black,false,-a+Math.PI/2);}}
  if(roof){this.batch.cylinder(this.m.iron,x,y+h+r*1.6,z,0,r*1.2,r*3.1,12);this.batch.cylinder(this.m.gold,x,y+h+r*3.25,z,.06,.1,r*.55,6);}
 }
 ruin(x,z,w=10,d=8,h=2){const y=this.height(x,z);this.box(x,y,z,w,.2,d,this.m.stoneDark);this.wall(x,y,z-d/2,w,h,.75,false);this.wall(x-w/2,y,z,.75,h*.8,d,false);this.wall(x+w/2,y,z,.75,h*.55,d,false);for(let i=0;i<14;i++){const px=x+(this.seed()-.5)*w,pz=z+(this.seed()-.5)*d;this.batch.put(new THREE.DodecahedronGeometry(.4,0),this.m.stone,px,this.height(px,pz)+.2,pz,.6+this.seed(),.7,.7,0,this.seed()*6,0);}}
 terrain(){
  const lim=this.id==='limgrave',sizeX=lim?650:340,sizeZ=lim?760:470,centerZ=lim?-85:-60,segX=lim?180:85,segZ=lim?200:115;
  const g=new THREE.PlaneGeometry(sizeX,sizeZ,segX,segZ);g.rotateX(-Math.PI/2);g.translate(0,0,centerZ);const p=g.attributes.position,colors=[],c1=new THREE.Color(palette[this.map.theme][1]).lerp(new THREE.Color(0xd3d1ae),.55),c2=new THREE.Color(0xaaa58c);const uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,this.height(x,z));uv.setXY(i,x/13,z/13);let road=lim?Math.exp(-((x-(z>30?-25:24+Math.sin(z*.021)*19))**2)/21):Math.exp(-x*x/90);const slope=Math.abs(this.height(x+1,z)-this.height(x,z))+Math.abs(this.height(x,z+1)-this.height(x,z));const c=c1.clone().lerp(c2,clamp(slope*.5+road*.7,0,1));c.multiplyScalar(.9+this.seed()*.17);colors.push(c.r,c.g,c.b);}
  if(lim){const old=g.index.array,idx=[];for(let i=0;i<old.length;i+=3){const x=(p.getX(old[i])+p.getX(old[i+1])+p.getX(old[i+2]))/3,z=(p.getZ(old[i])+p.getZ(old[i+1])+p.getZ(old[i+2]))/3;if(!(x>62&&x<77&&z>-84&&z<-66))idx.push(old[i],old[i+1],old[i+2]);}g.setIndex(idx);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();const mat=this.m.ground.clone();mat.vertexColors=true;mat.color.setHex(0xffffff);if(['snow','snowfield','sol'].includes(this.map.theme))mat.color.setHex(0xe8eded);const mesh=new THREE.Mesh(g,mat);mesh.receiveShadow=true;mesh.userData.uniqueMaterial=true;this.root.add(mesh);
 }
 rock(x,z,s=4){const y=this.height(x,z);const geo=new THREE.DodecahedronGeometry(1,1);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const k=.88+this.seed()*.24;p.setXYZ(i,p.getX(i)*k,p.getY(i)*k,p.getZ(i)*k);}geo.computeVertexNormals();this.batch.put(geo,this.m.rock,x,y+s*.2,z,s,s*(.35+this.seed()*.45),s*(.6+this.seed()*.5),this.seed()*.3,this.seed()*6,this.seed()*.2);geo.dispose();if(s>3)this.collider(x,y,z,s*.8,s*.6,s*.8);}
 trees(){
  if(['academy','volcano','roundtable','farum','ashen','rot','mohgwyn','sewer'].includes(this.map.theme))return;
  const rand=this.seed,lim=this.id==='limgrave',gold=['limgrave','altus','outskirts','leyndell','weeping'].includes(this.map.theme),snow=['snow','snowfield','sol'].includes(this.map.theme);
  const leafC=document.createElement('canvas');leafC.width=leafC.height=128;const ctx=leafC.getContext('2d');ctx.clearRect(0,0,128,128);
  for(let i=0;i<65;i++){const x=rand()*108+10,y=rand()*108+10;ctx.fillStyle=`rgba(${gold?150+Math.floor(rand()*65):75+Math.floor(rand()*70)},${gold?133+Math.floor(rand()*50):105+Math.floor(rand()*55)},${gold?55+Math.floor(rand()*35):70+Math.floor(rand()*50)},.93)`;ctx.beginPath();ctx.ellipse(x,y,4+rand()*8,2+rand()*6,rand()*3,0,Math.PI*2);ctx.fill();}
  const texture=new THREE.CanvasTexture(leafC);texture.colorSpace=THREE.SRGBColorSpace;
  const mat=new THREE.MeshStandardMaterial({map:texture,alphaTest:.45,side:THREE.DoubleSide,roughness:1,color:snow?0xc6cfc9:0xd2d6b5});
  const cards=[];const dummy=new THREE.Object3D();const plane=new THREE.PlaneGeometry(1,1);
  for(let i=0;i<(lim?230:80);i++){
   const x=(rand()-.5)*(lim?450:280),z=(rand()-.5)*(lim?590:330)-(lim?50:30);
   if(lim&&((dist({x,z},{x:-35,z:43})<25)||(dist({x,z},{x:44,z:-66})<41)||(dist({x,z},{x:0,z:116})<16)||x>80&&z>0&&z<100))continue;
   if(!lim&&(Math.abs(x)<28||z<-120))continue;
   const y=this.height(x,z),h=5+rand()*9;
   this.batch.cylinder(this.m.bark,x,y+h*.45,z,.12,h*.045,h*.9,7);this.collider(x,y,z,.65,h,.65);
   for(let j=0;j<5;j++){const a=j*1.8+rand(),bx=x+Math.cos(a)*h*.25,bz=z+Math.sin(a)*h*.25,by=y+h*(.58+rand()*.24);const from=V(x,y+h*.4,z),to=V(bx,by,bz);const g=new THREE.CylinderGeometry(.04,.13,from.distanceTo(to),5);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0,1,0),to.clone().sub(from).normalize()));g.translate(...from.add(to).multiplyScalar(.5).toArray());this.batch.put(g,this.m.bark,0,0,0);g.dispose();}
   if(['caelid','dragonbarrow','gelmir'].includes(this.map.theme)&&rand()<.65)continue;
   for(let j=0;j<65;j++){const a=rand()*6.28,r=Math.sqrt(rand())*h*.34;dummy.position.set(x+Math.cos(a)*r,y+h*.63+rand()*h*.43,z+Math.sin(a)*r);dummy.scale.set(h*.29,h*.25,1);dummy.rotation.set(rand()*3,rand()*6,rand()*3);dummy.updateMatrix();cards.push(plane.clone().applyMatrix4(dummy.matrix));}
  }
  if(cards.length){const leaves=new THREE.Mesh(mergeGeometries(cards),mat);leaves.castShadow=true;leaves.receiveShadow=true;leaves.userData.uniqueMaterial=true;leaves.userData.ownedTextures=[texture];this.root.add(leaves);for(const g of cards)g.dispose();}plane.dispose();
 }
 grass(){
  if(['academy','volcano','roundtable','farum','ashen','sewer','rot','mohgwyn'].includes(this.map.theme))return;
  const rand=this.seed,lim=this.id==='limgrave',verts=[],colors=[];const base=new THREE.Color(palette[this.map.theme][1]);
  for(let i=0;i<(lim?44000:15000);i++){const x=(rand()-.5)*(lim?390:250),z=(rand()-.5)*(lim?460:300)+(lim?0:-40);if(lim&&((x>85&&z>2&&z<95)||(x>-44&&x<-26&&z>31&&z<55)))continue;const route=lim?(z>30?-25:24+Math.sin(z*.021)*19):0;if(Math.abs(x-route)<3.5&&rand()<.95)continue;if(this.solid.some(s=>Math.abs(x-s.x)<s.w*.6&&Math.abs(z-s.z)<s.d*.6))continue;const y=this.height(x,z),h=.22+rand()*.48,w=.015+rand()*.025,a=rand()*6.28;const dx=Math.cos(a)*w,dz=Math.sin(a)*w,bend=.10+rand()*.12;verts.push(x-dx,y,z-dz,x+dx,y,z+dz,x+dx+bend,y+h,z+dz+.08);const c=base.clone().multiplyScalar(.65+rand()*.65);colors.push(c.r*.6,c.g*.6,c.b*.6,c.r*.7,c.g*.7,c.b*.7,c.r*1.2,c.g*1.2,c.b*.83);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();
  const mat=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:1});mat.onBeforeCompile=shader=>{shader.uniforms.windTime=this.wind;shader.vertexShader='uniform float windTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x += sin(position.x*.24+position.z*.3+windTime*1.7)*.07;');};
  const grass=new THREE.Mesh(g,mat);grass.receiveShadow=true;grass.userData.uniqueMaterial=true;this.root.add(grass);
 }
 water(x,z,w,d,y,color=0x58716b){const mat=this.m.water.clone();mat.color.setHex(color);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,d,30,30),mat);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);mesh.receiveShadow=true;mesh.userData.uniqueMaterial=true;this.root.add(mesh);this.waterMesh=mesh;}
 grace(id,label,x,z){const y=this.groundAt(x,z),mesh=makeGrace(this.m);mesh.position.set(x,y+.08,z);this.root.add(mesh);const o={type:'grace',id,label,x,z,y,mesh};this.graces.push(o);this.objects.push(o);}
 loot(id,label,x,z,kind,value=1){const mesh=new THREE.Group();const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:pointTexture(),color:kind==='fragment'?0xcac699:0xbfd9f7,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));glow.scale.set(.8,2,1);glow.position.y=.7;mesh.add(glow);mesh.position.set(x,this.groundAt(x,z)+.15,z);this.root.add(mesh);this.objects.push({type:'loot',id,label,x,z,y:mesh.position.y,kind,value,mesh});}
 npc(id,label,x,z,color=0x745345){const mesh=makeCharacter(this.m,{color});mesh.position.set(x,this.groundAt(x,z),z);mesh.rotation.y=Math.PI;this.root.add(mesh);this.objects.push({type:'npc',id,label,x,z,y:mesh.position.y,mesh});}
 enemy(id,x,z,kind='soldier',bossId=null,requires=null){
  const b=bossId?BOSSES[bossId]:null;const weapon=b?.weapon||(['knight','spear'].includes(kind)?'spear':'longsword');const mesh=makeCharacter(this.m,{color:b?.color||0x636747,scale:b?.scale||1,weapon:WEAPONS[weapon]?.kind||weapon,spectral:b?.spectral,beast:b?.beast,serpent:b?.serpent});mesh.position.set(x,this.groundAt(x,z),z);this.root.add(mesh);
  const e={id,x,z,y:mesh.position.y,home:{x,z},hp:b?.hp||(kind==='knight'?330:170),maxHp:b?.hp||(kind==='knight'?330:170),mesh,kind,bossId,boss:b,requires,phase:1,action:null,mode:'idle',timer:this.seed()*3,attackIndex:0,yaw:Math.PI,aggro:false,stance:0,stagger:0,bleed:0,hitFlash:0,dead:false,reward:b?.reward||(kind==='knight'?230:85),radius:b?Math.min(1.5,b.scale*.55):.42};this.enemies.push(e);return e;
 }
 church(){const x=-35,z=43,y=4;this.box(x,y-.22,z,17,.25,22,this.m.stoneDark);this.wall(x-8,y,z,1,5.2,22,false);this.wall(x+8,y,z+7,1,3.5,8,false);this.wall(x+8,y,z-8,1,6,6,false);this.wall(x,y,z-11,16,4.6,1,false);this.wall(x-5.5,y,z+11,5,5.4,1,false);this.wall(x+5.5,y,z+11,5,4.2,1,false);this.arch(x,y,z+11,3,3.8,1);this.arch(x+8,y,z,2.2,2.7,1,Math.PI/2);
  for(let i=0;i<3;i++){this.arch(x-7.65,y+1.8,z-6+i*6,1.45,2.3,.5,Math.PI/2,this.m.stoneLight);this.box(x-8.55,y,z-8+i*7,1.5,6.2,1.2,this.m.stoneDark);}
  for(let i=0;i<30;i++){const rx=x+(this.seed()-.5)*15,rz=z+(this.seed()-.5)*22;this.batch.put(new THREE.DodecahedronGeometry(.3,0),this.m.stone,rx,y+.25,rz,.5+this.seed()*2,.6,.8,0,this.seed()*6,.2);}
  // Broken gable and exposed timbers, never a invented full roof.
  this.wall(x-4,y+4.6,z-11,6,2.5,.9,false);this.box(x-2,y+7,z-11,1.2,1.3,.9);this.batch.box(this.m.wood,x-2,y+4.1,z-3,.24,.24,13,.19,.12);
  this.box(x,y,z-8,4,.8,1.7,this.m.stoneLight);this.box(x,y+.8,z-8,4.4,.18,2.1,this.m.stoneLight);
  for(let i=0;i<5;i++){this.batch.cylinder(this.m.bone,x-1.4+i*.7,y+1.14,z-8,.05,.055,.32,6);this.batch.put(new THREE.ConeGeometry(.055,.16,6),this.m.fire,x-1.4+i*.7,y+1.38,z-8);}
  this.fire(x+5,z-4);this.npc('kale','Merchant Kalé',x+5,z-6,0x8a3630);this.box(x+3,y,z-5,1.2,.5,.8,this.m.wood,true);this.box(x-5,y,z+5,1.5,.8,.9,this.m.iron,true);
  this.objects.push({type:'smith',id:'anvil',label:'Use smithing table',x:x-5,z:z+5});this.grace('elleh','Church of Elleh',x-1,z+2);
 }
 fire(x,z){const y=this.height(x,z);for(let i=0;i<7;i++)this.batch.put(new THREE.DodecahedronGeometry(.17,0),this.m.rock,x+Math.cos(i)*.45,y+.1,z+Math.sin(i)*.45);this.batch.box(this.m.wood,x,y+.1,z,.75,.12,.15,.7);const light=new THREE.PointLight(0xffad52,6,12,2);light.position.set(x,y+.8,z);this.root.add(light);const flame=new THREE.Sprite(new THREE.SpriteMaterial({map:pointTexture(),color:0xffab3b,blending:THREE.AdditiveBlending,depthWrite:false}));flame.position.set(x,y+.4,z);flame.scale.set(1.1,1.8,1);this.root.add(flame);this.pool.push({type:'fire',mesh:flame,light});}
 tent(x,z){const y=this.height(x,z),verts=[-2,0,-2,2,0,-2,0,2.4,-2,-2,0,2,0,2.4,2,2,0,2,-2,0,-2,0,2.4,-2,0,2.4,2,-2,0,-2,0,2.4,2,-2,0,2,2,0,-2,2,0,2,0,2.4,2,2,0,-2,0,2.4,2,0,2.4,-2];const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.computeVertexNormals();const mat=this.m.cloth.clone();mat.side=THREE.DoubleSide;this.batch.put(g,mat,x,y,z);this.box(x,y,z+2,.09,2.6,.09,this.m.wood);this.box(x,y,z-2,.09,2.6,.09,this.m.wood);}
 carriage(x,z){const y=this.height(x,z);this.box(x,y+.6,z,2.5,1,4.6,this.m.wood,true);this.box(x,y+1.6,z,2.7,.13,4.8,this.m.iron);for(const sx of [-1.5,1.5])for(const sz of [-1.6,1.6]){const g=new THREE.TorusGeometry(.66,.1,5,14);g.rotateY(Math.PI/2);this.batch.put(g,this.m.wood,x+sx,y+.66,z+sz);for(let a=0;a<6;a++)this.batch.box(this.m.wood,x+sx,y+.66,z+sz,.075,1.3,.075,0,a*Math.PI/3);}}
 gatefront(){const x=44,z=-66;for(const [dx,dz,w,d,h]of [[-16,13,9,7,2],[17,16,11,7,1.6],[-18,-5,12,9,3],[16,-12,10,7,2.2],[-13,-24,9,7,1.7]])this.ruin(x+dx,z+dz,w,d,h);this.carriage(x-8,z+29);this.carriage(x+20,z-24);this.tent(x+16,z+4);this.tent(x-19,z+29);const y=this.height(x,z);this.box(x+4,y,z,1,.4,1.1,this.m.stoneLight,true);this.column(x+4,y+.4,z,.34,3.6);this.box(x+4,y+4,z,1.1,.3,.9,this.m.stoneLight);this.loot('limgrave-map','Map: Limgrave, West',x+4,z,'fragment','limgrave');this.loot('lordsworn','Lordsworn’s Greatsword',x-8,z+28,'weapon','greatsword');
  for(const [dx,dz]of [[-2,10],[7,-11],[-19,-7],[12,20],[-13,-21],[19,2],[-5,31]])this.enemy('gate-soldier-'+dx,x+dx,z+dz,'soldier');this.enemy('gate-knight',x+1,z-13,'knight');
  this.grace('gatefront','Gatefront',20,-94);this.grace('agheel','Agheel Lake North',75,-35);
  // Open stairwell and a traversable cellar, with a bounded stone chamber below grade.
  this.box(69.5,3.2,-77,13,.4,13,this.m.stoneDark);for(const xx of [62.5,76.5])this.wall(xx,3.5,-77,.6,4,13,false);this.wall(69.5,3.5,-83,14,4,.6,false);
  for(let i=0;i<8;i++)this.box(69.5,3.6+(7-i)*.47,-67.4-i*.77,12,.4,.9,this.m.stoneDark);
  this.box(69.5,3.6,-81,2,.7,1.1,this.m.wood);this.loot('whetstone','Whetstone Knife & Storm Stomp',69.5,-80,'ash');
  for(const [bx,bz]of [[21,-54],[62,-50],[37,-88]]){const by=this.height(bx,bz);this.box(bx,by,bz,.085,5,.085,this.m.wood);this.batch.box(this.m.clothRed,bx+.45,by+4,bz,.85,1.9,.04);}
 }
 castleVista(){
  const x=-160,z=-340,y=this.height(x,z)+13;
  for(let i=0;i<17;i++){const px=x+(i-8)*9,pz=z+this.seed()*55;this.batch.put(new THREE.CylinderGeometry(4+this.seed()*4,7,65,5),this.m.rock,px,y-20,pz,1,1,1,0,this.seed()*6,0);}
  this.wall(x,y,z,104,17,9);this.wall(x-45,y,z-28,10,23,58);this.wall(x+45,y,z-25,10,26,62);
  for(const [dx,dz,r,h]of [[-51,3,7,27],[-21,5,6,33],[12,4,5,27],[49,4,7,36],[-37,-39,7,39],[28,-40,8,43],[0,-58,10,55]])this.tower(x+dx,y,z+dz,r,h,false);
  for(let i=0;i<7;i++)this.arch(x-33+i*11,y+18,z+4,3.8,4,2);
  this.box(x,y+12,z-35,45,27,34,this.m.stoneDark);for(let i=0;i<5;i++)this.tower(x-18+i*9,y+35,z-47,2.5,15,false);
  // The broken great bridge leads toward Limgrave's Divine Tower.
  for(let i=0;i<7;i++){
   const bx=-78+i*39,bz=-270+i*8,base=8;this.arch(bx,base,bz,15,24,8);
   const spandrel=new THREE.Shape();spandrel.moveTo(-18.5,0);spandrel.lineTo(-15,0);spandrel.quadraticCurveTo(-15,18.75,0,27.75);spandrel.quadraticCurveTo(15,18.75,15,0);spandrel.lineTo(18.5,0);spandrel.lineTo(18.5,29);spandrel.lineTo(-18.5,29);spandrel.closePath();
   const fill=new THREE.ExtrudeGeometry(spandrel,{depth:7.7,bevelEnabled:false,steps:1,curveSegments:12});this.batch.put(fill,this.m.stoneDark,bx,32,bz-3.85);fill.dispose();
   this.wall(bx,59.5,bz,37,3.8,10,false);
   for(const side of [-1,1]){
    const px=bx+side*17.1;this.box(px,base-5,bz,7.8,51.5,10,this.m.stoneDark);
    for(const level of [15,34,54])this.box(px,level,bz,8.4,.75,10.7,this.m.stoneLight);
    for(const face of [-1,1])this.box(px,base-5,bz+face*5.1,3.1,50,1.5,this.m.stoneDark);
   }
  }
  this.tower(240,2,-202,13,90,false,this.m.stoneDark);
 }
 limgrave(){
  this.terrain();this.water(139,49,99,113,1.2);this.castleVista();addErdtree(this.root,this.m);
  this.church();this.gatefront();
  this.grace('first','The First Step',0,116);this.npc('varre','White Mask Varré',-6,112,0xa7a992);
  for(const [x,z,s]of [[-12,126,8],[8,132,10],[-65,39,8],[-16,34,5],[-38,10,6],[76,121,12],[-109,120,18],[-118,77,17],[-100,6,13],[-92,-80,16],[108,-20,14],[95,-130,20],[-53,-142,16],[-5,-161,17]])this.rock(x,z,s);
  for(let i=0;i<140;i++){const x=(this.seed()-.5)*450,z=(this.seed()-.5)*470-15;if(dist({x,z},{x:-35,z:43})>25&&dist({x,z},{x:44,z:-66})>42)this.rock(x,z,.6+this.seed()*3.8);}
  for(let i=0;i<7;i++)this.ruin(-79+i*5,84+i*6,2,1.3,1.2);
  // Stormgate is embedded in its escarpment, with an open arch through the wall.
  this.wall(-44,24,-137,23,20,7);this.wall(-5,24,-137,23,20,7);this.arch(-25,24,-137,7.2,10,7);this.box(-25,47,-137,15,5,7);this.tower(-44,23,-142,4,27);this.tower(-5,23,-142,4,27);
  this.enemy('road-guard',-25,9);this.enemy('road-guard-2',-13,-21);this.enemy('forest-guard',-6,53);this.enemy('stormgate-spear',-22,-112,'spear');
  this.loot('smithing-1','Smithing Stone',-51,37,'stones',2);this.loot('smithing-2','Smithing Stone',59,-59,'stones',2);this.loot('golden-seed','Golden Seed',-8,-124,'seeds',1);this.loot('dectus-left','Dectus Medallion, left half',147,95,'quest','dectusLeft');
  this.npc('melina','Melina',18,-98,0x66533d);this.loot('pebble-staff','Astrologer’s Staff',-29,37,'weapon','staff');
  const positions=[[-25,-154],[43,179],[174,-26],[143,23],[122,74],[-93,-121]];
  this.addExits(positions);this.trees();this.grass();
 }
 addExits(positions){this.map.exits.forEach((exit,i)=>{const p=positions?.[i]||[-55+(i%5)*28,-141-Math.floor(i/5)*20];const [x,z]=p,y=this.groundAt(x,z);this.objects.push({type:'exit',id:'exit-'+exit.to,label:exit.label,x,z,y,...exit});this.column(x-2,y,z,.3,3.7,this.m.stoneLight);this.column(x+2,y,z,.3,3.7,this.m.stoneLight);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:pointTexture(),color:this.map.layer==='underground'?0x8cafe3:0xe2c681,opacity:.65,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sprite.position.set(x,y+2,z);sprite.scale.set(2.1,4,1);this.root.add(sprite);});}
 dungeon(){
  const t=this.map.theme;this.terrain();
  if(this.map.layer==='underground'){
   const ceiling=new THREE.Mesh(new THREE.SphereGeometry(550,24,16),new THREE.MeshBasicMaterial({color:0x0c171f,side:THREE.BackSide}));ceiling.position.y=15;this.root.add(ceiling);const ps=[];for(let i=0;i<1500;i++)ps.push((this.seed()-.5)*700,65+this.seed()*100,(this.seed()-.5)*650);const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));this.root.add(new THREE.Points(pg,new THREE.PointsMaterial({color:0x9bd9e4,size:.35})));for(let i=0;i<18;i++){const x=(i%2?-1:1)*(50+this.seed()*80),z=(this.seed()-.5)*310;this.column(x,0,z,2+this.seed()*4,65+this.seed()*30,this.m.stoneDark);}
  }
  const start=90;this.grace('arrival',this.map.grace,0,start);this.loot(this.id+'-fragment','Map: '+this.map.name,6,start-6,'fragment',this.id);this.loot(this.id+'-stones','Smithing Stones',-8,60,'stones',3);this.loot(this.id+'-runes','Golden Rune',15,26,'runes',700);
  if(['liurnia','siofra','ainsel','nokstella','nokron','deeproot','rot','mohgwyn'].includes(t)){
   this.water(0,-45,275,250,-.13,t==='rot'?0x943b28:t==='mohgwyn'?0x4f121e:0x53767b);
   for(let i=0;i<12;i++){this.column((i%2?-1:1)*(23+Math.floor(i/2)*4),0,50-Math.floor(i/2)*24,.8,10+i%3*4,this.m.stoneLight);}
   if(['nokron','nokstella','mohgwyn'].includes(t))for(let side of [-1,1])for(let i=0;i<5;i++){this.box(side*(48+i%2*15),0,40-i*30,21,15+i%2*7,20,this.m.stoneDark);this.tower(side*(48+i%2*15),18,40-i*30,4,15,true);this.arch(side*34,0,40-i*30,3,5,1);}
   if(t==='liurnia'){for(let i=0;i<13;i++){this.tower(-80+i*14,13+i%3*7,-180,3+this.seed()*3,40+this.seed()*23,true);}this.loot('academy-key','Academy Glintstone Key',-56,14,'quest','key');this.npc('albus','Albus',-35,62,0x857968);}
   if(t==='deeproot'){for(let i=0;i<8;i++){this.batch.put(new THREE.CylinderGeometry(1.3,3,120,8),this.m.bark,(i-4)*20,10,-35,1,1,1,0,0,1.25);}this.npc('fia','Fia',-14,44,0x303730);}
   if(t==='nokstella')this.loot('miniature-ranni','Miniature Ranni',-8,26,'quest','miniRanni');
  }else if(t==='stormveil'){
   this.wall(-35,0,-20,8,22,200);this.wall(35,0,-28,8,30,200);for(const x of [-32,32])for(const z of [75,0,-95])this.tower(x,0,z,5,33,false);
   this.arch(0,0,70,7,8,3);this.box(-17,0,40,20,.3,45,this.m.stoneDark);this.arch(-24,0,35,4,5,2,Math.PI/2);this.box(-28,0,0,9,9,32,this.m.stoneDark,true);
   for(let i=0;i<4;i++){this.arch(-26,2,-45+i*15,4,4,1,Math.PI/2);this.arch(26,2,-45+i*15,4,4,1,Math.PI/2);}
   for(let i=0;i<7;i++)this.box(-22,0,49-i*3,9,i*.55+.3,3,this.m.stoneLight);
   this.wall(0,0,-168,72,24,4);this.arch(0,0,-166,4,7,2);this.tower(0,20,-180,10,29,false);this.grace('rampart','Rampart Tower',-18,15);
  }else if(t==='academy'){
   const floor=this.m.stoneLight;this.box(0,-.3,-20,74,.3,245,floor);for(let s of [-1,1]){this.wall(s*38,0,-20,2,20,230,false,this.m.stoneDark);for(let i=0;i<9;i++){const z=80-i*26;this.arch(s*36,0,z,6,10,1,Math.PI/2);this.column(s*24,0,z,1,19);this.tower(s*40,16,z,2,13,true);}}
   for(let i=0;i<10;i++){this.box(-31,0,58-i*18,4,7,12,this.m.wood);for(let j=0;j<4;j++)this.box(-28.7,1+j*1.4,58-i*18,.5,.85,10,this.m.clothRed);}
   const sphere=new THREE.Mesh(new THREE.SphereGeometry(8,24,16),new THREE.MeshBasicMaterial({color:0xc0d7e3,transparent:true,opacity:.3}));sphere.position.set(0,25,-108);this.root.add(sphere);this.pool.push({type:'orb',mesh:sphere});
  }else if(t==='leyndell'||t==='ashen'||t==='outskirts'||t==='elphael'){
   const ash=t==='ashen';for(let s of [-1,1])for(let i=0;i<7;i++){const x=s*(24+i%3*12),z=70-i*30,h=9+i%3*5;this.box(x,0,z,18,h,22,this.m.stoneLight,true);this.batch.put(new THREE.ConeGeometry(16,8,4),ash?this.m.ash:this.m.gold,x,h+3,z,1,1,1,0,Math.PI/4,0);for(let j=0;j<3;j++)this.arch(x-5+j*5,2,z+11,1.5,3,1);}
   for(let i=0;i<7;i++)this.arch(-75+i*25,20,-220,9,23,5,0,this.m.stoneLight);
   this.tower(-68,15,-185,12,95,true);this.tower(67,15,-185,10,83,true);addErdtree(this.root,this.m,7,40,-20,-280);
   if(!ash)this.npc('goldmask','Goldmask',-14,59,0xa39358);if(t==='leyndell')this.npc('dungeater','Dung Eater',19,39,0x79634c);
  }else if(t==='roundtable'){
   this.box(0,-.2,0,70,.2,100,this.m.stoneDark);this.wall(0,0,-40,70,16,2,false);this.wall(-34,0,0,2,16,82,false);this.wall(34,0,0,2,16,82,false);this.box(0,16,0,70,1,90,this.m.wood);for(let i=0;i<12;i++){const a=i*Math.PI/6;this.column(Math.cos(a)*21,0,Math.sin(a)*21,.75,15,this.m.stoneLight);}this.batch.cylinder(this.m.wood,0,1.3,0,7,7,1,28);for(let i=0;i<12;i++){const a=i*Math.PI/6;this.box(Math.sin(a)*9,0,Math.cos(a)*9,1.3,1.5,1.3,this.m.wood);this.box(Math.sin(a)*9,1.5,Math.cos(a)*9,1.3,1.3,.2,this.m.wood);}this.fire(0,0);this.npc('hewg','Smithing Master Hewg',-20,-10,0x847160);this.npc('roderika','Roderika',17,-10,0x982f26);this.npc('twinmaidens','Twin Maiden Husks',25,14,0x525e50);this.graces[0].mesh.position.z=18;this.graces[0].z=18;this.npc('garr','Brother Corhyn',-17,16,0x928362);
  }else if(t==='volcano'||t==='gelmir'){
   this.water(0,-54,290,310,-.2,0xbd471e);for(let i=0;i<12;i++){const x=(i%2?-1:1)*(40+this.seed()*70),z=50-i*19;this.rock(x,z,12+this.seed()*12);this.fire(x,z);}if(t==='volcano'){for(let s of [-1,1]){this.wall(s*35,0,-12,2,19,230,false);for(let i=0;i<7;i++)this.arch(s*34,0,65-i*30,5,10,2,Math.PI/2);}this.npc('tanith','Tanith',-13,69,0x793e2d);}
  }else if(t==='farum'){
   for(let i=0;i<15;i++){const x=(i%2?-1:1)*(25+this.seed()*75),z=65-i*17;this.column(x,this.seed()*15,z,2,20+this.seed()*22);this.batch.box(this.m.stoneLight,x,17+this.seed()*30,z,12,2,18,this.seed()*2,.1);}
   for(let i=0;i<5;i++)this.arch(0,0,55-i*46,14,9,2);this.water(0,-40,500,550,-30,0x758b91);
  }else if(t==='haligtree'){
   this.batch.cylinder(this.m.bark,80,30,-80,25,36,180,14);for(let i=0;i<10;i++){const x=(i-5)*18;this.batch.put(new THREE.CylinderGeometry(1,4,155,8),this.m.bark,x,-2,0,1,1,1,0,0,1.51);this.arch(x,0,-135,6,6,1);}
  }else if(t==='sewer'){
   for(const x of [-15,15]){this.wall(x,0,-15,3,9,230,false,this.m.stoneDark);for(let i=0;i<10;i++)this.batch.put(new THREE.TorusGeometry(2.8,.32,6,14),this.m.iron,x*.75,4,75-i*23,1,1,1,0,Math.PI/2,0);}this.box(0,10,-15,35,2,240,this.m.stoneDark);this.water(0,-25,22,210,.06,0x414d33);this.npc('threefingers','The Three Fingers',0,-125,0xc1a486);
  }else{
   const red=['caelid','redmane','dragonbarrow'].includes(t);for(let i=0;i<35;i++){const x=(i%2?-1:1)*(24+this.seed()*110),z=(this.seed()-.5)*360-40;this.rock(x,z,3+this.seed()*12);}if(['caria','sol','weeping','redmane'].includes(t)){for(let s of [-1,1]){this.wall(s*36,0,-15,5,16,210);this.tower(s*36,0,-105,6,29,true);}this.wall(0,0,-147,78,16,4);for(let i=0;i<5;i++)this.arch(-24+i*12,0,-145,3.5,6,2);}
   if(t==='caria')this.npc('ranni','Ranni the Witch',-17,54,0x727d99);if(t==='dragonbarrow')this.loot('dectus-right','Dectus Medallion, right half',25,-74,'quest','dectusRight');
   if(t==='altus'){addErdtree(this.root,this.m,8,180,-30,-460);this.npc('corhyn','Brother Corhyn',-16,57,0x847b56);}
   if(['snow','snowfield','sol'].includes(t)){for(let i=0;i<8;i++){const x=(i%2?-1:1)*(90+this.seed()*70),z=-150-this.seed()*160;this.batch.put(new THREE.ConeGeometry(60,120+this.seed()*90,6),this.m.snow,x,60,z,1,1,1,0,this.seed()*3,0);}}
  }
  const bosses=Array.isArray(this.map.bosses)?this.map.bosses:[];
  bosses.forEach((id,i)=>{const z=20-i*50;this.enemy('boss-'+id,0,z,'boss',id,i?bosses[i-1]:null);if(i>0){this.grace('boss-'+i,'Inner '+this.map.name,-15,z+18);}});
  if(t!=='roundtable'&&bosses.length<2){for(let i=0;i<4;i++)this.enemy(this.id+'-guard-'+i,(i%2?-1:1)*(10+i*2),42-i*27,i===3?'knight':'soldier');}
  this.addExits();this.trees();this.grass();
 }
 load(id,save){this.clear();this.id=id;this.map=REGIONS[id];this.seed=seeded(Object.keys(REGIONS).indexOf(id)*714+412);this.batch=new Batcher(this.root);this.waterMesh=null;if(id==='limgrave')this.limgrave();else this.dungeon();this.batch.finish();
  for(const o of this.objects)if(o.type==='loot'&&save.loot.includes(o.id))o.mesh.visible=false;
  for(const e of this.enemies)if(e.bossId&&save.defeated.includes(e.bossId)){e.dead=true;e.mesh.visible=false;}
  this.scene.fog=new THREE.FogExp2(palette[this.map.theme][0],id==='limgrave'?.0027:this.map.layer==='underground'?.008:.005);
  this.bounds=id==='limgrave'?{x:225,minZ:-177,maxZ:199}:{x:130,minZ:-175,maxZ:115};
  return {tint:palette[this.map.theme][0],underground:this.map.layer==='underground',indoor:['roundtable','academy','sewer','volcano'].includes(this.map.theme)};
 }
 update(time,dt){this.wind.value=time;for(const o of this.graces)o.mesh.children[0].rotation.y=time*.4;for(const o of this.pool){if(o.type==='fire'){o.mesh.scale.y=1.65+Math.sin(time*8)*.2;o.light.intensity=5+Math.sin(time*9)*.7;}else o.mesh.rotation.y=time*.2;}if(this.waterMesh)this.waterMesh.material.roughness=.28+Math.sin(time*.6)*.035;}
 updateGroundCover(cx,cz){
  if(!['limgrave','weeping','altus','outskirts','caria','elphael','liurnia'].includes(this.map.theme))return;
  if(this.coverCenter&&Math.hypot(cx-this.coverCenter.x,cz-this.coverCenter.z)<9)return;
  this.coverCenter={x:cx,z:cz};if(this.nearGrass){this.root.remove(this.nearGrass);this.nearGrass.geometry.dispose();this.nearGrass.material.dispose();}
  const rand=seeded(91),p=[],colors=[],top=new THREE.Color(0xb1b66a),bottom=new THREE.Color(0x43533a);
  for(let i=0;i<30000;i++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*29,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
   if(this.id==='limgrave'&&((x>-44&&x<-26&&z>31&&z<55)||(x>62&&x<77&&z>-84&&z<-66)||(x>85&&z>0&&z<100)))continue;
   const path=this.id==='limgrave'?(z>30?-25:24+Math.sin(z*.021)*19):0;if(Math.abs(x-path)<2.4&&rand()<.95)continue;
   if(this.solid.some(s=>Math.abs(x-s.x)<s.w*.52&&Math.abs(z-s.z)<s.d*.52))continue;
   const y=this.groundAt(x,z),h=.19+rand()*.51,w=.010+rand()*.020,rot=rand()*6.28,dx=Math.cos(rot)*w,dz=Math.sin(rot)*w,bx=Math.sin(a)*.16,bz=Math.cos(a)*.16;
   const midA=[x-dx*.6+bx*.30,y+h*.55,z-dz*.6+bz*.30],midB=[x+dx*.6+bx*.30,y+h*.55,z+dz*.6+bz*.30];
   p.push(x-dx,y,z-dz,x+dx,y,z+dz,...midB,x-dx,y,z-dz,...midB,...midA,...midA,...midB,x+bx,y+h,z+bz);
   const variation=.65+rand()*.50;for(const mix of [0,0,.55,0,.55,.55,.55,.55,1]){const c=bottom.clone().lerp(top,mix).multiplyScalar(variation);colors.push(c.r,c.g,c.b);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const mat=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:1});mat.onBeforeCompile=s=>{s.uniforms.windTime=this.wind;s.vertexShader='uniform float windTime;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x+=sin(position.x*.45+position.z*.27+windTime*1.8)*.075;');};this.nearGrass=new THREE.Mesh(geo,mat);this.nearGrass.receiveShadow=true;this.nearGrass.userData.uniqueMaterial=true;this.root.add(this.nearGrass);
 }
}



