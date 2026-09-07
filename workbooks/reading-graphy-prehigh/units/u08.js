/* Unit 8 · Politics, Law & History — 원문 Theme 36–40 */
const R = require("../src/orig/all.json");
const T = n => R[n - 1];

module.exports = {
 no: 8,
 field: "Politics, Law & History",
 ko: "정치·법·역사",
 tagline: "만들어진 것들 — 규칙과 이야기와 제도",
 next: { en: "Education, Psychology & Language", ko: "배우고 기억하는 방식을 읽습니다", words: "219–255 words" },
 lessons: [

/* ───────────────────────────── 36 ───────────────────────────── */
{
 no: "36", key: "thrift", accent: "#38618F", tint: "#E6EDF5", deep: "#213E63",
 en: "Policies in a Recession",
 ko: "덜 쓸까, 더 쓸까",
 goal: "불황에 대한 두 정책 방향과 필자가 각 방향에 붙이는 근거를 대비해 설명할 수 있다.",
 fig: "Figure 1  한 사람의 지출이 다른 사람의 소득이 되는 고리.",
 tip: "먼저 생각해 보자. 모두가 동시에 아끼면 나라 전체의 살림은 나아질까?",
 sent: T(36).sent, kor: T(36).kor,
 bank: [
  ["recession", "①", "불황"],
  ["federal", "③", "연방의"],
  ["austerity", "⑤", "긴축"],
  ["preclude", "⑥", "배제하다"],
  ["intervention", "⑥", "개입"],
  ["workforce", "⑩", "인력"]
 ],
 defs: [
  ["recession", "a period when business slows down"],
  ["federal", "of the central government of a nation"],
  ["austerity", "cutting public spending very hard"],
  ["preclude", "to make something impossible"],
  ["intervention", "a step taken to change what happens"],
  ["workforce", "all the people who work for a firm"]
 ],
 defOrder: [2, 5, 0, 4, 1, 3],
 flow: [
  ["The question", "In a recession, should a government spend more or less?", null],
  ["Spend more", "Roosevelt's (  ①  ) spending seemed to restart the economy", "federal"],
  ["Its name", "This is traditionally the approach favoured by (  ②  )", "Keynes"],
  ["Spend less", "Austerity cuts (  ③  ) to lift private investment", "taxes"],
  ["The record", "Investors tend to (  ④  ) on to their money in a slump", "hold"]
 ],
 flowBogi: "federal · Keynes · taxes · hold · Roosevelt · spend",
 para: [
  ["③ appeared to guide the economy back on track", "It seemed to put the economy back on its ______.", "feet"],
  ["⑥ precluding the need for intervention", "It would ______ away the need to step in.", "take"],
  ["⑦ in order to cut taxes you need to decrease", "Lower taxes require ______ spending.", "less"],
  ["⑧ already driven into poverty during a recession", "People pushed into ______ by the downturn.", "poverty"],
  ["⑩ investors tend to hold on to their money", "They ______ their money instead of spending.", "keep"]
 ],
 paraBogi: "feet · take · less · poverty · keep · knees · put · more",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "Who Franklin D. Roosevelt Was",
    "Two Answers to the Same Downturn",
    "Austerity Has Already Proved Itself",
    "How to Read a Company Balance Sheet",
    "A History of the British Pound"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "1930년대 대공황기 미국의 연방 지출 증가는 경제를 정상 궤도로 이끈 것처럼 보였다.",
    "케인스 경제학은 서구 학계에서 가장 널리 받아들여지는 경제 철학이다.",
    "긴축은 세금을 줄이면 민간의 지출과 투자가 늘어난다는 믿음 위에서 작동한다.",
    "긴축은 이미 여러 곳에서 뚜렷한 성공 사례를 만들어 냈다.",
    "투자자들은 불황 동안 돈을 붙잡아 두는 경향이 있다."
   ], ans: 4
  },
  {
   t: "write", q: "세금을 줄이는 일에 무엇이 함께 따라오며 그것이 왜 인기가 없는지 우리말 한 문장으로 써 보세요.",
   ans: "세금을 줄이려면 정부 지출도 줄여야 하는데, 불황으로 이미 빈곤에 몰린 많은 사람에게 정부 지원까지 줄어들기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "⑥",
   toks: [
    ["Inspired by supply-side economics,", "m"], ["austerity", "s"], ["operates", "v"],
    ["on the belief", "m"], ["that", "c"], ["if", "c"], ["you", "s2"], ["cut", "v2"],
    ["taxes, especially for investors and corporations,", null], ["it", "s2"], ["will increase", "v2"],
    ["private-sector spending and investment,", null],
    ["precluding the need for dramatic government intervention.", "m"]
   ],
   ko: "공급 측면 경제학에서 영감을 받은 긴축은, 특히 투자자와 기업의 세금을 줄이면 민간 부문의 지출과 투자가 늘어 정부의 대대적인 개입이 필요 없게 된다는 믿음 위에서 작동한다."
  },
  drill: [
   {
    n: "④",
    en: "This is traditionally the approach favored by the British economist John Maynard Keynes, whose overall system, referred to as Keynesian economics, is the most widely accepted economic philosophy in Western academic circles.",
    ans: "S This · △V is · C traditionally the approach favored by the British economist John Maynard Keynes · [whose] S′ overall system · △V′ is · C the most widely accepted economic philosophy in Western academic circles",
    ko: "이는 전통적으로 영국 경제학자 John Maynard Keynes 가 선호한 접근으로, 케인스 경제학이라 불리는 그의 체계는 서구 학계에서 가장 널리 받아들여지는 경제 철학이다."
   },
   {
    n: "⑧",
    en: "This creates an unpopular situation where a large number of people, already driven into poverty during a recession, find that their government support system is also getting smaller.",
    ans: "S This · △V creates · O an unpopular situation · [where] S′ a large number of people · △V′ find · [that] S′ their government support system · △V′ is also getting smaller",
    ko: "이는 불황으로 이미 빈곤에 몰린 많은 사람이 정부 지원 제도마저 줄어드는 것을 알게 되는, 인기 없는 상황을 만든다."
   },
   {
    n: "⑪",
    en: "But neoliberals continue to experiment with different austerity policies, looking for a private-sector, supply-side solution to recessions that can rescue an economy without increasing taxes or the size of the government.",
    ans: "[But] S neoliberals · △V continue · O to experiment with different austerity policies · M looking for a private-sector, supply-side solution to recessions that can rescue an economy without increasing taxes or the size of the government",
    ko: "그러나 신자유주의자들은 세금이나 정부 규모를 늘리지 않고 경제를 구할 민간·공급 측면의 해법을 찾으며 여러 긴축 정책을 계속 실험한다."
   }
  ]
 },
 syn: [
  {
   n: "④",
   name: "소유격 관계대명사 whose (계속적 용법)",
   q: "…John Maynard Keynes, «whose overall system, referred to as Keynesian economics, is the most widely accepted»…",
   d: "<b>whose</b>가 앞의 사람을 받아 ‘그의 ~는’으로 이어진다. 앞에 콤마가 있으면 설명을 덧붙이는 쓰임이다.",
   k: "그의 종합 체계는 ~이다"
  },
  {
   n: "⑩",
   name: "계속적 용법의 which (앞 명사를 받음)",
   q: "…investors tend to hold on to their money during recessions, «which are also not generally regarded as ideal times»…",
   d: "<b>which</b>가 앞의 <b>recessions</b>를 받아 설명을 덧붙인다. ‘그런데 그것들은 ~’으로 이어 읽는다.",
   k: "그런데 불황은 이상적인 시기로 여겨지지도 않는다"
  }
 ],
 synd: [
  { u: "구문 1", en: "She cited an economist whose model predicted the fall.", k: "그녀는 그 하락을 예측한 모형을 낸 경제학자를 인용했다." },
  { u: "구문 2", en: "He cut the budget, which angered many voters.", k: "그는 예산을 삭감했고, 그것이 많은 유권자를 화나게 했다." },
  { u: "구문 1 + 2", en: "They followed a scholar whose plan cut taxes, which pleased investors.", k: "그들은 세금을 줄이는 계획을 낸 학자를 따랐고, 그것이 투자자들을 기쁘게 했다." }
 ],
 why: [
  ["대통령 개인의 이력은 글의 초점이 아니다"],
  ["정답"],
  ["글은 긴축이 아직 뚜렷한 성공 사례를 내지 못했다고 말한다 — 정반대다"],
  ["재무제표 읽는 법은 글에 나오지 않는다"],
  ["화폐의 역사는 글에서 다루지 않는다"]
 ],
 src: [["③"], ["④"], ["⑥"], ["⑨와 어긋남 — 아직 뚜렷한 성공 사례를 내지 못했다"], ["⑩"]],
 kb: {
  title: "절약의 역설",
  lead: "모두가 아끼면 무슨 일이 일어나나",
  items: [
   ["한 사람의 지출은 다른 사람의 소득", "케인스는 개인에게 옳은 절약이 모두가 동시에 하면 총수요를 줄여 소득을 떨어뜨린다고 보았다. 이를 절약의 역설(paradox of thrift)이라 한다."],
   ["뉴딜", "루스벨트 정부는 1933년부터 공공사업으로 일자리를 만들고 사회 보장 제도를 세웠다. 공공사업진흥국(WPA)은 도로·다리·학교와 함께 예술·기록 사업까지 벌였다."],
   ["1936년의 책", "케인스의 『고용·이자 및 화폐의 일반이론』은 1936년에 나왔다. 뉴딜보다 뒤에 나온 책이지만, 그 정책을 설명하는 이론 틀이 되었다."]
  ],
  ask: "여러분의 절약이 다른 누군가의 소득을 줄인 적이 있다면, 그것은 어떤 경우였을까?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 37 ───────────────────────────── */
{
 no: "37", key: "camera", accent: "#A9503A", tint: "#F8EBE6", deep: "#77301C",
 en: "The Media and the Presidency",
 ko: "서로 필요하면서 서로 미워하는 사이",
 goal: "대통령과 기자단의 관계를 갈등과 공생의 두 면으로 나누어 설명할 수 있다.",
 fig: "Figure 1  기자 몇 명, 라디오 한 대, 카메라 수천 대.",
 tip: "먼저 생각해 보자. 서로를 불편해하면서도 헤어지지 못하는 관계는 어떤 모습일까?",
 sent: T(37).sent, kor: T(37).kor,
 bank: [
  ["beat reporter", "②", "특정 분야 담당 기자"],
  ["grandstand", "④", "과시하다"],
  ["feud", "⑥", "반목하다"],
  ["vendetta", "⑧", "앙심"],
  ["symbiotic", "⑪", "공생하는"],
  ["exclusive", "⑭", "독점적인"]
 ],
 defs: [
  ["beat reporter", "a writer who covers one fixed area"],
  ["grandstand", "to act so as to impress watchers"],
  ["feud", "to quarrel bitterly for a long time"],
  ["vendetta", "a long quarrel driven by revenge"],
  ["symbiotic", "two sides living on each other"],
  ["exclusive", "given to one person and no other"]
 ],
 defOrder: [3, 0, 5, 1, 4, 2],
 flow: [
  ["The scale", "Covering the president is an industry of its own", null],
  ["The routine", "Two briefings a day from the press (  ①  )", "secretary"],
  ["The conflict", "Some reporters (  ②  ) for the cameras", "grandstand"],
  ["The feuds", "Nixon, Clinton, and Bush each fell out with a (  ③  )", "paper"],
  ["The bond", "Each side needs the other — a (  ④  ) relationship", "symbiotic"]
 ],
 flowBogi: "secretary · grandstand · paper · symbiotic · gardener · hostile",
 para: [
  ["② journalists who cover the White House", "Reporters who watch it every ______.", "day"],
  ["⑤ the press is on call twenty-four hours a day", "They are ready ______ the clock.", "around"],
  ["⑧ a reporter with a vendetta against the president", "A reporter said to hold a ______.", "grudge"],
  ["⑩ in return for favorable coverage", "He traded access for kind ______.", "reporting"],
  ["⑬ leak information to select journalists", "Staff pass news to a ______ few.", "chosen"]
 ],
 paraBogi: "day · around · grudge · reporting · chosen · night · past · every",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "What a ‘Lid’ Means in the Press Room",
    "Enemies Who Cannot Do Without Each Other",
    "Presidents and Reporters Have Never Clashed",
    "How to Become a White House Reporter",
    "A History of the White House Building"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "수백 명의 특정 분야 담당 기자가 백악관 지하에서 일한다.",
    "기자들은 하루 두 번 공보 담당 비서를 만나 그날의 일정을 브리핑받는다.",
    "닉슨은 워싱턴 포스트와 뉴욕 타임스를 싫어해 부통령이 공개 공격하게 했다.",
    "케네디 대통령은 기자단과 늘 냉랭한 관계를 유지했다.",
    "백악관 직원이 보도 방향을 만들려고 특정 기자에게 정보를 흘리는 일은 드물지 않다."
   ], ans: 4
  },
  {
   t: "write", q: "대통령과 기자단이 공생 관계라고 필자가 보는 근거를 우리말 한 문장으로 써 보세요.",
   ans: "대통령은 자기 메시지를 전하려면 언론이 필요하고, 언론은 제 일을 하려면 대통령에게 접근할 수 있어야 하기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "⑤",
   toks: [
    ["Typically,", "m"], ["the press", "s"], ["is", "v"],
    ["on call twenty-four hours a day,", null], ["unless", "c"], ["the press secretary", "s2"],
    ["puts", "v2"], ["a “lid” on the news,", null], ["which", "c"], ["means", "v2"],
    ["that no big announcements are planned.", null]
   ],
   ko: "보통 언론은 하루 24시간 대기하는데, 공보 담당 비서가 뉴스에 ‘뚜껑’을 덮는 경우는 예외이며 이는 큰 발표가 예정되어 있지 않다는 뜻이다."
  },
  drill: [
   {
    n: "④",
    en: "Television cameras covering these briefings have been a frequent source of conflict between the press secretary and the press, as some journalists use these press briefings as an opportunity to grandstand for the cameras.",
    ans: "S Television cameras covering these briefings · △V have been · C a frequent source of conflict between the press secretary and the press · [as] S′ some journalists · △V′ use · O these press briefings as an opportunity to grandstand for the cameras",
    ko: "이 브리핑을 취재하는 텔레비전 카메라는 공보 담당 비서와 언론 사이의 잦은 갈등거리였는데, 일부 기자가 브리핑을 카메라 앞에서 과시할 기회로 쓰기 때문이다."
   },
   {
    n: "⑩",
    en: "President Kennedy, on the other hand, enjoyed a friendly relationship with the press corps, partly because he singled out favorites for special treatment in return for favorable coverage.",
    ans: "S President Kennedy · M on the other hand · △V enjoyed · O a friendly relationship with the press corps · [because] S′ he · △V′ singled out · O favorites for special treatment in return for favorable coverage",
    ko: "반면 케네디 대통령은 기자단과 우호적인 관계를 누렸는데, 호의적인 보도의 대가로 마음에 드는 사람을 골라 특별 대우를 했기 때문이기도 하다."
   },
   {
    n: "⑫",
    en: "The president needs the press to deliver his message, and the press needs access to the president in order to do its job.",
    ans: "S The president · △V needs · O the press to deliver his message · and S the press · △V needs · O access to the president · M in order to do its job",
    ko: "대통령은 자기 메시지를 전하려고 언론이 필요하고, 언론은 제 일을 하려고 대통령에게 접근할 길이 필요하다."
   }
  ]
 },
 syn: [
  {
   n: "⑨",
   name: "동격의 명사구 + 관계절",
   q: "…to describe New York Times reporter Adam Clymer, «a sentiment that Vice President Cheney agreed with».",
   d: "콤마 뒤 명사구가 앞 절 전체를 받아 다시 이름 붙인다. 그 명사구를 다시 <b>that절</b>이 꾸민다.",
   k: "체니 부통령도 동의한 생각이었다"
  },
  {
   n: "⑬",
   name: "가주어 It + for + 의미상 주어 + to부정사",
   q: "«It's not uncommon for White House staffers to leak information» to select journalists…",
   d: "<b>it</b>이 가주어, <b>to부정사</b>가 진주어다. 그 앞의 <b>for + 명사</b>가 to부정사의 주어 노릇을 한다.",
   k: "백악관 직원이 정보를 흘리는 일은 드물지 않다"
  }
 ],
 synd: [
  { u: "구문 1", en: "He left without a word, a choice that surprised everyone.", k: "그는 한마디 없이 떠났는데, 그것은 모두를 놀라게 한 선택이었다." },
  { u: "구문 2", en: "It is common for reporters to work late into the night.", k: "기자들이 밤늦게까지 일하는 것은 흔한 일이다." },
  { u: "구문 1 + 2", en: "It is rare for an aide to speak openly, a habit that few editors trust.", k: "보좌관이 공개적으로 말하는 일은 드물고, 그것은 편집자들이 거의 신뢰하지 않는 습관이다." }
 ],
 why: [
  ["문장 ⑤의 용어 하나만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 대부분의 대통령이 특정 기자·매체와 반목했다고 말한다 — 정반대다"],
  ["기자가 되는 방법은 글에 나오지 않는다"],
  ["건물의 역사는 글에서 다루지 않는다"]
 ],
 src: [["②"], ["③"], ["⑦"], ["⑩과 어긋남 — 기자단과 우호적인 관계를 누렸다"], ["⑬"]],
 kb: {
  title: "브리핑룸이라는 무대",
  lead: "누가 누구를 필요로 하는가",
  items: [
   ["백악관 브리핑룸", "정식 이름은 James S. Brady Press Briefing Room 이다. 1981년 총격으로 다친 공보 담당 비서 James Brady 의 이름을 따 2000년에 붙였다. 좌석은 49석뿐이고, 매체별 배정은 백악관기자협회가 정한다."],
   ["‘뚜껑’이라는 은어", "lid 는 그날 더는 큰 발표가 없다는 뜻의 백악관 은어다. lid 가 걸리면 기자들이 자리를 비울 수 있다."],
   ["기록으로 남은 반목", "닉슨 행정부는 언론 비판을 부통령 Spiro Agnew 의 연설로 앞세웠고, 워싱턴 포스트의 워터게이트 보도는 결국 대통령의 사임으로 이어졌다. 갈등과 의존이 함께 있던 시기를 보여 주는 사례다."]
  ],
  ask: "서로 불편해하면서도 필요로 하는 관계를 여러분 주변에서 찾을 수 있는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 38 ───────────────────────────── */
{
 no: "38", key: "arthur", accent: "#6B5498", tint: "#EFEBF7", deep: "#453370",
 en: "The Man Who Shaped Arthurian Legends",
 ko: "역사상 가장 인상적인 거짓말",
 goal: "『브리튼 왕들의 역사』가 남긴 영향과 그 책이 신뢰를 잃은 과정을 함께 설명할 수 있다.",
 fig: "Figure 1  조각들이 한 사람의 손에서 하나가 되는 자리.",
 tip: "먼저 생각해 보자. 사실이 아닌 이야기가 오래 살아남는 이유는 무엇일까?",
 sent: T(38).sent, kor: T(38).kor,
 bank: [
  ["groundwork", "①", "토대"],
  ["at face value", "②", "액면 그대로"],
  ["fabrication", "④", "조작, 날조"],
  ["concrete", "⑥", "구체적인"],
  ["redundant", "⑧", "중복되는"],
  ["pseudo-historian", "⑨", "가짜 역사가"]
 ],
 defs: [
  ["groundwork", "the base that later work rests on"],
  ["at face value", "as it appears, without doubting"],
  ["fabrication", "something made up and untrue"],
  ["concrete", "solid and able to be checked"],
  ["redundant", "no longer needed or useful"],
  ["pseudo-historian", "one who only appears to do history"]
 ],
 defOrder: [4, 1, 5, 0, 3, 2],
 flow: [
  ["What it did", "Monmouth defined Arthur's character and family", null],
  ["The fall", "Scholars saw the leap in (  ①  ) the book demanded", "logic"],
  ["The warning", "Thompson's 1718 translation carried a long (  ②  )", "introduction"],
  ["The unknown", "We may never know why he wrote so much (  ③  )", "fabrication"],
  ["The legacy", "Two Shakespeare (  ④  ) and countless books and films", "plays"]
 ],
 flowBogi: "logic · introduction · fabrication · plays · silence · poems",
 para: [
  ["① laid the groundwork that future Arthurian writers", "It set the ______ for later writers.", "base"],
  ["② began to fall out of favour", "It slowly lost its ______.", "standing"],
  ["③ opening a Pandora's box of misinformation", "Letting loose a flood of ______ claims.", "false"],
  ["⑥ with little concrete evidence that he was", "There is almost no ______ proof.", "solid"],
  ["⑨ his lies make him perhaps one of the greatest", "His untruths made him a great ______.", "writer"]
 ],
 paraBogi: "base · standing · false · solid · writer · roof · fame · true",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "Who Aaron Thompson Was",
    "A Lie That Outlived Its Author",
    "The History Is Now Accepted as Accurate",
    "How to Translate a Latin Chronicle",
    "The Life of William Shakespeare"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "Monmouth 는 아서 왕의 성격과 가족사, Merlin 과의 강한 유대를 정의했다.",
    "1718년 Aaron Thompson 이 The History 의 첫 영어 번역본을 냈다.",
    "아서 왕이 실존 인물이라는 구체적인 증거는 거의 없다.",
    "그 이름을 가진 9세기 군벌과 10세기 웨일스 지도자의 기록은 남아 있지 않다.",
    "The History 의 문화적 유산은 셰익스피어 희곡 두 편에까지 이른다."
   ], ans: 4
  },
  {
   t: "write", q: "Thompson 이 번역본에 긴 서문을 붙인 이유를 우리말 한 문장으로 써 보세요.",
   ans: "Monmouth 의 글을 다시 찍어 내면 잘못된 정보의 판도라 상자를 여는 셈이 될까 봐 걱정해, 그 책이 야만적이고 여러 곳에서 불분명하다는 점을 독자에게 거듭 알리려 했기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "②",
   toks: [
    ["Still, eventually,", "m"], ["The History", "s"], ["began", "v"],
    ["to fall out of favour,", null], ["as", "c"], ["scholars", "s2"], ["started", "v2"],
    ["to realize how much of a massive jump in logic needed to be taken to read the whole book at face value.", null]
   ],
   ko: "그럼에도 결국 The History 는 인기를 잃기 시작했는데, 책 전체를 액면 그대로 읽으려면 얼마나 큰 논리의 비약이 필요한지 학자들이 깨닫기 시작했기 때문이다."
  },
  drill: [
   {
    n: "①",
    en: "The History of the Kings of Britain laid the groundwork that future Arthurian writers, such as Marie de France and Sir Thomas Malory, would build upon, with Monmouth defining King Arthur's personality and family history, as well as his strong ties to Merlin.",
    ans: "S The History of the Kings of Britain · △V laid · O the groundwork · [that] S′ future Arthurian writers · △V′ would build upon · M with Monmouth defining King Arthur's personality and family history, as well as his strong ties to Merlin",
    ko: "『브리튼 왕들의 역사』는 Marie de France 와 Thomas Malory 경 같은 훗날의 아서 왕 작가들이 그 위에 쌓아 올릴 토대를 놓았고, Monmouth 는 아서 왕의 성격과 가족사, Merlin 과의 강한 유대를 정의했다."
   },
   {
    n: "⑤",
    en: "Still, it's perhaps one of history's most impressive lies and still impacts our lives today.",
    ans: "M Still · △V it's · C perhaps one of history's most impressive lies · and △V still impacts · O our lives today",
    ko: "그럼에도 그것은 아마 역사상 가장 인상적인 거짓말 가운데 하나이며, 오늘날에도 우리 삶에 영향을 미친다."
   },
   {
    n: "⑨",
    en: "Geoffrey of Monmouth may still be seen by many to be a pseudo-historian, but his lies make him perhaps one of the greatest fiction writers of all time.",
    ans: "S Geoffrey of Monmouth · △V may still be seen · C to be a pseudo-historian · M by many · [but] S his lies · △V make · O him perhaps one of the greatest fiction writers of all time",
    ko: "Geoffrey of Monmouth 는 여전히 많은 사람에게 가짜 역사가로 여겨질지 모르지만, 그의 거짓말은 그를 아마 역대 가장 위대한 허구 작가 가운데 하나로 만든다."
   }
  ]
 },
 syn: [
  {
   n: "③",
   name: "so + 형용사 + that절",
   q: "…«was so worried that … he'd be opening a Pandora's box of misinformation that he included a large tome of an introduction»…",
   d: "‘너무 ~해서 …하다’를 나타낸다. 여기서는 <b>so worried</b>와 뒤의 <b>that he included</b>가 짝을 이룬다.",
   k: "너무 걱정한 나머지 대량의 서문을 붙였다"
  },
  {
   n: "⑧",
   name: "명사 + aside (~은 제쳐 두고)",
   q: "«Slightly redundant historic arguments aside,» the cultural legacy of The History is almost as unbelievable as its source material…",
   d: "<b>aside</b>가 앞의 명사구 뒤에 붙어 ‘~은 접어 두고’라는 뜻의 부사구를 만든다.",
   k: "다소 중복되는 역사 논쟁은 제쳐 두고"
  }
 ],
 synd: [
  { u: "구문 1", en: "He was so unsure that he wrote three warnings in the preface.", k: "그는 너무 확신이 없어서 서문에 경고를 세 번 썼다." },
  { u: "구문 2", en: "Style aside, the book is a valuable record of its time.", k: "문체는 제쳐 두고, 그 책은 그 시대의 값진 기록이다." },
  { u: "구문 1 + 2", en: "Errors aside, the work was so popular that copies spread across Europe.", k: "오류는 제쳐 두고, 그 저작은 너무 인기가 많아서 사본이 유럽 전역에 퍼졌다." }
 ],
 why: [
  ["번역자 한 사람은 글의 초점이 아니다"],
  ["정답"],
  ["글은 그 책이 인기를 잃기 시작했다고 말한다 — 정반대다"],
  ["번역하는 방법은 글에 나오지 않는다"],
  ["셰익스피어의 생애는 글에서 다루지 않는다"]
 ],
 src: [["①"], ["③"], ["⑥"], ["⑦과 어긋남 — 그 이름을 가진 두 인물의 기록이 있다"], ["⑧"]],
 kb: {
  title: "한 권이 만든 전설",
  lead: "지어낸 이야기가 역사가 되기까지",
  items: [
   ["1136년의 책", "Geoffrey of Monmouth 의 『Historia Regum Britanniae』는 1136년 무렵 라틴어로 쓰였다. 브루투스에서 아서 왕까지 브리튼 왕들의 계보를 이어 붙인 이 책은 중세에 가장 널리 필사된 책 가운데 하나가 되었다."],
   ["당대의 반박", "12세기 후반의 역사가 William of Newburgh 는 Geoffrey 의 서술을 두고 뻔뻔한 거짓말이라고 적었다. 당시에도 의심하는 사람이 있었다는 뜻이다."],
   ["뒤에 덧붙은 층", "성배와 랜슬롯 이야기는 Geoffrey 의 책에 없다. 12세기 프랑스의 Chrétien de Troyes 가 덧붙였고, 1485년 Thomas Malory 의 『Le Morte d'Arthur』가 이 층들을 하나로 묶었다."]
  ],
  ask: "지금 우리가 ‘원래 그런 이야기’로 아는 것 가운데, 누군가가 지어 붙인 층은 무엇일까?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 39 ───────────────────────────── */
{
 no: "39", key: "harvest", accent: "#47784A", tint: "#E8F1E7", deep: "#2C4F2E",
 en: "The Harsh Reality of Pre-Agricultural and Agricultural Life",
 ko: "낭만이 걷힌 자리",
 goal: "수렵채집 생활과 농경 생활의 조건을 견주어 무엇이 나아지고 무엇이 나빠졌는지 설명할 수 있다.",
 fig: "Figure 1  늘어난 사람 수와 낮아진 키.",
 tip: "먼저 생각해 보자. 평균 기대 수명이 30세라는 말은 모두가 서른에 죽었다는 뜻일까?",
 sent: T(39).sent, kor: T(39).kor,
 bank: [
  ["romanticize", "①", "낭만적으로 묘사하다"],
  ["close-knit", "①", "긴밀히 맺어진"],
  ["life expectancy", "③", "기대 수명"],
  ["imminent", "⑤", "임박한"],
  ["nomadic", "⑨", "유목의"],
  ["monotonous", "⑭", "단조로운"]
 ],
 defs: [
  ["romanticize", "to make something seem better than it was"],
  ["close-knit", "bound together by strong ties"],
  ["life expectancy", "the years a person is likely to live"],
  ["imminent", "about to happen very soon"],
  ["nomadic", "moving from place to place to live"],
  ["monotonous", "always the same and so dull"]
 ],
 defOrder: [2, 5, 0, 4, 1, 3],
 flow: [
  ["The image", "Hunter-gatherer life looks like an adventure story", null],
  ["The number", "Average life expectancy was around (  ①  ) years", "30"],
  ["What it means", "Many died young; as many as half before their (  ②  )", "teens"],
  ["The shift", "About 10,000 years ago we became (  ③  )", "farmers"],
  ["The verdict", "An even greater hell — longer hours, less varied (  ④  )", "diets"]
 ],
 flowBogi: "30 · teens · farmers · diets · 70 · sailors",
 para: [
  ["① lived in small, close-knit communities", "They lived in tight little ______.", "groups"],
  ["③ which isn't to say that everyone would drop dead", "It does not mean all died at ______.", "thirty"],
  ["⑦ the fact that so many people are now reaching it", "What is new is the ______ reaching it.", "number"],
  ["⑨ took place over the course of centuries", "The change spread across many ______.", "centuries"],
  ["⑫ there was more to fight over", "More stored goods meant more to ______.", "seize"]
 ],
 paraBogi: "groups · thirty · number · centuries · seize · crowds · fifty · share",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Grain Was Stored in Early Villages",
    "Two Hard Lives, and What Changed Between Them",
    "Farming Made Every Life Longer and Safer",
    "A Guide to Reading Huckleberry Finn",
    "The History of the Plow"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "절반에 가까운 사람이 10대에 이르기 전에 죽었다.",
    "70세나 80세까지 산 수렵채집인도 있었다.",
    "유목에서 농경으로의 전환은 수 세기에 걸쳐 점진적으로 일어났다.",
    "농경이 시작되면서 평균 기대 수명이 눈에 띄게 길어졌다.",
    "농경과 함께 위계질서가 뚜렷해지고 여러 전염병이 나타났다."
   ], ans: 4
  },
  {
   t: "write", q: "농경이 시작된 뒤 살인이 더 흔한 사망 원인이 된 까닭을 우리말 한 문장으로 써 보세요.",
   ans: "식량을 저장하고 자원을 거두는 방법이 좋아지면서 싸워서 차지할 것이 더 많아졌기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "⑦",
   toks: [
    ["So", "m"], ["old age in itself", "s"], ["is", "v"], ["nothing new,", null], ["but", "c"],
    ["the fact", "s"], ["that", "c"], ["so many people", "s2"], ["are now reaching", "v2"],
    ["it", null], ["is.", "v"]
   ],
   ko: "그러므로 노년 자체는 새로운 것이 아니지만, 그토록 많은 사람이 지금 노년에 이르고 있다는 사실은 새롭다."
  },
  drill: [
   {
    n: "③",
    en: "The average life expectancy was around 30 years, which isn't to say that everyone would drop dead at 30, but that many died young.",
    ans: "S The average life expectancy · △V was · C around 30 years · [which] △V′ isn't to say · [that] S′ everyone · △V′ would drop dead at 30 · [but that] S′ many · △V′ died young",
    ko: "평균 기대 수명은 30세 정도였는데, 이는 모두가 서른에 죽었다는 뜻이 아니라 많은 사람이 어려서 죽었다는 뜻이다."
   },
   {
    n: "⑨",
    en: "But spears and bows weren't replaced by plows overnight; this gradual transition from a nomadic to an agricultural lifestyle took place over the course of centuries.",
    ans: "S spears and bows · △V weren't replaced · M by plows overnight · S this gradual transition from a nomadic to an agricultural lifestyle · △V took place · M over the course of centuries",
    ko: "그러나 창과 활이 하룻밤 사이에 쟁기로 바뀐 것은 아니었다. 유목에서 농경 생활로의 이 점진적인 전환은 수 세기에 걸쳐 일어났다."
   },
   {
    n: "⑫",
    en: "Instead, murder became an increasingly common cause of death, presumably because improved means of storing food and harvesting resources meant there was more to fight over.",
    ans: "M Instead · S murder · △V became · C an increasingly common cause of death · [because] S′ improved means of storing food and harvesting resources · △V′ meant · O there was more to fight over",
    ko: "대신 살인이 점점 더 흔한 사망 원인이 되었는데, 아마도 식량 저장과 자원 수확의 방법이 좋아져 싸워 차지할 것이 더 많아졌기 때문일 것이다."
   }
  ]
 },
 syn: [
  {
   n: "③",
   name: "which is not to say that ~",
   q: "The average life expectancy was around 30 years, «which isn't to say that everyone would drop dead at 30», but that many died young.",
   d: "앞의 말을 받아 ‘그렇다고 ~라는 뜻은 아니다’라고 오해를 막는다. 뒤의 <b>but that ~</b>이 진짜 뜻을 밝힌다.",
   k: "그렇다고 모두가 서른에 죽었다는 뜻은 아니다"
  },
  {
   n: "⑤",
   name: "강조의 did + 동사원형",
   q: "«Those who did make it to adulthood» lived with the imminent threat of starvation…",
   d: "<b>do/does/did</b>를 동사 앞에 넣어 ‘정말로 ~하다’를 강조한다. 뒤에는 반드시 동사원형이 온다.",
   k: "실제로 성인이 된 사람들"
  }
 ],
 synd: [
  { u: "구문 1", en: "The test failed, which is not to say the idea was wrong.", k: "그 실험은 실패했는데, 그렇다고 그 발상이 틀렸다는 뜻은 아니다." },
  { u: "구문 2", en: "He did finish the work, though no one believed he would.", k: "아무도 그러리라 믿지 않았지만 그는 정말로 그 일을 끝냈다." },
  { u: "구문 1 + 2", en: "Some did live to eighty, which is not to say that life was easy.", k: "어떤 이들은 정말로 여든까지 살았는데, 그렇다고 삶이 쉬웠다는 뜻은 아니다." }
 ],
 why: [
  ["곡물 저장 방식은 글의 초점이 아니다"],
  ["정답"],
  ["글은 농경민의 조건이 더 큰 지옥이었다고 말한다 — 정반대다"],
  ["소설 읽는 법은 글에 나오지 않는다"],
  ["쟁기의 역사는 글에서 다루지 않는다"]
 ],
 src: [["④"], ["⑥"], ["⑨"], ["⑪과 어긋남 — 30년 정도의 기대 수명은 변하지 않았다"], ["⑬"]],
 kb: {
  title: "평균이 감추는 것",
  lead: "기대 수명 30세를 어떻게 읽을까",
  items: [
   ["어린 나이의 사망이 끌어내린 평균", "기대 수명은 태어난 해의 모든 사망을 평균한 값이다. 어린 나이의 사망이 많으면 평균이 크게 내려간다. 스무 살까지 살아남은 사람의 남은 수명은 훨씬 길었다."],
   ["키가 줄어든 시기", "여러 지역의 유골 연구는 농경이 시작된 뒤 평균 신장이 줄고 충치와 영양 결핍의 흔적이 늘었다고 보고한다. 곡물 중심 식단과 인구 밀집이 원인으로 꼽힌다."],
   ["모여 살면서 생긴 병", "홍역·천연두처럼 사람 사이에서만 도는 병은 일정 규모 이상의 밀집 인구가 있어야 유지된다. 정착과 가축 사육이 이런 병이 자리 잡을 조건을 만들었다."]
  ],
  ask: "‘평균’이라는 말이 여러분의 생활에서 무엇을 감추고 있을까?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 40 ───────────────────────────── */
{
 no: "40", key: "letters", accent: "#B04A62", tint: "#FAE8EC", deep: "#7E2A3F",
 en: "Samuel Adams's Strategy for Changing Colonists' Dependence on England",
 ko: "논증 대신 통로를 만들다",
 goal: "Adams 가 목표를 다시 세운 계기와 그 뒤 전략의 구체적 수단을 설명할 수 있다.",
 fig: "Figure 1  한 도시의 항구와, 열세 곳을 잇는 선.",
 tip: "먼저 생각해 보자. 옳은 논증만으로 사람의 마음이 바뀌지 않는다면, 다음에 무엇을 해야 할까?",
 sent: T(40).sent, kor: T(40).kor,
 bank: [
  ["labor under", "①", "~에 시달리며 애쓰다"],
  ["attachment", "②", "애착"],
  ["reformulate", "④", "다시 세우다"],
  ["overlord", "⑤", "지배자"],
  ["resonate", "⑥", "반향을 일으키다"],
  ["dissension", "⑬", "분열"]
 ],
 defs: [
  ["labor under", "to act while held back by a belief"],
  ["attachment", "a strong feeling of connection"],
  ["reformulate", "to state or plan something again"],
  ["overlord", "a ruler with power over others"],
  ["resonate", "to strike a chord with people"],
  ["dissension", "sharp disagreement in a group"]
 ],
 defOrder: [3, 0, 5, 1, 4, 2],
 flow: [
  ["The old plan", "Adams believed good arguments would be enough", null],
  ["The reality", "They clung to England as a child to a (  ①  )", "parent"],
  ["The new goal", "Cut the (  ②  ) instead of preaching independence", "ties"],
  ["The tools", "Writings, staged (  ③  ), and boycotts", "demonstrations"],
  ["The effect", "Britain's violent response made it look (  ④  )", "tyrannical"]
 ],
 flowBogi: "parent · ties · demonstrations · tyrannical · gentle · silence",
 para: [
  ["① well-reasoned arguments would be enough", "Sound arguments alone would ______.", "suffice"],
  ["③ England's provision of protection", "What England gave them was ______.", "safety"],
  ["⑤ an oppressive overlord exploiting them", "A harsh ruler using them for ______.", "profit"],
  ["⑪ bait them into rash action", "To lure them into acting too ______.", "fast"],
  ["⑭ wedges driven between the two sides", "Turning small laws into a ______.", "split"]
 ],
 paraBogi: "suffice · safety · profit · fast · split · fail · fear · bridge",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "What the Stamp Act Taxed",
    "From Arguments to Anger: A Strategy",
    "Adams Won the Colonists with Logic Alone",
    "The Life of John Locke",
    "How Colonial Newspapers Were Printed"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "1765년 이전 Adams 는 이치에 맞는 주장이면 충분하리라는 믿음 아래 애썼다.",
    "식민지 주민들에게 자유는 영국이 주는 보호와 소속감보다 덜 중요했다.",
    "그는 독립을 설파하는 대신 영국과의 유대를 끊는 일에 착수했다.",
    "그가 조직한 시위는 상류층의 지지를 얻으려는 목적이었다.",
    "인지세법과 차법은 사실 꽤 사소했지만 분노를 만들어 내는 데 이용되었다."
   ], ans: 4
  },
  {
   t: "write", q: "Adams 가 목표를 다시 세운 계기를 우리말 한 문장으로 써 보세요.",
   ans: "수년간의 실패 끝에 식민지 주민들이 영국에 깊은 감정적 애착을 지니고 있다는 현실을 마주했기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "③",
   toks: [
    ["Liberty", "s"], ["meant", "v"], ["less to them", null], ["than", "c"], ["did", "v2"],
    ["England's provision of protection and a sense of belonging in a threatening environment.", "s2"]
   ],
   ko: "자유는 위협적인 환경에서 영국이 주던 보호와 소속감보다 그들에게 덜 중요했다."
  },
  drill: [
   {
    n: "⑤",
    en: "He made the children distrust the parent, whom they came to see not as a protector but as an oppressive overlord exploiting them for its profit.",
    ans: "S He · △V made · O the children distrust the parent · [whom] S′ they · △V′ came to see · C not as a protector but as an oppressive overlord exploiting them for its profit",
    ko: "그는 아이들이 부모를 불신하게 만들었고, 그들은 부모를 보호자가 아니라 이익을 위해 자신들을 착취하는 억압적 지배자로 보게 되었다."
   },
   {
    n: "⑥",
    en: "As the bond with England loosened, Adams's arguments for independence began to resonate.",
    ans: "[As] S′ the bond with England · △V′ loosened · S Adams's arguments for independence · △V began · O to resonate",
    ko: "영국과의 유대가 느슨해지자, 독립을 향한 Adams의 주장이 반향을 얻기 시작했다."
   },
   {
    n: "⑬",
    en: "Adams also worked to stir dissension among the English themselves, weakening the bond on all sides.",
    ans: "S Adams · △V also worked · M to stir dissension among the English themselves · M weakening the bond on all sides",
    ko: "Adams는 영국인 자신들 사이에 분열을 일으키려고도 애썼고, 모든 편의 유대를 약화시켰다."
   }
  ]
 },
 syn: [
  {
   n: "⑤",
   name: "not A but B",
   q: "…whom they came to see «not as a protector but as an oppressive overlord» exploiting them for its profit.",
   d: "‘A가 아니라 B’로 읽는다. A와 B 자리에는 같은 모양이 온다. 여기서는 <b>as + 명사</b> 두 개가 짝을 이룬다.",
   k: "보호자가 아니라 억압적 지배자로"
  },
  {
   n: "⑫",
   name: "분사구문 + as ~ as 원급 비교",
   q: "…, «making them seem as tyrannical as he had said they were».",
   d: "<b>making</b>이 앞 절의 결과를 잇고, 그 안에서 <b>as … as</b>가 두 대상을 같은 정도로 견준다.",
   k: "그가 말해 온 만큼이나 폭군처럼 보이게 만들면서"
  }
 ],
 synd: [
  { u: "구문 1", en: "They saw him not as a leader but as a rival.", k: "그들은 그를 지도자가 아니라 경쟁자로 보았다." },
  { u: "구문 2", en: "The reply came late, making the delay seem as long as a week.", k: "답이 늦게 와서 그 지연이 일주일만큼이나 길게 느껴지게 만들었다." },
  { u: "구문 1 + 2", en: "He framed the tax not as a fee but as a threat, making it seem as harsh as a fine.", k: "그는 그 세금을 요금이 아니라 위협으로 규정해, 그것이 벌금만큼이나 가혹해 보이게 만들었다." }
 ],
 why: [
  ["법의 세부 내용은 글의 초점이 아니다"],
  ["정답"],
  ["글은 이치에 맞는 주장만으로는 부족했다고 말한다 — 정반대다"],
  ["Locke 의 생애는 글에 나오지 않는다"],
  ["신문 인쇄 방식은 글에서 다루지 않는다"]
 ],
 src: [["①"], ["③"], ["④"], ["⑩과 어긋남 — 중산층과 하층민의 분노를 일으키려 고안되었다"], ["⑭"]],
 kb: {
  title: "통신 위원회",
  lead: "분노가 오기 전에 만들어 둔 통로",
  items: [
   ["1772년 보스턴", "Samuel Adams 는 1772년 보스턴에 통신 위원회(Committee of Correspondence)를 세워 각 마을이 서로 소식을 주고받게 했다. 사건이 터졌을 때 소문이 아니라 조직된 통로로 소식이 흘렀다."],
   ["열세 식민지로", "이 방식은 곧 다른 식민지로 퍼져 1773년 버지니아가 식민지 사이를 잇는 위원회를 만들었다. 흩어져 있던 지역들이 하나의 여론을 만들 수 있는 연결망이 이렇게 생겼다."],
   ["인지세법", "1765년 인지세법은 신문·달력·법률 문서 같은 인쇄물에 인지를 붙이게 한 법이다. 액수는 크지 않았지만 인쇄업자와 법률가를 한꺼번에 건드린 탓에 반발이 크게 번졌다."]
  ],
  ask: "어떤 주장을 널리 퍼뜨리려면, 논증보다 먼저 무엇이 필요할까?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
}

 ]
};
