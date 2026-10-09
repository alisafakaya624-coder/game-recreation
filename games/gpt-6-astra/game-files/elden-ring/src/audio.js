export class AudioEngine{
 constructor(){this.ctx=null;this.gain=null;this.level=.35;}
 init(){if(this.ctx){this.ctx.resume();return;}try{const A=window.AudioContext||window.webkitAudioContext;this.ctx=new A();this.gain=this.ctx.createGain();this.gain.gain.value=this.level;this.gain.connect(this.ctx.destination);
  const count=this.ctx.sampleRate*4,b=this.ctx.createBuffer(1,count,this.ctx.sampleRate),d=b.getChannelData(0);let v=0;for(let i=0;i<count;i++){v=(v+(Math.random()*2-1)*.025)/1.023;d[i]=v;}const n=this.ctx.createBufferSource();n.buffer=b;n.loop=true;const f=this.ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=620;const gain=this.ctx.createGain();gain.gain.value=.14;n.connect(f).connect(gain).connect(this.gain);n.start();}catch{}}
 volume(v){this.level=v;if(this.gain)this.gain.gain.value=v;}
 tone(freq,duration=.2,type='sine',volume=.16,end=null){if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain(),t=this.ctx.currentTime;o.type=type;o.frequency.setValueAtTime(freq,t);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(10,end),t+duration);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(this.gain);o.start(t);o.stop(t+duration+.03);}
 hit(){this.tone(115,.16,'triangle',.3,35);this.tone(900,.08,'sawtooth',.035,75);}
 swing(){this.tone(290,.19,'triangle',.045,70);}
 block(){this.tone(690,.19,'triangle',.15,330);this.tone(1300,.26,'sine',.09,950);}
 step(){this.tone(75+Math.random()*25,.06,'triangle',.065,45);}
 chime(){for(const [i,n]of [261.6,392,523.2,784].entries())setTimeout(()=>this.tone(n,1.4,'sine',.06),i*90);}
 death(){this.tone(98,2.8,'sine',.22,36);this.tone(146,2.8,'triangle',.045,48);}
 cast(){this.tone(280,.7,'sine',.1,900);}
}
