/* Unit 10 · Economy & Business — 원문 Theme 46–50 */
const R = require("../src/orig/all.json");
const T = n => R[n - 1];

module.exports = {
 no: 10,
 field: "Economy & Business",
 ko: "경제·경영",
 tagline: "값이 붙는 자리 — 격차·동기·불안·값표·수요",
 next: { en: "Environment, Resources & Ecology", ko: "함께 쓰는 것을 어떻게 지킬지 읽습니다", words: "235–301 words" },
 lessons: [

/* ───────────────────────────── 46 ───────────────────────────── */
{
 no: "46", key: "gini", accent: "#39628C", tint: "#E6EDF4", deep: "#204261",
 en: "The Gini Coefficient Reflecting Income Inequality and Legislative Influence",
 ko: "숫자 하나로 재는 격차",
 goal: "지니 계수가 무엇을 재는지와, 높은 불평등이 입법에서 어떻게 드러나는지 설명할 수 있다.",
 fig: "Figure 1  0 과 1.0 사이 어디쯤.",
 tip: "먼저 생각해 보자. 한 사회의 격차를 숫자 하나로 나타낼 수 있을까?",
 sent: T(46).sent, kor: T(46).kor,
 bank: [
  ["magnitude", "①", "크기"],
  ["coefficient", "①", "계수"],
  ["contemporary", "④", "현대의"],
  ["moderately", "⑥", "어느 정도로"],
  ["accumulate", "⑦", "축적하다"],
  ["legislation", "⑧", "입법"]
 ],
 defs: [
  ["magnitude", "how large something is"],
  ["coefficient", "a number that stands for a measured ratio"],
  ["contemporary", "belonging to the present time"],
  ["moderately", "to a middling degree, not extremely"],
  ["accumulate", "to build up a store of something"],
  ["legislation", "the laws that a parliament passes"]
 ],
 defOrder: [2, 4, 0, 5, 1, 3],
 flow: [
  ["The problem", "Average income did not predict what inequality did", null],
  ["The tool", "A (  ①  ) of 0 means everyone earns the same", "coefficient"],
  ["The range", "Most societies today fall between 0.3 and (  ②  )", "0.6"],
  ["The change", "The US moved from 0.38 in 1950 to 0.45 in (  ③  )", "2013"],
  ["The other side", "Bills the wealthy favored became (  ④  ) far more often", "law"]
 ],
 flowBogi: "coefficient · 0.6 · 2013 · law · 0.3 · income",
 para: [
  ["① economists invented an index of income inequality", "They built a ______ for measuring the gap.", "tool"],
  ["② one family earns all the income", "A score of 1.0 means one home takes ______.", "all"],
  ["④ range from 0.3 to 0.6", "Most countries ______ between those two marks.", "sit"],
  ["⑦ a college education was a less important requirement", "Back then a degree ______ less for wealth.", "mattered"],
  ["⑩ only 18 percent of the proposals", "Most bills the public wanted ______ passed.", "never"]
 ],
 paraBogi: "tool · all · sit · mattered · never · half · rose · always",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "A Short History of Canada",
    "One Number for a Country's Gap",
    "Why Inequality Has Vanished",
    "How to Start a Small Business",
    "The Rules of Congressional Debate"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "지니 계수 0 은 사회의 모두가 같은 소득을 가진다는 뜻이다.",
    "지니 계수는 전체 부의 불평등을 나타내는 데에도 쓸 수 있다.",
    "2013년 미국의 지니 계수는 1950년보다 낮았다.",
    "이백 년 전 미국의 지니 계수는 훨씬 낮았다.",
    "1981년부터 2002년까지 의회가 통과시킨 법의 절반 가까이는 아주 부유한 소수가 선호한 것이었다."
   ], ans: 3
  },
  {
   t: "write", q: "이백 년 전 미국의 지니 계수가 훨씬 낮았던 까닭을 우리말 한 문장으로 써 보세요.",
   ans: "대부분의 가정이 집과 가축을 가졌고, 부를 쌓는 데 대학 교육이 덜 중요했기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "②",
   toks: [
    ["A Gini coefficient of 0", "s"], ["means", "v"], ["that", "c"],
    ["everyone in the society", "s2"], ["has", "v2"], ["the same income;", null],
    ["a coefficient of 1.0", "s"], ["means", "v"], ["that", "c"],
    ["one family", "s2"], ["earns", "v2"], ["all the income.", null]
   ],
   ko: "지니 계수 0 은 사회의 모두가 같은 소득을 가진다는 뜻이고, 계수 1.0 은 한 가정이 모든 소득을 번다는 뜻이다."
  },
  drill: [
   {
    n: "①",
    en: "When social scientists discovered that the magnitude of income inequality in a country or region predicted some outcomes that a family's average income did not, economists invented an index of income inequality called the Gini coefficient.",
    ans: "[When] S′ social scientists · △V′ discovered · [that] S′ the magnitude of income inequality in a country or region · △V′ predicted · O some outcomes that a family's average income did not · S economists · △V invented · O an index of income inequality called the Gini coefficient",
    ko: "한 나라나 지역의 소득 불평등 크기가 가정의 평균 소득으로는 예측되지 않던 결과들을 예측한다는 것을 사회과학자들이 알아내자, 경제학자들은 지니 계수라는 소득 불평등 지수를 만들었다."
   },
   {
    n: "⑥",
    en: "The Gini coefficient for the United States in 2013 was a moderately high 0.45, compared with 0.38 in 1950, which implies that 10 percent of Americans in 2013 owned more than two-thirds of the country's wealth.",
    ans: "S The Gini coefficient for the United States in 2013 · △V was · C a moderately high 0.45 · M compared with 0.38 in 1950 · [which] △V′ implies · [that] S′ 10 percent of Americans in 2013 · △V′ owned · O more than two-thirds of the country's wealth",
    ko: "2013년 미국의 지니 계수는 1950년의 0.38 과 견주어 다소 높은 0.45 였는데, 이는 2013년 미국인의 10퍼센트가 나라 부의 3분의 2 넘게 가졌음을 뜻한다."
   },
   {
    n: "⑩",
    en: "By contrast, only 18 percent of the proposals a majority of the public favored, but the wealthy opposed, became law.",
    ans: "M By contrast · S only 18 percent of the proposals · S′ a majority of the public · △V′ favored · [but] S′ the wealthy · △V′ opposed · △V became · C law",
    ko: "그와 달리, 다수 대중이 선호했지만 부유층이 반대한 법안 가운데 18퍼센트만이 법이 되었다."
   }
  ]
 },
 syn: [
  {
   n: "⑥",
   name: "앞 내용을 받는 which (그리고 그것은 ~을 뜻한다)",
   q: "…compared with 0.38 in 1950, «which implies that 10 percent of Americans in 2013 owned more than two-thirds»…",
   d: "<b>which</b>가 앞 문장 전체를 받아 ‘그리고 그것은 ~을 뜻한다’로 이어진다.",
   k: "그리고 그것은 ~임을 뜻한다"
  },
  {
   n: "⑩",
   name: "목적격 관계대명사 생략",
   q: "…only 18 percent of «the proposals a majority of the public favored, but the wealthy opposed,» became law.",
   d: "<b>the proposals</b> 뒤에 목적격 관계대명사가 빠져 있다. ‘명사 + 주어 + 동사’가 붙으면 그 명사를 꾸미는 절이다.",
   k: "대중이 선호했지만 부유층이 반대한 법안"
  }
 ],
 synd: [
  { u: "구문 1", en: "Prices rose again, which implies that demand stayed strong.", k: "값이 또 올랐고, 이는 수요가 여전히 강했음을 뜻한다." },
  { u: "구문 2", en: "The report the committee ignored named the same cause.", k: "위원회가 무시한 그 보고서는 같은 원인을 지목했다." },
  { u: "구문 1 + 2", en: "The bill the public wanted failed, which implies that money mattered more.", k: "대중이 원한 그 법안은 통과되지 못했고, 이는 돈이 더 중요했음을 뜻한다." }
 ],
 why: [
  ["캐나다의 역사는 글에 나오지 않는다"],
  ["정답"],
  ["글은 불평등이 지금 높은 수준이라고 말한다 — 정반대다"],
  ["창업 방법은 글의 관심사가 아니다"],
  ["의회 토론 규칙은 글의 초점이 아니다"]
 ],
 src: [["②"], ["③"], ["⑥과 어긋남 — 0.38 에서 0.45 로 올랐다"], ["⑦"], ["⑨"]],
 kb: {
  title: "지니 계수",
  lead: "0 과 1.0 사이의 한 점",
  items: [
   ["로렌츠 곡선", "지니 계수는 소득 분포를 그린 로렌츠 곡선과 완전 평등선 사이의 면적으로 구한다. 이탈리아 통계학자 코라도 지니(Corrado Gini)가 1912년에 제안했다."],
   ["같은 숫자, 다른 모양", "계수가 같아도 분포의 모양은 다를 수 있다. 위쪽이 크게 버는 사회와 아래쪽이 거의 못 버는 사회가 같은 값을 가질 수 있다."],
   ["소득과 부", "소득(income)은 한 해 동안 버는 돈이고, 부(wealth)는 지금까지 쌓인 자산이다. 대체로 부의 불평등이 소득 불평등보다 크게 나타난다."]
  ],
  ask: "숫자 하나로 사회를 견주는 일에는 어떤 이점과 한계가 있을까?"
 },
 wtype: ["무관", "정답", "반대", "무관", "지엽"],
 stype: ["일치", "일치", "반대", "일치", "일치"]
},

