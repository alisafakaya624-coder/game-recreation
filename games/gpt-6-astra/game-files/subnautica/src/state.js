import {ITEMS,RECIPES,VEHICLES,FRAGMENT_COUNTS,BUILDS} from './data.js';
export const SAVE_VERSION=3;
export function freshState(mode='survival'){
 const s={version:SAVE_VERSION,mode,uid:1,time:0,day:1,position:[0,-5,15],yaw:0,pitch:0,health:100,oxygen:45,food:85,water:80,inventory:[],equipment:{},blueprints:[],fragments:{},scans:[],flags:{},discovered:['shallows'],harvested:[],opened:[],bases:[],vehicles:[],containers:{pod:[]},beacons:[],drops:[],logs:[],safeItems:[],rocket:0,selected:'hands',toolCharge:{},deathCount:0};
 for(const id of ['water','water','cooked','medkit'])s.inventory.push(makeItem(s,id));
 if(mode==='creative'){for(const id of ['scanner','repair','knife','builder','seaglide','cutter','light','stasis','ultraTank','fins','reinforced','rebreather'])s.inventory.push(makeItem(s,id));s.blueprints=Object.keys(FRAGMENT_COUNTS).concat(['neptune','purple','blue','ionPower','enzymes']);}
 if(mode==='creative'){for(const item of [...s.inventory])if(ITEMS[item.id].slot)equip(s,item.uid);s.oxygen=maxOxygen(s);}
 s.safeItems=s.inventory.map(i=>i.uid);return s;
}
export function makeItem(s,id,charge){return {id,uid:s.uid++,charge:charge??ITEMS[id]?.charge};}
export function counts(s,includeEquipment=true){const out={};for(const i of s.inventory)out[i.id]=(out[i.id]||0)+1;if(includeEquipment)for(const i of Object.values(s.equipment))if(i)out[i.id]=(out[i.id]||0)+1;return out;}
export function pack(items,width=6,height=8){const grid=Array(width*height).fill(null),positions=[];for(const item of items){const def=ITEMS[item.id];if(!def)return null;let found=false;for(let y=0;y<=height-def.h&&!found;y++)for(let x=0;x<=width-def.w&&!found;x++){let free=true;for(let yy=0;yy<def.h;yy++)for(let xx=0;xx<def.w;xx++)if(grid[(y+yy)*width+x+xx]!==null)free=false;if(free){for(let yy=0;yy<def.h;yy++)for(let xx=0;xx<def.w;xx++)grid[(y+yy)*width+x+xx]=item.uid;positions.push({item,x,y,w:def.w,h:def.h});found=true;}}if(!found)return null;}return positions;}
export function addItem(s,id,quantity=1,charge){if(!ITEMS[id])return false;const before=s.uid;const items=Array.from({length:quantity},()=>makeItem(s,id,charge));if(!pack([...s.inventory,...items])){s.uid=before;return false;}s.inventory.push(...items);return true;}
export function canPay(s,cost){if(s.mode==='creative')return true;const c=counts(s);return Object.entries(cost).every(([id,n])=>(c[id]||0)>=n);}
export function pay(s,cost){if(!canPay(s,cost))return false;if(s.mode==='creative')return true;for(const [id,num] of Object.entries(cost)){let n=num;for(let i=s.inventory.length-1;i>=0&&n;i--)if(s.inventory[i].id===id){s.inventory.splice(i,1);n--;}for(const slot of Object.keys(s.equipment))if(n&&s.equipment[slot]?.id===id){delete s.equipment[slot];n--;}}return true;}
export function craft(s,id,station){const r=RECIPES.find(r=>r.id===id);if(!r)return {ok:false,reason:'Unknown recipe'};if(r.station!==station)return {ok:false,reason:`Requires ${r.station}`};if(r.blueprint&&!s.blueprints.includes(r.blueprint)&&s.mode!=='creative')return {ok:false,reason:'Blueprint not discovered'};if(!canPay(s,r.cost))return {ok:false,reason:'Missing ingredients'};const trial=structuredClone(s);pay(trial,r.cost);if(!['vehicle','rocket'].includes(ITEMS[id].kind)&&!addItem(trial,id,r.count))return {ok:false,reason:'Not enough inventory space'};s.inventory=trial.inventory;s.equipment=trial.equipment;s.uid=trial.uid;return {ok:true,recipe:r};}
export function equip(s,uid){const index=s.inventory.findIndex(i=>i.uid===uid),item=s.inventory[index];if(!item)return false;const def=ITEMS[item.id];if(!def.slot)return false;const old=s.equipment[def.slot];const inv=s.inventory.filter(i=>i.uid!==uid);if(old)inv.push(old);if(!pack(inv))return false;s.inventory=inv;s.equipment[def.slot]=item;return true;}
export function maxOxygen(s){return ITEMS[s.equipment.tank?.id]?.oxygen||45;}
export function exchangeBattery(target,spare,vehicle=false){
 const allowed=vehicle?['cell','ionCell']:['battery','ionBattery'];
 if(!allowed.includes(spare.id)||(!vehicle&&target.charge===undefined))return false;
 const oldType=(vehicle?target.cellType:target.batteryType)||allowed[0],oldCharge=vehicle?target.power:target.charge;
 const nextType=spare.id,nextCharge=spare.charge||0;
 if(vehicle){target.power=nextCharge;target.cellType=nextType;}else{target.charge=nextCharge;target.batteryType=nextType;}
 target.capacity=ITEMS[nextType].charge;spare.id=oldType;spare.charge=oldCharge;delete spare.capacity;return true;
}
export function chargeBatteries(items,power){
 const initial=power;for(const item of items){const capacity=ITEMS[item.id]?.charge||100,n=Math.max(0,Math.min(capacity-(item.charge||0),power));item.charge=(item.charge||0)+n;power-=n;}return{power,charged:initial-power};
}
export function scanFragment(s,blueprint,id){if(s.scans.includes(id))return false;s.scans.push(id);s.fragments[blueprint]=(s.fragments[blueprint]||0)+1;if(s.fragments[blueprint]>=(FRAGMENT_COUNTS[blueprint]||1)&&!s.blueprints.includes(blueprint))s.blueprints.push(blueprint);return true;}
export function createVehicle(s,type,pos){const v={uid:s.uid++,type,pos:[...pos],yaw:0,hp:VEHICLES[type].hp,power:100,modules:[],storage:[],silent:false,lights:true};s.vehicles.push(v);return v;}
export function depthLimit(v){let limit=VEHICLES[v.type].depth;for(const module of v.modules){const n=Number(module.match(/Depth([123])/)?.[1]||0);if(module.startsWith(v.type)&&n)limit=Math.max(limit,({seamoth:[200,300,500,900],prawn:[900,1300,1700],cyclops:[500,900,1300,1700]})[v.type][n]);}return limit;}
export function hullIntegrity(s,base){const parts=s.bases.filter(b=>Math.hypot(b.pos[0]-base.pos[0],b.pos[1]-base.pos[1],b.pos[2]-base.pos[2])<45);return 10+parts.reduce((n,b)=>n+(BUILDS.find(d=>d.id===b.type)?.integrity||0)*(b.pos[1]<-100?1+Math.abs(b.pos[1])/1000:1),0);}
export function serialize(s){return JSON.stringify({version:SAVE_VERSION,savedAt:new Date().toISOString(),state:s});}
export function deserialize(raw){const parsed=JSON.parse(raw);if(parsed.version!==SAVE_VERSION||parsed.state?.version!==SAVE_VERSION)throw new Error('This save was made by an incompatible build.');const s=parsed.state;if(!Array.isArray(s.position)||s.position.length!==3||s.position.some(n=>!Number.isFinite(n))||!Array.isArray(s.inventory)||!pack(s.inventory))throw new Error('Invalid save data');const all=[...s.inventory,...Object.values(s.equipment),...Object.values(s.containers).flat(),...s.vehicles.flatMap(v=>v.storage),...s.bases.flatMap(b=>b.store||[]),...s.drops.flatMap(d=>d.items)].filter(Boolean);const ids=new Set();for(const i of all){if(!ITEMS[i.id]||!Number.isInteger(i.uid)||ids.has(i.uid))throw new Error('Invalid or duplicated item');ids.add(i.uid);}s.uid=Math.max(s.uid,...[...ids].map(v=>v+1));return s;}
export function transfer(s,uid,from,to){const index=from.findIndex(i=>i.uid===uid);if(index<0)return false;if(to===s.inventory&&!pack([...to,from[index]]))return false;if(to!==s.inventory&&!pack([...to,from[index]],8,8))return false;to.push(from[index]);from.splice(index,1);return true;}
export function nextStory(s,story){return story.find(x=>!s.flags[x.flag])||story.at(-1);}
export function storyAction(s,id){
 const has=id=>s.inventory.some(i=>i.id===id)||Object.values(s.equipment).some(i=>i?.id===id);
 const use=id=>pay(s,{[id]:1}); const unlock=id=>{if(!s.blueprints.includes(id))s.blueprints.push(id);};
 switch(id){
 case 'radio':if(!has('repair')&&s.mode!=='creative')return 'A repair tool is needed.';s.flags.radio=true;break;
 case 'pod3':s.flags.pod3=true;break;
 case 'qep':if(!s.flags.qep&&!use('purple'))return 'Insert a purple tablet.';s.flags.qep=true;s.flags.infected=true;unlock('purple');break;
 case 'aurora':if(!has('repair')||!has('cutter'))return 'A repair tool and laser cutter are required.';s.flags.aurora=true;s.flags.radiationRepaired=true;unlock('neptune');unlock('prawn');break;
 case 'degasi1':s.flags.degasi1=true;break;
 case 'degasi2':s.flags.degasi2=true;unlock('modification');unlock('stasis');break;
 case 'degasi3':s.flags.degasi3=true;unlock('reinforced');break;
 case 'disease':if(!s.flags.disease&&!use('purple'))return 'Insert a purple tablet.';s.flags.disease=true;s.flags.infected=true;break;
 case 'thermal':if(!s.flags.thermal){if(!canPay(s,{purple:1}))return 'Insert a purple tablet.';const t=structuredClone(s);pay(t,{purple:1});if(!addItem(t,'blue'))return 'Free one inventory cell to receive the blue tablet.';s.inventory=t.inventory;s.uid=t.uid;}s.flags.thermal=true;unlock('blue');unlock('ionPower');break;
 case 'emperor':if(!s.flags.emperor){if(!canPay(s,{blue:1,ion:1}))return 'The entrance needs a blue tablet; the incubator needs an ion cube.';pay(s,{blue:1,ion:1});}s.flags.emperor=true;unlock('enzymes');break;
 case 'hatch':if(!s.flags.emperor)return 'Activate the incubator first.';if(!s.flags.hatched&&!use('enzymes'))return 'Hatching enzymes are required.';s.flags.hatched=true;break;
 case 'cure':if(!s.flags.hatched)return 'The eggs have not hatched.';s.flags.cured=true;s.flags.infected=false;break;
 case 'disable':if(!s.flags.cured)return 'Infected individuals may not disable the quarantine.';s.flags.disabled=true;break;
 case 'launch':if(s.rocket<5)return 'The Neptune is not complete.';if(!s.flags.disabled)return 'The quarantine platform is still active.';s.flags.escaped=true;break;
 default:return 'No active signal.';
 }return null;
}
