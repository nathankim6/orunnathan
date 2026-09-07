const fs=require("fs");
const CSS=require("./css.js");
const {S:PIC}=require("./pics.js");
/* --unit=N 이면 그 유닛만, --units=1,2,3 이면 이어 붙여 한 권으로 만든다. */
const argUnits = process.argv.find(a=>/^--units=/.test(a));
const argUnit  = process.argv.find(a=>/^--unit=/.test(a));
const NOS = argUnits ? argUnits.split("=")[1].split(",").map(x=>x.trim()).filter(Boolean)
                     : [ (argUnit||"--unit=1").split("=")[1] ];
const PAD = NOS.map(x=>String(x).padStart(2,"0"));
const BOOK = PAD.length > 1;                       // 합본 여부
const UNITS = PAD.map(nn=>({ U: require(`./units/u${nn}.js`), A: require(`./art/u${nn}.js`) }));
const UN = PAD[0];
let U, icons, scenes, STRIP, VIG, VIGCAP, SCENECAP, T;               // 유닛마다 갈아 끼운다
let RR={};
const useUnit = ({U:u,A:a}) => { U=u; icons=a.icons; scenes=a.scenes; STRIP=a.STRIP; VIG=a.VIG; VIGCAP=a.VIGCAP||{}; SCENECAP=a.SCENECAP||{};
  try{RR=require(`./rr/u${String(u.no).padStart(2,"0")}.js`);}catch(e){RR={};}
  T=u.lessons; T.forEach(t=>t.para.sort((x,y)=>x[0].codePointAt(0)-y[0].codePointAt(0))); };