/* ───────────────────────────── 47 ───────────────────────────── */
{
 no: "47", key: "conflict", accent: "#A85440", tint: "#F8EBE7", deep: "#763322",
 en: "The Power of Internal Struggles in Storytelling and Marketing",
 ko: "사람은 안쪽 문제를 산다",
 goal: "이야기 속 안쪽 문제가 무엇이며 그것이 마케팅에서 왜 중요한지 설명할 수 있다.",
 fig: "Figure 1  이야기와 마케팅이 함께 쓰는 뼈대.",
 tip: "먼저 생각해 보자. 우리가 물건을 살 때 정말로 풀고 싶은 것은 무엇일까?",
 sent: T(47).sent, kor: T(47).kor,
 bank: [
  ["neglect", "①", "소홀히 하다"],
  ["manifest", "③", "드러내다"],
  ["backstory", "⑤", "사연"],
  ["self-doubt", "⑥", "자기 의심"],
  ["incompetent", "⑨", "무능한"],
  ["relatable", "⑩", "공감할 만한"]
 ],
 defs: [
  ["neglect", "to fail to give attention to something"],
  ["manifest", "to show something hidden in a clear form"],
  ["backstory", "the earlier events behind a character's life"],
  ["self-doubt", "a lack of belief in your own ability"],
  ["incompetent", "not able to do a job well enough"],
  ["relatable", "easy for people to see themselves in"]
 ],
 defOrder: [3, 1, 5, 0, 4, 2],
 flow: [
  ["The mistake", "Brands speak only to problems on the outside", null],
  ["The principle", "People buy solutions to (  ①  ) problems", "internal"],
  ["In stories", "Writers give the hero a backstory of (  ②  )", "frustration"],
  ["The question", "Almost every hero asks: Do I have what it (  ③  )?", "takes"],
  ["The lesson", "That doubt is what makes a story (  ④  ) to anyone", "relatable"]
 ],
 flowBogi: "internal · frustration · takes · relatable · external · costs",
 para: [
  ["① we neglect a principle that is costing us", "We overlook a rule that costs us ______.", "money"],
  ["③ to manifest an internal problem", "The outer trouble ______ the inner one.", "shows"],
  ["⑤ create a backstory of frustration", "Writers build a past full of ______.", "frustration"],
  ["⑩ relatable to a soccer mom", "Anyone can ______ themselves in the hero.", "see"],
  ["⑬ we fail to engage the deeper frustration", "We never ______ the trouble underneath.", "touch"]
 ],
 paraBogi: "money · shows · frustration · see · touch · hides · sell · time",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How to Direct a Baseball Movie",
    "Sell to the Trouble Inside",
    "Why Backstories Waste Time",
    "A Guide to Writing Sci-Fi Names",
    "The Business Model of Cinemas"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "기업은 대개 바깥 문제의 해결책을 판다.",
    "이야기에서 바깥 문제는 안쪽 문제를 드러내기 위한 것이다.",
    "Star Wars 에서 Luke 는 삼촌에게서 반란군에 들기에는 너무 어리다는 말을 들었다.",
    "필자는 사람들이 안쪽 좌절보다 바깥 문제의 해결을 더 강하게 원한다고 말한다.",
    "대부분의 브랜드가 바로 이 지점에서 결정적인 실수를 한다."
   ], ans: 4
  },
  {
   t: "write", q: "영화 Moneyball 에서 Billy Beane 의 안쪽 문제가 무엇인지 우리말 한 문장으로 써 보세요.",
   ans: "선수 시절 실패해서 단장으로 자신을 증명할 수 있을지 스스로를 의심한 것이다."
  }
 ],
 fl: {
  model: {
   n: "③",
   toks: [
    ["The purpose of an external problem in a story", "s"], ["is", "v"],
    ["to manifest an internal problem.", null]
   ],
   ko: "이야기에서 바깥 문제가 있는 목적은 안쪽 문제를 드러내는 것이다."
  },
  drill: [
   {
    n: "②",
    en: "That principle is this: companies tend to sell solutions to external problems, but people buy solutions to internal problems.",
    ans: "S That principle · △V is · C this · S companies · △V tend · O to sell solutions to external problems · [but] S people · △V buy · O solutions to internal problems",
    ko: "그 원리는 이렇다. 기업은 바깥 문제의 해결책을 팔려 하지만, 사람들은 안쪽 문제의 해결책을 산다."
   },
   {
    n: "⑦",
    en: "In Star Wars, Luke Skywalker was told by his uncle that he was too young to join the Rebellion, so he doubted his ability until the very end.",
    ans: "M In Star Wars · S Luke Skywalker · △V was told · M by his uncle · [that] S′ he · △V′ was · C too young to join the Rebellion · [so] S he · △V doubted · O his ability · M until the very end",
    ko: "Star Wars 에서 Luke Skywalker 는 삼촌에게서 반란군에 들기에는 너무 어리다는 말을 들었고, 그래서 끝까지 자신의 능력을 의심했다."
   },
   {
    n: "⑪",
    en: "Stories teach us that people's internal desire to resolve a frustration is a greater motivator than their desire to solve an external problem.",
    ans: "S Stories · △V teach · O us · [that] S′ people's internal desire to resolve a frustration · △V′ is · C a greater motivator than their desire to solve an external problem",
    ko: "이야기는 좌절을 풀려는 사람들의 안쪽 욕구가 바깥 문제를 해결하려는 욕구보다 더 큰 동기임을 가르쳐 준다."
   }
  ]
 },
 syn: [
  {
   n: "⑩",
   name: "관계대명사 what 이 이끄는 보어 자리 명사절",
   q: "«The sense of self-doubt is what makes a movie about baseball relatable to a soccer mom»…",
   d: "<b>what</b>절이 통째로 보어가 된다. ‘~하게 만드는 것’으로 읽는다.",
   k: "~을 공감할 만하게 만드는 것"
  },
  {
   n: "⑬",
   name: "By ~ing (그렇게 함으로써)",
   q: "«By assuming our customers only want to resolve external problems», we fail to engage…",
   d: "<b>by + ~ing</b>는 ‘~함으로써’다. 뒤에 오는 결과와 이어 읽는다.",
   k: "~라고 가정함으로써"
  }
 ],
 synd: [
  { u: "구문 1", en: "Her calm voice was what kept the room steady.", k: "그 방을 안정시킨 것은 그녀의 차분한 목소리였다." },
  { u: "구문 2", en: "By naming the fear, he made the ad work.", k: "두려움에 이름을 붙임으로써 그는 그 광고를 통하게 만들었다." },
  { u: "구문 1 + 2", en: "By asking one question, she found what makes buyers hesitate.", k: "질문 하나를 던짐으로써 그녀는 구매자를 망설이게 만드는 것을 찾아냈다." }
 ],
 why: [
  ["야구 영화의 연출법은 글에 나오지 않는다"],
  ["정답"],
  ["글은 사연이 이야기를 살린다고 말한다 — 정반대다"],
  ["공상과학 작명법은 글의 관심사가 아니다"],
  ["영화관의 수익 구조는 글에서 다루지 않는다"]
 ],
 src: [["②"], ["③"], ["⑦"], ["⑪과 어긋남 — 안쪽 좌절을 풀려는 욕구가 더 큰 동기다"], ["⑫"]],
 kb: {
  title: "이야기의 뼈대",
  lead: "바깥 문제와 안쪽 문제",
  items: [
   ["세 겹의 문제", "이야기 이론에서는 인물이 겪는 문제를 바깥(external)·안쪽(internal)·철학적(philosophical) 층으로 나눈다. 관객을 붙드는 것은 대개 안쪽 층이다."],
   ["Moneyball", "2011년 영화 『머니볼』은 마이클 루이스의 논픽션을 바탕으로, 오클랜드 애슬레틱스 단장 빌리 빈이 통계로 팀을 꾸리는 과정을 그린다."],
   ["영웅의 질문", "‘내가 해낼 수 있을까?’라는 물음은 장르를 가리지 않는다. 야구 영화가 야구를 모르는 관객에게도 통하는 까닭이 여기에 있다."]
  ],
  ask: "여러분이 최근에 산 물건은 어떤 바깥 문제와 어떤 안쪽 문제를 풀어 주었을까?"
 },
 wtype: ["무관", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 48 ───────────────────────────── */
{
 no: "48", key: "gig", accent: "#4A6B52", tint: "#E9F1EA", deep: "#2F4A36",
 en: "The Decline of Stable Jobs, Followed by Insecurity in the Job Market",
 ko: "안정이 사라진 자리",
 goal: "안정된 일자리가 줄어든 과정을 소득의 문제와 목적의 문제로 나누어 설명할 수 있다.",
 fig: "Figure 1  위험이 옮겨 간 자리.",
 tip: "먼저 생각해 보자. 일자리가 주는 것은 소득뿐일까?",
 sent: T(48).sent, kor: T(48).kor,
 bank: [
  ["productivity", "①", "생산성"],
  ["automate", "②", "자동화하다"],
  ["underemployment", "③", "불완전 고용"],
  ["retirement", "⑤", "은퇴"],
  ["juggle", "⑥", "병행하다"],
  ["existentially", "⑪", "실존적으로"]
 ],
 defs: [
  ["productivity", "how much is made for each hour of work"],
  ["automate", "to make a machine do a human's job"],
  ["underemployment", "having less work than one needs or can do"],
  ["retirement", "the time of life after one stops working"],
  ["juggle", "to keep several duties going at once"],
  ["existentially", "in the sense of what a life is for"]
 ],
 defOrder: [4, 0, 5, 2, 1, 3],
 flow: [
  ["The model", "Ever-rising productivity narrowed meaningful work", null],
  ["The method", "Firms (  ①  ) production and move jobs abroad", "automate"],
  ["Two crises", "It is a crisis of income and a crisis of (  ②  )", "purpose"],
  ["The old shape", "People once stayed at one company until (  ③  )", "retirement"],
  ["The new shape", "The US gig economy grew by (  ④  ) percent in 2020", "33"]
 ],
 flowBogi: "automate · purpose · retirement · 33 · export · 8",
 para: [
  ["① has reduced the scope of meaningful employment", "Work that feels meaningful has ______.", "shrunk"],
  ["③ often primarily characterized as an income crisis", "People call it a crisis of ______ first.", "income"],
  ["④ But it is also a crisis of purpose.", "It is a crisis of ______ as well.", "purpose"],
  ["⑥ juggling multiple jobs and short-term work", "They hold several ______ at the same time.", "jobs"],
  ["⑨ jobs that aren't there and may never return", "They look for work that has ______.", "gone"]
 ],
 paraBogi: "shrunk · income · purpose · jobs · gone · grown · rest · stayed",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Robots Are Built",
    "When Steady Work Disappears",
    "Why the Gig Economy Is Shrinking",
    "A Guide to Writing a Résumé",
    "The History of English Trade Unions"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "많은 기업이 생산 과정을 자동화하고 일자리를 신흥 노동 시장으로 옮겼다.",
    "이 상황은 흔히 무엇보다 소득 위기로 규정된다.",
    "수십 년 전에는 훈련 때부터 은퇴 때까지 같은 회사에서 일하는 일이 흔했다.",
    "2021년 기사는 잉글랜드와 웨일스의 약 440만 성인이 긱 경제 기업 일을 한다고 전했다.",
    "미국의 긱 경제는 2020년에 미국 경제 전체보다 느리게 성장했다."
   ], ans: 5
  },
  {
   t: "write", q: "필자가 이 상황을 소득 위기만으로 보지 않는 까닭을 우리말 한 문장으로 써 보세요.",
   ans: "오래 일해도 예전 같은 안정과 목적을 주지 못해 목적의 위기이기도 하기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "③",
   toks: [
    ["This situation, and the resultant waves of mass unemployment and underemployment,", "s"],
    ["is often primarily characterized", "v"], ["as an income crisis.", "m"]
   ],
   ko: "이 상황과 그로 인한 대량 실업·불완전 고용의 물결은 흔히 무엇보다 소득 위기로 규정된다."
  },
  drill: [
   {
    n: "②",
    en: "Many companies have found that they can produce more goods and services for less money if they automate the production process and transfer jobs to emerging labor markets.",
    ans: "S Many companies · △V have found · [that] S′ they · △V′ can produce · O more goods and services · M for less money · [if] S′ they · △V′ automate · O the production process · [and] △V′ transfer · O jobs to emerging labor markets",
    ko: "많은 기업은 생산 과정을 자동화하고 일자리를 신흥 노동 시장으로 옮기면 더 적은 돈으로 더 많은 재화와 서비스를 만들 수 있다는 것을 알게 되었다."
   },
   {
    n: "⑤",
    en: "Whereas decades ago it was common for people to work at the same company from training until retirement, modern business management practices have reduced the kind of long-term, stable employment opportunities that were once enjoyed by blue- and white-collar workers alike.",
    ans: "[Whereas] M decades ago · △V′ it was · C common for people to work at the same company from training until retirement · S modern business management practices · △V have reduced · O the kind of long-term, stable employment opportunities · [that] △V′ were once enjoyed · M by blue- and white-collar workers alike",
    ko: "수십 년 전에는 훈련 때부터 은퇴 때까지 같은 회사에서 일하는 것이 흔했던 반면, 오늘날의 경영 관행은 육체노동자와 사무직이 함께 누리던 장기적이고 안정된 고용 기회를 줄여 놓았다."
   },
   {
    n: "⑨",
    en: "Plenty of other people have no work at all, and spend their days looking for jobs that aren't there and may never return.",
    ans: "S Plenty of other people · △V have · O no work at all · [and] △V spend · O their days · M looking for jobs that aren't there and may never return",
    ko: "또 다른 많은 사람은 아예 일이 없어서, 있지도 않고 다시 돌아오지 않을지도 모르는 일자리를 찾으며 하루하루를 보낸다."
   }
  ]
 },
 syn: [
  {
   n: "⑤",
   name: "대조의 whereas (~인 반면에)",
   q: "«Whereas decades ago it was common for people to work at the same company»…, modern business management practices have reduced…",
   d: "<b>whereas</b>가 두 시대를 맞세운다. ‘~인 반면에’로 읽고, 뒤의 주절과 견주어 본다.",
   k: "~이었던 반면에"
  },
  {
   n: "⑥",
   name: "none of which (계속적 용법의 관계대명사)",
   q: "…multiple jobs and short-term work, «none of which offer the same sort of steady income»…",
   d: "<b>none of which</b>는 앞의 명사를 받아 ‘그 가운데 어느 것도 ~아니다’로 읽는다.",
   k: "그 가운데 어느 것도 ~을 주지 않는다"
  }
 ],
 synd: [
  { u: "구문 1", en: "Whereas the old plant hired for life, the new one hires by the week.", k: "옛 공장은 평생을 두고 사람을 뽑은 반면, 새 공장은 주 단위로 뽑는다." },
  { u: "구문 2", en: "He took three jobs, none of which paid enough.", k: "그는 일을 셋 맡았는데, 그 가운데 어느 것도 충분한 보수를 주지 않았다." },
  { u: "구문 1 + 2", en: "Whereas she had one contract, he had five, none of which lasted a year.", k: "그녀는 계약이 하나였던 반면, 그는 다섯이었고 그 가운데 어느 것도 한 해를 넘기지 못했다." }
 ],
 why: [
  ["로봇 제작 과정은 글에 나오지 않는다"],
  ["정답"],
  ["글은 긱 경제가 빠르게 커졌다고 말한다 — 정반대다"],
  ["이력서 작성법은 글의 관심사가 아니다"],
  ["노동조합의 역사는 글의 초점이 아니다"]
 ],
 src: [["②"], ["③"], ["⑤"], ["⑦"], ["⑧과 어긋남 — 경제 전체보다 8.25배 빠르게 커졌다"]],
 kb: {
  title: "긱 경제",
  lead: "짧은 일이 이어 붙는 노동",
  items: [
   ["말의 유래", "gig 은 본래 음악가가 하룻밤 무대에 서는 일을 가리키는 말이다. 짧은 계약으로 일을 이어 가는 노동 형태를 부르는 이름이 되었다."],
   ["숫자", "본문이 인용한 2021년 기사에 따르면 잉글랜드와 웨일스에서 긱 경제 기업 일을 하는 성인은 약 440만 명으로, 2016년의 두 배가 넘는다."],
   ["소득과 목적", "필자는 이 변화를 소득의 문제로만 보지 않는다. 오래 이어지는 일이 주던 소속감과 목적이 함께 사라졌다고 본다."]
  ],
  ask: "여러분이 바라는 일자리는 어떤 안정을 주어야 할까?"
 },
 wtype: ["무관", "정답", "반대", "무관", "지엽"],
 stype: ["일치", "일치", "일치", "일치", "반대"]
},

