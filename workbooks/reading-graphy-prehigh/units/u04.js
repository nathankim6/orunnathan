/* Unit 4 · Medicine & Health — 원문 Theme 16–20 */
const R = require("../src/orig/all.json");
const T = n => R[n - 1];

module.exports = {
 no: 4,
 field: "Medicine & Health",
 ko: "의학·건강",
 tagline: "몸을 다루는 지식 — 시계, 칼, 경계",
 next: { en: "Philosophy & Religion", ko: "믿음과 의심이 어떻게 답을 세워 왔는지 읽습니다", words: "238–265 words" },
 lessons: [

/* ───────────────────────────── 16 ───────────────────────────── */
{
 no: "16", key: "clock", accent: "#3D6FA0", tint: "#E5EDF6", deep: "#254768",
 en: "Managing Sleep Across Time Zones",
 ko: "시계는 한 번에, 몸은 천천히",
 goal: "시차증이 생기는 이유와 그 영향을 줄이는 방법을 순서대로 설명할 수 있다.",
 fig: "Figure 1  손목시계는 한 번에, 몸속 시계는 하루에 한 시간씩.",
 tip: "먼저 생각해 보자. 비행기에서 내리자마자 시계는 맞출 수 있는데, 왜 몸은 그러지 못할까?",
 sent: T(16).sent, kor: T(16).kor,
 bank: [
  ["line up with", "①", "~와 일치하다"],
  ["overwhelmingly", "②", "압도적으로"],
  ["disruption", "③", "교란"],
  ["readjust", "④", "재조정하다"],
  ["circadian", "⑥", "24시간 주기의"],
  ["appropriate", "⑪", "적절한"]
 ],
 defs: [
  ["line up with", "to match or agree with something else"],
  ["overwhelmingly", "in a way too strong to resist"],
  ["disruption", "a break in the normal flow of things"],
  ["readjust", "to set something to a new value again"],
  ["circadian", "following a cycle of about one day"],
  ["appropriate", "right for a particular time or purpose"]
 ],
 defOrder: [1, 3, 5, 0, 4, 2],
 flow: [
  ["The mismatch", "Your body clock does not match the local time", null],
  ["Before you fly", "Shift eating and sleeping times toward your (  ①  )", "destination"],
  ["On the way", "Change your watch and try (  ②  ) before and during travel", "fasting"],
  ["Going east", "Time zones run (  ③  ) of your body clock", "ahead"],
  ["On arrival", "Get plenty of (  ④  ) and sleep at the local hour", "daylight"]
 ],
 flowBogi: "destination · fasting · ahead · daylight · behind · darkness",
 para: [
  ["① doesn't line up with the time at your destination", "Your clock does not ______ the local time.", "match"],
  ["③ the more disruption to your body clock", "More zones crossed means more ______ inside.", "upset"],
  ["⑥ eating is a key zeitgeber", "Meals act as a strong time ______.", "signal"],
  ["⑦ at bedtime you are wide awake", "At night you feel completely ______.", "alert"],
  ["⑪ will help your body clock adapt", "Light and timing help the clock ______.", "adjust"]
 ],
 paraBogi: "match · upset · signal · alert · adjust · miss · calm · resist",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "Why Watches Are Easy to Reset",
    "Helping a Slow Clock Catch Up",
    "Flying West Is Always Harder",
    "How to Book a Cheap Flight",
    "A History of Time Zones"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "두 개 이상의 시간대를 넘어 여행하면 시차증을 겪을 수 있다.",
    "여행 일주일쯤 전부터 식사·수면 시간을 목적지 시간에 가깝게 옮기면 좋다.",
    "여행 직전과 여행 중의 단식이 생체 시계 재설정에 도움이 될 수 있다.",
    "서쪽으로 가는 여행이 동쪽으로 가는 여행보다 대개 적응하기 더 어렵다.",
    "목적지에서 햇빛을 충분히 쬐면 생체 시계가 적응하는 데 도움이 된다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 여행 전에 생체 시계를 미리 옮겨 두라고 권하는 이유를 우리말 한 문장으로 써 보세요.",
   ans: "생체 시계가 목적지의 시간과 어긋나 있으면 잠들기 어렵고 낮에 졸리는 등 문제가 생기므로, 미리 조금씩 옮겨 두면 그 영향을 줄일 수 있기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "③",
   toks: [
    ["You", "s"], ["may suffer", "v"], ["jet lag", null], ["if", "c"], ["you", "s2"], ["travel", "v2"],
    ["across two or more time zones", "m"],
    ["— the more you cross, the more disruption to your body clock —", "m"], ["but", "c"],
    ["there", null], ["are", "v"], ["steps you can take to minimize the effects.", null]
   ],
   ko: "두 개 이상의 시간대를 넘어 여행하면 시차증을 겪을 수 있는데, 더 많이 넘을수록 생체 시계가 더 흐트러진다. 하지만 그 영향을 줄일 방법이 있다."
  },
  drill: [
   {
    n: "④",
    en: "If possible in the week or so before traveling, start to readjust your body clock by gradually moving your times for eating and sleeping nearer to those at your destination.",
    ans: "M If possible in the week or so before traveling · △V start · O to readjust your body clock · M by gradually moving your times for eating and sleeping nearer to those at your destination",
    ko: "가능하다면 여행 일주일쯤 전부터, 식사와 수면 시간을 목적지 시간에 조금씩 가깝게 옮겨 생체 시계를 재조정하기 시작하라."
   },
   {
    n: "⑥",
    en: "Research has also shown that fasting just before and during travel can help to reset your clock, likely because eating is a key zeitgeber — an event that cues the timing of circadian rhythms such as sleeping and waking.",
    ans: "S Research · △V has also shown · [that] S′ fasting just before and during travel · △V′ can help · O to reset your clock · [because] S′ eating · △V′ is · C a key zeitgeber",
    ko: "연구는 여행 직전과 여행 중의 단식이 생체 시계를 재설정하는 데 도움이 될 수 있음을 보여 주었는데, 식사가 핵심 차이트게버이기 때문일 것이다."
   },
   {
    n: "⑨",
    en: "Traveling west, time zones are behind your body clock, so bedtime is later than your body expects.",
    ans: "M Traveling west · S time zones · △V are · C behind your body clock · [so] S bedtime · △V is · C later than your body expects",
    ko: "서쪽으로 여행하면 시간대가 생체 시계보다 뒤처져서, 취침 시간이 몸이 예상하는 것보다 늦어진다."
   }
  ]
 },
 syn: [
  {
   n: "③",
   name: "the 비교급 ~, the 비교급 …",
   q: "— «the more you cross, the more disruption» to your body clock —",
   d: "‘~할수록 더 …하다’를 나타낸다. 두 부분 앞에 각각 <b>the + 비교급</b>을 놓아 두 변화를 나란히 묶는다.",
   k: "더 많이 넘을수록 생체 시계가 더 흐트러진다"
  },
  {
   n: "⑥",
   name: "동격  명사 — 명사",
   q: "…likely because eating is «a key zeitgeber — an event that cues the timing» of circadian rhythms…",
   d: "대시(—) 뒤의 명사구가 앞 명사를 다시 풀어 설명한다. ‘즉, ~’로 읽으면 자연스럽다.",
   k: "핵심 차이트게버, 즉 시점을 알려 주는 사건"
  }
 ],
 synd: [
  { u: "구문 1", en: "The later you eat, the harder it is to fall asleep.", k: "늦게 먹을수록 잠들기가 더 어렵다." },
  { u: "구문 2", en: "She kept a diary — a record of every hour she slept.", k: "그녀는 일기, 즉 잠든 시간을 모두 적은 기록을 썼다." },
  { u: "구문 1 + 2", en: "The brighter the morning light — the body's strongest cue — the faster the clock shifts.", k: "몸의 가장 강한 신호인 아침 빛이 밝을수록 시계는 더 빨리 옮겨 간다." }
 ],
 why: [
  ["시계를 맞추는 대목만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 동쪽으로 갈 때가 대개 더 심하다고 말한다 — 정반대다"],
  ["항공권을 싸게 사는 방법은 글에 나오지 않는다"],
  ["시간대 제도의 역사는 글에서 다루지 않는다"]
 ],
 src: [["③"], ["④"], ["⑥"], ["⑦과 어긋남 — 동쪽으로 갈 때가 대개 더 심하다"], ["⑪"]],
 kb: {
  title: "몸속 시계는 어디에 있나",
  lead: "하루를 재는 기관이 따로 있다",
  items: [
   ["시교차상핵", "생체 시계의 중심은 뇌 시상하부의 시교차상핵(SCN)이다. 눈에서 오는 빛 신호를 직접 받아 하루의 위상을 맞춘다. 세포 하나하나도 시계를 갖지만, SCN이 이들을 한 박자로 묶는다."],
   ["차이트게버", "독일어로 ‘시간을 주는 것’이라는 뜻이다. 빛이 가장 강력하고 식사·운동·사회적 일정도 신호가 된다. 신호가 전혀 없으면 인간의 하루 주기는 24시간보다 조금 길어진다."],
   ["2017년 노벨 생리·의학상", "Jeffrey C. Hall, Michael Rosbash, Michael W. Young은 초파리에서 하루 주기를 만드는 유전자와, 그 단백질이 하루 동안 늘었다 줄었다 하는 되먹임 고리를 밝혀 2017년 노벨 생리·의학상을 받았다."]
  ],
  ask: "여러분의 하루에서 몸에 시간을 알려 주는 신호는 무엇인가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 17 ───────────────────────────── */
{
 no: "17", key: "surgery", accent: "#B04A4A", tint: "#F9E7E7", deep: "#7C2727",
 en: "William Halsted and Modern Surgery",
 ko: "빠른 손 대신 조심스러운 손",
 goal: "Halsted의 이력과 그가 남긴 수술 원칙을 순서대로 정리해 설명할 수 있다.",
 fig: "Figure 1  속도를 버리고 얻은 것 — 그리고 오래 가르치는 제도.",
 tip: "먼저 생각해 보자. 옛 수술실에서 가장 자랑스러운 기술은 ‘빠른 손’이었다. 왜 그랬을까?",
 sent: T(17).sent, kor: T(17).kor,
 bank: [
  ["noninvasive", "①", "비침습적인"],
  ["absorb", "④", "받아들이다"],
  ["proponent", "⑥", "지지자, 제안자"],
  ["addicted", "⑦", "중독된"],
  ["pathology", "⑧", "병리학"],
  ["hygienic", "⑪", "위생적인"]
 ],
 defs: [
  ["noninvasive", "not cutting into the body very much"],
  ["absorb", "to take in ideas and make them yours"],
  ["proponent", "a person who argues for an idea"],
  ["addicted", "unable to stop using a drug"],
  ["pathology", "the study of the causes of disease"],
  ["hygienic", "clean enough to keep disease away"]
 ],
 defOrder: [4, 0, 3, 5, 2, 1],
 flow: [
  ["Who", "Halsted shaped the surgery we know today", null],
  ["Rise", "He toured (  ①  ) and returned to Bellevue Hospital", "Europe"],
  ["Fall", "Self-testing left him (  ②  ) to cocaine for two years", "addicted"],
  ["Recovery", "At Johns Hopkins he became (  ③  ) surgeon in 1890", "chief"],
  ["Legacy", "He taught hygiene, small stitches, and (  ④  ) hands", "gentle"]
 ],
 flowBogi: "Europe · addicted · chief · gentle · Asia · rough",
 para: [
  ["① as noninvasive as possible", "Surgery now cuts as ______ as it can.", "little"],
  ["④ absorbing new ideas about surgical practices", "He took in new ways of ______.", "operating"],
  ["⑦ several of his colleagues died", "Some of the doctors with him ______.", "died"],
  ["⑧ where he could work without having contact", "There he worked away from ______.", "patients"],
  ["⑫ influenced a generation of American doctors", "A whole ______ of doctors learned from him.", "generation"]
 ],
 paraBogi: "little · operating · died · patients · generation · much · resting · few",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Cocaine Was Used as a Painkiller",
    "The Surgeon Who Slowed Surgery Down",
    "Why Halsted Left Medicine for Good",
    "A Guide to Choosing a Medical School",
    "The Founding of Columbia University"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "Halsted는 뉴욕의 부유한 가정에서 태어나 컬럼비아 의과대학에서 학위를 받았다.",
    "그는 코카인을 진통제로 쓰자고 앞장선 사람 가운데 하나였다.",
    "그 약물 실험 중 다수는 자신과 다른 의사들을 대상으로 이루어졌다.",
    "그는 1886년 뉴욕을 떠난 뒤 다시는 수술을 맡지 못했다.",
    "그는 위생적인 수술 환경과 조직을 부드럽게 다루는 것을 강조했다."
   ], ans: 4
  },
  {
   t: "write", q: "Halsted의 권고가 한 세대의 미국 의사들에게 퍼질 수 있었던 경로를 우리말 한 문장으로 써 보세요.",
   ans: "존스 홉킨스에서 그에게 훈련받은 의사들이 그의 발상을 의학 공동체 전반으로 퍼뜨렸다."
  }
 ],
 fl: {
  model: {
   n: "⑨",
   toks: [
    ["Settling in Baltimore,", "m"], ["Halsted", "s"], ["beat", "v"], ["his cocaine addiction", null],
    ["and", "c"], ["revived", "v"], ["his career", null],
    ["at the newly formed Johns Hopkins University,", "m"], ["where", "c"], ["he", "s2"], ["became", "v2"],
    ["chief surgeon in 1890.", null]
   ],
   ko: "볼티모어에 정착한 Halsted는 코카인 중독을 이겨 내고 새로 만들어진 존스 홉킨스 대학에서 경력을 되살렸으며, 그곳에서 1890년 수석 외과 의사가 되었다."
  },
  drill: [
   {
    n: "③",
    en: "A giant in the history of American science, Halsted was born in New York City to a wealthy family and earned a medical degree from Columbia University College of Physicians and Surgeons.",
    ans: "M A giant in the history of American science · S Halsted · △V was born · M in New York City to a wealthy family · and △V earned · O a medical degree from Columbia University College of Physicians and Surgeons",
    ko: "미국 과학사의 거장인 Halsted는 뉴욕시의 부유한 가정에서 태어나 컬럼비아 의과대학에서 의학 학위를 받았다."
   },
   {
    n: "⑦",
    en: "Many of his experiments with the drug were conducted on himself and other doctors; as a result, Halsted became addicted to the drug for 2 years, and several of his colleagues died.",
    ans: "S Many of his experiments with the drug · △V were conducted · M on himself and other doctors · M as a result · S Halsted · △V became · C addicted to the drug for 2 years · and S several of his colleagues · △V died",
    ko: "그 약물 실험 중 다수가 자신과 다른 의사들을 대상으로 이루어졌고, 그 결과 Halsted는 2년간 중독되었으며 동료 몇 명은 사망했다."
   },
   {
    n: "⑪",
    en: "Halsted emphasized keeping a hygienic operating environment, using small stitches and high-quality sutures, and handling body tissues as gently as possible.",
    ans: "S Halsted · △V emphasized · O keeping a hygienic operating environment, using small stitches and high-quality sutures, and handling body tissues as gently as possible",
    ko: "Halsted는 위생적인 수술 환경을 유지하고, 작은 봉합과 좋은 봉합사를 쓰며, 조직을 최대한 부드럽게 다룰 것을 강조했다."
   }
  ]
 },
 syn: [
  {
   n: "③",
   name: "문두의 동격 명사구",
   q: "«A giant in the history of American science,» Halsted was born in New York City to a wealthy family…",
   d: "주어 앞에 놓인 명사구가 주어를 다시 설명한다. 콤마로 본체와 나뉘며 ‘~인 그는’으로 읽는다.",
   k: "미국 과학사의 거장인 Halsted는"
  },
  {
   n: "⑧",
   name: "계속적 용법의 관계부사 where",
   q: "…the recently opened Johns Hopkins Hospital in Baltimore, «where he could work without having contact with patients».",
   d: "장소를 받아 뒤에서 설명을 덧붙인다. ‘그리고 그곳에서 ~’로 이어 읽는다.",
   k: "그리고 그곳에서 그는 환자와 접촉하지 않고 일할 수 있었다"
  }
 ],
 synd: [
  { u: "구문 1", en: "A careful teacher, she checked every stitch twice.", k: "꼼꼼한 교사인 그녀는 모든 봉합을 두 번씩 확인했다." },
  { u: "구문 2", en: "He moved to a small clinic, where no one knew his past.", k: "그는 작은 병원으로 옮겼고, 그곳에서는 아무도 그의 과거를 몰랐다." },
  { u: "구문 1 + 2", en: "A quiet man, he settled in Baltimore, where he began again.", k: "조용한 사람이었던 그는 볼티모어에 정착했고, 그곳에서 다시 시작했다." }
 ],
 why: [
  ["문장 ⑥의 한 대목만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 그가 볼티모어에서 경력을 되살렸다고 말한다 — 정반대다"],
  ["의대를 고르는 방법은 글에 나오지 않는다"],
  ["대학 설립의 역사는 글에서 다루지 않는다"]
 ],
 src: [["③"], ["⑥"], ["⑦"], ["⑨와 어긋남 — 1890년 존스 홉킨스의 수석 외과 의사가 되었다"], ["⑪"]],
 kb: {
  title: "수술실이 조용해지기까지",
  lead: "빠른 손이 최고이던 시절은 왜 끝났나",
  items: [
   ["마취 이전의 속도", "1846년 에테르 마취가 공개되기 전에는 통증 때문에 수술이 몇 분 안에 끝나야 했다. 절단을 몇십 초에 해내는 외과의가 이름을 날렸다. 마취가 들어오면서 비로소 천천히 정확하게 하는 수술이 가능해졌다."],
   ["고무장갑의 시작", "Halsted는 1890년 무렵 수술실 소독약에 손이 상하던 간호사 Caroline Hampton을 위해 고무장갑을 주문했다. 감염을 막으려 만든 것이 아니었지만, 곧 무균 수술의 표준 장비가 되었다."],
   ["레지던트 제도", "존스 홉킨스에서 Halsted가 세운 것은 기술만이 아니었다. 여러 해에 걸쳐 단계적으로 책임을 늘려 가며 가르치는 수련 제도를 만들었고, 이것이 오늘날 전공의 제도의 뿌리가 되었다."]
  ],
  ask: "빨리 해내는 것과 정확히 해내는 것 사이에서, 여러분은 무엇을 기준으로 고르는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 18 ───────────────────────────── */
{
 no: "18", key: "virus", accent: "#4A7C46", tint: "#E7F1E5", deep: "#2E5429",
 en: "Viruses",
 ko: "설계도만 들고 오는 손님",
 goal: "바이러스의 구조와 증식 과정을 순서대로 설명하고, 세균과 다른 점을 말할 수 있다.",
 fig: "Figure 1  껍질과 설명서, 그리고 빌려 쓰는 공장.",
 tip: "먼저 생각해 보자. ‘살아 있다’는 말의 조건을 세 가지만 적어 본다면 무엇을 쓰겠는가?",
 sent: T(18).sent, kor: T(18).kor,
 bank: [
  ["infectious", "②", "감염성의"],
  ["metabolic", "③", "대사의"],
  ["multiply", "⑥", "증식하다"],
  ["inactive", "⑥", "비활성의"],
  ["synthesis", "⑩", "합성"],
  ["stimulate", "⑯", "자극하다"]
 ],
 defs: [
  ["infectious", "able to pass disease from one to another"],
  ["metabolic", "about the chemical work inside a body"],
  ["multiply", "to grow in number very quickly"],
  ["inactive", "not doing anything for the time being"],
  ["synthesis", "the making of a substance from parts"],
  ["stimulate", "to make a system start working harder"]
 ],
 defOrder: [5, 1, 4, 0, 3, 2],
 flow: [
  ["What they are", "Viruses cannot live on their own", null],
  ["What they do", "They take over other cells to (  ①  )", "reproduce"],
  ["What they carry", "Nucleic acid inside a (  ②  ) shell", "protein"],
  ["How they enter", "Like a needle they inject their (  ③  ) material", "genetic"],
  ["Why they are hard", "Stuck in cells, they resist (  ④  ) more than bacteria", "killing"]
 ],
 flowBogi: "reproduce · protein · genetic · killing · sleep · sugar",
 para: [
  ["② unable to live on their own", "They cannot survive ______ a host.", "without"],
  ["⑥ can remain inactive in the body for years", "Some stay ______ inside us for years.", "asleep"],
  ["⑩ they lack enzymes for energy production", "They have ______ way to make energy.", "no"],
  ["⑫ takes over the cellular machinery", "It seizes the cell's own ______.", "tools"],
  ["⑯ stimulating the immune system", "Vaccines wake up the body's ______.", "defences"]
 ],
 paraBogi: "without · asleep · no · tools · defences · with · awake · every",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "Where the Word 'Virus' Comes From",
    "A Borrowed Factory and a Set of Plans",
    "Why Viruses Are Easier to Kill Than Bacteria",
    "How to Wash Your Hands Properly",
    "The Discovery of Penicillin"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "바이러스는 식물도 동물도 세균도 아니며 스스로 살 수 없다.",
    "바이러스라는 이름은 ‘독’과 ‘점액’을 뜻하는 라틴어에서 왔다.",
    "AIDS를 일으키는 것처럼 세포 안에서 수년에 걸쳐 천천히 번식하는 것도 있다.",
    "바이러스는 에너지 생산을 위한 효소를 갖추고 있어 숙주 없이 증식한다.",
    "백신은 특정 바이러스를 겨냥하는 백혈구를 만들도록 면역 체계를 자극한다."
   ], ans: 4
  },
  {
   t: "write", q: "바이러스가 세균보다 죽이기 어려운 까닭을 우리말 한 문장으로 써 보세요.",
   ans: "바이러스가 숙주 세포 안에 갇혀 있어서, 세포를 건드리지 않고 바이러스만 없애기가 어렵기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "⑥",
   toks: [
    ["Some of them,", "s"], ["such as those that cause the common cold and flu,", "m"],
    ["multiply", "v"], ["rapidly", "m"], ["and", "c"], ["kill", "v"], ["the host cell,", null],
    ["while", "c"], ["others,", "s2"], ["such as the genital herpes virus,", "m"],
    ["can remain", "v2"], ["inactive in the body for years.", null]
   ],
   ko: "감기와 독감을 일으키는 것들처럼 어떤 바이러스는 빠르게 증식해 숙주 세포를 죽이는 반면, 생식기 헤르페스 바이러스 같은 다른 것들은 몸속에서 수년간 비활성 상태로 남을 수 있다."
  },
  drill: [
   {
    n: "③",
    en: "Instead, they take over other cells to help them reproduce and carry out metabolic activities.",
    ans: "M Instead · S they · △V take over · O other cells · M to help them reproduce and carry out metabolic activities",
    ko: "대신 그것들은 다른 세포를 장악해 자신이 번식하고 대사 활동을 하도록 돕게 만든다."
   },
   {
    n: "⑩",
    en: "Because they lack enzymes for energy production and ribosomes for protein synthesis and reproduction, viruses attach to a host cell.",
    ans: "[Because] S′ they · △V′ lack · O enzymes for energy production and ribosomes for protein synthesis and reproduction · S viruses · △V attach · M to a host cell",
    ko: "에너지 생산을 위한 효소와 단백질 합성·번식을 위한 리보솜이 없기 때문에, 바이러스는 숙주 세포에 달라붙는다."
   },
   {
    n: "⑯",
    en: "Some antiviral medications attack viruses, while vaccines are also effective in stimulating the immune system to produce white blood cells that target specific viruses.",
    ans: "S Some antiviral medications · △V attack · O viruses · [while] S′ vaccines · △V′ are · C also effective in stimulating the immune system to produce white blood cells that target specific viruses",
    ko: "일부 항바이러스제는 바이러스를 공격하고, 백신은 특정 바이러스를 겨냥하는 백혈구를 만들도록 면역 체계를 자극하는 데도 효과가 있다."
   }
  ]
 },
 syn: [
  {
   n: "②",
   name: "Being 이 생략된 분사구문",
   q: "«Not a plant, animal, or bacterium,» these infectious agents are unable to live on their own.",
   d: "앞에 <b>Being</b>이 생략된 분사구문이다. Being 을 넣어 읽으면 뜻이 분명해진다. ‘~이 아니어서’로 옮긴다.",
   k: "식물도 동물도 세균도 아니어서"
  },
  {
   n: "⑦",
   name: "분사구문  meaning that ~",
   q: "Still others … are slow viruses, «meaning that they remain in the cells» and reproduce slowly over years.",
   d: "앞의 내용을 받아 ‘즉 ~라는 뜻이다’를 덧붙인다. <b>which means that</b>과 같은 구실을 한다.",
   k: "즉 그것들이 세포 안에 남는다는 뜻이다"
  }
 ],
 synd: [
  { u: "구문 1", en: "Not fully alive, a virus waits for a cell to open.", k: "완전히 살아 있지는 않아서, 바이러스는 세포가 열리기를 기다린다." },
  { u: "구문 2", en: "The test was negative, meaning that no virus was found.", k: "검사는 음성이었는데, 즉 바이러스가 발견되지 않았다는 뜻이다." },
  { u: "구문 1 + 2", en: "Not a cell itself, the particle carries only a plan, meaning that it must borrow a factory.", k: "그 입자는 세포 자체가 아니어서 설계도만 지니는데, 즉 공장을 빌려야 한다는 뜻이다." }
 ],
 why: [
  ["문장 ④의 어원 대목만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 바이러스가 세균보다 죽이기 훨씬 어렵다고 말한다 — 정반대다"],
  ["손 씻는 방법은 글에 나오지 않는다"],
  ["페니실린의 발견은 글에서 다루지 않는다"]
 ],
 src: [["②"], ["④"], ["⑦"], ["⑩과 어긋남 — 효소와 리보솜이 없어 숙주 세포에 달라붙는다"], ["⑯"]],
 kb: {
  title: "살아 있다고 해야 할까",
  lead: "생물과 무생물 사이에 놓인 것",
  items: [
   ["담배모자이크바이러스", "1892년 러시아의 Dmitry Ivanovsky는 담배 잎의 병원체가 세균을 걸러 내는 필터를 통과한다는 것을 확인했다. 1898년 네덜란드의 Martinus Beijerinck는 이것을 세균이 아닌 새로운 것으로 보고 ‘바이러스’라 불렀다."],
   ["스무 면의 껍질", "많은 바이러스의 껍질은 정이십면체 모양이다. 같은 단백질 조각을 반복해 쌓아 올리는 방식이라, 유전 정보를 적게 쓰고도 튼튼한 상자를 만들 수 있다."],
   ["항생제가 듣지 않는 이유", "항생제는 세포벽이나 리보솜처럼 세균에만 있는 표적을 공격한다. 바이러스는 그런 구조를 갖지 않고 숙주 세포의 기계를 빌려 쓰므로, 항생제는 감기와 독감에 듣지 않는다."]
  ],
  ask: "여러분이라면 바이러스를 생물이라고 부르겠는가? 그 판단의 근거는 무엇인가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 19 ───────────────────────────── */
{
 no: "19", key: "wall", accent: "#8B5AA6", tint: "#F1EAF6", deep: "#59326F",
 en: "Preventing Infectious Diseases",
 ko: "막아 낸 일은 기록에 남지 않는다",
 goal: "필자가 감염병을 피하는 전략으로 무엇을 제시하는지 근거와 함께 설명할 수 있다.",
 fig: "Figure 1  일어나지 않은 일은 그래프에 남지 않는다.",
 tip: "먼저 생각해 보자. 아무 일도 일어나지 않은 하루를 어떻게 성과라고 부를 수 있을까?",
 sent: T(19).sent, kor: T(19).kor,
 bank: [
  ["pathogenic", "①", "병원성의"],
  ["redeeming", "②", "결점을 상쇄하는"],
  ["intervention", "③", "개입, 중재"],
  ["repel", "④", "물리치다"],
  ["penetrate", "⑤", "침투하다"],
  ["vulnerable", "⑦", "취약한"]
 ],
 defs: [
  ["pathogenic", "able to cause disease in a living body"],
  ["redeeming", "making up for something bad"],
  ["intervention", "a step taken to change what happens"],
  ["repel", "to drive something back or away"],
  ["penetrate", "to get inside something by force"],
  ["vulnerable", "easily hurt or attacked"]
 ],
 defOrder: [3, 0, 5, 2, 4, 1],
 flow: [
  ["The danger", "Some bacteria can cause disease in a host", null],
  ["The rescue", "Science treats emergencies such as a (  ①  ) nail", "rusty"],
  ["The condition", "Germs harm us only when they can (  ②  ) our cells", "penetrate"],
  ["What lowers it", "Accidents, poor food, fatigue, and (  ③  )", "stress"],
  ["The strategy", "Not killing all bacteria, but keeping cells (  ④  )", "healthy"]
 ],
 flowBogi: "rusty · penetrate · stress · healthy · clean · sleep",
 para: [
  ["② difficult to see any redeeming qualities", "It is hard to find anything ______ in them.", "good"],
  ["④ if we inadvertently tangle with them", "Even if we meet them by ______.", "accident"],
  ["⑥ unless vitality and resistance are weakened", "Germs win only when the body grows ______.", "weak"],
  ["⑨ disrupts the normal function of the body", "It breaks how the body normally ______.", "works"],
  ["⑪ keep your vitality at its peak", "Hold your energy at its ______ point.", "highest"]
 ],
 paraBogi: "good · accident · weak · works · highest · bad · purpose · lowest",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "What a Rusty Nail Can Do to You",
    "Guard the Cell, Not the World",
    "Kill Every Germ to Stay Healthy",
    "How Vaccines Are Manufactured",
    "A History of Food Preservation"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "파상풍균과 보툴리누스균은 숙주에게 질병을 일으킬 수 있는 병원성 세균이다.",
    "세균은 유기체의 세포에 침투하지 못하면 건강에 영향을 미치지 않는다.",
    "사고, 영양 부족, 극도의 피로, 강한 스트레스는 모두 저항력을 떨어뜨린다.",
    "감염병을 피하는 전략은 모든 세균을 없애 버리는 것이다.",
    "건강과 활력, 질병에 대한 저항력은 세포의 건강에 의해 결정된다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 감염병을 피하는 ‘가장 좋은 방법’으로 제시한 것을 우리말 한 문장으로 써 보세요.",
   ans: "세포가 충분히 건강해서 활력을 최고 수준으로 유지하도록 하는 것이다."
  }
 ],
 fl: {
  model: {
   n: "④",
   toks: [
    ["Our best bet", "s"], ["is", "v"],
    ["to avoid being exposed to such mischief makers and to make sure", null],
    ["we", "s2"], ["eat", "v2"], ["correctly", "m"], ["so that", "c"],
    ["our vitality and resistance", "s2"], ["are", "v2"], ["high enough to repel their effects", null],
    ["if", "c"], ["we", "s2"], ["inadvertently tangle", "v2"], ["with them.", "m"]
   ],
   ko: "가장 좋은 방책은 그런 해악을 끼치는 것들에 노출되지 않고, 부주의하게 얽히더라도 그 영향을 물리칠 만큼 활력과 저항력이 높도록 바르게 먹는 것이다."
  },
  drill: [
   {
    n: "⑤",
    en: "Germs don't affect health unless they are able to penetrate the cells of an organism — to really get into the working parts.",
    ans: "S Germs · △V don't affect · O health · [unless] S′ they · △V′ are · C able to penetrate the cells of an organism",
    ko: "세균은 유기체의 세포에 침투해 실제로 작동하는 부분까지 들어갈 수 없다면 건강에 영향을 주지 않는다."
   },
   {
    n: "⑨",
    en: "Short-term, high-intensity events of an accident, or longer-term, non-stop abuse of a destructive lifestyle disrupts the normal function of the body as a whole, as well as the cells that make up that whole.",
    ans: "S Short-term, high-intensity events of an accident, or longer-term, non-stop abuse of a destructive lifestyle · △V disrupts · O the normal function of the body as a whole, as well as the cells that make up that whole",
    ko: "사고라는 단기·고강도 사건이나, 파괴적인 생활 방식의 장기적이고 끊임없는 남용은 몸 전체의 정상 기능은 물론 그 전체를 이루는 세포의 기능까지 무너뜨린다."
   },
   {
    n: "⑪",
    en: "The best course is to make sure your cells are healthy enough to keep your vitality at its peak.",
    ans: "S The best course · △V is · C to make sure · [that] S′ your cells · △V′ are · C healthy enough to keep your vitality at its peak",
    ko: "가장 좋은 방법은 세포가 활력을 최고로 유지할 만큼 건강하도록 확실히 하는 것이다."
   }
  ]
 },
 syn: [
  {
   n: "⑤",
   name: "접속사 unless",
   q: "Germs don't affect health «unless they are able to penetrate» the cells of an organism.",
   d: "<b>unless</b>는 ‘~하지 않는 한’이라는 뜻으로 <b>if ~ not</b>과 같다. 뒤에 부정을 다시 붙이지 않는다.",
   k: "그것들이 침투할 수 없다면"
  },
  {
   n: "④",
   name: "형용사 + enough to ~",
   q: "…so that our vitality and resistance «are high enough to repel their effects»…",
   d: "<b>enough</b>는 형용사·부사 <b>뒤</b>에 온다. ‘~할 만큼 충분히 …한’으로 읽는다.",
   k: "그 영향을 물리칠 만큼 충분히 높은"
  }
 ],
 synd: [
  { u: "구문 1", en: "The wound will not heal unless you keep it clean.", k: "상처는 깨끗하게 두지 않는 한 낫지 않을 것이다." },
  { u: "구문 2", en: "Her cells were strong enough to fight the infection.", k: "그녀의 세포는 그 감염과 싸울 만큼 충분히 강했다." },
  { u: "구문 1 + 2", en: "You will not fall ill unless your body is weak enough to let germs in.", k: "몸이 세균을 들일 만큼 약해지지 않는 한 여러분은 병들지 않을 것이다." }
 ],
 why: [
  ["문장 ③의 예시만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 모든 세균을 없애는 것이 전략이 아니라고 말한다 — 정반대다"],
  ["백신 제조 과정은 글에 나오지 않는다"],
  ["식품 보존의 역사는 글에서 다루지 않는다"]
 ],
 src: [["①"], ["⑤"], ["⑧"], ["⑩과 어긋남 — 모든 세균을 없애는 것이 전략이 아니다"], ["⑭"]],
 kb: {
  title: "일어나지 않은 일의 값",
  lead: "예방은 왜 늘 과소평가되는가",
  items: [
   ["브로드가의 손잡이", "1854년 런던 소호에서 콜레라가 번지자 John Snow는 사망자를 지도에 찍어 브로드가 펌프 주변에 몰려 있음을 보였다. 펌프 손잡이를 떼어 낸 뒤 유행이 잦아들었지만, 막아 낸 사망자 수는 어디에도 남지 않았다."],
   ["예방의 역설", "Geoffrey Rose는 인구 전체에 큰 이익을 주는 예방 조치가 개인에게는 거의 아무 이익도 주지 않는 것처럼 보인다고 지적했다. 개인은 자신이 무엇을 피했는지 알 수 없다."],
   ["파상풍이라는 이름", "tetanus 는 ‘팽팽하게 당기다’라는 그리스어에서 왔다. 근육이 굳어 턱이 벌어지지 않는 증상 때문에 lockjaw 라고도 불린다. 흙 속에 흔한 균이어서 녹슨 못을 밟는 상황이 예로 자주 나온다."]
  ],
  ask: "여러분이 지난달에 ‘아무 일도 없이’ 지나간 것 가운데, 사실은 무언가를 막아 낸 것이 있을까?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 20 ───────────────────────────── */
{
 no: "20", key: "burnout", accent: "#C0803A", tint: "#FAF0E1", deep: "#8A551A",
 en: "Medical Education and Practitioner Well-Being",
 ko: "가르치는 쪽도 지치고 있다",
 goal: "의학 교육과 진료 현장에서 스트레스가 커진 배경과, 아직 확인하지 못한 것을 구분해 설명할 수 있다.",
 fig: "Figure 1  당직표 위에 겹쳐 놓은 실수 곡선.",
 tip: "먼저 생각해 보자. 30시간을 깨어 있은 사람에게 중요한 결정을 맡겨도 될까?",
 sent: T(20).sent, kor: T(20).kor,
 bank: [
  ["evolve", "②", "진화하다"],
  ["practitioner", "②", "실무자, 의료인"],
  ["burnout", "④", "소진"],
  ["distress", "④", "고통"],
  ["mirror", "⑤", "반영하다"],
  ["extrapolate", "⑩", "미루어 추정하다"]
 ],
 defs: [
  ["evolve", "to change slowly into a better form"],
  ["practitioner", "a person who works in a profession"],
  ["burnout", "the state of being worn out by work"],
  ["distress", "great pain or worry of the mind"],
  ["mirror", "to show the same pattern as something"],
  ["extrapolate", "to guess beyond what is known"]
 ],
 defOrder: [2, 5, 0, 4, 1, 3],
 flow: [
  ["The belief", "Medical education has changed in two or three decades", null],
  ["Why it must", "Education has to (  ①  ) with the healthcare it serves", "evolve"],
  ["What we know", "Burnout and distress run high among (  ②  ) everywhere", "students"],
  ["What drives it", "Complexity, social change, and higher patient (  ③  )", "expectations"],
  ["What we don't know", "Whether it is (  ④  ) — old data are missing", "worsening"]
 ],
 flowBogi: "evolve · students · expectations · worsening · shrinking · money",
 para: [
  ["① has fundamentally changed", "Its nature has changed at the ______.", "root"],
  ["② to function safely and effectively", "So that they can work safely and ______.", "well"],
  ["④ substance misuse are very high", "Drug misuse runs ______ among students.", "high"],
  ["⑧ historical comparisons are generally not possible", "We cannot compare it with the ______.", "past"],
  ["⑩ It seems reasonable to extrapolate", "It is fair to ______ the same for students.", "expect"]
 ],
 paraBogi: "root · well · high · past · expect · surface · badly · future",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Patient Expectations Have Risen",
    "A Changed Training for a Changed Job",
    "Medical Students Are Under Less Strain Than Before",
    "How to Apply to Medical School",
    "The History of the Hospital"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "필자는 지난 20~30년 사이 의학 교육의 성격이 근본적으로 바뀌었다고 본다.",
    "의대생의 소진·정서적 고통·약물 남용 수준은 세계 어디서나 매우 높다.",
    "이 상황은 여러 의료 체계에서 일하는 여러 직급 의사들의 상황을 반영한다.",
    "의대생의 고통과 소진을 재려는 시도는 오래전부터 충분히 이루어져 왔다.",
    "현직 의사를 대상으로 한 연구는 시간이 지나며 상황이 나빠지고 있음을 시사한다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 ‘크게 알 수 없는 것’이라고 말한 부분이 무엇인지 우리말 한 문장으로 써 보세요.",
   ans: "지금의 소진과 고통이 어느 정도까지 점점 커지고 있는 현상인지를 알 수 없다는 것이다."
  }
 ],
 fl: {
  model: {
   n: "②",
   toks: [
    ["It", "s"], ["would be", "v"], ["odd", null], ["if", "c"], ["that", "s2"], ["were not", "v2"],
    ["the case,", null], ["as", "c"], ["education", "s2"], ["needs", "v2"], ["to evolve", null],
    ["to provide the skills needed by practitioners to function safely and effectively in a changing healthcare environment.", "m"]
   ],
   ko: "그렇지 않다면 이상할 텐데, 교육은 변화하는 의료 환경에서 의료인이 안전하고 효과적으로 일하는 데 필요한 기술을 제공하도록 진화해야 하기 때문이다."
  },
  drill: [
   {
    n: "④",
    en: "What we do know unfortunately is that levels of burnout, emotional distress, and substance misuse are very high amongst medical students wherever one goes in the world.",
    ans: "S What we do know · M unfortunately · △V is · [that] S′ levels of burnout, emotional distress, and substance misuse · △V′ are · C very high · M amongst medical students wherever one goes in the world",
    ko: "안타깝게도 우리가 분명히 아는 것은, 세계 어디를 가든 의대생 사이에서 소진·정서적 고통·약물 남용 수준이 매우 높다는 사실이다."
   },
   {
    n: "⑥",
    en: "Training for and practising medicine have always been stressful, but increased complexity in investigations, interventions, and management, along with societal changes and higher patient expectations has contributed to increasing levels of stress and distress.",
    ans: "S Training for and practising medicine · △V have always been · C stressful · [but] S increased complexity in investigations, interventions, and management · M along with societal changes and higher patient expectations · △V has contributed · M to increasing levels of stress and distress",
    ko: "의학을 배우고 진료하는 일은 늘 스트레스가 컸지만, 검사·시술·관리의 복잡성 증가가 사회적 변화와 높아진 환자 기대와 함께 스트레스와 고통을 더 키워 왔다."
   },
   {
    n: "⑧",
    en: "Attempts to measure and identify distress and burnout in medical students have been fairly limited until recent years, so historical comparisons are generally not possible.",
    ans: "S Attempts to measure and identify distress and burnout in medical students · △V have been · C fairly limited · M until recent years · [so] S historical comparisons · △V are · C generally not possible",
    ko: "의대생의 고통과 소진을 재고 밝히려는 시도는 최근 몇 년 전까지 상당히 제한적이어서, 과거와의 비교는 대체로 불가능하다."
   }
  ]
 },
 syn: [
  {
   n: "②",
   name: "가정법 과거  if + 과거형 / would + 동사원형",
   q: "«It would be odd if that were not the case», as education needs to evolve…",
   d: "현재 사실과 다른 상황을 상상한다. if절에 <b>과거형</b>(be동사는 were), 주절에 <b>would + 동사원형</b>을 쓴다.",
   k: "그렇지 않다면 이상할 것이다"
  },
  {
   n: "⑦",
   name: "간접의문문  to what extent ~",
   q: "The big unknown is «to what extent this is a developing phenomenon».",
   d: "의문사 덩어리가 이끄는 절이 통째로 보어가 된다. 절 안에서는 <b>주어 + 동사</b> 어순을 지킨다.",
   k: "이것이 어느 정도까지 커지고 있는 현상인지"
  }
 ],
 synd: [
  { u: "구문 1", en: "It would be strange if no one asked about the hours.", k: "아무도 근무 시간을 묻지 않는다면 이상할 것이다." },
  { u: "구문 2", en: "The question is to what extent the training has changed.", k: "문제는 그 수련이 어느 정도까지 바뀌었는가이다." },
  { u: "구문 1 + 2", en: "It would help if we knew to what extent students are struggling.", k: "학생들이 어느 정도까지 힘들어하는지 안다면 도움이 될 것이다." }
 ],
 why: [
  ["문장 ⑥의 한 요인만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 의대생의 소진 수준이 매우 높다고 말한다 — 정반대다"],
  ["의대에 지원하는 방법은 글에 나오지 않는다"],
  ["병원의 역사는 글에서 다루지 않는다"]
 ],
 src: [["①"], ["④"], ["⑤"], ["⑧과 어긋남 — 최근 몇 년 전까지 상당히 제한적이었다"], ["⑨"]],
 kb: {
  title: "지친 의사를 만드는 구조",
  lead: "개인의 문제로만 볼 수 없는 이유",
  items: [
   ["번아웃이라는 이름", "세계보건기구는 2019년 국제질병분류 11판에서 번아웃을 ‘질병’이 아니라 건강 상태에 영향을 주는 직업적 현상으로 규정했다. 개인의 병이 아니라 일터에서 비롯되는 상태로 본 것이다."],
   ["당직 시간의 상한", "미국은 2003년부터 전공의 근무를 주 80시간으로 제한했다. 유럽 근로시간지침은 주 48시간을 상한으로 둔다. 제도마다 상한이 크게 다르다."],
   ["비교할 자료가 없다는 것", "어떤 현상이 나빠지고 있다고 말하려면 예전에 잰 값이 있어야 한다. 의대생의 소진을 재기 시작한 것은 비교적 최근이라, 지금 수치가 높다는 것은 알아도 예전보다 높아졌는지는 말하기 어렵다."]
  ],
  ask: "여러분이 속한 곳에서 ‘원래 힘든 일’이라고 넘겨 온 것 가운데, 사실은 구조를 고쳐야 하는 것은 무엇인가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
}

 ]
};
