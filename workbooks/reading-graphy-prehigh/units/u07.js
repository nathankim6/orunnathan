/* Unit 7 · Sports & Entertainment — 원문 Theme 31–35 */
const R = require("../src/orig/all.json");
const T = n => R[n - 1];

module.exports = {
 no: 7,
 field: "Sports & Entertainment",
 ko: "스포츠·연예",
 tagline: "보는 일과 하는 일 — 무엇이 값을 만드는가",
 next: { en: "Politics, Law & History", ko: "규칙과 기록이 어떻게 만들어졌는지 읽습니다", words: "267–309 words" },
 lessons: [

/* ───────────────────────────── 31 ───────────────────────────── */
{
 no: "31", key: "coach", accent: "#35708C", tint: "#E4EFF4", deep: "#1E4A61",
 en: "The Role of Coaches",
 ko: "교사도 아니고 선수도 아닌 자리",
 goal: "코치라는 직업이 어떻게 생겨나 학교 안에 자리 잡았는지 순서대로 설명할 수 있다.",
 fig: "Figure 1  말이 많은 코치와 기다리는 코치 — 코치는 어떤 의미의 교사인가.",
 tip: "먼저 생각해 보자. 운동부 코치는 학교의 교사인가, 아니면 다른 무엇인가?",
 sent: T(31).sent, kor: T(31).kor,
 bank: [
  ["coincide with", "①", "동시에 일어나다"],
  ["autonomous", "①", "자율적인"],
  ["pursuit", "③", "활동, 추구"],
  ["attain", "④", "얻다"],
  ["administration", "⑤", "행정 부서"],
  ["niche", "⑥", "꼭 맞는 자리"]
 ],
 defs: [
  ["coincide with", "to happen at the same time as"],
  ["autonomous", "running by its own rules"],
  ["pursuit", "an activity you spend time on"],
  ["attain", "to reach or gain something"],
  ["administration", "the people who run an organization"],
  ["niche", "a place that suits someone well"]
 ],
 defOrder: [4, 1, 5, 0, 3, 2],
 flow: [
  ["Where they came from", "Coaches appeared as sport itself rose", null],
  ["The old word", "Before the Civil War, coach meant a private (  ①  )", "tutor"],
  ["The turn", "Within a decade coaches won some (  ②  )", "recognition"],
  ["The reason", "Academic status let the college claim (  ③  )", "control"],
  ["The limit", "They were not (  ④  ) in the conventional sense", "teachers"]
 ],
 flowBogi: "tutor · recognition · control · teachers · players · silence",
 para: [
  ["① coinciding with the rise of sport", "They appeared as sport was ______.", "growing"],
  ["③ referring most often to a private tutor", "The word usually meant a private ______.", "teacher"],
  ["④ had already attained some recognition", "They had won some ______ by then.", "respect"],
  ["⑤ could claim some control", "The college could keep a ______ on them.", "hold"],
  ["⑦ no assurance of happiness or longevity", "No promise of a happy or long ______.", "life"]
 ],
 paraBogi: "growing · teacher · respect · hold · life · fading · student · game",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "What B. H. Hall Wrote About College Words",
    "A New Profession That Did Not Fit the School",
    "Coaches Became Ordinary Classroom Teachers",
    "How to Train for a Long Race",
    "The Rules of Nineteenth-Century Football"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "코치와 트레이너는 19세기 후반에 등장한 본질적으로 새로운 전문직 집단이었다.",
    "남북전쟁 이전에 coach 라는 낱말은 주로 개인 교사를 가리켰다.",
    "남북전쟁이 끝난 뒤 10년 안에 일부 코치들은 어느 정도 인정을 받고 있었다.",
    "코치에게 학문적 지위를 넓혀 준 것은 주로 코치의 처우를 높이기 위해서였다.",
    "코치는 일반 학생이나 관중에게 신체적 혜택을 거의 주지 않았다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 코치를 전통적 의미의 교사로 보지 않는 근거를 우리말 한 문장으로 써 보세요.",
   ans: "일반 학생이나 관중에게 신체적 혜택을 거의 주지 않았고, 팀을 이룬 소수에게조차 행복이나 장수를 보장하지 않았기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "⑤",
   toks: [
    ["The extension of any form of academic status to the coaches", "s"], ["was", "v"],
    ["largely a means", null], ["by which", "c"],
    ["a college's faculty or administration", "s2"], ["could claim", "v2"],
    ["some control over the athletic behavior of the students and athletic management in general.", null]
   ],
   ko: "코치에게 어떤 형태로든 학문적 지위를 넓혀 준 것은, 대학의 교수진이나 행정 부서가 학생의 운동 행동과 운영 전반에 대해 어느 정도 통제권을 주장할 수 있는 수단이었다."
  },
  drill: [
   {
    n: "②",
    en: "The very word coach appears not to have been associated with games and athletic competition in the years before the Civil War.",
    ans: "S The very word coach · △V appears · C not to have been associated · M with games and athletic competition · M in the years before the Civil War",
    ko: "coach 라는 낱말 자체는 남북전쟁 이전에는 경기나 운동 시합과 결부되지 않았던 것으로 보인다."
   },
   {
    n: "④",
    en: "Within a decade after the Civil War, however, coaches who regarded sport as a scientific study had already attained some recognition in several of the older schools of the Northeast and in a number of well-sponsored private athletic clubs.",
    ans: "M Within a decade after the Civil War · S coaches [who] △V′ regarded sport as a scientific study · △V had already attained · O some recognition · M in several of the older schools of the Northeast and in a number of well-sponsored private athletic clubs",
    ko: "그러나 남북전쟁 후 10년 안에, 스포츠를 과학적 연구로 본 코치들은 북동부의 오래된 학교 몇 곳과 후원이 좋은 사설 운동 클럽에서 이미 어느 정도 인정을 얻고 있었다."
   },
   {
    n: "⑥",
    en: "For this reason, although they found a niche in the schools, coaches did not act as teachers in the conventional sense.",
    ans: "M For this reason · [although] S′ they · △V′ found · O a niche in the schools · S coaches · △V did not act · M as teachers in the conventional sense",
    ko: "이런 이유로 코치들은 학교 안에 자리를 얻었지만, 전통적인 의미의 교사처럼 활동하지는 않았다."
   }
  ]
 },
 syn: [
  {
   n: "⑤",
   name: "전치사 + 관계대명사  by which",
   q: "…largely a means «by which a college's faculty or administration could claim some control»…",
   d: "<b>by which</b>는 <b>a means</b>를 받아 ‘그것으로 ~하는 수단’을 뜻한다. by the means 로 풀어 읽으면 쉽다.",
   k: "그것으로 통제권을 주장할 수 있는 수단"
  },
  {
   n: "②",
   name: "완료부정사의 수동형  to have been p.p.",
   q: "The very word coach «appears not to have been associated» with games and athletic competition…",
   d: "본동사보다 <b>앞선 때</b>의 일을 나타낸다. 여기서는 ‘~였던 것으로 보인다’라는 뜻이 된다.",
   k: "결부되지 않았던 것으로 보인다"
  }
 ],
 synd: [
  { u: "구문 1", en: "He looked for a rule by which the two claims could be judged.", k: "그는 그 두 주장을 판단할 수 있는 규칙을 찾았다." },
  { u: "구문 2", en: "The letter appears to have been written in a hurry.", k: "그 편지는 급하게 쓰인 것으로 보인다." },
  { u: "구문 1 + 2", en: "The record appears to have been the means by which the club judged its members.", k: "그 기록은 클럽이 회원을 판단하던 수단이었던 것으로 보인다." }
 ],
 why: [
  ["문장 ③의 인용만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 코치가 전통적 의미의 교사처럼 활동하지 않았다고 말한다 — 정반대다"],
  ["훈련 방법은 글에 나오지 않는다"],
  ["당시 경기 규칙은 글에서 다루지 않는다"]
 ],
 src: [["①"], ["③"], ["④"], ["⑤와 어긋남 — 학생의 운동 행동과 운영을 통제하려는 수단이었다"], ["⑦"]],
 kb: {
  title: "코치라는 말이 옮겨 온 길",
  lead: "마차에서 개인 교사로, 그리고 운동장으로",
  items: [
   ["마차에서 온 말", "coach 는 헝가리 마을 Kocs 에서 만들던 마차를 가리키던 말이다. 1830년대 영국 대학가에서 학생을 시험까지 ‘실어다 준다’는 뜻의 은어로 개인 교사를 부르게 되었고, 그 뒤 운동 지도자에게 옮겨 갔다."],
   ["A Collection of College Words and Customs", "B. H. Hall 이 1851년에 처음 낸 이 책은 미국 대학가에서 쓰이던 은어와 관습을 모은 사전이다. 당시 coach 가 어떤 뜻으로 쓰였는지 알려 주는 자료로 이 글에 인용되었다."],
   ["돈을 받은 첫 기록", "예일대 조정팀은 1860년대에 전문 지도자를 두었고, 미식축구에서는 1892년 Allegheny Athletic Association 이 선수에게 돈을 준 기록이 남아 있다. 아마추어 원칙과 돈 사이의 긴장은 이때부터 시작되었다."]
  ],
  ask: "여러분을 가장 크게 성장시킨 지도자는 무엇을 해 주었는가? 그것은 ‘가르침’이었는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 32 ───────────────────────────── */
{
 no: "32", key: "esports", accent: "#7B4FA6", tint: "#F0EAF7", deep: "#4E2E70",
 en: "The Rise of E-Sports",
 ko: "취미가 직업이 되던 10년",
 goal: "1990년대 후반 경쟁 게임이 직업으로 자리 잡는 과정을 두 축으로 나누어 설명할 수 있다.",
 fig: "Figure 1  경기장 하나와 화면 수백만 개.",
 tip: "먼저 생각해 보자. 어떤 활동이 ‘직업’이 되려면 무엇이 갖추어져야 할까?",
 sent: T(32).sent, kor: T(32).kor,
 bank: [
  ["take shape", "①", "구체화되다"],
  ["hobbyist", "②", "취미로 하는 사람"],
  ["barrier", "③", "장벽"],
  ["legitimize", "⑤", "정당한 것으로 인정받게 하다"],
  ["instrumental", "⑥", "중요한 역할을 하는"],
  ["precursor", "⑩", "선구자, 전조"]
 ],
 defs: [
  ["take shape", "to become clear and definite"],
  ["hobbyist", "a person who does it for fun only"],
  ["barrier", "something that blocks the way"],
  ["legitimize", "to make something officially accepted"],
  ["instrumental", "playing an important part in a result"],
  ["precursor", "something that comes before another"]
 ],
 defOrder: [2, 5, 0, 4, 1, 3],
 flow: [
  ["The shift", "Gaming moved from hobby to paid competition", null],
  ["The internet", "It broke down (  ①  ) barriers", "geographic"],
  ["The league", "The CPL ran tournaments with cash (  ②  )", "prizes"],
  ["Korea", "A 1998 strategy game became a national (  ③  )", "sensation"],
  ["The result", "TV broadcast matches live, a precursor to (  ④  )", "streaming"]
 ],
 flowBogi: "geographic · prizes · sensation · streaming · language · radio",
 para: [
  ["① began to take shape", "The idea started to grow ______.", "clear"],
  ["③ breaking down geographic barriers", "Distance stopped ______ who could play.", "limiting"],
  ["⑥ paving the way for professional players", "It opened the ______ for a career.", "road"],
  ["⑨ make a living solely by competing", "They lived on prize money ______.", "alone"],
  ["⑩ a precursor to the widespread streaming culture", "TV came ______ the streaming era.", "before"]
 ],
 paraBogi: "clear · limiting · road · alone · before · dim · helping · after",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "What the Letters CPL Stand For",
    "The Decade Play Became Work",
    "Competitive Gaming Stayed a Local Hobby",
    "How to Win a Strategy Game",
    "A History of Korean Television"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "1990년대 후반에 게임을 전문 직업으로 여기는 개념이 구체화되기 시작했다.",
    "인터넷 접속의 확대로 게이머들이 전 세계 규모로 연결되어 겨룰 수 있게 되었다.",
    "CPL 은 1997년에 설립되어 상금이 걸린 대회를 열었다.",
    "1998년에 나온 전략 게임은 한국에서 큰 관심을 끌지 못했다.",
    "한국 방송사들이 경기를 생중계하기 시작한 것은 스트리밍 문화의 전조였다."
   ], ans: 4
  },
  {
   t: "write", q: "CPL 이 경쟁 게임의 직업화에 기여한 방식을 우리말 한 문장으로 써 보세요.",
   ans: "상금이 걸린 대회를 열어 전통 스포츠 리그에 견줄 만한 구조화된 행사를 만들고, 후원·팀 계약·대회 상금으로 생계를 유지할 길을 열었다."
  }
 ],
 fl: {
  model: {
   n: "③",
   toks: [
    ["The rise of internet access", "s"], ["allowed", "v"],
    ["gamers to connect and compete on a global scale,", null],
    ["breaking down geographic barriers", "m"], ["that", "c"], ["had previously limited", "v2"],
    ["competitive gaming to local or regional events.", null]
   ],
   ko: "인터넷 접속의 확대는 게이머들이 전 세계 규모로 연결되어 겨루게 해 주었고, 그전까지 경쟁 게임을 지역 행사로 묶어 두던 지리적 장벽을 무너뜨렸다."
  },
  drill: [
   {
    n: "②",
    en: "This period marked a critical shift from gaming competitions being purely recreational or hobbyist-driven, to events that offered significant financial rewards.",
    ans: "S This period · △V marked · O a critical shift · M from gaming competitions being purely recreational or hobbyist-driven · M to events that offered significant financial rewards",
    ko: "이 시기는 게임 대회가 순전히 오락이나 취미 중심이던 데서 상당한 금전적 보상을 주는 행사로 넘어간 중대한 전환을 나타냈다."
   },
   {
    n: "⑥",
    en: "The CPL was instrumental in formalizing competitive gaming as a career path, paving the way for professional players to earn a living through sponsorships, team contracts, and tournament winnings.",
    ans: "S The CPL · △V was · C instrumental in formalizing competitive gaming as a career path · M paving the way for professional players to earn a living through sponsorships, team contracts, and tournament winnings",
    ko: "CPL 은 경쟁 게임을 직업 경로로 공식화하는 데 중요한 역할을 했고, 프로 선수들이 후원·팀 계약·대회 상금으로 생계를 유지할 길을 열었다."
   },
   {
    n: "⑨",
    en: "Tournaments featuring the game began drawing large audiences, and soon, professional players emerged who could make a living solely by competing.",
    ans: "S Tournaments featuring the game · △V began · O drawing large audiences · and M soon · S professional players · △V emerged · [who] △V′ could make a living solely by competing",
    ko: "그 게임을 내건 대회들이 많은 관중을 끌기 시작했고, 곧 겨루는 것만으로 생계를 유지할 수 있는 프로 선수들이 나타났다."
   }
  ]
 },
 syn: [
  {
   n: "②",
   name: "from A to B  (A 자리의 명사 + -ing)",
   q: "…a critical shift «from gaming competitions being purely recreational or hobbyist-driven, to events»…",
   d: "<b>from A to B</b>는 변화의 두 끝을 묶는다. 여기서 A 는 <b>gaming competitions being ~</b>처럼 ‘명사 + -ing’ 모양이다.",
   k: "게임 대회가 오락 중심이던 데서 행사로"
  },
  {
   n: "⑩",
   name: "It is not long before ~",
   q: "…and «it wasn't long before television networks in South Korea began broadcasting matches live»…",
   d: "‘머지않아 ~하다’라는 뜻이다. <b>before</b> 뒤에는 완전한 절이 온다.",
   k: "머지않아 방송사들이 경기를 생중계하기 시작했다"
  }
 ],
 synd: [
  { u: "구문 1", en: "The plan moved from a small club meeting to a national event.", k: "그 계획은 작은 동아리 모임에서 전국 행사로 옮겨 갔다." },
  { u: "구문 2", en: "It wasn't long before the seats were all sold.", k: "머지않아 좌석이 모두 팔렸다." },
  { u: "구문 1 + 2", en: "It wasn't long before the sport moved from a hobby to a career.", k: "머지않아 그 종목은 취미에서 직업으로 옮겨 갔다." }
 ],
 why: [
  ["약칭의 뜻은 글의 초점이 아닌 지엽적인 제목이다"],
  ["정답"],
  ["글은 인터넷이 지리적 장벽을 무너뜨렸다고 말한다 — 정반대다"],
  ["게임을 잘하는 방법은 글에 나오지 않는다"],
  ["텔레비전의 역사는 글에서 다루지 않는다"]
 ],
 src: [["①"], ["③"], ["④"], ["⑧과 어긋남 — 한국에서 전국적인 열풍을 일으켰다"], ["⑩"]],
 kb: {
  title: "경기장이 화면으로 옮겨 가기까지",
  lead: "구경꾼의 원은 어떻게 넓어졌나",
  items: [
   ["가장 이른 대회", "1972년 스탠퍼드 대학에서 열린 Spacewar! 대회가 비디오 게임 대회의 첫 기록으로 꼽힌다. 상품은 잡지 1년 구독권이었다."],
   ["CPL", "Cyberathlete Professional League 는 1997년 미국 텍사스에서 시작되었다. 상금을 걸고 정해진 규칙과 일정으로 대회를 운영한 초기 사례로, ‘프로’라는 말을 게임에 붙인 조직 가운데 하나다."],
   ["방송으로 간 경기", "한국에서는 2000년 무렵 게임 전문 채널이 개국해 경기를 정규 편성으로 중계했다. 경기장에 가지 않고도 같은 경기를 함께 보는 구조가 이때 자리 잡았다."]
  ],
  ask: "여러분이 즐기는 활동이 ‘직업’이 되려면 무엇이 더 갖추어져야 할까?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 33 ───────────────────────────── */
{
 no: "33", key: "synth", accent: "#B25A34", tint: "#F9EBE3", deep: "#7E3616",
 en: "Technology and AI in the Media and Entertainment Industry",
 ko: "여덟 시간을 두고 벌어지는 경쟁",
 goal: "미디어·엔터테인먼트 산업이 커진 배경과 기업들이 AI로 향하는 까닭을 순서대로 설명할 수 있다.",
 fig: "Figure 1  실제로 찍힌 것과 채워 넣은 것.",
 tip: "먼저 생각해 보자. 하루 여덟 시간을 오락에 쓴다면, 그 시간을 두고 무엇이 겨루고 있을까?",
 sent: T(33).sent, kor: T(33).kor,
 bank: [
  ["manageable", "①", "감당할 만한"],
  ["distribute", "③", "배포하다"],
  ["availability", "⑤", "이용 가능성"],
  ["revenue", "⑦", "매출"],
  ["retain", "⑩", "유지하다"],
  ["resort to", "⑪", "~에 의지하다"]
 ],
 defs: [
  ["manageable", "easy enough to deal with"],
  ["distribute", "to send something out to many people"],
  ["availability", "the state of being ready for use"],
  ["revenue", "the money a business takes in"],
  ["retain", "to keep something you already have"],
  ["resort to", "to turn to something for help"]
 ],
 defOrder: [5, 2, 0, 4, 1, 3],
 flow: [
  ["Why now", "Easier lives leave more free time for entertainment", null],
  ["The scale", "People in the USA spend (  ①  ) hours a day on media", "eight"],
  ["The cause", "Viewers moved from cable and radio to (  ②  )", "streaming"],
  ["The pressure", "Firms must deliver quality or lose (  ③  )", "customers"],
  ["The answer", "They turn to AI and computer (  ④  )", "vision"]
 ],
 flowBogi: "eight · streaming · customers · vision · two · paper",
 para: [
  ["① get more manageable with the advancements", "Daily life becomes easier to ______.", "handle"],
  ["⑤ accessing unlimited entertainment on the go", "They watch anywhere they ______.", "move"],
  ["⑧ switching from traditional media channels", "Viewers are ______ away from cable.", "moving"],
  ["⑩ they cannot attract and retain customers", "Otherwise the customers do not ______.", "stay"],
  ["⑬ unlocking new digital approaches", "They open up ______ ways of working.", "new"]
 ],
 paraBogi: "handle · move · moving · stay · new · drop · sit · old",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Much a Streaming Subscription Costs",
    "Eight Hours a Day and a Race to Fill Them",
    "Cable and Radio Are Winning Viewers Back",
    "How Computer Vision Recognises Faces",
    "A History of the Film Camera"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "미국 사람들은 하루 평균 여덟 시간을 오락과 미디어 콘텐츠에 쓴다.",
    "2020년 전 세계 미디어·엔터테인먼트 산업의 매출은 2조 달러였다.",
    "빠른 성장은 주로 사람들이 디지털·모바일 스트리밍으로 옮겨 가기 때문이다.",
    "콘텐츠 제공업체는 고품질 제공에 대한 압박에서 점점 자유로워지고 있다.",
    "많은 업계 전문가가 AI 를 도입해 새로운 디지털 접근 방식을 활용하고 있다."
   ], ans: 4
  },
  {
   t: "write", q: "기업들이 인공지능과 컴퓨터 비전 기반 해법으로 향하는 이유를 우리말 한 문장으로 써 보세요.",
   ans: "빠른 성장과 콘텐츠 수요로 경쟁이 치열해져, 고품질 서비스를 제공하지 못하면 고객을 끌고 유지할 수 없기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "①",
   toks: [
    ["As", "c"], ["the lives of modern people", "s2"], ["get", "v2"], ["more manageable", null],
    ["with the advancements in technology,", "m"], ["they", "s"], ["have", "v"],
    ["more free time", null], ["to seek entertainment in their daily lives.", "m"]
   ],
   ko: "기술의 발전으로 현대인의 삶이 더 감당할 만해짐에 따라, 그들은 일상에서 오락을 찾을 자유 시간을 더 갖게 된다."
  },
  drill: [
   {
    n: "⑤",
    en: "With the support of high-speed network availability and easy-to-access media platforms, users are accessing unlimited entertainment on the go.",
    ans: "M With the support of high-speed network availability and easy-to-access media platforms · S users · △V are accessing · O unlimited entertainment · M on the go",
    ko: "고속 통신망의 이용 가능성과 접근하기 쉬운 미디어 플랫폼의 뒷받침으로, 사용자들은 이동 중에도 무제한의 오락에 접근하고 있다."
   },
   {
    n: "⑩",
    en: "Content providers and distribution companies are facing increasing pressure to deliver high-quality media content and entertainment services; otherwise, they cannot attract and retain customers to drive business value.",
    ans: "S Content providers and distribution companies · △V are facing · O increasing pressure to deliver high-quality media content and entertainment services · M otherwise · S they · △V cannot attract and retain · O customers",
    ko: "콘텐츠 제공업체와 배급사는 고품질 콘텐츠와 오락 서비스를 제공해야 한다는 압박을 점점 더 받고 있으며, 그러지 못하면 사업 가치를 만들어 줄 고객을 끌고 유지할 수 없다."
   },
   {
    n: "⑫",
    en: "Artificial intelligence and computer vision in the media and entertainment industry enable companies to build digital solutions that help service providers deliver quality services and enhance their customer experiences.",
    ans: "S Artificial intelligence and computer vision in the media and entertainment industry · △V enable · O companies to build digital solutions · [that] △V′ help · O service providers deliver quality services and enhance their customer experiences",
    ko: "미디어·엔터테인먼트 산업의 인공지능과 컴퓨터 비전은, 서비스 제공자가 양질의 서비스를 전달하고 고객 경험을 높이도록 돕는 디지털 해법을 기업이 만들 수 있게 해 준다."
   }
  ]
 },
 syn: [
  {
   n: "⑩",
   name: "부사 otherwise (그러지 않으면)",
   q: "…increasing pressure to deliver high-quality media content …; «otherwise, they cannot attract and retain customers»…",
   d: "앞 문장의 조건이 지켜지지 않는 경우를 가리킨다. ‘그러지 않으면’으로 읽으며 뒤에는 완전한 절이 온다.",
   k: "그러지 않으면 고객을 끌고 유지할 수 없다"
  },
  {
   n: "⑫",
   name: "enable + 목적어 + to부정사",
   q: "Artificial intelligence and computer vision … «enable companies to build digital solutions»…",
   d: "‘~가 …할 수 있게 하다’이다. <b>allow, permit</b>도 같은 자리에 to부정사를 취한다.",
   k: "기업이 디지털 해법을 만들 수 있게 한다"
  }
 ],
 synd: [
  { u: "구문 1", en: "Post the file today; otherwise, it will miss the deadline.", k: "오늘 그 파일을 올려라. 그러지 않으면 마감을 놓칠 것이다." },
  { u: "구문 2", en: "The new tool enables editors to cut a scene in minutes.", k: "그 새 도구는 편집자가 몇 분 만에 장면을 자를 수 있게 한다." },
  { u: "구문 1 + 2", en: "The system enables staff to answer fast; otherwise, viewers leave.", k: "그 시스템은 직원이 빠르게 답할 수 있게 한다. 그러지 않으면 시청자가 떠난다." }
 ],
 why: [
  ["구독료는 글에 나오지 않는다"],
  ["정답"],
  ["글은 시청자가 전통 채널에서 디지털로 옮겨 간다고 말한다 — 정반대다"],
  ["컴퓨터 비전의 작동 원리는 글의 초점이 아니다"],
  ["영화 카메라의 역사는 글에서 다루지 않는다"]
 ],
 src: [["②"], ["⑦"], ["⑧"], ["⑩과 어긋남 — 고품질 제공에 대한 압박을 점점 더 많이 받고 있다"], ["⑬"]],
 kb: {
  title: "여덟 시간을 둘러싼 다툼",
  lead: "무엇이 우리의 시간을 두고 겨루는가",
  items: [
   ["시간이라는 자원", "Netflix 는 주주 서한에서 자사의 경쟁 상대가 다른 스트리밍 서비스만이 아니라 사람들의 ‘수면’이라고 쓴 적이 있다. 콘텐츠 산업의 진짜 자원이 돈이 아니라 시간이라는 관점이다."],
   ["컴퓨터 비전", "영상 속 장면·인물·사물을 자동으로 알아보는 기술이다. 자막 자동 생성, 장면 검색, 부적절한 장면 걸러 내기, 예고편 후보 뽑기처럼 사람이 일일이 보던 일을 대신한다."],
   ["추천이 만드는 소비", "무엇을 볼지 고르는 시간이 줄면 보는 시간이 는다. 그래서 추천 시스템의 성능은 콘텐츠 자체의 품질만큼이나 사업에 직접 작용한다."]
  ],
  ask: "어제 여러분의 시간을 가장 많이 가져간 화면은 무엇이었고, 무엇이 그것을 고르게 했는가?"
 },
 wtype: ["무관", "정답", "반대", "지엽", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 34 ───────────────────────────── */
{
 no: "34", key: "longtail", accent: "#2F7A5E", tint: "#E4F0EA", deep: "#1B5240",
 en: "Being Successful in the Music Industry",
 ko: "가장 잘하는 것과 팔리는 것",
 goal: "음악 업계에서 실력과 성공이 곧바로 이어지지 않는 까닭을 근거를 들어 설명할 수 있다.",
 fig: "Figure 1  긴 꼬리와 좁은 문 — 올리기는 쉽고 발견되기는 어렵다.",
 tip: "먼저 생각해 보자. ‘가장 잘하는 사람’이 늘 가장 널리 알려지는가?",
 sent: T(34).sent, kor: T(34).kor,
 bank: [
  ["outweigh", "①", "~보다 크다"],
  ["populace", "③", "대중, 사람들"],
  ["dexterity", "⑤", "손재주"],
  ["demographic", "⑤", "인구 집단"],
  ["venture", "⑦", "모험적 사업"],
  ["merit", "⑨", "장점"]
 ],
 defs: [
  ["outweigh", "to be greater in weight or value"],
  ["populace", "all the people of a place"],
  ["dexterity", "skill in using the hands quickly"],
  ["demographic", "a group of people of one kind"],
  ["venture", "a new project with some risk"],
  ["merit", "a good point worth praising"]
 ],
 defOrder: [3, 0, 5, 1, 4, 2],
 flow: [
  ["The effort", "Musicians practise for hours from a young age", null],
  ["The contrast", "In sport the fastest runner (  ①  ) the race", "wins"],
  ["The problem", "In music, ‘best’ in the eyes of (  ②  )?", "whom"],
  ["The answer", "Aim at the target (  ③  ) who will care", "demographic"],
  ["The proof", "Decca turned down (  ④  ) in 1962", "The Beatles"]
 ],
 flowBogi: "wins · whom · demographic · The Beatles · loses · everyone",
 para: [
  ["① practise for hours on end from a young age", "They train for hours ______ end.", "without"],
  ["③ this may actually carry little weight", "Being best may ______ for little.", "count"],
  ["⑤ not everybody will be impressed", "It will not move ______.", "everyone"],
  ["⑦ the music has no audience or purpose", "Refusal does not mean ______ will listen.", "nobody"],
  ["⑨ enough belief in it to proceed with investment", "Belief strong enough to ______ money in.", "put"]
 ],
 paraBogi: "without · count · everyone · nobody · put · with · pay · few",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Decca Chose Its Artists in 1962",
    "Best Is Not the Same as Wanted",
    "The Finest Player Always Wins the Contract",
    "How to Tune a Guitar Quickly",
    "A History of the Recording Studio"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "많은 프로 뮤지션은 어릴 때부터 여러 시간 계속 연습한다.",
    "달리기에서는 다른 모든 선수보다 빠르면 경주에서 이긴다.",
    "‘슈레드 연주법’ 재능은 놀라운 손재주를 보여도 모두를 감동시키지는 않는다.",
    "업계 투자자가 투자하지 않으면 그 음악에는 청중도 목적도 없는 것이다.",
    "1962년 Decca 는 비틀스와 계약할 기회를 놓쳤다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 슈레드 기법 기타리스트에게 권하는 바를 우리말 한 문장으로 써 보세요.",
   ans: "모두를 감동시키려 하지 말고, 그 연주에 크게 관심을 가질 특정 목표 인구 집단에 집중하라는 것이다."
  }
 ],
 fl: {
  model: {
   n: "⑦",
   toks: [
    ["This,", "s"], ["however,", "m"], ["is not", "v"], ["the case", null],
    ["— just because an industry investor does not invest in a particular music venture", "s"],
    ["does not mean", "v"], ["that", "c"], ["the music", "s2"], ["has", "v2"],
    ["no audience or purpose.", null]
   ],
   ko: "그러나 그렇지 않은데, 업계 투자자가 어떤 음악 사업에 투자하지 않는다고 해서 그 음악에 청중이나 목적이 없다는 뜻은 아니다."
  },
  drill: [
   {
    n: "②",
    en: "Although the music industry is a competitive place, compare music with sport: if you can run faster than all the other athletes, you will win the race.",
    ans: "[Although] S′ the music industry · △V′ is · C a competitive place · △V compare · O music with sport · [if] S′ you · △V′ can run faster · S you · △V will win · O the race",
    ko: "음악 업계가 경쟁이 치열한 곳이긴 하지만, 음악을 스포츠와 견주어 보라. 다른 선수들보다 빨리 달릴 수 있으면 경주에서 이긴다."
   },
   {
    n: "④",
    en: "Defining the words ‘best musician’ creates the first problem: ‘best’ in the eyes of whom?",
    ans: "S Defining the words ‘best musician’ · △V creates · O the first problem · M ‘best’ in the eyes of whom?",
    ko: "‘최고의 뮤지션’이라는 말을 정의하는 데서 첫 번째 문제가 생긴다. 누구의 눈에 ‘최고’인가?"
   },
   {
    n: "⑨",
    en: "In essence, there will be huge variation between companies or persons that recognise certain merits in a musical concept and have enough belief in it to proceed with investment.",
    ans: "M In essence · △V there will be · S huge variation · M between companies or persons · [that] △V′ recognise certain merits and have enough belief to proceed with investment",
    ko: "본질적으로, 어떤 음악적 구상에서 장점을 알아보고 투자를 진행할 만큼 믿음을 갖는 회사나 사람 사이에는 큰 차이가 있을 것이다."
   }
  ]
 },
 syn: [
  {
   n: "⑤",
   name: "It ~ that 강조 구문 (목적어 강조)",
   q: "…and «it is that target demographic that the guitar shredder must focus and concentrate on»…",
   d: "강조하고 싶은 말을 <b>It is</b>와 <b>that</b> 사이에 넣는다. 여기서는 전치사 <b>on</b>의 목적어가 앞으로 나왔다.",
   k: "슈레드 기타리스트가 집중해야 하는 것은 바로 그 목표 인구 집단이다"
  },
  {
   n: "⑦",
   name: "Just because ~ does not mean …",
   q: "«just because an industry investor does not invest in a particular music venture does not mean that» the music has no audience…",
   d: "‘단지 ~라고 해서 …인 것은 아니다’로 읽는다. because 절 전체가 주어 노릇을 한다.",
   k: "단지 투자하지 않는다고 해서 ~라는 뜻은 아니다"
  }
 ],
 synd: [
  { u: "구문 1", en: "It is the audience that the singer must reach first.", k: "그 가수가 먼저 닿아야 하는 것은 바로 청중이다." },
  { u: "구문 2", en: "Just because a song is short does not mean it is simple.", k: "단지 노래가 짧다고 해서 단순한 것은 아니다." },
  { u: "구문 1 + 2", en: "Just because it is the label that pays does not mean it decides the sound.", k: "단지 돈을 내는 쪽이 음반사라고 해서 소리를 정하는 것은 아니다." }
 ],
 why: [
  ["문장 ⑧의 일화만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 최고의 연주자여도 업계에서 중요성이 거의 없을 수 있다고 말한다 — 정반대다"],
  ["기타 조율법은 글에 나오지 않는다"],
  ["녹음실의 역사는 글에서 다루지 않는다"]
 ],
 src: [["①"], ["②"], ["⑤"], ["⑦과 어긋남 — 투자하지 않는다고 청중이나 목적이 없다는 뜻은 아니다"], ["⑧"]],
 kb: {
  title: "거절된 밴드",
  lead: "1962년 1월 1일의 오디션",
  items: [
   ["Decca 오디션", "비틀스는 1962년 1월 1일 런던에서 Decca 오디션을 보았고 계약을 얻지 못했다. 같은 해 EMI 의 Parlophone 레이블에서 프로듀서 George Martin 을 만나 계약으로 이어졌다."],
   ["긴 꼬리", "Chris Anderson 은 2004년 글에서, 온라인에서는 잘 팔리지 않는 수많은 상품의 합이 소수의 히트에 맞먹을 수 있다고 썼다. 다만 그것은 ‘발견될 수 있을 때’의 이야기다."],
   ["누구의 최고인가", "음악 경연의 심사표는 대개 정확성·표현력·독창성처럼 서로 다른 항목을 섞는다. 항목의 가중치를 바꾸면 순위가 달라진다. ‘최고’는 기준을 고른 뒤에야 생기는 말이다."]
  ],
  ask: "여러분이 잘하는 것을 알아볼 사람은 누구인가? 그 사람은 지금 어디에 있는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 35 ───────────────────────────── */
{
 no: "35", key: "boxoffice", accent: "#B84A6A", tint: "#FAE8EC", deep: "#832945",
 en: "Success at the Box Office",
 ko: "오래 걸린다는 것과 잘된다는 것",
 goal: "상영 기간이 실적 지표가 되는 방식과 제작사·극장의 이해가 갈리는 지점을 설명할 수 있다.",
 fig: "Figure 1  소수의 성공이 나머지를 먹여 살리는 구조.",
 tip: "먼저 생각해 보자. 영화가 오래 걸리는 것은 누구에게 이득일까?",
 sent: T(35).sent, kor: T(35).kor,
 bank: [
  ["indicator", "①", "지표"],
  ["metric", "④", "측정 기준"],
  ["gross", "④", "총액의"],
  ["exhibitor", "⑦", "극장 경영자"],
  ["wane", "⑧", "시들해지다"],
  ["magnify", "⑪", "확대하다"]
 ],
 defs: [
  ["indicator", "a sign that shows how things stand"],
  ["metric", "a measure used to judge results"],
  ["gross", "counted before costs are taken out"],
  ["exhibitor", "a person who shows films to the public"],
  ["wane", "to become weaker or smaller"],
  ["magnify", "to make something look greater"]
 ],
 defOrder: [4, 1, 5, 0, 3, 2],
 flow: [
  ["The measure", "How long a film stays in cinemas is one indicator", null],
  ["The logic", "A longer run attracts more paying (  ①  )", "customers"],
  ["The split", "Producers want long runs; (  ②  ) often want short ones", "exhibitors"],
  ["The fact", "About (  ③  )% of cinema revenue comes in week one", "40"],
  ["The lever", "Time the release for peak (  ④  ) periods", "holiday"]
 ],
 flowBogi: "customers · exhibitors · 40 · holiday · critics · 10",
 para: [
  ["① the length of time it survives a theatre run", "How long it stays on ______.", "screen"],
  ["④ not as widely used as gross box office receipts", "Total takings are used ______ often.", "more"],
  ["⑧ once a movie's appeal starts to wane", "When the pull begins to ______.", "fade"],
  ["⑩ the more longevity it is likely to have", "A strong start means a ______ run.", "longer"],
  ["⑫ aiming for release at peak holiday times", "Open when crowds are ______.", "biggest"]
 ],
 paraBogi: "screen · more · fade · longer · biggest · shelf · less · grow",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "What Gross Box Office Receipts Mean",
    "The First Week Decides the Rest",
    "Long Runs Are Best for Everyone",
    "How Film Critics Write Reviews",
    "A Guide to Building a Cinema"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "영화가 극장에서 오래 걸릴수록 더 많은 유료 관객을 끌 수 있다.",
    "상영 기간은 박스 오피스 총 매상액만큼 널리 쓰이는 지표는 아니다.",
    "제작자와 배급사에게는 상영 기간이 긴 편이 최선이다.",
    "영화의 매력이 시들해져도 극장 경영자는 같은 영화를 계속 거는 편이 낫다.",
    "개봉 시기를 제대로 잡으면 그 효과가 더욱 확대된다."
   ], ans: 4
  },
  {
   t: "write", q: "제작자와 극장 경영자의 이해가 갈리는 지점을 우리말 한 문장으로 써 보세요.",
   ans: "제작자와 배급사는 상영되는 동안 수입이 생기므로 긴 상영을 바라지만, 극장 경영자는 매력이 식은 영화를 새 영화로 바꾸는 편이 관객과 수익을 더 늘릴 수 있어 짧은 상영을 바라는 경우가 많다."
  }
 ],
 fl: {
  model: {
   n: "⑧",
   toks: [
    ["This", "s"], ["is", "v"], ["because", "c"], ["once", "c"], ["a movie's appeal", "s2"],
    ["starts", "v2"], ["to wane", null], ["and", "c"], ["audiences", "s2"], ["fall off,", "v2"],
    ["switching to a newer movie", "s2"], ["might generate", "v2"],
    ["bigger audiences in the theatre and more revenues for the owner of the theatres.", null]
   ],
   ko: "이는 영화의 매력이 시들해지고 관객이 줄기 시작하면, 더 새로운 영화로 바꾸는 편이 극장에 더 많은 관객과 소유주에게 더 많은 수익을 만들어 낼 수 있기 때문이다."
  },
  drill: [
   {
    n: "③",
    en: "Clearly, the longer a movie shows in cinemas, the more paying customers it can attract.",
    ans: "M Clearly · [the longer] S′ a movie · △V′ shows in cinemas · [the more] O paying customers · S it · △V can attract",
    ko: "분명히, 영화가 극장에서 오래 걸릴수록 더 많은 유료 관객을 끌 수 있다."
   },
   {
    n: "⑥",
    en: "For the producer and distributor, a longer run is best because while the movie is in the movie theatres, it is generating some income.",
    ans: "M For the producer and distributor · S a longer run · △V is · C best · [because] [while] S′ the movie · △V′ is · M in the movie theatres · S′ it · △V′ is generating · O some income",
    ko: "제작자와 배급사에게는 상영 기간이 긴 편이 최선인데, 영화가 극장에 걸려 있는 동안 얼마간 수입이 생기기 때문이다."
   },
   {
    n: "⑨",
    en: "It is the case anyway that with most movies, something like 40% of all the revenue they will generate in cinemas is earned during the first week after release.",
    ans: "S It · △V is · C the case · M anyway · [that] S′ something like 40% of all the revenue · △V′ is earned · M during the first week after release",
    ko: "어쨌든 대부분의 영화는 극장에서 벌어들일 전체 수익의 40% 정도를 개봉 첫 주에 번다는 것이 사실이다."
   }
  ]
 },
 syn: [
  {
   n: "⑤",
   name: "전치사 + whether절",
   q: "The overall length of a movie's run is determined «by whether it continues to pull in sufficient revenues».",
   d: "<b>whether</b>가 이끄는 명사절이 전치사 <b>by</b>의 목적어가 된다. <b>if</b>는 전치사 뒤에 쓰지 않는다.",
   k: "충분한 수익을 계속 벌어들이는지에 따라"
  },
  {
   n: "⑨",
   name: "It is the case that ~",
   q: "«It is the case anyway that with most movies, something like 40% … is earned» during the first week…",
   d: "<b>it</b>이 가주어, <b>that절</b>이 진주어다. ‘~라는 것이 사실이다’로 읽는다.",
   k: "~라는 것이 어쨌든 사실이다"
  }
 ],
 synd: [
  { u: "구문 1", en: "The result depends on whether the film opens in summer.", k: "그 결과는 그 영화가 여름에 개봉하는지에 달려 있다." },
  { u: "구문 2", en: "It is the case that most films earn little after week three.", k: "대부분의 영화가 3주 차 이후에는 거의 벌지 못한다는 것이 사실이다." },
  { u: "구문 1 + 2", en: "It is the case that success depends on whether the first week goes well.", k: "성공이 첫 주가 잘 되는지에 달려 있다는 것이 사실이다." }
 ],
 why: [
  ["문장 ④의 용어 하나만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 극장 경영자에게는 단기 상영이 나은 경우가 많다고 말한다 — 정반대다"],
  ["평론가의 글쓰기는 글에 나오지 않는다"],
  ["극장을 짓는 방법은 글에서 다루지 않는다"]
 ],
 src: [["③"], ["④"], ["⑥"], ["⑧과 어긋남 — 더 새로운 영화로 바꾸는 편이 관객과 수익을 늘릴 수 있다"], ["⑪"]],
 kb: {
  title: "아무도 모른다",
  lead: "흥행은 왜 예측이 어려운가",
  items: [
   ["Goldman 의 문장", "각본가 William Goldman 은 1983년 회고록에서 할리우드에 대해 ‘아무도 아무것도 모른다(Nobody knows anything)’고 썼다. 무엇이 통할지 미리 아는 사람은 없다는 뜻으로 지금도 인용된다."],
   ["개봉 첫 주의 무게", "북미 극장가는 금요일에 개봉해 주말 사흘 성적으로 다음 주 상영관 수를 조정하는 관행이 굳어져 있다. 첫 주말이 곧 다음 주의 상영 규모를 정하는 셈이다."],
   ["여름과 연말", "블록버스터 개봉이 여름과 연말에 몰리는 것은 학교가 쉬고 이동이 늘어 관객 수가 최대가 되기 때문이다. 같은 영화라도 언제 여는지가 성적에 크게 작용한다."]
  ],
  ask: "여러분이 무언가를 시작할 때, ‘언제’를 고르는 일이 결과를 바꾼 적이 있는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
}

 ]
};
