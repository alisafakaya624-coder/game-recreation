import {T,M,geo} from './render.js';

// Authored replacement geometry. Every exterior accent belongs to a destructible building.
export function installDetailGeometry(){
 const g=new T.BoxGeometry(1,1,1),p=g.attributes.position;
 for(let i=0;i<p.count;i++)if(p.getY(i)>.1)p.setXYZ(i,p.getX(i)*.87,p.getY(i),p.getZ(i)*.64);
 g.computeVertexNormals();geo.cab=g;
 const arc=new T.Shape();arc.absarc(0,0,.5,0,Math.PI,false);arc.lineTo(-.4,0);arc.absarc(0,0,.4,Math.PI,0,true);arc.closePath();
 const blades=[];for(let i=0;i<5;i++){const a=i*2.4,x=Math.sin(a)*.22,z=Math.cos(a)*.22;blades.push(x-.065,0,z,x+.065,0,z,x+Math.sin(a)*.19,.37+(i%3)*.12,z+Math.cos(a)*.1);}geo.tuft=new T.BufferGeometry();geo.tuft.setAttribute('position',new T.Float32BufferAttribute(blades,3));geo.tuft.computeVertexNormals();M.blade=new T.MeshStandardMaterial({color:0x9abc47,side:T.DoubleSide,roughness:1});geo.arch=new T.ExtrudeGeometry(arc,{depth:.08,bevelEnabled:false,curveSegments:14});
}

export function detailedCar(world,x,z,rot=0,truck=false,color=0){
 const y=world.height(x,z)+.03,a=world.batch,o={kind:'vehicle',hp:400,maxHp:400,resource:'metal',refs:[]};
 const mat=[M.carblue,M.carred,M.caryellow,M.cargreen,M.carcream][color%5];
 const part=(kind,m,lx,ly,lz,w,h,d,rx=0,rz=0)=>a.add(kind,m,[x+lx*Math.cos(rot)+lz*Math.sin(rot),y+ly,z-lx*Math.sin(rot)+lz*Math.cos(rot)],[w,h,d],[rx,rot,rz],o);
 const box=(m,x,y,z,w,h,d,rx=0)=>part('box',m,x,y,z,w,h,d,rx);
 box(M.black,0,.39,0,1.8,.33,4.6);box(mat,0,.68,0,1.91,.52,4.55);
 box(mat,0,.91,-1.55,1.87,.15,1.38,-.04);box(mat,0,.89,1.71,1.9,.16,1.02);
 part('cab',M.glass,0,1.35,-.1,1.78,.92,2.47);box(mat,0,1.85,-.1,1.58,.11,1.66);
 for(const s of [-1,1]){
  box(M.metal,s*.925,1.01,0,.05,.075,4.23);box(mat,s*.89,1.35,-.1,.065,.79,.075);
  box(mat,s*.82,1.4,-1.04,.1,.94,.09,-.52);box(mat,s*.82,1.4,.82,.1,.94,.09,.52);
  box(M.metal,s*.95,1.01,.36,.04,.04,.28);box(M.black,s*.979,.64,.28,.012,.42,.018);
  box(mat,s*1.06,1.28,-.86,.24,.13,.25);box(M.metal,s*1.09,1.28,-.74,.2,.09,.012);
  for(const zz of [-1.48,1.43]){
   part('cylinder',M.black,s*.98,.44,zz,.43,.23,.43,0,Math.PI/2);
   part('cylinder',M.metal,s*1.105,.44,zz,.24,.025,.24,0,Math.PI/2);
   part('cylinder',M.dark,s*1.123,.44,zz,.115,.03,.115,0,Math.PI/2);
   box(mat,s*.95,.93,zz,.11,.12,1.05);
  }
  box(M.cream,s*.68,.79,-2.3,.39,.23,.035);box(M.red,s*.68,.75,2.3,.35,.2,.03);
 }
 box(M.metal,0,.47,-2.32,1.97,.13,.16);box(M.metal,0,.47,2.32,1.97,.13,.16);
 box(M.dark,0,.73,-2.313,.77,.24,.024);for(let i=0;i<4;i++)box(M.metal,0,.64+i*.055,-2.329,.7,.014,.012);
 box(M.cream,0,.51,2.42,.36,.14,.012);
 if(truck){box(mat,0,1.48,1.37,1.94,1.02,1.68);box(M.wood,0,1.55,1.39,1.7,.08,1.51);}
 const c=Math.abs(Math.cos(rot)),s=Math.abs(Math.sin(rot)),wx=2.1*c+4.7*s,dz=4.7*c+2.1*s;
 const col=world.collision.insert({min:{x:x-wx/2,y,z:z-dz/2},max:{x:x+wx/2,y:y+1.8,z:z+dz/2},owner:o,kind:'vehicle'});o.colliders=[col];world.props.push(o);
}

