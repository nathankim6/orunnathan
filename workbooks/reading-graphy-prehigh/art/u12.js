/* Unit 12 삽화 — 만화 + 인포그래픽 */
const K = require("../kit.js");
const { person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop } = K;

/* 이 유닛에서만 쓰는 소품 */
const robot = (x, y, s, c, d) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-20" y="-10" width="40" height="11" rx="5" fill="${c}"/>
  <path d="M0 -10V-44l28-14" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M28 -58l11 3M28 -58l1 11" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <circle cx="0" cy="-44" r="6.5" fill="#fff" stroke="${d}" stroke-width="2.6"/>
  <circle cx="0" cy="-10" r="6" fill="#fff" stroke="${d}" stroke-width="2.6"/></g>`;

const icons = {
 blizzard:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M25 6v36M8 15l34 19M42 15L8 34" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M20 12l5 5 5-5M20 36l5 5 5-5" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M51 58V32m0 0l-6 6m6-6l6 6" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 healing:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M22 8c-6 15-6 33 0 48M42 8c6 15 6 33 0 48" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <path d="M18 20h28M18 32h28M18 44h28" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="32" cy="32" r="3.4" fill="${c}" opacity=".0"/></svg>`,
 nation:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M32 5l22 8v20c0 14-10 22-22 26C20 55 10 47 10 33V13z" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M32 5v54" stroke="${c}" stroke-width="2.2" stroke-dasharray="4 4"/>
  <path d="M17 24h11M17 32h11M17 40h9" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="44" cy="22" r="3.6" fill="${c}"/><circle cx="38" cy="38" r="3.6" fill="${c}"/><circle cx="50" cy="38" r="3.6" fill="${c}"/>
  <path d="M44 26v5M39 34l4-3M49 34l-4-3" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
 cobot:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="24" y="27" width="18" height="17" rx="3" fill="${c}" opacity=".28" stroke="${c}" stroke-width="2.8"/>
  <path d="M7 55V36l10-10 8 10" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="7" cy="36" r="3.6" fill="${c}"/><circle cx="17" cy="26" r="3.6" fill="${c}"/>
  <rect x="1" y="55" width="14" height="5" rx="2.5" fill="${c}"/>
  <path d="M58 56V41c0-3-2-5-5-5h-9" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <circle cx="44" cy="36" r="4" fill="${c}"/></svg>`,
 needs:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M14 22h36l-4 34H18z" fill="${c}" opacity=".2" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M24 22v-4a8 8 0 0 1 16 0v4" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M28 34c0-3.4 2.4-6 6-6s6 2.6 6 6-4.6 4.4-4.6 7.6" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="35.4" cy="49" r="2.5" fill="${c}"/></svg>`,
};

