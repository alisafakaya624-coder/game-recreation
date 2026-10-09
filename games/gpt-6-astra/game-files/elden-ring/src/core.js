import {CLASSES,WEAPONS,ATTACKS,REGIONS,BOSSES} from './data.js';
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const angleDelta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export function seeded(seed=42){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function freshSave(className='Vagabond',name='Tarnished',appearance={}){
 const c=CLASSES[className]||CLASSES.Vagabond;
 return {schema:1,name:name.slice(0,24)||'Tarnished',className,appearance:{cape:'#685144',hair:'#b8aca0',body:0,...appearance},level:c.level,stats:[...c.stats],runes:0,region:'limgrave',position:{x:0,z:116},checkpoint:{region:'limgrave',id:'first',x:0,z:116},discovered:{limgrave:['first']},fragments:[],defeated:[],loot:[],quests:{},inventory:{weapons:[c.weapon,...(c.weapon==='staff'?['shortsword']:[])].filter(x=>WEAPONS[x]),stones:0,flowers:0,seeds:0,tears:0,boluses:0},equipment:{weapon:c.weapon,shield:true,armor:'knight',twoHand:false,paired:false,affinity:'standard',ash:'default',spell:0},upgrades:{[c.weapon]:0},flasks:{total:5,crimson:4,level:0},hp:0,fp:0,flaskHP:4,flaskFP:1,torrent:false,deathRunes:null,playtime:0,day:0.35,ending:null};
}
export function maxHP(s){const v=s.stats[0];return Math.round(300+v*22+Math.max(0,v-20)*8);}
export function maxFP(s){return 45+s.stats[1]*6;}
export function maxStamina(s){return 85+s.stats[2]*3;}
export function equipLoad(s){return (s.equipment.armor==='knight'?27:s.equipment.armor==='light'?13:3)+WEAPONS[s.equipment.weapon].weight+(s.equipment.shield?4:0);}
export function loadRatio(s){return equipLoad(s)/(42+s.stats[2]*1.65);}
export function levelCost(s){return Math.floor(550+s.level*s.level*4.2);}
export function weaponDamage(s,kind='light'){
 const w=WEAPONS[s.equipment.weapon],strength=s.stats[3]*(s.equipment.twoHand?1.5:1),dex=s.stats[4];
 const req=strength>=w.req[0]&&dex>=w.req[1]&&(!w.int||s.stats[5]>=w.int);
 const upgrade=s.upgrades[s.equipment.weapon]||0;
 return Math.round((w.damage*(1+.14*upgrade)+strength*w.scaling[0]+dex*w.scaling[1])*(req?1:.55)*(ATTACKS[kind]?.mult||1)*(s.equipment.twoHand?1.12:1));
}
export function attackTimeline(kind,weapon){const a=ATTACKS[kind];const speed=WEAPONS[weapon].speed;return{...a,start:a.startup/speed,end:(a.startup+a.active)/speed,total:(a.startup+a.active+a.recovery)/speed};}
export function attackPhase(action){if(!action)return'idle';if(action.time<action.start)return'startup';if(action.time<=action.end)return'active';if(action.time<action.total)return'recovery';return'complete';}
export function dodgeIFrames(time,ratio,backstep=false){if(backstep||ratio>=1)return false;const end=ratio>=.7?.31:.37;return time>=.07&&time<=end;}
export function canTravel(s,requirement){if(!requirement)return true;if(requirement==='capital')return s.defeated.filter(id=>BOSSES[id]?.rune).length>=2&&s.defeated.includes('draconic');if(requirement==='key')return!!s.quests.key;if(requirement==='dectus')return!!s.quests.dectusLeft&&!!s.quests.dectusRight;if(requirement==='secret')return!!s.quests.secretLeft&&s.defeated.includes('niall');if(requirement==='ranni')return!!s.quests.ranni&&s.defeated.includes('mimic');return s.defeated.includes(requirement);}
export const gateReason={capital:'Acquire two Great Runes and defeat the Draconic Tree Sentinel.',key:'Find the Academy Glintstone Key by the western lake rocks.',dectus:'Find both halves of the Dectus Medallion in Limgrave and Dragonbarrow.',secret:'Find Albus in Liurnia and defeat Commander Niall at Castle Sol.',ranni:'Speak with Ranni, then claim the treasure beyond the Mimic Tear in Nokron.'};
export function restState(s){s.hp=maxHP(s);s.fp=maxFP(s);s.flaskHP=s.flasks.crimson;s.flaskFP=s.flasks.total-s.flasks.crimson;return s;}
export function recordDeath(s,position){s.deathRunes=s.runes?{region:s.region,x:position.x,z:position.z,amount:s.runes}:null;s.runes=0;return s;}
export function recoverRunes(s){if(!s.deathRunes)return 0;const n=s.deathRunes.amount;s.runes+=n;s.deathRunes=null;return n;}
export function levelUp(s,attr){const cost=levelCost(s);if(attr<0||attr>7||s.runes<cost||s.stats[attr]>=99)return false;s.runes-=cost;s.level++;s.stats[attr]++;return true;}
export function upgradeWeapon(s){const w=s.equipment.weapon,l=s.upgrades[w]||0,cost=(l+1)*350,stones=1+Math.floor(l/3);if(l>=12||s.runes<cost||s.inventory.stones<stones)return false;s.runes-=cost;s.inventory.stones-=stones;s.upgrades[w]=l+1;return true;}
export function validateSave(raw){
 if(!raw||raw.schema!==1||!REGIONS[raw.region]||!CLASSES[raw.className])throw Error('Unsupported or damaged save.');
 const s={...freshSave(raw.className),...raw};
 if(!Array.isArray(s.stats)||s.stats.length!==8||s.stats.some(x=>!Number.isFinite(x)||x<1||x>99))throw Error('Invalid character attributes.');
 if(!s.equipment||!WEAPONS[s.equipment.weapon])throw Error('Invalid equipment.');
 for(const field of ['runes','level','hp','fp','flaskHP','flaskFP','playtime','day'])if(!Number.isFinite(s[field])||s[field]<0)throw Error('Invalid '+field);
 if(!s.position||!Number.isFinite(s.position.x)||!Number.isFinite(s.position.z)||Math.abs(s.position.x)>1000||Math.abs(s.position.z)>1000)throw Error('Invalid position.');
 if(!s.checkpoint||!REGIONS[s.checkpoint.region]||!Number.isFinite(s.checkpoint.x)||!Number.isFinite(s.checkpoint.z))throw Error('Invalid checkpoint.');
 if(!Array.isArray(s.defeated)||s.defeated.some(id=>!BOSSES[id]))throw Error('Invalid boss record.');
 if(!s.inventory||!Array.isArray(s.inventory.weapons)||s.inventory.weapons.some(w=>!WEAPONS[w]))throw Error('Invalid inventory.');
 if(!Array.isArray(s.loot)||!Array.isArray(s.fragments)||!s.discovered||!s.quests||!s.upgrades||!s.appearance)throw Error('Invalid world state.');
 if(!s.flasks||!Number.isInteger(s.flasks.total)||s.flasks.total<1||s.flasks.total>14||s.flasks.crimson<0||s.flasks.crimson>s.flasks.total)throw Error('Invalid flask allocation.');
 return s;
}
export class SaveStore{
 constructor(storage){this.storage=storage;this.key='lands-between-v1';this.error=null;}
 load(){try{let raw=this.storage.getItem(this.key);if(!raw)return null;return validateSave(JSON.parse(raw));}catch(e){this.error=e.message;return null;}}
 save(s){try{validateSave(s);this.storage.setItem(this.key,JSON.stringify(s));return true;}catch(e){this.error=e.message;return false;}}
}
