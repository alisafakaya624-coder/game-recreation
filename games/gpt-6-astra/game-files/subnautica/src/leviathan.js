import * as T from '../vendor/three.module.js';
import * as M from './models.js';

// Replacement creature made for the encounter demo. Forward is local -Z.
export function makeLeviathan() {
  const root=new T.Group(), limbs=[], fins=[];
  const skin=M.material(0x9cb6b1,.43,.08);
  const red=M.material(0x7b2430,.46,.12);
  const bone=M.material(0xe7ddd0,.3,.04);
  const dark=M.material(0x07171c,.6,0);
  const gum=M.material(0x4a1826,.36,.03);
  const eye=M.material(0x93e5de,.14,.1,0x348b91);

  function taper(points,r,mat,parent=root) {
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    const geo=new T.TubeGeometry(curve,32,r,10,false),p=geo.attributes.position;
    for(let i=0;i<=32;i++) {
      const center=curve.getPointAt(i/32), scale=1-Math.pow(i/32,1.3)*.94;
      for(let j=0;j<=10;j++) {
        const n=i*11+j;
        p.setXYZ(n,center.x+(p.getX(n)-center.x)*scale,center.y+(p.getY(n)-center.y)*scale,center.z+(p.getZ(n)-center.z)*scale);
      }
    }
    geo.computeVertexNormals();return M.mesh(geo,mat,parent);
  }
  function membrane(points,parent=root) {
    const shape=new T.Shape();shape.moveTo(points[0][0],points[0][1]);
    points.slice(1).forEach(p=>shape.lineTo(...p));shape.closePath();
    return M.mesh(new T.ShapeGeometry(shape),new T.MeshStandardMaterial({color:0x782b35,roughness:.55,side:T.DoubleSide}),parent);
  }
  // One continuous, deforming body mesh avoids the disconnected sphere segments.
  const vertices=[],colors=[],indices=[],rings=90,sides=28;
  const belly=new T.Color(0xadbfb1),back=new T.Color(0x67313c),flank=new T.Color(0x678689);
  for(let i=0;i<=rings;i++) {
    const t=i/rings,z=1+t*58,r=(2.8+Math.sin(t*Math.PI)*2.1)*Math.pow(1-t,.85)+.055;
    for(let j=0;j<=sides;j++) {
      const a=j/sides*Math.PI*2,x=Math.cos(a)*r,y=Math.sin(a)*r*.84;
      vertices.push(x,y,z);
      const c=belly.clone().lerp(flank,T.MathUtils.smoothstep(Math.sin(a),-.5,.15));
      c.lerp(back,T.MathUtils.smoothstep(Math.sin(a),.15,.7));
      c.multiplyScalar(.88+.12*Math.sin(t*115+Math.cos(a)*2)**2);colors.push(c.r,c.g,c.b);
      if(i<rings&&j<sides){const k=i*(sides+1)+j;indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
    }
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
  const body=M.mesh(geo,M.material(0xffffff,.42,.12,0,{vertexColors:true,side:T.DoubleSide}),root);
  body.frustumCulled=false;
  M.ellipsoid(root,skin,[0,1.7,-.6],[3.65,1.7,3.8]);
  M.ellipsoid(root,red,[0,2.65,-.3],[2.35,.7,3.6]);
  M.ellipsoid(root,dark,[0,-.15,-2.2],[3.1,2.7,2.15]);
  M.ellipsoid(root,gum,[0,-.45,-2.35],[2.65,2,1.8]);
  M.ellipsoid(root,dark,[0,-.1,-3.65],[2.45,1.85,.52]);
  const jaw=new T.Group();jaw.position.set(0,-.55,.5);root.add(jaw);
  M.ellipsoid(jaw,skin,[0,-1.5,-2.4],[3.35,.85,3.0]);
  M.ellipsoid(jaw,gum,[0,-.98,-2.7],[2.9,.29,2.3]);
  const upper=[],lower=[];
  for(let i=0;i<=20;i++) {
    const a=i/20*Math.PI;
    upper.push([Math.cos(a)*3.12,Math.sin(a)*1.65+.05,-3.7-Math.sin(a)*.7]);
    lower.push([Math.cos(a)*3.0,-1.05-Math.sin(a)*.55,-3.8-Math.sin(a)*.6]);
  }
  M.pathTube(root,bone,upper,.17,30);M.pathTube(jaw,skin,lower,.2,30);
  const toothGeo=new T.ConeGeometry(.16,1,7);
  for(let row=0;row<2;row++)for(let i=0;i<21;i++) {
    const a=(i+.5)/21*Math.PI,x=Math.cos(a)*(2.9-row*.35),y=Math.sin(a)*1.5+.02;
    const tooth=M.mesh(toothGeo,bone,root,[x,y,-4.1+row*.7]);
    tooth.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(-x*.16,-1,-.1).normalize());tooth.scale.y=.65+Math.sin(a)*.42;
    const bottom=M.mesh(toothGeo,bone,jaw,[x,-1.15-Math.sin(a)*.48,-4.05+row*.7]);bottom.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(-x*.15,1,-.05).normalize());bottom.scale.y=.7;
  }
  for(const side of [-1,1]) {
    M.ellipsoid(root,dark,[side*3.02,1.05,-2.95],[.85,.7,1.05]);
    M.ellipsoid(root,bone,[side*3.32,1.1,-3.32],[.49,.49,.57]);
    M.ellipsoid(root,eye,[side*3.55,1.1,-3.53],[.3,.3,.34]);
    M.ellipsoid(root,dark,[side*3.65,1.11,-3.69],[.13,.22,.17]);
    taper([[side*1.35,2.5,-3.9],[side*3.2,2.05,-3.3],[side*3.8,1.8,-1.3]],.35,red);
    for(let k=0;k<7;k++) {
      M.pathTube(root,dark,[[side*2.8,1.1,1+k*.65],[side*3.25,-.2,1+k*.65],[side*2.4,-1.7,1+k*.65]],.07,10);
    }
    for(const vertical of [-1,1]) {
      const limb=new T.Group();limb.position.set(side*2.6,vertical*1.3,-1.1);root.add(limb);
      taper([[0,0,0],[side*3,vertical*2.5,-3],[side*5,vertical*3.2,-8],[side*3.8,vertical*2,-12],[side*1.1,vertical*.2,-15]],.84,red,limb);
      taper([[side*4.9,vertical*3.05,-8],[side*3.8,vertical*2,-12],[side*1.1,vertical*.2,-15.4]],.27,bone,limb);
      for(let k=0;k<4;k++)taper([[side*(2.3+k*.6),vertical*(2.2+k*.2),-3-k*1.5],[side*(2.5+k*.6),vertical*(1.4+k*.2),-4.6-k*1.5]],.21,bone,limb);
      limbs.push({object:limb,side,vertical});
    }
    const wing=membrane([[0,0],[3,1],[13,-7],[8,-6],[2,-3]]);wing.position.set(side*2,-.1,11);wing.rotation.y=side*Math.PI/2;wing.scale.x=side;fins.push(wing);
    taper([[side*2,-.1,11],[side*7,-.4,15],[side*11,-1.1,21]],.24,skin);
  }
  const dorsal=membrane([[0,0],[4,8],[7,10],[8,3],[17,0]]);dorsal.rotation.y=-Math.PI/2;dorsal.position.set(0,2.6,-1);
  const ridge=membrane([[0,0],[4,3],[10,4],[19,1.3],[35,0]]);ridge.rotation.y=-Math.PI/2;ridge.position.set(0,2.1,13);
  const tail=new T.Group();tail.position.z=58;root.add(tail);
  for(const side of [-1,1]) {
    const f=membrane([[0,0],[side*3,4],[side*10,7],[side*6,1],[side*2,-1],[0,-3]],tail);f.rotation.x=Math.PI/2;
  }
  root.userData.length=75;
  root.userData.animate=(time,openness=0,aggression=0)=>{
    const p=geo.attributes.position,freq=1.1+aggression*.8;
    for(let i=0;i<p.count;i++) {
      const x=vertices[i*3],y=vertices[i*3+1],z=vertices[i*3+2],t=(z-1)/58;
      p.setXYZ(i,x+Math.sin(time*freq-t*6)*t*t*6,y+Math.cos(time*.7-t*5)*t*.5,z);
    }
    p.needsUpdate=true;
    jaw.rotation.x=-.12-openness*.58;
    limbs.forEach(({object,side,vertical})=>{
      object.rotation.y=side*(.02+openness*.2+Math.sin(time*.6)*.035);
      object.rotation.x=-vertical*openness*.11;
    });
    tail.position.x=Math.sin(time*freq-6)*6;tail.rotation.y=Math.cos(time*freq-6)*.45;
    fins.forEach((f,i)=>f.rotation.z=Math.sin(time*1.5+i)*.09);
  };
  return root;
}
