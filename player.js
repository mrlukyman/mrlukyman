'use strict';
const tracks = [
  {name:'yibe',label:'YIBE',kind:'MUSIC / CO-FOUNDER',description:'A personalised music streaming project. Bringing my interests in software and music together.',tags:['Music','Product development'],url:'https://yibe.fm',root:57,bpm:92,notes:[0,7,12,7,3,7,10,7,5,12,15,12,3,7,10,14]},
  {name:'Spotify → Apple Music',label:'SPOTIFY → APPLE MUSIC',kind:'UTILITY / MACOS',description:'Open Spotify links in Apple Music through a background shortcut. A small utility for a very specific music-listening annoyance.',tags:['Shell','macOS Shortcuts','Finicky'],url:'https://github.com/mrlukyman/spotify2applemusic',root:60,bpm:108,notes:[0,4,7,12,7,4,2,7,5,9,12,16,12,9,7,4]},
  {name:'Flutter WebRTC',label:'FLUTTER WEBRTC',kind:'OPEN SOURCE / MERGED CONTRIBUTION',description:'Fixed screen-capture orientation on Android devices whose natural orientation is landscape. Uses display dimensions instead of rotation assumptions, with testing notes for a 1280 × 800 embedded display.',tags:['Flutter','Android','WebRTC'],url:'https://github.com/flutter-webrtc/flutter-webrtc/pull/1854',root:55,bpm:100,notes:[0,3,7,10,7,3,5,7,0,3,12,10,7,5,3,7]},
  {name:'NFTSwap',label:'NFTSWAP',kind:'FULL STACK / PROTOTYPE',description:'A trading-interface prototype connecting a GraphQL API, a relational data model, and wallet integrations. An older experiment in building across the stack.',tags:['TypeScript','React','GraphQL','Prisma','PostgreSQL'],url:'https://github.com/mrlukyman/NFTSwap',root:50,bpm:116,notes:[0,7,3,10,0,7,5,12,3,10,7,14,5,12,7,10]},
  {name:'Space Explorer',label:'SPACE EXPLORER',kind:'SPATIAL / EDUCATIONAL PROTOTYPE',description:'Explore space-themed 3D models in augmented reality. A small educational project built with native Apple frameworks.',tags:['SwiftUI','ARKit','RealityKit'],url:'https://github.com/mrlukyman/space-explorer',root:62,bpm:80,notes:[0,7,14,19,14,7,12,7,5,12,17,24,19,12,14,7]},
  {name:'Dijkstra visualiser',label:'DIJKSTRA',kind:'ALGORITHMS / VISUAL EXPERIMENT',description:'Watch a shortest-path algorithm make its way across a grid. An animated TypeScript and React experiment.',tags:['TypeScript','React','Pathfinding'],url:'https://github.com/mrlukyman/dijkstra-algorithm-react',root:59,bpm:124,notes:[0,2,3,5,7,9,10,12,10,9,7,5,3,2,0,7]}
];
const $ = id => document.getElementById(id);
let skin = 'vice';
let current = 0, playing = false, timer = null, audio = null, master = null, analyser = null;
let step = 0, nextNote = 0, elapsed = 0, startedAt = 0, frame = 0, generation = 0;
const voices = new Set();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const glyphs = {F:['11111','10000','10000','11110','10000','10000','10000'],M:['10001','11011','10101','10101','10001','10001','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],U:['10001','10001','10001','10001','10001','10001','01110'],K:['10001','10010','10100','11000','10100','10010','10001'],A:['01110','10001','10001','11111','10001','10001','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],'.':['00000','00000','00000','00000','00000','00110','00110'],E:['11111','10000','10000','11110','10000','10000','11111'],X:['10001','10001','01010','00100','01010','10001','10001']};
$('pixel-title').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 7" preserveAspectRatio="xMinYMid meet" aria-hidden="true">${[...'LUKAS.FM'].map((c,k)=>glyphs[c].map((r,y)=>[...r].map((p,x)=>p==='1'?`<rect x="${k*6+x}" y="${y}" width=".87" height=".87" fill="currentColor"/>`:'').join('')).join('')).join('')}</svg>`;
const buttons = tracks.map((track,i)=>{
  const li = document.createElement('li');
  const button = document.createElement('button');
  const index = document.createElement('span');
  index.className = 'index'; index.textContent = String(i+1).padStart(2,'0');
  const label = document.createElement('span'); label.textContent = track.label;
  button.append(index,label); button.setAttribute('aria-label',`Select ${track.name}`);
  button.addEventListener('click',()=>selectTrack(i));
  li.append(button); $('tracks').append(li); return button;
});
function announce(text){$('announcement').textContent = text;}
function selectTrack(index){
  current = (index + tracks.length) % tracks.length;
  const track = tracks[current];
  buttons.forEach((b,i)=>b.setAttribute('aria-current',String(i===current)));
  $('track-number').textContent = String(current+1).padStart(2,'0');
  $('category').textContent = track.kind;
  $('project-title').textContent = track.name;
  $('description').textContent = track.description;
  $('tags').replaceChildren(...track.tags.map(tag=>{const span=document.createElement('span');span.textContent=tag;return span}));
  $('project-link').href = track.url;
  $('project-link').textContent = current===2?'VIEW MERGED CONTRIBUTION ↗':'OPEN PROJECT ↗';
  step=0;elapsed=0;
  if(audio){clearVoices();nextNote=audio.currentTime+.05;startedAt=audio.currentTime;}
  $('time').textContent='00:00';
  if(playing)$('hint').textContent='ORIGINAL CHIPTUNE · '+track.bpm+' BPM';
  announce(`${track.name} selected`);
  drawIdle();
}
function clearVoices(){for(const oscillator of voices){try{oscillator.stop();}catch{}} voices.clear();}
function note(midi,when,length,type,level){
  const oscillator=audio.createOscillator(), envelope=audio.createGain();
  oscillator.type=type;oscillator.frequency.value=440*2**((midi-69)/12);
  envelope.gain.setValueAtTime(0,when);
  envelope.gain.linearRampToValueAtTime(level,when+.008);
  envelope.gain.exponentialRampToValueAtTime(.0001,when+length);
  oscillator.connect(envelope);envelope.connect(master);
  oscillator.start(when);oscillator.stop(when+length+.02);voices.add(oscillator);
  oscillator.onended=()=>{voices.delete(oscillator);oscillator.disconnect();envelope.disconnect();};
}
function schedule(){
  if(!playing)return;
  const track=tracks[current], duration=60/track.bpm/2;
  while(nextNote<audio.currentTime+.12){
    note(track.root+track.notes[step%16],nextNote,duration*.82,'triangle',.24);
    if(step%4===0)note(track.root-24+(step%16>=8?5:0),nextNote,duration*3.4,'triangle',.28);
    if(step%2===1)note(track.root+track.notes[(step+4)%16]+12,nextNote,duration*.3,'sine',.045);
    nextNote+=duration;step++;
  }
}
async function play(){
  if(playing)return;
  const operation=++generation;
  try{
    if(!audio){
      const Context=window.AudioContext||window.webkitAudioContext;
      if(!Context)throw new Error('Audio is not supported');
      audio=new Context();master=audio.createGain();analyser=audio.createAnalyser();
      analyser.fftSize=256;analyser.smoothingTimeConstant=.8;
      master.gain.value=Number($('volume').value)/100;
      master.connect(analyser);analyser.connect(audio.destination);
    }
    await audio.resume();
    if(operation!==generation)return;
    playing=true;startedAt=audio.currentTime;nextNote=audio.currentTime+.04;
    document.body.classList.add('playing');$('status').textContent='PLAYING';
    $('hint').textContent='ORIGINAL CHIPTUNE · '+tracks[current].bpm+' BPM';
    $('play').setAttribute('aria-pressed','true');
    schedule();timer=setInterval(schedule,35);visualize();announce('Playing original chiptune');
  }catch(error){$('status').textContent='AUDIO UNAVAILABLE';$('hint').textContent='PROJECT LINKS STILL WORK';announce('Audio could not start. You can still browse projects.');}
}
function pause(){
  generation++;
  if(!playing)return;
  elapsed+=audio.currentTime-startedAt;playing=false;
  clearInterval(timer);timer=null;clearVoices();cancelAnimationFrame(frame);
  document.body.classList.remove('playing');$('status').textContent='PAUSED';
  $('hint').textContent='PRESS PLAY TO RESUME';$('play').setAttribute('aria-pressed','false');
  drawIdle();announce('Paused');
}
function stop(){pause();step=0;elapsed=0;$('time').textContent='00:00';$('status').textContent='READY';$('hint').textContent='PRESS PLAY · ORIGINAL CHIPTUNE';drawIdle();announce('Stopped');}
const canvas=$('scope'), context=canvas.getContext('2d');
function drawIdle(){
  context.clearRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<64;i++){context.fillStyle=skin==='vice'?(i>49?'#b874a0':'#568f89'):(i>49?'#b19a56':'#5d8859');context.fillRect(i*14,107,8,3+(i%4)*2);}
}
const frequency = new Uint8Array(128);
function visualize(){
  if(!playing)return;
  const seconds=Math.floor(elapsed+audio.currentTime-startedAt);
  $('time').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  if(!reducedMotion.matches){
    analyser.getByteFrequencyData(frequency);context.clearRect(0,0,canvas.width,canvas.height);
    for(let i=0;i<64;i++){
      const height=Math.max(3,frequency[Math.floor(i*1.25)]/255*124);
      for(let y=0;y<height;y+=7){context.fillStyle=skin==='vice'?(y>96?'#ef90c1':y>67?'#afdccb':'#78c8be'):(y>96?'#efa74c':y>67?'#b9d976':'#7dca73');context.fillRect(i*14,123-y,8,5);}
    }
  }
  frame=requestAnimationFrame(visualize);
}
$('play').addEventListener('click',play);$('pause').addEventListener('click',pause);$('stop').addEventListener('click',stop);
$('previous').addEventListener('click',()=>{selectTrack(current-1);if(playing)$('hint').textContent='ORIGINAL CHIPTUNE · '+tracks[current].bpm+' BPM';});
$('next').addEventListener('click',()=>{selectTrack(current+1);if(playing)$('hint').textContent='ORIGINAL CHIPTUNE · '+tracks[current].bpm+' BPM';});
$('shuffle').addEventListener('click',()=>selectTrack(current+1+Math.floor(Math.random()*(tracks.length-1))));
$('volume').addEventListener('input',()=>{const value=Number($('volume').value);$('volume-value').textContent=value+'%';if(master)master.gain.setTargetAtTime(value/100,audio.currentTime,.015);});
$('compact').addEventListener('click',()=>{const hidden=!$('project-details').hidden;$('project-details').hidden=hidden;$('compact').setAttribute('aria-expanded',String(!hidden));$('compact').setAttribute('aria-label',hidden?'Expand project details':'Collapse project details');$('compact').textContent=hidden?'+':'−';});
document.addEventListener('keydown',event=>{
  if($('boot').open||event.target.closest('button,a,input,textarea,select')||event.altKey||event.ctrlKey||event.metaKey||event.repeat)return;
  if(event.code==='Space'){event.preventDefault();playing?pause():play();}
  if(event.code==='ArrowRight'){event.preventDefault();selectTrack(current+1);}
  if(event.code==='ArrowLeft'){event.preventDefault();selectTrack(current-1);}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('pagehide',stop);
selectTrack(0);

function setSkin(value){
  skin=value;document.body.dataset.skin=value;
  $('skin-vice').setAttribute('aria-pressed',String(value==='vice'));
  $('skin-classic').setAttribute('aria-pressed',String(value==='classic'));
  if(!playing)drawIdle();
}
$('skin-vice').addEventListener('click',()=>setSkin('vice'));
$('skin-classic').addEventListener('click',()=>setSkin('classic'));
const boot=$('boot');
$('boot-play').addEventListener('click',()=>{boot.close();play();$('pause').focus();});
$('boot-skip').addEventListener('click',()=>{boot.close();$('play').focus();});
$('replay-intro').addEventListener('click',()=>{stop();boot.showModal();});
boot.addEventListener('close',()=>{if(!playing)$('play').focus();});
boot.showModal();