export function decorateHouse(world,b,opt,box,point){
 const {w,d,floors:F,y}=b,rot=opt.rot||0,top=F*3.84,owner=b.parts[0];
 const decor=(m,x,y,z,ww,hh,dd)=>box(m,x,y,z,ww,hh,dd,'decor',100,owner,1);
 const commercial=opt.commercial,asian=opt.asian;
 if(commercial){
  // Layered stone cornices, corner pilasters, storefront shades and roof plant.
  for(const side of [-1,1]){
   for(const y of [3.67,top+.06]){decor(M.trim,0,y,side*(d/2+.17),w+.68,.29,.55);decor(M.trim,side*(w/2+.17),y,0,.55,.29,d+.68);}
   for(const corner of [-1,1]){
    decor(M.stone,side*(w/2+.04),1.85,corner*(d/2+.04),.48,3.7,.48);
    for(let f=1;f<F;f++)decor(M.trim,side*(w/2+.06),f*3.84+1.8,corner*(d/2+.06),.29,3.84,.29);
   }
  }
  const awning=opt.sign==='PAWN'?M.cargreen:opt.sign==='NOMS'?M.carblue:M.red;
  const nx=Math.round(w/5.12);
  for(let i=0;i<nx;i++){
   const xx=-w/2+(i+.5)*w/nx;
   decor(awning,xx,3.03,d/2+.7,w/nx-.45,.18,1.5);
   for(let k=0;k<7;k++)decor(k%2?awning:M.trim,xx-(w/nx-.45)/2+(k+.5)*(w/nx-.45)/7,2.87,d/2+1.44,(w/nx-.45)/7,.28,.075);
   if(F>2){const [px,pz]=point(xx,d/2+.19);world.batch.add('arch',M.trim,[px,y+3.84+2.62,pz],[2.14,1.04,1],rot,owner,1);}
  }
  decor(M.concrete,-w*.2,top+.54,d*.14,2.5,.8,1.7);decor(M.steel,-w*.2,top+.99,d*.14,2.65,.15,1.83);
  for(let i=0;i<6;i++)decor(M.black,-w*.2-.87+i*.35,top+.66,d*.14+.87,.18,.46,.04);
  const [px,pz]=point(w*.35,d*.12);world.batch.add('cylinder',M.steel,[px,y+top+1.2,pz],[.1,2.4,.1],0,owner,1);
  decor(M.steel,w*.35,top+2.25,d*.12,2.1,.065,.065);
  for(let i=0;i<4;i++)decor(M.steel,w*.35-.7+i*.45,top+2.25,d*.12,.045,.045,.65);
  const [tx,tz]=point(-w*.34,d/2+2.25);world.batch.add('cylinder',M.wood,[tx,y+.88,tz],[.77,.12,.77],0,owner,1);world.batch.add('cylinder',M.steel,[tx,y+.43,tz],[.09,.82,.09],0,owner,1);
  if(opt.sign==='NOMS'){
   world.batch.add('cone',M.red,[tx,y+2.7,tz],[1.8,.55,1.8],0,owner,1);world.batch.add('cylinder',M.steel,[tx,y+1.48,tz],[.035,2.9,.035],0,owner,1);
  }
 }else if(!asian&&w>=10){
  // Porches, shutters and downpipes give the residential families a different silhouette.
  const nx=Math.round(w/5.12),doorX=-w/2+(Math.floor(nx/2)+.5)*w/nx;
  box(M.concrete,doorX,.09,d/2+1.4,3.7,.18,2.8,'floor',300,owner);
  decor(M.trim,doorX,2.98,d/2+1.45,4,.18,3.3);
  for(const side of [-1,1]){
   decor(M.trim,doorX+side*1.64,1.5,d/2+2.7,.17,3,.17);
   decor(M.trim,doorX+side*1.64,.94,d/2+1.7,.1,.12,1.95);
   for(let i=0;i<5;i++)decor(M.trim,doorX+side*1.64,.54,d/2+.95+i*.35,.045,.86,.045);
  }
  for(let f=0;f<F;f++)for(let i=0;i<nx;i++)if(i!==Math.floor(nx/2)||f){const xx=-w/2+(i+.5)*w/nx;for(const side of [-1,1]){
   decor(M.darktrim,xx+side*1.12,f*3.84+1.86,d/2+.17,.38,1.57,.065);
   for(let j=0;j<6;j++)decor(M.wood,xx+side*1.12,f*3.84+1.26+j*.23,d/2+.22,.32,.055,.065);
  }}
  decor(M.steel,-w/2+.22,top*.5,d/2+.2,.07,top,.07);
 }
 if(asian){
  for(let f=0;f<F;f++)for(const side of [-1,1]){
   decor(M.red,0,f*3.84+.6,side*(d/2+.14),w,.13,.15);
   for(let i=0;i<Math.round(w/2.56);i++)decor(M.red,-w/2+i*2.56,f*3.84+1.83,side*(d/2+.13),.13,3.7,.12);
  }
 }
 // Furnished sleeping area and a fitted kitchen, with a real walk-through partition.
 if(!commercial&&F>1&&w>=10){
  box(M.white,-w*.18,3.84+1.65,-d*.13,w*.6,3.3,.13,'wall',200);
  box(M.white,w*.17,3.84+2.98,-d*.13,w*.1,.68,.13,'wall',200);
  decor(M.wood,-w*.27,4.17,-d*.33,2.1,.44,2.5);decor(M.trim,-w*.27,4.48,-d*.33,2.07,.28,2.4);
  decor(M.blue,-w*.27,4.63,-d*.27,2.08,.1,1.6);decor(M.trim,-w*.27,4.72,-d*.41,1.3,.18,.48);
  decor(M.wood,-w*.46,4.15,-d*.33,.6,.65,.6);decor(M.cream,-w*.46,4.89,-d*.33,.4,.46,.4);
 }
 decor(M.trim,-w/2+.68,1.01,d*.13,.95,2.02,.75);decor(M.steel,-w/2+1.18,1.5,d*.13,.07,.34,.045);
 if(!commercial){decor(M.green,-w*.12,.025,d*.2,3.2,.015,2.4);decor(M.wood,-w*.25,1.4,-d/2+.19,1.3,.9,.08);decor(M.blue,-w*.25,1.4,-d/2+.24,1.12,.74,.016);}
}

export function streetFurniture(world,x,z,y){
 const a=world.batch;
 for(let i=0;i<10;i++){
  const side=i%2?1:-1,px=x+side*8.35,pz=z-53+i*11;
  const o=world.solid(M.carblue,px,y+.52,pz,.62,1.05,.52,0,'bin',80);
  a.add('cylinder',M.carblue,[px,y+1.04,pz],[.36,.19,.34],0,o,1);a.box(M.black,px,y+1.03,pz+.34,.4,.14,.04,0,o,1);
  if(i%3===0){const b=world.solid(M.wood,px+side*2,y+.5,pz+3,1.7,.12,.5,0,'bench',90);a.box(M.wood,px+side*2,y+.84,pz+3.25,1.7,.53,.09,0,b,1);for(const s of [-1,1])a.box(M.steel,px+side*2+s*.65,y+.25,pz+3,.055,.5,.5,0,b,1);}
 }
}
