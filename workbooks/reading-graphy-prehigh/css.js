module.exports = `
@page { size: A4; margin: 0; }
*{box-sizing:border-box;margin:0;padding:0}
/* ═══ 디자인 토큰 — 방향 A "정통 교과서" ═══
   타입 스케일 8단(1.15–1.2 비율): t1 6.5 각주 · t2 7.5 아이브로우·캡션 · t3 9 표·보조 본문 · t4 10 본문·문항
                                   t5 11 영어 지문·라틴 제목 · t6 12.5 소제목 · t7 15 면 제목 · t8 22 레슨 제목
   굵기 3단: 400 본문 · 500 라벨/아이브로우 · 700 제목·강조 (Noto Sans CJK KR: Regular/Medium/Bold)
   자간 3값: 대문자 영문 아이브로우 .14em · 소형 라벨(한글 표 머리 포함) .02em · 본문 0 (한글 제목 -.02em)
   서체 2종: 지문에서 온 영어 = --serif(Source Serif 4) · 지시·정의·한글 = --sans. 답란 2종: 단어 18mm · 기호 10mm, 0.75pt n400
   행간 4값: 본문 1.6 · 표/목록 1.45 · 제목 1.2 · 기호 표기 영어 예문 2.2
   반경 3값: 2px 칩·답란 · 6px 카드·표 · 999px 알약   선 3값: 0.5pt 헤어라인 · 1pt 강조 · 2pt 액센트 룰
   회색: 난색 단일 스케일(H80) — 회색 hex 는 :root 밖에서 쓰지 않는다.
   면당 색 예산: 레슨 accent 3단(--ac --deep --tint) + 회색 + 브랜드 옐로 1곳 이하. ORUN FLOW S/V/M 은 기호 표기에만. */
:root{
 --t1:6.5pt; --t2:7.5pt; --t3:9pt; --t4:10pt; --t5:11pt; --t6:12.5pt; --t7:15pt; --t8:22pt;
 --n950:#23211F; --n800:#3E3D3A; --n700:#656360; --n600:#797774; --n500:#8E8C89;
 --n400:#A6A4A1; --n300:#BFBDBA; --n200:#E1DFDD; --n100:#EEECEA; --n50:#F6F5F2; --paper:#FFFDF9;
 --ink:var(--n950); --sub:var(--n700); --faint:var(--n500); --hair:var(--n200); --cool:var(--n50);
 --navy:#13345C; --yel:#FDD100; --red:#C8102E;
 --S:#2E8B7F; --M:#B4453A;
 --lh:1.6; --lhl:1.45; --lhh:1.2; --lhm:2.2;
 --rc:2px; --rk:6px; --rp:999px;
 --hl:0.5pt solid var(--hair); --ln:1pt; --rule:2pt;
 --sans:'Noto Sans CJK KR','Noto Sans KR',sans-serif;
 --serif:'Source Serif 4','Noto Serif','Noto Serif CJK KR','Liberation Serif',serif;
 --eb-size:var(--t2); --eb-ls:.14em;
}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:var(--sans);color:var(--ink);background:#fff;font-size:var(--t4);line-height:var(--lh);
 font-feature-settings:"palt" 0}
b,strong{font-weight:700}
/* ── 판면: 상 16 · 하 18 · 안쪽 19 · 바깥 15 (홀수=오른쪽 면 r, 짝수=왼쪽 면 v) · 본문 폭 176mm ── */
.page{width:210mm;height:297mm;padding:16mm 15mm 22mm 19mm;position:relative;
 page-break-after:always;background:var(--paper);overflow:hidden;display:flex;flex-direction:column}
.page.v{padding:16mm 19mm 22mm 15mm}
.page:last-child{page-break-after:auto}
/* ── 공통: 아이브로우 · 칩 · 번호 · 답란 · 헤어라인 ── */
.eb,.eyebrow,.card h4,.mcol h5,.task .en,table.flow th,table.para th,table.cu th,.kb .hd .tag,.model .cap b,
.oflow b,.bogi b,.akey td.k,.rh .mid,.kb .vig .cap,.tab,.how .box .n,.lh .goal b{
 font-size:var(--eb-size);font-weight:500;letter-spacing:var(--eb-ls);text-transform:uppercase;color:var(--sub);
 line-height:var(--lhh)}
.chip{width:7mm;height:7mm;border-radius:var(--rc);background:var(--ac);color:#fff;font-size:var(--t4);font-weight:500;
 display:flex;align-items:center;justify-content:center;flex:0 0 auto;letter-spacing:.02em}
.num{width:5mm;height:5mm;border-radius:50%;background:var(--tint);color:var(--deep);font-size:var(--t2);font-weight:700;
 display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.aline{height:8mm;border-bottom:0.75pt solid var(--n400)}
.rrq .aline{height:6.5mm}
/* ── 러닝 헤더/푸터 ── */
.rh{display:flex;align-items:center;gap:3mm;padding-bottom:2mm;border-bottom:var(--hl);margin-bottom:5mm;height:8mm}
.rh .bk{display:flex;align-items:center;gap:2mm;font-size:8pt;font-weight:500;color:var(--navy);letter-spacing:-.01em;white-space:nowrap}
.rh .bk::before{content:"";width:2pt;height:4mm;background:var(--ac,var(--navy))}
.rh .bk b{font-weight:700;color:var(--navy)}
.rh .mid{margin-left:auto;white-space:nowrap}
.rh .lg{display:flex;align-items:center;gap:1.5mm;padding-left:3mm;border-left:var(--hl);white-space:nowrap}
.rh .lg .mk{display:block;width:5mm;height:4.2mm;background-size:contain;background-repeat:no-repeat;background-position:center}
.rh .lg em{font-style:normal;font-size:8pt;font-weight:700;color:var(--navy);letter-spacing:-.02em}
.rf{position:absolute;left:19mm;right:15mm;bottom:8mm;display:flex;justify-content:space-between;align-items:baseline;
 font-size:var(--t2);color:var(--sub);letter-spacing:.02em}
.page.v .rf{left:15mm;right:19mm;flex-direction:row-reverse}
.rf b{color:var(--ink);font-size:var(--t3);font-weight:700;min-width:8mm;text-align:right}
.page.v .rf b{text-align:left}
.rf .brand{color:var(--faint)}
/* ── 책 색인 탭: 모든 면, 유닛별 계단식 ── */
.tab{position:absolute;right:0;top:var(--tabtop,30mm);width:7mm;padding:5mm 0;background:var(--ac);
 border-radius:var(--rc) 0 0 var(--rc);color:#fff;text-align:center;writing-mode:vertical-rl;white-space:nowrap}
.page.v .tab{right:auto;left:0;border-radius:0 var(--rc) var(--rc) 0;transform:rotate(180deg)}
/* ── 레슨 헤더 ── */
.lh{display:flex;gap:5mm;align-items:center;padding-bottom:4mm;border-bottom:var(--ln) solid var(--ac);margin-bottom:6mm}
.lh .ic{width:15mm;height:15mm;flex:0 0 15mm;border-radius:50%;background:var(--tint);display:flex;align-items:center;justify-content:center}
.lh .ic svg{width:9.5mm;height:9.5mm}
.eyebrow{color:var(--ac);margin-bottom:1.5mm}
.lh h1{font-size:var(--t8);font-weight:700;letter-spacing:-.02em;line-height:var(--lhh);margin-bottom:2mm;color:var(--ink)}
.lh .kor{font-size:var(--t5);font-weight:500;color:var(--sub);margin-bottom:2.5mm;letter-spacing:-.01em}
.lh .goal{display:flex;align-items:baseline;gap:2.5mm;font-size:var(--t3);color:var(--ink);line-height:var(--lhl)}
.lh .goal b{color:var(--ac);white-space:nowrap}
.rule{display:none}
/* ── 읽기 2단 (8:4 → 본문 112mm · 여백 6mm · 측면 58mm) ── */
.read{display:grid;grid-template-columns:1fr 56mm;gap:6mm;align-items:stretch}
.psg{font-family:var(--serif);font-size:var(--t5);line-height:1.85;text-align:left;color:var(--ink)}
.psg.dense{line-height:1.7}
.psg.denser{line-height:1.6}   /* 넘침 방지 마지막 단계 — build.js 의 guard 가 dense·snug 로도 하단 한계(279mm)를 못 지킬 때만 */
.psg sup{font-family:var(--sans);font-size:var(--t1);font-weight:700;color:var(--ac);vertical-align:super;line-height:0;margin-right:.3mm}
.side{display:flex;flex-direction:column;gap:5mm}
.card{padding:0}
.card h4{margin-bottom:2mm}
.card.bank{border-top:var(--ln) solid var(--ac);padding-top:2.5mm}
table.bank{width:100%;border-collapse:collapse;font-size:var(--t3);line-height:var(--lhl)}
table.bank td{padding:1.4mm 0;vertical-align:top;border-bottom:var(--hl)}
table.bank tr:last-child td{border-bottom:0}
table.bank .w{font-weight:700;width:1%;padding-right:2mm;white-space:nowrap}
table.bank .n{width:5mm;color:var(--ac);font-weight:500;font-size:var(--t2);text-align:center;padding-top:1.8mm}
table.bank .k{color:var(--ink);padding-left:1.5mm;word-break:keep-all;letter-spacing:-.01em}
.tip{border-top:var(--hl);padding-top:2.5mm;font-size:var(--t3);color:var(--ink);line-height:var(--lh);margin-top:auto}
.tip .hl{color:var(--ac);font-weight:700;font-size:var(--t3);margin-right:2mm;white-space:nowrap}   /* 런인 라벨: p5 '생각해 볼 것' 과 같은 accent 700 + 본문 ink */
.tip .bulb{display:inline-block;width:2.6mm;height:2.6mm;border-radius:50%;background:var(--yel);margin-right:1.5mm;vertical-align:-.2mm}
/* ── 삽화 ── */
.gap{flex:0 1 8mm;min-height:4mm}   /* 지문–배너 띠: 8mm, 지문이 길어 넘칠 때만 4mm 까지 줄어든다 */
/* p1 넘침 방지 2단계(.snug — guard 가 붙인다): 띠 2mm 까지, 레슨 헤더·캡션 여백 1mm 남짓 — 제목이 두 줄인 레슨(L49·L54)용 */
.page.snug .gap{min-height:2mm}
.page.snug .lh{margin-bottom:5mm;padding-bottom:3.5mm}
.page.snug figcaption{margin-top:1.5mm}
figure{margin-top:0;flex:0 0 auto}
figure .art{height:72mm;border:0;background:transparent;display:flex;align-items:center;justify-content:center;padding:0 0 1mm}
figure .art svg{height:100%;width:100%}
figcaption{font-size:var(--t2);color:var(--sub);margin-top:2mm;line-height:var(--lhl)}
figcaption b{color:var(--ac);font-weight:700;letter-spacing:.02em}
/* ── 과제 헤더 (2줄 압축): [칩 7mm ×2줄][제목  아이브로우] / [안내문] + 전폭 헤어라인 ── */
.task{display:grid;grid-template-columns:7mm auto 1fr;column-gap:3mm;row-gap:.6mm;align-items:center;
 margin:0 0 3mm;padding-bottom:1.8mm;border-bottom:var(--hl)}
.task .no{grid-row:1/span 2;width:7mm;height:7mm;border-radius:var(--rc);background:var(--ac);color:#fff;font-size:var(--t4);font-weight:500;
 display:flex;align-items:center;justify-content:center;align-self:center}
.task h3{grid-row:1;grid-column:2;font-size:var(--t6);font-weight:700;letter-spacing:-.02em;white-space:nowrap;line-height:var(--lhh);color:var(--ink);align-self:end}
.task h3.lat{font-size:var(--t5);letter-spacing:0;font-weight:700}
.task .en{grid-row:1;grid-column:3;white-space:nowrap;align-self:end;padding-bottom:.4mm}
.task .sub{grid-row:2;grid-column:2/span 2;font-size:var(--t3);color:var(--sub);font-weight:400;line-height:var(--lhl);align-self:start}
.task .line{display:none}
.sect{margin-bottom:7mm}
.sect.para{margin-top:4.5mm}
.sect:last-child{margin-bottom:0}
/* ── 영영풀이 매칭 (5:7 칼럼) ── */
.match{display:grid;grid-template-columns:4fr 8fr;gap:5mm}
.mcol h5{margin-bottom:1.5mm;padding-bottom:1.5mm;border-bottom:var(--ln) solid var(--ink)}
.mrow{display:flex;align-items:center;gap:2.5mm;padding:0;border-bottom:var(--hl);height:auto;min-height:8.5mm}
.mrow .lab{flex:0 0 5mm;height:5mm;border-radius:50%;background:var(--tint);color:var(--deep);font-size:var(--t2);font-weight:700;
 display:flex;align-items:center;justify-content:center}
.mrow .w{font-weight:700;font-size:var(--t4);flex:1;letter-spacing:.01em;line-height:var(--lhl)}
.mrow .blank{flex:0 0 10mm;height:5mm;border-bottom:0.75pt solid var(--n400);text-align:center}
.mrow .d{font-size:var(--t3);color:var(--ink);flex:1;line-height:1.3;white-space:normal;overflow:visible;text-overflow:clip}
/* ── 구문분석 ── */
.syn{border:var(--hl);border-radius:var(--rk);padding:3mm 4mm 3mm;margin-bottom:2.5mm;background:#fff}
.syn .hd{display:flex;gap:2.5mm;align-items:baseline;margin-bottom:2mm}
.syn .hd .n{font-size:var(--t2);font-weight:500;color:var(--sub);letter-spacing:.02em;white-space:nowrap;
 border:var(--hl);border-radius:var(--rp);padding:.2mm 2mm;line-height:var(--lhl)}
.syn .hd b{font-size:var(--t4);font-weight:700;color:var(--deep)}
.syn .bd{padding:0}
.syn .q{font-family:var(--serif);font-size:var(--t5);line-height:1.6;margin-bottom:1.5mm}
.syn .q u{text-decoration:none;border-bottom:var(--ln) solid var(--ac);font-weight:700;color:var(--deep);padding-bottom:.3mm}
.syn .d{font-size:var(--t3);color:var(--sub);line-height:var(--lhl);border-left:var(--rule) solid var(--tint);padding:.5mm 0 .5mm 3mm}
.syn .d b{color:var(--deep);font-weight:700}
.syn .k{font-size:var(--t2);font-weight:500;color:var(--sub);letter-spacing:.02em;margin:2.5mm 0 0}
.syn .aline{height:7mm}
.mini{font-size:var(--t3);color:var(--sub);line-height:var(--lhl)}
.sline{margin-bottom:2.5mm}
.page:not(.te) .sect.grow{flex:1 0 auto;display:flex;flex-direction:column;margin-bottom:0}
.page:not(.te) .sect.grow>*{flex:0 0 auto}
.page:not(.te) .sect.grow .sline:last-child{margin-bottom:0}
.page:not(.te) .sect.grow>.sline{flex:1 0 auto;display:flex;flex-direction:column}
.page:not(.te) .sline>*{flex:0 0 auto}
.page:not(.te) .sline .aline{flex:1 0 8mm;height:auto}
.sline .t{display:flex;align-items:baseline;gap:2.5mm}
.sline .t .n{flex:0 0 5mm;height:5mm;border-radius:50%;background:var(--tint);color:var(--deep);font-size:var(--t2);font-weight:700;
 display:flex;align-items:center;justify-content:center;align-self:center}
.sline .t p{flex:1;font-family:var(--serif);font-size:var(--t4);line-height:1.6}
.sline .use{flex:0 0 auto;font-size:var(--t2);font-weight:500;color:var(--sub);white-space:nowrap;letter-spacing:.02em;
 border:var(--hl);border-radius:var(--rp);padding:.2mm 2mm;line-height:var(--lhl)}
.sline .aline{height:8mm}
/* ── READ RIGHT ── */
.oflow{background:var(--deep);color:#fff;border-radius:var(--rc);padding:1.3mm 3mm 1.2mm;font-size:var(--t3);font-weight:500;
 display:flex;align-items:baseline;gap:3mm;line-height:var(--lhl)}
.oflow b{color:#fff;opacity:.85;white-space:nowrap}
.otip{padding:1.3mm 0 1.4mm;border-bottom:var(--hl);font-size:var(--t3);color:var(--sub);margin-bottom:2mm;line-height:var(--lhl)}
.otip>b:first-child{color:var(--deep);font-weight:700}
.otip .k{color:var(--ink);font-weight:500}
.model{border:0;border-radius:var(--rk);padding:1.8mm 4mm 1.5mm;background:var(--tint)}
.model .cap{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:1.5mm;font-size:var(--t2);color:var(--sub)}
.model .cap b{color:var(--deep)}
.mk{font-family:var(--serif);font-size:var(--t4);line-height:1.25}
.tk{display:inline-block;position:relative;text-align:center;vertical-align:top;padding-top:12px;padding-bottom:11px;margin:0 2px}
.tk em{position:absolute;top:0;left:50%;transform:translateX(-50%);height:13px;line-height:13px;color:var(--deep);pointer-events:none}
.tk em svg{width:14px;height:11px;display:block;margin-top:1px}
.tk b{display:block;line-height:1.24;font-weight:400}
.tk i{position:absolute;bottom:0;left:50%;transform:translateX(-50%);font-style:normal;font-family:var(--sans);
 font-size:var(--t2);font-weight:700;line-height:1;white-space:nowrap;letter-spacing:.02em}
.tk.s b,.tk.s2 b{border-bottom:var(--ln) solid var(--S)}
.tk.s i,.tk.s2 i{color:var(--S)}
.tk.v b,.tk.v2 b{color:var(--deep);font-weight:700}
.tk.v i,.tk.v2 i{color:var(--deep)}
.tk.c b{border:var(--ln) solid var(--deep);border-radius:var(--rc);padding:0 4px;color:var(--deep);font-weight:700}
.tk.m b{border-bottom:var(--ln) solid color-mix(in srgb,var(--M) 70%,#fff)}
.tk.m i{color:var(--M)}
.model .ko{border-top:0.5pt solid rgba(0,0,0,.12);margin-top:.8mm;padding-top:1.2mm;font-size:var(--t3);color:var(--ink);line-height:var(--lhl)}
.model .ko b{color:var(--deep);font-weight:700;margin-right:2mm}
.rrh{font-size:var(--t4);font-weight:700;color:var(--deep);margin:1.6mm 0 1mm;display:flex;align-items:baseline;gap:3mm}
.rrh span{font-size:var(--t3);font-weight:400;color:var(--sub)}
.rrq{margin-bottom:.3mm}
.page:not(.te) .rrq{flex:1 0 auto;display:flex;flex-direction:column}
.page:not(.te) .rrq>*{flex:0 0 auto}
.page:not(.te) .rrq .aline{flex:1 0 6.5mm;height:auto}
.rrq .t{display:flex;gap:2.5mm;align-items:baseline;margin-bottom:.2mm}
.rrq .t .n{font-size:var(--t3);font-weight:500;color:var(--ac);min-width:6mm;font-family:var(--sans);line-height:var(--lhh)}
.rrq .t p{flex:1;font-family:var(--serif);font-size:var(--t4);line-height:1.2;color:var(--ink);letter-spacing:-.008em;word-spacing:-.04em;text-wrap:pretty}
.rrq .aline{margin-left:8.5mm}
/* ── 플로차트 ── */
table.flow{width:100%;border-collapse:collapse;font-size:var(--t4);border-bottom:var(--hl)}
table.flow th{text-align:left;padding:0 0 1.5mm;border-bottom:var(--ln) solid var(--ink)}
table.flow td{padding:3.2mm 0;vertical-align:middle;line-height:var(--lhl)}
table.flow td.body{border-bottom:var(--hl)}
table.flow tr:last-child td{border-bottom:0}
table.flow td.step{position:relative;width:30%;font-weight:700;color:var(--deep);font-size:var(--t3);padding-right:3mm;border-bottom:0}
table.flow td.step>div{display:flex;align-items:center;gap:2mm}
table.flow td.step .pi{flex:0 0 6mm;width:6mm;height:6mm;border-radius:50%;background:var(--tint);display:flex;align-items:center;justify-content:center}
table.flow td.step .pi svg{width:4.2mm;height:4.2mm;display:block}
table.flow tr:not(:last-child) td.step::after{content:"";position:absolute;left:calc(3mm - .625pt);top:calc(50% + 3.6mm);bottom:-1.4mm;border-left:1.25pt solid color-mix(in srgb,var(--ac) 70%,#fff)}
table.flow tr:not(:last-child) td.step::before{content:"";position:absolute;left:calc(3mm - 1.1mm);bottom:-3.2mm;width:0;height:0;
 border-left:1.1mm solid transparent;border-right:1.1mm solid transparent;border-top:2.2mm solid color-mix(in srgb,var(--ac) 70%,#fff)}
table.flow td.body u{text-decoration:none;display:inline-block;width:18mm;border-bottom:0.75pt solid var(--n400);color:transparent;vertical-align:baseline;line-height:1}
table.flow tr.given td.body{color:var(--ink)}
.bogi{border:var(--hl);border-radius:var(--rk);padding:2mm 4mm;font-size:var(--t3);margin-top:5mm;display:flex;gap:4mm;align-items:baseline;line-height:var(--lhl)}
.bogi b{white-space:nowrap;color:var(--ac);font-size:var(--t3);letter-spacing:.06em}
/* ── 패러프레이즈 ── */
table.para{width:100%;border-collapse:collapse;font-size:var(--t3);border-bottom:var(--hl);table-layout:fixed}
table.para th{text-align:left;padding:0 0 1.5mm;border-bottom:var(--ln) solid var(--ink)}
table.para td{padding:8.2mm 3mm 8.2mm 0;border-bottom:var(--hl);vertical-align:middle;line-height:var(--lhl);white-space:normal}
table.para tr:last-child td{border-bottom:0}
table.para td.src{width:48%;font-family:var(--serif);font-size:var(--t3);padding-right:1mm}
table.para td.dst{padding-right:0}
table.para td.src span{font-size:var(--t2);font-weight:500;color:var(--ac);font-family:var(--sans);margin-right:1.5mm}
table.para td.dst u{text-decoration:none;display:inline-block;width:14mm;border-bottom:0.75pt solid var(--n400);margin:0 .5mm;text-align:center;line-height:1}
/* ── Check Up ── */
.q{margin-bottom:4mm}
.q .stem{display:flex;gap:2.5mm;font-size:var(--t4);font-weight:700;line-height:var(--lhl);margin-bottom:2mm;align-items:baseline}
.q .stem .n{flex:0 0 5mm;height:5mm;border-radius:50%;background:var(--tint);color:var(--deep);font-size:var(--t2);font-weight:700;
 display:flex;align-items:center;justify-content:center;align-self:center}
.tkey{display:block;margin:0 0 2mm 7.5mm;font-size:var(--t2);color:var(--sub);
 line-height:var(--lhl);white-space:nowrap;letter-spacing:.02em}
.tkey i{display:block;font-style:normal;font-weight:500;color:var(--deep);margin-bottom:.5mm}
.tkey span{margin-right:3mm}
.tkey span b{color:var(--deep);font-weight:700;margin-right:1mm}
table.cu{width:100%;border-collapse:collapse;font-size:var(--t3);margin:0 0 0 7.5mm;width:calc(100% - 7.5mm);border-bottom:var(--hl)}
table.cu th{text-align:left;padding:0 0 1.2mm;border-bottom:var(--ln) solid var(--ink)}
table.cu td{padding:1.25mm 0;vertical-align:middle;line-height:var(--lhl);border-bottom:var(--hl)}
table.cu tr:last-child td{border-bottom:0}
table.cu td.op{padding-right:3mm}
table.cu td.op b{color:var(--ac);font-weight:500;margin-right:1.5mm}
table.cu th.ty,table.cu td.ty{width:11mm;text-align:center;padding-left:0;padding-right:0}
table.cu th.ty{color:var(--sub);font-weight:700;letter-spacing:.02em;text-transform:none}
table.cu td.ty i.o{display:inline-block;width:3.5mm;height:3.5mm;border:0.5pt solid var(--n400);border-radius:50%;vertical-align:middle}
table.cu th.evh,table.cu td.evc{width:12mm;text-align:right;padding-right:1mm}
table.cu td.evc i.ev{display:inline-block;width:10mm;border-bottom:0.75pt solid var(--n400);height:4.5mm;vertical-align:middle}
/* ── Knowledge Bank ── */
.kb{border-top:var(--rule) solid var(--ac);border-bottom:var(--hl);margin-top:auto}
.kb .hd{padding:2mm 0 1.8mm;display:flex;gap:3mm;align-items:baseline;border-bottom:var(--hl)}
.kb .hd b{font-size:var(--t6);font-weight:700;color:var(--deep);letter-spacing:-.02em}
.kb .hd em{font-style:normal;font-size:var(--t3);color:var(--sub)}
.kb .hd .tag{margin-left:auto;color:var(--ac)}
.kb .bd{padding:2mm 0 2mm}
.kb .row{display:flow-root}
.kb .bd .txt{flex:1;min-width:0}
.kb .it{display:block;position:relative;padding-left:7.5mm;margin-bottom:2mm}
.kb .it:last-of-type{margin-bottom:0}
.kb .it .num{position:absolute;left:0;top:.3mm;width:5mm;height:5mm;border-radius:50%;background:var(--tint);color:var(--deep);font-size:var(--t2);font-weight:700;
 display:flex;align-items:center;justify-content:center}
.kb .it h5{font-size:var(--t4);font-weight:700;color:var(--deep);margin-bottom:.5mm;line-height:var(--lhl)}
.kb .it p{font-size:var(--t3);line-height:1.5}
.kb .vig{float:right;width:50mm;margin:0 0 2mm 5mm;border:var(--hl);border-radius:var(--rk);padding:2.5mm 2.5mm 2mm;background:#fff}
.kb .vig svg{width:100%;display:block}
.kb .vig .cap{text-align:center;margin-top:1.5mm;color:var(--ac);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-transform:none;letter-spacing:.02em}
.kb .ask{clear:both;border-top:var(--hl);padding:2mm 0 0;font-size:var(--t3);font-weight:700;color:var(--deep);margin-top:2mm;display:flex;gap:3mm;line-height:var(--lhl)}
.kb .ask span{color:var(--ac);white-space:nowrap}
/* ── 해설 ── */
h2.sechd{font-size:var(--t7);font-weight:700;margin-bottom:1mm;letter-spacing:-.02em;line-height:var(--lhh)}
h2.sechd + p{font-size:var(--t3);color:var(--sub);margin-bottom:3.5mm}
/* 정답 면 5장(p26–30)은 같은 규격 — 긴 레슨(정답표 + 전문 해석이 첫 면의 제목 블록과 함께 한 면)이 하단 한계 안에 들도록
   행 패딩·행간에서 덜어 낸다(글자 크기는 그대로). 그래도 넘치는 면은 build.js 의 guard 가 .tight 를 붙인다 */
.akey{border-top:var(--rule) solid var(--ac);margin-bottom:3.5mm}
.akey .hd{padding:2mm 0 1.5mm;font-size:var(--t5);font-weight:700;color:var(--deep);display:flex;gap:2.5mm;align-items:baseline;border-bottom:var(--ln) solid var(--ink)}
.akey .hd .dot{display:inline-block;width:2.5mm;height:2.5mm;border-radius:50%;align-self:center}
.akey .hd em{font-style:normal;font-size:var(--t3);color:var(--sub);font-weight:400}
.akey table{width:100%;border-collapse:collapse;font-size:var(--t3)}
.akey td{padding:1.25mm 0;border-bottom:var(--hl);vertical-align:top;line-height:1.5}
.akey tr:last-child td{border-bottom:0}
.akey td.k{width:22mm;white-space:nowrap;padding-top:1.85mm}
.akey td.k span{display:block;text-transform:none;letter-spacing:0;font-size:var(--t1);color:var(--faint);margin-top:.3mm}
.akey .hl{color:var(--deep);font-weight:700}
.akey .dim{color:var(--sub)}
.akey .hint{font-size:var(--t2);color:var(--sub);line-height:1.5;letter-spacing:.01em}
.trans{border-top:var(--hl);border-bottom:var(--hl);padding:2.2mm 0 2.5mm;font-size:var(--t3);line-height:var(--lh);text-align:left}
.trans .eb{display:block;margin-bottom:1.5mm;color:var(--sub)}
.rh+.akey{border-top:0}
.trans sup{font-size:var(--t1);font-weight:700;color:var(--ac);vertical-align:super;line-height:0;margin-right:.3mm}
.page.tight .akey{margin-bottom:2.5mm}
.page.tight .akey .hd{padding:1.2mm 0 1mm}
.page.tight .akey td{padding:.9mm 0;line-height:1.45}
.page.tight .trans{padding:1.5mm 0;line-height:1.45}
.page.tight .trans .eb{margin-bottom:.3mm}
.page.tight .how{margin-top:2mm}
.page.tight .how .box h4{margin-bottom:1mm}
.page.tight .how .box{padding:2mm 4mm}
.page.tight .how .box::before{margin-top:-2mm;margin-bottom:2mm}
.page.tight ul.chk li{padding:0}
.how{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-top:4mm}
.how .box{border:var(--hl);border-radius:var(--rk);padding:3mm 4mm;overflow:hidden}
.how .box::before{content:"";display:block;height:var(--rule);background:var(--ac);margin:-3mm -4mm 2.5mm}
.how .box .n{margin-bottom:1.5mm;color:var(--ac)}
.how .box h4{font-size:var(--t4);font-weight:700;margin-bottom:1.5mm;line-height:var(--lhl)}
.how .box p{font-size:var(--t3);color:var(--sub);line-height:var(--lhl)}
ul.chk{list-style:none;font-size:var(--t3);color:var(--ink);line-height:var(--lhl)}
ul.chk li{display:flex;align-items:center;gap:2mm;padding:.6mm 0}
ul.chk li::before{content:"";display:inline-block;width:3.2mm;height:3.2mm;border:0.75pt solid var(--ink);border-radius:1px;flex:0 0 auto}
/* ── 교사용 정답 오버프린트: 붉은색 하나 · 500 · 8pt 이상 ── */
.ans{color:var(--red);font-weight:500}
.rh .bk i.te{font-style:normal;font-size:var(--t1);font-weight:500;letter-spacing:.14em;color:var(--red);
 border:0.5pt solid var(--red);border-radius:var(--rc);padding:.3mm 1.5mm;margin-left:2mm;vertical-align:.4mm}
.aline.filled{height:auto;min-height:8mm;display:flex;align-items:flex-end;padding:0 1mm .8mm;font-size:var(--t3);line-height:1.4}
.syn .aline.filled,.sline .aline.filled{min-height:6mm}
.rrq .aline.filled{min-height:6mm}
.rrq .mkans{margin:0 0 .3mm 8.5mm;font-size:var(--t2);line-height:1.4;color:var(--sub)}
.rrq .mkans .ans{color:var(--sub);font-weight:500}
.match .blank .ans{font-size:var(--t3);font-weight:700}
table.para td.dst u .ans{font-size:var(--t3);color:var(--red)}
table.para .ans{white-space:nowrap}   /* 붉은 정답은 하이픈(self-check)에서도 줄을 바꾸지 않는다 — 다섯 행 한 줄(wrap.py) */
table.flow .body u .ans{font-size:var(--t3);color:var(--red)}
table.flow .body u+.ans{margin-left:1mm}
table.cu td.ty i.o.ok{border:1pt solid var(--red);width:4mm;height:4mm}
table.cu td.evc i.ev .ans{font-size:var(--t3)}
table.cu td.evc i.ev{text-align:center;line-height:1.1}
/* 교사용 READ RIGHT: 모든 문장에 해석이 붙으므로 조인다 */
.page.te .rrq{margin-bottom:.4mm}
.page.te .rrq .t{margin-bottom:0}
.page.te .rrq .t p{line-height:1.25;font-size:var(--t3)}
.page.te .rrq .mkans{line-height:1.3;margin-bottom:.2mm}
.page.te .rrq .aline.filled{min-height:4.6mm;padding-bottom:.3mm;line-height:1.3}
.page.te .model{padding:2mm 4mm 1.5mm}
.page.te .rrh{margin:4mm 0 2mm}
/* ── 합본 차례: 12유닛 × (5강 + 정답과 해설) 을 두 단으로 한 면에 — 헤어라인 행 · 쪽 번호 오른끝 정렬 · 유닛 태그 줄 없음.
   푸터가 없는 면이라 아래 여백 18mm 까지 쓴다(본문 하한 279mm 는 다른 면과 같다). 긴 분야명(Unit 9·11)은 두 줄이 되어도 된다 */
.page.toc{padding-top:12mm;padding-bottom:18mm}
.page.toc .rh{margin-bottom:4mm}
.tochd{display:flex;align-items:baseline;gap:4mm;margin-bottom:2.5mm}
.tochd h2.sechd{margin:0}
.tocsub{font-size:var(--t3);color:var(--sub)}
.steps{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 2.5mm;margin-bottom:3.5mm;border-top:var(--hl);border-bottom:var(--hl);padding:1.5mm 0}
.steps b{font-size:var(--t2);font-weight:500;letter-spacing:.14em;color:var(--ac);margin-right:2mm;text-transform:uppercase}
.steps span{font-size:var(--t3);color:var(--sub)}
.steps span+span::before{content:"·";margin-right:2.5mm;color:var(--n400)}
.toc2{display:grid;grid-template-columns:1fr 1fr;column-gap:7mm;align-items:start}
.ub{break-inside:avoid;margin-bottom:1.6mm}
.uh{display:flex;align-items:baseline;gap:2mm;border-bottom:var(--ln) solid var(--ink);padding-bottom:.8mm;margin-bottom:.4mm;line-height:var(--lhh)}
.uh .f{font-size:var(--t1);font-weight:500;letter-spacing:.14em;color:var(--sub);text-transform:uppercase;white-space:nowrap}
.uh b{font-size:var(--t3);font-weight:700;color:var(--deep)}
.uh em{font-style:normal;font-size:var(--t1);color:var(--sub);white-space:nowrap}
.uh .pg{margin-left:auto;font-size:var(--t3);font-weight:700;color:var(--ink)}
.ub .tag{display:none}
table.ul{width:100%;border-collapse:collapse;font-size:var(--t2);line-height:1.2}
table.ul td{padding:.3mm 0;border-bottom:var(--hl);vertical-align:baseline}
table.ul td.n{width:5mm;font-size:var(--t1);font-weight:500;color:var(--sub)}
table.ul td.t{line-height:1.2}
table.ul td.t em{font-style:normal;font-size:var(--t1);color:var(--sub);margin-left:1.2mm}
table.ul td.p{width:6.5mm;text-align:right;font-size:var(--t2);font-weight:500;color:var(--sub)}
table.ul tr.ans td{border-bottom:0;padding-top:.5mm}
table.ul tr.ans td.n{color:var(--ac)}
table.ul tr.ans td.t{font-weight:700;color:var(--deep)}

/* ── 교사용: READ RIGHT 문장 위에 직접 표기 (15문장 × ≤12mm 행) ── */
.page.te .task{margin-bottom:1mm}
.page.te .oflow{padding:.8mm 3mm .8mm}
.page.te .otip{padding:.8mm 0 .9mm;margin-bottom:1mm}
.page.te .model{padding:1.2mm 4mm .8mm}
.page.te .model .cap{margin-bottom:.8mm}
.page.te .model .tk{padding-top:7px;padding-bottom:7px}
.page.te .model .ko{padding-top:.8mm;margin-top:.2mm}
.page.te .rrh{margin:1mm 0 .5mm;font-size:var(--t3)}
.page.te .rrq.marked{margin-bottom:.45mm}
.page.te .rrq.marked .t{align-items:flex-start;margin-bottom:0;padding-top:2px}
.page.te .rrq.marked .t .n{padding-top:9px}
.rrmk{font-size:8.2pt;line-height:1.18;flex:1}
.rrmk .tk{padding-top:8px;padding-bottom:8px;margin:0 2px}
.rrmk .tk em{top:-1px;height:10px;line-height:10px}
.rrmk .tk b{line-height:1.06}
.rrmk .tk i{font-size:6.8pt}
.rrmk .tk em svg{width:13px;height:10px;margin-top:0}
.rrmk .tk.c b{border-radius:3px;padding:0 3px}
.page.te .rrq.marked .aline.filled{margin-top:0;padding:1px 2px 1px;min-height:0;height:auto;line-height:1.06;font-size:8.3pt}
/* ── 교사용: Check Up 정답 선지 번호 ── */
td.op b.okc{color:var(--red);position:relative}
td.op b.okc::after{content:"";position:absolute;left:50%;top:50%;width:1.55em;height:1.55em;transform:translate(-50%,-50%);
 border:1.8px solid var(--red);border-radius:50%}
/* ── 한글 소형 라벨: 영문 아이브로우 트래킹(.14em)을 쓰지 않는다 — .02em · 700 ── */
table.para th,table.cu th,.model .cap b,.eb.ko,.bogi b{letter-spacing:.02em;font-weight:700;text-transform:none}
table.para th,table.cu th{color:var(--sub)}
`;