useUnit(UNITS[0]);
const CIR="①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳".split("");
const AL="abcdef".split("");
const esc=s=>String(s).replace(/&(?![a-z#])/g,"&amp;");
const ROLE={"s":"S","s2":"S′","v":"V","v2":"V′","m":"M"};
const TRI=`<svg viewBox="0 0 14 12" fill="none"><path d="M7 1.4 12.6 10.6H1.4z" stroke="currentColor" stroke-width="1.33" stroke-linejoin="round"/></svg>`;
const tok=(x,r)=>`<span class="tk ${r||""}"><em>${(r==="v"||r==="v2")?TRI:""}</em><b>${esc(x)}</b><i>${ROLE[r]||"&nbsp;"}</i></span>`;

const LOGO="data:image/png;base64,"+fs.readFileSync(__dirname+"/orun_mark_s.png").toString("base64");
const P=[]; // pages
let pn=0;

/* ── 레슨 3색 정규화 (OKLCH: accent L .52 C .115 / 난색 L .555 C .12 · deep L .38 · tint L .952 C .016)
   units/*.js 의 값은 그대로 두고 여기서만 바꿔 읽는다. 60 레슨 전부 흰 글자/accent ≥ 4.8:1. ── */
const NORM = {
"01":["#615EA8","#EDEEFA","#3D3A73"],"02":["#AA5B2C","#F9ECE6","#6F3510"],"03":["#077A6E","#E4F3F0","#024E46"],
"04":["#9D4965","#F9EBEE","#69293F"],"05":["#226EA7","#E7F1FA","#044671"],"06":["#05729D","#E5F1F8","#004866"],
"07":["#AC5835","#F9ECE7","#713319"],"08":["#3D7939","#E9F2E8","#1F4F1C"],"09":["#79569D","#F2EDF8","#4F336A"],
"10":["#A04957","#FAEBEC","#6B2935"],"11":["#346BA9","#E8F0FA","#184373"],"12":["#A85C26","#F8ECE6","#6E360A"],
"13":["#017A6D","#E4F3F0","#034E45"],"14":["#805397","#F3ECF7","#543165"],"15":["#9F4958","#FAEBEC","#6B2935"],
"16":["#2C6CA8","#E7F0FA","#0F4472"],"17":["#A14A49","#FAEBEA","#6C2A2A"],"18":["#3D7939","#E9F2E8","#1F4F1C"],
"19":["#7F5398","#F3ECF7","#533166"],"20":["#A2620D","#F7EDE4","#683C01"],"21":["#6F59A3","#F0EDF9","#47366F"],
"22":["#127C4F","#E7F3EB","#025030"],"23":["#AA5B2B","#F9ECE6","#6F3510"],"24":["#04729C","#E5F1F8","#004965"],
"25":["#9A4A70","#F8EBF0","#672A48"],"26":["#AD563E","#FAECE8","#723220"],"27":["#5063AB","#EBEFFA","#303E74"],
"28":["#037B61","#E5F3EE","#034F3D"],"29":["#7A559C","#F2EDF8","#4F3369"],"30":["#9C4968","#F9EBEF","#692942"],
"31":["#01739A","#E5F1F8","#004964"],"32":["#79569D","#F2EDF8","#4F336A"],"33":["#AC5835","#F9ECE7","#713318"],
"34":["#077C5A","#E6F3EC","#014F38"],"35":["#9E4960","#F9EBEE","#6A293C"],"36":["#326BA9","#E8F0FA","#164373"],
"37":["#AD5640","#FAECE8","#723222"],"38":["#7158A2","#F0EDF9","#49356E"],"39":["#377A3D","#E9F2E9","#194F20"],
"40":["#9F495C","#FAEBED","#6B2939"],"41":["#3C69AA","#E9F0FA","#1F4274"],"42":["#9F4959","#FAEBEC","#6B2936"],
"43":["#037B66","#E5F3EE","#014E40"],"44":["#7F5398","#F3ECF7","#533166"],"45":["#A46015","#F7EDE5","#6A3A02"],
"46":["#2E6CA8","#E7F0FA","#114472"],"47":["#AE5641","#FAECE8","#723122"],"48":["#297B46","#E8F2EA","#0A5027"],
"49":["#78569E","#F1EDF8","#4E336B"],"50":["#9D6505","#F6EEE4","#643E02"],"51":["#007A6D","#E4F3F0","#034E45"],
"52":["#04729C","#E5F1F8","#004965"],"53":["#AC5836","#F9ECE7","#71331A"],"54":["#934C7E","#F7EBF3","#622B53"],
"55":["#617214","#EEF1E5","#3D4901"],"56":["#356AA9","#E8F0FA","#194373"],"57":["#077A6E","#E4F3F0","#014E46"],
"58":["#A14A49","#FAEBEA","#6C2A2A"],"59":["#5D5FA9","#EDEEFA","#3A3B73"],"60":["#9F6402","#F6EDE4","#653E00"]};
const col = t => { const n = NORM[t.no]; return n ? {accent:n[0],tint:n[1],deep:n[2]} : {accent:t.accent,tint:t.tint,deep:t.deep}; };

/* ── 교사용(정답 오버프린트) ──
   node build.js --teacher  →  uNN_t.html : 모든 빈칸을 붉은 글씨로 채운다 */
const TE = process.argv.includes("--teacher");
/* 학생용은 해설을 유닛마다 끼우지 않고 책 맨 뒤에 몰아 싣는다 (교사용은 유닛 뒤에 그대로) */
const ANSBACK = !TE;
const A  = x => TE ? `<span class="ans">${x}</span>` : "";
const Aline = x => TE ? `<div class="aline filled"><span class="ans">${x}</span></div>`
                      : `<div class="aline"></div>`;
const evNo = x => (String(x).match(/^[①-⑳]+/) || [""])[0];

const WTAG=["정답","무관","반대","지엽","배경"];
const STAG=["일치","반대","과장","혼동","시점"];
const WKEY=[["정답","전체를 요약"],["무관","글에 없음"],["반대","정반대로 말함"],["지엽","일부 소재만"],["배경","도입일 뿐"]];
const SKEY=[["일치","지문과 같음"],["반대","뒤집음"],["과장","넓게 말함"],["혼동","대상을 바꿈"],["시점","순서를 바꿈"]];
const pick=(tags,ok)=>tags.map(x=>`<td class="ty"><i class="o${TE&&x===ok?" ok":""}"></i></td>`).join("");
const tyh=tags=>tags.map(x=>`<th class="ty">${x}</th>`).join("");
const legend=(arr,how)=>`<div class="tkey"><i>${how}</i>${arr.map(([a,b])=>`<span><b>${a}</b>${b}</span>`).join("")}</div>`;
const th=(no,kr,en,sub)=>`<div class="task"><div class="no">${no}</div><h3${/^[A-Za-z]/.test(kr)?' class="lat" lang="en"':""}>${kr}</h3><span class="en">${en}</span><p class="sub">${sub}</p></div>`;
const vars=t=>{const c=col(t);return `--ac:${c.accent};--tint:${c.tint};--deep:${c.deep}`;};
/* ── 배너 삽화 ──
   원문 지문(243–321단어)이 면 A(READING)의 본문 칸을 다 채우므로, 배너는 레슨의 네 번째 면
   — READ RIGHT 이어지는 면 — 맨 아래에 고정한다(css 의 figure{margin-top:auto}).
   다섯 레슨 모두 같은 자리이고, 비어 있던 그 면의 아래쪽을 채운다. */
const fig=(t,C)=>`<figure><div class="art">${scenes[t.key](C.accent,C.tint,C.deep)}</div>
   <figcaption><b>${t.fig.split("  ")[0]}</b> &nbsp;${SCENECAP[t.key]?`${SCENECAP[t.key]} — `:""}${t.fig.split("  ").slice(1).join(" ")}</figcaption></figure>`;
const head=(t,right)=>`<div class="rh"><span class="bk">올림포스 고급영어독해 <b>비문학</b>${TE?`<i class="te">교사용</i>`:""}</span><span class="mid">${right}</span><span class="lg"><i class="mk"></i><em>옳은영어</em></span></div>`;
const tabTop=()=>`--tabtop:${28+((U.no||1)-1)*18}mm`;
const tab=(t)=>`<div class="tab" style="${tabTop()}">${t&&t.no?`LESSON ${t.no}`:"ANSWERS"}</div>`;
const foot=(t,label)=>`<div class="rf"><span>${label}</span><span class="brand">옳은영어 ORUN ENGLISH</span><b>${++pn}</b></div>`;
/* 홀수 면(r, 오른쪽)·짝수 면(v, 왼쪽) 판면 미러 */
const PGC=()=>`page ${pn%2===0?"r":"v"}${TE?" te":""}`;

/* ═══ 합본 차례 (쪽 번호 없는 앞장) ═══ */
if (BOOK) {
 const AC={accent:"#13345C",tint:"#E8EDF3",deep:"#0E2542",no:""};
 const UP = ANSBACK ? 30 : 35;              // 유닛당 본문 면수 (레슨 6면 × 5)
 const LP = ANSBACK ? UNITS.length*30 : 0;  // 해설이 시작되는 면
 const ub = (uu,ui)=>{
  const base = ui*UP;
  const rows = uu.U.lessons.map((t,li)=>
   `<tr><td class="n" style="color:${col(t).accent}">${t.no}</td><td class="t">${esc(t.en)}
     <em>${t.ko}</em></td><td class="p">${base+li*6+1}</td></tr>`).join("");
  return `<div class="ub">
   <div class="uh"><span class="f">Field ${uu.U.no}</span>
    <b>${esc(uu.U.field)}</b><em>${uu.U.ko}</em><span class="pg">${base+1}</span></div>
   <table class="ul">${rows}
    <tr class="ans"><td class="n">A</td><td class="t">정답과 해설<em>지문 전문 해석 포함</em></td>
     <td class="p">${ANSBACK ? LP+ui*5+1 : base+31}</td></tr></table></div>`;
 };
 /* 두 단은 앞 반·뒤 반으로 못 박는다(12유닛이면 1–6 · 7–12) — column-count 의 균형 잡기에 맡기지 않는다 */
 const half = Math.ceil(UNITS.length/2);
 const colr = [UNITS.slice(0,half), UNITS.slice(half)]
  .map((grp,gi)=>`<div class="col">${grp.map((uu,i)=>ub(uu,gi*half+i)).join("")}</div>`).join("");
 P.push(`<div class="page toc r${TE?" te":""}" style="${vars(AC)}">
  ${head(AC,"Contents")}
  <div class="tochd"><h2 class="sechd">차례</h2>
   <p class="tocsub">옳은영어 READING GRAPHY · 예비고등 &nbsp;|&nbsp;
   ${UNITS.length}개 분야 · 지문 ${UNITS.reduce((a,u)=>a+u.U.lessons.length,0)}편 · ${UNITS.length*35}면${TE?" · 교사용":""}</p></div>
  <div class="steps">
   <b>여섯 걸음</b>
   <span>1 영영풀이 매칭</span><span>2 구문분석</span><span>3 READ RIGHT</span>
   <span>4 플로차트</span><span>5 패러프레이즈</span><span>6 Check Up</span>
  </div>
  <div class="toc2">${colr}</div>
 </div>`);
}

/* ═══ ANSWERS ═══ */
const pushAnswers = () => {
const AC={accent:"#13345C",tint:"#E8EDF3",deep:"#0E2542",no:""};
T.forEach((t,ti)=>{
 const C=col(t);
 P.push(`<div class="${PGC()}${ti===4?" tight":""}" style="${vars(AC)}">
  ${head(AC,"Answers & Full Translation")}
  ${ti===0?`<h2 class="sechd">정답과 해설</h2><p>Unit ${U.no} &nbsp;|&nbsp; Lesson ${T[0].no}–${T[T.length-1].no} &nbsp;|&nbsp; 지문 전문 해석 포함</p>`:""}
  <div class="akey">
   <div class="hd"><i class="dot" style="background:${C.accent}"></i>Lesson ${t.no} &nbsp;${esc(t.en)}<em>${t.ko}</em></div>
   <table>
    <tr><td class="k">TASK 1</td><td>${t.defOrder.map((oi,i)=>`${i+1}–${AL[oi]}`).join(" &nbsp; ")}
       &nbsp;<span class="dim">(${t.defs.map((d,i)=>`${AL[i]} ${d[0]}`).join(" · ")})</span></td></tr>
    <tr><td class="k">TASK 2</td><td>
      ${t.syn.map((x,i)=>`<b class="hl">구문 ${i+1} · ${x.n} ${x.name}</b><br>${x.k}`).join("<br>")}
      <br>${t.synd.map((d,i)=>`<b class="hl">훈련 ${i+1}</b> <span class="dim">(${d.u})</span> ${d.k}`).join("<br>")}</td></tr>
    <tr><td class="k">TASK 3</td><td>
      <b class="hl">먼저 보기 ${t.fl.model.n}</b> ${t.fl.model.ko}<br>
      ${t.fl.drill.map(d=>`<span class="hint"><b class="hl">${d.n}</b> ${esc(d.ans)}</span>`).join("<br>")}<br>
      <span class="dim">그 밖의 문장 해석은 아래 전문 해석 참조</span></td></tr>
    <tr><td class="k">TASK 4</td><td>${t.flow.filter(r=>r[2]).map((r,i)=>`${CIR[i]} ${r[2]}`).join(" &nbsp; ")}</td></tr>
    <tr><td class="k">TASK 5</td><td>${t.para.map((p,i)=>`(${i+1}) ${p[2]}`).join(" &nbsp; ")}</td></tr>
    <tr><td class="k">TASK 6-1</td><td><b class="hl">정답 ${CIR[t.check[0].ans-1]}</b><br>
      ${t.why.map((w,i)=>`${CIR[i]} <b class="hl">${t.wtype[i]}</b> ${w[0]==="정답"?"글 전체를 아우르는 제목이다":w[0]}`).join("<br>")}</td></tr>
    <tr><td class="k">TASK 6-2</td><td><b class="hl">정답 ${CIR[t.check[1].ans-1]}</b><br>
      ${t.src.map((w,i)=>`${CIR[i]} <b class="hl">${t.stype[i]}</b> ${w[0]}`).join("<br>")}</td></tr>
    <tr><td class="k">TASK 6-3</td><td>${t.check[2].ans}</td></tr>
   </table>
  </div>
  <div class="trans"><span class="eb">전문 해석 · Full Translation</span>${t.kor.map((k,i)=>`<sup>${CIR[i]}</sup>${k}`).join(" ")}</div>
  ${ti===4?`
  <div class="how" style="grid-template-columns:1fr 1fr">
   <div class="box"><div class="n">Self Check</div><h4>스스로 점검하기</h4>
    <ul class="chk"><li>다섯 지문을 소리 내어 끝까지 읽었다</li><li>WORD BANK 30개를 영영풀이로 설명할 수 있다</li>
     <li>ORUN FLOW 5단계를 보지 않고 표시할 수 있다</li><li>각 지문의 흐름을 표 없이 말로 설명할 수 있다</li>
     <li>Check Up의 오답 유형을 모두 골랐다</li></ul></div>
   ${U.next?`<div class="box"><div class="n">Next Unit</div>
    <h4>Unit ${U.no+1} · ${U.next.en}</h4>
    <p>같은 여섯 걸음으로 진행합니다. Unit ${U.no}이 ‘${U.tagline.split(" — ")[0]}’를 다루었다면,
       Unit ${U.no+1}는 ${U.next.ko}. 지문 5편 · ${U.next.words}.</p></div>`
    :`<div class="box"><div class="n">The End</div><h4>12 유닛 완주</h4>
    <p>열두 분야 예순 편을 모두 읽었습니다. 이제 같은 여섯 걸음으로 어떤 비문학 지문이든 스스로 읽어 낼 수 있습니다.</p></div>`}
  </div>`:""}
  ${tab(null)}${foot(AC,"Answers")}
 </div>`);
});
};

UNITS.forEach(UU=>{ useUnit(UU);

/* ═══ 유닛 4면 ═══ */
T.forEach(t=>{
 const V=vars(t), C=col(t), L=`Unit ${U.no} · ${esc(U.field)}`;
 /* 면 A — READING */
 P.push(`<div class="${PGC()}" style="${V}">
  ${head(t,`Lesson ${t.no} · ${t.en}`)}
  <div class="lh">
   <div class="ic">${icons[t.key](C.accent)}</div>
   <div><div class="eyebrow">Reading · ${esc(U.field)}</div><h1 lang="en">${esc(t.en)}</h1>
    <div class="kor">${t.ko}</div><div class="goal"><b>Goal</b><span>${t.goal}</span></div></div>
  </div>
  <div class="read">
   <div class="psg${t.sent.join(" ").length > 1030 ? " dense" : ""}" lang="en">${t.sent.map((s,i)=>`<sup>${CIR[i]}</sup>${esc(s)}`).join(" ")}</div>
   <div class="side">
    <div class="card bank"><h4>Word Bank</h4><table class="bank">
     ${t.bank.map(b=>`<tr><td class="w" lang="en">${b[0]}</td><td class="n">${b[1]}</td><td class="k">${b[2]}</td></tr>`).join("")}
    </table></div>
    ${(()=>{const m=t.tip.match(/^(먼저 생각해 보자)\.?\s*([\s\S]*)$/);
      return m?`<div class="tip"><b class="hl"><span class="bulb"></span>${m[1]}</b>${m[2]}</div>`:`<div class="tip"><span class="bulb"></span>${t.tip}</div>`;})()}
   </div>
  </div>
  ${tab(t)}${foot(t,L)}
 </div>`);

 /* 면 B — WORD MATCH + 구문분석 */
 P.push(`<div class="${PGC()}" style="${V}">
  ${head(t,`Lesson ${t.no} · Words & ORUN FLOW`)}
  <div class="sect">
   ${th("1","영영풀이 매칭","Word Match","영어 정의를 읽고 알맞은 낱말의 기호를 써 보세요.")}
   <div class="match">
    <div class="mcol"><h5>Word</h5>
     ${t.defs.map((d,i)=>`<div class="mrow"><div class="lab">${AL[i]}</div><div class="w" lang="en">${d[0]}</div></div>`).join("")}
    </div>
    <div class="mcol"><h5>Definition</h5>
     ${t.defOrder.map((oi,i)=>`<div class="mrow"><div class="lab">${i+1}</div><div class="d" lang="en">${t.defs[oi][1]}</div><div class="blank">${A(AL[oi])}</div></div>`).join("")}
    </div>
   </div>
  </div>
  <div class="sect grow">
   ${th("2","구문분석","Sentence Structure","핵심 구문 두 개를 익히고, 같은 눈으로 세 문장을 해석해 보세요.")}
   ${t.syn.map(x=>`<div class="syn">
     <div class="hd"><b>${x.name}</b><div class="n">문장 ${x.n}</div></div>
     <div class="bd">
      <div class="q" lang="en">${esc(x.q).replace(/«([^»]*)»/g,(m,p)=>`<u>${p}</u>`)}</div>
      <div class="d">${x.d}</div>
      <div class="k">해석 — 이 문장을 우리말로 옮겨 보세요.</div>
      ${Aline(x.k)}
     </div></div>`).join("")}
   <div class="mini" style="margin:.5mm 0 2mm">위 두 구문이 쓰인 문장이에요. 어떤 구문인지 확인하고 한 줄로 해석해 보세요.</div>
   ${t.synd.map((d,i)=>`<div class="sline">
     <div class="t"><div class="n">${i+1}</div><p lang="en">${esc(d.en)}</p><div class="use">${d.u}</div></div>
     ${Aline(d.k)}</div>`).join("")}
  </div>
  ${tab(t)}${foot(t,L)}
 </div>`);

 /* 면 C·D — READ RIGHT (두 면에 문장을 반씩 나눈다: 앞면 ceil(n/2)) */
 {
  const n = t.sent.length, half = Math.ceil(n/2);
  const row = (sIdx) => { const i = sIdx, s2 = t.sent[i];
    const dr = t.fl.drill.find(d=>d.n===CIR[i]); const rrt = TE && RR[t.no] && RR[t.no][i];
    return `<div class="rrq${rrt?" marked":""}">
    <div class="t"><div class="n">${CIR[i]}</div>${rrt
      ?`<div class="mk rrmk" lang="en">${rrt.map(x=>tok(x[0],x[1])).join("")}</div>`
      :`<p lang="en">${esc(s2)}</p>`}</div>
    ${TE&&dr&&!rrt?`<div class="mkans"><span class="ans">${esc(dr.ans)}</span></div>`:""}
    ${Aline(t.kor[i])}</div>`; };

  /* 앞면: 규칙 바 + 먼저 보기 + 앞쪽 절반 */
  P.push(`<div class="${PGC()}" style="${V}">
  ${head(t,`Lesson ${t.no} · READ RIGHT`)}
  ${th("3","READ RIGHT","Line by Line","지문의 모든 문장을 ORUN FLOW 로 분석해 보세요.")}
  <div class="oflow"><b>ORUN FLOW</b><span>1 주어 밑줄+S &nbsp;→&nbsp; 2 본동사 △+V &nbsp;→&nbsp; 3 접속사 [네모]
   &nbsp;→&nbsp; 4 종속절 S′·V′ &nbsp;→&nbsp; 5 수식어(구) 밑줄+M</span></div>
  <div class="otip"><b>분석 Tip</b> &nbsp;<span class="k">조동사+동사</span> · <span class="k">have(has, had)+p.p</span> ·
   <span class="k">be+p.p</span>(수동태) · <span class="k">be+~ing</span>(진행형) &nbsp;→&nbsp; <span class="k">한 덩어리의 동사로 표시!</span> △</div>
  <div class="model">
   <div class="cap"><b>먼저 보기</b>
    <span>다 표시된 문장 ${t.fl.model.n}을 먼저 구경하세요. 기호는 단어 바로 위·아래에!</span></div>
   <div class="mk" lang="en">${t.fl.model.toks.map(x=>tok(x[0],x[1])).join("")}</div>
   <div class="ko"><b>뼈대 해석</b>${t.fl.model.ko}</div>
  </div>
  <div class="rrh">한 문장씩 분석하기<span>문장 위에 직접 기호를 표시하고, 아래 한 줄에 우리말로 옮겨 보세요.</span></div>
  ${Array.from({length:half},(_,i)=>row(i)).join("")}
  ${tab(t)}${foot(t,L)}
 </div>`);

  /* 뒷면: 이어지는 절반 */
  P.push(`<div class="${PGC()}" style="${V}">
  ${head(t,`Lesson ${t.no} · READ RIGHT`)}
  <div class="rrh cont">한 문장씩 분석하기<span>${CIR[half]}부터 이어집니다. 문장 위에 직접 기호를 표시하고, 아래 한 줄에 우리말로 옮겨 보세요.</span></div>
  ${Array.from({length:n-half},(_,i)=>row(half+i)).join("")}
  ${fig(t,C)}
  ${tab(t)}${foot(t,L)}
 </div>`);
 }

 /* 면 D — FLOW CHART + PARAPHRASE */
 P.push(`<div class="${PGC()}" style="${V}">
  ${head(t,`Lesson ${t.no} · Flow & Paraphrase`)}
  <div class="sect">
   ${th("4","플로차트 완성","Flow Chart","보기에서 알맞은 말을 골라 빈칸을 채워 보세요.")}
   <table class="flow"><tr><th style="width:30%">Stage</th><th>What the writer does</th></tr>
    ${t.flow.map((r,i)=>{const body=r[2]?r[1].replace(/\(\s*[①-⑳]\s*\)/,m=>`<u>${A(r[2])||m}</u>`):r[1];
      return `<tr class="${r[2]?"":"given"}"><td class="step" lang="en"><div><i class="pi"><svg viewBox="0 0 48 48" fill="none">${PIC[STRIP[t.no][i]](C.accent,"#fff")}</svg></i><span>${r[0]}</span></div></td><td class="body" lang="en">${body}</td></tr>`;}).join("")}
   </table>
   <div class="bogi"><b>보기</b><span lang="en">${t.flowBogi}</span></div>
  </div>
  <div class="sect para">
   ${th("5","패러프레이즈","Paraphrase","원문을 다른 말로 바꾼 문장이에요. 보기에서 골라 빈칸을 채워 보세요.")}
   <table class="para"><tr><th>원문 표현</th><th>같은 뜻으로 바꾸어 쓰기</th></tr>
    ${t.para.map(p=>{const m=p[0].match(/^([①-⑳])\s([\s\S]*)$/);
      return `<tr><td class="src" lang="en"><span>${m[1]}</span>${esc(m[2])}</td><td class="dst" lang="en">${esc(p[1]).replace("______",`<u>${A(p[2])}</u>`)}</td></tr>`;}).join("")}
   </table>
   <div class="bogi"><b>보기</b><span lang="en">${t.paraBogi}</span></div>
  </div>
  ${tab(t)}${foot(t,L)}
 </div>`);

 /* 면 E — CHECK UP + KNOWLEDGE BANK */
 P.push(`<div class="${PGC()}" style="${V}">
  ${head(t,`Lesson ${t.no} · Check Up`)}
  <div class="sect">
   ${th("6","Check Up","Show What You Know","고르고 끝내지 말고, 왜 아닌지까지 써 보세요.")}
   <div class="q"><div class="stem"><div class="n">1</div><div>${t.check[0].q}</div></div>
    ${legend(WKEY,"선지마다 유형 하나에 ○")}
    <table class="cu"><tr><th>선지</th>${tyh(WTAG)}</tr>
     ${t.check[0].ch.map((c,i)=>`<tr><td class="op"><b${TE&&i===t.check[0].ans-1?' class="okc"':""}>${CIR[i]}</b>${esc(c)}</td>${pick(WTAG,t.wtype[i])}</tr>`).join("")}
    </table></div>
   <div class="q"><div class="stem"><div class="n">2</div><div>${t.check[1].q}</div></div>
    ${legend(SKEY,"유형에 ○ · 근거 번호 쓰기")}
    <table class="cu"><tr><th>선지</th>${tyh(STAG)}<th class="evh">근거</th></tr>
     ${t.check[1].ch.map((c,i)=>`<tr><td class="op"><b${TE&&i===t.check[1].ans-1?' class="okc"':""}>${CIR[i]}</b>${esc(c)}</td>${pick(STAG,t.stype[i])}<td class="evc"><i class="ev">${A(evNo(t.src[i][0]))}</i></td></tr>`).join("")}
    </table></div>
   <div class="q" style="margin-bottom:0"><div class="stem"><div class="n">3</div><div>${t.check[2].q}</div></div>
    ${TE?`<div class="aline filled" style="margin-left:7.5mm"><span class="ans">${t.check[2].ans}</span></div>`
        :`<div class="aline" style="margin-left:7.5mm"></div>`}</div>
  </div>
  <div class="kb">
   <div class="hd"><b>${t.kb.title}</b><em>${t.kb.lead}</em><span class="tag">Knowledge Bank</span></div>
   <div class="bd">
    <div class="row">
     <div class="vig">${VIG[t.no](C.accent,C.tint,C.deep)}
      <div class="cap">${VIGCAP[t.no]||t.kb.title}</div></div>
     <div class="txt">
      ${t.kb.items.map((it,i)=>`<div class="it"><div class="num">${i+1}</div>
        <div><h5>${it[0]}</h5><p>${it[1]}</p></div></div>`).join("")}
     </div>
    </div>
    <div class="ask"><span>생각해 볼 것</span>${t.kb.ask}</div>
   </div>
  </div>
  ${tab(t)}${foot(t,L)}
 </div>`);
});

if (!ANSBACK) pushAnswers();

}); /* ═══ 유닛 루프 끝 ═══ */

/* 학생용: 열두 유닛의 해설을 책 맨 뒤에 이어 붙인다 */
if (ANSBACK) UNITS.forEach(UU=>{ useUnit(UU); pushAnswers(); });

/* ── 넘침 방지(guard): 인쇄 직전에 면마다 본문 하단(탭·푸터 제외)을 재서, 아래 여백 18mm 선(279mm = clip.py 의 본문 하한)을
   넘는 면에만 조임 클래스를 한 단계씩 붙인다. 넘치지 않는 면은 손대지 않으므로 규격 면의 모양은 그대로다.
   p1(.psg): dense(행간 1.7) → snug(띠 2mm·헤더 여백) → denser(1.6) — 지문 글자 수(1030자)만으로는 두 줄 제목(L49·L54)이나
   21줄 지문(L48)을 미리 알 수 없다.   정답 면(.akey): tight(p30 과 같은 규격).   잰 값은 data-low(mm) 로 남긴다 */
const GUARD=`<script>
addEventListener("load",()=>{
 const LIM=279/25.4*96;
 const low=pg=>{const t=pg.getBoundingClientRect().top;let b=0;
  for(const c of pg.children){if(c.classList.contains("tab")||c.classList.contains("rf"))continue;
   b=Math.max(b,c.getBoundingClientRect().bottom-t);}return b;};
 for(const pg of document.querySelectorAll(".page")){
  const psg=pg.querySelector(".psg");
  const steps=psg?[[psg,"dense"],[pg,"snug"],[psg,"denser"]]:pg.querySelector(".akey")?[[pg,"tight"]]:[];
  for(const [el,cls] of steps){if(low(pg)<=LIM)break;el.classList.add(cls);}
  pg.dataset.low=(low(pg)/96*25.4).toFixed(1);
 }
});
</script>`;
const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>${BOOK?`READING GRAPHY · PRE-HIGH · 전 ${UNITS.length}유닛`:`READING GRAPHY · PRE-HIGH · Unit ${U.no} · ${U.field}`}</title><style>${CSS}\n.rh .lg .mk{background-image:url(${LOGO})}</style>${GUARD}</head>
<body>${P.join("\n")}</body></html>`;
const OUT = process.env.OUTDIR || ".";
fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(`${OUT}/${BOOK?"book":"u"+UN}${TE?"_t":""}.html`,html);
console.log("pages:",P.length,"bytes:",html.length);
