import {T,M,mesh,beam} from './render.js';
import {createAvatarBody,poseBody,solveArm,AVATARS} from './avatars.js';
export {AVATARS};
export function makeWeapon(type='ar'){const g=new T.Group();g.name=type;if(type==='blueprint'){const paper=new T.MeshBasicMaterial({color:0x237dbb}),ink=new T.MeshBasicMaterial({color:0xb1e4fa});mesh('box',paper,g,[0,0,-.14],[.57,.015,.46]);for(let i=0;i<6;i++){mesh('box',ink,g,[-.25+i*.1,.009,-.14],[.002,.003,.42]);mesh('box',ink,g,[0,.009,-.34+i*.08],[.53,.003,.002]);}mesh('box',ink,g,[0,.014,-.14],[.27,.006,.005]);mesh('box',ink,g,[-.13,.014,-.05],[.005,.006,.18]);return g;}
 if(['mini','shield','chug','bandage','medkit'].includes(type)){if(type==='medkit'||type==='bandage'){mesh('box',M.trim,g,[0,0,0],[.28,.16,.18]);mesh('box',M.red,g,[0,.086,0],[.1,.01,.17]);mesh('box',M.red,g,[0,.09,0],[.27,.01,.06]);}else{mesh('cylinder',M.glass,g,[0,0,0],[.12,type==='mini'?.25:.34,.12]);mesh('cylinder',M.steel,g,[0,.18,0],[.13,.04,.13]);mesh('cylinder',M.light,g,[0,-.01,0],[.09,.17,.09]);}return g;}
 if(type==='pickaxe'){
  const handle=new T.CatmullRomCurve3([new T.Vector3(-.012,-.47,.018),new T.Vector3(0,-.12,0),new T.Vector3(.012,.32,0),new T.Vector3(0,.64,0)]);
  const shaft=new T.Mesh(new T.TubeGeometry(handle,24,.027,10,false),M.wood);shaft.castShadow=true;g.add(shaft);
  const blade=new T.Shape();blade.moveTo(-.69,-.05);blade.bezierCurveTo(-.53,.11,-.32,.21,-.07,.19);blade.lineTo(.12,.18);blade.bezierCurveTo(.31,.17,.46,.10,.55,-.01);blade.lineTo(.49,-.14);blade.bezierCurveTo(.31,-.025,.22,.045,.08,.055);blade.lineTo(-.13,.06);blade.bezierCurveTo(-.35,.055,-.49,-.015,-.69,-.05);
  const head=new T.Mesh(new T.ExtrudeGeometry(blade,{depth:.09,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.014,bevelThickness:.012,curveSegments:14}),M.metal);head.position.set(0,.65,-.045);head.castShadow=true;g.add(head);
  mesh('box',M.steel,g,[0,.70,0],[.145,.255,.16],[0,0,-.07]);mesh('box',M.darktrim,g,[0,.55,0],[.105,.12,.10]);
  for(const y of [.65,.76])mesh('cylinder',M.gold,g,[0,y,-.091],[.018,.02,.018],[Math.PI/2,0,0]);
  for(let i=0;i<8;i++)mesh('cylinder',i%2?M.darktrim:M.cloth,g,[0,-.35+i*.029,.005],[.035,.023,.035]);
  mesh('sphere',M.darktrim,g,[-.012,-.46,.018],[.039,.035,.038]);return g;
 }
 const pistol=type==='pistol'||type==='handcannon',sniper=type==='sniper'||type==='hunting',shotgun=type==='pump'||type==='tactical',rocket=type==='rocket';
 if(rocket){mesh('cylinder',M.cloth,g,[0,.04,-.1],[.11,.95,.11],[Math.PI/2,0,0]);mesh('cone',M.gold,g,[0,.04,-.72],[.15,.3,.15],[-Math.PI/2,0,0]);mesh('box',M.dark,g,[0,-.17,-.08],[.09,.24,.14]);mesh('box',M.dark,g,[0,.19,-.16],[.045,.13,.09]);return g;}
 const body=type==='scar'?M.yellow:sniper?M.wood:shotgun?M.red:M.dark;
 mesh('box',body,g,[0,0,-.15],[.095,.13,pistol?.25:.49]);mesh('box',M.steel,g,[0,.07,-.15],[.076,.055,pistol?.3:.53]);mesh('box',M.dark,g,[0,-.12,pistol?-.065:0],[.075,.2,.1],[.25,0,0]);
 if(!pistol){mesh('box',sniper?M.wood:M.steel,g,[0,-.1,.27],[.09,.15,.22]);mesh('box',M.dark,g,[0,-.18,-.16],[.08,.24,.13],[-.16,0,0]);mesh('cylinder',M.black,g,[0,.03,-.57],[.027,sniper?.66:.36,.027],[Math.PI/2,0,0]);mesh('box',body,g,[0,-.025,-.45],[.093,.1,.2]);mesh('box',M.steel,g,[0,.12,-.4],[.032,.08,.044]);}
 else mesh('cylinder',M.black,g,[0,.032,-.32],[.034,.12,.034],[Math.PI/2,0,0]);
 if(type==='sniper'){mesh('cylinder',M.black,g,[0,.145,-.15],[.06,.31,.06],[Math.PI/2,0,0]);mesh('cylinder',M.glass,g,[0,.145,-.31],[.048,.015,.048],[Math.PI/2,0,0]);}
 return g;}
