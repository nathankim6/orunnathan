/* Unit 9 · Education, Psychology & Language — 원문 Theme 41–45 */
const R = require("../src/orig/all.json");
const T = n => R[n - 1];

module.exports = {
 no: 9,
 field: "Education, Psychology & Language",
 ko: "교육·심리·언어",
 tagline: "기억이 만드는 것들 — 기다림·베풂·말·화면·취향",
 next: { en: "Economy & Business", ko: "값과 욕구가 어떻게 만들어지는지 읽습니다", words: "244–275 words" },
 lessons: [

/* ───────────────────────────── 41 ───────────────────────────── */
{
 no: "41", key: "wait", accent: "#4A6FA5", tint: "#E8EDF6", deep: "#2C4870",
 en: "Delayed Gratification: Humans vs. Chimps",
 ko: "기다리는 법을 아는 쪽",
 goal: "충동을 다루는 능력이 어떤 행동으로 나타나는지, 그것이 사람만의 것이 아님을 설명할 수 있다.",
 fig: "Figure 1  곧바로 집는 쪽과 주의를 돌리는 쪽.",
 tip: "먼저 생각해 보자. 지금 하나와 잠시 뒤의 둘 사이에서 무엇이 우리를 기다리게 할까?",
 sent: T(41).sent, kor: T(41).kor,
 bank: [
  ["impulsivity", "①", "충동성"],
  ["resist", "②", "참다"],
  ["distract", "③", "주의를 딴 데로 돌리다"],
  ["gratification", "③", "만족"],
  ["accumulate", "⑤", "쌓이다"],
  ["divert", "⑨", "돌리다"]
 ],
 defs: [
  ["impulsivity", "acting at once without stopping to think"],
  ["resist", "to stop yourself from doing what you want"],
  ["distract", "to turn attention away from something"],
  ["gratification", "the pleasure of getting what you want"],
  ["accumulate", "to grow larger as more is added over time"],
  ["divert", "to send attention or things another way"]
 ],
 defOrder: [3, 0, 5, 1, 4, 2],
 flow: [
  ["The claim", "Coping with impulsivity looked like a human-only ability", null],
  ["The candy test", "Children are told to (  ①  ) eating the candy for a bigger pile", "resist"],
  ["What the kids do", "Some (  ②  ) themselves with toys or drawing", "distract"],
  ["The chimp test", "A pile of candy keeps (  ③  ) but stays out of reach", "growing"],
  ["The result", "Chimps turn to the toys to win a (  ④  ) reward later", "bigger"]
 ],
 flowBogi: "resist · distract · growing · bigger · grab · smaller",
 para: [
  ["① Coping with impulsivity is more complicated", "Holding back an ______ is harder than it looks.", "impulse"],
  ["② if they can resist eating it", "If they ______ eating it, more candy follows.", "delay"],
  ["③ distract themselves by playing with toys or drawing", "They pull their ______ away from the candy.", "attention"],
  ["⑤ the candy was inaccessible to them", "They could not ______ the candy at all.", "reach"],
  ["⑧ the longer they waited, the more candy", "Waiting ______ the size of the reward.", "raised"]
 ],
 paraBogi: "impulse · delay · attention · reach · raised · habit · rush · lowered",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "A Short History of Candy Making",
    "Waiting Is Not a Human-Only Skill",
    "Why Chimpanzees Cannot Be Trained",
    "How Toys Are Designed for Children",
    "The Best Diet for Young Chimps"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "충동을 다루는 일은 겉보기보다 복잡한 능력이다.",
    "어떤 아이들은 장난감을 가지고 놀거나 그림을 그리며 스스로 주의를 돌린다.",
    "연구진은 침팬지들에게 시간이 지날수록 늘어나는 사탕 더미를 보여 주었다.",
    "사탕에 손이 닿게 되자 침팬지들은 사탕에서 눈을 떼지 못했다.",
    "여러 침팬지가 오래 기다릴수록 사탕이 더 쌓인다는 것을 알아차렸다."
   ], ans: 4
  },
  {
   t: "write", q: "침팬지들이 장난감에 몰두한 까닭을 우리말 한 문장으로 써 보세요.",
   ans: "오래 기다릴수록 사탕이 더 쌓이므로, 사탕을 집지 않으려고 주의를 딴 데로 돌린 것이다."
  }
 ],
 fl: {
  model: {
   n: "④",
   toks: [
    ["This", "s"], ["is", "v"], ["quite advanced problem solving behavior,", null],
    ["which", "c"], ["is", "v2"], ["why it was surprising to find out", null],
    ["that", "c"], ["chimpanzees", "s2"], ["can do", "v2"], ["it, too.", null]
   ],
   ko: "이것은 상당히 고급한 문제 해결 행동이며, 그래서 침팬지도 그렇게 할 수 있다는 사실이 놀라웠던 것이다."
  },
  drill: [
   {
    n: "③",
    en: "Some of the kids will try to distract themselves by playing with toys or drawing as a way to cope with the frustration of delaying gratification.",
    ans: "S Some of the kids · △V will try · O to distract themselves · M by playing with toys or drawing · M as a way to cope with the frustration of delaying gratification",
    ko: "일부 아이들은 만족을 미루는 좌절을 견디는 방법으로 장난감을 가지고 놀거나 그림을 그리며 스스로 주의를 돌리려 한다."
   },
   {
    n: "⑦",
    en: "Every so often they would allow the chimps to have access to the candy.",
    ans: "M Every so often · S they · △V would allow · O the chimps to have access to the candy",
    ko: "이따금 연구진은 침팬지들이 사탕에 접근할 수 있게 해 주었다."
   },
   {
    n: "⑨",
    en: "The chimps became intensely focused on the toys when the candy became accessible, showing that they really were diverting their attention so they could get a bigger reward later.",
    ans: "S The chimps · △V became · C intensely focused on the toys · [when] S′ the candy · △V′ became accessible · M showing that they really were diverting their attention so they could get a bigger reward later",
    ko: "사탕에 손이 닿게 되자 침팬지들은 장난감에 강하게 몰두했는데, 이는 나중에 더 큰 보상을 얻으려고 정말로 주의를 돌리고 있었음을 보여 준다."
   }
  ]
 },
 syn: [
  {
   n: "⑧",
   name: "the 비교급 ~, the 비교급 ~",
   q: "…caught on that «the longer they waited, the more candy would accumulate»…",
   d: "<b>the + 비교급</b>이 두 번 나오면 ‘~할수록 더 …하다’로 읽는다. 앞이 조건, 뒤가 결과다.",
   k: "오래 기다릴수록 사탕이 더 쌓인다"
  },
  {
   n: "⑨",
   name: "결과를 잇는 분사구문 showing that",
   q: "…when the candy became accessible, «showing that they really were diverting their attention»…",
   d: "<b>showing</b>이 앞 절의 결과를 이어 ‘그리고 그것은 ~을 보여 준다’로 읽는다.",
   k: "그리고 그것은 ~임을 보여 준다"
  }
 ],
 synd: [
  { u: "구문 1", en: "The longer he practised, the easier the piece became.", k: "그가 오래 연습할수록 그 곡은 더 쉬워졌다." },
  { u: "구문 2", en: "She looked away, showing that she had already decided.", k: "그녀는 시선을 돌렸고, 그것은 이미 마음을 정했음을 보여 주었다." },
  { u: "구문 1 + 2", en: "The longer they waited, the calmer they grew, showing that patience can be learned.", k: "그들은 오래 기다릴수록 더 차분해졌고, 그것은 인내를 배울 수 있음을 보여 주었다." }
 ],
 why: [
  ["사탕의 역사는 글에 나오지 않는다"],
  ["정답"],
  ["글은 침팬지도 해낸다고 말한다 — 정반대다"],
  ["장난감 설계는 글의 관심사가 아니다"],
  ["침팬지의 먹이 조절은 글에서 다루지 않는다"]
 ],
 src: [["①"], ["③"], ["⑤"], ["⑨와 어긋남 — 사탕에 손이 닿자 오히려 장난감에 몰두했다"], ["⑧"]],
 kb: {
  title: "기다림을 다시 본 실험들",
  lead: "참는 힘인가, 돌리는 기술인가",
  items: [
   ["1972년의 실험", "월터 미셸(Walter Mischel)의 실험은 아이 앞에 간식 하나를 두고, 기다리면 두 개를 준다고 했다. 아이들이 실제로 쓴 방법은 대개 ‘눈길을 돌리는 것’이었다."],
   ["참기보다 바꾸기", "미셸은 간식을 ‘구름’처럼 다르게 떠올리게 하면 기다리는 시간이 늘어난다는 것을 확인했다. 의지를 쥐어짜기보다 생각을 바꾸는 쪽이 효과가 컸다."],
   ["사람만의 것이 아니다", "침팬지와 앵무새 등 여러 동물에서도 보상을 미루는 행동이 보고되었다. 놀잇감으로 주의를 돌리는 모습은 사람 아이와 닮았다."]
  ],
  ask: "여러분이 무언가를 기다릴 때 쓰는 방법은 참는 쪽인가, 주의를 돌리는 쪽인가?"
 },
 wtype: ["무관", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 42 ───────────────────────────── */
{
 no: "42", key: "blood", accent: "#B0475C", tint: "#FAE8EC", deep: "#7C2739",
 en: "Why We Donate Blood",
 ko: "값이 붙으면 사라지는 것",
 goal: "보상이 오히려 선한 행동을 줄이는 ‘밀어내기’를 근거와 함께 설명할 수 있다.",
 fig: "Figure 1  대가 없이 줄 때와 값을 치를 때.",
 tip: "먼저 생각해 보자. 착한 일에 돈을 얹으면 그 일은 늘어날까?",
 sent: T(42).sent, kor: T(42).kor,
 bank: [
  ["internalize", "①", "내면화하다"],
  ["intrinsic", "①", "내재적인"],
  ["ulterior", "②", "숨은"],
  ["backfire", "③", "역효과를 낳다"],
  ["altruism", "⑥", "이타심"],
  ["crowding out", "⑨", "밀어내기"]
 ],
 defs: [
  ["internalize", "to take an outside idea and make it your own"],
  ["intrinsic", "coming from inside a person, not from a reward"],
  ["ulterior", "kept hidden behind what is openly said"],
  ["backfire", "to produce the opposite of the wanted result"],
  ["altruism", "caring for others at a cost to yourself"],
  ["crowding out", "when a payment pushes out a willing motive"]
 ],
 defOrder: [4, 1, 0, 5, 2, 3],
 flow: [
  ["The base", "We act because it feels right, not for a reward", null],
  ["The case", "(  ①  ) donation is given without expectation of reward", "Blood"],
  ["Titmuss", "Paying donors would remove intrinsic (  ②  ) to be altruistic", "motivation"],
  ["The test", "Donations (  ③  ) when payment was offered", "dropped"],
  ["The name", "The effect is called (  ④  ) out", "crowding"]
 ],
 flowBogi: "Blood · motivation · dropped · crowding · rose · pushing",
 para: [
  ["① By internalizing the opinions of others", "We take other people's views ______ our own.", "as"],
  ["③ paying people for their kindness backfires", "Paying for kindness ______ the wrong way.", "works"],
  ["⑤ We do this without expectation of reward.", "We give with no ______ of getting anything.", "hope"],
  ["⑧ blood donations dropped significantly", "Giving fell ______ once money was offered.", "sharply"],
  ["⑩ for the sheer warm glow they experienced", "They gave for the good ______ it left.", "feeling"]
 ],
 paraBogi: "as · works · hope · sharply · feeling · price · rose · proof",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "Blood Banks Around the World",
    "When a Payment Pushes Out a Motive",
    "Why Money Always Buys More Kindness",
    "How Sweden Reformed Its Hospitals",
    "A Guide to Safe Blood Storage"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "우리는 옳게 느껴지기 때문에 어떤 일을 한다.",
    "Titmuss 는 헌혈자에게 돈을 주는 일이 위험하다고 결론지었다.",
    "스웨덴 연구에서 돈을 준다고 하자 헌혈이 오히려 늘었다.",
    "그 돈을 자선 단체에 기부할 수 있을 때에는 헌혈이 줄지 않았다.",
    "헌혈자들은 자선 게임에서 비헌혈자보다 더 많이 주었다."
   ], ans: 3
  },
  {
   t: "write", q: "‘밀어내기’가 왜 선의를 해치는지 우리말 한 문장으로 써 보세요.",
   ans: "돈이 붙는 순간 남을 도우며 얻던 내재적 가치가 사라지기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "②",
   toks: [
    ["We", "s"], ["do", "v"], ["things", null], ["because", "c"], ["it", "s2"], ["feels", "v2"],
    ["right,", null], ["which", "c"], ["is", "v2"], ["why we are suspicious of others", null],
    ["who", "c"], ["have", "v2"], ["ulterior motives", null], ["or", "c"], ["who", "c"],
    ["are", "v2"], ["extrinsically motivated.", null]
   ],
   ko: "우리는 옳게 느껴지기 때문에 어떤 일을 하며, 그래서 숨은 동기를 지녔거나 외적으로 동기 부여된 사람들을 의심한다."
  },
  drill: [
   {
    n: "⑤",
    en: "We do this without expectation of reward.",
    ans: "S We · △V do · O this · M without expectation of reward",
    ko: "우리는 보상을 기대하지 않고 이 일을 한다."
   },
   {
    n: "⑦",
    en: "To test his claims, Swedish researchers carried out a study where adults were asked to donate blood voluntarily, or received the equivalent of seven dollars in payment, or could donate this payment to a charity.",
    ans: "M To test his claims · S Swedish researchers · △V carried out · O a study · [where] S′ adults · △V′ were asked to donate blood voluntarily · △V′ received the equivalent of seven dollars in payment · △V′ could donate this payment to a charity",
    ko: "그의 주장을 검증하려고 스웨덴 연구진은 성인들이 자발적으로 헌혈하거나, 7달러에 해당하는 보수를 받거나, 그 보수를 자선 단체에 기부할 수 있게 한 연구를 수행했다."
   },
   {
    n: "⑧",
    en: "In line with Titmuss's prediction, blood donations dropped significantly when donors were offered payment, but not if the money could be donated to a charity.",
    ans: "M In line with Titmuss's prediction · S blood donations · △V dropped · M significantly · [when] S′ donors · △V′ were offered payment · [but not if] S′ the money · △V′ could be donated to a charity",
    ko: "Titmuss 의 예측대로, 헌혈은 보수를 제안받았을 때 크게 줄었지만, 그 돈을 자선 단체에 기부할 수 있을 때에는 줄지 않았다."
   }
  ]
 },
 syn: [
  {
   n: "⑥",
   name: "not only A but B (상관접속사)",
   q: "…concluded that paying blood donors was «not only dangerous, … but that … it would remove people's intrinsic motivation»…",
   d: "<b>not only A but B</b>는 ‘A뿐 아니라 B도’로 읽는다. A와 B 자리에는 같은 모양이 온다.",
   k: "위험할 뿐 아니라 ~하기까지 한다"
  },
  {
   n: "⑨",
   name: "앞 내용을 받는 which is why",
   q: "…it removes the intrinsic value we get, «which is why rewarding people financially … is considered nasty»",
   d: "<b>which</b>가 앞 내용을 통째로 받아 ‘그래서 ~인 것이다’로 이어진다.",
   k: "그래서 ~은 고약하다고 여겨진다"
  }
 ],
 synd: [
  { u: "구문 1", en: "The plan was not only costly but also unfair.", k: "그 계획은 비쌀 뿐 아니라 불공평하기도 했다." },
  { u: "구문 2", en: "He paid for the favour, which is why she felt insulted.", k: "그는 그 호의에 값을 치렀고, 그래서 그녀는 모욕감을 느꼈다." },
  { u: "구문 1 + 2", en: "The offer was not only small but late, which is why no one took it.", k: "그 제안은 적을 뿐 아니라 늦기까지 했고, 그래서 아무도 받아들이지 않았다." }
 ],
 why: [
  ["혈액원의 분포는 글의 초점이 아니다"],
  ["정답"],
  ["글은 돈이 오히려 선의를 밀어낸다고 말한다 — 정반대다"],
  ["스웨덴의 병원 개혁은 글에 나오지 않는다"],
  ["혈액 보관법은 글에서 다루지 않는다"]
 ],
 src: [["②"], ["⑥"], ["⑧과 어긋남 — 보수를 제안하자 헌혈이 크게 줄었다"], ["⑧"], ["⑩"]],
 kb: {
  title: "선물의 관계",
  lead: "Titmuss 가 남긴 물음",
  items: [
   ["1970년의 책", "리처드 티트머스(Richard Titmuss)의 『The Gift Relationship』(1970)은 영국의 무상 헌혈과 미국의 유상 혈액 공급을 견주어 본 사회정책 연구다."],
   ["밀어내기", "경제학에서 crowding out 은 본래 정부 지출이 민간 투자를 밀어내는 현상을 가리킨다. 여기서는 금전 보상이 내재적 동기를 밀어내는 뜻으로 쓰였다."],
   ["따뜻한 빛", "warm glow 는 남을 도울 때 느끼는 뿌듯함을 가리키는 말이다. 경제학자 제임스 안드레오니(James Andreoni)가 기부 행동을 설명하며 썼다."]
  ],
  ask: "여러분이 대가 없이 해 온 일에 돈이 붙는다면, 그 일을 계속하고 싶을까?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "반대", "일치", "일치"]
},

