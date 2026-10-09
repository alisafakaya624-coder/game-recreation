export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
export function rng(seed=83103){let s=seed>>>0;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export const hash=(x,z)=>{let h=Math.imul(x|0,374761393)+Math.imul(z|0,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295;};
export function noise(x,z){const a=Math.floor(x),b=Math.floor(z),u=smooth(0,1,x-a),v=smooth(0,1,z-b);return lerp(lerp(hash(a,b),hash(a+1,b),u),lerp(hash(a,b+1),hash(a+1,b+1),u),v);}
export const fbm=(x,z)=>noise(x,z)*.57+noise(x*2.07,z*2.07)*.28+noise(x*4.13,z*4.13)*.15;
export function inPolygon(x,z,p){let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
export function segmentDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
export function pathDistance(x,z,p){let d=1e9;for(let i=1;i<p.length;i++)d=Math.min(d,segmentDistance(x,z,p[i-1],p[i]));return d;}
export function rayBox(o,d,b,max=Infinity){let lo=0,hi=max;for(const k of ['x','y','z']){if(Math.abs(d[k])<1e-7){if(o[k]<b.min[k]||o[k]>b.max[k])return null;continue;}let a=(b.min[k]-o[k])/d[k],c=(b.max[k]-o[k])/d[k];if(a>c)[a,c]=[c,a];lo=Math.max(lo,a);hi=Math.min(hi,c);if(lo>hi)return null;}return lo;}
export class SpatialHash{
 constructor(size=24){this.size=size;this.cells=new Map();this.items=[];this.serial=0;}
 insert(b){b.id=this.serial++;b.active=true;this.items.push(b);for(let x=Math.floor(b.min.x/this.size);x<=Math.floor(b.max.x/this.size);x++)for(let z=Math.floor(b.min.z/this.size);z<=Math.floor(b.max.z/this.size);z++){const k=x+','+z;let a=this.cells.get(k);if(!a)this.cells.set(k,a=[]);a.push(b);}return b;}
 query(x,z,r=2){const out=new Set();for(let i=Math.floor((x-r)/this.size);i<=Math.floor((x+r)/this.size);i++)for(let j=Math.floor((z-r)/this.size);j<=Math.floor((z+r)/this.size);j++)for(const b of this.cells.get(i+','+j)||[])if(b.active)out.add(b);return [...out];}
 ray(o,d,max){let result=null,best=max;const seen=new Set();for(let t=0;t<=max;t+=this.size*.45){for(const b of this.query(o.x+d.x*t,o.z+d.z*t,this.size*.3)){if(seen.has(b.id)||b.sensor)continue;seen.add(b.id);const v=rayBox(o,d,b,best);if(v!==null&&v<best){best=v;result={object:b,distance:v};}}}return result;}
}
