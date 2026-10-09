export const SIZE=2304;
export const W=([x,z])=>[(x-.5)*SIZE,(z-.5)*SIZE];
export const LOCATIONS=[
 ['Tilted Towers',.369,.487,25,105,'city'],['Pleasant Park',.277,.277,39,104,'park'],['Retail Row',.755,.534,40,100,'retail'],['Greasy Grove',.221,.623,32,89,'greasy'],['Salty Springs',.555,.621,40,68,'salty'],['Dusty Depot',.586,.454,38,78,'depot'],['Loot Lake',.43,.367,20,130,'lake'],['Tomato Town',.668,.312,31,67,'tomato'],['Anarchy Acres',.52,.215,39,106,'farm'],['Fatal Fields',.596,.774,36,105,'farm'],['Wailing Woods',.817,.294,41,85,'woods'],['Lonely Lodge',.89,.426,44,83,'lodge'],['Moisty Mire',.811,.797,10,112,'swamp'],['Flush Factory',.351,.881,29,68,'factory'],['Shifty Shafts',.368,.643,35,64,'mine'],['Snobby Shores',.065,.45,28,74,'snobby'],['Haunted Hills',.14,.215,37,60,'graveyard'],['Junk Junction',.18,.098,42,65,'junk'],['Lucky Landing',.569,.928,25,73,'lucky']
].map(([name,u,v,y,r,type])=>({name,u,v,x:W([u,v])[0],z:W([u,v])[1],y,r,type}));
export const COAST=[[.16,.05],[.22,.036],[.31,.045],[.37,.074],[.4,.116],[.47,.132],[.53,.101],[.61,.122],[.67,.108],[.73,.115],[.79,.085],[.87,.105],[.89,.148],[.915,.178],[.948,.242],[.942,.281],[.966,.325],[.948,.378],[.95,.417],[.974,.45],[.987,.516],[.968,.566],[.979,.612],[.937,.675],[.923,.712],[.947,.745],[.938,.79],[.927,.837],[.898,.876],[.874,.902],[.82,.919],[.782,.909],[.757,.894],[.731,.914],[.669,.927],[.638,.961],[.557,.963],[.526,.946],[.494,.932],[.474,.915],[.444,.932],[.409,.906],[.363,.921],[.326,.91],[.305,.879],[.295,.842],[.311,.803],[.297,.762],[.264,.752],[.242,.716],[.203,.728],[.166,.701],[.131,.679],[.096,.616],[.058,.593],[.032,.56],[.029,.51],[.037,.47],[.028,.435],[.045,.394],[.06,.35],[.063,.314],[.081,.292],[.077,.25],[.101,.21],[.102,.157],[.108,.109],[.136,.063]].map(W);
export const LAKE=[[.388,.302],[.422,.308],[.455,.323],[.452,.345],[.484,.36],[.474,.394],[.46,.402],[.464,.431],[.421,.437],[.382,.416],[.394,.384],[.378,.36],[.377,.33]].map(W);
export const RIVER=[[.632,.118],[.64,.157],[.626,.195],[.63,.223],[.625,.26],[.608,.299],[.58,.331],[.562,.37],[.541,.38],[.489,.37]].map(W);
export const SOUTH_RIVER=[[.43,.429],[.428,.476],[.416,.52],[.408,.549],[.422,.575],[.451,.591],[.462,.618],[.443,.65],[.423,.686],[.422,.718],[.44,.75],[.471,.775],[.493,.81],[.512,.85],[.511,.9],[.515,.95]].map(W);
export const ROADS=[
 [[.18,.1],[.25,.098],[.295,.14],[.284,.195],[.275,.277],[.31,.342],[.335,.4],[.334,.46],[.369,.487],[.329,.5],[.29,.493],[.224,.5],[.187,.476],[.125,.443],[.065,.45]],
 [[.14,.215],[.16,.174],[.176,.136],[.18,.1]],[[.14,.215],[.108,.282],[.103,.366],[.092,.398],[.065,.45]],
 [[.29,.195],[.368,.174],[.44,.165],[.52,.215],[.564,.23],[.63,.217],[.7,.235],[.745,.271],[.817,.294]],[[.52,.215],[.489,.252],[.443,.267],[.417,.292]],
 [[.668,.312],[.702,.33],[.713,.369],[.7,.416],[.663,.454],[.641,.503],[.65,.545],[.611,.589],[.555,.621]],
 [[.668,.312],[.702,.283],[.727,.21],[.775,.173],[.835,.155],[.859,.203],[.895,.247],[.902,.317],[.892,.375],[.89,.426],[.853,.474],[.854,.53],[.881,.566],[.89,.64],[.86,.681],[.858,.728],[.85,.773]],
 [[.369,.487],[.442,.489],[.507,.48],[.549,.493],[.586,.454],[.589,.52],[.63,.529],[.688,.522],[.755,.534],[.817,.548],[.854,.53]],
 [[.065,.45],[.072,.54],[.12,.58],[.161,.583],[.195,.604],[.221,.623],[.261,.682],[.318,.69],[.368,.643],[.388,.691],[.419,.705],[.466,.688],[.507,.676],[.555,.621]],
 [[.351,.881],[.37,.819],[.348,.777],[.35,.724],[.388,.691]],[[.555,.621],[.574,.668],[.585,.713],[.596,.774],[.568,.822],[.549,.874],[.569,.928]],
 [[.596,.774],[.653,.764],[.702,.743],[.742,.721],[.769,.665],[.767,.615],[.755,.534]],
 [[.351,.881],[.425,.87],[.455,.82],[.489,.82],[.549,.874],[.613,.878],[.665,.857],[.713,.836],[.77,.841]]
].map(p=>p.map(W));
export const HILLS=[ [.195,.204,105,83],[.192,.273,79,63],[.333,.272,100,67],[.355,.332,88,62],[.167,.389,95,96],[.149,.507,130,109],[.323,.398,98,83],[.306,.562,73,105],[.456,.494,59,70],[.522,.521,89,74],[.606,.353,85,48],[.672,.368,90,57],[.777,.194,87,54],[.84,.181,74,65],[.762,.426,115,72],[.859,.35,90,65],[.705,.552,64,59],[.706,.64,65,61],[.495,.71,93,71],[.507,.794,71,61],[.424,.838,86,78],[.494,.89,48,54],[.687,.906,54,55],[.745,.684,42,64] ].map(([u,v,r,h])=>({x:W([u,v])[0],z:W([u,v])[1],r,h}));
export const WEAPONS={
 pickaxe:{name:'Pickaxe',short:'PICKAXE',rarity:0,damage:20,harvest:50,rate:.48,range:4,mag:0,ammo:'none'},
 ar:{name:'Assault Rifle',short:'ASSAULT RIFLE',rarity:2,damage:33,rate:.182,range:220,mag:30,reload:2.2,ammo:'medium',spread:.016},
 burst:{name:'Burst Assault Rifle',short:'BURST RIFLE',rarity:1,damage:29,rate:.34,range:180,mag:30,reload:2.5,ammo:'medium',spread:.025},
 scar:{name:'Assault Rifle',short:'ASSAULT RIFLE',rarity:4,damage:36,rate:.182,range:250,mag:30,reload:2.1,ammo:'medium',spread:.012},
 pump:{name:'Pump Shotgun',short:'PUMP SHOTGUN',rarity:1,damage:9,rate:1.42,range:36,mag:5,reload:4.8,ammo:'shells',spread:.069,pellets:10},
 tactical:{name:'Tactical Shotgun',short:'TACTICAL SHOTGUN',rarity:2,damage:7,rate:.67,range:29,mag:8,reload:5.9,ammo:'shells',spread:.085,pellets:10},
 smg:{name:'Suppressed SMG',short:'SUPPRESSED SMG',rarity:1,damage:20,rate:.111,range:110,mag:30,reload:2,ammo:'light',spread:.035},
 pistol:{name:'Pistol',short:'PISTOL',rarity:0,damage:23,rate:.22,range:100,mag:16,reload:1.5,ammo:'light',spread:.024},
 handcannon:{name:'Hand Cannon',short:'HAND CANNON',rarity:3,damage:75,rate:1.25,range:140,mag:7,reload:2.1,ammo:'heavy',spread:.018},
 sniper:{name:'Bolt-Action Sniper Rifle',short:'BOLT-ACTION SNIPER',rarity:2,damage:105,rate:1.3,range:600,mag:1,reload:3,ammo:'heavy',spread:.001,projectile:280,scope:true},
 hunting:{name:'Hunting Rifle',short:'HUNTING RIFLE',rarity:1,damage:86,rate:1.25,range:400,mag:1,reload:1.9,ammo:'heavy',spread:.007,projectile:260},
 rocket:{name:'Rocket Launcher',short:'ROCKET LAUNCHER',rarity:3,damage:110,rate:1,range:400,mag:1,reload:2.8,ammo:'rockets',spread:0,projectile:42,explosive:true},
 mini:{name:'Small Shield Potion',short:'SMALL SHIELD',rarity:1,heal:25,limit:50,use:2,stack:6},shield:{name:'Shield Potion',short:'SHIELD POTION',rarity:2,heal:50,limit:100,use:5,stack:3},bandage:{name:'Bandages',short:'BANDAGES',rarity:0,heal:15,limit:75,use:3.5,stack:15,health:true},medkit:{name:'Med Kit',short:'MED KIT',rarity:1,heal:100,limit:100,use:10,stack:3,health:true},chug:{name:'Chug Jug',short:'CHUG JUG',rarity:4,heal:100,limit:100,use:15,stack:1,both:true}
};
export const RARITY=['#a5afb4','#67c538','#40aaf6','#ba60e8','#edb340'];
export const BUILD={tile:5.12,height:3.84,cost:10,wood:{hp:200,time:.28,color:0xad7949},brick:{hp:300,time:.4,color:0xb86543},metal:{hp:400,time:.55,color:0x738a9d}};
export const BOT_NAMES=['BushBandit','DustyDreamer','TiltedTim','LootLlama','StormChaser','RookieRocket','SaltyScout','BlueSquire','RustLord','BriteBomber','PixelPilot','GreenBean','HillRunner','DepotDiver','TomatoFan','LuckyLuke','NightOwl','WailingWolf','ParkRanger','ShiftyMiner','OmegaFree','BigShield','SneakyPete','RocketRex','LakeLurker','BushCamper','WestCoast','NoScope','HayBale','LastCircle'];