const scenes = {
 blizzard:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:18,w:190,h:190,c:d,fill:"#fff",n:1,label:"얼음이 줄면 벌어지는 일"})}
  <rect x="44" y="72" width="60" height="66" rx="8" fill="#fff" stroke="${d}" stroke-width="2.6"/>
  <rect x="126" y="72" width="60" height="66" rx="8" fill="${t}" stroke="${d}" stroke-width="2.6"/>
  ${[[59,95],[89,95],[74,118]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="4.5" ry="6" fill="${c}"/>`).join("")}
  ${[[139,90],[154,90],[169,90],[139,110],[154,110],[169,110],[139,130],[154,130]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="4.5" ry="6" fill="${c}"/>`).join("")}
  ${label({x:74,y:158,text:"얼음이 덮인 바다",c:d,size:10.5})}
  ${label({x:156,y:158,text:"드러난 바다",c:d,size:10.5})}
  ${panel({x:225,y:18,w:190,h:190,c:d,fill:"#fff",n:2,label:"북극과 열대의 기온 차"})}
  ${bar({x:282,base:160,h:88,c,op:.5,cap:"예전",capc:d,w:34})}
  ${bar({x:360,base:160,h:52,c,cap:"지금",capc:d,w:34})}
  ${ground({x1:252,x2:392,y:160,c:d,w:3})}
  ${arrow({x1:304,y1:56,x2:346,y2:96,c:d,w:3.4})}
  ${panel({x:430,y:18,w:190,h:190,c:d,fill:"#fff",n:3,label:"제트 기류가 굽이치는 폭"})}
  ${bar({x:487,base:160,h:48,c,op:.5,cap:"예전",capc:d,w:34})}
  ${bar({x:565,base:160,h:92,c,cap:"지금",capc:d,w:34})}
  ${ground({x1:457,x2:597,y:160,c:d,w:3})}
  ${arrow({x1:509,y1:98,x2:551,y2:54,c:d,w:3.4})}
  ${label({x:320,y:270,text:"기온 차가 줄면 제트 기류가 느려지고 크게 굽이친다",c,size:12.5})}</svg>`,
 healing:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:20,y:18,w:190,h:190,c:d,fill:"#fff",n:1,label:"대신하는 미래"})}
  ${prop.screen(115,100,1.7,c)}
  ${label({x:115,y:180,text:"사람이 사라진 자리",c:d,size:10.5})}
  ${panel({x:225,y:18,w:190,h:190,c:d,fill:"#fff",n:2,label:"곁에서 돕는 미래"})}
  ${person({x:272,y:186,s:.78,c,pose:"open",hair:"cap",face:"smile"})}
  ${prop.screen(322,92,1.2,c)}
  ${person({x:376,y:186,s:.78,c,pose:"down",hair:"bob",face:"smile",flip:1})}
  ${label({x:322,y:44,text:"공감 · 통찰 · 손기술",c:d,size:10})}
  ${panel({x:430,y:18,w:190,h:190,c:d,fill:"#fff",n:3,label:"정책은 어디로"})}
  ${tag({x:478,y:70,text:"규제 완화",c})}
  ${label({x:562,y:74,text:"비용을 깎는다",c:d,size:9.5,op:.85})}
  ${tag({x:478,y:118,text:"더 나은 자료",c,fill:"#fff"})}
  ${label({x:562,y:122,text:"책임을 늘린다",c:d,size:9.5,op:.85})}
  ${label({x:525,y:176,text:"필자는 아래쪽을 고른다",c:d,size:10.5})}
  ${label({x:320,y:270,text:"대신하는 쪽이 아니라 사람 곁에서 돕는 쪽으로",c,size:12.5})}</svg>`,
 nation:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:18,w:270,h:190,c:d,fill:"#fff",n:1,label:"법을 받아들이면 들어온다"})}
  ${prop.paper(96,110,1.7,c)}
  ${arrow({x1:140,y1:110,x2:180,y2:110,c:d,w:3.6})}
  ${person({x:214,y:190,s:.8,c,pose:"open",hair:"bob",face:"glad",brow:"up"})}
  ${person({x:262,y:190,s:.8,c,pose:"down",hair:"cap",face:"smile",flip:1})}
  ${tag({x:157,y:52,text:"시민적",c})}
  ${panel({x:348,y:18,w:270,h:190,c:d,fill:"#fff",n:2,label:"혈통으로 정하면 남는 사람"})}
  <path d="M552 70v122" stroke="${d}" stroke-width="3" stroke-dasharray="7 5"/>
  ${label({x:552,y:62,text:"국경",c:d,size:10,op:.85})}
  ${person({x:440,y:190,s:.66,c,pose:"down",hair:"short",face:"flat"})}
  ${person({x:494,y:190,s:.66,c,pose:"down",hair:"short",face:"flat"})}
  ${person({x:588,y:190,s:.66,c,pose:"down",hair:"short",face:"worry",brow:"down"})}
  ${tag({x:456,y:52,text:"종족적",c,fill:"#fff"})}
  ${label({x:320,y:270,text:"누구를 ‘우리’로 셀지가 정치의 한복판에 놓인다",c,size:12.5})}</svg>`,
 cobot:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${panel({x:22,y:18,w:270,h:190,c:d,fill:"#fff",n:1,label:"옛 이야기"})}
  ${robot(112,188,1,c,d)}
  ${person({x:204,y:190,s:.78,c,pose:"down",hair:"short",face:"flat",brow:"down"})}
  ${arrow({x1:238,y1:118,x2:278,y2:118,c:d,w:3.4})}
  ${label({x:258,y:104,text:"떠난다",c:d,size:10,op:.85})}
  ${panel({x:348,y:18,w:270,h:190,c:d,fill:"#fff",n:2,label:"지금 벌어지는 일"})}
  <rect x="378" y="184" width="212" height="10" rx="5" fill="${c}" opacity=".28"/>
  ${robot(432,184,.88,c,d)}
  ${person({x:552,y:184,s:.8,c,pose:"point",hair:"bob",face:"smile",flip:1})}
  <rect x="456" y="104" width="46" height="36" rx="5" fill="#fff" stroke="${d}" stroke-width="2.6"/>
  ${label({x:432,y:204,text:"힘 · 반복",c:d,size:10})}
  ${label({x:552,y:204,text:"판단",c:d,size:10})}
  ${label({x:320,y:270,text:"기계가 절반을 맡으면, 남은 절반은 누가 정하는가",c,size:12.5})}</svg>`,
 needs:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  ${ground({x1:64,x2:576,y:136,c:d,w:3.4})}
  ${step({x:110,y:136,n:"1",c:d,r:16,label:"수돗물뿐이던 때",below:1})}
  ${step({x:320,y:136,n:"2",c:d,r:16,label:"광고가 붙는다",below:1})}
  ${step({x:530,y:136,n:"3",c:d,r:16,label:"오늘",below:1})}
  ${bubble({x:74,y:38,w:150,h:36,lines:["문제가 아니었다"],c:d,tail:"bl",size:11})}
  ${bubble({x:284,y:38,w:150,h:36,lines:["이름이 붙는다"],c:d,tail:"bl",size:11})}
  ${bubble({x:416,y:38,w:150,h:36,lines:["필요가 된다"],c:d,tail:"br",size:11})}
  ${stat({x:320,y:212,big:"생수",small:"본문이 든 사례 — 공유재를 해친다",c,size:24})}
  ${label({x:320,y:270,text:"어떤 필요에는 생일이 있다",c,size:12.5})}</svg>`,
};

const STRIP = {
 "56":["globe","dome","ruler","warn","loop"],
 "57": ["heartbeat", "gear", "pair", "balance", "ask"],
 "58":["map","pair","alone","balance","zipper"],
 "59":["gear","cable","pair","wrench","warn"],
 "60":["tag","coin","spark","eye","ask"]
};

const VIG = {
 "56":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${bar({x:56,base:104,h:74,c,op:.5,cap:"예전",capc:d,w:28})}
  ${bar({x:104,base:104,h:44,c,cap:"지금",capc:d,w:28})}
  ${bar({x:164,base:104,h:38,c,op:.5,cap:"예전",capc:d,w:28})}
  ${bar({x:212,base:104,h:74,c,cap:"지금",capc:d,w:28})}
  <path d="M40 104h84M148 104h84" stroke="${d}" stroke-width="2.8" stroke-linecap="round"/>
  ${label({x:82,y:140,text:"기온 차",c:d,size:10})}
  ${label({x:190,y:140,text:"굽이치는 폭",c:d,size:10})}</svg>`,
 "57":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${person({x:60,y:124,s:.56,c,pose:"open",hair:"cap",face:"smile"})}
  ${prop.screen(120,58,1.05,c)}
  ${person({x:180,y:124,s:.56,c,pose:"down",hair:"bob",face:"smile",flip:1})}
  ${label({x:120,y:142,text:"대신이 아니라 곁에서",c:d,size:10.5})}</svg>`,
 "58":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M170 22v92" stroke="${d}" stroke-width="3" stroke-dasharray="6 5"/>
  ${label({x:170,y:16,text:"국경",c:d,size:10,op:.85})}
  ${person({x:66,y:112,s:.52,c,pose:"down",hair:"short",face:"flat"})}
  ${person({x:118,y:112,s:.52,c,pose:"down",hair:"short",face:"flat"})}
  ${person({x:204,y:112,s:.52,c,pose:"down",hair:"short",face:"worry",brow:"down"})}
  ${label({x:120,y:140,text:"같은 사람들, 다른 쪽",c:d,size:10.5})}</svg>`,
 "59":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="30" y="110" width="180" height="9" rx="4.5" fill="${c}" opacity=".28"/>
  ${robot(72,110,.72,c,d)}
  ${person({x:168,y:110,s:.58,c,pose:"point",hair:"bob",face:"smile"})}
  <rect x="106" y="52" width="34" height="26" rx="4" fill="#fff" stroke="${d}" stroke-width="2.4"/>
  ${label({x:120,y:140,text:"나란히 선다",c:d,size:10.5})}</svg>`,
 "60":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${ground({x1:34,x2:206,y:80,c:d,w:3})}
  ${step({x:52,y:80,n:"1",c:d,r:12,label:"수돗물",below:1})}
  ${step({x:120,y:80,n:"2",c:d,r:12,label:"광고",below:1})}
  ${step({x:188,y:80,n:"3",c:d,r:12,label:"오늘",below:1})}
  ${label({x:120,y:36,text:"필요가 생긴 자리",c:d,size:11})}
  ${label({x:120,y:140,text:"어떤 필요에는 생일이 있다",c:d,size:10.5})}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG };
