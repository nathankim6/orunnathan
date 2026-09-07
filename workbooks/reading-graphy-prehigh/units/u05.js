/* Unit 5 · Philosophy & Religion — 원문 Theme 21–25 */
const R = require("../src/orig/all.json");
const T = n => R[n - 1];

module.exports = {
 no: 5,
 field: "Philosophy & Religion",
 ko: "철학·종교",
 tagline: "묻는 자리 — 무엇을 답할 수 있고 무엇을 답할 수 없는가",
 next: { en: "Media & IT", ko: "연결이 우리에게서 무엇을 가져가는지 읽습니다", words: "251–282 words" },
 lessons: [

/* ───────────────────────────── 21 ───────────────────────────── */
{
 no: "21", key: "ritual", accent: "#6B5B95", tint: "#EEEBF6", deep: "#453A66",
 en: "The Role of Religious Beliefs",
 ko: "믿음이 실제로 하는 일",
 goal: "필자가 인정하는 종교의 효과와 과학의 약점을 나누어 정리해 설명할 수 있다.",
 fig: "Figure 1  같은 시각에 같은 동작을 하는 사람들 — 믿음이 하는 일.",
 tip: "먼저 생각해 보자. 어떤 믿음이 참인지 묻는 것과, 그 믿음이 무엇을 하는지 묻는 것은 어떻게 다를까?",
 sent: T(21).sent, kor: T(21).kor,
 bank: [
  ["disadvantaged", "②", "불우한"],
  ["stimulate", "③", "자극하다"],
  ["surpass", "⑤", "능가하다"],
  ["discernable", "⑦", "뚜렷이 알아볼 수 있는"],
  ["confine", "⑨", "국한하다"],
  ["hardship", "⑨", "고난"]
 ],
 defs: [
  ["disadvantaged", "having less money or chance than others"],
  ["stimulate", "to make something grow or become active"],
  ["surpass", "to be greater or better than something"],
  ["discernable", "able to be noticed or made out"],
  ["confine", "to keep something within set limits"],
  ["hardship", "a time of serious trouble or need"]
 ],
 defOrder: [2, 5, 0, 4, 1, 3],
 flow: [
  ["The good", "Religious belief moves people to run charities", null],
  ["In art", "It has inspired painting, sculpture, and (  ①  )", "music"],
  ["Science's gift", "It reveals a Universe that (  ②  ) what anyone imagined", "surpasses"],
  ["Science's lack", "With no overall (  ③  ), its view looks bleak to some", "purpose"],
  ["The result", "Most turn to religion for meaning and (  ④  )", "comfort"]
 ],
 flowBogi: "music · surpasses · purpose · comfort · silence · profit",
 para: [
  ["② motivated by their religious outlook", "Their faith is what ______ them.", "drives"],
  ["④ look up at the Sistine Chapel ceiling", "One ______ upward is enough to see it.", "look"],
  ["⑤ surpasses anything imagined by supernaturalists", "It goes ______ what anyone imagined.", "beyond"],
  ["⑦ bleak and joyless by comparison", "Beside religion it can look ______.", "empty"],
  ["⑩ where a naturalistic approach might provide none", "Where nature alone offers ______ hope.", "no"]
 ],
 paraBogi: "drives · look · beyond · empty · no · stops · word · full",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "A Visitor's Guide to the Sistine Chapel",
    "What Belief Does, Not Whether It Is True",
    "Science Now Offers More Comfort Than Religion",
    "How the Hubble Telescope Was Built",
    "The Poetry of T.S. Eliot"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "가난하고 불우한 사람을 돕는 자선 단체 운영자 다수는 종교적 관점에서 동기를 얻는다.",
    "필자는 과학이 종교만큼 예술에 영감을 주지는 못했다고 본다.",
    "과학이 정서적 매력이 부족한 것은 우주에 뚜렷한 전반적 목적이 없기 때문이다.",
    "대다수 사람들은 슬픔과 고난의 시기에 과학에서 의미와 위안을 찾는다.",
    "초자연적인 것에 대한 믿음은 자연주의적 접근이 주지 못하는 희망을 줄 수 있다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 과학이 종교만큼 정서적 매력을 갖지 못한다고 본 이유를 우리말 한 문장으로 써 보세요.",
   ans: "우주에 뚜렷하고 전반적인 목적이 없다는 관점이, 목적을 좇으며 사는 개인의 삶과 어긋나 황량하고 기쁨 없어 보이기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "⑤",
   toks: [
    ["Science", "s"], ["has not inspired", "v"], ["art", null],
    ["to anything like the same extent,", "m"], ["but", "c"], ["in my personal view,", "m"],
    ["what science is doing", "s"], ["is", "v"], ["revealing a Universe", null], ["whose", "c"],
    ["complexity and beauty", "s2"], ["surpasses", "v2"], ["anything imagined by supernaturalists.", null]
   ],
   ko: "과학은 결코 같은 정도로 예술에 영감을 주지 못했지만, 내 개인적 견해로는 과학이 하는 일이란 초자연주의자들이 상상한 무엇보다 복잡하고 아름다운 우주를 드러내는 것이다."
  },
  drill: [
   {
    n: "③",
    en: "It is also obvious that such beliefs have inspired and stimulated many forms of art, especially painting, sculpture, architecture and music.",
    ans: "S It · △V is · C also obvious · [that] S′ such beliefs · △V′ have inspired and stimulated · O many forms of art, especially painting, sculpture, architecture and music",
    ko: "그러한 믿음이 회화·조각·건축·음악 같은 여러 형태의 예술에 영감과 자극을 주어 왔다는 것도 분명하다."
   },
   {
    n: "⑧",
    en: "This view conflicts with the purpose-driven, individual lives that we all lead.",
    ans: "S This view · △V conflicts · M with the purpose-driven, individual lives · [that] S′ we all △V′ lead",
    ko: "이 관점은 우리 모두가 살아가는, 목적에 이끌리는 개인의 삶과 충돌한다."
   },
   {
    n: "⑩",
    en: "Belief in the supernatural provides the possibility of hope in circumstances where a naturalistic approach might provide none.",
    ans: "S Belief in the supernatural · △V provides · O the possibility of hope · M in circumstances · [where] S′ a naturalistic approach · △V′ might provide · O none",
    ko: "초자연적인 것에 대한 믿음은 자연주의적 접근이 아무 희망도 주지 못할 상황에서 희망의 가능성을 준다."
   }
  ]
 },
 syn: [
  {
   n: "④",
   name: "have only to + 동사원형",
   q: "«You have only to look up at the Sistine Chapel ceiling … to realise this.»",
   d: "‘~하기만 하면 된다’는 뜻이다. <b>only</b>가 뒤의 to부정사를 한정해 다른 것은 필요 없음을 나타낸다.",
   k: "올려다보기만 하면 된다"
  },
  {
   n: "⑨",
   name: "관계부사 why",
   q: "This relative lack of appeal is probably the main reason «why the majority of people confine their interest in science»…",
   d: "<b>the reason</b>을 받아 그 까닭을 설명하는 절을 이끈다. <b>why</b> 대신 <b>that</b>을 쓰거나 아예 생략하기도 한다.",
   k: "대다수 사람들이 과학에 대한 관심을 국한하는 이유"
  }
 ],
 synd: [
  { u: "구문 1", en: "You have only to open the book to see what he means.", k: "그가 무슨 말을 하는지 알려면 그 책을 펴 보기만 하면 된다." },
  { u: "구문 2", en: "That is the reason why she stopped asking questions.", k: "그것이 그녀가 질문을 그만둔 이유이다." },
  { u: "구문 1 + 2", en: "You have only to listen once to know the reason why the choir moves people.", k: "그 성가대가 사람을 움직이는 이유를 알려면 한 번 들어 보기만 하면 된다." }
 ],
 why: [
  ["문장 ④의 예시만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 대다수가 의미와 위안을 종교에서 찾는다고 말한다 — 정반대다"],
  ["망원경을 만든 과정은 글에 나오지 않는다"],
  ["Eliot의 시 세계는 글에서 다루지 않는다"]
 ],
 src: [["②"], ["⑤"], ["⑦"], ["⑨와 어긋남 — 대다수는 종교에 의지해 의미와 위안을 찾는다"], ["⑩"]],
 kb: {
  title: "믿음이 남긴 것들",
  lead: "천장과 성가대와 자선 단체",
  items: [
   ["시스티나 천장", "미켈란젤로는 1508년부터 1512년까지 시스티나 예배당 천장을 그렸다. 스스로를 조각가로 여기던 그에게 벽화는 낯선 일이었지만, 창세기 아홉 장면을 담은 이 그림은 서양 회화의 기준이 되었다."],
   ["King's College 성가대", "케임브리지 King's College 예배당의 성가대는 1441년 헨리 6세가 이 학교를 세운 이래 이어져 왔다. 1928년부터 해마다 크리스마스이브에 방송되는 Nine Lessons and Carols 는 가장 오래 이어진 정기 방송 가운데 하나다."],
   ["허블이 찍은 깊은 하늘", "1995년 허블 우주 망원경은 아무것도 없어 보이던 하늘 한 조각을 열흘 동안 노출해 촬영했다. 그 안에서 약 3,000개의 은하가 드러났다. Hubble Deep Field 라 불리는 이 사진은 우주의 규모에 대한 감각을 바꾸었다."]
  ],
  ask: "여러분에게 ‘숨이 멎을 만큼’이라는 느낌을 준 것은 무엇이었고, 그것은 어디에서 왔는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 22 ───────────────────────────── */
{
 no: "22", key: "twoq", accent: "#3F7D5C", tint: "#E6F1EB", deep: "#245239",
 en: "Darwinian Evolution vs. Religion",
 ko: "고정되지 않은 것은 종뿐일까",
 goal: "다윈의 진화론이 일부 종교 집단에 문제가 되는 까닭을 근거를 들어 설명할 수 있다.",
 fig: "Figure 1  같은 사실 위에 놓인 서로 다른 질문.",
 tip: "먼저 생각해 보자. 자연이 변한다는 사실에서 도덕도 변한다는 결론이 곧바로 따라 나올까?",
 sent: T(22).sent, kor: T(22).kor,
 bank: [
  ["empirical", "②", "실증적인"],
  ["flexible", "②", "유동적인"],
  ["cohort", "③", "무리, 집단"],
  ["take for granted", "④", "당연하게 여기다"],
  ["contradict", "⑦", "모순되다"],
  ["prospect", "⑨", "전망"]
 ],
 defs: [
  ["empirical", "based on what is seen and measured"],
  ["flexible", "able to change to fit new conditions"],
  ["cohort", "a group that shares the same period"],
  ["take for granted", "to accept without asking why"],
  ["contradict", "to say the opposite of something"],
  ["prospect", "a thing that may happen in future"]
 ],
 defOrder: [4, 1, 5, 0, 3, 2],
 flow: [
  ["The claim", "If evolution is true, nature's categories are not fixed", null],
  ["The evidence", "Over generations creatures become new (  ①  )", "species"],
  ["The example", "Weiner's finches change and sometimes change (  ②  )", "back"],
  ["The clash", "Fixed-at-creation stories are (  ③  )", "contradicted"],
  ["The worry", "If nature shifts, may the (  ④  ) order shift too?", "moral"]
 ],
 flowBogi: "species · back · contradicted · moral · fixed · forward",
 para: [
  ["② nature's categories are flexible rather than fixed", "Nature's lines can ______ rather than hold.", "move"],
  ["③ to the extent that they become whole new species", "They change so far as to become ______.", "new"],
  ["④ take for granted as fixed", "We assume without asking that it stays ______.", "same"],
  ["⑦ contradicts Judeo-Christian and other narratives", "The theory ______ those old stories.", "opposes"],
  ["⑨ many religious people find upsetting", "That possibility ______ many believers.", "disturbs"]
 ],
 paraBogi: "move · new · same · opposes · disturbs · freeze · old · comforts",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Finches Feed on Different Seeds",
    "When Fixed Categories Start to Move",
    "Why Species Never Change Their Form",
    "A Life of Jonathan Weiner",
    "How the Pulitzer Prize Is Awarded"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "실증적 증거가 뒷받침한다는 의미에서 진화론이 참이라면 자연의 범주는 유동적이다.",
    "여러 세대에 걸쳐 생물 무리의 신체적 특징이 변하기도 한다.",
    "Weiner는 되새 한 종류가 자연 선택으로 새로운 종류가 되는 과정을 분석한다.",
    "다윈의 진화론은 창조 시점에 모든 범주가 확정되었다는 서사와 잘 들어맞는다.",
    "자연 질서가 고정되어 있지 않다는 함의는 종교인에게 충격적일 수 있다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 말하는, 종교인에게 더 큰 함의가 되는 질문이 무엇인지 우리말 한 문장으로 써 보세요.",
   ans: "자연 질서가 고정되어 있지 않다면 사회 질서와 도덕 질서 같은 다른 형태의 질서도 일시적이고 변하는 것이 아닌가 하는 질문이다."
  }
 ],
 fl: {
  model: {
   n: "②",
   toks: [
    ["To begin with,", "m"], ["if", "c"], ["Darwinian evolution", "s2"], ["is", "v2"],
    ["indeed true", null], ["in the sense", "m"], ["that", "c"], ["empirical evidence", "s2"],
    ["supports", "v2"], ["the theory,", null], ["then", "m"], ["nature's categories", "s"],
    ["are", "v"], ["flexible rather than fixed.", null]
   ],
   ko: "우선, 실증적 증거가 그 이론을 뒷받침한다는 의미에서 다윈의 진화론이 참이라면, 자연의 범주는 고정된 것이 아니라 유동적이다."
  },
  drill: [
   {
    n: "④",
    en: "“This” becomes “that,” calling into question the essential “this”-ness of a category that we might otherwise take for granted as fixed.",
    ans: "S “This” · △V becomes · C “that” · M calling into question the essential “this”-ness of a category · [that] S′ we · △V′ might otherwise take for granted as fixed",
    ko: "‘이것’이 ‘저것’이 되면서, 그러지 않았다면 고정된 것으로 당연히 여겼을 범주의 본질적인 ‘이것다움’에 의문을 던진다."
   },
   {
    n: "⑥",
    en: "He makes it clear that species as natural categories are not fixed.",
    ans: "S He · △V makes · O it clear · [that] S′ species as natural categories · △V′ are not · C fixed",
    ko: "그는 자연 범주로서의 종이 고정된 것이 아님을 분명히 한다."
   },
   {
    n: "⑨",
    en: "Perhaps they, too, are temporary and shifting, a prospect that many religious people find upsetting.",
    ans: "M Perhaps · S they, too, · △V are · C temporary and shifting · M a prospect that many religious people find upsetting",
    ko: "아마 그것들도 일시적이고 변하는 것일 텐데, 이는 많은 종교인이 불편해하는 전망이다."
   }
  ]
 },
 syn: [
  {
   n: "②",
   name: "in the sense that ~",
   q: "…if Darwinian evolution is indeed true «in the sense that empirical evidence supports the theory»…",
   d: "‘~라는 점에서’라는 뜻으로, 어떤 의미에서 그 말이 참인지를 한정한다. that절이 <b>the sense</b>의 내용이 된다.",
   k: "실증적 증거가 그 이론을 뒷받침한다는 점에서"
  },
  {
   n: "⑥",
   name: "가목적어 it — 진목적어 that절",
   q: "He makes «it clear that species as natural categories are not fixed».",
   d: "<b>make/find/think + it + 형용사 + that절</b>에서 <b>it</b>은 자리만 채우고 진짜 목적어는 that절이다.",
   k: "그는 종이 고정되어 있지 않다는 것을 분명히 한다"
  }
 ],
 synd: [
  { u: "구문 1", en: "The map is useful in the sense that it shows the order of stops.", k: "그 지도는 정차 순서를 보여 준다는 점에서 쓸모가 있다." },
  { u: "구문 2", en: "She made it clear that the result could change.", k: "그녀는 그 결과가 바뀔 수 있다는 것을 분명히 했다." },
  { u: "구문 1 + 2", en: "He made it clear that the theory is true in the sense that evidence supports it.", k: "그는 증거가 뒷받침한다는 점에서 그 이론이 참임을 분명히 했다." }
 ],
 why: [
  ["되새의 먹이 이야기는 글의 초점이 아니다"],
  ["정답"],
  ["글은 종이 고정되어 있지 않다고 말한다 — 정반대다"],
  ["작가의 생애는 글에 나오지 않는다"],
  ["상의 심사 과정은 글에서 다루지 않는다"]
 ],
 src: [["②"], ["③"], ["⑤"], ["⑦과 어긋남 — 그런 서사와 모순된다"], ["⑧"]],
 kb: {
  title: "되새의 부리가 바뀐 해",
  lead: "변화는 얼마나 빨리 눈에 보일까",
  items: [
   ["갈라파고스의 관찰", "Peter Grant와 Rosemary Grant 부부는 1973년부터 갈라파고스 Daphne Major 섬에서 되새를 해마다 측정했다. 1977년 큰 가뭄으로 작은 씨앗이 사라지자, 큰 부리를 가진 개체가 더 살아남아 다음 세대의 평균 부리 크기가 커졌다."],
   ["되돌아온 변화", "몇 해 뒤 비가 많이 내려 작은 씨앗이 흔해지자 평균 부리 크기는 다시 줄었다. 방향이 정해진 진보가 아니라 환경에 따라 오가는 변화라는 것을 보여 준 관찰이다."],
   ["책과 상", "Jonathan Weiner의 『The Beak of the Finch』는 이 관찰을 다룬 논픽션으로 1995년 퓰리처상 일반 논픽션 부문을 받았다."]
  ],
  ask: "여러분이 ‘원래 그런 것’이라고 여겨 온 범주 가운데, 사실은 조건에 따라 움직이는 것이 있을까?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 23 ───────────────────────────── */
{
 no: "23", key: "sophist", accent: "#B5673A", tint: "#FAEDE4", deep: "#7F3F18",
 en: "What Is Sophistry?",
 ko: "이기는 길과 맞는 길",
 goal: "궤변술이 철학과 어떻게 닮았고 어디에서 갈라지는지 대비해 설명할 수 있다.",
 fig: "Figure 1  이기는 길과 맞는 길이 갈라지는 지점.",
 tip: "먼저 생각해 보자. 토론에서 이겼는데 내가 틀렸다면, 그 승리는 무엇인가?",
 sent: T(23).sent, kor: T(23).kor,
 bank: [
  ["disguise", "②", "위장"],
  ["stand for", "②", "옹호하다"],
  ["rhetoric", "⑤", "수사적 기교"],
  ["substance", "⑤", "실체"],
  ["stumble", "⑥", "비틀거리다"],
  ["guarantee", "⑧", "보장하다"]
 ],
 defs: [
  ["disguise", "a way of hiding what something is"],
  ["stand for", "to support an idea or value"],
  ["rhetoric", "the art of speaking to persuade"],
  ["substance", "the real content behind the surface"],
  ["stumble", "to walk unsteadily and nearly fall"],
  ["guarantee", "to promise that something will happen"]
 ],
 defOrder: [3, 0, 5, 1, 4, 2],
 flow: [
  ["The birth", "Sophistry was born as philosophy's evil twin", null],
  ["The mask", "It looks like philosophy but wears a (  ①  )", "disguise"],
  ["The aim", "Money, fame, contests, and political (  ②  )", "power"],
  ["The method", "Logic is turned into (  ③  ), style over substance", "rhetoric"],
  ["The rule", "Rule number one is to look (  ④  )", "good"]
 ],
 flowBogi: "disguise · power · rhetoric · good · truth · silence",
 para: [
  ["② go completely against everything", "They run ______ what philosophy defends.", "against"],
  ["③ pretends to care about all of this", "It only ______ to care about truth.", "pretends"],
  ["⑤ emphasizes style over substance", "It puts looks ______ real content.", "above"],
  ["⑥ like children fumbling in the dark", "They grope about as if it were ______.", "dark"],
  ["⑧ wisdom is supposed to be an end in itself", "Wisdom is its own ______.", "reward"]
 ],
 paraBogi: "against · pretends · above · dark · reward · beside · refuses · bright",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How to Become Rich and Famous",
    "The Twin That Wears Philosophy's Face",
    "Why Sophistry Is the Purer Search for Truth",
    "A Short History of Ancient Greece",
    "Rules for Winning a School Debate"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "궤변술은 철학이 태어난 직후에 철학의 사악한 쌍둥이로 태어났다.",
    "궤변술은 진지하게 받아들여지려고 철학으로 자신을 가장한다.",
    "궤변술은 논리적 추론을 실체보다 스타일을 앞세우는 수사적 기교로 바꾼다.",
    "궤변가는 자신이 바보처럼 보이는 것을 기꺼이 받아들인다.",
    "철학은 지혜가 그 자체로 목적이므로 성공이나 명성을 보장하지 않는다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 궤변술을 철학과 갈라놓는 결정적인 차이로 무엇을 드는지 우리말 한 문장으로 써 보세요.",
   ans: "철학은 현실·지식·가치의 궁극적 본질을 정직하게 탐구하지만, 궤변술은 그런 척만 하고 실제로는 돈·명성·승리·권력 같은 이기적 목적에만 집중한다는 점이다."
  }
 ],
 fl: {
  model: {
   n: "⑤",
   toks: [
    ["It", "s"], ["takes", "v"], ["logical reasoning, the basic tool of philosophy,", null],
    ["and", "c"], ["turns", "v"], ["it into rhetoric,", null], ["which", "c"], ["emphasizes", "v2"],
    ["style over substance, looking good rather than getting it right.", null]
   ],
   ko: "그것은 철학의 기본 도구인 논리적 추론을 가져다가 수사적 기교로 바꾸는데, 그 기교는 실체보다 스타일을, 바르게 하는 것보다 멋있어 보이는 것을 앞세운다."
  },
  drill: [
   {
    n: "②",
    en: "Sophistry wears a mask that makes it look a lot like philosophy, but it uses this disguise to commit all sorts of crimes that go completely against everything philosophy stands for.",
    ans: "S Sophistry · △V wears · O a mask · [that] △V′ makes · O it look a lot like philosophy · [but] S it · △V uses · O this disguise · M to commit all sorts of crimes that go completely against everything philosophy stands for",
    ko: "궤변술은 자신을 철학과 아주 비슷해 보이게 하는 가면을 쓰지만, 이 위장을 이용해 철학이 옹호하는 모든 것에 정면으로 반하는 온갖 범죄를 저지른다."
   },
   {
    n: "⑥",
    en: "Philosophers often look silly as they stumble around trying to make sense of the world, like children fumbling in the dark.",
    ans: "S Philosophers · M often · △V look · C silly · [as] S′ they · △V′ stumble around · M trying to make sense of the world, like children fumbling in the dark",
    ko: "철학자들은 어둠 속에서 더듬거리는 아이처럼 세상을 이해하려 비틀거리며 다닐 때 바보처럼 보이는 일이 많다."
   },
   {
    n: "⑦",
    en: "Sophists never allow themselves to look silly; looking good is rule number one in the sophistry rule book.",
    ans: "S Sophists · △V never allow · O themselves to look silly · S looking good · △V is · C rule number one in the sophistry rule book",
    ko: "궤변가는 자신이 바보처럼 보이는 것을 결코 용납하지 않는다. 멋있어 보이는 것이 궤변술 규정집의 첫 번째 규칙이다."
   }
  ]
 },
 syn: [
  {
   n: "④",
   name: "in order to + 수동태 부정사",
   q: "«it disguises itself as philosophy in order to be taken seriously» but then focuses completely on other selfish activities…",
   d: "<b>in order to</b>는 목적을 나타낸다. 뒤에 <b>be + 과거분사</b>가 오면 ‘~되기 위해’라는 뜻이 된다.",
   k: "진지하게 받아들여지기 위해"
  },
  {
   n: "⑧",
   name: "가정을 품은 관계절 + would",
   q: "…«a sophist who isn't rich, famous, and successful … would be regarded as a complete failure».",
   d: "관계절이 조건 구실을 하고 주절에 <b>would</b>가 온다. ‘~한 궤변가라면 …로 여겨질 것이다’로 읽는다.",
   k: "부유하지도 유명하지도 않은 궤변가라면 완전한 실패자로 여겨질 것이다"
  }
 ],
 synd: [
  { u: "구문 1", en: "He lowered his voice in order to be trusted.", k: "그는 신뢰를 얻기 위해 목소리를 낮췄다." },
  { u: "구문 2", en: "A speaker who never admits an error would lose our trust.", k: "실수를 결코 인정하지 않는 연설자라면 우리의 신뢰를 잃을 것이다." },
  { u: "구문 1 + 2", en: "A writer who hides his sources in order to be praised would soon be found out.", k: "칭찬받기 위해 출처를 숨기는 작가라면 곧 들통날 것이다." }
 ],
 why: [
  ["부와 명성은 궤변가의 목표일 뿐 글의 주제가 아니다"],
  ["정답"],
  ["글은 궤변술이 진리 탐구를 가장할 뿐이라고 말한다 — 정반대다"],
  ["고대 그리스의 역사는 글에 나오지 않는다"],
  ["토론에서 이기는 규칙은 글에서 다루지 않는다"]
 ],
 src: [["①"], ["④"], ["⑤"], ["⑦과 어긋남 — 바보처럼 보이는 것을 절대 용납하지 않는다"], ["⑧"]],
 kb: {
  title: "가면을 쓴 논증",
  lead: "설득의 기술은 언제 속임수가 되는가",
  items: [
   ["소피스트라는 직업", "기원전 5세기 아테네에서 소피스트는 보수를 받고 변론술을 가르치던 순회 교사였다. 민회와 법정에서 스스로 말해야 했던 시민들에게 필요한 기술이었고, 처음부터 나쁜 말은 아니었다."],
   ["프로타고라스의 문장", "‘인간은 만물의 척도다’라는 말은 소피스트 프로타고라스가 남긴 것으로 전한다. 판단의 기준을 각 사람에게 두는 이 생각은 플라톤이 소피스트를 비판하는 주된 표적이 되었다."],
   ["허수아비 논증", "상대의 주장을 약하게 바꿔 놓고 그것을 무너뜨리는 방식을 허수아비 논증(straw man)이라 한다. 이기기는 쉽지만 실제 주장은 조금도 건드리지 못한다."]
  ],
  ask: "여러분이 최근에 본 논쟁에서, 이기기 위한 말과 맞기 위한 말을 나눌 수 있었는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 24 ───────────────────────────── */
{
 no: "24", key: "stoic", accent: "#2E6E8E", tint: "#E3EFF4", deep: "#1B4A61",
 en: "The Stoics",
 ko: "고문을 받으면서도 행복할 수 있다는 말",
 goal: "스토아학파가 행복을 무엇으로 보았고 왜 감정을 정화하라고 했는지 설명할 수 있다.",
 fig: "Figure 1  선 하나로 나뉘는 두 영역 — 내가 어쩔 수 있는 것과 없는 것.",
 tip: "먼저 생각해 보자. 건강도 평판도 잃은 사람이 행복하다고 말한다면, 우리는 무엇을 믿어야 할까?",
 sent: T(24).sent, kor: T(24).kor,
 bank: [
  ["flourish", "①", "번성하다"],
  ["originate", "②", "시작되다"],
  ["epistemology", "③", "인식론"],
  ["virtuous", "⑨", "덕이 있는"],
  ["regardless of", "⑪", "~에 상관없이"],
  ["purge", "⑯", "없애다, 정화하다"]
 ],
 defs: [
  ["flourish", "to grow strongly over a period"],
  ["originate", "to begin in a certain place or time"],
  ["epistemology", "the study of what knowing means"],
  ["virtuous", "living by high moral standards"],
  ["regardless of", "without being affected by something"],
  ["purge", "to remove something completely"]
 ],
 defOrder: [5, 2, 0, 4, 1, 3],
 flow: [
  ["Where", "Stoicism spread from Cyprus to Athens and Rome", null],
  ["The stuff", "Living things are passive matter plus (  ①  )", "pneuma"],
  ["The question", "How should a person (  ②  )?", "live"],
  ["The answer", "Happiness is an excellent activity of the (  ③  )", "soul"],
  ["The conclusion", "Since emotions carry beliefs, (  ④  ) them", "purge"]
 ],
 flowBogi: "pneuma · live · soul · purge · money · body",
 para: [
  ["① flourished in the Greco-Roman world", "The school ______ across Greece and Rome.", "spread"],
  ["⑤ keeps it evolving and changing", "God holds the world in constant ______.", "change"],
  ["⑩ nothing to do with actually possessing them", "Owning them is ______ to happiness.", "unrelated"],
  ["⑫ could be happy even while being tortured", "Even under torture one could stay ______.", "happy"],
  ["⑬ emotions are not merely feelings", "Feelings always carry a ______ inside.", "belief"]
 ],
 paraBogi: "spread · change · unrelated · happy · belief · shrank · rest · doubt",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "Where Zeno of Citium Was Born",
    "Happiness the Stoics Could Not Lose",
    "Why the Stoics Chased Wealth and Fame",
    "A Map of the Roman Empire",
    "How Greek Was Written and Read"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "스토아학파는 기원전 4세기부터 기원후 2세기까지 그리스·로마 세계에서 번성했다.",
    "그들은 살아 있는 것이 수동적 물질과 pneuma 라는 능동적 힘으로 이루어졌다고 보았다.",
    "그들에게 행복은 덕·용기·겸손·인내를 갖춘 ‘영혼의 탁월한 활동’이었다.",
    "그들은 부와 명예와 건강을 바라는 것 자체가 불합리하다고 보았다.",
    "그들은 감정이 단지 느낌이 아니라 늘 믿음을 수반한다고 믿었다."
   ], ans: 4
  },
  {
   t: "write", q: "스토아학파가 감정을 정화하라고 권한 논리를 우리말 한 문장으로 써 보세요.",
   ans: "감정은 늘 믿음을 수반하는데, 덕이 있는 사람은 질병 앞에서도 행복할 수 있으므로 질병이 나쁘다는 믿음이 잘못이고, 따라서 그 믿음에 딸린 감정도 버려야 한다는 것이다."
  }
 ],
 fl: {
  model: {
   n: "⑪",
   toks: [
    ["Indeed,", "m"], ["the Stoics", "s"], ["believed", "v"], ["that", "c"], ["a person", "s2"],
    ["who", "c"], ["was", "v2"], ["fully virtuous", null], ["could be", "v2"], ["happy", null],
    ["regardless of his or her physical well-being.", "m"]
   ],
   ko: "실제로 스토아학파는 충분히 덕이 있는 사람이라면 자신의 신체적 안녕과 상관없이 행복할 수 있다고 믿었다."
  },
  drill: [
   {
    n: "②",
    en: "Originating with Zeno of Citium in Cyprus but eventually spreading to Athens, Rome, and the rest of the Roman Empire, Stoicism had a major influence on ancient civilization.",
    ans: "M Originating with Zeno of Citium in Cyprus but eventually spreading to Athens, Rome, and the rest of the Roman Empire · S Stoicism · △V had · O a major influence on ancient civilization",
    ko: "키프로스의 제논에게서 시작해 아테네와 로마, 로마 제국 전역으로 퍼진 스토아 철학은 고대 문명에 큰 영향을 미쳤다."
   },
   {
    n: "⑭",
    en: "For instance, they thought being afraid of disease required believing that disease was bad.",
    ans: "M For instance · S they · △V thought · [that] S′ being afraid of disease · △V′ required · O believing that disease was bad",
    ko: "예를 들어 그들은 질병을 두려워하려면 질병이 나쁘다고 믿어야 한다고 생각했다."
   },
   {
    n: "⑮",
    en: "However, since a truly virtuous person could be happy in the face of disease, it was wrong to believe that disease is bad.",
    ans: "M However · [since] S′ a truly virtuous person · △V′ could be · C happy in the face of disease · S it · △V was · C wrong · to believe that disease is bad",
    ko: "그러나 진정으로 덕이 있는 사람은 질병 앞에서도 행복할 수 있으므로, 질병이 나쁘다고 믿는 것은 잘못이었다."
   }
  ]
 },
 syn: [
  {
   n: "②",
   name: "분사구문 두 개의 병렬",
   q: "«Originating with Zeno of Citium in Cyprus but eventually spreading to Athens,» … Stoicism had a major influence…",
   d: "<b>-ing</b> 덩어리 두 개를 <b>but</b>으로 이어 주어의 두 면을 함께 설명한다. 주어는 뒤의 <b>Stoicism</b>이다.",
   k: "키프로스에서 시작했지만 결국 아테네로 퍼져 나가면서"
  },
  {
   n: "⑪",
   name: "regardless of + 명사",
   q: "…a person who was fully virtuous could be happy «regardless of his or her physical well-being».",
   d: "‘~에 상관없이’라는 뜻의 전치사구다. 뒤에는 명사나 동명사가 오며 절이 오지 않는다.",
   k: "신체적 안녕과 상관없이"
  }
 ],
 synd: [
  { u: "구문 1", en: "Beginning in one city but reaching many, the idea changed shape.", k: "한 도시에서 시작했지만 여러 곳에 닿으면서 그 생각은 모습이 바뀌었다." },
  { u: "구문 2", en: "He kept his calm regardless of the noise around him.", k: "그는 주변의 소음과 상관없이 평정을 유지했다." },
  { u: "구문 1 + 2", en: "Starting small but spreading fast, the school taught calm regardless of fortune.", k: "작게 시작했지만 빠르게 퍼지면서, 그 학파는 운과 상관없는 평정을 가르쳤다." }
 ],
 why: [
  ["문장 ②의 한 대목만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 행복이 그것을 소유하는 것과 무관하다고 말한다 — 정반대다"],
  ["로마 제국의 지도는 글에 나오지 않는다"],
  ["그리스어 표기는 글에서 다루지 않는다"]
 ],
 src: [["①"], ["④"], ["⑨"], ["⑩과 어긋남 — 그런 것을 바라는 것 자체는 합리적이라고 보았다"], ["⑬"]],
 kb: {
  title: "회랑에서 시작된 학파",
  lead: "이름부터가 장소였다",
  items: [
   ["스토아라는 이름", "제논이 제자들과 이야기하던 곳은 아테네 아고라의 채색 주랑(Stoa Poikilē)이었다. 학파의 이름은 그 회랑에서 왔다. 특정 인물이 아니라 장소에서 이름을 얻은 드문 경우다."],
   ["세 사람의 기록", "로마 시대 스토아 철학의 글은 신분이 크게 달랐던 세 사람이 남겼다. 노예 출신 에픽테토스, 정치가 세네카, 황제 마르쿠스 아우렐리우스다. 같은 가르침이 전혀 다른 처지에서 쓰였다."],
   ["파토스와 아파테이아", "스토아학파가 없애라고 한 것은 느낌 전부가 아니라 잘못된 판단에 딸린 격정(pathos)이었다. 그 결과 이르는 상태를 아파테이아(apatheia)라 불렀는데, 무감각이 아니라 격정에 휘둘리지 않음을 뜻한다."]
  ],
  ask: "여러분이 최근에 크게 흔들렸던 감정 하나를 골라, 그 밑에 어떤 판단이 깔려 있었는지 적어 볼 수 있는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 25 ───────────────────────────── */
{
 no: "25", key: "wanting", accent: "#93476B", tint: "#F7E8EF", deep: "#67284A",
 en: "Schopenhauer's Concerns",
 ko: "정언 명령은 황금률의 다른 이름인가",
 goal: "쇼펜하우어가 칸트의 정언 명령을 비판한 지점과 동정심을 둘러싼 두 사람의 견해 차이를 설명할 수 있다.",
 fig: "Figure 1  올라설 때마다 다시 멀어지는 지평선 — 그 원 밖에 서게 하는 것은 연민이다.",
 tip: "먼저 생각해 보자. ‘내가 당하기 싫은 일은 남에게도 하지 말라’는 말에는 무엇이 빠져 있을까?",
 sent: T(25).sent, kor: T(25).kor,
 bank: [
  ["find fault with", "②", "흠을 잡다"],
  ["methodology", "③", "방법론"],
  ["boil down to", "③", "~로 요약되다"],
  ["trappings", "④", "겉치레, 장식"],
  ["humanizing", "⑥", "인간답게 만드는"],
  ["egoism", "⑨", "이기주의"]
 ],
 defs: [
  ["find fault with", "to point out what is wrong in it"],
  ["methodology", "a set of methods used in a study"],
  ["boil down to", "to come down to one simple point"],
  ["trappings", "outward signs that dress something up"],
  ["humanizing", "making someone more truly human"],
  ["egoism", "the habit of thinking only of oneself"]
 ],
 defOrder: [4, 1, 5, 0, 3, 2],
 flow: [
  ["The agreement", "Schopenhauer shared many of Kant's ethical positions", null],
  ["The complaint", "The Categorical Imperative boils down to the (  ①  ) Rule", "Golden"],
  ["His claim", "Humans act from selfishness but as often from (  ②  )", "sympathy"],
  ["Kant's reply", "Feelings are unstable, so they give no (  ③  )", "bedrock"],
  ["The answer", "Denying sympathy raises (  ④  ), which clouds judgment", "egoism"]
 ],
 flowBogi: "Golden · sympathy · bedrock · egoism · Iron · profit",
 para: [
  ["② found fault with the Categorical Imperative", "He pointed out what was ______ in it.", "wrong"],
  ["④ reworded in intellectual trappings", "The same rule dressed in fancy ______.", "words"],
  ["⑤ sometimes humans are driven by selfishness", "At times self-interest ______ us.", "moves"],
  ["⑦ little place for the hard-to-quantify things", "Things hard to ______ have little room.", "measure"],
  ["⑨ an increased egoism, which clouds judgment", "Ignoring feeling makes judgment ______.", "cloudy"]
 ],
 paraBogi: "wrong · words · moves · measure · cloudy · right · numbers · rests",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "The Four Methods of the Categorical Imperative",
    "The Feeling Kant Left Out",
    "Why Schopenhauer Rejected All of Kant's Ethics",
    "A Biography of Immanuel Kant",
    "How to Write a Moral Code"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "쇼펜하우어는 윤리에 대한 칸트의 입장 다수에 동의했다.",
    "그는 정언 명령이 결국 황금률을 지적 장식으로 바꿔 쓴 것이라고 보았다.",
    "그는 인간이 때로 이기심에, 그만큼 자주 동정심이나 공감에 이끌린다고 보았다.",
    "칸트는 감정이 도덕규범의 기반이 될 수 있다고 보아 동정심을 자세히 다루었다.",
    "그는 동정심이 동료에게 도덕적으로 행동하는 방법을 정하는 데 필요하다고 말했다."
   ], ans: 4
  },
  {
   t: "write", q: "쇼펜하우어가 동정심을 부정하면 안 된다고 본 이유를 우리말 한 문장으로 써 보세요.",
   ans: "동정심 같은 감정을 부정하면 이기심이 커지고, 그 이기심이 판단을 흐리기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "⑤",
   toks: [
    ["One of Schopenhauer's main arguments", "s"], ["was", "v"], ["that", "c"],
    ["human actions", "s2"], ["aren't always guided", "v2"], ["by the same thing", "m"],
    ["— that", "c"], ["sometimes", "m"], ["humans", "s2"], ["are driven", "v2"],
    ["by selfishness, but just as often by sympathy or empathy.", "m"]
   ],
   ko: "쇼펜하우어의 주요 주장 가운데 하나는, 인간의 행동이 늘 같은 것에 이끌리지는 않는다는 것, 즉 때로는 이기심에 이끌리지만 그만큼 자주 동정심이나 공감에 이끌린다는 것이었다."
  },
  drill: [
   {
    n: "④",
    en: "In other words, the Categorical Imperative, to Schopenhauer, was the Golden Rule, reworded in intellectual trappings.",
    ans: "M In other words · S the Categorical Imperative · M to Schopenhauer · △V was · C the Golden Rule · M reworded in intellectual trappings",
    ko: "다시 말해 쇼펜하우어에게 정언 명령은 지적 장식으로 바꿔 쓴 황금률이었다."
   },
   {
    n: "⑥",
    en: "Schopenhauer found there to be a great deal of sympathy in completely moral actions, and that it was just as humanizing a thing as Kant's free will.",
    ans: "S Schopenhauer · △V found · O there to be a great deal of sympathy in completely moral actions · and [that] S′ it · △V′ was · C just as humanizing a thing as Kant's free will",
    ko: "쇼펜하우어는 완전히 도덕적인 행위에 많은 동정심이 있다고 보았고, 그것이 칸트의 자유의지만큼이나 인간답게 만드는 것이라고 보았다."
   },
   {
    n: "⑨",
    en: "But Schopenhauer argued that denying feelings like sympathy leads to an increased egoism, which clouds judgment.",
    ans: "[But] S Schopenhauer · △V argued · [that] S′ denying feelings like sympathy · △V′ leads · M to an increased egoism · [which] △V′ clouds · O judgment",
    ko: "그러나 쇼펜하우어는 동정심 같은 감정을 부정하면 이기심이 커지고, 그것이 판단을 흐린다고 주장했다."
   }
  ]
 },
 syn: [
  {
   n: "③",
   name: "not to mention ~",
   q: "Despite four highly detailed methodologies …, «not to mention the reasoning behind even the decision»…",
   d: "‘~은 말할 것도 없이’라는 뜻으로, 앞의 내용에 더 큰 것을 덧붙여 강조한다.",
   k: "그 결정 이면의 추론은 말할 것도 없이"
  },
  {
   n: "⑥",
   name: "find + there to be ~",
   q: "Schopenhauer «found there to be a great deal of sympathy» in completely moral actions.",
   d: "<b>there is</b> 구문을 <b>to be</b> 형태로 바꾸어 동사의 목적어 자리에 넣은 모양이다. ‘~이 있다고 보았다’로 읽는다.",
   k: "많은 동정심이 있다고 보았다"
  }
 ],
 synd: [
  { u: "구문 1", en: "The plan costs time, not to mention money.", k: "그 계획은 돈은 말할 것도 없이 시간이 든다." },
  { u: "구문 2", en: "We found there to be no simple answer to the question.", k: "우리는 그 질문에 간단한 답이 없다고 보았다." },
  { u: "구문 1 + 2", en: "He found there to be little proof, not to mention agreement.", k: "그는 합의는 말할 것도 없이 증거도 거의 없다고 보았다." }
 ],
 why: [
  ["문장 ③의 방법론 대목만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 그가 칸트의 입장 다수에 동의했다고 말한다 — 정반대다"],
  ["칸트의 생애는 글에 나오지 않는다"],
  ["도덕규범을 쓰는 방법은 글에서 다루지 않는다"]
 ],
 src: [["①"], ["④"], ["⑤"], ["⑦과 어긋남 — 동정심을 많이 다루지 않았고 감정을 기반으로 보지 않았다"], ["⑩"]],
 kb: {
  title: "황금률과 정언 명령",
  lead: "닮았지만 같지는 않은 두 문장",
  items: [
   ["정언 명령", "칸트는 『윤리형이상학 정초』(1785)에서 ‘네 행위의 준칙이 보편적 법칙이 되기를 네가 동시에 바랄 수 있도록 행위하라’고 썼다. 결과가 아니라 준칙의 보편화 가능성을 기준으로 삼는다."],
   ["칸트 자신의 반론", "칸트는 황금률이 정언 명령과 같지 않다고 주석에서 밝혔다. 벌 받기 싫은 범죄자가 그 규칙을 들어 판사에게 항의할 수 있기 때문이다. 자신이 당하기 싫은 일이 곧 남에게 해서는 안 될 일과 같지는 않다."],
   ["동정의 윤리", "쇼펜하우어는 『도덕의 기초에 관하여』(1840)에서 도덕의 근거를 의무가 아니라 타인의 고통을 자기 것처럼 느끼는 연민(Mitleid)에 두었다. 의무에서 출발한 칸트와 갈라지는 지점이다."]
  ],
  ask: "누군가를 돕게 만드는 것은 규칙인가, 느낌인가? 여러분의 경험에서는 어느 쪽이었는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
}

 ]
};
