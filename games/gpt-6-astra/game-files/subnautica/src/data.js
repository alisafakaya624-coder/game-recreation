// Subnautica PC 1.0 is the reference. Hand-authored approximations are recorded in COVERAGE.md.
export const VERSION='Crater build 0.1';
export const BIOMES=[
 {id:'shallows',name:'Safe Shallows',color:0x087e99,fog:.010,depth:19,ground:0xb8b187,grass:0x4b7849,light:1.3},
 {id:'kelp',name:'Kelp Forest',color:0x1d6057,fog:.020,depth:65,ground:0x77714d,grass:0x698627,light:.85},
 {id:'grassy',name:'Grassy Plateaus',color:0x126188,fog:.009,depth:115,ground:0xaaa486,grass:0x973340,light:.85},
 {id:'mushroom',name:'Mushroom Forest',color:0x164b77,fog:.011,depth:190,ground:0x716d77,grass:0x6645a4,light:.6},
 {id:'bulb',name:'Bulb Zone',color:0x313765,fog:.011,depth:290,ground:0x5d5274,grass:0x8f53c4,light:.48},
 {id:'grand',name:'Grand Reef',color:0x092d55,fog:.010,depth:340,ground:0x53616b,grass:0x234c9e,light:.4},
 {id:'deepgrand',name:'Deep Grand Reef',color:0x082232,fog:.016,depth:520,ground:0x465462,grass:0x244e9e,light:.28},
 {id:'sparse',name:'Sparse Reef',color:0x294e53,fog:.014,depth:210,ground:0x66756d,grass:0x55686a,light:.5},
 {id:'treader',name:"Sea Treader's Path",color:0x1d3b57,fog:.013,depth:320,ground:0x776d68,grass:0x4d6663,light:.4},
 {id:'islands',name:'Underwater Islands',color:0x174565,fog:.012,depth:460,ground:0x6d6c71,grass:0x774163,light:.55},
 {id:'mountains',name:'Mountains',color:0x244f69,fog:.012,depth:360,ground:0x6d7475,grass:0x66566d,light:.55},
 {id:'dunes',name:'Dunes',color:0x30515c,fog:.016,depth:350,ground:0x9c9876,grass:0x65634c,light:.55},
 {id:'crag',name:'Crag Field',color:0x234550,fog:.014,depth:250,ground:0x6e7973,grass:0x485c67,light:.45},
 {id:'crash',name:'Crash Zone',color:0x526957,fog:.022,depth:140,ground:0x9c9070,grass:0x646548,light:.65},
 {id:'blood',name:'Blood Kelp Zone',color:0x111e38,fog:.014,depth:450,ground:0x505665,grass:0x9eabd6,light:.27},
 {id:'trench',name:'Blood Kelp Trench',color:0x182637,fog:.018,depth:430,ground:0x434d60,grass:0x9aadd4,light:.23},
 {id:'jelly',name:'Jellyshroom Cave',color:0x24173c,fog:.015,depth:250,ground:0x584169,grass:0xf46ccd,light:.4},
 {id:'river',name:'Lost River',color:0x123d3a,fog:.010,depth:800,ground:0x52655b,grass:0x8aecbb,light:.42},
 {id:'lava',name:'Inactive Lava Zone',color:0x382a22,fog:.013,depth:1180,ground:0x3e3430,grass:0xfb6320,light:.38},
 {id:'lakes',name:'Lava Lakes',color:0x4b251a,fog:.012,depth:1440,ground:0x302725,grass:0xff5515,light:.5},
 {id:'void',name:'Crater Edge',color:0x04121f,fog:.019,depth:2400,ground:0x263a43,grass:0x142028,light:.12},
];
export const BIO=Object.fromEntries(BIOMES.map(b=>[b.id,b]));
// X east, Z south. The region placement is fixed; boundaries and topography are approximated.
export const REGIONS=[
 ['shallows',0,0,190],['shallows',70,170,175],['shallows',-115,-110,130],
 ['kelp',-230,35,170],['kelp',170,-170,175],['kelp',160,370,145],['kelp',-270,-255,155],
 ['grassy',-450,260,255],['grassy',350,-370,240],['grassy',-380,-540,190],['grassy',450,380,220],
 ['mushroom',-660,-610,280],['mushroom',660,-680,240],['bulb',1090,-470,380],
 ['grand',-370,1100,410],['sparse',-790,680,300],['treader',-1300,1120,340],
 ['islands',-110,-1120,360],['mountains',1000,-1120,520],['dunes',-1270,-230,550],
 ['crag',510,1050,390],['crash',1110,330,560],['blood',-1000,-1160,370],['trench',-1100,400,190]
];
export const CAVE_PATHS=[
 {id:'jelly',radius:40,points:[[-360,-90,230],[-360,-155,255],[-355,-235,310],[-220,-250,390],[-70,-250,410]]},
 {id:'trench',radius:58,points:[[-1030,-330,470],[-985,-425,410],[-890,-510,310],[-740,-640,200],[-600,-750,70],[-440,-795,-50]]},
 {id:'blood',radius:67,points:[[-850,-380,-1040],[-810,-490,-950],[-760,-625,-690],[-630,-730,-340],[-440,-795,-50]]},
 {id:'deepgrand',radius:67,points:[[-530,-340,1020],[-530,-470,960],[-490,-540,800],[-550,-640,550],[-600,-750,70]]},
 {id:'bulb',radius:72,points:[[1060,-340,-820],[980,-470,-730],[780,-580,-510],[510,-690,-350],[130,-790,-180]]},
 {id:'river',radius:83,points:[[-440,-795,-50],[-280,-810,-60],[-90,-835,-120],[130,-840,-180],[230,-940,-170],[210,-1050,-140]]},
 {id:'lava',radius:86,points:[[210,-1050,-140],[90,-1130,-80],[-80,-1180,20],[15,-1250,120],[190,-1340,170]]},
 {id:'lakes',radius:92,points:[[190,-1340,170],[230,-1420,240],[360,-1440,300]]}
];
const def=(name,kind='material',w=1,h=1,extra={})=>({name,kind,w,h,...extra});
export const ITEMS={
 titanium:def('Titanium'),copper:def('Copper ore'),quartz:def('Quartz'),silver:def('Silver ore'),gold:def('Gold'),lead:def('Lead'),lithium:def('Lithium'),diamond:def('Diamond'),ruby:def('Ruby'),nickel:def('Nickel ore'),kyanite:def('Kyanite'),magnetite:def('Magnetite'),sulfur:def('Cave sulfur'),crystallineSulfur:def('Crystalline sulfur'),salt:def('Salt deposit'),tooth:def('Stalker tooth'),
 acid:def('Acid mushroom','material',1,1),seed:def('Creepvine seed cluster','material',2,2),vine:def('Creepvine sample','material',2,2),coral:def('Table coral sample'),tube:def('Coral tube sample'),bloodOil:def('Blood oil','material',2,2),deepMushroom:def('Deep shroom'),gel:def('Gel sack'),ion:def('Ion cube'),uraninite:def('Uraninite crystal'),
 peeper:def('Peeper','food',1,1,{food:12,water:-3}),bladderfish:def('Bladderfish','food',1,1,{food:6,water:-3}),cooked:def('Cooked peeper','food',1,1,{food:32,water:5}),water:def('Filtered water','food',1,1,{water:20}),bigWater:def('Disinfected water','food',1,1,{water:30}),medkit:def('First aid kit','food',1,1,{health:50}),melon:def('Marblemelon','food',2,2,{food:22,water:18}),
 rubber:def('Silicone rubber'),lubricant:def('Lubricant'),glass:def('Glass'),enameledGlass:def('Enameled glass'),ingot:def('Titanium ingot'),plasteel:def('Plasteel ingot'),fiber:def('Fiber mesh'),wire:def('Wiring kit'),copperWire:def('Copper wire'),chip:def('Computer chip'),advancedWire:def('Advanced wiring kit'),aerogel:def('Aerogel'),benzene:def('Benzene'),hydrochloric:def('Hydrochloric acid'),polyaniline:def('Polyaniline'),bleach:def('Bleach'),
 battery:def('Battery','battery',1,1,{charge:100}),cell:def('Power cell','battery',1,2,{charge:100}),ionBattery:def('Ion battery','battery',1,1,{charge:500}),ionCell:def('Ion power cell','battery',1,2,{charge:500}),
 scanner:def('Scanner','tool',1,2,{charge:100}),repair:def('Repair tool','tool',1,2,{charge:100}),knife:def('Survival knife','tool',1,2),light:def('Flashlight','tool',1,2,{charge:100}),seaglide:def('Seaglide','tool',2,3,{charge:100}),builder:def('Habitat builder','tool',1,2,{charge:100}),cutter:def('Laser cutter','tool',1,2,{charge:100}),stasis:def('Stasis rifle','tool',2,2,{charge:100}),propulsion:def('Propulsion cannon','tool',2,2,{charge:100}),
 tank:def('Standard O₂ tank','equipment',2,3,{slot:'tank',oxygen:75}),highTank:def('High capacity O₂ tank','equipment',2,3,{slot:'tank',oxygen:135}),ultraTank:def('Ultra high capacity tank','equipment',3,3,{slot:'tank',oxygen:225}),fins:def('Fins','equipment',2,2,{slot:'fins'}),radiation:def('Radiation suit','equipment',2,3,{slot:'suit'}),reinforced:def('Reinforced dive suit','equipment',2,3,{slot:'suit'}),rebreather:def('Rebreather','equipment',2,2,{slot:'head'}),compass:def('Compass','equipment',1,1,{slot:'chip'}),
 vehicleBay:def('Mobile vehicle bay','deploy',3,3),beacon:def('Beacon','deploy',1,2),airBladder:def('Air bladder','tool',1,1),
 seamoth:def('Seamoth','vehicle'),prawn:def('Prawn suit','vehicle'),cyclops:def('Cyclops','vehicle'),
 seamothDepth1:def('Seamoth depth module MK1','module'),seamothDepth2:def('Seamoth depth module MK2','module'),seamothDepth3:def('Seamoth depth module MK3','module'),prawnDepth1:def('Prawn depth module MK1','module'),prawnDepth2:def('Prawn depth module MK2','module'),cyclopsDepth1:def('Cyclops depth module MK1','module'),cyclopsDepth2:def('Cyclops depth module MK2','module'),cyclopsDepth3:def('Cyclops depth module MK3','module'),storageModule:def('Vehicle storage module','module'),defense:def('Perimeter defense system','module'),drill:def('Prawn drill arm','module'),grapple:def('Prawn grappling arm','module'),shield:def('Cyclops shield generator','module'),
 purple:def('Purple tablet'),blue:def('Blue tablet'),eye:def('Eye stalk seed'),ghost:def('Ghost weed seed'),fungal:def('Fungal sample'),bulbSample:def('Bulb bush sample'),crown:def('Sea crown seed'),enzymes:def('Hatching enzymes'),
 neptunePlatform:def('Neptune launch platform','rocket'),neptuneGantry:def('Neptune gantry','rocket'),neptuneBoosters:def('Neptune boosters','rocket'),neptuneFuel:def('Neptune fuel reserve','rocket'),neptuneCockpit:def('Neptune cockpit','rocket')
};
export const RECIPES=[];
function recipe(id,cost,station='Fabricator',blueprint=null,count=1){RECIPES.push({id,cost,station,blueprint,count});}
recipe('rubber',{seed:1},'Fabricator',null,2);recipe('lubricant',{seed:1});recipe('glass',{quartz:2});recipe('enameledGlass',{glass:1,tooth:1});recipe('ingot',{titanium:10});recipe('plasteel',{ingot:1,lithium:2});recipe('fiber',{vine:2});recipe('wire',{silver:2});recipe('copperWire',{copper:2});recipe('chip',{coral:2,gold:1,copperWire:1});recipe('advancedWire',{wire:1,gold:2,chip:1});recipe('aerogel',{gel:1,ruby:1});recipe('benzene',{bloodOil:3});recipe('hydrochloric',{deepMushroom:3,salt:1});recipe('polyaniline',{gold:1,hydrochloric:1});recipe('bleach',{salt:1,tube:1});
recipe('battery',{acid:2,copper:1});recipe('cell',{battery:2,rubber:1});recipe('ionBattery',{ion:1,gold:1,silver:1},'Fabricator','ionPower');recipe('ionCell',{ionBattery:2,rubber:1},'Fabricator','ionPower');
recipe('water',{bladderfish:1});recipe('bigWater',{bleach:1},'Fabricator',null,2);recipe('cooked',{peeper:1});recipe('medkit',{fiber:1});
recipe('scanner',{battery:1,titanium:1});recipe('repair',{rubber:1,sulfur:1,titanium:1});recipe('knife',{titanium:1,rubber:1});recipe('light',{battery:1,glass:1});recipe('tank',{titanium:3});recipe('highTank',{tank:1,glass:2,titanium:4,silver:1});recipe('ultraTank',{highTank:1,lithium:4},'Modification station','modification');recipe('fins',{rubber:2});recipe('radiation',{fiber:2,lead:2});recipe('reinforced',{diamond:2,fiber:2,titanium:2},'Fabricator','reinforced');recipe('rebreather',{wire:1,fiber:1});recipe('compass',{copperWire:1,wire:1});
recipe('seaglide',{battery:1,lubricant:1,copperWire:1,titanium:1},'Fabricator','seaglide');recipe('builder',{wire:1,chip:1,battery:1});recipe('cutter',{diamond:2,battery:1,titanium:1,sulfur:1},'Fabricator','cutter');recipe('stasis',{chip:1,battery:1,titanium:1,magnetite:2},'Fabricator','stasis');recipe('propulsion',{wire:1,battery:1,titanium:1},'Fabricator','propulsion');recipe('airBladder',{rubber:1,bladderfish:1});recipe('beacon',{titanium:1,copper:1});recipe('vehicleBay',{ingot:1,lubricant:1,cell:1},'Fabricator','vehicleBay');
recipe('seamoth',{ingot:1,cell:1,glass:2,lubricant:1,lead:1},'Mobile vehicle bay','seamoth');recipe('prawn',{plasteel:2,aerogel:2,enameledGlass:1,diamond:2,lead:2},'Mobile vehicle bay','prawn');recipe('cyclops',{plasteel:3,enameledGlass:3,lubricant:1,advancedWire:1,lead:3},'Mobile vehicle bay','cyclops');
recipe('seamothDepth1',{ingot:1,glass:2},'Vehicle upgrade console','seamoth');recipe('seamothDepth2',{seamothDepth1:1,plasteel:1,magnetite:2,enameledGlass:1},'Modification station','modification');recipe('seamothDepth3',{seamothDepth2:1,plasteel:1,ruby:3},'Modification station','modification');recipe('prawnDepth1',{plasteel:1,nickel:3,ruby:2},'Vehicle upgrade console','prawn');recipe('prawnDepth2',{prawnDepth1:1,titanium:5,kyanite:3},'Modification station','modification');recipe('cyclopsDepth1',{plasteel:1,ruby:3},'Cyclops fabricator','cyclops');recipe('cyclopsDepth2',{cyclopsDepth1:1,plasteel:1,nickel:3},'Modification station','modification');recipe('cyclopsDepth3',{cyclopsDepth2:1,plasteel:1,kyanite:3},'Modification station','modification');recipe('storageModule',{titanium:3,lithium:1},'Vehicle upgrade console','seamoth');recipe('defense',{polyaniline:1,wire:1},'Vehicle upgrade console','seamoth');recipe('drill',{titanium:5,lithium:1,diamond:4},'Vehicle upgrade console','prawn');recipe('grapple',{advancedWire:1,titanium:5,lithium:1,benzene:1},'Vehicle upgrade console','prawn');recipe('shield',{advancedWire:1,polyaniline:1,cell:1},'Cyclops fabricator','cyclops');
recipe('purple',{ion:1,diamond:2},'Fabricator','purple');recipe('blue',{ion:1,kyanite:2},'Fabricator','blue');recipe('enzymes',{eye:1,ghost:1,fungal:1,bulbSample:1,crown:1},'Fabricator','enzymes');
recipe('neptunePlatform',{titanium:4,chip:1,lead:2},'Mobile vehicle bay','neptune');recipe('neptuneGantry',{plasteel:1,copperWire:1,lubricant:1},'Neptune platform','neptune');recipe('neptuneBoosters',{plasteel:1,nickel:3,aerogel:2,wire:1},'Neptune platform','neptune');recipe('neptuneFuel',{plasteel:1,crystallineSulfur:4,kyanite:4,ionCell:2},'Neptune platform','neptune');recipe('neptuneCockpit',{shield:1,plasteel:1,enameledGlass:1,chip:1},'Neptune platform','neptune');
export const BUILDS=[
 {id:'room',name:'Multipurpose room',cost:{titanium:6},integrity:-1.25,kind:'room'},
 {id:'corridor',name:'I compartment',cost:{titanium:2},integrity:-1,kind:'room'},
 {id:'glassCorridor',name:'Glass compartment',cost:{glass:2},integrity:-2,kind:'room'},
 {id:'hatch',name:'Hatch',cost:{titanium:2,quartz:1},integrity:-1,kind:'attachment'},
 {id:'window',name:'Window',cost:{glass:2},integrity:-1,kind:'attachment'},
 {id:'foundation',name:'Foundation',cost:{titanium:2,lead:2},integrity:2,kind:'outside'},
 {id:'reinforcement',name:'Reinforcement',cost:{titanium:3,lithium:1},integrity:7,kind:'attachment'},
 {id:'solar',name:'Solar panel',cost:{quartz:2,titanium:2,copper:1},integrity:0,kind:'power'},
 {id:'thermal',name:'Thermal plant',cost:{titanium:5,magnetite:2,aerogel:1},integrity:0,kind:'power'},
 {id:'bioreactor',name:'Bioreactor',cost:{titanium:3,wire:1,lubricant:1},integrity:0,kind:'inside'},
 {id:'locker',name:'Locker',cost:{titanium:2,quartz:1},integrity:0,kind:'inside'},
 {id:'fabricator',name:'Fabricator',cost:{titanium:1,gold:1,coral:1},integrity:0,kind:'inside'},
 {id:'charger',name:'Battery charger',cost:{wire:1,copperWire:1,titanium:1},integrity:0,kind:'inside'},
 {id:'cellCharger',name:'Power cell charger',cost:{advancedWire:1,ruby:2,titanium:2},integrity:0,kind:'inside'},
 {id:'modification',name:'Modification station',cost:{chip:1,titanium:1,diamond:1,lead:1},integrity:0,kind:'inside'},
 {id:'moonpool',name:'Moonpool',cost:{ingot:2,lubricant:1,lead:2},integrity:-5,kind:'room'},
 {id:'upgrade',name:'Vehicle upgrade console',cost:{titanium:3,chip:1,copperWire:1},integrity:0,kind:'inside'},
 {id:'observatory',name:'Observatory',cost:{enameledGlass:2,titanium:1},integrity:-3,kind:'room'},
 {id:'growbed',name:'Exterior growbed',cost:{titanium:2},integrity:0,kind:'outside'},
 {id:'bed',name:'Basic double bed',cost:{titanium:2,fiber:1},integrity:0,kind:'inside'},
 {id:'chair',name:'Swivel chair',cost:{titanium:1},integrity:0,kind:'inside'},
 {id:'ladder',name:'Ladder',cost:{titanium:2},integrity:0,kind:'inside'}
];
export const VEHICLES={seamoth:{name:'Seamoth',speed:11,depth:200,radius:2,hp:200},prawn:{name:'Prawn suit',speed:6,depth:900,radius:2,hp:600},cyclops:{name:'Cyclops',speed:9,depth:500,radius:8,hp:1500}};
export const FRAGMENT_COUNTS={seaglide:2,vehicleBay:3,seamoth:3,cutter:3,modification:3,stasis:2,propulsion:2,cyclops:9,prawn:4,reinforced:1};
export const LANDMARKS=[
 {id:'pod',name:'Lifepod 5',pos:[0,0,0],type:'pod'},
 {id:'pod3',name:'Lifepod 3',pos:[-80,-35,-245],type:'lostpod'},
 {id:'pod17',name:'Lifepod 17',pos:[-490,-105,220],type:'lostpod'},
 {id:'pod19',name:'Lifepod 19',pos:[-760,-260,710],type:'lostpod'},
 {id:'pod12',name:'Lifepod 12',pos:[1110,-280,-420],type:'lostpod'},
 {id:'pod2',name:'Lifepod 2',pos:[-865,-415,-1060],type:'lostpod'},
 {id:'wreck1',name:'Grassy Plateaus wreck',pos:[-450,-103,340],type:'wreck'},
 {id:'wreck2',name:'Mushroom Forest wreck',pos:[-640,-168,-560],type:'wreck'},
 {id:'wreck3',name:'Underwater Islands wreck',pos:[-150,-190,-1010],type:'wreck'},
 {id:'floating',name:'Floating Island',pos:[-640,12,1030],type:'island'},
 {id:'mountain',name:'Mountain Island',pos:[350,0,-1250],type:'island'},
 {id:'qep',name:'Quarantine Enforcement Platform',pos:[380,8,-1170],type:'alien'},
 {id:'aurora',name:'Aurora',pos:[1110,8,220],type:'aurora'},
 {id:'degasi1',name:'Degasi island habitat',pos:[-640,16,1030],type:'degasi'},
 {id:'degasi2',name:'Degasi habitat · 250m',pos:[-205,-249,382],type:'degasi'},
 {id:'degasi3',name:'Degasi habitat · 500m',pos:[-502,-517,835],type:'degasi'},
 {id:'disease',name:'Disease Research Facility',pos:[-440,-790,-55],type:'alien'},
 {id:'thermal',name:'Alien Thermal Plant',pos:[-75,-1172,22],type:'alien'},
 {id:'containment',name:'Primary Containment Facility',pos:[350,-1430,295],type:'alien'}
];
export const STORY=[
 {id:'radio',title:'A signal in the static',text:'Build a repair tool. Repair Lifepod 5, then listen to its radio. Gather limestone, acid mushrooms and cave sulfur in the shallows; creepvine seeds grow in the kelp.',flag:'radio'},
 {id:'pod3',title:'Find the other survivors',text:'Follow the Lifepod 3 signal. Scan two Seaglide fragments. Scanning wreckage near Lifepod 17 unlocks the Seamoth and mobile vehicle bay.',flag:'pod3'},
 {id:'qep',title:'An island to the north',text:'Investigate the alien structure at Mountain Island. A purple tablet opens the security terminal. Search the island for one.',flag:'qep'},
 {id:'aurora',title:'Return to the Aurora',text:'Build a radiation suit and laser cutter. Enter the Aurora, repair the drive core and retrieve the escape-rocket plans from the captain’s terminal. Access code: 2679.',flag:'aurora'},
 {id:'degasi3',title:'Deeper than they should have gone',text:'Follow the Degasi habitats, from the Floating Island to Jellyshroom Cave and the Deep Grand Reef. Prepare vehicles, storage, power cells and depth modules.',flag:'degasi3'},
 {id:'disease',title:'The disease research facility',text:'Enter the Lost River through the Blood Kelp Trench, northern Blood Kelp, Bulb Zone or Deep Grand Reef. Find the research facility beneath the fossil-filled river.',flag:'disease'},
 {id:'thermal',title:'The power beneath the crater',text:'Reach the Alien Thermal Plant in the Inactive Lava Zone. Bring a purple tablet. Download ion-power schematics and recover a blue tablet.',flag:'thermal'},
 {id:'emperor',title:'The last of her kind',text:'Use a blue tablet to enter Primary Containment at 1,400m. Activate the incubator with an ion cube. The Sea Emperor needs hatching enzymes.',flag:'emperor'},
 {id:'cured',title:'A chance to begin again',text:'Gather eye stalk seed, ghost weed seed, fungal sample, bulb bush sample and sea crown seed. Fabricate hatching enzymes, use them at the incubator, then touch the enzyme released by the young.',flag:'cured'},
 {id:'disabled',title:'End the quarantine',text:'Return to the Mountain Island control terminal and disable the enforcement platform. The gun will remain active until you are cured.',flag:'disabled'},
 {id:'escaped',title:'Leave something behind',text:'Build the Neptune launch platform at the vehicle bay, then its gantry, boosters, fuel reserve and cockpit. Launch when all systems are ready.',flag:'escaped'}
];
