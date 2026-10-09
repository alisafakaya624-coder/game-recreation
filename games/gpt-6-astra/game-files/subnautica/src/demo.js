import * as T from '../vendor/three.module.js';
import * as M from './models.js';
import {freshState,addItem,equip,createVehicle,maxOxygen} from './state.js';
import {surfaceHeight,moveWithCollision} from './world.js';
import {makeLeviathan} from './leviathan.js';
import {VEHICLES} from './data.js';

export const DEMO_HOME=[-320,-32,96];
export function freshDemoState() {
  const s=freshState('freedom');
  s.inventory=[];
  for(const id of ['repair','light','medkit','medkit','cell','cell','highTank','fins'])addItem(s,id);
  for(const item of [...s.inventory])if(['highTank','fins'].includes(item.id))equip(s,item.uid);
  s.position=[-320,-32,100];s.yaw=0;s.pitch=-.04;s.oxygen=maxOxygen(s);
  s.selected='repair';s.flags.radiationRepaired=true;
  const v=createVehicle(s,'seamoth',DEMO_HOME);v.yaw=Math.PI/2;v.modules=['seamothDepth3','defense','storage'];v.boost=100;
  s.demo={version:1,elapsed:0,distance:0,attacks:0,escapes:0,phase:'waiting',phaseTime:0,boarded:false,defenseReady:0,monsterPos:[-443,-43,64],monsterYaw:-Math.PI/2,callIn:5};
  s.safeItems=s.inventory.map(i=>i.uid);return s;
}

