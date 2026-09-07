/* Unit 2 · Science & Technology — 원문 Theme 06–10 */
const R = require("../src/orig/all.json");
const T = n => R[n - 1];

module.exports = {
 no: 2,
 field: "Science & Technology",
 ko: "과학·기술",
 tagline: "묻는 법 — 무엇을 증거로 삼을 것인가",
 next: { en: "Social Matters", ko: "사람들이 모여 만든 규칙과 그 값을 읽습니다", words: "226–294 words" },
 lessons: [

/* ───────────────────────────── 06 ───────────────────────────── */
{
 no: "06", key: "twowhys", accent: "#2C6E8F", tint: "#E3EFF5", deep: "#1B4A61",
 en: "The Difference in Scientific Approaches Between Biologists and Psychologists",
 ko: "이상한 지점을 그냥 지나치지 않기",
 goal: "생물학자와 심리학자의 접근 방식이 어디에서 갈리는지 Monod의 사례를 근거로 설명할 수 있다.",
 fig: "Figure 1  같은 장면 앞에 선 두 과학자, 서로 다른 질문.",
 tip: "먼저 생각해 보자. 실험 결과가 예상과 어긋났다. 나는 그 어긋남을 파고드는 쪽인가, 원래 생각을 지키는 쪽인가?",
 sent: T(6).sent, kor: T(6).kor,
 bank: [
  ["linear", "②", "선형의"],
  ["pursuit", "④", "추구, 탐구"],
  ["validity", "⑤", "타당성"],
  ["probe", "⑤", "파고들어 조사하다"],
  ["vary", "⑥", "제각기 다르다"],
  ["susceptible", "⑩", "걸리기 쉬운"]
 ],
 defs: [
  ["linear", "going in a straight line at a steady rate"],
  ["pursuit", "the act of chasing something you want to find"],
  ["validity", "the quality of being true or well founded"],
  ["probe", "to look into something closely to find the truth"],
  ["vary", "to be different from one another"],
  ["susceptible", "easily harmed or affected by something"]
 ],
 defOrder: [3, 0, 5, 1, 4, 2],
 flow: [
  ["Puzzle", "Monod saw a brief pause he could not understand", null],
  ["Biologist's way", "He chased the (  ①  ) for the puzzling pause", "reason"],
  ["Payoff", "The chase led to a discovery that won a (  ②  ) Prize", "Nobel"],
  ["Psychologist's way", "Many prefer proving a favorite idea to (  ③  ) a puzzle", "probing"],
  ["The cost", "One chosen cause hides the (  ④  ) that came first", "biology"]
 ],
 flowBogi: "reason · Nobel · probing · biology · sugar · silence",
 para: [
  ["③ a brief pause in the growth rate", "The growth stopped for a short ______ before rising.", "while"],
  ["④ led to a discovery that won him a Nobel Prize", "Following the puzzle ______ him a Nobel Prize.", "earned"],
  ["⑤ proving the validity of a favorite idea", "They try to show a pet idea is ______.", "true"],
  ["⑨ a biology and life history that predate", "The cause may come ______ the loneliness.", "before"],
  ["⑪ this feeling may not be the major cause", "Loneliness may not be the ______ reason.", "main"]
 ],
 paraBogi: "while · earned · true · before · main · lost · after · minor",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Bacteria Choose Between Two Sugars",
    "Chasing the Puzzle, or Defending the Idea",
    "Loneliness: The Single Cause of Depression",
    "Why Nobel Prizes Go to Biologists",
    "A Short History of Metabolic Illness"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "Monod는 먹이가 한 종류일 때 박테리아 군집의 성장률이 선형적임을 알고 있었다.",
    "두 종류의 당분을 주었을 때 예상되는 증가 전에 성장률이 잠시 멈췄다.",
    "생물학자는 개인차에 주목해 원인이 되는 조건을 모두 찾아내려는 경향이 있다.",
    "심리학자들은 대개 여러 원인을 함께 검토한 뒤에 결론을 내린다.",
    "우울한 사람은 외로움과 우울보다 앞서는 생명 작용과 삶의 이력을 지닐 수 있다."
   ], ans: 4
  },
  {
   t: "write", q: "Monod를 노벨상으로 이끈 출발점이 무엇이었는지 우리말 한 문장으로 써 보세요.",
   ans: "먹이를 두 가지로 주었을 때 성장률에 나타난 짧은 멈춤이 이해되지 않아, 그 이유를 끝까지 파고든 것이 출발점이었다."
  }
 ],
 fl: {
  model: {
   n: "⑨",
   toks: [
    ["This strategy", "s"], ["ignores", "v"], ["the possibility", null], ["that", "c"],
    ["those who are depressed", "s2"], ["possess", "v2"], ["a biology and life history", null],
    ["that predate both the loneliness and the depression.", "m"]
   ],
   ko: "이 전략은 우울한 사람들이 외로움과 우울보다 앞서는 생명 작용과 삶의 이력을 지닐 가능성을 무시한다."
  },
  drill: [
   {
    n: "②",
    en: "He knew that when the food supply contained only one kind of sugar, the growth rate of the colony of bacteria was linear.",
    ans: "S He · △V knew · [that] S′ the growth rate of the colony · △V′ was · C linear · [when] S′ the food supply · △V′ contained one kind of sugar",
    ko: "그는 먹이가 한 종류의 당분만 포함할 때 박테리아 군집의 성장률이 선형적이라는 것을 알고 있었다."
   },
   {
    n: "⑦",
    en: "A biologist is likely to focus on this variation and try to discover all the responsible conditions.",
    ans: "S A biologist · △V is likely to focus · M on this variation · and △V try to discover · O all the responsible conditions",
    ko: "생물학자는 이 변이에 주목하고 원인이 되는 모든 조건을 찾아내려 하는 경향이 있다."
   },
   {
    n: "⑪",
    en: "Although she might tell a psychologist that she feels lonely, this feeling may not be the major cause of her melancholic mood.",
    ans: "[Although] S′ she · △V′ might tell · O a psychologist · [that] S′ she · △V′ feels lonely · S this feeling · △V may not be · C the major cause",
    ko: "그녀가 심리학자에게 외롭다고 말할지라도, 그 감정이 우울한 기분의 주된 원인이 아닐 수 있다."
   }
  ]
 },
 syn: [
  {
   n: "④",
   name: "관계대명사 주격 that",
   q: "Monod's pursuit … led to a discovery «that won him a Nobel Prize».",
   d: "<b>that</b>이 앞의 <b>a discovery</b>를 받아 뒤 절의 주어 노릇을 한다. ‘~한 발견’처럼 뒤에서 앞 명사를 꾸민다.",
   k: "그에게 노벨상을 안겨 준 발견"
  },
  {
   n: "⑤",
   name: "비교 구문  more A rather than B",
   q: "A fair proportion of psychologists are «more interested in proving … rather than probing» a puzzling observation.",
   d: "<b>rather than</b> 앞뒤에는 같은 모양이 온다. 여기서는 <b>proving</b>과 <b>probing</b>이 짝을 이루어 ‘B하기보다 A하기를 더’를 나타낸다.",
   k: "수수께끼 같은 관찰을 파고들기보다 좋아하는 생각의 타당성을 증명하는 데 더 관심이 있는"
  }
 ],
 synd: [
  { u: "구문 1", en: "He asked a question that no one had thought to ask.", k: "그는 아무도 물어볼 생각을 하지 못한 질문을 던졌다." },
  { u: "구문 2", en: "She was more interested in testing the idea rather than defending it.", k: "그녀는 그 생각을 옹호하기보다 검증하는 데 더 관심이 있었다." },
  { u: "구문 1 + 2", en: "He chose a puzzle that bothered him rather than a topic that looked easy.", k: "그는 쉬워 보이는 주제보다 자신을 괴롭히던 수수께끼를 골랐다." }
 ],
 why: [
  ["문장 ②~③의 실험 장면만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 외로움이 주된 원인이 아닐 수 있다고 말한다 — 정반대다"],
  ["노벨상 수상자의 분포는 글에 나오지 않는다"],
  ["신진대사 질환의 역사는 글에서 다루지 않는다"]
 ],
 src: [["②"], ["③"], ["⑦"], ["⑧과 어긋남 — 하나의 특정 원인을 골라 증명하려 한다"], ["⑨"]],
 kb: {
  title: "걸린 자리에서 시작된 발견",
  lead: "이해되지 않는 자리는 왜 중요할까?",
  items: [
   ["잠시 멈춘 성장 곡선", "Monod가 본 멈춤은 박테리아가 두 당분 가운데 하나를 먼저 다 쓰고 나서야 다른 하나로 옮겨 가느라 생긴 것이었다. 이 현상은 diauxie(이중 성장)라 불리며, 그가 유전자 발현 조절을 밝히는 출발점이 되었다."],
   ["1965년 노벨 생리·의학상", "Monod는 André Lwoff, François Jacob과 함께 ‘효소와 바이러스 합성의 유전적 조절에 관한 연구’로 1965년 노벨 생리·의학상을 받았다. 파스퇴르 연구소에서 대장균을 다루며 얻은 결과였다."],
   ["한 가지 원인이라는 함정", "하나의 결과에 원인을 하나만 짝지으려는 습관을 단일 원인 오류(single cause fallacy)라 한다. 여러 조건이 함께 작용하는 현상에서는 남은 조건들이 통째로 시야에서 사라진다."]
  ],
  ask: "여러분이 최근에 ‘그냥 그런가 보다’ 하고 넘긴 이상한 일이 있는가? 그 자리에서 무엇을 더 물어볼 수 있을까?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 07 ───────────────────────────── */
{
 no: "07", key: "hunger", accent: "#B0542C", tint: "#FBEBE2", deep: "#7C3514",
 en: "The Brain's Similar Response to Longing for Company and Food",
 ko: "혼자인 배고픔, 굶주린 외로움",
 goal: "고립 실험과 금식 실험의 결과를 정리하고, 연구진이 내린 결론의 근거를 설명할 수 있다.",
 fig: "Figure 1  열 시간을 굶은 뇌와 열 시간을 혼자 보낸 뇌, 같은 자리가 밝아진다.",
 tip: "먼저 생각해 보자. 하루 종일 아무와도 말하지 않은 날, 몸에서는 어떤 느낌이 들었는가?",
 sent: T(7).sent, kor: T(7).kor,
 bank: [
  ["isolation", "①", "고립"],
  ["ensure", "③", "확실히 하다"],
  ["activate", "⑤", "활성화하다"],
  ["fast", "⑦", "금식하다"],
  ["vary", "⑪", "달라지다"],
  ["fundamental", "⑫", "근본적인"]
 ],
 defs: [
  ["isolation", "the state of being kept apart from other people"],
  ["ensure", "to make certain that something happens"],
  ["activate", "to make something start working"],
  ["fast", "to go without food for a period of time"],
  ["vary", "to change or differ from case to case"],
  ["fundamental", "forming the base that everything rests on"]
 ],
 defOrder: [2, 5, 0, 4, 1, 3],
 flow: [
  ["Setup", "Volunteers spent ten hours in total isolation", null],
  ["First scan", "Pictures of people together (  ①  ) the substantia nigra", "activated"],
  ["Second round", "The same people were asked to (  ②  ) for ten hours", "fast"],
  ["Same pattern", "Food pictures lit the (  ③  ) region in a similar way", "same"],
  ["Conclusion", "The brain sends one general signal of (  ④  )", "longing"]
 ],
 flowBogi: "activated · fast · same · longing · silenced · memory",
 para: [
  ["① ten hours stuck in total isolation", "They were kept ______ from everyone for ten hours.", "apart"],
  ["③ didn't see a single soul during the experiment", "They met ______ during the whole experiment.", "nobody"],
  ["⑥ the greater the activation", "Stronger longing meant a ______ brain response.", "bigger"],
  ["⑨ based on whether it was food or company", "Other areas ______ between food and company.", "distinguished"],
  ["⑫ just as fundamental to us as eating", "Making bonds matters as much as ______.", "eating"]
 ],
 paraBogi: "apart · nobody · bigger · distinguished · eating · louder · ignored · sleeping",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "Why MRI Scanners Need Windowless Rooms",
    "One Signal for Two Hungers",
    "Food Beats Company in the Human Brain",
    "How to Survive Ten Hours Alone",
    "A Guide to Reading Brain Scans"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "참가자들은 창문 없는 방에서 열 시간 동안 휴대 전화도 쓰지 못한 채 지냈다.",
    "참가자들은 MRI 스캐너에서 스스로 자세를 잡는 방법을 교육받았다.",
    "사람을 보고 싶다고 더 많이 말한 참가자일수록 활성화가 더 강했다.",
    "음식 사진을 보았을 때 흑질의 활동 패턴은 사람 사진 때와 크게 달랐다.",
    "보상 시스템 같은 부위에서는 원하던 대상에 따라 활동 패턴이 달랐다."
   ], ans: 4
  },
  {
   t: "write", q: "연구진이 흑질을 ‘갈망의 일반적인 신호’를 보내는 곳이라고 본 근거를 우리말 한 문장으로 써 보세요.",
   ans: "굶은 뒤 음식 사진을 보았을 때의 흑질 활동 패턴이 고립된 뒤 사람 사진을 보았을 때 관찰된 것과 비슷했기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "⑥",
   toks: [
    ["The more", "m"], ["participants", "s"], ["stated", "v"],
    ["that they longed to see people,", null], ["and", "c"],
    ["the richer the social life", "m"], ["they", "s2"], ["had,", "v2"],
    ["the greater the activation.", null]
   ],
   ko: "참가자가 사람을 보고 싶다고 더 많이 말할수록, 그리고 사회생활이 더 풍부할수록 활성화가 더 강했다."
  },
  drill: [
   {
    n: "①",
    en: "Researchers at the Massachusetts Institute of Technology had volunteers spend ten hours stuck in total isolation in windowless rooms with no access to mobile phones.",
    ans: "S Researchers at MIT · △V had · O volunteers · C spend ten hours stuck in total isolation · M in windowless rooms with no access to mobile phones",
    ko: "MIT의 연구진은 지원자들에게 휴대 전화도 쓸 수 없는 창문 없는 방에서 열 시간을 완전한 고립 상태로 보내게 했다."
   },
   {
    n: "⑧",
    en: "Interestingly enough, the pattern of activity in the substantia nigra was similar to that observed when they were shown images of people together.",
    ans: "M Interestingly enough · S the pattern of activity · △V was · C similar to that observed · [when] S′ they · △V′ were shown · O images of people together",
    ko: "흥미롭게도 흑질의 활동 패턴은 함께 있는 사람들의 이미지를 보여 주었을 때 관찰된 것과 비슷했다."
   },
   {
    n: "⑫",
    en: "That the brain employs similar neuronal machinery for both hunger and a desire for social interaction suggests that, from the brain's perspective, the instinct to create and nurture social relationships is just as fundamental to us as eating.",
    ans: "S [That] S′ the brain △V′ employs similar neuronal machinery · △V suggests · [that] S′ the instinct to create and nurture social relationships · △V′ is · C just as fundamental to us as eating",
    ko: "뇌가 배고픔과 사회적 상호작용 욕구 모두에 비슷한 신경 장치를 쓴다는 사실은, 관계를 맺고 가꾸려는 본능이 먹는 것만큼 근본적임을 시사한다."
   }
  ]
 },
 syn: [
  {
   n: "③",
   name: "의문사 + to부정사  how to ~",
   q: "…, «they were instructed on how to position themselves» in the MRI scanner on their own.",
   d: "<b>how to + 동사원형</b>은 ‘~하는 방법’이라는 뜻의 명사 덩어리다. 여기서는 전치사 <b>on</b>의 목적어로 쓰였다.",
   k: "그들은 스스로 자세를 잡는 방법을 교육받았다"
  },
  {
   n: "⑨",
   name: "It ~ that 강조 구문",
   q: "…, based on «whether it was food or company that the participants were desiring».",
   d: "<b>It was … that ~</b> 사이에 강조하고 싶은 말을 넣는다. 여기서는 참가자가 원하던 것이 <b>food</b>인지 <b>company</b>인지를 강조한다.",
   k: "참가자들이 원하던 것이 음식인지 교제인지"
  }
 ],
 synd: [
  { u: "구문 1", en: "The nurse showed him how to hold the sensor still.", k: "간호사는 그에게 센서를 가만히 잡는 방법을 보여 주었다." },
  { u: "구문 2", en: "It was the silence that made the ten hours feel long.", k: "열 시간을 길게 느끼게 만든 것은 바로 그 침묵이었다." },
  { u: "구문 1 + 2", en: "It was the manual that taught us how to read the scan.", k: "우리에게 그 영상을 읽는 방법을 가르쳐 준 것은 바로 그 설명서였다." }
 ],
 why: [
  ["실험 절차의 한 부분만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 두 갈망이 같은 자리를 밝혔다고 말한다 — 우열을 가리지 않는다"],
  ["고립을 견디는 방법은 글에 나오지 않는다"],
  ["뇌 영상을 읽는 방법은 글에서 다루지 않는다"]
 ],
 src: [["①"], ["③"], ["⑥"], ["⑧과 어긋남 — 흑질의 패턴은 사람 사진 때와 비슷했다"], ["⑨"]],
 kb: {
  title: "흑질, 갈망이 켜지는 자리",
  lead: "뇌의 한 점이 배고픔과 외로움을 함께 맡는다?",
  items: [
   ["흑질(substantia nigra)", "중뇌에 있는 작은 구조로, 이름은 ‘검은 물질’이라는 뜻이다. 신경멜라닌 색소 때문에 어둡게 보인다. 도파민을 만드는 신경세포가 모여 있어 운동과 보상에 함께 관여한다."],
   ["파킨슨병과의 관계", "흑질의 도파민 신경세포가 크게 줄면 파킨슨병 증상이 나타난다. 갈망이 켜지는 자리와 움직임을 만드는 자리가 겹쳐 있는 셈이다."],
   ["fMRI가 보는 것", "기능적 자기공명영상은 신경세포의 발화를 직접 보지 않는다. 활동이 늘어난 부위로 몰리는 혈류의 산소 변화를 잰다. ‘밝아졌다’는 말은 피가 더 갔다는 뜻에 가깝다."]
  ],
  ask: "배고플 때와 외로울 때 여러분의 몸에는 어떤 공통된 신호가 오는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 08 ───────────────────────────── */
{
 no: "08", key: "spheres", accent: "#4A7C46", tint: "#E7F1E5", deep: "#2E5429",
 en: "Aristotle's Concept of the Terrestrial and Celestial Regions",
 ko: "달 아래는 변하고, 달 위는 변하지 않는다",
 goal: "아리스토텔레스가 세계를 두 영역으로 나눈 기준과 두 영역이 이어지는 방식을 설명할 수 있다.",
 fig: "Figure 1  달을 경계로 나뉜 두 세계 — 아래는 변하고, 위는 변하지 않는다.",
 tip: "먼저 생각해 보자. 밤하늘은 어제와 오늘이 똑같아 보인다. 이 인상만으로 무엇을 결론지을 수 있을까?",
 sent: T(8).sent, kor: T(8).kor,
 bank: [
  ["distinct", "①", "뚜렷이 다른"],
  ["characterize", "②", "특징짓다"],
  ["contrary", "③", "상반되는"],
  ["compound", "⑤", "화합물"],
  ["purity", "⑧", "순도"],
  ["subsequent", "⑫", "그에 뒤따르는"]
 ],
 defs: [
  ["distinct", "clearly different from something else"],
  ["characterize", "to be a typical mark of something"],
  ["contrary", "completely opposite in nature"],
  ["compound", "a thing made by mixing two or more parts"],
  ["purity", "the state of being free from other things"],
  ["subsequent", "coming after something else in time"]
 ],
 defOrder: [4, 1, 5, 0, 3, 2],
 flow: [
  ["Two regions", "Aristotle split the world into terrestrial and celestial", null],
  ["Below", "Four elements move in (  ①  ) lines, out or in", "straight"],
  ["Above", "A fifth element, aither, moves in a (  ②  )", "circle"],
  ["Not separate", "The celestial can (  ③  ) the terrestrial", "affect"],
  ["An example", "Rain follows heating, evaporation and (  ④  )", "condensation"]
 ],
 flowBogi: "straight · circle · affect · condensation · silence · gravity",
 para: [
  ["① two distinct regions", "The world falls into two ______ parts.", "separate"],
  ["④ move away from or towards the center", "They travel out from or ______ the middle.", "toward"],
  ["⑤ are each a sort of compound", "Everyday bodies are ______ of elements.", "mixtures"],
  ["⑧ less pure in closer proximity to them", "Aither grows less pure as it comes ______.", "nearer"],
  ["⑩ the celestial region can affect the terrestrial", "What happens above can ______ what is below.", "change"]
 ],
 paraBogi: "separate · toward · mixtures · nearer · change · equal · farther · single",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "The Four Qualities: Hot, Cold, Dry, Moist",
    "Two Regions, One Connected Cosmos",
    "Why the Heavens Never Touch the Earth",
    "How Aristotle Measured the Distance to the Sun",
    "The Latin Origins of Scientific Words"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "지상 영역의 네 원소는 뜨겁고 차갑고 건조하고 습한 성질로 구분된다.",
    "불과 공기는 우주의 중심에서 멀어지고 흙과 물은 중심을 향해 움직인다.",
    "일상에서 마주치는 물체는 원소 그 자체가 아니라 일종의 화합물이다.",
    "아이테르는 지상 원소에 더 가까울수록 더 순수해진다.",
    "비가 내리는 것은 태양의 운동과 그에 뒤따르는 증발·응결 과정 때문이다."
   ], ans: 4
  },
  {
   t: "write", q: "두 영역이 서로 무관하지 않다는 것을 보여 주는 예를 우리말 한 문장으로 써 보세요.",
   ans: "아이테르의 운동이 지상의 물질을 데우고, 태양이 가까워지고 멀어지는 운동과 그에 뒤따르는 증발·응결이 비를 만든다는 설명이 그 예이다."
  }
 ],
 fl: {
  model: {
   n: "⑨",
   toks: [
    ["The four terrestrial elements", "s"], ["are", "v"], ["themselves material causes,", null],
    ["while", "c"], ["the motion of the continually moving bodies in the celestial sphere", "s2"],
    ["is", "v2"], ["the efficient cause of some terrestrial events.", null]
   ],
   ko: "네 가지 지상 원소는 그 자체로 물질인이고, 천상의 구에서 끊임없이 움직이는 천체의 운동은 일부 지상 사건의 동력인이다."
  },
  drill: [
   {
    n: "②",
    en: "Each region is characterized by specific material elements and motions.",
    ans: "S Each region · △V is characterized · M by specific material elements and motions",
    ko: "각 영역은 특정한 물질적 요소와 운동 방식으로 특징지어진다."
   },
   {
    n: "⑥",
    en: "What we know as everyday, ordinary ‘earth’ is a compound composed of the elements Earth, Water, Fire, and Air.",
    ans: "S [What] S′ we △V′ know as everyday, ordinary ‘earth’ · △V is · C a compound · M composed of the elements Earth, Water, Fire, and Air",
    ko: "우리가 일상의 평범한 ‘땅’으로 알고 있는 것은 흙·물·불·공기로 이루어진 화합물이다."
   },
   {
    n: "⑪",
    en: "The motion of the aither causes material in the terrestrial realm to be heated.",
    ans: "S The motion of the aither · △V causes · O material in the terrestrial realm · C to be heated",
    ko: "아이테르의 운동은 지상 영역의 물질이 데워지도록 만든다."
   }
  ]
 },
 syn: [
  {
   n: "⑦",
   name: "소유격 관계대명사 whose",
   q: "There is a fifth element that is the stuff of the celestial bodies «whose natural motion is circular».",
   d: "<b>whose</b>는 앞 명사와 뒤 명사를 ‘~의’로 잇는다. 여기서는 <b>the celestial bodies</b>의 <b>natural motion</b>을 가리킨다.",
   k: "자연스러운 운동이 원형인 천체들"
  },
  {
   n: "⑧",
   name: "분사구문  being ~",
   q: "The aither varies in purity, «being more pure where it is more distant» from the terrestrial elements.",
   d: "접속사와 주어를 지우고 <b>being</b>으로 시작하는 덩어리를 만들어 앞 문장에 설명을 덧붙인다. ‘~하면서, ~한 상태로’로 읽는다.",
   k: "지상 원소에서 더 멀리 떨어진 곳에서는 더 순수하면서"
  }
 ],
 synd: [
  { u: "구문 1", en: "We studied a star whose light took years to reach us.", k: "우리는 빛이 우리에게 닿는 데 몇 년이 걸린 별을 연구했다." },
  { u: "구문 2", en: "The metal changes colour, being softer near the flame.", k: "그 금속은 불꽃 가까이에서 더 무르면서 색이 변한다." },
  { u: "구문 1 + 2", en: "He drew a sphere whose surface was smooth, being polished for hours.", k: "그는 몇 시간 동안 닦여 표면이 매끄러운 구를 그렸다." }
 ],
 why: [
  ["문장 ③의 성질 목록만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 천상계가 지상계에 영향을 미친다고 말한다 — 정반대다"],
  ["거리를 재는 이야기는 글에 나오지 않는다"],
  ["용어의 어원은 글에서 다루지 않는다"]
 ],
 src: [["③"], ["④"], ["⑤"], ["⑧과 어긋남 — 지상 원소에서 멀수록 더 순수하다"], ["⑫"]],
 kb: {
  title: "달 위의 하늘이 흔들린 날",
  lead: "변하지 않는다던 천상계는 어떻게 무너졌을까?",
  items: [
   ["다섯 번째 원소", "아리스토텔레스는 흙·물·공기·불에 더해 천체를 이루는 제5원소를 두었다. 라틴어로 aether, 훗날 quinta essentia(다섯 번째 본질)라 불렸고, 여기에서 영어 quintessence(정수)가 나왔다."],
   ["1572년의 새 별", "티코 브라헤는 카시오페이아자리에서 전에 없던 밝은 별을 관측하고 『De Nova Stella』(1573)를 냈다. 그 별의 위치가 밤새 움직이지 않는다는 사실은 그것이 달보다 먼 곳에 있다는 뜻이었고, 천상계는 변하지 않는다는 전제가 흔들렸다."],
   ["망원경이 본 달", "갈릴레오는 1610년 『Sidereus Nuncius』에서 달 표면의 산과 구덩이를 그렸다. 완전한 구여야 할 천체가 지상처럼 울퉁불퉁하다는 관측이었다."]
  ],
  ask: "‘저것은 원래 그런 것이다’라고 배운 것 가운데, 관측 하나로 뒤집힐 수 있는 것은 무엇일까?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 09 ───────────────────────────── */
{
 no: "09", key: "zipper", accent: "#7A4FA3", tint: "#F0EAF7", deep: "#4E2E70",
 en: "Illusion of Knowledge",
 ko: "검색창을 닫고 나면 남는 것",
 goal: "웹 검색이 지식의 착각을 만드는 과정을 실험 결과를 근거로 설명할 수 있다.",
 fig: "Figure 1  익숙함을 앎으로 착각하는 자리 — 설명해 보라고 하면 드러난다.",
 tip: "먼저 생각해 보자. 방금 검색해서 알게 된 것과 원래 알고 있던 것을, 하루 뒤에도 구별할 수 있을까?",
 sent: T(9).sent, kor: T(9).kor,
 bank: [
  ["reveal", "①", "드러내다"],
  ["exaggerated", "②", "과장된"],
  ["delude", "⑤", "착각하게 하다"],
  ["inflate", "⑨", "부풀리다"],
  ["overconfidence", "⑩", "과신"],
  ["unprecedented", "⑫", "전례 없는"]
 ],
 defs: [
  ["reveal", "to make something known that was hidden"],
  ["exaggerated", "made to seem larger than it really is"],
  ["delude", "to make someone believe what is not true"],
  ["inflate", "to make something bigger than it should be"],
  ["overconfidence", "too strong a belief in your own ability"],
  ["unprecedented", "never known or done before"]
 ],
 defOrder: [3, 0, 4, 2, 5, 1],
 flow: [
  ["Finding", "Searching the web gives an illusion of knowledge", null],
  ["Design", "One group searched, the other stayed (  ①  )", "offline"],
  ["Result", "Searchers believed they knew (  ②  ) than they did", "more"],
  ["Spread", "The illusion reached other, (  ③  ) topics", "unrelated"],
  ["Why the web", "It is accessible, fast, and gives immediate (  ④  )", "feedback"]
 ],
 flowBogi: "offline · more · unrelated · feedback · fewer · slower",
 para: [
  ["② confuse what's online with what's in their head", "They mix up the screen with their own ______.", "memory"],
  ["⑤ believing they know more than they really do", "They think their knowledge is ______ than it is.", "larger"],
  ["⑦ isn't limited to the particular subjects", "The illusion spreads ______ the searched topic.", "beyond"],
  ["⑩ a misperception of the depth of knowledge", "They misjudge how ______ their own knowing goes.", "deep"],
  ["⑬ nearly always accessible", "The Internet is open to us almost ______.", "always"]
 ],
 paraBogi: "memory · larger · beyond · deep · always · smaller · rarely · shallow",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Yale Divided Its Test Subjects into Groups",
    "Why a Search Feels Like Knowing",
    "The Internet Makes Us Honest About Our Limits",
    "A Short History of Libraries",
    "How to Search the Web Efficiently"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "연구진은 피실험자를 검색하는 집단과 인터넷을 쓰지 않는 집단으로 나누었다.",
    "검색 과정의 시간·내용·특징을 통제한 뒤에도 그 효과는 유지되었다.",
    "한 주제를 검색하면 관련 없는 다른 주제에 대한 이해 인식까지 부풀려졌다.",
    "검색을 한 사람들은 자기 두뇌 활동을 대조군보다 낮게 평가했다.",
    "인터넷은 책이나 도서관과 달리 즉각적인 피드백을 제공한다."
   ], ans: 4
  },
  {
   t: "write", q: "연구진이 피실험자에게 두뇌 활동을 추정하게 한 이유를 우리말 한 문장으로 써 보세요.",
   ans: "과신이 Google이 정보를 잘 준다는 신뢰 때문이 아니라 자기 머릿속 지식의 깊이를 오해한 데서 비롯되었음을 확인하기 위해서였다."
  }
 ],
 fl: {
  model: {
   n: "⑤",
   toks: [
    ["The experiments", "s"], ["consistently", "m"], ["showed", "v"], ["that", "c"],
    ["searching the web", "s2"], ["deludes", "v2"], ["people", null],
    ["into believing they know more than they really do.", "m"]
   ],
   ko: "실험들은 웹 검색이 사람들을 착각하게 만들어 실제보다 더 많이 안다고 믿게 한다는 것을 일관되게 보여 주었다."
  },
  drill: [
   {
    n: "①",
    en: "A new Yale study reveals that searching the web provides people with an “illusion of knowledge.”",
    ans: "S A new Yale study · △V reveals · [that] S′ searching the web · △V′ provides · O people with an “illusion of knowledge”",
    ko: "예일 대학의 새 연구는 웹 검색이 사람들에게 ‘지식의 착각’을 준다는 것을 밝힌다."
   },
   {
    n: "⑨",
    en: "Doing searches on one topic inflates people's sense of how well they understand other, unrelated topics.",
    ans: "S Doing searches on one topic · △V inflates · O people's sense · M of how well they understand other, unrelated topics",
    ko: "한 주제를 검색하는 일은 관련 없는 다른 주제를 얼마나 잘 이해하는지에 대한 인식을 부풀린다."
   },
   {
    n: "⑪",
    en: "Those who had been searching the net before the task rated their brain activity as being significantly stronger than did the control group that hadn't been looking up information online.",
    ans: "S Those [who] △V′ had been searching the net · △V rated · O their brain activity · C as being significantly stronger · M than did the control group",
    ko: "과제 전에 인터넷을 검색해 온 사람들은 자기 두뇌 활동을 온라인에서 정보를 찾지 않은 대조군보다 훨씬 더 강하다고 평가했다."
   }
  ]
 },
 syn: [
  {
   n: "⑩",
   name: "사역동사 have + 목적어 + 원형부정사",
   q: "…, the psychologists, in one of the experiments, «had the test subjects make estimates» of their brain activity.",
   d: "<b>have + 목적어 + 동사원형</b>은 ‘~에게 …하게 하다’이다. to를 붙이지 않는다는 점이 핵심이다.",
   k: "심리학자들은 피실험자들에게 추정을 하게 했다"
  },
  {
   n: "⑪",
   name: "비교 구문의 도치  than + 동사 + 주어",
   q: "…rated their brain activity as being significantly stronger «than did the control group».",
   d: "than 뒤에서 <b>주어와 대동사가 자리를 바꾸는</b> 일이 있다. <b>did</b>는 앞의 <b>rated</b>를 대신한다.",
   k: "대조군이 평가한 것보다"
  }
 ],
 synd: [
  { u: "구문 1", en: "The teacher had us write down what we already knew.", k: "선생님은 우리에게 이미 알고 있는 것을 적게 했다." },
  { u: "구문 2", en: "He answered the question faster than did his partner.", k: "그는 자기 짝이 답한 것보다 더 빨리 그 질문에 답했다." },
  { u: "구문 1 + 2", en: "She had the class guess the answer sooner than did the other group.", k: "그녀는 다른 집단보다 더 일찍 학급에게 답을 추측하게 했다." }
 ],
 why: [
  ["실험 설계의 한 대목만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 검색이 자기 지식을 과대평가하게 만든다고 말한다 — 정반대다"],
  ["도서관의 역사는 글에 나오지 않는다"],
  ["검색을 잘하는 방법은 글에서 다루지 않는다"]
 ],
 src: [["④"], ["⑥"], ["⑨"], ["⑪과 어긋남 — 대조군보다 훨씬 더 강하다고 평가했다"], ["⑬"]],
 kb: {
  title: "안다는 느낌은 어디서 오는가",
  lead: "설명해 보라고 하면 왜 말문이 막힐까?",
  items: [
   ["설명 깊이의 착각", "Rozenblit와 Keil(2002)은 지퍼·자물쇠 같은 일상 물건의 작동을 얼마나 아는지 점수로 매기게 한 뒤, 실제로 설명해 보게 했다. 설명을 시도한 다음 다시 매긴 점수는 뚜렷이 낮아졌다. 이를 illusion of explanatory depth라 부른다."],
   ["구글 효과", "Sparrow, Liu, Wegner(2011)는 나중에 찾아볼 수 있다고 생각한 정보를 사람들이 덜 기억하는 대신, 그것이 저장된 위치를 더 잘 기억한다고 보고했다. 기억을 몸 밖에 두는 셈이다."],
   ["원래 논문", "이 글이 인용한 연구는 Fisher, Goddu, Keil(2015)의 「Searching for Explanations」이다. 검색이 자기 내부 지식에 대한 인식을 부풀린다는 결과를 담고 있다."]
  ],
  ask: "여러분이 ‘안다’고 여기는 것 하나를 골라, 그림 없이 종이 한 장에 설명해 볼 수 있는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 10 ───────────────────────────── */
{
 no: "10", key: "doubt", accent: "#C2455E", tint: "#FAE7EB", deep: "#8C2740",
 en: "Skepticism in Scientific Inquiry",
 ko: "‘~인 것 같다’로 시작한 과학",
 goal: "Pyrrho의 언어 습관이 오늘날 과학의 표현 방식으로 이어진 과정을 설명할 수 있다.",
 fig: "Figure 1  주장의 크기만큼 무거워지는 증거의 저울.",
 tip: "먼저 생각해 보자. 친구가 ‘어제 유령을 봤다’고 한다. 믿거나 안 믿거나 말고, 세 번째 반응이 있을까?",
 sent: T(10).sent, kor: T(10).kor,
 bank: [
  ["object", "②", "반대하다"],
  ["dogmatic", "②", "독단적인"],
  ["certainty", "③", "확실성"],
  ["qualifying", "④", "한정하는"],
  ["exempt", "⑦", "면제하다"],
  ["plausibility", "⑩", "타당성"]
 ],
 defs: [
  ["object", "to say that you disagree with something"],
  ["dogmatic", "sure you are right and refusing to doubt"],
  ["certainty", "the state of being completely sure"],
  ["qualifying", "making a statement less strong or general"],
  ["exempt", "to free someone from a duty others have"],
  ["plausibility", "how likely something is to be true"]
 ],
 defOrder: [5, 2, 0, 4, 1, 3],
 flow: [
  ["Roots", "Skepticism goes back to Pyrrho of Elis", null],
  ["His claim", "No knowledge is free of (  ①  )", "uncertainty"],
  ["His habit", "He opened every claim with a (  ②  ) phrase", "qualifying"],
  ["Today", "Scientists mark the degree of evidential (  ③  )", "warrant"],
  ["The point", "Probability rises but never reaches absolute (  ④  )", "certainty"]
 ],
 flowBogi: "uncertainty · qualifying · warrant · certainty · proof · silence",
 para: [
  ["② each of which claimed to possess certain knowledge", "Each school said it held ______ knowledge.", "sure"],
  ["③ knowledge always came with uncertainty", "We can never be fully ______ of what we know.", "certain"],
  ["⑤ achieve a sense of inner peace", "Doubt could make the mind ______.", "calm"],
  ["⑦ they exempted all philosophers from taxation", "Philosophers paid ______ tax at all.", "no"],
  ["⑩ eventually eliminating weaker ones", "The weaker guesses are ______ one by one.", "dropped"]
 ],
 paraBogi: "sure · certain · calm · no · dropped · double · kept · loud",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "Why Elis Made a Philosopher Its Head Priest",
    "Doubt as a Working Method",
    "Science Finally Reaches Absolute Certainty",
    "Ancient Greek Tax Law Explained",
    "How to Win a Philosophical Debate"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "Pyrrho는 확실한 지식을 가지고 있다고 주장하던 당시 철학들에 반대했다.",
    "그는 자신의 주장을 ‘~인 것 같다’ 같은 한정 표현으로 시작하곤 했다.",
    "Elis의 시민들은 그의 지혜를 존중해 그를 수석 성직자로 삼았다.",
    "오늘날 과학자들은 증거의 강도와 상관없이 같은 표현으로 결론을 말한다.",
    "결론은 점점 더 높은 개연성에 이르지만 절대적 확실성에는 닿지 못한다."
   ], ans: 4
  },
  {
   t: "write", q: "오늘날 과학자들이 Pyrrho의 언어 습관을 잇고 있다고 필자가 보는 이유를 우리말 한 문장으로 써 보세요.",
   ans: "과학자들도 실험에 따른 주장을 할 때 증거의 타당성 정도에 맞추어 한정하는 표현을 덧붙여 말하기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "③",
   toks: [
    ["He", "s"], ["questioned", "v"], ["whether", "c"], ["it", "s2"], ["was", "v2"], ["possible", null],
    ["for human beings to determine any knowledge with certainty", "m"], ["and", "c"], ["concluded", "v"],
    ["that", "c"], ["we", "s2"], ["must accept", "v2"],
    ["that knowledge always came with uncertainty.", null]
   ],
   ko: "그는 인간이 어떤 지식이든 확실하게 확정하는 것이 가능한지 물었고, 지식에는 늘 불확실성이 따른다는 것을 받아들여야 한다고 결론지었다."
  },
  drill: [
   {
    n: "④",
    en: "To express this consistently, Pyrrho would always preface any claims he made with qualifying phrases like “it seems,” “it appears to me,” or “perhaps.”",
    ans: "M To express this consistently · S Pyrrho · △V would always preface · O any claims he made · M with qualifying phrases like “it seems,” “it appears to me,” or “perhaps”",
    ko: "이를 일관되게 표현하려고 Pyrrho는 자기 주장을 늘 ‘~인 것 같다’ 같은 한정 표현으로 시작하곤 했다."
   },
   {
    n: "⑧",
    en: "Scientists today follow a version of Pyrrho's linguistic practice in the way they, too, use care when making empirical claims by couching them with qualifying phrases to mark their degree of evidential warrant.",
    ans: "S Scientists today · △V follow · O a version of Pyrrho's linguistic practice · M in the way they use care · M by couching them with qualifying phrases",
    ko: "오늘날 과학자들도 증거의 타당성 정도를 표시하는 한정 표현을 덧붙여 조심스럽게 말한다는 점에서 Pyrrho의 언어 관행을 따른다."
   },
   {
    n: "⑪",
    en: "The fact that conclusions may achieve higher and higher probability, but never quite reach absolute certainty, is a hallmark of inductive reasoning upon which science is based.",
    ans: "S The fact · [that] S′ conclusions · △V′ may achieve … but never reach … · △V is · C a hallmark of inductive reasoning",
    ko: "결론이 점점 더 높은 개연성에 이르지만 절대적 확실성에는 결코 닿지 못한다는 사실은 과학이 딛고 선 귀납 추론의 특징이다."
   }
  ]
 },
 syn: [
  {
   n: "②",
   name: "전치사 + 관계대명사  each of which",
   q: "Pyrrho objected to the dogmatic philosophies of his day, «each of which claimed to possess certain knowledge».",
   d: "<b>each of which</b>는 앞의 여러 대상을 하나씩 가리키며 뒤 절의 주어가 된다. <b>and each of them</b>으로 바꿔 읽으면 쉽다.",
   k: "그것들은 저마다 확실한 지식을 가지고 있다고 주장했다"
  },
  {
   n: "⑪",
   name: "동격의 that절",
   q: "«The fact that conclusions may achieve higher and higher probability» … is a hallmark of inductive reasoning.",
   d: "<b>the fact that ~</b>에서 that절은 앞의 명사 <b>fact</b>와 같은 내용을 담는다. ‘~라는 사실’로 읽는다.",
   k: "결론이 점점 더 높은 개연성에 이른다는 사실"
  }
 ],
 synd: [
  { u: "구문 1", en: "He read three papers, each of which reported a different result.", k: "그는 논문 세 편을 읽었는데, 그것들은 저마다 다른 결과를 보고했다." },
  { u: "구문 2", en: "The fact that the test can be repeated makes the claim stronger.", k: "그 실험을 반복할 수 있다는 사실이 그 주장을 더 강하게 만든다." },
  { u: "구문 1 + 2", en: "The fact that he cited two studies, each of which used the same data, weakened his case.", k: "그가 같은 자료를 쓴 연구 두 편을 인용했다는 사실이 그의 주장을 약하게 만들었다." }
 ],
 why: [
  ["문장 ⑥의 일화만 붙든 지엽적인 제목이다"],
  ["정답"],
  ["글은 결론이 절대적 확실성에 이르지 못한다고 말한다 — 정반대다"],
  ["세법 자체는 글에서 다루지 않는다"],
  ["논쟁에서 이기는 방법은 글에 나오지 않는다"]
 ],
 src: [["②"], ["④"], ["⑥"], ["⑨와 어긋남 — 증거의 강도에 따라 표현의 세기를 달리한다"], ["⑪"]],
 kb: {
  title: "‘아마도’라고 말하는 훈련",
  lead: "확신을 줄이는 말이 왜 과학의 언어가 되었을까?",
  items: [
   ["에포케(epoché)", "판단을 잠시 멈추는 태도를 가리키는 그리스어다. 피론주의는 어느 한쪽으로 결론 내리기를 보류함으로써 마음의 동요가 가라앉는 상태(아타락시아)에 이른다고 보았다."],
   ["기록을 남긴 제자", "Pyrrho 자신은 저술을 남기지 않았다. 그의 생각은 제자 Timon의 기록과, 훨씬 뒤인 2~3세기 Sextus Empiricus의 저작을 통해 전해진다."],
   ["IPCC의 확신 어휘", "기후 보고서는 결론마다 확신의 정도를 정해진 낱말로 표시한다. virtually certain(99% 이상), very likely(90% 이상), likely(66% 이상)처럼 확률 구간을 낱말에 묶어 두는 방식이다."]
  ],
  ask: "여러분이 쓴 글에서 ‘~이다’라고 단정한 문장 하나를 골라, 증거의 세기에 맞게 고쳐 쓴다면 어떤 말이 될까?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
}

 ]
};
