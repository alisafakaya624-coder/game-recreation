import * as T from '../vendor/three.module.js';
import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';

// Original geometry and rig. No imported model, texture, skeleton or animation clips.
export const AVATARS=[
 {name:'RANGER',description:'Field vest, swept hair, cargo trousers',skin:0xc58e68,hair:0x9b6b2e,shirt:0x687644,pants:0x8b7957,accent:0xd1b579,width:1,head:.99},
 {name:'KESTREL',description:'Flight jacket, ponytail, fitted utility gear',skin:0x9a6146,hair:0x272128,shirt:0x366e77,pants:0x354455,accent:0xe2a04e,width:.85,head:.95},
 {name:'BREAKER',description:'Heavy workwear, close crop, reinforced boots',skin:0x644633,hair:0x201c1a,shirt:0xbf6034,pants:0x3c4f4b,accent:0xd8bc78,width:1.14,head:1.05}
];
const templates=[];
const mat=color=>new T.MeshStandardMaterial({color,roughness:.84});
const shared={boot:mat(0x303531),metal:mat(0x9eaaa8),white:mat(0xddd8be),iris:mat(0x587a79),black:mat(0x161d22),sole:mat(0x202826)};
function shape(parent,name,geometry,material,pos=[0,0,0],scale=[1,1,1],rotation=[0,0,0]){
 const m=new T.Mesh(geometry,material);m.name=name;m.position.set(...pos);m.scale.set(...scale);m.rotation.set(...rotation);m.castShadow=m.receiveShadow=true;parent.add(m);return m;
}
const sphere=new T.SphereGeometry(1,16,12),edge=new T.Shape();edge.moveTo(-.42,-.42);edge.lineTo(.42,-.42);edge.lineTo(.42,.42);edge.lineTo(-.42,.42);edge.closePath();
const box=new T.ExtrudeGeometry(edge,{depth:.84,bevelEnabled:true,bevelSize:.08,bevelThickness:.08,bevelSegments:2,steps:1});box.translate(0,0,-.42);
const bodyMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.84});
const ball=(p,n,m,pos,s)=>shape(p,n,sphere,m,pos,s);
const block=(p,n,m,pos,s,r)=>shape(p,n,box,m,pos,s,r);
function tapered(parent,name,m,pos,length,top,bottom,depth=1){return shape(parent,name,new T.CylinderGeometry(top,bottom,length,14,1),m,pos,[1,1,depth]);}
function joint(parent,name,x,y,z=0){const j=new T.Group();j.name=name;j.position.set(x,y,z);parent.add(j);return j;}
function profile(parent,name,m,points,zScale=1){return shape(parent,name,new T.LatheGeometry(points.map(([r,y])=>new T.Vector2(r,y)),20),m,[0,0,0],[1,1,zScale]);}
function consolidate(node){
 for(const c of [...node.children])if(!c.isMesh)consolidate(c);
 for(const meshes of [node.children.filter(c=>c.isMesh)]){
  if(meshes.length<2)continue;
  const geometries=meshes.map(m=>{m.updateMatrix();let g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrix);const colors=new Float32Array(g.attributes.position.count*3),c=m.material.color;for(let i=0;i<colors.length;i+=3){colors[i]=c.r;colors[i+1]=c.g;colors[i+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(colors,3));return g;});
  const merged=mergeGeometries(geometries,false);for(const g of geometries)g.dispose();
  const m=new T.Mesh(merged,bodyMaterial);m.castShadow=m.receiveShadow=true;m.name='authored-detail';for(const old of meshes)node.remove(old);node.add(m);
 }
}
function makeTemplate(index){
 const p=AVATARS[index],root=new T.Group();root.name=p.name;root.userData.originalCharacter=true;
 const skin=mat(p.skin),hair=mat(p.hair),shirt=mat(p.shirt),pants=mat(p.pants),accent=mat(p.accent),seam=mat(new T.Color(p.shirt).multiplyScalar(.65)),strap=mat(0x484d37);
 const hips=joint(root,'hips',0,.97),chest=joint(hips,'chest',0,.28);
 profile(hips,'tailored-trousers',pants,[[.14,-.05],[.22,.015],[.235,.15],[.19,.22]],.76);
 profile(chest,'sculpted-torso',shirt,[[.185*p.width,-.12],[.22*p.width,.02],[.28*p.width,.25],[.30*p.width,.32],[.23*p.width,.40]],.65);
 block(hips,'belt',shared.boot,[0,.16,-.005],[.43*p.width,.075,.33]);block(hips,'buckle',shared.metal,[.015,.16,-.18],[.07,.055,.023]);
 const head=joint(chest,'head',0,.4);
 tapered(head,'neck',skin,[0,-.025,0],.16,.07,.085,.88);
 const faceGeometry=sphere.clone(),vertices=faceGeometry.attributes.position;
 for(let i=0;i<vertices.count;i++){const y=vertices.getY(i);if(y<-.2)vertices.setX(i,vertices.getX(i)*(.82+(y+1)*.18));}
 faceGeometry.computeVertexNormals();shape(head,'sculpted-face',faceGeometry,skin,[0,.13,0],[.16*p.head,.22,.153]);
 ball(head,'chin',skin,[0,-.008,-.06],[.107,.073,.095]);
 for(const side of [-1,1]){
  ball(head,'ear',skin,[side*.157*p.head,.115,.005],[.034,.058,.036]);
  ball(head,'cheek',skin,[side*.099,.087,-.10],[.071,.071,.046]);
  ball(head,'eye-white',shared.white,[side*.061,.176,-.139],[.039,.0165,.020]);
  ball(head,'iris',shared.iris,[side*.061,.176,-.157],[.010,.013,.006]);
  ball(head,'pupil',shared.black,[side*.061,.176,-.162],[.005,.009,.004]);
  ball(head,'upper-eyelid',skin,[side*.061,.193,-.14],[.043,.012,.021]);
  block(head,'brow',hair,[side*.061,.213,-.148],[.079,.018,.026],[0,0,side*.12]);
 }
 ball(head,'nose-bridge',skin,[0,.125,-.153],[.03,.055,.029]);ball(head,'nose-tip',skin,[0,.094,-.179],[.039,.024,.029]);
 block(head,'mouth',mat(new T.Color(p.skin).multiplyScalar(.5)),[0,.035,-.136],[.071,.009,.013]);
 if(index===0){
  ball(head,'hairline',hair,[0,.291,.013],[.168,.10,.158]);
  for(let i=0;i<6;i++)shape(head,'swept-hair',sphere,hair,[(i-2.5)*.048,.324+Math.sin(i*.6)*.025,.006],[.05,.064,.155],[.23,0,-.26]);
  for(const s of [-1,1])block(head,'sideburn',hair,[s*.145,.19,.003],[.025,.13,.075]);
  for(const s of [-1,1]){block(chest,'vest-panel',strap,[s*.125,.18,-.177],[.20,.36,.055]);block(chest,'ammo-pouch',accent,[s*.13,.06,-.226],[.145,.12,.064]);block(chest,'shoulder-strap',accent,[s*.145,.37,-.06],[.045,.04,.30]);}
 }else if(index===1){
  ball(head,'dark-hair-cap',hair,[0,.265,.026],[.161,.128,.153]);
  for(const s of [-1,1])shape(head,'temple-hair',sphere,hair,[s*.134,.182,.02],[.032,.15,.115],[0,0,s*.1]);
  const pony=joint(head,'ponytail',0,.205,.139);ball(pony,'hair-tie',accent,[0,0,.025],[.06,.048,.065]);
  shape(pony,'ponytail-volume',sphere,hair,[0,-.1,.10],[.073,.18,.08],[-.38,0,0]);
  block(chest,'jacket-zip',shared.metal,[0,.17,-.186],[.017,.38,.025]);
  for(const s of [-1,1]){block(chest,'jacket-pocket',seam,[s*.115,.12,-.182],[.15,.14,.04]);block(chest,'collar',accent,[s*.084,.38,-.057],[.105,.055,.21],[0,0,s*.32]);}
  block(hips,'hip-holster',shared.boot,[.205,.08,.015],[.065,.23,.13]);
 }else{
  ball(head,'close-cropped-hair',hair,[0,.30,.016],[.174,.07,.156]);
  for(const s of [-1,1])block(head,'beard-line',hair,[s*.098,.026,-.06],[.035,.07,.092],[0,0,s*.3]);
  block(head,'beard-chin',hair,[0,-.019,-.087],[.126,.031,.065]);
  for(const s of [-1,1]){block(chest,'work-harness',strap,[s*.145,.17,-.191],[.052,.48,.042],[0,0,-s*.08]);block(chest,'reflective-trim',accent,[s*.15,.275,-.219],[.086,.029,.016]);}
  block(chest,'work-jacket-pocket',accent,[-.10,.23,-.217],[.14,.11,.037]);
 }
 for(const [side,label]of [[-1,'L'],[1,'R']]){
  const leg=joint(hips,'thigh'+label,side*(index===2?.15:.13),-.03),shin=joint(leg,'shin'+label,0,-.43),foot=joint(shin,'foot'+label,0,-.43);
  tapered(leg,'tailored-thigh',pants,[0,-.21,0],.43,.115*p.width,.086*p.width,.91);
  ball(leg,'hip-seam',pants,[0,-.035,0],[.119*p.width,.10,.117]);
  tapered(shin,'calf',pants,[0,-.19,.018],.36,.086*p.width,.069*p.width,.94);
  block(shin,'knee-pad',shared.boot,[0,-.025,-.084],[.142*p.width,.19,.055]);
  block(shin,'knee-pad-face',accent,[0,-.027,-.119],[.105*p.width,.10,.018]);
  block(leg,'cargo-pocket',seam,[side*.09*p.width,-.18,.015],[.075,.185,.153]);
  block(leg,'pocket-flap',accent,[side*.095*p.width,-.10,.015],[.077,.035,.16]);
  tapered(foot,'boot-upper',shared.boot,[0,.10,0],.21,.087,.084,1);
  ball(foot,'boot-toe',shared.boot,[0,.005,-.075],[.106,.085,.181]);block(foot,'boot-sole',shared.sole,[0,-.059,-.06],[.20,.055,.315]);
  for(let j=0;j<3;j++)block(foot,'laces',accent,[0,.08+j*.032,-.08],[.13,.01,.028]);
  const upper=joint(chest,'upperArm'+label,side*.29*p.width,.245),fore=joint(upper,'forearm'+label,0,-.34),hand=joint(fore,'hand'+label,0,-.33);
  ball(upper,'shoulder-cap',shirt,[0,-.037,0],[.124*p.width,.134,.137]);
  tapered(upper,'upper-arm',index===0?skin:shirt,[0,-.20,0],.30,.095*p.width,.079*p.width,.96);
  tapered(fore,'forearm',index===2?shirt:skin,[0,-.145,0],.30,.078*p.width,.056*p.width,.91);
  tapered(fore,'wrist-wrap',shared.boot,[0,-.272,0],.095,.070,.065,.95);
  ball(hand,'gloved-hand',shared.boot,[0,-.023,0],[.067,.083,.057]);ball(hand,'thumb',shared.boot,[-side*.053,-.019,-.018],[.031,.052,.035]);
  if(index===2)block(upper,'shoulder-armor',shared.boot,[side*.064,-.04,-.016],[.16,.18,.22]);
  if(index===1)block(upper,'sleeve-stripe',accent,[side*.065,-.17,-.034],[.061,.047,.15]);
 }
 const pack=joint(chest,'pack',0,.13,.17);block(pack,'utility-pack',strap,[0,0,.02],[index===2?.37:.30,index===1?.29:.38,.18]);
 block(pack,'pack-flap',accent,[0,.16,.065],[index===2?.36:.29,.065,.17]);
 for(const s of [-1,1])block(pack,'pack-strap',shared.boot,[s*.10,0,.115],[.023,.31,.025]);
 if(index===2)tapered(pack,'rolled-bedroll',pants,[0,-.20,.04],.40,.073,.073,1).rotation.z=Math.PI/2;
 consolidate(root);return root;
}
export function createAvatarBody(index=0){
 index=((Math.floor(index)%3)+3)%3;templates[index]??=makeTemplate(index);
 const root=templates[index].clone(true),rig={};
 for(const name of ['hips','chest','head','ponytail','thighL','thighR','shinL','shinR','footL','footR','upperArmL','upperArmR','forearmL','forearmR','handL','handR'])rig[name]=root.getObjectByName(name);
 return {root,rig,variant:index,name:AVATARS[index].name};
}
function pointAt(bone,child,target){
 const origin=bone.getWorldPosition(new T.Vector3()),direction=child.getWorldPosition(new T.Vector3()).sub(origin).normalize(),desired=target.clone().sub(origin).normalize();
 const q=new T.Quaternion().setFromUnitVectors(direction,desired).multiply(bone.getWorldQuaternion(new T.Quaternion()));
 bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(q));bone.updateWorldMatrix(false,true);
}
export function solveArm(root,rig,side,target,hint){
 const upper=rig['upperArm'+side],lower=rig['forearm'+side],hand=rig['hand'+side];root.updateWorldMatrix(true,true);
 const a=upper.getWorldPosition(new T.Vector3()),b=lower.getWorldPosition(new T.Vector3()),c=hand.getWorldPosition(new T.Vector3());
 const t=root.localToWorld(target.clone()),h=root.localToWorld(hint.clone()).sub(a),l1=a.distanceTo(b),l2=b.distanceTo(c),v=t.clone().sub(a),distance=Math.min(v.length(),l1+l2-.001);v.normalize();
 const cosine=T.MathUtils.clamp((l1*l1+distance*distance-l2*l2)/(2*l1*Math.max(.01,distance)),-1,1),perp=h.addScaledVector(v,-h.dot(v)).normalize();
 const elbow=a.clone().addScaledVector(v,l1*cosine).addScaledVector(perp,l1*Math.sqrt(1-cosine*cosine));pointAt(upper,lower,elbow);pointAt(lower,hand,t);
}
export function poseBody(avatar,time,speed=0,crouch=false,airMode=null,attack=0){
 const r=avatar.rig,walk=Math.min(1,speed/4.5),phase=time*(speed>4.6?11:8.5),swing=Math.sin(phase)*walk;
 r.hips.position.y=.97+(crouch?-.23:Math.abs(Math.sin(phase))*.025*walk);r.hips.rotation.set(0,Math.sin(phase)*.035*walk,Math.sin(phase)*.018*walk);
 r.chest.rotation.set(crouch?.14:speed>4.6?.1:0,Math.sin(phase)*-.05*walk,0);r.head.rotation.set(Math.sin(time*1.3)*.01,0,0);
 for(const [side,offset]of [['L',0],['R',Math.PI]]){
  const k=Math.sin(phase+offset)*walk;r['thigh'+side].rotation.set((crouch?.9:0)+k*(speed>4.6?.77:.50),0,side==='L'?.025:-.025);
  r['shin'+side].rotation.set((crouch?-1.5:0)-Math.max(0,-k)*.9,0,0);r['foot'+side].rotation.set(crouch?.55:Math.max(0,k)*.13,0,0);
  r['upperArm'+side].rotation.set(-k*.42,0,side==='L'?-.08:.08);r['forearm'+side].rotation.set(-.15,0,0);r['hand'+side].rotation.set(0,0,0);
 }
 if(airMode==='drop'){
  r.chest.rotation.x=.75;r.hips.rotation.x=.36;r.head.rotation.x=-.25;
  for(const side of ['L','R']){r['thigh'+side].rotation.x=-.2;r['shin'+side].rotation.x=-.6;r['upperArm'+side].rotation.set(-1.4,0,side==='L'?-1.05:1.05);r['forearm'+side].rotation.x=-.38;}
 }else if(airMode==='glide'){
  r.thighL.rotation.x=.18;r.thighR.rotation.x=-.12;r.shinL.rotation.x=-.24;r.shinR.rotation.x=-.4;
 }else if(airMode==='jump'){
  r.chest.rotation.x=.13;r.thighL.rotation.x=.55;r.thighR.rotation.x=.25;r.shinL.rotation.x=-.9;r.shinR.rotation.x=-.55;
 }
 if(attack>0){const p=1-T.MathUtils.clamp(attack,0,1);r.chest.rotation.y=(p<.35?-.5*Math.sin(p/.35*Math.PI/2):T.MathUtils.lerp(-.5,.45,Math.min(1,(p-.35)/.35)))*(1-T.MathUtils.smoothstep(p,.70,1));r.chest.rotation.x+=Math.sin(p*Math.PI)*.12;}
 if(r.ponytail)r.ponytail.rotation.x=Math.sin(phase)*walk*.18+Math.sin(time*2)*.04;
}
