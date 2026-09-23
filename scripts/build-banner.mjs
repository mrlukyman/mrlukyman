import {writeFileSync} from 'node:fs';
const dir = new URL('../', import.meta.url);
const glyphs = {F:['11111','10000','10000','11110','10000','10000','10000'],M:['10001','11011','10101','10101','10001','10001','10001'],
 L:['10000','10000','10000','10000','10000','10000','11111'],
 U:['10001','10001','10001','10001','10001','10001','01110'],
 K:['10001','10010','10100','11000','10100','10010','10001'],
 A:['01110','10001','10001','11111','10001','10001','10001'],
 S:['01111','10000','10000','01110','00001','00001','11110'],
 '.':['00000','00000','00000','00000','00000','00110','00110'],
 E:['11111','10000','10000','11110','10000','10000','11111'],
 X:['10001','10001','01010','00100','01010','10001','10001']
};
function pixelText(word,x,y,size) {
 return [...word].map((c,k)=>glyphs[c].map((row,j)=>[...row].map((v,i)=>v==='1'?`<rect x="${x+(k*6+i)*size}" y="${y+j*size}" width="${size-1}" height="${size-1}"/>`:'').join('')).join('')).join('');
}
function bevel(x,y,w,h){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#metal)" stroke="#090e14" stroke-width="3"/><path d="M${x+2} ${y+h-2}V${y+2}H${x+w-2}" fill="none" stroke="#72808d" stroke-width="2"/><path d="M${x+w-2} ${y+2}V${y+h-2}H${x+2}" fill="none" stroke="#101821" stroke-width="3"/>`;}
const bars=Array.from({length:19},(_,i)=>{
 const h=24+(i*23%83);return `<g transform="translate(${518+i*12} 225)"><rect class="bar" style="animation-delay:-${i*.16}s;animation-duration:${1.1+i%4*.3}s" y="-${h}" width="8" height="${h}" fill="url(#led)"/></g>`;
}).join('');
const wave=Array.from({length:96},(_,i)=>{
 const h=3+Math.abs(Math.sin(i*.25)*Math.sin(i*.59))*42;return `<rect x="${46+i*4.6}" y="${185-h/2}" width="2.4" height="${h}"/>`;
}).join('');
const transport=[`<path d="M58 327V351M82 326L63 339L82 352Z"/>`,`<path d="M125 325L125 353L147 339Z" fill="#a6e77b"/>`,`<path d="M189 326V352M201 326V352" stroke="#c2c4b6" stroke-width="7"/>`,`<rect x="248" y="327" width="23" height="24"/>`,`<path d="M316 326L335 339L316 352ZM340 327V351"/>`].map((shape,i)=>bevel(38+i*66,310,57,57)+`<g fill="#bdc0b4" stroke="#bdc0b4" stroke-width="2">${shape}</g>`).join('');
const tracks=['YIBE','SPOTIFY → APPLE MUSIC','FLUTTER WEBRTC','NFTSWAP','SPACE EXPLORER','DIJKSTRA'];
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="414" viewBox="0 0 1200 414" role="img" aria-labelledby="title desc">
<title id="title">LUKAS.FM — code and music</title><desc id="desc">Animated Winamp-inspired project player. Click to open the interactive version, browse projects and play original chiptune loops.</desc>
<defs>
<linearGradient id="metal" x2="0" y2="1"><stop stop-color="#46515d"/><stop offset=".1" stop-color="#303b49"/><stop offset=".5" stop-color="#25303e"/><stop offset="1" stop-color="#1a2532"/></linearGradient>
<linearGradient id="led" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#78c8be"/><stop offset=".6" stop-color="#afdccb"/><stop offset="1" stop-color="#ef90c1"/></linearGradient>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 3.5H4" stroke="#02090a" opacity=".3"/></pattern>
</defs>
<style>text{font-family:monospace}.bar{transform-origin:0 0;animation:eq 1.8s ease-in-out infinite}.wave{animation:wave 3s ease-in-out infinite}@keyframes eq{0%,100%{transform:scaleY(.45)}30%{transform:scaleY(1)}60%{transform:scaleY(.65)}80%{transform:scaleY(.3)}}@keyframes wave{50%{opacity:.5}}@media(prefers-reduced-motion:reduce){.bar,.wave{animation:none}}</style>
${bevel(2,2,1196,410)}
${bevel(14,14,1172,31)}
<path d="M32 20L23 33H31L27 42L43 27H34L38 20Z" fill="#f398ca"/>
<text x="55" y="35" fill="#c4c6bd" font-size="15" letter-spacing="3">LUKAS.FM / PERSONAL STEREO</text>
${bevel(1114,20,24,19)}${bevel(1150,20,24,19)}
<path d="M1120 33H1132M1157 25L1168 35M1168 25L1157 35" stroke="#c8c9be" stroke-width="2"/>
<rect x="28" y="61" width="745" height="192" fill="#060e10" stroke="#080e14" stroke-width="6"/>
<path d="M28 253V61H773" fill="none" stroke="#0e1822" stroke-width="2"/>
<g fill="#f398ca">${pixelText('LUKAS.FM',47,81,7)}</g>
<text x="48" y="158" fill="#a2e2cd" font-size="20" letter-spacing="4">CODE + MUSIC</text>
<g class="wave" fill="#82cfc0">${wave}</g>
${bars}
<rect x="36" y="69" width="729" height="177" fill="url(#scan)"/>
<text x="48" y="235" fill="#698779" font-size="12" letter-spacing="1.5">WEB / MOBILE / DESKTOP</text>
<text x="621" y="90" fill="#7f9a83" font-size="11" letter-spacing="1">STEREO</text>
<rect x="30" y="270" width="739" height="17" fill="#081018" stroke="#465565"/>
<path d="M35 278H371" stroke="#719566" stroke-width="7"/>${bevel(367,266,30,25)}
${transport}
<path d="M402 326H410L420 318V350L410 342H402ZM427 326Q438 334 427 342" fill="#babeb1" stroke="#babeb1" stroke-width="2"/>
<rect x="445" y="323" width="166" height="14" fill="#080e15" stroke="#586373"/><path d="M449 330H537" stroke="#8aae72" stroke-width="5"/>${bevel(528,315,19,30)}
${bevel(641,310,121,32)}<text x="661" y="332" fill="#b5cba1" font-size="12">SHUFFLE</text>
<circle cx="650" cy="362" r="3" fill="#9cdb71"/><text x="664" y="367" fill="#99a28f" font-size="11">ORIGINAL LOOPS</text>
<text x="39" y="395" fill="#95a29f" font-size="13" letter-spacing="1">LUKÁŠ HARING · SOFTWARE ENGINEER · COPENHAGEN</text>
${bevel(790,60,382,333)}
<text x="813" y="85" fill="#c4c6bd" font-size="12" letter-spacing="3">PLAYLIST / SELECTED WORK</text>
<rect x="804" y="97" width="355" height="230" fill="#080f10" stroke="#121c23" stroke-width="3"/>
<rect x="807" y="104" width="349" height="32" fill="#263d2c"/>
${tracks.map((t,i)=>`<text x="820" y="${126+i*35}" fill="${i===0?'#c3ed9d':'#91bb79'}" font-size="15">${i===0?'▶':' ' } ${String(i+1).padStart(2,'0')} ${t}</text>`).join('')}
<text x="814" y="351" fill="#929f94" font-size="11" letter-spacing="1">06 TRACKS / CODE + EXPERIMENTS</text>
${bevel(804,362,355,23)}<text x="833" y="378" fill="#d2d5c3" font-size="12" letter-spacing="1">CLICK TO LAUNCH THE PLAYER ↗</text>
</svg>`;
writeFileSync(new URL('assets/player.svg',dir),svg);
