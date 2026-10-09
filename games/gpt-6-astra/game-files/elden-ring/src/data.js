export const REFERENCE={app:'1.10',regulation:'1.10',platform:'PC / Steam',scope:'Base game, before Shadow of the Erdtree',build:'0.1.0',fidelity:'Condensed fan interpretation; not a complete or frame-accurate recreation'};
export const ATTRS=['Vigor','Mind','Endurance','Strength','Dexterity','Intelligence','Faith','Arcane'];
export const CLASSES={
 Vagabond:{level:9,stats:[15,10,11,14,13,9,9,7],weapon:'longsword',desc:'A knight exiled from their homeland. Sturdy armor and a dependable blade.'},
 Warrior:{level:8,stats:[11,12,11,10,16,10,8,9],weapon:'scimitar',desc:'A nimble fighter with a curved sword.'},
 Hero:{level:7,stats:[14,9,12,16,9,7,8,11],weapon:'axe',desc:'A strong warrior carrying a heavy battle axe.'},
 Bandit:{level:5,stats:[10,11,10,9,13,9,8,14],weapon:'dagger',desc:'A lightly equipped fighter who favors close, quick attacks.'},
 Astrologer:{level:6,stats:[9,15,9,8,12,16,7,9],weapon:'staff',desc:'A scholar who fights with glintstone sorcery.'},
 Prophet:{level:7,stats:[10,14,8,11,10,7,16,10],weapon:'spear',desc:'A seer who carries a spear and a sacred seal.'},
 Samurai:{level:9,stats:[12,11,13,12,15,9,8,8],weapon:'katana',desc:'A swordsman with a curved blade and lamellar armor.'},
 Prisoner:{level:9,stats:[11,12,11,11,14,14,6,9],weapon:'estoc',desc:'A former noble who combines a thrusting sword with sorcery.'},
 Confessor:{level:10,stats:[10,13,10,12,12,9,14,9],weapon:'broadsword',desc:'A church agent equipped for swordplay and incantations.'},
 Wretch:{level:1,stats:[10,10,10,10,10,10,10,10],weapon:'club',desc:'A blank slate carrying a simple wooden club.'}
};
export const WEAPONS={
 longsword:{name:'Longsword',kind:'sword',damage:78,reach:2.6,speed:1,weight:3.5,req:[10,10],scaling:[.8,.5],skill:'Square Off',desc:'A straight sword with a balanced reach. Charged strikes quickly wear down an enemy’s stance.'},
 greatsword:{name:'Lordsworn’s Greatsword',kind:'greatsword',damage:117,reach:3.4,speed:.78,weight:9,req:[16,10],scaling:[1,.3],skill:'Stamp',desc:'Recovered from a carriage at Gatefront. A broad, weighty blade with a long reach.'},
 katana:{name:'Uchigatana',kind:'katana',damage:85,reach:2.9,speed:1.1,weight:5.5,req:[11,15],scaling:[.4,1],skill:'Unsheathe',bleed:22,desc:'A long, single-edged blade. Successive hits cause blood loss buildup.'},
 staff:{name:'Astrologer’s Staff',kind:'staff',damage:39,reach:2.4,speed:.95,weight:3,req:[7,0],int:16,scaling:[.1,.1],skill:'Glintstone Pebble',desc:'A catalyst for sorcery. Equip it to cast glintstone projectiles with F.'},
 spear:{name:'Short Spear',kind:'spear',damage:79,reach:3.8,speed:.88,weight:4,req:[10,10],scaling:[.5,.7],skill:'Impaling Thrust',desc:'A short spear with a narrow blade. Its thrust reaches past shorter weapons.'},
 axe:{name:'Battle Axe',kind:'axe',damage:100,reach:2.5,speed:.85,weight:4.5,req:[12,8],scaling:[1,.3],skill:'Wild Strikes',desc:'A heavy axe with a broad cutting edge.'},
 scimitar:{name:'Scimitar',kind:'katana',damage:70,reach:2.5,speed:1.16,weight:3,req:[7,13],scaling:[.3,1],skill:'Spinning Slash',desc:'A curved sword suited to quick successive slashes.'},
 dagger:{name:'Great Knife',kind:'sword',damage:55,reach:1.8,speed:1.3,weight:1.5,req:[6,12],scaling:[.2,1],skill:'Quickstep',bleed:28,desc:'A short blade that rewards staying close to an enemy.'},
 estoc:{name:'Estoc',kind:'sword',damage:77,reach:3.1,speed:1.03,weight:4.5,req:[11,13],scaling:[.5,.7],skill:'Impaling Thrust',desc:'A slender sword for long, precise thrusts.'},
 broadsword:{name:'Broadsword',kind:'sword',damage:88,reach:2.4,speed:1,weight:4,req:[10,10],scaling:[.8,.4],skill:'Square Off',desc:'A straight sword with a broad blade and strong cutting attacks.'},
 club:{name:'Club',kind:'club',damage:68,reach:2.2,speed:1,weight:3.5,req:[10,0],scaling:[1,0],skill:'Barbaric Roar',desc:'A rough wooden club. Blunt strikes wear down an enemy’s stance.'}
};
// These are explicit, compressed travel nodes, not claims of original map scale or layouts.
const node=(name,theme,map,grace,description,bosses=[],layer='surface')=>({name,theme,map,grace,description,bosses,layer,exits:[]});
export const REGIONS={
 limgrave:node('Limgrave','limgrave',[44,76],'The First Step','Follow the road north through the Church of Elleh and Gatefront Ruins.'),
 stormveil:node('Stormveil Castle','stormveil',[36,64],'Stormhill Shack','Stormgate leads to the cliffside castle. Defeat Margit, then cross the ramparts to Godrick.',['margit','godrick']),
 weeping:node('Weeping Peninsula','weeping',[47,91],'Bridge of Sacrifice','A bridge connects the southern peninsula to Limgrave.',['leonine']),
 liurnia:node('Liurnia of the Lakes','liurnia',[27,49],'Lake-Facing Cliffs','Beyond Stormveil lie the flooded lake and the spires of Raya Lucaria.'),
 academy:node('Academy of Raya Lucaria','academy',[24,46],'Main Academy Gate','A glintstone key opens the academy.',['redwolf','rennala']),
 caria:node('Caria Manor','caria',[23,31],'Main Caria Manor Gate','Follow the western shore north to the manor and the Three Sisters.',['loretta']),
 caelid:node('Caelid','caelid',[64,70],'Smoldering Church','The eastern road leads into a land consumed by scarlet rot.'),
 redmane:node('Redmane Castle','redmane',[73,79],'Chamber Outside the Plaza','Cross the castle plaza to reach the Wailing Dunes.',['radahn']),
 dragonbarrow:node('Greyoll’s Dragonbarrow','dragonbarrow',[70,58],'Dragonbarrow West','High northern cliffs overlook the red wastes.',['kindred']),
 altus:node('Altus Plateau','altus',[42,29],'Altus Plateau','The Grand Lift of Dectus links northern Liurnia and the golden plateau.'),
 gelmir:node('Mt. Gelmir','gelmir',[27,24],'First Mt. Gelmir Campsite','Climb the western volcanic slopes to Volcano Manor.'),
 volcano:node('Volcano Manor','volcano',[22,22],'Volcano Manor','Beyond the manor lies the lava-filled Temple of Eiglay.',['godskin','rykard']),
 outskirts:node('Capital Outskirts','outskirts',[53,29],'Outer Wall Phantom Tree','Two Great Runes and the defeat of the sentinel open the capital.',['draconic']),
 leyndell:node('Leyndell, Royal Capital','leyndell',[59,27],'East Capital Rampart','Traverse the streets and climb toward the Erdtree Sanctuary.',['shade','morgott']),
 shunning:node('Subterranean Shunning-Grounds','sewer',[59,29],'Underground Roadside','Descend below Leyndell through the city well.',['mohgomen'],'underground'),
 mountaintops:node('Mountaintops of the Giants','snow',[73,20],'Zamor Ruins','The Rold lift opens after Morgott. The Forge waits beyond the frozen peaks.',['firegiant']),
 sol:node('Castle Sol','sol',[73,11],'Castle Sol Main Gate','The northern castle holds the other half of the secret medallion.',['niall']),
 snowfield:node('Consecrated Snowfield','snowfield',[64,14],'Consecrated Snowfield','The secret Rold medallion opens a path through the snow.'),
 haligtree:node('Miquella’s Haligtree','haligtree',[63,4],'Haligtree Canopy','A sending gate in Ordina leads to the vast canopy.',['lorettaknight']),
 elphael:node('Elphael, Brace of the Haligtree','elphael',[63,7],'Prayer Room','Descend from the canopy to the city around the roots.',['malenia']),
 farum:node('Crumbling Farum Azula','farum',[87,32],'Crumbling Beast Grave','The Forge leads to a ruined city caught in a storm.',['duo','maliketh']),
 ashen:node('Leyndell, Ashen Capital','ashen',[59,27],'Leyndell, Capital of Ash','The burning Erdtree has buried the streets in ash.',['gideon','godfrey','radagon','beast']),
 roundtable:node('Roundtable Hold','roundtable',[9,89],'Table of Lost Grace','A sanctuary outside the ordinary world. Rest, trade, and strengthen armaments.'),
 siofra:node('Siofra River','siofra',[52,75],'Siofra River Bank','A lift in Mistwood descends to the star-lit river.',['ancestor'],'underground'),
 ainsel:node('Ainsel River','ainsel',[37,43],'Ainsel River Downstream','The well in eastern Liurnia descends into the river.',['dragonkin'],'underground'),
 nokron:node('Nokron, Eternal City','nokron',[51,69],'Nokron, Eternal City','After Radahn falls, a crater in Mistwood opens the way.',['mimic'],'underground'),
 nokstella:node('Nokstella, Eternal City','nokstella',[30,39],'Nokstella, Eternal City','Ranni’s path continues through Ainsel River Main.','', 'underground'),
 deeproot:node('Deeproot Depths','deeproot',[50,32],'Great Waterfall Crest','A coffin beyond the Siofra Aqueduct leads below the Erdtree.',['fortissax'],'underground'),
 rot:node('Lake of Rot','rot',[26,48],'Lake of Rot Shoreside','A lift below Nokstella reaches the scarlet lake.',['astel'],'underground'),
 mohgwyn:node('Mohgwyn Palace','mohgwyn',[64,70],'Palace Approach Ledge-Road','A sending gate in the western snowfield leads to the blood-soaked palace.',['mohg'],'underground')
};
const link=(a,b,label,requires=null,reverse=true)=>{REGIONS[a].exits.push({to:b,label,requires});if(reverse)REGIONS[b].exits.push({to:a,label:'Return to '+REGIONS[a].name});};
link('limgrave','stormveil','Follow Stormgate to Stormhill');link('limgrave','weeping','Cross the Bridge of Sacrifice');link('limgrave','caelid','Take the eastern road');link('limgrave','siofra','Descend the Siofra River Well');link('limgrave','nokron','Descend into the fallen-star crater','radahn');
link('stormveil','liurnia','Leave through Godrick’s throne room','godrick');link('limgrave','liurnia','Take the cliffside path around Stormveil');
link('liurnia','academy','Use the Academy Glintstone Key','key');link('liurnia','caria','Follow the western shore');link('liurnia','ainsel','Descend the Ainsel River Well');link('liurnia','altus','Ride the Grand Lift of Dectus','dectus');
link('caelid','redmane','Cross the Impassable Greatbridge');link('caelid','dragonbarrow','Ascend to Dragonbarrow');link('altus','gelmir','Take the road to Mt. Gelmir');link('gelmir','volcano','Enter Volcano Manor');link('altus','outskirts','Approach the outer wall');link('outskirts','leyndell','Enter Leyndell','capital');
link('leyndell','shunning','Descend the city well');link('leyndell','mountaintops','Use the Rold Medallion','morgott');link('mountaintops','sol','Follow the frozen valley north');link('mountaintops','snowfield','Hoist the secret medallion','secret');link('snowfield','haligtree','Use Ordina’s sending gate');link('haligtree','elphael','Descend to Elphael','lorettaknight');link('mountaintops','farum','Commit the cardinal sin at the Forge','firegiant');link('farum','ashen','Return to the burning capital','maliketh',false);
link('caria','nokstella','Enter Renna’s Rise sending gate','ranni');link('nokstella','ainsel','Follow Ainsel River Main');link('nokstella','rot','Descend the waterfall lift');link('nokron','deeproot','Take the aqueduct coffin','mimic');link('snowfield','mohgwyn','Use the bloodstained sending gate');
const boss=(name,hp,reward,scale,color,patterns,extra={})=>({name,hp,reward,scale,color,patterns,...extra});
export const BOSSES={
 margit:boss('Margit, the Fell Omen',750,1200,1.75,0x736246,['delay','sweep','dagger','hammer'],{weapon:'club',phase:0.6}),
 godrick:boss('Godrick the Grafted',1100,3000,1.9,0x7e764f,['axecombo','stomp','wind','flame'],{weapon:'axe',rune:true,phase:.5}),
 leonine:boss('Leonine Misbegotten',660,1200,1.35,0x836a57,['rush','leap','combo'],{weapon:'greatsword'}),
 redwolf:boss('Red Wolf of Radagon',600,1500,1.8,0x925238,['leap','sorcery','rush'],{beast:true}),
 rennala:boss('Rennala, Queen of the Full Moon',1000,3500,1.4,0x305b7a,['stars','beam','moon','summon'],{weapon:'staff',rune:true,phase:.65}),
 loretta:boss('Royal Knight Loretta',1000,2500,1.5,0x809197,['sorcery','sweep','greatbow'],{weapon:'spear',spectral:true}),
 radahn:boss('Starscourge Radahn',1550,5000,2.7,0x88603b,['gravity','arrow','combo','meteor'],{weapon:'greatsword',rune:true,phase:.5}),
 kindred:boss('Black Blade Kindred',1300,4000,2.2,0x3f454a,['sweep','leap','blackflame'],{weapon:'spear'}),
 godskin:boss('Godskin Noble',1000,2800,1.8,0xb2ab8e,['thrust','blackflame','roll'],{weapon:'estoc'}),
 rykard:boss('Rykard, Lord of Blasphemy',1700,5500,3,0x80744e,['lava','serpent','skulls','sweep'],{serpent:true,rune:true,phase:.5}),
 draconic:boss('Draconic Tree Sentinel',1250,3200,1.8,0x8d7846,['hammer','lightning','flame'],{weapon:'club'}),
 shade:boss('Godfrey, First Elden Lord',1100,3000,1.9,0xc9a45e,['stomp','axecombo','leap'],{weapon:'axe',spectral:true}),
 morgott:boss('Morgott, the Omen King',1500,6000,1.8,0x817759,['delay','dagger','rain','holycombo'],{weapon:'katana',rune:true,phase:.6}),
 mohgomen:boss('Mohg, the Omen',1200,3000,1.9,0x68564c,['blood','thrust','flame'],{weapon:'spear'}),
 firegiant:boss('Fire Giant',2100,7000,4,0x80563f,['stomp','avalanche','fireorb','eruption'],{weapon:'club',phase:.5}),
 niall:boss('Commander Niall',1300,4000,1.6,0x788282,['frost','summon','lightning','leap'],{weapon:'spear'}),
 lorettaknight:boss('Loretta, Knight of the Haligtree',1500,4500,1.6,0xb8b38f,['greatbow','sorcery','sweep','stars'],{weapon:'spear'}),
 malenia:boss('Malenia, Blade of Miquella',1750,10000,1.3,0xbd8b57,['thrust','waterfowl','grab','aeonia'],{weapon:'katana',heal:true,phase:.5}),
 duo:boss('Godskin Duo',1600,5000,1.8,0xa4a084,['blackflame','roll','thrust','summon'],{weapon:'estoc'}),
 maliketh:boss('Maliketh, the Black Blade',1700,7500,2,0x323d3b,['claw','boulder','blackblade','leap'],{weapon:'greatsword',phase:.6}),
 gideon:boss('Sir Gideon Ofnir, the All-Knowing',1150,3500,1.2,0x817d70,['sorcery','rings','beam','flame'],{weapon:'staff'}),
 godfrey:boss('Godfrey, First Elden Lord',1900,8000,2,0x867657,['axecombo','stomp','fissure','grab'],{weapon:'axe',phase:.5}),
 radagon:boss('Radagon of the Golden Order',1850,7000,1.5,0xc1a66c,['hammer','teleport','rings','holycombo'],{weapon:'club'}),
 beast:boss('Elden Beast',2200,12000,3.6,0xa59f68,['stars','rings','beam','holyflame'],{beast:true}),
 ancestor:boss('Ancestor Spirit',800,1800,2.1,0x62968a,['leap','spiritflame','stomp'],{beast:true,spectral:true}),
 dragonkin:boss('Dragonkin Soldier of Nokstella',1100,2500,2.6,0x758b90,['claw','lightning','frost'],{weapon:'club'}),
 mimic:boss('Mimic Tear',1000,2500,1.1,0xb6b6b0,['combo','thrust','sorcery'],{weapon:'longsword',spectral:true}),
 fortissax:boss('Lichdragon Fortissax',1750,7000,2.8,0x756a5d,['lightning','deathstorm','leap','flame'],{beast:true}),
 astel:boss('Astel, Naturalborn of the Void',1400,5000,2.7,0x66718c,['beam','gravity','meteor','grab'],{beast:true}),
 mohg:boss('Mohg, Lord of Blood',1800,8500,2.1,0x69423b,['blood','thrust','nihil','bloodflame'],{weapon:'spear',rune:true,phase:.5})
};
export const ATTACKS={
 light:{startup:.24,active:.17,recovery:.34,cost:16,mult:1,stance:12,arc:1.6},
 heavy:{startup:.56,active:.23,recovery:.52,cost:26,mult:1.65,stance:30,arc:1.9},
 charged:{startup:.73,active:.26,recovery:.62,cost:32,mult:2.2,stance:45,arc:2.1},
 running:{startup:.22,active:.20,recovery:.42,cost:21,mult:1.25,stance:18,arc:1.6},
 jumping:{startup:.23,active:.30,recovery:.50,cost:24,mult:1.5,stance:34,arc:1.8},
 rolling:{startup:.20,active:.18,recovery:.37,cost:18,mult:1.15,stance:15,arc:1.5},
 counter:{startup:.39,active:.24,recovery:.46,cost:24,mult:1.7,stance:48,arc:1.9},
 critical:{startup:.36,active:.12,recovery:.8,cost:20,mult:3.6,stance:100,arc:1.2},
 skill:{startup:.44,active:.32,recovery:.55,cost:23,fp:9,mult:1.9,stance:38,arc:2.5},
 paired:{startup:.22,active:.28,recovery:.38,cost:24,mult:1.45,stance:20,arc:2.3}
};
export const CONTROLS=[['W A S D','Move'],['Mouse drag / arrow keys','Rotate camera'],['Left mouse / J','Light attack'],['Hold K, release','Heavy / charged attack'],['Q / right mouse','Guard'],['Space','Dodge / neutral backstep'],['Shift','Sprint'],['C','Jump / mounted double jump'],['X','Crouch'],['E','Interact / traverse'],['Tab','Lock target / unlock'],['Z','Switch target'],['R','Use selected flask'],['3','Switch flask'],['F','Cast with staff or seal'],['V','Parry'],['B','Weapon skill'],['T','Summon / dismiss Torrent'],['Y','Two-hand / one-hand'],['1','Cycle weapon'],['2','Cycle spell'],['G','Spirit Ashes'],['I','Equipment / inventory'],['M','Map and fast travel'],['H','Controls'],['Escape','Menu / close']];
export const ENDINGS=[{id:'fracture',name:'Age of Fracture',requires:null},{id:'stars',name:'Age of the Stars',requires:'ranniDone'},{id:'duskborn',name:'Age of the Duskborn',requires:'fiaDone'},{id:'order',name:'Age of Order',requires:'goldmaskDone'},{id:'despair',name:'Blessing of Despair',requires:'dungDone'},{id:'frenzy',name:'Lord of Frenzied Flame',requires:'frenzy'}];