/* ───────────────────────────── 43 ───────────────────────────── */
{
 no: "43", key: "thou", accent: "#3E7A6B", tint: "#E5F0ED", deep: "#245247",
 en: "The History of the Pronouns ‘Thou’ and ‘You’",
 ko: "사라진 ‘너’",
 goal: "대명사 하나의 쓰임 변화가 신분 사회의 변화와 어떻게 맞물리는지 설명할 수 있다.",
 fig: "Figure 1  두 사람 사이에 놓였던 두 개의 ‘너’.",
 tip: "먼저 생각해 보자. 우리말의 ‘너’와 ‘당신’은 언제 갈라져 쓰이는가?",
 sent: T(43).sent, kor: T(43).kor,
 bank: [
  ["distinction", "①", "구별"],
  ["stratification", "④", "계층화"],
  ["aristocratic", "⑤", "귀족의"],
  ["deference", "⑥", "경의"],
  ["mobility", "⑧", "이동성"],
  ["levelling", "⑨", "평등하게 만들기"]
 ],
 defs: [
  ["distinction", "a difference that people mark between two things"],
  ["stratification", "the sorting of a society into fixed layers"],
  ["aristocratic", "belonging to the highest social class"],
  ["deference", "polite respect shown to someone above you"],
  ["mobility", "the chance to move between social classes"],
  ["levelling", "making everyone equal in rank"]
 ],
 defOrder: [5, 2, 4, 0, 3, 1],
 flow: [
  ["Old English", "Both forms were ordinary; the difference was grammatical", null],
  ["Middle English", "‘You’ marked (  ①  ) to a superior; ‘thou’ went to an inferior", "respect"],
  ["Why", "The split matched the strict (  ②  ) of medieval society", "stratification"],
  ["Fifteenth century", "Rising (  ③  ) classes used ‘thou’ to the lower orders", "merchant"],
  ["The end", "Confusion grew and only (  ④  ) survived", "‘you’"]
 ],
 flowBogi: "respect · stratification · merchant · ‘you’ · ‘thou’ · silence",
 para: [
  ["① a revealing example of how language change relates", "It shows how words follow ______ change.", "social"],
  ["③ ‘you’ began to be used as a mark of respect", "‘You’ came to ______ respect for a superior.", "signal"],
  ["⑥ required to address aristocrats as ‘you’", "Those below had to show ______ in address.", "deference"],
  ["⑧ widespread confusion about who should use the term", "By then no one was ______ who said what.", "sure"],
  ["⑪ as a marker of respect rather than of inferiority", "Now it marks respect, not ______ rank.", "lower"]
 ],
 paraBogi: "social · signal · deference · sure · lower · louder · hide · higher",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Old English Grammar Worked",
    "A Pronoun That Followed the Class System",
    "Why Poetry Should Return to ‘Thou’",
    "The Life of William Shakespeare",
    "The Rules of Quaker Worship"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "고대 영어에서 두 형태의 구별은 주로 문법적인 것이었다.",
    "중세 영어에서 ‘thou’는 윗사람에게 쓰는 존대의 표시였다.",
    "15세기에 상인 계층은 아래 신분에게 ‘thou’를 쓰기 시작했다.",
    "17세기 퀘이커 운동은 모두에게 ‘thou’를 썼다.",
    "오늘날 ‘thou’는 시와 종교의 옛말투에만 남아 있다."
   ], ans: 2
  },
  {
   t: "write", q: "오늘날 ‘thou’가 남아 있는 자리와 그 뜻을 우리말 한 문장으로 써 보세요.",
   ans: "시와 종교의 옛말투에만 남아, 아랫사람이 아니라 오히려 존대의 표시로 쓰인다."
  }
 ],
 fl: {
  model: {
   n: "⑤",
   toks: [
    ["It", "s"], ["allowed", "v"], ["an aristocratic speaker to distinguish", null],
    ["between an equal and someone inferior in social standing,", "m"],
    ["or", "c"], ["to signal intimacy.", null]
   ],
   ko: "그것은 귀족 화자가 대등한 사람과 신분이 낮은 사람을 구별하거나 친밀함을 나타낼 수 있게 해 주었다."
  },
  drill: [
   {
    n: "③",
    en: "In Middle English, ‘you’ began to be used as a mark of respect when addressing a superior and later an equal, while ‘thou’ was retained for addressing an inferior.",
    ans: "M In Middle English · S ‘you’ · △V began · O to be used as a mark of respect · M when addressing a superior and later an equal · [while] S′ ‘thou’ · △V′ was retained · M for addressing an inferior",
    ko: "중세 영어에서 ‘you’는 윗사람에게, 나중에는 대등한 사람에게 쓰는 존대의 표시가 되었고, 반면 ‘thou’는 아랫사람을 부르는 데 남았다."
   },
   {
    n: "⑧",
    en: "Increasing social mobility and competition between this merchant class and the aristocracy meant that by Shakespeare's time there was widespread confusion about who should use the term ‘thou’ to whom.",
    ans: "S Increasing social mobility and competition between this merchant class and the aristocracy · △V meant · [that] M by Shakespeare's time · △V′ there was · C widespread confusion about who should use the term ‘thou’ to whom",
    ko: "커지는 사회 이동성과 이 상인 계층과 귀족 사이의 경쟁은, 셰익스피어 시대에 이르러 누가 누구에게 ‘thou’를 써야 하는지에 대한 광범위한 혼란이 있었음을 뜻했다."
   },
   {
    n: "⑪",
    en: "‘Thou’ only appears now in archaizing registers, including those of poetry and religion, where it functions, curiously enough, as a marker of respect rather than of inferiority.",
    ans: "S ‘Thou’ · △V only appears · M now in archaizing registers, including those of poetry and religion · [where] S′ it · △V′ functions · M as a marker of respect rather than of inferiority",
    ko: "‘Thou’는 이제 시와 종교를 포함한 옛말투에만 나타나며, 흥미롭게도 거기서 낮춤이 아니라 존대의 표시로 기능한다."
   }
  ]
 },
 syn: [
  {
   n: "③",
   name: "대조의 while (반면에)",
   q: "…as a mark of respect …, «while ‘thou’ was retained for addressing an inferior»",
   d: "<b>while</b>이 ‘~인 반면에’로 두 사실을 맞세운다. 시간의 while 과 구별해 읽는다.",
   k: "반면에 ‘thou’는 아랫사람에게 남았다"
  },
  {
   n: "⑪",
   name: "A rather than B (B가 아니라 A)",
   q: "…as a marker of «respect rather than of inferiority»",
   d: "<b>rather than</b> 앞이 실제이고 뒤가 부정되는 쪽이다. ‘B가 아니라 A’로 읽는다.",
   k: "낮춤이 아니라 존대의 표시로"
  }
 ],
 synd: [
  { u: "구문 1", en: "He kept the old form, while others dropped it.", k: "그는 옛 형태를 지켰고, 반면에 다른 이들은 그것을 버렸다." },
  { u: "구문 2", en: "The word marks distance rather than warmth.", k: "그 낱말은 따뜻함이 아니라 거리를 나타낸다." },
  { u: "구문 1 + 2", en: "She used the polite form, while he chose closeness rather than rank.", k: "그녀는 격식 형태를 썼고, 반면에 그는 신분이 아니라 친밀함을 골랐다." }
 ],
 why: [
  ["고대 영어 문법은 도입부의 한 줄일 뿐이다"],
  ["정답"],
  ["시에서 ‘thou’를 되살리자는 주장은 글에 없다"],
  ["셰익스피어의 생애는 글에 나오지 않는다"],
  ["퀘이커 예배의 규칙은 글의 초점이 아니다"]
 ],
 src: [["②"], ["③과 어긋남 — 존대의 표시는 ‘you’였다"], ["⑦"], ["⑨"], ["⑪"]],
 kb: {
  title: "‘너’와 ‘당신’",
  lead: "대명사가 신분을 나르던 시절",
  items: [
   ["T와 V", "언어학에서는 친근한 2인칭을 T(라틴어 tu), 격식 2인칭을 V(vos)라 부른다. 프랑스어 tu/vous, 독일어 du/Sie 가 그 예다."],
   ["퀘이커의 thou", "17세기 퀘이커 교도들은 신분을 가리지 않고 모두에게 thou 를 썼다. 존대 표현을 거부하는 일이 그들에게는 평등을 드러내는 행동이었다."],
   ["남은 흔적", "표준 영어에서 thou 는 사라졌지만, 잉글랜드 북부 방언과 성경·기도문·시에는 그 형태가 남아 있다."]
  ],
  ask: "우리말에서 상대를 부르는 말이 관계에 따라 달라지는 경우를 떠올려 보자."
 },
 wtype: ["지엽", "정답", "무관", "무관", "지엽"],
 stype: ["일치", "반대", "일치", "일치", "일치"]
},

