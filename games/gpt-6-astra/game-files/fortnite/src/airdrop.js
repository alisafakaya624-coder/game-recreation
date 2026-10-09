import {Vector3} from '../vendor/three.module.js';
import {LOCATIONS} from './data.js';
export const BUS_SECONDS=38;
export function busPosition(seconds){const t=Math.max(0,Math.min(1,seconds/BUS_SECONDS));return new Vector3(-900+1800*t,380,410-910*t);}
export function makeDropPlan(index,total,random,world){
 const l=LOCATIONS[index%LOCATIONS.length],angle=random()*Math.PI*2,radius=random()*l.r*.44;
 const target=new Vector3(l.x+Math.cos(angle)*radius,0,l.z+Math.sin(angle)*radius);target.y=world.height(target.x,target.z);
 const t=((target.x+900)*1800+(target.z-410)*-910)/(1800*1800+910*910);
 return {target,jumpAt:Math.max(1.2,Math.min(35.5,t*BUS_SECONDS+(random()-.5)*3)),exitOffset:(index%7-3)*.25};
}
export function advanceBotDrop(bot,dt,world){
 if(!['drop','glide'].includes(bot.phase))return false;
 bot.airTime=(bot.airTime||0)+dt;
 const dx=bot.dropPlan.target.x-bot.pos.x,dz=bot.dropPlan.target.z-bot.pos.z,distance=Math.hypot(dx,dz);
 const groundBelow=world.height(bot.pos.x,bot.pos.z),height=bot.pos.y-groundBelow;
 if(bot.phase==='drop'&&height<Math.max(65,distance/18*5.5+45)){bot.phase='glide';bot.deployedAt=bot.pos.y;}
 const speed=bot.phase==='drop'?20:18,travel=Math.min(distance,speed*dt);
 if(distance>.1){bot.pos.x+=dx/distance*travel;bot.pos.z+=dz/distance*travel;bot.heading=Math.atan2(-dx,-dz);}
 bot.velY=bot.phase==='drop'?Math.max(-46,bot.velY-17*dt):bot.velY+(-5.5-bot.velY)*Math.min(1,dt*5);
 const nextY=bot.pos.y+bot.velY*dt,ground=world.ground(bot.pos.x,bot.pos.z,bot.pos.y+1,.4);
 if(nextY<=ground+.04){bot.pos.y=ground+.04;bot.velY=0;bot.phase='grounded';bot.landedAt=bot.airTime;bot.goal=null;bot.think=0;bot.path=[];return true;}
 bot.pos.y=nextY;return false;
}