export class DemoHunt {
  constructor(game) {
    this.g=game;this.s=game.s.demo;this.home=new T.Vector3(...DEMO_HOME);
    this.object=makeLeviathan();this.object.position.fromArray(this.s.monsterPos);this.object.rotation.y=this.s.monsterYaw;game.worldGroup.add(this.object);
    this.pos=this.object.position;this.previous=game.player.clone();this.open=0;this.pulse=0;
    this.lastHUD='';this.makeServiceBuoy();this.makeEffects();
    // Keep the rest of the ecosystem; this encounter replaces the large predators locally.
    for(const c of game.world.creatures)if(['reaper','ghost','dragon'].includes(c.species)){c.caught=true;c.object.visible=false;}
  }
  makeServiceBuoy() {
    const g=new T.Group();g.position.copy(this.home).add(new T.Vector3(7,0,5));this.g.worldGroup.add(g);
    for(const side of [-1,1]) {
      M.ellipsoid(g,M.MAT.white,[side*1.8,0,0],[.58,1.1,2.3]);M.ellipsoid(g,M.MAT.orange,[side*1.8,.12,0],[.6,.18,2.1]);
      M.pathTube(g,M.MAT.steel,[[side*1.8,0,0],[side*1.5,1.4,0],[0,2.4,0]],.16);
      M.ellipsoid(g,M.MAT.cyan,[side*1.8,.4,-1.9],[.22,.22,.12]);
    }
    M.cylinder(g,M.MAT.dark,[0,.1,.5],.6,.75,1.4);M.ring(g,M.MAT.cyan,[0,.9,.5],.62,.045,[Math.PI/2,0,0]);
    M.cylinder(g,M.MAT.steel,[0,3.6,0],.04,.04,2.4,8);M.ellipsoid(g,M.MAT.green,[0,4.8,0],[.16,.18,.16]);
    const text=M.label(g,'SERVICE  /  01',[0,1.65,-.1],.38);text.rotation.y=Math.PI;
    const light=new T.PointLight(0x72e1d2,16,18,1.4);light.position.set(0,2,0);g.add(light);
  }
  makeEffects() {
    this.field=M.mesh(new T.SphereGeometry(1,32,20),new T.MeshBasicMaterial({color:0x93edff,wireframe:true,transparent:true,opacity:0,depthWrite:false}),this.g.worldGroup);
    this.field.visible=false;
    const cracks=document.getElementById('demo-cracks');
    cracks.innerHTML='<svg viewBox="0 0 1440 900" preserveAspectRatio="none"><path d="M0 120L150 220 210 280 250 360 345 405M150 220L135 310 80 357M210 280L280 274 326 229M1440 245L1305 345 1255 455 1165 514M1305 345L1210 352 1198 320M1255 455L1310 488 1340 556M1440 785L1310 725 1265 654M1310 725L1300 805"/></svg>';
  }
  signal(text,duration=6) {this.g.ui.subtitle(text,duration);}
  change(phase) {this.s.phase=phase;this.s.phaseTime=0;}
  repel() {
    const g=this.g,v=g.vehicle;
    if(!v)return;
    if(this.s.elapsed<this.s.defenseReady){g.ui.toast('Defense recharging · '+Math.ceil(this.s.defenseReady-this.s.elapsed)+'s');return;}
    if(v.power<12){g.ui.toast('Perimeter defense needs 12% power.');return;}
    v.power-=12;v.shieldUntil=g.time+3;v.grabbedUntil=0;
    this.s.defenseReady=this.s.elapsed+18;this.pulse=1;
    this.field.position.copy(g.player);this.field.visible=true;g.audio.effect('emp',g.player,1);
    if(this.pos.distanceTo(g.player)<75){this.change('retreat');this.s.escapes++;this.signal('Contact repelled. Move away while the defense system recharges.');}
    else this.signal('Perimeter defense discharged. No contact in range.');
    g.ui.notify('PERIMETER DEFENSE');
  }
  boost(dt,requested,moving) {
    const v=this.g.vehicle;if(!v)return false;
    v.boost??=100;
    if(v.boost<=0)v.boostLocked=true;
    if(v.boost>=28&&!requested)v.boostLocked=false;
    const active=requested&&moving&&v.boost>0&&!v.boostLocked&&v.power>0;
    v.boost=T.MathUtils.clamp(v.boost+dt*(active?-19:9),0,100);
    if(active)v.power=Math.max(0,v.power-dt*.65);
    v.demoBoost=active;return active;
  }
  safeTarget(target,radius=5) {
    target.y=Math.min(-8,Math.max(surfaceHeight(target.x,target.z)+radius+3,target.y));return target;
  }
  steer(target,speed,dt,turn=1.5) {
    const delta=target.clone().sub(this.pos);if(delta.length()<.1)return;
    const rotation=new T.Quaternion().setFromEuler(new T.Euler(Math.asin(T.MathUtils.clamp(delta.clone().normalize().y,-.7,.7)),Math.atan2(-delta.x,-delta.z),0,'YXZ'));
    this.object.quaternion.slerp(rotation,1-Math.exp(-turn*dt));
    const direction=new T.Vector3(0,0,-1).applyQuaternion(this.object.quaternion);
    const next=this.pos.clone().addScaledVector(direction,Math.min(delta.length(),speed*dt));
    // Head clearance plus an ahead probe prevents charges tunnelling into terrain.
    const ahead=this.pos.clone().addScaledVector(direction,25);const floor=surfaceHeight(ahead.x,ahead.z)+10;
    if(ahead.y<floor)next.y+=Math.min(10,(floor-ahead.y)*.7)*dt;
    moveWithCollision(this.pos,next,5);next.y=Math.min(-6,next.y);this.pos.copy(next);
  }
  bite() {
    const g=this.g;this.change('grab');this.s.attacks++;this.hit=false;
    g.audio.call('reaper',this.pos);g.audio.effect('impact',this.pos,.8);
    if(g.vehicle)g.vehicle.grabbedUntil=g.time+2.7;
    g.shake=.09;this.signal('HULL CONTACT. Discharge defense [X], then boost clear [Shift].',5);
    g.audio.warning('Warning. Hull contact.');
  }
  update(dt) {
    const g=this.g,s=this.s,v=g.vehicle;
    if(g.dead)return;
    s.elapsed+=dt;s.phaseTime+=dt;
    s.distance+=g.player.distanceTo(this.previous);this.previous.copy(g.player);
    this.distance=this.pos.distanceTo(g.player);
    this.atService=g.player.distanceTo(this.home)<18;
    if(v&&!s.boarded){s.boarded=true;this.change('circle');this.signal('All systems online. Cruise into open water. Shift boosts. X discharges perimeter defense.',9);}
    const t=s.elapsed,p=g.player,forward=g.forward(),right=new T.Vector3(Math.cos(g.yaw),0,-Math.sin(g.yaw));
    let target=this.home.clone().add(new T.Vector3(-105,-15,-50)),speed=5,opening=.04;
    const sheltered=!!g.inside||this.atService;
    if(s.phase==='waiting')target.add(new T.Vector3(Math.sin(t*.12)*35,0,Math.cos(t*.12)*35));
    else if(s.phase==='circle') {
      const a=s.phaseTime*.13;
      target=p.clone().addScaledVector(forward,75+Math.sin(a)*15).addScaledVector(right,Math.cos(a)*40);target.y-=9;
      speed=12;
      if(s.phaseTime>10&&!s.warned){s.warned=true;this.signal('Hydrophone: a large moving contact. Listen for its direction.',7);g.audio.call('reaper',this.pos);}
      if(s.phaseTime>16&&!sheltered&&this.distance<165){this.change('approach');g.audio.call('reaper',this.pos);}
    }else if(s.phase==='approach') {
      target=p.clone().addScaledVector(g.velocity,.7);speed=14;opening=.45;
      if(this.distance<43){this.change('charge');this.signal('The contact is accelerating. Turn away and boost, or hold defense until it is close.',6);g.audio.call('reaper',this.pos);}
    }else if(s.phase==='charge') {
      target=p.clone().addScaledVector(g.velocity,.2);speed=24;opening=1;
      const facing=new T.Vector3(0,0,-1).applyQuaternion(this.object.quaternion).dot(p.clone().sub(this.pos).normalize());
      if(this.distance<12&&facing>.7)this.bite();
      else if(s.phaseTime>11||this.distance>140){this.change('retreat');s.escapes++;this.signal('Contact breaking away. Keep moving.');}
    }else if(s.phase==='grab') {
      const face=new T.Vector3(0,0,-1).applyQuaternion(this.object.quaternion);
      target=p.clone().addScaledVector(face,-7);speed=13;opening=s.phaseTime<.85?1:.5+Math.sin(s.phaseTime*12)*.25;
      if(s.phaseTime>.65&&!this.hit) {
        this.hit=true;g.damage(v?22:60,'demo-maw');g.audio.effect('impact',null,1.4);g.shake=.13;
        if(g.dead)return;
      }
      if(s.phaseTime>2.7){this.change('retreat');this.signal('The creature released its grip. Boost clear. Return to the service buoy for repairs.',8);}
    }else if(s.phase==='retreat') {
      const away=this.pos.clone().sub(p).normalize();
      target=this.pos.clone().addScaledVector(away,65).add(new T.Vector3(20,-3,20));speed=16;
      if(s.phaseTime>14){this.change('circle');s.warned=false;}
    }
    if(sheltered&&!['waiting','circle','retreat'].includes(s.phase)){this.change('retreat');s.escapes++;this.signal('Contact moving away from the service buoy.');}
    this.steer(this.safeTarget(target),speed,dt,s.phase==='charge'?1.0:s.phase==='grab'?3:1.1);
    this.open=T.MathUtils.lerp(this.open,opening,Math.min(1,dt*3));this.object.userData.animate(t,this.open,s.phase==='charge'?1:0);
    this.object.visible=this.distance<550;
    s.callIn-=dt;
    if(s.callIn<=0&&s.boarded){s.callIn=s.phase==='retreat'?17:11;g.audio.call('reaper',this.pos,g.player.y<-180);}
    if(v&&this.atService&&g.velocity.length()<1.5&&this.distance>38) {
      const max=VEHICLES[v.type].hp;v.hp=Math.min(max,v.hp+dt*9);v.power=Math.min(v.capacity||100,v.power+dt*4);v.boost=Math.min(100,(v.boost||0)+dt*12);this.servicing=true;
    }else this.servicing=false;
    if(v&&v.hp/VEHICLES[v.type].hp<.35&&t-(s.lastAlarm||0)>9){s.lastAlarm=t;g.audio.warning('Critical hull damage. Return for repairs.');this.signal('CRITICAL HULL DAMAGE. Return to the service buoy.');}
    if(this.pulse>0){this.pulse=Math.max(0,this.pulse-dt*.9);this.field.scale.setScalar(2+(1-this.pulse)*70);this.field.material.opacity=this.pulse*.32;}else this.field.visible=false;
    s.monsterPos=this.pos.toArray();s.monsterYaw=this.object.rotation.y;
  }
  hud() {
    const g=this.g,s=this.s,v=g.vehicle,k=name=>g.ui.keyName(g.settings.keys[name]);
    const hull=v?Math.max(0,Math.ceil(v.hp/VEHICLES[v.type].hp*100)):null;
    document.getElementById('objective-title').textContent=!s.boarded?'Board your submarine':this.servicing?'Repairing and recharging':s.phase==='grab'?'Break its grip':s.phase==='charge'?'Evade the attack':s.phase==='retreat'?'Create some distance':'Explore the open water';
    document.getElementById('objective-hint').textContent=!s.boarded?`${k('interact')} · Enter the Seamoth ahead`:this.atService?'Service buoy · Stop nearby to repair and recharge':`${k('sprint')} · Boost    ${k('defense')} · Defense    ${k('exit')} · Exit`;
    document.getElementById('objective').querySelector('p').firstChild.textContent='SUBMARINE SURVIVAL ';
    document.getElementById('objective').querySelector('p span').textContent=String(s.attacks).padStart(2,'0')+' CONTACTS';
    const contact=this.distance<60?'CONTACT CLOSE':this.distance<135?'DISTANT CONTACT':'LISTENING';
    const cooldown=Math.max(0,Math.ceil(s.defenseReady-s.elapsed));
    const html=v?`<div class="demo-hull"><span>HULL INTEGRITY</span><b class="${hull<35?'critical':''}">${hull}<small>%</small></b><i><em style="width:${hull}%"></em></i></div><div class="demo-systems"><div><span>BOOST <kbd>${k('sprint')}</kbd></span><i><em style="width:${v.boost||0}%"></em></i></div><div><span>DEFENSE <kbd>${k('defense')}</kbd></span><strong>${cooldown?cooldown+'s':'READY'}</strong></div><div><span>POWER</span><strong>${Math.ceil(v.power)}%</strong></div></div>`:'';
    document.getElementById('demo-console').innerHTML=html;
    const sonar=document.getElementById('demo-hydrophone');sonar.classList.toggle('urgent',['charge','grab'].includes(s.phase));
    sonar.innerHTML=`<span class="sonar-sweep"></span><small>PASSIVE HYDROPHONE</small><b>${s.boarded?contact:'STANDBY'}</b><span>${Math.floor(s.elapsed/60)}:${String(Math.floor(s.elapsed%60)).padStart(2,'0')} SURVIVED · ${Math.round(s.distance)}m TRAVELLED</span>`;
    document.getElementById('demo-cracks').style.opacity=v?Math.max(0,(72-hull)/100):0;
    document.getElementById('vehicle-status').classList.add('hidden');
    document.body.classList.toggle('piloting',!!v);
    if(v)document.getElementById('interaction').innerHTML='';
  }
  fail(cause) {
    const g=this.g;if(g.dead)return;g.dead=true;g.s.health=0;g.audio.warning('Hull integrity lost.');
    g.ui.panel(cause==='drowning'?'Oxygen depleted':'The ocean claimed you','SUBMARINE SURVIVAL',`<div class="credits"><h2>${Math.floor(this.s.elapsed/60)}:${String(Math.floor(this.s.elapsed%60)).padStart(2,'0')}</h2><p>Time survived · ${Math.round(this.s.distance)} metres travelled<br>${this.s.attacks} hull contacts · ${this.s.escapes} evasions</p><p>Boost across its charge. Discharge defense when it gets close.<br>Stop beside the service buoy to repair and recharge.</p><button id="retry-demo" class="wide-button primary">Try again</button><button id="demo-menu" class="wide-button">Main menu</button></div>`,'death');
    document.querySelector('#panel .close-button').style.display='none';
    document.getElementById('retry-demo').onclick=()=>g.startDemo();document.getElementById('demo-menu').onclick=()=>g.returnToMenu(false);
  }
  diagnostics() {return {...this.s,distanceToMonster:Math.round(this.pos.distanceTo(this.g.player)),atService:!!this.atService,servicing:!!this.servicing};}
}