/* ───────────────────────────── 44 ───────────────────────────── */
{
 no: "44", key: "screen", accent: "#8A5AA6", tint: "#F1EAF7", deep: "#573270",
 en: "From Traditional Educational Models to Digital Models",
 ko: "교실 밖으로 나간 강의",
 goal: "전통 교실에서 디지털 학습으로의 이동이 무엇을 넓혔는지 설명할 수 있다.",
 fig: "Figure 1  화면으로 옮겨진 강의와 그 강의가 닿은 사람들.",
 tip: "먼저 생각해 보자. 강의가 화면으로 옮겨지면 누가 새로 배울 수 있게 될까?",
 sent: T(44).sent, kor: T(44).kor,
 bank: [
  ["dominant", "①", "지배적인"],
  ["advent", "②", "도래"],
  ["pivotal", "⑤", "중추적인"],
  ["cater", "⑥", "충족하다"],
  ["democratize", "⑨", "대중화하다"],
  ["constraint", "⑨", "제약"]
 ],
 defs: [
  ["dominant", "the strongest or most common of its kind"],
  ["advent", "the arrival of something new and important"],
  ["pivotal", "so important that things turn on it"],
  ["cater", "to give people what they need or want"],
  ["democratize", "to open something up to everyone"],
  ["constraint", "something that limits what you can do"]
 ],
 defOrder: [1, 4, 0, 3, 5, 2],
 flow: [
  ["For centuries", "Students gathered in classrooms to be taught by a teacher", null],
  ["The change", "The (  ①  ) of the internet made learning flexible", "advent"],
  ["What opened", "Access widened for remote or (  ②  ) areas", "underserved"],
  ["MOOCs", "Free or affordable courses (  ③  ) education", "democratized"],
  ["The result", "Learning is no longer bound by (  ④  ) or money", "geography"]
 ],
 flowBogi: "advent · underserved · democratized · geography · closed · fee",
 para: [
  ["① has been dominant for centuries", "This way of teaching ______ for centuries.", "ruled"],
  ["③ allow students to learn at their own pace", "Learners set their own ______ of study.", "speed"],
  ["④ has expanded access to education", "It opened the ______ to more learners.", "door"],
  ["⑨ without the constraints of geography", "Distance no longer ______ who can learn.", "limits"],
  ["⑪ at their convenience", "They study ______ it suits them.", "when"]
 ],
 paraBogi: "ruled · speed · door · limits · when · faded · fee · where",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "A History of the First Universities",
    "When the Classroom Left the Building",
    "Why Online Courses Have Failed",
    "How to Build a Video Camera",
    "The Cost of Printing Textbooks"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "전통적인 교육 모델은 수백 년 동안 지배적이었다.",
    "디지털 교실은 학습자가 자기 속도로 배우게 해 준다.",
    "Coursera, edX, Khan Academy 는 양질의 교육 내용을 널리 퍼뜨리는 데 큰 역할을 했다.",
    "MOOC 는 상위권 대학의 강좌를 높은 수강료로만 제공한다.",
    "MOOC 는 학습자 사이의 상호작용과 자기 주도 학습을 강조한다."
   ], ans: 4
  },
  {
   t: "write", q: "MOOC 가 교육을 ‘대중화했다’고 말하는 까닭을 우리말 한 문장으로 써 보세요.",
   ans: "지리적·경제적 제약 없이 개발도상국 학습자와 직장인까지 세계적 수준의 교육에 닿게 했기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "③",
   toks: [
    ["Digital classrooms,", "s"], ["powered by online platforms,", "m"], ["allow", "v"],
    ["students to learn", null],
    ["at their own pace, from any location, and often on their own schedules.", "m"]
   ],
   ko: "온라인 플랫폼으로 구동되는 디지털 교실은 학생들이 자기 속도로, 어느 곳에서든, 흔히 자기 일정에 맞추어 배울 수 있게 해 준다."
  },
  drill: [
   {
    n: "②",
    en: "However, the advent of the internet and digital tools has transformed education into a more dynamic and flexible experience.",
    ans: "M However · S the advent of the internet and digital tools · △V has transformed · O education · M into a more dynamic and flexible experience",
    ko: "그러나 인터넷과 디지털 도구의 등장은 교육을 더 역동적이고 유연한 경험으로 바꾸어 놓았다."
   },
   {
    n: "⑧",
    en: "The rise of MOOCs has revolutionized the education landscape by providing access to free or affordable courses from top universities and institutions around the world.",
    ans: "S The rise of MOOCs · △V has revolutionized · O the education landscape · M by providing access to free or affordable courses from top universities and institutions around the world",
    ko: "MOOC 의 부상은 세계 유수의 대학과 기관이 여는 무료 혹은 저렴한 강좌에 닿게 함으로써 교육의 지형을 완전히 바꾸어 놓았다."
   },
   {
    n: "⑫",
    en: "This model challenges the traditional time-bound structure of education and opens up new possibilities for continuous learning throughout one's life.",
    ans: "S This model · △V challenges · O the traditional time-bound structure of education · [and] △V opens up · O new possibilities for continuous learning throughout one's life",
    ko: "이 모델은 시간에 묶인 전통적 교육 구조에 도전하며, 평생에 걸친 지속적 학습의 새 가능성을 연다."
   }
  ]
 },
 syn: [
  {
   n: "⑨",
   name: "결과를 잇는 분사구문 allowing",
   q: "MOOCs have democratized education, «allowing students … to access world-class education»…",
   d: "<b>allowing</b>이 앞 절의 결과를 이어 ‘그래서 ~할 수 있게 한다’로 읽는다.",
   k: "그래서 ~이 접근할 수 있게 되었다"
  },
  {
   n: "⑪",
   name: "결과를 잇는 분사구문 making + 목적격보어",
   q: "…at their convenience, «making education more flexible and personalized»",
   d: "<b>making</b> 뒤에는 ‘무엇을 + 어떠하게’가 온다. 앞 절의 결과를 이어 읽는다.",
   k: "그래서 교육이 더 유연하고 개인화된다"
  }
 ],
 synd: [
  { u: "구문 1", en: "The library opened at night, allowing workers to study.", k: "그 도서관은 밤에 문을 열어, 노동자들이 공부할 수 있게 했다." },
  { u: "구문 2", en: "They cut the fee, making the course easy to join.", k: "그들은 수강료를 낮추어, 그 강좌를 참여하기 쉽게 만들었다." },
  { u: "구문 1 + 2", en: "The site posted videos, allowing anyone to watch, making the lecture public.", k: "그 사이트는 영상을 올려 누구나 볼 수 있게 했고, 그 강의를 공개된 것으로 만들었다." }
 ],
 why: [
  ["대학의 기원은 글에 나오지 않는다"],
  ["정답"],
  ["글은 온라인 강좌가 문을 넓혔다고 말한다 — 정반대다"],
  ["카메라 제작은 글의 관심사가 아니다"],
  ["교재 인쇄비는 글의 초점이 아니다"]
 ],
 src: [["①"], ["③"], ["⑤"], ["⑧과 어긋남 — 무료이거나 저렴한 강좌를 제공한다"], ["⑩"]],
 kb: {
  title: "MOOC",
  lead: "누구에게나 열린 강의실",
  items: [
   ["이름", "MOOC 는 Massive Open Online Course 의 머리글자다. 2008년에 처음 쓰인 말이고, 2012년에 대형 플랫폼이 잇달아 문을 열었다."],
   ["세 플랫폼", "Coursera 와 edX 는 2012년에, Khan Academy 는 2008년에 시작했다. edX 는 MIT 와 하버드가 함께 세운 비영리 기관에서 출발했다."],
   ["수료율", "MOOC 는 등록은 쉽지만 끝까지 마치는 비율은 낮다는 지적을 받아 왔다. 문을 여는 일과 끝까지 가는 일은 다른 문제라는 뜻이다."]
  ],
  ask: "여러분이 화면으로 배운 것 가운데 교실에서 배운 것과 가장 달랐던 점은 무엇인가?"
 },
 wtype: ["무관", "정답", "반대", "무관", "지엽"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 45 ───────────────────────────── */
{
 no: "45", key: "nostalgia", accent: "#B5763A", tint: "#F9F0E3", deep: "#805018",
 en: "Nostalgia and Preference",
 ko: "옛 노래가 더 좋게 들리는 이유",
 goal: "취향이 언제 굳어지는지, 그것이 무엇을 뜻하는지 설명할 수 있다.",
 fig: "Figure 1  나이에 따라 좁아지는 취향의 창.",
 tip: "먼저 생각해 보자. 부모님이 좋아하는 음악은 대개 언제 나온 것들인가?",
 sent: T(45).sent, kor: T(45).kor,
 bank: [
  ["mainstream", "①", "주류의"],
  ["hypothesize", "④", "가설을 세우다"],
  ["pertain", "④", "관련되다"],
  ["bedrock", "⑤", "반석"],
  ["idolize", "⑧", "우상화하다"],
  ["cynical", "⑧", "냉소적인"]
 ],
 defs: [
  ["mainstream", "belonging to what most people accept"],
  ["hypothesize", "to put forward an idea to be tested"],
  ["pertain", "to have to do with a certain matter"],
  ["bedrock", "the solid base that everything rests on"],
  ["idolize", "to admire someone far too much"],
  ["cynical", "quick to doubt that anything is good"]
 ],
 defOrder: [2, 5, 3, 0, 1, 4],
 flow: [
  ["The scene", "A ten-year-old prefers today's music to old recordings", null],
  ["The turn", "Grown up, they may still (  ①  ) that old music", "prefer"],
  ["The claim", "Tastes come from the (  ②  ) memories formed as children", "core"],
  ["Why later waves fail", "New work meets more (  ③  ) and less forgiving eyes", "cynical"],
  ["The verdict", "The only difference is (  ④  )", "timing"]
 ],
 flowBogi: "prefer · core · cynical · timing · reject · price",
 para: [
  ["② might even prefer them to whatever newer", "The old thing may ______ the new one.", "beat"],
  ["④ the core memories we form as children", "First strong memories ______ what we like.", "shape"],
  ["⑤ the foundational bedrock for our understanding", "They are the ______ of how we see things.", "base"],
  ["⑧ through our more experienced, more cynical", "Older eyes judge more ______.", "harshly"],
  ["⑩ The only difference is timing.", "What changes is not the song but the ______.", "moment"]
 ],
 paraBogi: "beat · shape · base · harshly · moment · lose · price · kindly",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Rap Videos Were Made",
    "Why the First Wonder Stays the Loudest",
    "Old Music Is Objectively Better",
    "A Guide to Collecting Records",
    "How Memory Is Stored in the Brain"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "열 살 아이는 옛 음악보다 오늘의 음악을 고를 것이다.",
    "그 아이가 자라면 그 옛 음악을 여전히 들을 수도 있다.",
    "필자는 취향이 어린 시절 만들어진 핵심 기억과 관련된다고 본다.",
    "필자는 이 생각이 자신만의 새로운 발견은 아니라고 밝힌다.",
    "필자는 나이가 들수록 경이감이 더 커진다고 말한다."
   ], ans: 5
  },
  {
   t: "write", q: "옛 노래가 더 좋게 들리는 까닭을 필자가 어디에서 찾는지 우리말 한 문장으로 써 보세요.",
   ans: "음악 자체가 아니라 어린 시절에 만들어진 핵심 기억과 그때의 경이감에서 찾는다."
  }
 ],
 fl: {
  model: {
   n: "⑤",
   toks: [
    ["These memories", "s"], ["serve", "v"], ["as the foundational bedrock", "m"],
    ["for our understanding of the world and our nostalgia for the ‘old days’.", "m"]
   ],
   ko: "이 기억들은 세계에 대한 우리의 이해와 ‘옛 시절’에 대한 향수의 밑바닥 반석 노릇을 한다."
  },
  drill: [
   {
    n: "⑦",
    en: "There's plenty of others who have said this first and backed it up.",
    ans: "△V There's · S plenty of others · [who] △V′ have said · O this · M first · [and] △V′ backed · O it up",
    ko: "이 말을 먼저 하고 근거를 댄 사람들이 많이 있다."
   },
   {
    n: "⑨",
    en: "The same sense of wonder that inspires us as children, when we are so full of hope and possibility, is the one we ignore and put down as we grow older and become more focused on routine and responsibilities.",
    ans: "S The same sense of wonder · [that] △V′ inspires · O us · M as children · △V is · C the one we ignore and put down · M as we grow older and become more focused on routine and responsibilities",
    ko: "어린 시절 우리를 북돋우던 바로 그 경이감이, 나이가 들어 일상과 책임에 매이면서 우리가 무시하고 밀어내는 바로 그것이다."
   },
   {
    n: "⑩",
    en: "The only difference is timing.",
    ans: "S The only difference · △V is · C timing",
    ko: "유일한 차이는 시기다."
   }
  ]
 },
 syn: [
  {
   n: "④",
   name: "같은 명사를 꾸미는 that 절 나열",
   q: "…the stuff «that wows us, that we've never seen before, that takes our breath away»",
   d: "같은 명사를 꾸미는 <b>that</b> 절 셋이 나란히 붙어 한 대상을 세 번 설명한다.",
   k: "우리를 놀라게 하고, 처음 보는 것이고, 숨을 멎게 하는 것"
  },
  {
   n: "⑨",
   name: "긴 주어 + 삽입절, 본동사는 하나",
   q: "«The same sense of wonder that inspires us as children, …, is the one we ignore»…",
   d: "주어를 꾸미는 관계절과 삽입절이 길어도 본동사는 <b>is</b> 하나다. 주어의 머리를 찾아 동사와 이어 읽는다.",
   k: "바로 그 경이감이 ~인 그것이다"
  }
 ],
 synd: [
  { u: "구문 1", en: "It was a sound that thrilled us, that we had never heard.", k: "그것은 우리를 설레게 한, 우리가 들어 본 적 없는 소리였다." },
  { u: "구문 2", en: "The song that moved us then, long forgotten, is the one we hum now.", k: "그때 우리를 움직인, 오래 잊혔던 그 노래가 지금 우리가 흥얼거리는 그것이다." },
  { u: "구문 1 + 2", en: "The film that shocked us, that we watched alone, is the one we defend today.", k: "우리를 놀라게 한, 우리가 혼자 보았던 그 영화가 오늘 우리가 옹호하는 그것이다." }
 ],
 why: [
  ["랩 영상의 제작 과정은 글에 나오지 않는다"],
  ["정답"],
  ["글은 음악이 아니라 시기의 문제라고 말한다 — 정반대다"],
  ["음반 수집법은 글의 관심사가 아니다"],
  ["기억의 저장 방식은 배경일 뿐 글의 초점이 아니다"]
 ],
 src: [["①"], ["②"], ["④"], ["⑦"], ["⑨와 어긋남 — 자라면서 그 경이감을 무시하고 밀어낸다"]],
 kb: {
  title: "회상 절정",
  lead: "왜 그 시절 노래만 남을까",
  items: [
   ["reminiscence bump", "심리학에서는 10대 후반에서 20대 초반의 기억이 유난히 또렷하게 남는 현상을 ‘회상 절정(reminiscence bump)’이라 부른다."],
   ["취향의 창", "여러 조사에서 사람들이 가장 좋아하는 음악은 대체로 청소년기에 들었던 곡으로 나타난다. 새 음악을 찾는 일이 그 뒤로 크게 줄기 때문이다."],
   ["nostalgia", "nostalgia 는 그리스어 nostos(귀향)와 algos(고통)를 합친 말이다. 17세기에는 고향을 그리는 병을 가리키는 의학 용어였다."]
  ],
  ask: "여러분이 ‘그때가 좋았다’고 느끼는 것은 그 대상 때문일까, 그때의 나 때문일까?"
 },
 wtype: ["무관", "정답", "반대", "무관", "배경"],
 stype: ["일치", "일치", "일치", "일치", "반대"]
}

 ]
};
