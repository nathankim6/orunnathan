/* Unit 3 · Social Matters — 원문 Theme 11–15 */
const R = require("../src/orig/all.json");
const T = n => R[n - 1];

module.exports = {
 no: 3,
 field: "Social Matters",
 ko: "사회 문제",
 tagline: "단순화의 값 — 모형·농담·자료가 덜어 낸 것들",
 next: { en: "Medicine & Health", ko: "몸을 다루는 지식이 어떻게 쌓였는지 읽습니다", words: "213–265 words" },
 lessons: [

/* ───────────────────────────── 11 ───────────────────────────── */
{
 no: "11", key: "model", accent: "#3E6FA8", tint: "#E5EDF7", deep: "#25476E",
 en: "Understanding Economic Models",
 ko: "틀린 지도가 더 쓸모 있을 때",
 goal: "경제학자가 모형을 세우는 이유와 모형이 지니는 한계를 근거를 들어 설명할 수 있다.",
 fig: "Figure 1  노선도와 실제 거리 — 단순화한 모형이 남긴 것과 버린 것.",
 tip: "먼저 생각해 보자. 지하철 노선도는 실제 거리와 다르다. 그런데도 왜 더 쓸모가 있을까?",
 sent: T(11).sent, kor: T(11).kor,
 bank: [
  ["observable", "①", "관찰할 수 있는"],
  ["tractable", "②", "다루기 쉬운"],
  ["approximation", "④", "근사치"],
  ["misleading", "⑧", "오해를 일으키는"],
  ["employ", "⑨", "사용하다"],
  ["discipline", "⑩", "학문 분야"]
 ],
 defs: [
  ["observable", "able to be seen or measured"],
  ["tractable", "easy to handle or work with"],
  ["approximation", "a value close to but not exactly right"],
  ["misleading", "giving a wrong idea without saying a lie"],
  ["employ", "to make use of something for a purpose"],
  ["discipline", "a branch of study with its own methods"]
 ],
 defOrder: [1, 4, 0, 5, 2, 3],
 flow: [
  ["The problem", "Real economic relationships are complex and hard to see", null],
  ["The move", "Economists build a (  ①  ) version of reality", "simplified"],
  ["The hope", "They hope the model is a good (  ②  ) of the truth", "approximation"],
  ["The warning", "Often a poor model gives (  ③  ) conclusions", "misleading"],
  ["The field", "Finding good models is called (  ④  )", "econometrics"]
 ],
 flowBogi: "simplified · approximation · misleading · econometrics · exact · poetry",
 para: [
  ["① may not even be fully observable", "Some of it cannot be ______ at all.", "seen"],
  ["② simple enough to be mathematically tractable", "The model must stay easy to ______.", "handle"],
  ["⑤ all models are wrong, but some are useful", "Every model is ______, yet some still help.", "false"],
  ["⑧ may provide misleading conclusions", "A poor model can point us the ______ way.", "wrong"],
  ["⑪ make important predictions and policy decisions", "A good model guides ______ and choices.", "forecasts"]
 ],
 paraBogi: "seen · handle · false · wrong · forecasts · hidden · right · memories",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "George Box and the Year 1976",
    "A Simple Map for a Complex World",
    "Why Economic Models Match Reality Exactly",
    "How to Collect Economic Data",
    "The History of Statistics"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "경제 관계의 현실은 관찰된 자료로 추정하는 것조차 불가능할 수 있다.",
    "모형은 수학적·통계적으로 다룰 수 있을 만큼 단순해야 한다.",
    "George Box는 모든 모형이 틀렸지만 일부는 유용하다고 말했다.",
    "모형이 부정확한 근사치를 나타내는 일은 좀처럼 일어나지 않는다.",
    "계량 경제학은 경제 관계를 모형화하는 통계적·수학적 접근을 포함한다."
   ], ans: 4
  },
  {
   t: "write", q: "경제학자들이 현실을 그대로 다루지 않고 모형을 세우는 이유를 우리말 한 문장으로 써 보세요.",
   ans: "경제 관계의 현실이 매우 복잡하고 완전히 관찰되지도 않아서, 수학적·통계적으로 다룰 수 있을 만큼 단순한 형태로 줄여야 추정이 가능하기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "④",
   toks: [
    ["The model", "s"], ["can be regarded", "v"], ["as an approximation of reality,", "m"], ["and", "c"],
    ["it", "s"], ["is", "v"], ["the hope of the economists", null], ["that", "c"],
    ["their model", "s2"], ["is", "v2"], ["a good approximation of the true relationship.", null]
   ],
   ko: "그 모형은 현실의 근사치로 여겨질 수 있으며, 자기 모형이 참된 관계의 좋은 근사치이기를 바라는 것은 바로 경제학자들이다."
  },
  drill: [
   {
    n: "②",
    en: "Hence, economists build a model — a simplified version of reality — that is simple enough to be mathematically and statistically tractable.",
    ans: "M Hence · S economists · △V build · O a model — a simplified version of reality — · [that] △V′ is · C simple enough to be mathematically and statistically tractable",
    ko: "그러므로 경제학자들은 수학적·통계적으로 다룰 수 있을 만큼 단순한, 현실을 단순화한 모형을 만든다."
   },
   {
    n: "⑨",
    en: "In their training, economists learn how to employ various statistical methods to find a model that is a good approximation of reality.",
    ans: "M In their training · S economists · △V learn · O how to employ various statistical methods · M to find a model that is a good approximation of reality",
    ko: "경제학자들은 훈련 과정에서 현실의 좋은 근사치인 모형을 찾기 위해 다양한 통계 기법을 쓰는 법을 배운다."
   },
   {
    n: "⑪",
    en: "A useful model is hard to get, but it provides interesting information from data and can be used by economists to make important predictions and policy decisions.",
    ans: "S A useful model · △V is · C hard to get · [but] S it · △V provides · O interesting information from data · and △V can be used · M to make important predictions and policy decisions",
    ko: "쓸모 있는 모형은 얻기 어렵지만, 자료에서 흥미로운 정보를 주고 중요한 예측과 정책 결정에 쓰일 수 있다."
   }
  ]
 },
 syn: [
  {
   n: "③",
   name: "계속적 용법의 관계대명사 which",
   q: "The model enables economists to estimate the simplified relationship using the data, «which sheds light on the reality of the relationship».",
   d: "앞의 절 전체를 <b>which</b>가 받아 뒤에서 설명을 덧붙인다. ‘그리고 그것은 ~’으로 이어 읽는다.",
   k: "그리고 그것이 그 관계의 실제 모습을 밝혀 준다"
  },
  {
   n: "④",
   name: "가주어 it — 진주어 that절",
   q: "…, and «it is the hope of the economists that their model is a good approximation» of the true relationship.",
   d: "<b>it</b>은 자리만 채우는 가주어이고, 진짜 주어는 뒤의 <b>that절</b>이다. ‘~라는 것이 …이다’로 읽는다.",
   k: "자기 모형이 좋은 근사치라는 것이 경제학자들의 바람이다"
  }
 ],
 synd: [
  { u: "구문 1", en: "He redrew the graph, which made the trend easier to see.", k: "그는 그래프를 다시 그렸고, 그것이 추세를 더 잘 보이게 했다." },
  { u: "구문 2", en: "It is a common belief that simple models explain more.", k: "단순한 모형이 더 많이 설명한다는 것은 흔한 믿음이다." },
  { u: "구문 1 + 2", en: "It is clear that the model dropped many details, which made it usable.", k: "그 모형이 많은 세부를 버렸다는 것은 분명하고, 그것이 그 모형을 쓸 만하게 만들었다." }
 ],
 why: [
  ["문장 ⑤의 인용 배경만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 모형이 근사치일 뿐이라고 말한다 — 정반대다"],
  ["자료를 모으는 방법은 글에 나오지 않는다"],
  ["통계학의 역사는 글에서 다루지 않는다"]
 ],
 src: [["①"], ["②"], ["⑤"], ["⑧과 어긋남 — 모형이 부정확한 근사치를 나타내는 일이 흔하다"], ["⑩"]],
 kb: {
  title: "지도는 왜 틀려야 쓸모 있나",
  lead: "덜어 낸 만큼 보이는 것이 있다",
  items: [
   ["1933년의 노선도", "런던 지하철 노선도는 Harry Beck이 1933년에 만든 도안이 바탕이다. 실제 거리와 방향을 버리고 선을 수평·수직·45도로만 그렸다. 땅 위의 정확함을 포기하자 갈아타는 순서가 한눈에 들어왔다."],
   ["‘모든 모형은 틀렸다’", "통계학자 George Box가 1976년 논문에서 쓴 문장이다. 그는 여기에 그러니 얼마나 틀려야 쓸모없어지는지를 물어야 한다는 취지의 말을 덧붙였다."],
   ["계량 경제학", "econometrics는 경제 이론을 자료로 검증하는 분야다. 1930년 계량경제학회가 세워졌고, 1969년 첫 노벨 경제학상은 이 분야를 개척한 Ragnar Frisch와 Jan Tinbergen에게 돌아갔다."]
  ],
  ask: "여러분이 매일 쓰는 것 가운데, 일부러 덜어 냈기 때문에 더 쓸모 있어진 것은 무엇인가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 12 ───────────────────────────── */
{
 no: "12", key: "joke", accent: "#C9743A", tint: "#FBEDE1", deep: "#8F4A1B",
 en: "The Language of Jokes",
 ko: "혼자 웃던 것이 함께 웃는 것이 되기까지",
 goal: "웹 2.0 이후 유머가 만들어지고 퍼지는 과정을 단계로 정리해 설명할 수 있다.",
 fig: "Figure 1  농담이 웃음이 되는 순간 — 어긋난 뜻을 머리가 재빨리 고친다.",
 tip: "먼저 생각해 보자. 웃긴 것을 발견하면 왜 곧바로 남에게 보내고 싶어질까?",
 sent: T(12).sent, kor: T(12).kor,
 bank: [
  ["engage with", "①", "~에 참여하다"],
  ["extract", "④", "추출하다"],
  ["compilation", "④", "편집본"],
  ["divorced from", "⑦", "~에서 분리된"],
  ["undoubtedly", "⑧", "의심할 여지 없이"],
  ["collective", "⑪", "집단적인"]
 ],
 defs: [
  ["engage with", "to take an active part in something"],
  ["extract", "to take a part out of a larger whole"],
  ["compilation", "a set of pieces gathered into one work"],
  ["divorced from", "cut off from something it belonged to"],
  ["undoubtedly", "in a way that leaves no room for doubt"],
  ["collective", "shared by all the members of a group"]
 ],
 defOrder: [2, 0, 5, 1, 4, 3],
 flow: [
  ["What changed", "Web 2.0 let people take an active part", null],
  ["What we make", "Anyone can post clips, gifs, or a (  ①  ) of scenes", "compilation"],
  ["The catch", "Such clips are (  ②  ) from where they first appeared", "divorced"],
  ["Step one", "Alone, I find something (  ③  ) online", "funny"],
  ["Step two", "I share it, others like it and (  ④  ) it on", "forward"]
 ],
 flowBogi: "compilation · divorced · funny · forward · script · delete",
 para: [
  ["② make do with witty PowerPoint attachments", "At first we had to ______ with what we had.", "manage"],
  ["③ countless videos uploaded by members of the public", "Ordinary people upload ______ videos.", "numberless"],
  ["⑤ humorous in intent", "Most of it is meant to be ______.", "funny"],
  ["⑦ consumed in a different era", "They are watched in another ______.", "time"],
  ["⑪ create a new form of collective online laughter", "Laughing together online is something ______.", "new"]
 ],
 paraBogi: "manage · numberless · funny · time · new · refuse · few · old",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How to Extract a Scene from a TV Series",
    "From One Smile to a Shared Laugh",
    "Why Online Humour Stays Private",
    "A Short History of PowerPoint",
    "The Rules of Copyright Online"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "웹 2.0의 기술 덕분에 사람들이 인터넷 콘텐츠에 적극적으로 참여할 수 있게 되었다.",
    "누구나 직접 만든 동영상을 제작해 YouTube에 올릴 수 있다.",
    "편집본은 처음 등장했던 맥락에서 분리되어 다른 시대에 소비된다.",
    "Facebook에서 만들어지고 공유되는 것 가운데 유머러스한 것은 드물다.",
    "‘좋아요’를 누른 사람들이 다시 다른 사람에게 메시지를 전달하기도 한다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 말하는 ‘집단적 온라인 웃음’이 만들어지는 두 단계를 우리말 한 문장으로 써 보세요.",
   ans: "먼저 개인이 혼자 웃긴 것을 발견하고, 그다음 그것을 남과 공유해 ‘좋아요’와 재전달이 이어지면서 함께 웃는 형태가 만들어진다."
  }
 ],
 fl: {
  model: {
   n: "①",
   toks: [
    ["It", "s"], ["is", "v"], ["thanks to the technology involved in Web 2.0", null], ["that", "c"],
    ["people", "s2"], ["may now actively engage", "v2"], ["with internet content.", "m"]
   ],
   ko: "사람들이 이제 인터넷 콘텐츠에 적극적으로 참여할 수 있는 것은 바로 웹 2.0에 담긴 기술 덕분이다."
  },
  drill: [
   {
    n: "③",
    en: "For example, YouTube hosts countless videos uploaded by members of the public.",
    ans: "M For example · S YouTube · △V hosts · O countless videos · M uploaded by members of the public",
    ko: "예를 들어 YouTube에는 일반인들이 올린 수많은 동영상이 있다."
   },
   {
    n: "⑥",
    en: "Of course, these compilations beg a number of questions.",
    ans: "M Of course · S these compilations · △V beg · O a number of questions",
    ko: "물론 이러한 편집본들은 여러 가지 질문을 불러일으킨다."
   },
   {
    n: "⑨",
    en: "The pattern seems to be that first I, as an individual, find something funny online that may make me laugh or smile.",
    ans: "S The pattern · △V seems to be · [that] M first · S′ I, as an individual, · △V′ find · O something funny online · [that] △V′ may make · O me laugh or smile",
    ko: "그 양상은 이런 것 같다. 먼저 개인으로서 내가 나를 웃거나 미소 짓게 만들 재미있는 것을 온라인에서 발견한다."
   }
  ]
 },
 syn: [
  {
   n: "⑦",
   name: "상관접속사  not only A but B",
   q: "They are «not only divorced from the contexts in which they first appeared, but they are consumed» in a different era.",
   d: "<b>not only A but B</b>는 ‘A뿐 아니라 B도’이다. A와 B 자리에는 같은 모양이 온다.",
   k: "처음 등장했던 맥락에서 분리되어 있을 뿐 아니라 다른 시대에 소비되기도 한다"
  },
  {
   n: "⑩",
   name: "전치사 + 관계대명사  many of whom",
   q: "…share that same object of amusement with others, «many of whom will display a “like”»…",
   d: "<b>many of whom</b>은 앞의 <b>others</b>를 받아 ‘그들 중 다수는’이라는 뜻으로 뒤 절의 주어가 된다.",
   k: "그들 중 다수는 ‘좋아요’를 누를 것이다"
  }
 ],
 synd: [
  { u: "구문 1", en: "The clip is not only short but also easy to share.", k: "그 영상은 짧을 뿐 아니라 공유하기도 쉽다." },
  { u: "구문 2", en: "She sent it to ten friends, many of whom sent it on again.", k: "그녀는 그것을 친구 열 명에게 보냈고, 그들 중 다수가 다시 전달했다." },
  { u: "구문 1 + 2", en: "The post reached readers, many of whom not only laughed but also replied.", k: "그 게시물은 독자들에게 닿았고, 그들 중 다수는 웃었을 뿐 아니라 답글도 달았다." }
 ],
 why: [
  ["문장 ④의 한 가지 방법만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 웃음이 퍼져 집단적인 것이 된다고 말한다 — 정반대다"],
  ["파워포인트의 역사는 글에 나오지 않는다"],
  ["저작권 규칙은 글에서 다루지 않는다"]
 ],
 src: [["①"], ["④"], ["⑦"], ["⑧과 어긋남 — 만들어지고 공유되는 것 중 상당수가 유머러스하다"], ["⑩"]],
 kb: {
  title: "웃음이 옮겨 다니는 길",
  lead: "혼자 웃던 것은 어떻게 함께 웃는 것이 되었나",
  items: [
   ["웹 2.0이라는 말", "읽기만 하던 웹에서 누구나 올리고 고치는 웹으로의 전환을 가리킨다. Tim O'Reilly가 2004년 같은 이름의 콘퍼런스를 열면서 널리 쓰이기 시작했다."],
   ["밈(meme)이라는 낱말", "리처드 도킨스가 1976년 『The Selfish Gene』에서 문화가 복제되며 퍼지는 단위를 가리켜 만든 말이다. 유전자(gene)를 본떠 지었는데, 오늘날 인터넷에서 퍼지는 이미지·영상을 부르는 이름이 되었다."],
   ["맥락이 사라진 인용", "잘라 낸 장면은 원래 놓여 있던 앞뒤 상황을 잃는다. 같은 대사도 어느 장면 다음에 오느냐에 따라 다르게 읽히므로, 편집본은 새로운 뜻을 얻기도 하고 원래 뜻을 잃기도 한다."]
  ],
  ask: "여러분이 마지막으로 친구에게 보낸 웃긴 영상은, 원래 어디에서 온 것이었는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 13 ───────────────────────────── */
{
 no: "13", key: "data", accent: "#2F8074", tint: "#E2F0ED", deep: "#1B564D",
 en: "Ethical Data Interpretation",
 ko: "자료를 읽는 손에 붙는 책임",
 goal: "소셜 미디어의 데이터 해석에서 제기되는 윤리 문제를 세 갈래로 나누어 설명할 수 있다.",
 fig: "Figure 1  같은 자료, 다르게 그은 선 — 해석에는 언제나 선택이 들어간다.",
 tip: "먼저 생각해 보자. 내가 공짜로 쓰는 앱은 무엇을 대가로 받아 가고 있을까?",
 sent: T(13).sent, kor: T(13).kor,
 bank: [
  ["fraught with", "①", "~로 가득한"],
  ["harvest", "④", "거둬들이다"],
  ["consensual", "⑤", "동의에 기반한"],
  ["perpetuate", "⑧", "지속시키다"],
  ["autonomy", "⑩", "자율성"],
  ["safeguard", "⑬", "보호하다"]
 ],
 defs: [
  ["fraught with", "full of something unwanted or risky"],
  ["harvest", "to gather something in large amounts"],
  ["consensual", "agreed to by everyone taking part"],
  ["perpetuate", "to make something continue for long"],
  ["autonomy", "the right to decide things for yourself"],
  ["safeguard", "to keep something from being harmed"]
 ],
 defOrder: [3, 5, 1, 0, 4, 2],
 flow: [
  ["The field", "Reading social media data raises ethical questions", null],
  ["Issue 1", "Users give personal data without (  ①  ) it", "knowing"],
  ["Issue 2", "Algorithms can amplify the (  ②  ) already in the data", "bias"],
  ["Issue 3", "Targeted content raises questions about (  ③  )", "manipulation"],
  ["The balance", "Use data for insight, yet (  ④  ) users' rights", "protect"]
 ],
 flowBogi: "knowing · bias · manipulation · protect · profit · delete",
 para: [
  ["① fraught with ethical considerations", "The field is ______ of ethical problems.", "full"],
  ["④ unknowingly provide personal information", "People hand over data without ______ it.", "noticing"],
  ["⑧ amplify biases present in the data", "The system makes an existing bias ______.", "louder"],
  ["⑩ raises questions about manipulation and autonomy", "Steering users puts their ______ at risk.", "freedom"],
  ["⑬ safeguarding the rights and interests of users", "Users' rights must be ______ at the same time.", "protected"]
 ],
 paraBogi: "full · noticing · louder · freedom · protected · empty · ignoring · quieter",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Targeted Advertising Chooses a Product",
    "Reading Data Without Wronging People",
    "Why Algorithms Are Free of Bias",
    "A Guide to Building a Social Network",
    "The Legal History of Privacy Law"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "사용자들은 자주 자신도 모르게 개인 정보를 제공한다.",
    "윤리적인 데이터 해석은 수집이 투명하고 동의에 기반할 것을 요구한다.",
    "알고리즘은 고정 관념을 강화하거나 특정 집단을 배제하는 결과를 낳을 수 있다.",
    "타깃 광고나 콘텐츠 큐레이션은 사용자의 자율성과는 무관한 문제이다.",
    "윤리적인 데이터 관행은 이익을 위해 사용자 데이터를 악용하지 않는 것을 포함한다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 말하는 윤리적인 데이터 해석이 지켜야 할 균형이 무엇인지 우리말 한 문장으로 써 보세요.",
   ans: "통찰과 혁신을 위해 데이터를 활용하는 일과 사용자의 권리·이익을 보호하는 일 사이의 균형을 지켜야 한다."
  }
 ],
 fl: {
  model: {
   n: "②",
   toks: [
    ["In an age", "m"], ["where", "c"], ["vast amounts of user data", "s2"],
    ["are constantly being generated and collected,", "v2"], ["the ways", "s"], ["in which", "c"],
    ["this data", "s2"], ["is analyzed and used", "v2"], ["raise", "v"], ["important ethical questions.", null]
   ],
   ko: "방대한 사용자 데이터가 끊임없이 생성되고 수집되는 시대에, 이 데이터를 분석하고 사용하는 방식은 중요한 윤리적 질문을 던진다."
  },
  drill: [
   {
    n: "⑤",
    en: "Ethical data interpretation in this context requires a commitment to respecting user privacy and ensuring that data collection is transparent and consensual.",
    ans: "S Ethical data interpretation in this context · △V requires · O a commitment to respecting user privacy and ensuring · [that] S′ data collection · △V′ is · C transparent and consensual",
    ko: "이 맥락에서 윤리적인 데이터 해석은 사용자의 사적 자유를 존중하고 수집이 투명하고 동의에 기반하도록 보장하겠다는 약속을 요구한다."
   },
   {
    n: "⑨",
    en: "Ensuring fairness and avoiding bias in data interpretation is crucial for ethical social media practices.",
    ans: "S Ensuring fairness and avoiding bias in data interpretation · △V is · C crucial · M for ethical social media practices",
    ko: "데이터 해석에서 공정성을 확보하고 편향을 피하는 일은 윤리적인 소셜 미디어 관행에 결정적이다."
   },
   {
    n: "⑬",
    en: "It requires a balance between leveraging data for insights and innovation, while also safeguarding the rights and interests of users.",
    ans: "S It · △V requires · O a balance between leveraging data for insights and innovation · M while also safeguarding the rights and interests of users",
    ko: "그것은 통찰과 혁신을 위해 데이터를 활용하는 일과 사용자의 권리·이익을 보호하는 일 사이의 균형을 요구한다."
   }
  ]
 },
 syn: [
  {
   n: "②",
   name: "전치사 + 관계대명사  in which",
   q: "…, the ways «in which this data is analyzed and used» raise important ethical questions.",
   d: "<b>in which</b>는 <b>the ways</b>를 받아 ‘그런 방식으로 ~하는’을 뜻한다. <b>how</b>로 바꿔 쓸 수 있다.",
   k: "이 데이터가 분석되고 사용되는 방식"
  },
  {
   n: "⑧",
   name: "분사구문  leading to ~",
   q: "These algorithms can perpetuate and amplify biases present in the data, «leading to unfair outcomes»…",
   d: "앞 절의 결과를 <b>-ing</b> 덩어리로 이어 붙인다. ‘그리하여 ~하게 된다’로 읽으면 자연스럽다.",
   k: "그리하여 불공정한 결과로 이어진다"
  }
 ],
 synd: [
  { u: "구문 1", en: "We studied the way in which the feed ranks new posts.", k: "우리는 그 피드가 새 게시물의 순위를 매기는 방식을 연구했다." },
  { u: "구문 2", en: "The app collected every click, leading to a detailed profile.", k: "그 앱은 모든 클릭을 모았고, 그리하여 상세한 프로필이 만들어졌다." },
  { u: "구문 1 + 2", en: "The rule changed the way in which data is stored, leading to fewer leaks.", k: "그 규정은 데이터가 저장되는 방식을 바꾸었고, 그리하여 유출이 줄었다." }
 ],
 why: [
  ["문장 ⑩의 한 사례만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 알고리즘이 편향을 증폭할 수 있다고 말한다 — 정반대다"],
  ["소셜 네트워크를 만드는 방법은 글에 나오지 않는다"],
  ["사적 자유 관련 법의 역사는 글에서 다루지 않는다"]
 ],
 src: [["④"], ["⑤"], ["⑧"], ["⑩과 어긋남 — 조작과 자율성에 대한 의문을 제기한다"], ["⑪"]],
 kb: {
  title: "동의라는 얇은 종이",
  lead: "우리는 무엇에 동의했다고 말할 수 있을까",
  items: [
   ["읽히지 않는 약관", "이용 약관은 대개 길고 어렵다. York 대학과 코네티컷 대학 연구진의 가짜 SNS 가입 실험에서, 참가자 대부분은 약관을 읽지 않고 동의했다. 그 안에는 개인 정보를 고용주에게 넘긴다는 조항까지 들어 있었다."],
   ["GDPR", "유럽연합의 일반 개인정보 보호법은 2018년 5월부터 시행되었다. 수집 목적을 분명히 밝히고, 필요한 최소한만 모으며, 이용자가 자기 데이터의 열람·삭제를 요구할 수 있게 한 것이 핵심이다."],
   ["편향은 자료에서 온다", "얼굴 인식 정확도를 검사한 Gender Shades 연구(Buolamwini·Gebru, 2018)는 밝은 피부 남성에서 가장 낮은 오류율을, 어두운 피부 여성에서 가장 높은 오류율을 보고했다. 학습 자료에 어떤 얼굴이 많았는지가 성능으로 되돌아온 셈이다."]
  ],
  ask: "여러분이 마지막으로 ‘동의합니다’를 누른 것은 무엇이었고, 그때 무엇에 동의한 것인가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 14 ───────────────────────────── */
{
 no: "14", key: "neural", accent: "#8E5AA8", tint: "#F2EAF6", deep: "#5C3272",
 en: "Deep Neural Networks",
 ko: "편향을 줄이면 점수가 떨어진다",
 goal: "신경망이 데이터의 편향을 오히려 키우는 까닭을 정확도 계산과 연결해 설명할 수 있다.",
 fig: "Figure 1  층을 지나며 걸러지는 신호 — 그리고 ‘왜 그렇게 답했지?’",
 tip: "먼저 생각해 보자. 사진 속 사람이 요리를 하고 있다. 우리는 왜 성별까지 함께 짐작하게 될까?",
 sent: T(14).sent, kor: T(14).kor,
 bank: [
  ["intensify", "①", "강화하다"],
  ["portray", "③", "묘사하다"],
  ["misidentify", "⑦", "잘못 식별하다"],
  ["evaluate", "⑨", "평가하다"],
  ["discriminate", "⑨", "차별하다"],
  ["amplify", "⑭", "확대하다"]
 ],
 defs: [
  ["intensify", "to make something stronger or greater"],
  ["portray", "to show someone in a picture or story"],
  ["misidentify", "to name something as the wrong thing"],
  ["evaluate", "to judge how good something is"],
  ["discriminate", "to treat one group worse than another"],
  ["amplify", "to make something larger or louder"]
 ],
 defOrder: [4, 1, 5, 0, 3, 2],
 flow: [
  ["The claim", "Biased data can be made worse by neural networks", null],
  ["The test", "A network learned activities and (  ①  ) from photos", "genders"],
  ["The result", "Cooking photos were 67% women; the network said (  ②  )%", "84"],
  ["The reason", "Performance is scored by correct (  ③  ), not fairness", "answers"],
  ["The trade", "Guessing fairly drops accuracy to about (  ④  )%", "56"]
 ],
 flowBogi: "genders · 84 · answers · 56 · colours · 33",
 para: [
  ["① deep neural networks may intensify the problem", "The system can make the problem ______.", "worse"],
  ["④ These pictures had a typical gender bias", "The photo set leaned the ______ way already.", "usual"],
  ["⑦ misidentifying about half of the male cooks", "It got half the male cooks ______.", "wrong"],
  ["⑨ by the number of correct answers", "Scores count only how often it is ______.", "right"],
  ["⑯ amplifying it can lead to better performance", "Enlarging the bias can raise the ______.", "score"]
 ],
 paraBogi: "worse · usual · wrong · right · score · better · even · cost",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Networks Recognise a Frying Pan",
    "Fairness Costs Accuracy",
    "Neural Networks Correct Human Bias",
    "A Beginner's Guide to Photography",
    "Why Men Do Less Housework"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "학습에 쓰인 사진에는 남성이 야외 활동에, 여성이 조리·쇼핑에 더 많이 나왔다.",
    "요리 사진의 67%가 여성이었는데 신경망은 84%가 여성이라고 결론지었다.",
    "연구자들은 신경망의 성과를 정답의 수로 평가한다.",
    "모든 요리사를 여성이라고 추측하면 편향은 오히려 줄어든다.",
    "무작위로 3분의 2와 3분의 1로 나누어 추측하면 정답률은 약 56%에 그친다."
   ], ans: 4
  },
  {
   t: "write", q: "신경망이 차별을 키우는 쪽이 더 유리해지는 까닭을 우리말 한 문장으로 써 보세요.",
   ans: "성과를 차별하는 정도가 아니라 정답의 수로만 재기 때문에, 데이터에 있는 편향을 그대로 키우는 쪽이 정답률을 더 높이기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "⑨",
   toks: [
    ["One reason", "s"], ["is", "v"], ["that", "c"], ["researchers", "s2"], ["evaluate", "v2"],
    ["a network's performance", null], ["by the number of correct answers,", "m"],
    ["not by the degree to which it discriminates.", "m"]
   ],
   ko: "한 가지 이유는 연구자들이 신경망의 성과를 그것이 차별하는 정도가 아니라 정답의 수로 평가하기 때문이다."
  },
  drill: [
   {
    n: "③",
    en: "A neural network was fed tens of thousands of pictures of human activities and taught to identify the activities and the genders of those portrayed.",
    ans: "S A neural network · △V was fed · O tens of thousands of pictures of human activities · and △V taught · C to identify the activities and the genders of those portrayed",
    ko: "한 신경망에 인간 활동 사진 수만 장을 넣고, 묘사된 사람들의 활동과 성별을 식별하도록 학습시켰다."
   },
   {
    n: "⑫",
    en: "To obtain the best results, it would guess that every cook is female, which means that two-thirds of the answers would be correct.",
    ans: "M To obtain the best results · S it · △V would guess · [that] S′ every cook · △V′ is · C female · [which] △V′ means · [that] S′ two-thirds of the answers △V′ would be correct",
    ko: "최상의 결과를 얻으려면 모든 요리사를 여성이라고 추측할 텐데, 그러면 답의 3분의 2가 정답이 된다."
   },
   {
    n: "⑯",
    en: "In general, if there is a bias in the data, amplifying it can lead to better performance than by trying to be ‘fair’.",
    ans: "M In general · [if] S′ there △V′ is · C a bias in the data · S amplifying it · △V can lead · M to better performance than by trying to be ‘fair’",
    ko: "일반적으로 데이터에 편향이 있다면, 그것을 키우는 편이 ‘공정’하려 애쓰는 것보다 더 나은 성과로 이어질 수 있다."
   }
  ]
 },
 syn: [
  {
   n: "⑨",
   name: "전치사 + 관계대명사  to which",
   q: "…, not by the degree «to which it discriminates».",
   d: "<b>to which</b>는 <b>the degree</b>를 받아 ‘그만큼 ~하는 정도’를 뜻한다. to the degree 를 관계사로 옮긴 모양이다.",
   k: "그것이 차별하는 정도"
  },
  {
   n: "⑪",
   name: "가정을 여는 명령문 Say ~",
   q: "«Say a network knows nothing except that» two-thirds of the cooks are female.",
   d: "<b>Say</b>로 시작하는 명령문은 ‘~라고 해 보자’라는 가정을 연다. <b>Suppose</b>와 같은 구실을 한다.",
   k: "어떤 신경망이 ~ 말고는 아무것도 모른다고 해 보자"
  }
 ],
 synd: [
  { u: "구문 1", en: "We measured the speed at which the model learned new labels.", k: "우리는 그 모형이 새 이름표를 배우는 속도를 측정했다." },
  { u: "구문 2", en: "Say the data contains twice as many photos of one group.", k: "자료에 한 집단의 사진이 두 배로 많다고 해 보자." },
  { u: "구문 1 + 2", en: "Say we lower the rate at which the network guesses; accuracy falls.", k: "신경망이 추측하는 비율을 낮춘다고 해 보자. 그러면 정확도가 떨어진다." }
 ],
 why: [
  ["사물 인식의 한 대목만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 신경망이 편향을 오히려 키운다고 말한다 — 정반대다"],
  ["사진을 잘 찍는 방법은 글에 나오지 않는다"],
  ["가사 분담은 글에서 다루지 않는다"]
 ],
 src: [["④"], ["⑦"], ["⑨"], ["⑬과 어긋남 — 편향을 최대로 키운다"], ["⑮"]],
 kb: {
  title: "정답률이 감추는 것",
  lead: "잘 맞히는 것과 옳게 맞히는 것은 다르다",
  items: [
   ["원 논문", "이 글이 소개한 실험은 Zhao 등(2017)의 「Men Also Like Shopping」이다. 이미지 속 활동과 성별을 함께 예측하게 했더니 학습 자료의 성별 쏠림보다 예측이 더 쏠렸다는 결과를 보고했다."],
   ["정확도의 함정", "환자 100명 중 1명만 병이 있는 자료에서 ‘모두 정상’이라고 답하면 정확도는 99%가 된다. 정확도 하나만 보면 아무것도 못 찾는 모형이 최고가 된다. 그래서 정밀도와 재현율을 함께 본다."],
   ["편향 완화라는 과제", "학습 자료의 균형을 맞추거나, 예측 결과가 집단별로 비슷한 비율이 되도록 제약을 거는 방법이 쓰인다. 어느 쪽이든 정답률이 얼마간 내려가는 것을 감수해야 한다."]
  ],
  ask: "여러분이 무언가를 ‘잘한다’고 말할 때, 그 잘함은 무엇으로 측정되고 있는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 15 ───────────────────────────── */
{
 no: "15", key: "feed", accent: "#C24A62", tint: "#FAE7EB", deep: "#8B2740",
 en: "Anti-Social Media",
 ko: "‘좋아요’가 대답이 될 수 없는 질문",
 goal: "필자가 청소년기까지 소셜 미디어를 미루라고 권하는 근거를 정리해 설명할 수 있다.",
 fig: "Figure 1  화면이 골라 주는 것들 — 무엇이 자주 보이고 무엇이 잘 보이지 않는가.",
 tip: "먼저 생각해 보자. 올린 글에 ‘좋아요’가 적게 달린 날, 기분은 어떠했는가?",
 sent: T(15).sent, kor: T(15).kor,
 bank: [
  ["correlation", "①", "상관관계"],
  ["retreat", "②", "물러나다"],
  ["disparaging", "⑤", "비방하는"],
  ["adolescence", "⑩", "청소년기"],
  ["conditional", "⑬", "조건부의"],
  ["fickle", "⑰", "변덕스러운"]
 ],
 defs: [
  ["correlation", "a link between two things that change together"],
  ["retreat", "to move back to a safer or quieter place"],
  ["disparaging", "meant to make someone look worthless"],
  ["adolescence", "the years between childhood and adulthood"],
  ["conditional", "given only if something else is true"],
  ["fickle", "changing feelings often and without reason"]
 ],
 defOrder: [2, 5, 0, 4, 1, 3],
 flow: [
  ["The finding", "Social interaction is tied to health and well-being", null],
  ["The gap", "Posting to distant followers is not very (  ①  )", "social"],
  ["The harm", "Children grow (  ②  ) about likes and follower counts", "anxious"],
  ["The advice", "Delay social media through (  ③  )", "adolescence"],
  ["The reason", "A child needs (  ④  ) love from real people", "unconditional"]
 ],
 flowBogi: "social · anxious · adolescence · unconditional · loud · childhood",
 para: [
  ["② followers they barely know in real life", "They hardly know these people ______ the screen.", "off"],
  ["⑤ a lack of comments", "No reply feels like being ______.", "ignored"],
  ["⑦ you don't see the effect of your words", "Online you cannot ______ what your words do.", "see"],
  ["⑫ based on performance, appearance, and shock value", "Online liking rests on how you ______.", "perform"],
  ["⑰ an online society that can be fickle and cruel", "The crowd online can turn ______ at any moment.", "cold"]
 ],
 paraBogi: "off · ignored · see · perform · cold · on · praised · hear",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Many Followers a Child Should Have",
    "Wait: What a Child Needs First",
    "Early Social Media Builds Confidence",
    "How to Take a Better Selfie",
    "The History of Online Networks"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "여러 연구는 사회적 상호 작용과 건강·안녕 사이의 강한 상관관계를 보여 주었다.",
    "일부 초등학생도 소셜 미디어를 접하면서 ‘좋아요’ 수에 더 불안해진다.",
    "온라인에서는 말의 효과를 볼 수 없어서 잔인한 말을 하기 쉽다.",
    "온라인에서의 인기는 있는 그대로의 모습에 대한 무조건적인 애정에 기반한다.",
    "필자는 자녀에게 소셜 미디어를 알려 주는 일을 청소년기까지 미루라고 제안한다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 아이에게 필요하다고 말하는 ‘확고한 기반’이 무엇인지 우리말 한 문장으로 써 보세요.",
   ans: "자신이 아는 실제 사람들에게 있는 그대로의 자기 모습으로 좋아함을 받는 경험이 그 확고한 기반이다."
  }
 ],
 fl: {
  model: {
   n: "⑪",
   toks: [
    ["As", "c"], ["your child", "s2"], ["grows", "v2"], ["into a teenager,", "m"],
    ["she", "s"], ["needs", "v"], ["the firm foundation of being liked for who she is,", null],
    ["by real people she knows.", "m"]
   ],
   ko: "자녀가 십 대로 자라 갈 때, 그 아이에게는 자신이 아는 실제 사람들에게 있는 그대로 좋아함을 받는다는 확고한 기반이 필요하다."
  },
  drill: [
   {
    n: "②",
    en: "Yet there's not much social about kids retreating to their rooms to post selfies and comments to dozens or hundreds of followers they barely know in real life.",
    ans: "M Yet · △V there's · C not much social · M about kids retreating to their rooms · M to post selfies and comments to dozens or hundreds of followers they barely know in real life",
    ko: "그러나 아이들이 방으로 물러나 현실에서 거의 모르는 수십, 수백 명의 팔로워에게 셀카와 댓글을 올리는 데는 사회적인 것이 별로 없다."
   },
   {
    n: "⑧",
    en: "It's one thing to post “No one likes you” and hit send from the comfort of your home.",
    ans: "△V It's · C one thing · S to post “No one likes you” and hit send · M from the comfort of your home",
    ko: "집에서 편안하게 ‘아무도 너를 좋아하지 않아’라고 올리고 보내기를 누르는 것은 한 가지 일이다."
   },
   {
    n: "⑰",
    en: "By limiting social media, you will help her find the answer in real people who care about her instead of an online society that can be fickle and cruel.",
    ans: "M By limiting social media · S you · △V will help · O her find the answer · M in real people who care about her instead of an online society that can be fickle and cruel",
    ko: "소셜 미디어를 제한함으로써, 변덕스럽고 잔인할 수 있는 온라인 사회 대신 자신을 아끼는 실제 사람들에게서 답을 찾도록 도울 수 있다."
   }
  ]
 },
 syn: [
  {
   n: "⑧",
   name: "It is one thing to ~, another to …",
   q: "«It's one thing to post “No one likes you” and hit send» from the comfort of your home.",
   d: "두 일을 견주어 ‘~하는 것과 …하는 것은 전혀 다르다’를 나타낸다. <b>it</b>은 가주어, <b>to부정사</b>가 진주어다.",
   k: "~하는 것과 …하는 것은 별개의 일이다"
  },
  {
   n: "⑪",
   name: "동명사의 수동형  being p.p.",
   q: "…she needs the firm foundation of «being liked for who she is», by real people she knows.",
   d: "<b>being + 과거분사</b>는 ‘~됨, ~받음’을 뜻하는 동명사다. 여기서는 전치사 <b>of</b>의 목적어로 쓰였다.",
   k: "있는 그대로의 자신으로 좋아함을 받는 것"
  }
 ],
 synd: [
  { u: "구문 1", en: "It is one thing to read the rule, another to follow it.", k: "규칙을 읽는 것과 그것을 지키는 것은 별개의 일이다." },
  { u: "구문 2", en: "She was tired of being judged by a number on a screen.", k: "그녀는 화면의 숫자로 평가받는 것에 지쳐 있었다." },
  { u: "구문 1 + 2", en: "It is one thing to enjoy being liked, another to need it every day.", k: "좋아함을 받아 즐거운 것과 그것을 매일 필요로 하는 것은 별개의 일이다." }
 ],
 why: [
  ["팔로워 수 자체는 글의 초점이 아닌 지엽적인 제목이다"],
  ["정답"],
  ["글은 이른 소셜 미디어가 불안을 키운다고 말한다 — 정반대다"],
  ["사진을 잘 찍는 방법은 글에 나오지 않는다"],
  ["온라인 네트워크의 역사는 글에서 다루지 않는다"]
 ],
 src: [["①"], ["④"], ["⑦"], ["⑫와 어긋남 — 성과·외모·충격 효과에 기반한 조건부 애정이다"], ["⑩"]],
 kb: {
  title: "숫자가 대답이 될 때",
  lead: "‘나를 좋아하나요?’라는 물음에 무엇이 답할 수 있을까",
  items: [
   ["연령 제한의 뿌리", "미국의 어린이 온라인 사생활 보호법(COPPA, 1998)은 13세 미만 아동의 개인 정보를 수집할 때 부모 동의를 받도록 했다. 많은 서비스가 가입 연령을 13세로 정한 데에는 이 법의 부담을 피하려는 이유가 크다."],
   ["‘좋아요’의 탄생", "Facebook의 좋아요 버튼은 2009년에 공개되었다. 반응을 숫자로 셀 수 있게 되면서, 게시물의 값어치가 셀 수 있는 형태로 바뀌었다."],
   ["숨긴 좋아요 실험", "Instagram은 2019년부터 여러 나라에서 남의 게시물의 좋아요 수를 감추는 시험을 했고, 2021년에는 이용자가 직접 숨김을 고를 수 있게 했다. 숫자를 보이지 않게 하는 것만으로 무엇이 달라지는지 확인하려는 시도였다."]
  ],
  ask: "여러분이 올린 글에 아무 반응이 없을 때, 그 침묵을 무엇이라고 해석해 왔는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
}

 ]
};
