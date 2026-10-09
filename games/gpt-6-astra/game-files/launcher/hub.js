const guide=document.getElementById('guide');
const notes={
 'elden-ring':{title:'Elden Ring',intro:'Choose New journey to begin. Continue returns to your browser save.',keys:['WASD: move. Shift: sprint. Mouse drag or arrows: look.','J or left mouse: light attack. Space: dodge. E: interact.','R: flask. M: map. H: controls. Escape: menu.'],file:'COVERAGE.md'},
 subnautica:{title:'Subnautica',intro:'Choose Play submarine demo for the demo, or Survival expedition for a new survival game. Creative lets you explore without survival costs.',keys:['WASD: move. Space / C: ascend / descend.','E: interact. Left mouse: use tool. 1–5: equipment.','Tab: PDA and inventory. Escape: pause and save.'],file:'COVERAGE.md'},
 fortnite:{title:'Fortnite',intro:'PLAY starts Solo against local bots. CHANGE → EXPLORE starts an island tour with equipment and materials.',keys:['WASD: move. Shift: run. Space: jump or leave the bus.','Left mouse: fire or harvest. E: interact. R: reload.','Q: building. F1–F4: build pieces. M: map. Escape: menu.'],file:'FEATURE_COVERAGE.md'}
};
const localFile=location.protocol==='file:';
if(localFile){
 document.getElementById('launch-instructions').hidden=false;
 for(const link of document.querySelectorAll('.play-link')){
  link.setAttribute('aria-disabled','true');
  link.addEventListener('click',event=>{event.preventDefault();document.getElementById('launch-instructions').scrollIntoView({block:'center',behavior:'smooth'});});
 }
}
for(const button of document.querySelectorAll('[data-guide]'))button.addEventListener('click',()=>{
 const id=button.dataset.guide,note=notes[id];
 document.getElementById('guide-title').textContent=note.title;
 document.getElementById('guide-body').innerHTML=`<p>${note.intro}</p><ul>${note.keys.map(key=>`<li>${key}</li>`).join('')}</ul><p>Press Escape to release the mouse, then use your browser's Back button to return to the library. Saves and settings stay in this browser.</p><div class="doc-links"><a href="${id}/README.md">Full controls & guide</a><a href="${id}/${note.file}">Coverage & limitations</a></div>`;
 guide.showModal();
});
document.getElementById('help-button').addEventListener('click',()=>{
 document.getElementById('guide-title').textContent='Launch help';
 document.getElementById('guide-body').innerHTML='<p><strong>1. Extract the whole ZIP.</strong> Keep its folders together.</p><p><strong>2. Run the launcher.</strong> Windows: START GAMES.cmd. Mac: START GAMES.command.</p><p><strong>3. Choose a game.</strong> Keep the launcher window open while playing. Close it when finished.</p><p>If a page stalls, refresh it. Use a desktop browser with hardware acceleration and WebGL 2. The first scene can take several seconds to build.</p><p>The runtime and game assets are included. No account, API key, Node.js installation, or internet connection is needed to play.</p>';
 guide.showModal();
});
document.getElementById('close-guide').addEventListener('click',()=>guide.close());
guide.addEventListener('click',event=>{if(event.target===guide){const r=guide.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)guide.close();}});
