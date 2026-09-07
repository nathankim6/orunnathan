/* Unit 6 · Media & IT — 원문 Theme 26–30 */
const R = require("../src/orig/all.json");
const T = n => R[n - 1];

module.exports = {
 no: 6,
 field: "Media & IT",
 ko: "대중매체·정보통신",
 tagline: "연결의 값 — 이어져 있음이 가져가는 것들",
 next: { en: "Sports & Entertainment", ko: "보는 일과 하는 일 사이의 거리를 읽습니다", words: "238–293 words" },
 lessons: [

/* ───────────────────────────── 26 ───────────────────────────── */
{
 no: "26", key: "always", accent: "#A8563F", tint: "#F8EAE4", deep: "#75331F",
 en: "The Negative Impact of Constant Connectivity on Workers",
 ko: "끝나면 끝이던 시절",
 goal: "상시 연결이 노동에 가져온 변화와 프랑스에서 나온 대응을 순서대로 설명할 수 있다.",
 fig: "Figure 1  쪼개진 시간과 남아 있는 잔여물.",
 tip: "먼저 생각해 보자. 밤에 온 업무 메시지를 열지 않고 두었을 때, 나는 정말 쉬고 있었을까?",
 sent: T(26).sent, kor: T(26).kor,
 bank: [
  ["demanding", "②", "힘든, 요구가 많은"],
  ["permanent", "④", "상시의"],
  ["dominate", "⑤", "지배하다"],
  ["unplug", "⑥", "연결을 끊다"],
  ["commission", "⑨", "의뢰하다"],
  ["disastrous", "⑩", "파괴적인"]
 ],
 defs: [
  ["demanding", "needing much time and hard effort"],
  ["permanent", "lasting without a break or an end"],
  ["dominate", "to control or rule over something"],
  ["unplug", "to cut yourself off from a network"],
  ["commission", "to ask someone to do a piece of work"],
  ["disastrous", "causing very great harm or loss"]
 ],
 defOrder: [1, 4, 0, 5, 2, 3],
 flow: [
  ["Before", "A boss rarely called a worker who had gone home", null],
  ["The shift", "Email brought the expectation of a reply at any (  ①  )", "hour"],
  ["Study 1", "A third of French professionals could never (  ②  )", "unplug"],
  ["Study 2", "Even the (  ③  ) of being on call causes anxiety", "expectation"],
  ["The answer", "Mettling's reform: a right to (  ④  )", "disconnect"]
 ],
 flowBogi: "hour · unplug · expectation · disconnect · office · reward",
 para: [
  ["① once she had left the office and gone home", "After work she was ______ to reach.", "hard"],
  ["③ when work was over, it was over", "The day ended when the ______ ended.", "work"],
  ["⑥ for fear of missing out on an email", "They worried about ______ a message.", "missing"],
  ["⑧ the idea of work hours has disappeared", "Fixed working hours have ______ away.", "fallen"],
  ["⑩ disastrous for people's health", "It badly ______ their health.", "harmed"]
 ],
 paraBogi: "hard · work · missing · fallen · harmed · easy · rest · helped",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How a French Telecom Company Is Run",
    "When the Working Day Stopped Ending",
    "Email Has Given Workers More Free Time",
    "How to Write a Clear Business Email",
    "A History of the Telephone"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "1980년대에는 퇴근한 직원에게 상사가 연락하는 일이 드물었다.",
    "상시 대기하며 살던 사람은 의사, 대통령, 총리뿐이었다.",
    "프랑스 전문직 종사자의 3분의 1은 연결을 결코 끊을 수 없다고 느꼈다.",
    "실제로 연락을 받지 않는 밤에는 근로자에게 불안이 생기지 않았다.",
    "Mettling은 모든 사람이 ‘연결을 끊을 권리’를 가져야 한다고 제안했다."
   ], ans: 4
  },
  {
   t: "write", q: "프랑스 정부가 Bruno Mettling에게 조사를 맡긴 계기를 우리말 한 문장으로 써 보세요.",
   ans: "‘번아웃’을 겪는 환자가 급증하고 있다는 의사들의 설명이 나오고 유권자들이 조치를 요구하기 시작했기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "⑤",
   toks: [
    ["But", "c"], ["since", "c"], ["our work lives", "s2"], ["came to be dominated", "v2"],
    ["by email,", "m"], ["there's", "v"], ["a growing expectation", null], ["that", "c"],
    ["workers", "s2"], ["will respond", "v2"], ["at any time, day or night.", "m"]
   ],
   ko: "그러나 우리의 직장 생활이 이메일에 지배받게 된 뒤로, 근로자가 밤낮 가리지 않고 언제든 답하리라는 기대가 커지고 있다."
  },
  drill: [
   {
    n: "①",
    en: "Before the rise of smartphones, it was unusual for a boss to contact her worker once she had left the office and gone home.",
    ans: "M Before the rise of smartphones · S it · △V was · C unusual · S′ for a boss to contact her worker · [once] S′ she · △V′ had left the office and gone home",
    ko: "스마트폰이 등장하기 전에는, 직원이 퇴근해 집에 간 뒤에 상사가 연락하는 일이 드물었다."
   },
   {
    n: "⑦",
    en: "Another study found that just the expectation that you should be on call causes workers anxiety, even if they don't actually get contacted on any given night.",
    ans: "S Another study · △V found · [that] S′ just the expectation that you should be on call · △V′ causes · O workers anxiety · [even if] S′ they · △V′ don't actually get contacted",
    ko: "또 다른 연구는 어떤 밤에 실제로 연락을 받지 않더라도, 대기해야 한다는 예상만으로도 근로자에게 불안이 생긴다는 것을 밝혔다."
   },
   {
    n: "⑩",
    en: "He concluded that this constantly-on-call way of working was disastrous for people's health and their ability to do their jobs.",
    ans: "S He · △V concluded · [that] S′ this constantly-on-call way of working · △V′ was · C disastrous for people's health and their ability to do their jobs",
    ko: "그는 이렇게 늘 대기 상태로 일하는 방식이 사람들의 건강과 업무 수행 능력에 파괴적이라고 결론지었다."
   }
  ]
 },
 syn: [
  {
   n: "②",
   name: "지각동사 see + 목적어 + 원형",
   q: "…«but I almost never saw them get phoned by their employer» once they got home.",
   d: "<b>see + 목적어 + 동사원형</b>은 ‘~가 …하는 것을 보다’이다. 여기서는 <b>get phoned</b>가 원형 자리에 왔다.",
   k: "그들이 고용주에게서 전화를 받는 것을 거의 본 적이 없다"
  },
  {
   n: "⑨",
   name: "콤마 사이의 동격 명사구",
   q: "…the French government commissioned Bruno Mettling, «the head of the telecom company Orange», to study the evidence…",
   d: "콤마 사이에 놓인 명사구가 앞의 이름을 다시 설명한다. 빼도 문장은 그대로 성립한다.",
   k: "통신 회사 Orange의 대표인 Bruno Mettling"
  }
 ],
 synd: [
  { u: "구문 1", en: "I never saw my father answer the phone at dinner.", k: "나는 아버지가 저녁 식사 중에 전화를 받는 것을 본 적이 없다." },
  { u: "구문 2", en: "They asked Marie, the head of the team, to write the report.", k: "그들은 팀장인 Marie에게 그 보고서를 쓰라고 요청했다." },
  { u: "구문 1 + 2", en: "We saw Paul, the night manager, leave his phone on the desk.", k: "우리는 야간 관리자인 Paul이 전화기를 책상에 두고 가는 것을 보았다." }
 ],
 why: [
  ["Orange 라는 회사 자체는 글의 초점이 아니다"],
  ["정답"],
  ["글은 업무 시간이라는 개념이 사라졌다고 말한다 — 정반대다"],
  ["이메일 작성법은 글에 나오지 않는다"],
  ["전화기의 역사는 글에서 다루지 않는다"]
 ],
 src: [["③"], ["④"], ["⑥"], ["⑦과 어긋남 — 대기해야 한다는 예상만으로도 불안이 생긴다"], ["⑪"]],
 kb: {
  title: "연결을 끊을 권리",
  lead: "법으로 정한 퇴근",
  items: [
   ["2017년 프랑스", "종업원 50명 이상 기업이 업무 시간 밖의 연결에 관한 규칙을 노사 협의로 정하도록 한 조항이 2017년 1월부터 시행되었다. ‘연결을 끊을 권리(droit à la déconnexion)’라 불린다."],
   ["다른 나라들", "이탈리아는 2017년 원격근무법에 비슷한 조항을 두었고, 벨기에는 2022년 공무원부터 적용을 시작했다. 오스트레일리아는 2024년 관련 법을 통과시켰다."],
   ["주의 잔여물", "Sophie Leroy 는 앞의 일에 대한 생각이 다음 일로 넘어와 성과를 떨어뜨리는 현상을 attention residue 라 이름 붙였다. 짧은 메시지 하나가 쓰는 시간은 짧아도, 그 뒤에 남는 꼬리는 짧지 않다."]
  ],
  ask: "여러분에게 ‘일이 끝났다’는 신호는 무엇인가? 그 신호가 없다면 무엇이 달라질까?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 27 ───────────────────────────── */
{
 no: "27", key: "virtual", accent: "#4C5FA8", tint: "#EAEDF8", deep: "#2E3C74",
 en: "The Potential of Virtual Worlds Beyond Entertainment",
 ko: "옷장을 지나 돌아온 아이",
 goal: "필자가 가상 세계의 가치를 오락 너머로 넓히는 논리를 근거를 들어 설명할 수 있다.",
 fig: "Figure 1  실패해도 아무도 다치지 않는 방.",
 tip: "먼저 생각해 보자. 게임에서 배운 것 가운데, 현실로 가지고 나온 것이 있는가?",
 sent: T(27).sent, kor: T(27).kor,
 bank: [
  ["inaccessible", "①", "접근할 수 없는"],
  ["instill", "②", "심어 주다"],
  ["stereotypical", "③", "전형적인"],
  ["fulfilled", "④", "충만한"],
  ["juncture", "⑦", "시점, 국면"],
  ["endeavor", "⑩", "노력, 활동"]
 ],
 defs: [
  ["inaccessible", "not able to be reached or entered"],
  ["instill", "to put a feeling into someone slowly"],
  ["stereotypical", "matching a fixed idea about a group"],
  ["fulfilled", "feeling that your life has meaning"],
  ["juncture", "a particular point in a course of events"],
  ["endeavor", "an effort made toward a goal"]
 ],
 defOrder: [3, 0, 5, 1, 4, 2],
 flow: [
  ["As a child", "Games let him reach what the real world could not", null],
  ["Not withdrawal", "He wanted to go, to do more, to feel more (  ①  )", "fulfilled"],
  ["The image", "Like the children of (  ②  ), he came back changed", "Narnia"],
  ["Now", "He builds virtual worlds for a (  ③  )", "living"],
  ["The claim", "Their value reaches far beyond (  ④  )", "entertainment"]
 ],
 flowBogi: "fulfilled · Narnia · living · entertainment · money · escape",
 para: [
  ["① things that were inaccessible in the real world", "Things he could not ______ in real life.", "reach"],
  ["② instilled in me a sense of wonder", "They ______ wonder into him.", "planted"],
  ["⑤ I would return from my gaming sessions", "He came back a ______ person.", "changed"],
  ["⑦ at this crucial juncture", "Right at this ______ moment.", "key"],
  ["⑩ immense value to countless other fields", "Its worth reaches ______ more fields.", "many"]
 ],
 paraBogi: "reach · planted · changed · key · many · leave · pulled · few",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How to Build a Virtual Training Room",
    "A Wardrobe Worth Walking Through",
    "Games Pull Players Away from the World",
    "The Life of C. S. Lewis",
    "A Beginner's Guide to Game Design"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "디지털 게임은 필자가 현실에서 접할 수 없던 것을 배우고 경험하게 해 주었다.",
    "필자의 경험은 세상에서 물러나려는 게이머의 전형적인 이미지와 정반대였다.",
    "필자는 어릴 때 차원 간 입구를 찾아 수많은 옷장을 직접 조사했다.",
    "필자는 가상 세계의 가치가 오락과 현실 도피에 한정된다고 본다.",
    "실제 군대를 위한 가상 훈련 환경을 만든 경험이 그의 확신을 굳혔다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 가상 세계의 가치를 확신하면서도 조건을 다는 부분이 무엇인지 우리말 한 문장으로 써 보세요.",
   ans: "이러한 세계가 개인과 사회에 만들어 낼 수 있는 가치를 분명히 이해한 위에 미래 계획의 근거를 세우는 시간을 지금 이 중요한 시점에 내야 한다는 조건이다."
  }
 ],
 fl: {
  model: {
   n: "③",
   toks: [
    ["My experience with them", "s"], ["was,", "v"], ["in fact,", "m"],
    ["the opposite of the stereotypical image of a gamer", null], ["who", "c"], ["wants", "v2"],
    ["to withdraw from the world.", null]
   ],
   ko: "그것들에 대한 나의 경험은 사실 세상에서 물러나고 싶어 하는 게이머라는 전형적인 이미지와 정반대였다."
  },
  drill: [
   {
    n: "②",
    en: "These games instilled in me a sense of wonder and exploration.",
    ans: "S These games · △V instilled · M in me · O a sense of wonder and exploration",
    ko: "이 게임들은 내 안에 경이로움과 탐험의 감각을 심어 주었다."
   },
   {
    n: "⑤",
    en: "Often, I would return from my gaming sessions feeling transformed.",
    ans: "M Often · S I · △V would return · M from my gaming sessions · M feeling transformed",
    ko: "흔히 나는 게임을 마치고 변화된 느낌으로 돌아오곤 했다."
   },
   {
    n: "⑨",
    en: "One of the greatest surprises of my career has been the incredible importance of simulated virtual worlds to the future of military planning and strategy.",
    ans: "S One of the greatest surprises of my career · △V has been · C the incredible importance of simulated virtual worlds to the future of military planning and strategy",
    ko: "내 경력에서 가장 놀라웠던 일 가운데 하나는 모의 가상 세계가 군사 계획과 전략의 미래에 지니는 엄청난 중요성이었다."
   }
  ]
 },
 syn: [
  {
   n: "⑥",
   name: "so much so that ~",
   q: "…return with fresh understandings and new perspectives — «so much so that, as a kid, I personally investigated countless wardrobes»…",
   d: "앞의 말이 얼마나 심했는지를 덧붙인다. ‘너무 그러해서 ~할 정도였다’로 읽는다.",
   k: "너무 그러해서 어릴 적 나는 수많은 옷장을 직접 조사할 정도였다"
  },
  {
   n: "⑦",
   name: "접속사 now that ~",
   q: "«Now that I am lucky enough to build virtual worlds for a living», I am more convinced than ever…",
   d: "‘이제 ~하므로’라는 뜻으로 이유를 나타낸다. <b>that</b>은 생략하기도 한다.",
   k: "이제 가상 세계를 만드는 일로 먹고살 만큼 운이 좋으므로"
  }
 ],
 synd: [
  { u: "구문 1", en: "The room felt real, so much so that I forgot the door.", k: "그 방은 너무 실감이 나서 나는 문을 잊을 정도였다." },
  { u: "구문 2", en: "Now that the tools are cheap, anyone can build a world.", k: "이제 도구가 저렴하므로 누구나 하나의 세계를 지을 수 있다." },
  { u: "구문 1 + 2", en: "Now that training is simulated, mistakes cost nothing, so much so that trainees try more.", k: "이제 훈련이 모의로 이루어지므로 실수에 대가가 없고, 그래서 훈련생들이 더 많이 시도할 정도다." }
 ],
 why: [
  ["훈련 환경을 만드는 방법은 글의 초점이 아니다"],
  ["정답"],
  ["글은 자신의 경험이 도피와 정반대였다고 말한다 — 정반대다"],
  ["작가의 생애는 글에 나오지 않는다"],
  ["게임 제작법은 글에서 다루지 않는다"]
 ],
 src: [["①"], ["③"], ["⑥"], ["⑧과 어긋남 — 그 가치는 오락이나 현실 도피에 국한되지 않는다"], ["⑩"]],
 kb: {
  title: "안전하게 실패하는 방",
  lead: "모의 훈련은 무엇을 대신하는가",
  items: [
   ["옷장 이야기", "C. S. 루이스의 『사자와 마녀와 옷장』(1950)에서 아이들은 옷장을 지나 나니아로 들어간다. 다녀온 뒤 달라져 돌아온다는 구조가 이 글의 비유로 쓰였다."],
   ["비행 시뮬레이터", "1929년 Edwin Link 가 만든 Link Trainer 는 계기만 보고 비행하는 훈련을 지상에서 하게 했다. 추락해도 아무도 다치지 않는 훈련이 가능해진 첫 장치로 꼽힌다."],
   ["의료 시뮬레이션", "환자 마네킹과 가상 수술 장비를 쓰는 훈련은 드문 응급 상황을 반복해 겪게 한다. 실제 환자에게 처음 시도하지 않아도 되는 것이 핵심이다."]
  ],
  ask: "여러분이 ‘실패해도 괜찮은 곳’에서 익힌 것 가운데, 실제 상황에서 도움이 된 것은 무엇인가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 28 ───────────────────────────── */
{
 no: "28", key: "wellbeing", accent: "#3E7F6B", tint: "#E6F2EE", deep: "#245448",
 en: "The Relationship Between Digital Media Use and Well-Being",
 ko: "얼마나가 아니라 무엇 대신에",
 goal: "디지털 미디어 사용이 행복에 미치는 영향을 두 연구의 결과를 근거로 정리해 설명할 수 있다.",
 fig: "Figure 1  같은 두 시간, 다른 두 가지 일.",
 tip: "먼저 생각해 보자. 화면을 본 두 시간이 늘 같은 두 시간일까?",
 sent: T(28).sent, kor: T(28).kor,
 bank: [
  ["variable", "①", "변수"],
  ["facilitator", "③", "촉진제"],
  ["detrimental", "③", "해로운"],
  ["ascribe", "④", "~의 탓으로 돌리다"],
  ["skewed", "⑥", "왜곡된"],
  ["operationalize", "⑦", "측정할 수 있게 정의하다"]
 ],
 defs: [
  ["variable", "a thing that can change in a study"],
  ["facilitator", "something that helps a process along"],
  ["detrimental", "causing harm or damage to something"],
  ["ascribe", "to say what caused something"],
  ["skewed", "leaning to one side, not balanced"],
  ["operationalize", "to define a term so it can be measured"]
 ],
 defOrder: [4, 1, 5, 0, 3, 2],
 flow: [
  ["The finding", "Results are mixed; the purpose of use matters", null],
  ["When it helps", "Media used to support real (  ①  )", "relationships"],
  ["When it hurts", "Networks only (  ②  ) consumed and browsed", "passively"],
  ["Large data", "More time on media meant (  ③  ) well-being", "lower"],
  ["The surprise", "Light users scored higher than (  ④  )", "nonusers"]
 ],
 flowBogi: "relationships · passively · lower · nonusers · higher · actively",
 para: [
  ["① depends on a variety of variables", "The effect ______ on many conditions.", "rests"],
  ["③ had a detrimental effect on well-being", "Passive use ______ well-being.", "harmed"],
  ["⑤ the time invested in browsing was lost", "Browsing time was ______ from real talk.", "taken"],
  ["⑥ the positively skewed social media content", "Feeds show a life bent toward the ______.", "bright"],
  ["⑨ a detrimental consequence of heavy digital", "Heavy use carries a ______ cost.", "real"]
 ],
 paraBogi: "rests · harmed · taken · bright · real · stands · helped · dark",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How a Meta-Analysis Is Carried Out",
    "Two Hours Are Not Always the Same Two Hours",
    "Any Use of Digital Media Lowers Well-Being",
    "How to Take a Better Photo for a Post",
    "The History of Social Networks"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "디지털 미디어가 행복에 미치는 영향은 사용 목적 같은 여러 변수에 달려 있다.",
    "중요한 관계를 위한 상호작용의 촉진제로 쓰일 때는 행복이 향상되었다.",
    "긍정적 효과는 게시물에 좋은 반응을 받을 때의 행복감·자존감 증가로 설명되었다.",
    "하루 다섯 시간이 넘는 사용은 가장 높은 행복 수준과 연관되었다.",
    "하루 한 시간 미만의 가벼운 사용자가 비사용자보다도 높은 행복을 보고했다."
   ], ans: 4
  },
  {
   t: "write", q: "같은 시간을 써도 행복에 미치는 영향이 갈리는 까닭을 우리말 한 문장으로 써 보세요.",
   ans: "중요한 관계를 위한 상호작용의 촉진제로 쓰였는지, 아니면 수동적으로 소비하고 훑어보는 데만 쓰였는지에 따라 효과가 갈리기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "③",
   toks: [
    ["Digital communication media", "s"], ["was found", "v"], ["to enhance well-being", null],
    ["when used as a facilitator for social interactions regarding significant relationships", "m"],
    ["but", "c"], ["had", "v"], ["a detrimental effect on well-being", null], ["when", "c"],
    ["social media networks", "s2"], ["were only passively consumed and browsed through.", "v2"]
   ],
   ko: "디지털 소통 매체는 중요한 관계에 관한 사회적 상호작용의 촉진제로 쓰일 때는 행복을 높이는 것으로 나타났지만, 소셜 미디어 연결망이 수동적으로 소비되고 훑어보는 데만 쓰일 때는 행복에 해로운 영향을 미쳤다."
  },
  drill: [
   {
    n: "⑤",
    en: "The negative effects were interpreted through the fact that the time invested in browsing was lost to actually engage with important others.",
    ans: "S The negative effects · △V were interpreted · M through the fact · [that] S′ the time invested in browsing · △V′ was lost · M to actually engage with important others",
    ko: "부정적 효과는 훑어보는 데 들인 시간이 중요한 타인과 실제로 교류할 시간을 앗아 간다는 사실로 해석되었다."
   },
   {
    n: "⑧",
    en: "The overall result across the sample indicated that more time on digital media was associated with lower well-being.",
    ans: "S The overall result across the sample · △V indicated · [that] S′ more time on digital media · △V′ was associated · M with lower well-being",
    ko: "표본 전체의 결과는 디지털 미디어 사용 시간이 길수록 행복 수준이 낮은 것과 연관됨을 보여 주었다."
   },
   {
    n: "⑩",
    en: "Interestingly, the light users with less than one hour per day reported the highest levels of well-being, even higher than nonusers.",
    ans: "M Interestingly · S the light users with less than one hour per day · △V reported · O the highest levels of well-being · M even higher than nonusers",
    ko: "흥미롭게도 하루 한 시간 미만을 쓰는 가벼운 사용자가 가장 높은 행복 수준을 보고했고, 이는 비사용자보다도 높았다."
   }
  ]
 },
 syn: [
  {
   n: "③",
   name: "접속사 뒤의 분사구문 (주어 + be 생략)",
   q: "Digital communication media was found to enhance well-being «when used as a facilitator for social interactions»…",
   d: "<b>when/while/if</b> 뒤에서 <b>주어와 be동사</b>가 생략되고 분사만 남는다. 생략된 주어는 주절의 주어와 같다.",
   k: "촉진제로 쓰일 때는"
  },
  {
   n: "⑨",
   name: "분사구문  thereby -ing",
   q: "…, «thereby indicating a detrimental consequence» of heavy digital media use.",
   d: "앞 절의 결과를 이어 붙인다. ‘그리하여 ~하게 된다, 그럼으로써 ~을 보여 준다’로 읽는다.",
   k: "그럼으로써 해로운 결과를 보여 준다"
  }
 ],
 synd: [
  { u: "구문 1", en: "When asked about screen time, most people guess too low.", k: "화면 사용 시간을 질문받으면 대부분은 너무 낮게 짐작한다." },
  { u: "구문 2", en: "He cut his app use in half, thereby freeing two hours a day.", k: "그는 앱 사용을 절반으로 줄였고, 그럼으로써 하루 두 시간을 벌었다." },
  { u: "구문 1 + 2", en: "When used with care, the app saves time, thereby lowering stress.", k: "주의해서 쓰면 그 앱은 시간을 아껴 주고, 그럼으로써 스트레스를 낮춘다." }
 ],
 why: [
  ["연구 방법 자체는 글의 초점이 아니다"],
  ["정답"],
  ["글은 능동적으로 쓰면 행복이 높아진다고 말한다 — 정반대다"],
  ["사진 찍는 방법은 글에 나오지 않는다"],
  ["소셜 네트워크의 역사는 글에서 다루지 않는다"]
 ],
 src: [["①"], ["③"], ["④"], ["⑨와 어긋남 — 가장 낮은 행복 수준과 연관되었다"], ["⑩"]],
 kb: {
  title: "숫자 하나로는 모자란다",
  lead: "‘몇 시간’이 놓치는 것",
  items: [
   ["능동과 수동", "같은 소셜 미디어라도 글을 쓰고 답글을 주고받는 능동적 사용과, 남의 게시물만 훑어보는 수동적 사용은 결과가 다르게 나타난다는 연구가 여럿이다. 시간의 길이보다 무엇을 했는지가 갈림길이 된다."],
   ["메타 분석", "meta-analysis 는 같은 주제를 다룬 여러 연구의 결과를 모아 통계적으로 합치는 방법이다. 개별 연구의 표본이 작아 엇갈리던 결론을 한 단계 위에서 다시 보는 셈이다."],
   ["상관과 인과", "‘오래 쓸수록 덜 행복하다’는 상관관계는 방향을 알려 주지 않는다. 오래 써서 덜 행복해진 것인지, 덜 행복해서 오래 쓴 것인지는 이 자료만으로 가릴 수 없다."]
  ],
  ask: "여러분이 화면 앞에서 보낸 어제의 시간은, 무엇 대신에 쓴 시간이었는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 29 ───────────────────────────── */
{
 no: "29", key: "aiwinter", accent: "#7E5AA0", tint: "#F0EAF7", deep: "#50326C",
 en: "The Early Years of AI Researches",
 ko: "쉬운 줄 알았던 것이 가장 어려웠다",
 goal: "초기 AI의 성과와 한계를 사례로 정리하고 ‘AI 겨울’에 이른 과정을 설명할 수 있다.",
 fig: "Figure 1  쉬워 보인 일과 어려웠던 일이 뒤바뀐 자리.",
 tip: "먼저 생각해 보자. 사람에게 쉬운 일이 기계에게도 쉬울까?",
 sent: T(29).sent, kor: T(29).kor,
 bank: [
  ["emulate", "②", "모방하다"],
  ["breakthrough", "③", "돌파구"],
  ["albeit", "④", "비록 ~이지만"],
  ["autonomously", "⑧", "스스로"],
  ["constrained", "⑩", "제한된"],
  ["wane", "⑫", "약해지다"]
 ],
 defs: [
  ["emulate", "to copy the way something works"],
  ["breakthrough", "a sudden step forward in progress"],
  ["albeit", "although it is only in this way"],
  ["autonomously", "acting without outside control"],
  ["constrained", "kept inside narrow limits"],
  ["wane", "to grow smaller or weaker"]
 ],
 defOrder: [5, 2, 0, 4, 1, 3],
 flow: [
  ["Early wins", "Logic Theorist proved theorems like a human", null],
  ["ELIZA", "It answered user input and mimicked (  ①  )", "conversation"],
  ["Checkers", "Samuel's program learned from its own (  ②  )", "experiences"],
  ["The wall", "Common sense and real-world (  ③  ) defeated it", "complexity"],
  ["The winter", "Funding dried up and optimism (  ④  )", "waned"]
 ],
 flowBogi: "conversation · experiences · complexity · waned · grew · silence",
 para: [
  ["② by emulating human logical reasoning", "It ______ the way people reason.", "copied"],
  ["④ albeit in a limited fashion", "Though only in a ______ way.", "narrow"],
  ["⑧ improve their performance autonomously", "Machines could get better on their ______.", "own"],
  ["⑩ effective in constrained environments", "They worked where the rules were ______.", "clear"],
  ["⑫ funding for AI research dried up", "The money for AI research ______.", "stopped"]
 ],
 paraBogi: "copied · narrow · own · clear · stopped · ignored · wide · grew",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How ELIZA Answered Its Users",
    "The Easy Problems That Turned Out Hard",
    "Early AI Quickly Matched Human Intelligence",
    "A Guide to Playing Checkers",
    "How Research Grants Are Reviewed"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "Logic Theorist 는 인간의 논리적 추론을 모방해 수학 정리를 증명할 수 있었다.",
    "ELIZA 는 1965년 Joseph Weizenbaum 이 개발한 초기 자연어 처리 프로그램이다.",
    "1956년 Arthur Samuel 의 체커 프로그램은 경험에서 학습할 수 있었다.",
    "초기 AI 시스템은 상식적 추론이 필요한 작업에서 특히 뛰어난 성과를 냈다.",
    "‘AI 겨울’은 1970년대와 1980년대 초 연구비가 줄고 낙관론이 약해진 시기다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 ‘AI 겨울’에 이른 까닭으로 든 것을 우리말 한 문장으로 써 보세요.",
   ans: "초기의 약속이 지켜지지 않았고 기존 기술의 한계가 드러나면서 인간 같은 지능이 아직 멀었다는 것이 분명해졌기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "⑧",
   toks: [
    ["This", "s"], ["was", "v"], ["a major advancement", null], ["at the time", "m"],
    ["because", "c"], ["it", "s2"], ["showed", "v2"], ["that", "c"], ["machines", "s2"],
    ["could be programmed", "v2"],
    ["to improve their performance autonomously, without human intervention.", null]
   ],
   ko: "이것은 당시 큰 진전이었는데, 기계가 사람의 개입 없이 스스로 성능을 높이도록 프로그램될 수 있음을 보여 주었기 때문이다."
  },
  drill: [
   {
    n: "②",
    en: "Researchers developed programs like the Logic Theorist, created by Allen Newell and Herbert A. Simon, which could prove mathematical theorems by emulating human logical reasoning.",
    ans: "S Researchers · △V developed · O programs like the Logic Theorist · M created by Allen Newell and Herbert A. Simon · [which] △V′ could prove · O mathematical theorems · M by emulating human logical reasoning",
    ko: "연구자들은 Allen Newell 과 Herbert A. Simon 이 만든 Logic Theorist 같은 프로그램을 개발했는데, 그것은 인간의 논리적 추론을 모방해 수학 정리를 증명할 수 있었다."
   },
   {
    n: "⑩",
    en: "Early AI systems were effective in constrained environments with well-defined rules, like chess or theorem proving, but they struggled with tasks that required common sense reasoning or dealing with the complexities of the real world.",
    ans: "S Early AI systems · △V were · C effective in constrained environments with well-defined rules · [but] S they · △V struggled · M with tasks that required common sense reasoning or dealing with the complexities of the real world",
    ko: "초기 AI 시스템은 체스나 정리 증명처럼 규칙이 분명한 제한된 환경에서는 효과적이었지만, 상식적 추론이나 현실의 복잡함을 다루는 일에는 어려움을 겪었다."
   },
   {
    n: "⑬",
    en: "The early promises of AI had not been fulfilled, and the limitations of existing technologies made it clear that human-like intelligence was still far off.",
    ans: "S The early promises of AI · △V had not been fulfilled · and S the limitations of existing technologies · △V made · O it clear · [that] S′ human-like intelligence · △V′ was · C still far off",
    ko: "AI 의 초기 약속은 지켜지지 않았고, 기존 기술의 한계는 인간 같은 지능이 아직 멀었음을 분명히 했다."
   }
  ]
 },
 syn: [
  {
   n: "④",
   name: "접속사 albeit",
   q: "ELIZA simulated a conversation … in a way that mimicked human conversation, «albeit in a limited fashion».",
   d: "<b>although</b>의 짧은 형태로, 뒤에 절 대신 <b>구</b>가 온다. ‘비록 ~이긴 하지만’으로 읽는다.",
   k: "비록 제한된 방식이긴 했지만"
  },
  {
   n: "⑫",
   name: "선행사를 품은 관계대명사 what",
   q: "These challenges led to «what is now known as the “AI winter,”» a period during the 1970s and early 1980s…",
   d: "<b>what</b>은 그 자체로 명사절을 이끈다. 여기서는 전치사 <b>to</b>의 목적어가 된다.",
   k: "오늘날 ‘AI 겨울’이라 불리는 것"
  }
 ],
 synd: [
  { u: "구문 1", en: "The model answered every question, albeit slowly.", k: "그 모형은 비록 느리긴 했지만 모든 질문에 답했다." },
  { u: "구문 2", en: "They wrote down what the machine could not do.", k: "그들은 그 기계가 할 수 없는 것을 적어 두었다." },
  { u: "구문 1 + 2", en: "He listed what the program solved, albeit within narrow limits.", k: "그는 비록 좁은 한계 안에서이긴 했지만 그 프로그램이 푼 것을 나열했다." }
 ],
 why: [
  ["ELIZA 한 사례만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 인간 지능 복제가 예상보다 훨씬 어려웠다고 말한다 — 정반대다"],
  ["체커 두는 법은 글에 나오지 않는다"],
  ["연구비 심사 절차는 글에서 다루지 않는다"]
 ],
 src: [["②"], ["③"], ["⑦"], ["⑩과 어긋남 — 상식적 추론이 필요한 작업에서는 어려움을 겪었다"], ["⑫"]],
 kb: {
  title: "모라벡의 역설",
  lead: "왜 쉬운 일이 더 어려웠나",
  items: [
   ["다트머스 회의", "1956년 여름 다트머스 대학에서 열린 워크숍에서 ‘인공지능(artificial intelligence)’이라는 말이 처음 쓰였다. John McCarthy 가 제안한 이름이었고, 이 회의가 분야의 출발점으로 꼽힌다."],
   ["ELIZA 효과", "ELIZA 는 상대의 말을 되받아 질문으로 되돌리는 간단한 규칙으로 움직였다. 그런데도 사용자들이 이해받는다고 느낀 현상을 ELIZA 효과라 부른다. Weizenbaum 자신이 이 반응에 놀랐다."],
   ["모라벡의 역설", "Hans Moravec 등은 1980년대에, 추론과 계산 같은 ‘높은’ 능력은 기계에 쉽고 지각과 운동 같은 ‘낮은’ 능력은 매우 어렵다고 지적했다. 오래 진화한 능력일수록 무의식적이어서 옮겨 적기 어렵다는 설명이다."]
  ],
  ask: "여러분이 아무 생각 없이 해내는 일 하나를 골라, 그 순서를 글로 적어 볼 수 있는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 30 ───────────────────────────── */
{
 no: "30", key: "unsaid", accent: "#C05A80", tint: "#FAE9EF", deep: "#8A2F52",
 en: "Language and Communication",
 ko: "주고도 잃지 않는 나눔",
 goal: "필자가 말하는 의사소통의 본질과 그것이 사회적인 일인 까닭을 설명할 수 있다.",
 fig: "Figure 1  문장 하나와 그 아래 깔린 합의 — 함께 쓰기로 한 규칙.",
 tip: "먼저 생각해 보자. 내가 아는 것을 남에게 말해 주면, 나에게서 그것이 줄어드는가?",
 sent: T(30).sent, kor: T(30).kor,
 bank: [
  ["regulate", "②", "조절하다"],
  ["prized", "④", "소중한"],
  ["repository", "⑤", "저장소"],
  ["exploit", "⑥", "활용하다"],
  ["superstition", "⑧", "미신"],
  ["necessitate", "⑯", "필요로 하다"]
 ],
 defs: [
  ["regulate", "to control the way something works"],
  ["prized", "valued very highly by its owner"],
  ["repository", "a place where things are kept safe"],
  ["exploit", "to make full use of something"],
  ["superstition", "a belief not based on reason or fact"],
  ["necessitate", "to make something necessary"]
 ],
 defOrder: [3, 5, 1, 0, 4, 2],
 flow: [
  ["The tool", "Language has served communication for centuries", null],
  ["Its worth", "It is a repository of wisdom and a (  ①  ) on the future", "telescope"],
  ["The limit", "Its use is still not free of ignorance and (  ②  )", "prejudice"],
  ["Its root", "The Latin term behind it means to (  ③  )", "share"],
  ["The point", "The receiver gains while the source loses (  ④  )", "nothing"]
 ],
 flowBogi: "telescope · prejudice · share · nothing · everything · silence",
 para: [
  ["② to regulate his social behavior", "It lets him ______ how he acts with others.", "control"],
  ["④ one of the most prized possessions", "It is among our most ______ belongings.", "valued"],
  ["⑧ not free from ignorance, prejudice", "It still carries ______ and old fears.", "bias"],
  ["⑪ commonly owned, accepted, and recognized", "The system is ______ by the whole group.", "shared"],
  ["⑮ the receiver gains, while the source does not lose", "One side gains and the other loses ______.", "nothing"]
 ],
 paraBogi: "control · valued · bias · shared · nothing · ignore · cheap · alone",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "Where the Word 'Communication' Comes From",
    "A Sharing in Which No One Loses",
    "Language Has Freed Us from All Prejudice",
    "How Latin Became a Dead Language",
    "A Guide to Public Speaking"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "언어는 인간이 환경과 상호작용하고 사회적 행동을 조절할 수 있게 해 주었다.",
    "의사소통 수단은 여러 가지가 있지만 언어가 가장 널리 쓰이는 도구이다.",
    "‘communication’은 ‘공유하다’를 뜻하는 라틴어 낱말에서 유래했다.",
    "의사소통은 상징을 통해 한 사람이 다른 사람에게 의미를 전달하는 것만을 뜻한다.",
    "의사소통은 수신자가 얻지만 발신자는 잃지 않는 특별한 종류의 나눔이다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 의사소통을 본질적으로 사회적인 일이라고 본 근거를 우리말 한 문장으로 써 보세요.",
   ans: "의사소통 체계가 공동체 구성원에게 공유되고 받아들여지고 인정된 것이어야 하며, 수신자가 얻어도 발신자는 잃지 않는 나눔이기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "⑮",
   toks: [
    ["But", "c"], ["it", "s"], ["is", "v"], ["a special kind of sharing,", null], ["where", "c"],
    ["the receiver", "s2"], ["gains,", "v2"], ["while", "c"], ["the source", "s2"],
    ["does not lose", "v2"], ["by giving.", "m"]
   ],
   ko: "그러나 그것은 특별한 종류의 나눔인데, 그 안에서 수신자는 얻지만 발신자는 준다고 해서 잃지 않는다."
  },
  drill: [
   {
    n: "⑤",
    en: "It acts as a repository of wisdom, a propeller for the advancement of knowledge, and a telescope to view the vision of the future.",
    ans: "S It · △V acts · M as a repository of wisdom, a propeller for the advancement of knowledge, and a telescope to view the vision of the future",
    ko: "그것은 지혜의 저장소이자 지식의 발전을 미는 추진기이며 미래의 상을 내다보는 망원경 노릇을 한다."
   },
   {
    n: "⑨",
    en: "The word “communication” is derived from the Latin term communicate or communion, both of which mean to share.",
    ans: "S The word “communication” · △V is derived · M from the Latin term communicate or communion · [both of which] △V′ mean · O to share",
    ko: "‘communication’이라는 낱말은 라틴어 communicate 나 communion 에서 왔는데, 둘 다 ‘나누다’를 뜻한다."
   },
   {
    n: "⑬",
    en: "The essence of communication is getting the receiver and the sender tuned together for a particular message.",
    ans: "S The essence of communication · △V is · C getting the receiver and the sender tuned together for a particular message",
    ko: "의사소통의 본질은 특정한 메시지를 위해 수신자와 발신자를 함께 맞추어 놓는 것이다."
   }
  ]
 },
 syn: [
  {
   n: "⑨",
   name: "전치사 + 관계대명사  both of which",
   q: "…the Latin term communicate or communion, «both of which mean to share».",
   d: "앞의 두 낱말을 함께 받아 ‘그 둘 다는’이라는 뜻으로 뒤 절의 주어가 된다.",
   k: "그 둘 다 ‘나누다’를 뜻한다"
  },
  {
   n: "⑬",
   name: "get + 목적어 + 과거분사",
   q: "The essence of communication is «getting the receiver and the sender tuned together» for a particular message.",
   d: "<b>get + 목적어 + p.p.</b>는 ‘~을 …된 상태로 만들다’이다. 목적어와 분사 사이가 수동 관계다.",
   k: "수신자와 발신자를 함께 맞추어 놓는 것"
  }
 ],
 synd: [
  { u: "구문 1", en: "He read two letters, both of which came from the same town.", k: "그는 편지 두 통을 읽었는데, 둘 다 같은 마을에서 온 것이었다." },
  { u: "구문 2", en: "She got the message understood before the meeting ended.", k: "그녀는 회의가 끝나기 전에 그 메시지가 이해되게 만들었다." },
  { u: "구문 1 + 2", en: "They got two versions checked, both of which said the same thing.", k: "그들은 두 판본을 확인하게 했는데, 둘 다 같은 내용을 말하고 있었다." }
 ],
 why: [
  ["문장 ⑨의 어원 대목만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 언어 사용이 아직 편견에서 자유롭지 않다고 말한다 — 정반대다"],
  ["라틴어의 역사는 글에 나오지 않는다"],
  ["연설하는 방법은 글에서 다루지 않는다"]
 ],
 src: [["②"], ["③"], ["⑨"], ["⑩과 어긋남 — 단순한 의미 전달만을 뜻하지 않는다"], ["⑮"]],
 kb: {
  title: "나눠도 줄지 않는 것",
  lead: "정보라는 이상한 재화",
  items: [
   ["비경합재", "빵은 내가 먹으면 남에게 돌아갈 몫이 줄지만, 노래나 공식은 남이 알아도 내 몫이 줄지 않는다. 경제학에서는 이런 성질을 비경합성(non-rivalry)이라 부른다."],
   ["제퍼슨의 촛불", "토머스 제퍼슨은 1813년 편지에서, 자기 초로 남의 초에 불을 붙여도 자기 빛이 줄지 않듯 생각도 그렇다고 썼다. 지식 공유를 설명하는 오래된 비유다."],
   ["섀넌의 통신 모형", "Claude Shannon 은 1948년 논문에서 정보원·부호기·잡음·복호기·수신자로 통신을 그렸다. 뜻이 아니라 전달의 성공률을 다룬 모형이었지만, 오늘날 통신의 기본 틀이 되었다."]
  ],
  ask: "여러분이 남에게 알려 주고도 잃지 않은 것은 무엇이었는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
}

 ]
};