export function makeCharacter(variant=0){
 const avatar=createAvatarBody(variant),{root,rig}=avatar,grip=new T.Group();grip.name='equipment-grip';root.add(grip);
 let current='pickaxe',weapon=makeWeapon(current);grip.add(weapon);
 const handPoint=(x,y,z)=>new T.Vector3(x,y,z).applyEuler(grip.rotation).add(grip.position);
 return {...avatar,body:rig.hips,head:rig.head,grip,
  setWeapon(type){if(current===type)return;current=type;grip.remove(weapon);weapon=makeWeapon(type);grip.add(weapon);},
  animate(time,speed=0,aim=false,crouch=false,air=false,attack=0,options={}){
   const mode=options.airMode||(air?'drop':null);poseBody(avatar,time,speed,crouch,mode,attack);
   grip.visible=!air;grip.position.set(.16,crouch?1.00:aim?1.38:1.23,-.26);grip.rotation.set(0,0,0);
   if(mode==='glide'){solveArm(root,rig,'L',new T.Vector3(-.40,2.10,-.05),new T.Vector3(-.70,1.75,.12));solveArm(root,rig,'R',new T.Vector3(.40,2.10,-.05),new T.Vector3(.70,1.75,.12));return;}
   if(mode==='drop')return;
   if(current==='pickaxe'){
    grip.position.set(.42,crouch?.78:.97,-.14);grip.rotation.set(.12,.9,-.5);
    if(attack>0){
     const p=1-T.MathUtils.clamp(attack,0,1),up=T.MathUtils.smoothstep(p,0,.30),down=T.MathUtils.smoothstep(p,.30,.57),recover=T.MathUtils.smoothstep(p,.66,1);
     grip.position.set(.42-.20*up+.20*recover,(crouch?.78:.97)+.53*up-.58*down+.05*recover,-.14+.22*up-.61*down+.39*recover);
     grip.rotation.set(.12+.78*up-2.62*down+1.84*recover,.9*(1-up+recover)-.22*Math.sin(p*Math.PI),-.50+.50*Math.sin(p*Math.PI));
     solveArm(root,rig,'L',handPoint(0,.22,0),new T.Vector3(-.55,1.38,-.02));
    }
    solveArm(root,rig,'R',handPoint(0,-.03,0),new T.Vector3(.61,1.24,.08));
   }else{
    if(options.action==='reload'){const p=options.progress||0;grip.rotation.z=-.23;grip.rotation.x=.16;solveArm(root,rig,'L',handPoint(-.1,-.12-Math.sin(p*Math.PI)*.25,-.06),new T.Vector3(-.45,1.16,.05));}
    else if(options.action==='heal'){grip.position.set(.10,1.65,-.25);grip.rotation.x=-.7;solveArm(root,rig,'L',handPoint(-.12,-.10,0),new T.Vector3(-.4,1.3,-.06));}
    else solveArm(root,rig,'L',handPoint(-.06,-.03,current==='blueprint'?-.06:-.20),new T.Vector3(-.47,1.20,-.06));
    solveArm(root,rig,'R',handPoint(0,-.10,.06),new T.Vector3(.47,1.27,.04));
   }
  }
 };
}
export function makeDistantCharacter(variant=0){const g=new T.Group(),p=AVATARS[variant%3],cloth=new T.MeshStandardMaterial({color:p.shirt,roughness:1});mesh('sphere',cloth,g,[0,1.32,0],[.26*p.width,.34,.16]);mesh('sphere',new T.MeshStandardMaterial({color:p.skin,roughness:1}),g,[0,1.79,0],[.15,.20,.15]);for(const s of [-1,1]){mesh('cylinder',M.pants,g,[s*.13,.52,0],[.105,.80,.105]);mesh('cylinder',cloth,g,[s*.43,1.42,0],[.074,.65,.074],[0,0,s*1.1]);}return g;}
export function makeBus(){const g=new T.Group();mesh('box',M.blue,g,[0,0,0],[3.5,3,9]);mesh('box',M.dark,g,[0,1.42,0],[3.6,.25,9.2]);mesh('box',M.blue,g,[0,-.15,-5],[3.4,1.6,1.8]);mesh('box',M.black,g,[0,-1.12,0],[3.65,.28,9.5]);for(let side of [-1,1]){for(let j=0;j<7;j++)mesh('box',M.glass,g,[side*1.77,.53,-3.4+j*1.12],[.035,1.1,.83]);for(let z of [-3.4,3.5])mesh('cylinder',M.black,g,[side*1.8,-1.5,z],[.68,.34,.68],[0,0,Math.PI/2]);mesh('box',M.gold,g,[side*1.79,-.28,0],[.05,.12,9]);beam(g,M.dark,[side*1.7,1.5,-3.9],[side*3,12,-4.5],.035);beam(g,M.dark,[side*1.7,1.5,3.8],[side*3,12,4.5],.035);}mesh('box',M.glass,g,[0,.7,-4.52],[3.15,1.3,.04]);mesh('sphere',M.blue,g,[0,13,0],[5.4,7.5,5.4]);mesh('sphere',M.white,g,[0,15.9,0],[5.11,4.9,5.11]);mesh('cylinder',M.dark,g,[0,7,0],[1.4,1.8,1.4]);mesh('cone',M.light,g,[0,3.7,0],[.7,4,.7]);mesh('box',M.steel,g,[0,2,0],[2.4,.5,2.4]);return g;}
export function makeGlider(){const g=new T.Group();const canopy=new T.Mesh(new T.SphereGeometry(2.2,20,8,0,Math.PI*2,0,Math.PI*.42),new T.MeshStandardMaterial({color:0x819db0,side:T.DoubleSide,roughness:.75}));canopy.scale.set(1,.4,.7);canopy.position.y=3.4;g.add(canopy);for(let x of [-1.6,1.6]){beam(g,M.dark,[x,3.6,0],[Math.sign(x)*.32,1.5,-.12],.018);beam(g,M.metal,[x,3.55,0],[0,3.75,0],.034);}mesh('box',M.dark,g,[0,2,0],[1,.06,.07]);return g;}