/* ───────────────────────────── 49 ───────────────────────────── */
{
 no: "49", key: "store", accent: "#6B4E8C", tint: "#EFE9F6", deep: "#493165",
 en: "The Hidden Psychological Game for Shoppers",
 ko: "값표가 거는 조용한 게임",
 goal: "매장의 값 붙이기가 어떤 방식으로 작동하는지, 그것을 어떻게 알아챌 수 있는지 설명할 수 있다.",
 fig: "Figure 1  가까운 자리, 다른 값표.",
 tip: "먼저 생각해 보자. 우리는 장을 볼 때 값을 얼마나 견주어 볼까?",
 sent: T(49).sent, kor: T(49).kor,
 bank: [
  ["mix-up", "①", "뒤섞임"],
  ["loose", "②", "낱개의"],
  ["markup", "④", "인상분"],
  ["near-identical", "⑦", "거의 같은"],
  ["substitute", "⑫", "대체재"],
  ["bargain", "⑬", "싸게 산 물건"]
 ],
 defs: [
  ["mix-up", "a confusing difference that seems out of place"],
  ["loose", "sold one by one, not in a package"],
  ["markup", "the amount added on top of the old price"],
  ["near-identical", "almost exactly the same as another"],
  ["substitute", "a good that can take another's place"],
  ["bargain", "something bought for less than it is worth"]
 ],
 defOrder: [1, 3, 0, 5, 2, 4],
 flow: [
  ["The habit", "Look for odd price mix-ups on your next shop", null],
  ["Chilies", "Packaged chilies can cost ten times as much as (  ①  ) ones", "loose"],
  ["Why it works", "Buyers of small amounts never (  ②  ) the price", "check"],
  ["Chips", "The same brand cost 25 percent more on the (  ③  ) shelf", "top"],
  ["The defence", "Simple (  ④  ) is the shopper's best weapon", "observation"]
 ],
 flowBogi: "loose · check · top · observation · bottom · package",
 para: [
  ["① Try to spot odd mix-ups next time", "Watch for prices that look ______.", "wrong"],
  ["③ he doesn't think to check whether they cost", "The buyer never ______ to compare.", "stops"],
  ["④ customers who notice the markup just buy", "Those who ______ the rise pick something else.", "spot"],
  ["⑦ they hadn't made a price-comparison", "They never ______ the two price tags.", "compared"],
  ["⑬ only shoppers who are careful to notice", "Only ______ shoppers get the best deals.", "careful"]
 ],
 paraBogi: "wrong · stops · spot · compared · careful · right · hurries · lucky",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Chili Peppers Are Grown",
    "The Quiet Game at the Price Tag",
    "Why Supermarkets Never Change Prices",
    "A Recipe for Salt and Pepper Chips",
    "How to Design a Store Entrance"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "슈퍼마켓은 봉지에 든 고추에 낱개 고추의 열 배를 매기기도 한다.",
    "적은 양을 사는 손님은 값을 확인해 볼 생각을 하지 않는다.",
    "위 선반의 감자칩은 아래 선반의 것보다 25퍼센트 쌌다.",
    "슈퍼마켓에는 값이 싼 것과 비싼 것이 뒤섞인 비슷한 대체재가 가득하다.",
    "값을 알아채고 기억하고 견주는 손님만이 가장 싼 값을 얻는다."
   ], ans: 3
  },
  {
   t: "write", q: "값을 제멋대로 매기는 방식이 매장에 이득이 되는 까닭을 우리말 한 문장으로 써 보세요.",
   ans: "값을 알아챈 손님은 다른 물건을 고르고, 알아채지 못한 손님은 큰 인상분을 스스로 떠안기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "③",
   toks: [
    ["That's", "v"], ["because", "c"], ["the typical customer", "s2"], ["buys", "v2"],
    ["such small quantities", null], ["that", "c"], ["he", "s2"], ["doesn't think", "v2"],
    ["to check whether they cost four cents or forty.", null]
   ],
   ko: "전형적인 손님은 아주 적은 양을 사기 때문에 그것이 4센트인지 40센트인지 확인해 볼 생각을 하지 않는다."
  },
  drill: [
   {
    n: "②",
    en: "Have you noticed that supermarkets often charge ten times as much for fresh chili peppers in a package as for loose fresh chilies?",
    ans: "△V Have you noticed · [that] S′ supermarkets · △V′ often charge · O ten times as much for fresh chili peppers in a package as for loose fresh chilies",
    ko: "슈퍼마켓이 봉지에 든 신선한 고추에 낱개 고추의 열 배를 매기는 일이 흔하다는 것을 알아챈 적이 있는가?"
   },
   {
    n: "⑦",
    en: "The top-shelf potato chips cost 25 percent more, and customers who reached for the top shelf demonstrated that they hadn't made a price-comparison between two near-identical products in near-identical locations.",
    ans: "S The top-shelf potato chips · △V cost · O 25 percent more · [and] S customers · [who] △V′ reached · M for the top shelf · △V demonstrated · [that] S′ they · △V′ hadn't made · O a price-comparison between two near-identical products in near-identical locations",
    ko: "위 선반의 감자칩은 25퍼센트 더 비쌌고, 위 선반으로 손을 뻗은 손님들은 거의 같은 자리에 놓인 거의 같은 두 제품의 값을 견주지 않았음을 보여 주었다."
   },
   {
    n: "⑬",
    en: "The random element is there so that only shoppers who are careful to notice, remember, and compare prices will get the best bargains.",
    ans: "S The random element · △V is · M there · [so that] S′ only shoppers who are careful to notice, remember, and compare prices · △V′ will get · O the best bargains",
    ko: "값을 알아채고 기억하고 견주는 데 신경 쓰는 손님만이 가장 싼값을 얻도록, 그 무작위성이 거기에 있다."
   }
  ]
 },
 syn: [
  {
   n: "③",
   name: "such + 명사 + that (너무 ~해서 …하다)",
   q: "…buys «such small quantities that he doesn't think to check»…",
   d: "<b>such A that B</b>는 ‘너무 A라서 B하다’로 읽는다. 원인과 결과가 한 문장에 담긴다.",
   k: "너무 적은 양을 사서 확인할 생각을 못 한다"
  },
  {
   n: "②",
   name: "배수 + as ~ as (몇 배만큼 ~한)",
   q: "…charge «ten times as much for fresh chili peppers in a package as for loose fresh chilies»?",
   d: "<b>배수 + as … as</b>는 ‘~의 몇 배만큼’이다. 견주는 두 대상을 as 앞뒤에서 찾는다.",
   k: "낱개 고추의 열 배만큼"
  }
 ],
 synd: [
  { u: "구문 1", en: "It was such a small change that no one noticed.", k: "너무 작은 변화라서 아무도 알아채지 못했다." },
  { u: "구문 2", en: "The packet costs three times as much as the loose fruit.", k: "그 봉지는 낱개 과일의 세 배만큼 값이 든다." },
  { u: "구문 1 + 2", en: "He paid such a high price that it was twice as much as last week's.", k: "그는 너무 높은 값을 치러서, 그것은 지난주의 두 배만큼이었다." }
 ],
 why: [
  ["고추 재배법은 글에 나오지 않는다"],
  ["정답"],
  ["글은 값이 제멋대로 바뀐다고 말한다 — 정반대다"],
  ["감자칩 조리법은 글의 관심사가 아니다"],
  ["매장 입구 설계는 글의 초점이 아니다"]
 ],
 src: [["②"], ["③"], ["⑦과 어긋남 — 위 선반이 25퍼센트 더 비쌌다"], ["⑫"], ["⑬"]],
 kb: {
  title: "값을 견주는 힘",
  lead: "무작위한 값표가 노리는 것",
  items: [
   ["가격 차별", "같은 물건에 손님마다 다른 값을 받아 내는 일을 가격 차별(price discrimination)이라 한다. 값을 견주지 않는 손님이 더 많이 내는 구조다."],
   ["단위 가격", "많은 나라의 매장은 100g 이나 1L 당 값을 함께 적도록 정해 두었다. 봉지와 낱개를 견줄 때 이 단위 가격이 가장 빠른 잣대다."],
   ["선반 높이", "손이 가장 먼저 닿는 자리일수록 진열 값이 비싸다. 위나 아래 선반에 같은 물건이 다른 값으로 놓이는 일이 잦은 까닭이다."]
  ],
  ask: "장을 볼 때 값을 견주어 본 물건과 그러지 않은 물건은 어떻게 나뉘는가?"
 },
 wtype: ["무관", "정답", "반대", "무관", "지엽"],
 stype: ["일치", "일치", "반대", "일치", "일치"]
},

/* ───────────────────────────── 50 ───────────────────────────── */
{
 no: "50", key: "giffen", accent: "#B0782A", tint: "#F8EFDC", deep: "#7C5312",
 en: "When Higher Prices Increase Demand",
 ko: "값이 오르면 더 사는 물건",
 goal: "기펜재가 성립하는 세 조건과, 소득 효과가 대체 효과를 넘어서는 과정을 설명할 수 있다.",
 fig: "Figure 1  뒤집힌 수요 곡선과 그 이유.",
 tip: "먼저 생각해 보자. 값이 오르는데도 오히려 더 사게 되는 물건이 있을까?",
 sent: T(50).sent, kor: T(50).kor,
 bank: [
  ["commodity", "①", "상품"],
  ["assumption", "②", "가정"],
  ["inferior good", "③", "열등재"],
  ["staple", "⑥", "주식"],
  ["substitution effect", "⑨", "대체 효과"],
  ["outweigh", "⑪", "능가하다"]
 ],
 defs: [
  ["commodity", "a good that is bought and sold"],
  ["assumption", "something taken to be true without proof"],
  ["inferior good", "a good people buy less of as they earn more"],
  ["staple", "the basic food a diet is built on"],
  ["substitution effect", "the shift to a good that now costs less"],
  ["outweigh", "to be greater than something else"]
 ],
 defOrder: [5, 0, 3, 1, 4, 2],
 flow: [
  ["The name", "Goods whose demand rises with price are Giffen goods", null],
  ["First", "It must be an (  ①  ) good, like bread beside meat", "inferior"],
  ["Second", "It must take a large part of the buyer's (  ②  )", "income"],
  ["Third", "There must be no cheaper (  ③  ) to it", "alternative"],
  ["The result", "The income effect (  ④  ) the substitution effect", "outweighs"]
 ],
 flowBogi: "inferior · income · alternative · outweighs · superior · follows",
 para: [
  ["① demand rises as their prices rise", "People buy more when the price goes ______.", "up"],
  ["③ a good that people choose to buy less of", "They want less of it as they get ______.", "richer"],
  ["⑤ there must be no alternatives to the product", "Nothing else can ______ its place.", "take"],
  ["⑩ it also reduces the power to spend", "A higher price leaves less to ______.", "spend"],
  ["⑫ rising prices allegedly caused an increase", "In the famine, higher prices ______ demand.", "raised"]
 ],
 paraBogi: "up · richer · take · spend · raised · down · poorer · cut",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "A History of Irish Farming",
    "The Good That Breaks the Rule",
    "Why Bread Prices Never Change",
    "How to Bake a Cheap Loaf",
    "The Life of Robert Giffen"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "기펜재는 값이 오를수록 수요가 늘어나는 상품이다.",
    "열등재는 소득이 늘면 사람들이 덜 사게 되는 재화다.",
    "기펜재가 되려면 그 상품에 대체재가 없어야 한다.",
    "대체 효과는 값이 오른 빵을 더 많이 사게 만든다.",
    "아일랜드 대기근 때의 감자도 기펜재의 예로 이야기된다."
   ], ans: 4
  },
  {
   t: "write", q: "값이 올랐는데도 빵을 더 사게 되는 과정을 우리말 한 문장으로 써 보세요.",
   ans: "빵값이 오르면 다른 데 쓸 돈이 줄고, 그 줄어든 소득이 열등재인 빵의 수요를 늘리기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "⑨",
   toks: [
    ["This substitution effect", "s"], ["would cause", "v"],
    ["bread to follow the general rule of higher price causing lower demand.", null]
   ],
   ko: "이 대체 효과는 빵이 ‘값이 오르면 수요가 준다’는 일반 규칙을 따르게 만들 것이다."
  },
  drill: [
   {
    n: "⑥",
    en: "In the case of bread, there is no cheaper alternative staple.",
    ans: "M In the case of bread · △V there is · C no cheaper alternative staple",
    ko: "빵의 경우에는 더 싼 대체 주식이 없다."
   },
   {
    n: "⑧",
    en: "It causes people to buy less bread because the satisfaction it creates per pound of spending falls compared to other goods.",
    ans: "S It · △V causes · O people to buy less bread · [because] S′ the satisfaction it creates per pound of spending · △V′ falls · M compared to other goods",
    ko: "그것은 지출 1파운드당 만들어 내는 만족이 다른 재화에 견주어 떨어지기 때문에 사람들이 빵을 덜 사게 만든다."
   },
   {
    n: "⑩",
    en: "However, as the price of bread rises, it also reduces the power to spend on other things, and because bread is an inferior good, this lower income will make the demand for bread rise.",
    ans: "M However · [as] S′ the price of bread · △V′ rises · S it · △V also reduces · O the power to spend on other things · [and] [because] S′ bread · △V′ is · C an inferior good · S this lower income · △V will make · O the demand for bread rise",
    ko: "그러나 빵값이 오르면 다른 것에 쓸 힘도 줄어들고, 빵이 열등재이기 때문에 이 낮아진 소득이 빵의 수요를 늘리게 된다."
   }
  ]
 },
 syn: [
  {
   n: "⑪",
   name: "so + 형용사 + that (너무 ~해서 …하다)",
   q: "…the income effect is «so large that it outweighs the substitution effect»…",
   d: "<b>so A that B</b>는 ‘너무 A라서 B하다’다. A 자리에는 형용사·부사가 온다.",
   k: "너무 커서 대체 효과를 넘어선다"
  },
  {
   n: "⑩",
   name: "make + 목적어 + 동사원형 (~하게 만들다)",
   q: "…this lower income «will make the demand for bread rise».",
   d: "<b>make + 목적어 + 동사원형</b>은 ‘~이 …하게 만들다’다. to 가 붙지 않는 데 주의한다.",
   k: "빵 수요가 오르게 만든다"
  }
 ],
 synd: [
  { u: "구문 1", en: "The rise was so sharp that families cut everything else.", k: "그 인상은 너무 가팔라서 가정들은 다른 모든 것을 줄였다." },
  { u: "구문 2", en: "A cheaper staple makes demand fall again.", k: "더 싼 주식은 수요를 다시 떨어지게 만든다." },
  { u: "구문 1 + 2", en: "The price was so high that it made buyers change their whole basket.", k: "값이 너무 높아서 그것은 구매자들이 장바구니 전체를 바꾸게 만들었다." }
 ],
 why: [
  ["아일랜드 농업의 역사는 글에 나오지 않는다"],
  ["정답"],
  ["글은 값이 오르는 상황을 다룬다 — 정반대다"],
  ["빵 굽는 법은 글의 관심사가 아니다"],
  ["Giffen 개인의 생애는 글의 초점이 아니다"]
 ],
 src: [["①"], ["③"], ["⑤"], ["⑧·⑨와 어긋남 — 대체 효과는 빵을 덜 사게 만든다"], ["⑫"]],
 kb: {
  title: "기펜재",
  lead: "규칙을 깨는 재화",
  items: [
   ["이름의 유래", "스코틀랜드 통계학자 로버트 기펜(Robert Giffen)의 이름에서 왔다. 앨프리드 마셜이 자신의 경제학 교과서에서 이 사례를 소개하며 그의 이름을 붙였다."],
   ["두 효과", "값이 오르면 대체 효과는 그 재화를 덜 사게 만들고, 소득 효과는 실질 소득을 줄인다. 열등재에서는 소득이 줄면 오히려 그 재화를 더 사게 된다."],
   ["실제 관찰", "2007년 중국 후난성과 간쑤성의 쌀·밀 소비를 조사한 연구가 기펜 행동을 관찰했다고 보고했다. 사례가 드물어 오랫동안 이론상의 재화로 불렸다."]
  ],
  ask: "값이 올랐는데도 줄일 수 없는 물건이 여러분에게 있다면 무엇일까?"
 },
 wtype: ["무관", "정답", "반대", "무관", "지엽"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
}

 ]
};
