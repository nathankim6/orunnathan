/* Unit 12 · Current Affairs — 원문 Theme 56–60 */
const R = require("../src/orig/all.json");
const T = n => R[n - 1];

module.exports = {
 no: 12,
 field: "Current Affairs",
 ko: "시사",
 tagline: "지금 벌어지는 일 — 날씨·의료·소속·일·필요",
 lessons: [

/* ───────────────────────────── 56 ───────────────────────────── */
{
 no: "56", key: "blizzard", accent: "#3F6491", tint: "#E7EDF5", deep: "#274A72",
 en: "How Can Climate Change Affect Blizzards?",
 ko: "북극이 데워지면 겨울이 매서워진다",
 goal: "북극 해빙 감소가 제트 기류를 거쳐 한파로 이어지는 사슬을 설명할 수 있다.",
 fig: "Figure 1  기온 차가 줄면 제트 기류가 굽이친다.",
 tip: "먼저 생각해 보자. 지구가 더워지는데 왜 더 매서운 겨울이 올까?",
 sent: T(56).sent, kor: T(56).kor,
 bank: [
  ["extent", "①", "범위"],
  ["feedback loop", "②", "되먹임 고리"],
  ["amplification", "⑤", "증폭"],
  ["jet stream", "⑧", "제트 기류"],
  ["troposphere", "⑨", "대류권"],
  ["persistent", "⑫", "오래 이어지는"]
 ],
 defs: [
  ["extent", "how far something reaches or spreads"],
  ["feedback loop", "a chain in which a result feeds its own cause"],
  ["amplification", "the making of something larger or stronger"],
  ["jet stream", "a fast river of air high in the sky"],
  ["troposphere", "the lowest layer of the atmosphere"],
  ["persistent", "going on for a long time without stopping"]
 ],
 defOrder: [3, 5, 1, 0, 4, 2],
 flow: [
  ["The start", "Arctic sea ice has been declining since the 1970s", null],
  ["The loop", "Dark water absorbs the sunlight the (  ①  ) would have reflected", "ice"],
  ["The result", "The Arctic warms about (  ②  ) as fast as the rest of the world", "twice"],
  ["The jet stream", "A smaller temperature difference (  ③  ) the jet stream", "slows"],
  ["The winter", "Its dips pull (  ④  ) air down from the north", "Arctic"]
 ],
 flowBogi: "ice · twice · slows · Arctic · speeds · half",
 para: [
  ["① has been steadily declining since record-keeping", "The ice has ______ year after year.", "shrunk"],
  ["③ gets absorbed by the newly exposed, dark ocean", "Dark water ______ the light in.", "takes"],
  ["⑤ warming about twice as fast as the rest", "The Arctic heats ______ as fast as elsewhere.", "twice"],
  ["⑪ which slows the jet stream", "The current ______ down.", "slows"],
  ["⑫ it pulls Arctic air down from the north", "It ______ cold air southward.", "drags"]
 ],
 paraBogi: "shrunk · takes · twice · slows · drags · grown · gives · half",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Snowplows Are Built",
    "Warmer Poles, Harsher Winters",
    "Why the Arctic Is Cooling Fast",
    "A Guide to Reading Weather Maps",
    "The History of Record-Keeping"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "북극 해빙의 범위는 1970년대 관측이 시작된 이래 꾸준히 줄어 왔다.",
    "얼음이 반사했을 햇빛을 새로 드러난 바닷물이 대신 흡수한다.",
    "북극은 세계의 나머지 지역보다 절반쯤 느리게 더워지고 있다.",
    "제트 기류는 대류권을 도는 빠른 공기의 흐름이다.",
    "제트 기류의 교란은 눈보라를 포함한 극한 한파의 증가와 연결되어 왔다."
   ], ans: 3
  },
  {
   t: "write", q: "북극이 더워질 때 제트 기류에 일어나는 변화를 우리말 한 문장으로 써 보세요.",
   ans: "극지와 열대의 기온 차가 줄어 제트 기류가 느려지고 남북으로 더 크게 굽이친다."
  }
 ],
 fl: {
  model: {
   n: "⑩",
   toks: [
    ["It", "s"], ["is driven", "v"],
    ["by the difference between air temperatures to the north and south of its path:", "m"],
    ["The bigger the temperature difference, the faster the jet stream.", null]
   ],
   ko: "제트 기류는 그 경로의 북쪽과 남쪽 기온 차로 움직인다. 기온 차가 클수록 제트 기류는 더 빨라진다."
  },
  drill: [
   {
    n: "③",
    en: "The loop begins when sunlight, which would have been reflected by the ice, gets absorbed by the newly exposed, dark ocean water instead.",
    ans: "S The loop · △V begins · [when] S′ sunlight · [which] △V′ would have been reflected · M by the ice · △V′ gets absorbed · M by the newly exposed, dark ocean water instead",
    ko: "그 고리는 얼음이 반사했을 햇빛이 대신 새로 드러난 어두운 바닷물에 흡수될 때 시작된다."
   },
   {
    n: "⑪",
    en: "As the Arctic warms, the temperature difference between the polar regions and the tropical regions decreases, which slows the jet stream and causes its path to weave farther north and south.",
    ans: "[As] S′ the Arctic · △V′ warms · S the temperature difference between the polar regions and the tropical regions · △V decreases · [which] △V′ slows · O the jet stream · [and] △V′ causes · O its path to weave farther north and south",
    ko: "북극이 더워지면 극지와 열대의 기온 차가 줄어들고, 그것이 제트 기류를 느리게 하며 그 경로가 남북으로 더 크게 굽이치게 만든다."
   },
   {
    n: "⑫",
    en: "As it dips farther south than usual, it pulls Arctic air down from the north, causing a persistent spell of unusually cold weather in that region.",
    ans: "[As] S′ it · △V′ dips · M farther south than usual · S it · △V pulls · O Arctic air · M down from the north · M causing a persistent spell of unusually cold weather in that region",
    ko: "제트 기류가 평소보다 더 남쪽으로 처지면 북쪽에서 북극 공기를 끌어내려, 그 지역에 이례적으로 추운 날씨가 오래 이어지게 만든다."
   }
  ]
 },
 syn: [
  {
   n: "⑩",
   name: "The 비교급 ~, the 비교급 ~",
   q: "«The bigger the temperature difference, the faster the jet stream.»",
   d: "<b>the + 비교급</b>이 두 번 나오면 ‘~할수록 더 …하다’로 읽는다. 앞이 조건, 뒤가 결과다.",
   k: "기온 차가 클수록 제트 기류는 더 빠르다"
  },
  {
   n: "⑪",
   name: "앞 절을 받는 which (그리고 그것이 ~한다)",
   q: "…the temperature difference … decreases, «which slows the jet stream and causes its path to weave farther north and south».",
   d: "<b>which</b>가 앞 절 전체를 받아 결과를 잇는다. 뒤에 동사가 둘 붙을 수도 있다.",
   k: "그리고 그것이 제트 기류를 느리게 한다"
  }
 ],
 synd: [
  { u: "구문 1", en: "The colder the north, the stronger the wind.", k: "북쪽이 추울수록 바람은 더 강해진다." },
  { u: "구문 2", en: "The ice melted early, which changed the whole season.", k: "얼음이 일찍 녹았고, 그것이 계절 전체를 바꾸었다." },
  { u: "구문 1 + 2", en: "The warmer the pole, the weaker the current, which brings cold south.", k: "극지가 따뜻할수록 그 흐름은 약해지고, 그것이 추위를 남쪽으로 데려온다." }
 ],
 why: [
  ["제설차 제작은 글에 나오지 않는다"],
  ["정답"],
  ["글은 북극이 빠르게 더워진다고 말한다 — 정반대다"],
  ["일기도 읽는 법은 글의 관심사가 아니다"],
  ["기록 관측의 역사는 글의 초점이 아니다"]
 ],
 src: [["①"], ["③"], ["⑤와 어긋남 — 나머지 지역보다 약 두 배 빠르게 더워진다"], ["⑨"], ["⑬"]],
 kb: {
  title: "북극 증폭",
  lead: "얼음이 줄면 생기는 일",
  items: [
   ["알베도", "밝은 얼음은 햇빛을 되쏘고 어두운 바다는 흡수한다. 이 반사율 차이를 알베도(albedo)라 하며, 되먹임 고리의 출발점이다."],
   ["북극 증폭", "북극이 지구 평균보다 빠르게 더워지는 현상을 북극 증폭(Arctic amplification)이라 한다. 본문은 그 속도를 약 두 배로 적고 있다."],
   ["제트 기류", "제트 기류는 남북의 기온 차로 움직인다. 그 차이가 줄면 흐름이 느려지고 물결처럼 크게 굽이쳐, 굽이 안쪽에 한파가 오래 머문다."]
  ],
  ask: "더워진 세계에서 더 추운 겨울이 온다는 말은 모순일까?"
 },
 wtype: ["무관", "정답", "반대", "무관", "지엽"],
 stype: ["일치", "일치", "반대", "일치", "일치"]
},

/* ───────────────────────────── 57 ───────────────────────────── */
{
 no: "57", key: "healing", accent: "#2E7A70", tint: "#E2F1EE", deep: "#1A554D",
 en: "Healing Humans",
 ko: "대신할 것인가, 곁에 설 것인가",
 goal: "의료 기술의 미래를 둘러싼 현실주의자들의 주장과 필자가 덧붙이는 요구를 설명할 수 있다.",
 fig: "Figure 1  대신하는 쪽과 곁에서 돕는 쪽.",
 tip: "먼저 생각해 보자. 진료에서 사람만이 할 수 있는 일은 무엇일까?",
 sent: T(57).sent, kor: T(57).kor,
 bank: [
  ["futurist", "①", "미래학자"],
  ["empathy", "②", "공감"],
  ["deregulation", "⑦", "규제 완화"],
  ["ingenious", "⑨", "기발한"],
  ["lodestar", "⑪", "길잡이"],
  ["automation", "⑫", "자동화"]
 ],
 defs: [
  ["futurist", "a person who studies what may come next"],
  ["empathy", "sharing in what another person feels"],
  ["deregulation", "the removal of rules on an industry"],
  ["ingenious", "clever in a new and skilful way"],
  ["lodestar", "a guiding point that one steers by"],
  ["automation", "letting machines do what people did"]
 ],
 defOrder: [4, 0, 5, 2, 1, 3],
 flow: [
  ["The realists", "They picture AI aiding rather than replacing doctors", null],
  ["What is human", "Empathy, insight, and (  ①  ) still belong to people", "skill"],
  ["Where they slip", "They read health care through an (  ②  ) lens", "economic"],
  ["Their remedy", "They ask for deregulation and (  ③  ) limits", "budget"],
  ["The counter", "We need more responsibility for better (  ④  ), not less", "data"]
 ],
 flowBogi: "skill · economic · budget · data · money · fewer",
 para: [
  ["② human empathy plays in care", "Care still needs a human ______.", "heart"],
  ["③ AI is primarily aiding rather than replacing", "AI should help, not ______, the doctor.", "replace"],
  ["⑥ complaining about their expense and inefficiencies", "They see only the ______ of the system.", "cost"],
  ["⑨ we need to invest in the cutting edge", "We should put money into the ______.", "frontier"],
  ["⑫ in favor of a lasting human presence", "A person should ______ in the room.", "stay"]
 ],
 paraBogi: "heart · replace · cost · frontier · stay · head · help · leave",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Hospitals Are Funded",
    "Let the Machine Help, Not Replace",
    "Why Doctors Will Soon Be Gone",
    "A Guide to Writing Science Fiction",
    "The History of Nursing Uniforms"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "현실적인 의료 미래학자들은 공감·통찰·손기술이 하는 역할을 인정한다.",
    "그들은 대체로 AI 가 의사와 간호사를 대체하기보다 돕는 미래를 지지한다.",
    "그들은 혁신을 북돋우려 규제 완화를, 비용 절감을 위해 예산 제한을 주장한다.",
    "필자는 의료 기술 정책에서 자료를 모으고 쓰는 책임을 줄여야 한다고 본다.",
    "필자는 자동화를 적용할 때에도 사람이 오래 함께 있어야 한다고 본다."
   ], ans: 4
  },
  {
   t: "write", q: "필자가 현실주의자들에게 아쉬워하는 점을 우리말 한 문장으로 써 보세요.",
   ans: "의료 제도를 주로 경제의 눈으로만 보아 정책과 법에서 헤맨다는 점이다."
  }
 ],
 fl: {
  model: {
   n: "③",
   toks: [
    ["They", "s"], ["by and large embrace", "v"], ["the first new law of robotics,", null],
    ["promoting a future", "m"], ["where", "c"], ["AI", "s2"], ["is primarily aiding", "v2"],
    ["rather than replacing doctors and nurses.", "m"]
   ],
   ko: "그들은 대체로 로봇공학의 첫 번째 새 법칙을 받아들여, AI 가 의사와 간호사를 대체하기보다 주로 돕는 미래를 밀어준다."
  },
  drill: [
   {
    n: "②",
    en: "They recognize the critical role that human empathy plays in care, that human insight contributes to diagnoses, and that human skill adds to surgery.",
    ans: "S They · △V recognize · O the critical role · [that] S′ human empathy · △V′ plays · M in care · [that] S′ human insight · △V′ contributes · M to diagnoses · [and that] S′ human skill · △V′ adds · M to surgery",
    ko: "그들은 사람의 공감이 돌봄에서 하는 결정적 역할을, 사람의 통찰이 진단에 보태는 바를, 사람의 손기술이 수술에 더하는 바를 인정한다."
   },
   {
    n: "⑨",
    en: "And we need to invest in the cutting edge of medical practice, rather than simply assuming that hospitals and doctors will come up with ever more ingenious ways of doing more with less.",
    ans: "[And] S we · △V need · O to invest in the cutting edge of medical practice · M rather than simply assuming that hospitals and doctors will come up with ever more ingenious ways of doing more with less",
    ko: "그리고 우리는 병원과 의사가 더 적은 것으로 더 많은 일을 하는 더 기발한 방법을 내놓으리라고 그저 가정하기보다, 의료 현장의 최전선에 투자해야 한다."
   },
   {
    n: "⑬",
    en: "While economic demands will pressure hospitals and insurers to substitute software for therapists and bots for nurses' attention, professional associations should ensure that cost considerations are balanced against the many benefits of direct human involvement in care.",
    ans: "[While] S′ economic demands · △V′ will pressure · O hospitals and insurers to substitute software for therapists and bots for nurses' attention · S professional associations · △V should ensure · [that] S′ cost considerations · △V′ are balanced · M against the many benefits of direct human involvement in care",
    ko: "경제적 요구가 병원과 보험사에 치료사 대신 소프트웨어를, 간호사의 돌봄 대신 봇을 넣으라고 압박하겠지만, 전문가 협회는 비용 고려가 돌봄에 사람이 직접 참여해 얻는 여러 이점과 균형을 이루게 해야 한다."
   }
  ]
 },
 syn: [
  {
   n: "③",
   name: "A rather than B (B가 아니라 A)",
   q: "…a future where AI is primarily «aiding rather than replacing» doctors and nurses.",
   d: "<b>rather than</b> 앞이 실제로 하는 쪽이다. 두 동사가 같은 모양으로 짝을 이룬다.",
   k: "대체하기보다 돕는"
  },
  {
   n: "⑬",
   name: "양보의 while (~하겠지만)",
   q: "«While economic demands will pressure hospitals and insurers to substitute software for therapists», professional associations should ensure…",
   d: "<b>while</b>이 문장 앞에 오면 ‘~하겠지만’으로 읽는다. 뒤의 주절이 필자의 요구다.",
   k: "압박하겠지만"
  }
 ],
 synd: [
  { u: "구문 1", en: "The tool guides the nurse rather than taking her place.", k: "그 도구는 간호사를 대신하기보다 안내한다." },
  { u: "구문 2", en: "While costs will rise, the care must not fall.", k: "비용은 오르겠지만 돌봄이 떨어져서는 안 된다." },
  { u: "구문 1 + 2", en: "While budgets tighten, hospitals should add staff rather than software.", k: "예산은 죄어들겠지만, 병원은 소프트웨어보다 사람을 늘려야 한다." }
 ],
 why: [
  ["병원 재정 구조는 글의 초점이 아니다"],
  ["정답"],
  ["글은 사람의 자리가 남아야 한다고 말한다 — 정반대다"],
  ["공상과학 작법은 글의 관심사가 아니다"],
  ["간호복의 역사는 글에서 다루지 않는다"]
 ],
 src: [["②"], ["③"], ["⑦"], ["⑧과 어긋남 — 책임을 더 늘려야 한다고 말한다"], ["⑫"]],
 kb: {
  title: "돕는 자동화",
  lead: "대체가 아니라 보조",
  items: [
   ["로봇공학의 새 법칙", "법학자 프랭크 파스콸레(Frank Pasquale)는 ‘로봇공학의 새 법칙’을 제안하며, 첫 번째로 로봇이 전문가를 대체하지 말고 보완해야 한다고 썼다."],
   ["보조 진단", "영상 판독을 돕는 인공지능은 의사의 판단을 대신하지 않고 후보를 좁혀 준다. 최종 판단과 설명의 책임은 사람에게 남는다."],
   ["자료의 책임", "본문이 요구하는 것은 규제 완화가 아니라, 좋은 자료를 모으고 쓰는 책임을 더 무겁게 지우는 쪽이다."]
  ],
  ask: "여러분이 환자라면 기계가 맡아도 좋은 일과 사람이 맡아야 하는 일을 어떻게 나누겠는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 58 ───────────────────────────── */
{
 no: "58", key: "nation", accent: "#9A3E3E", tint: "#F6E7E7", deep: "#6C2222",
 en: "Ethnic Nationalism",
 ko: "누가 ‘우리’인가",
 goal: "인구 변화와 종족적 민족주의의 부상이 어떻게 이어지는지 설명할 수 있다.",
 fig: "Figure 1  시민적 소속과 종족적 소속.",
 tip: "먼저 생각해 보자. 한 나라의 ‘우리’는 무엇으로 정해질까?",
 sent: T(58).sent, kor: T(58).kor,
 bank: [
  ["birthrate", "①", "출생률"],
  ["demographic", "②", "인구의"],
  ["multiracial", "②", "다인종의"],
  ["mandate", "⑤", "위임 권한"],
  ["referendum", "⑥", "국민 투표"],
  ["undermine", "⑦", "약화시키다"]
 ],
 defs: [
  ["birthrate", "how many babies are born per year"],
  ["demographic", "about the make-up of a population"],
  ["multiracial", "made up of people of many races"],
  ["mandate", "the authority given to act on something"],
  ["referendum", "a direct public vote on one question"],
  ["undermine", "to weaken something from below"]
 ],
 defOrder: [2, 5, 0, 3, 1, 4],
 flow: [
  ["The trend", "The US and Europe may be minority-white by 2050", null],
  ["Two changes", "Relative power falls and the (  ①  ) mix shifts", "demographic"],
  ["The reaction", "White (  ②  ) movements promise greatness again", "nationalist"],
  ["The target", "The EU runs (  ③  ) to the interests of nationalism", "counter"],
  ["Brexit", "Fears of Turkish inclusion shaped the (  ④  ) vote", "2016"]
 ],
 flowBogi: "demographic · nationalist · counter · 2016 · economic · 1990",
 para: [
  ["① As native birthrates decline", "Fewer babies are ______ at home.", "born"],
  ["② a decline in their countries' relative power", "Their countries feel less ______ now.", "powerful"],
  ["③ while simultaneously preserving their majority-white", "They also want the old ______ kept.", "majority"],
  ["⑤ runs counter to the interests of nationalism", "The EU cuts ______ the nationalist aim.", "against"],
  ["⑦ the movement appears to be growing", "The movement is ______, not shrinking.", "growing"]
 ],
 paraBogi: "born · powerful · majority · against · growing · lost · weaker · minority",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How the EU Was Founded",
    "Who Counts as ‘Us’",
    "Why Nationalism Is Fading Away",
    "A Guide to Voting Systems",
    "The Geography of Turkey"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "미국과 유럽은 2050년 무렵 백인이 다수가 아닌 사회가 될 가능성이 크다.",
    "많은 백인들에게 이 변화는 정체성의 두 갈래 변화로 다가온다.",
    "‘세계주의’ 비판자들과 종족적 민족주의 지지자들은 최근 상당한 영향력을 얻었다.",
    "2016년 6월 브렉시트 국민 투표는 튀르키예 편입에 대한 두려움에 크게 영향을 받았다.",
    "필자는 이 운동이 경제·인구 현실 때문에 줄어들고 있다고 본다."
   ], ans: 5
  },
  {
   t: "write", q: "종족적 민족주의 운동이 EU 를 주요 표적으로 삼은 까닭을 우리말 한 문장으로 써 보세요.",
   ans: "세계주의 위임 권한과 인권 장치, 비백인 다수 국가의 가입 수용이 민족주의의 이해와 어긋나기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "①",
   toks: [
    ["As", "c"], ["native birthrates", "s2"], ["decline", "v2"], ["and", "c"],
    ["immigration", "s2"], ["continues,", "v2"],
    ["the United States and Europe", "s"], ["are", "v"],
    ["likely to become minority-white by 2050.", null]
   ],
   ko: "자국 출생률이 줄고 이민이 이어지면서, 미국과 유럽은 2050년 무렵 백인이 다수가 아닌 사회가 될 가능성이 크다."
  },
  drill: [
   {
    n: "③",
    en: "In reaction to these long-term trends, white nationalist movements that promise to make their home countries “great” again by re-establishing their place in the world, while simultaneously preserving their majority-white demographics, have become more popular.",
    ans: "M In reaction to these long-term trends · S white nationalist movements · [that] △V′ promise · O to make their home countries “great” again by re-establishing their place in the world, while simultaneously preserving their majority-white demographics · △V have become · C more popular",
    ko: "이런 장기적 흐름에 대한 반작용으로, 세계 속 자리를 되찾아 모국을 다시 ‘위대하게’ 만들면서 동시에 백인 다수 인구 구성을 지키겠다고 약속하는 백인 민족주의 운동이 더 인기를 얻었다."
   },
   {
    n: "⑥",
    en: "The June 2016 Brexit referendum, in which a slim majority of UK voters elected to leave the EU as a reassertion of traditional British identity, was profoundly affected by fears of Turkish inclusion and large-scale nonwhite immigration.",
    ans: "S The June 2016 Brexit referendum · [in which] S′ a slim majority of UK voters · △V′ elected · O to leave the EU as a reassertion of traditional British identity · △V was profoundly affected · M by fears of Turkish inclusion and large-scale nonwhite immigration",
    ko: "영국 유권자의 근소한 다수가 전통적 영국 정체성을 다시 내세우며 EU 탈퇴를 택한 2016년 6월 브렉시트 국민 투표는, 튀르키예 편입과 대규모 비백인 이민에 대한 두려움에 깊이 영향을 받았다."
   },
   {
    n: "⑧",
    en: "It has already profoundly disrupted the global economy, and its capacity to disrupt economic and military alliances in the future is enormous.",
    ans: "S It · △V has already profoundly disrupted · O the global economy · [and] S its capacity to disrupt economic and military alliances in the future · △V is · C enormous",
    ko: "그것은 이미 세계 경제를 깊이 흔들었고, 앞으로 경제적·군사적 동맹을 흔들 힘도 엄청나다."
   }
  ]
 },
 syn: [
  {
   n: "⑥",
   name: "전치사 + 관계대명사 (in which)",
   q: "The June 2016 Brexit referendum, «in which a slim majority of UK voters elected to leave the EU»…",
   d: "<b>in which</b>는 ‘그 안에서 ~한’이다. 앞의 명사를 그 자리에 넣어 읽으면 뜻이 잡힌다.",
   k: "그 투표에서 근소한 다수가 ~을 택한"
  },
  {
   n: "⑦",
   name: "양보의 Although + would appear to",
   q: "«Although economic and demographic realities would appear to undermine the antiglobalist mission», the movement appears to be growing…",
   d: "<b>Although</b>가 앞세운 사실을 주절이 뒤집는다. ‘~처럼 보이지만 실제로는 …’로 읽는다.",
   k: "약화시킬 것처럼 보이지만"
  }
 ],
 synd: [
  { u: "구문 1", en: "The vote in which they chose to leave changed everything.", k: "그들이 떠나기로 택한 그 투표가 모든 것을 바꾸었다." },
  { u: "구문 2", en: "Although the numbers looked clear, the mood did not follow.", k: "숫자는 분명해 보였지만, 분위기는 그것을 따르지 않았다." },
  { u: "구문 1 + 2", en: "Although the poll in which they trusted said no, the result said yes.", k: "그들이 믿은 그 여론조사는 아니라고 했지만, 결과는 그렇다고 했다." }
 ],
 why: [
  ["EU 의 설립 과정은 글의 초점이 아니다"],
  ["정답"],
  ["글은 그 운동이 커지고 있다고 말한다 — 정반대다"],
  ["선거 제도 안내는 글의 관심사가 아니다"],
  ["튀르키예의 지리는 글에서 다루지 않는다"]
 ],
 src: [["①"], ["②"], ["④"], ["⑥"], ["⑦과 어긋남 — 줄기는커녕 커지는 것으로 보인다고 말한다"]],
 kb: {
  title: "시민적 민족주의와 종족적 민족주의",
  lead: "‘우리’를 정하는 두 방식",
  items: [
   ["두 갈래", "법과 제도를 받아들이면 구성원이 되는 쪽을 시민적(civic) 민족주의, 혈통과 문화로 구성원을 정하는 쪽을 종족적(ethnic) 민족주의라 부른다."],
   ["브렉시트", "2016년 6월 23일 영국 국민 투표에서 탈퇴 51.9%, 잔류 48.1%로 근소한 차이가 났다. 이민 문제가 주요 쟁점 가운데 하나였다."],
   ["인구 전망", "본문이 인용한 2050년 전망은 출생률과 이민 추세를 바탕으로 한 추정치다. 추정치는 전제가 바뀌면 함께 바뀐다."]
  ],
  ask: "‘우리나라 사람’을 정하는 기준을 여러분은 무엇으로 삼겠는가?"
 },
 wtype: ["지엽", "정답", "반대", "무관", "무관"],
 stype: ["일치", "일치", "일치", "일치", "반대"]
},

/* ───────────────────────────── 59 ───────────────────────────── */
{
 no: "59", key: "cobot", accent: "#4C4E8C", tint: "#E9E9F5", deep: "#31336A",
 en: "Collaborative Automation Technologies",
 ko: "기계와 나란히 서는 일",
 goal: "협업 자동화가 생산성을 높이는 조건과, 그것을 가로막거나 앞당기는 태도를 설명할 수 있다.",
 fig: "Figure 1  절반을 맡기고 남은 절반.",
 tip: "먼저 생각해 보자. 기계와 함께 일하려면 무엇이 필요할까?",
 sent: T(59).sent, kor: T(59).kor,
 bank: [
  ["collaborative", "①", "협업의"],
  ["administrative", "①", "관리의"],
  ["enhancement", "③", "향상"],
  ["sabotage", "⑤", "방해하다"],
  ["implement", "⑤", "도입하다"],
  ["materialise", "⑧", "실현되다"]
 ],
 defs: [
  ["collaborative", "done by people working together"],
  ["administrative", "to do with running an organisation"],
  ["enhancement", "a rise in quality or amount"],
  ["sabotage", "to spoil a plan on purpose"],
  ["implement", "to put a plan into real use"],
  ["materialise", "to actually happen as expected"]
 ],
 defOrder: [5, 1, 3, 0, 4, 2],
 flow: [
  ["The stage", "People and machines deliver the work together", null],
  ["The gain", "Workers serve more customers with the (  ①  ) of technology", "help"],
  ["The condition", "The effect appears only if employees actually (  ②  ) with it", "work"],
  ["The range", "Workers may embrace, resist, or even (  ③  ) the effort", "sabotage"],
  ["The managers", "(  ④  ) percent would keep automation without the money", "65"]
 ],
 flowBogi: "help · work · sabotage · 65 · fight · 33",
 para: [
  ["① human employees and automation technologies work", "People and machines do the job ______.", "together"],
  ["② makes employees more productive", "Workers get more ______ with the tools.", "done"],
  ["③ it will only happen if employees actually work", "It works only when staff really ______ in.", "join"],
  ["⑤ actively sabotage an organisation's efforts", "Some quietly ______ the whole effort.", "wreck"],
  ["⑧ robots deliver higher quality work than humans", "They judge the robot's work ______.", "better"]
 ],
 paraBogi: "together · done · join · wreck · better · apart · lost · worse",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Robots Are Assembled",
    "The Half We Hand Over",
    "Why Automation Always Fails",
    "A Guide to Online Courses",
    "The History of Factory Whistles"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "협업 자동화 단계에서는 사람과 기술이 함께 일해 서비스와 제품을 낸다.",
    "자동화 기술을 쓰면 직원은 전보다 더 많은 제품을 만들고 더 많은 손님을 응대할 수 있다.",
    "향상 효과는 직원의 태도와 상관없이 언제나 나타난다.",
    "직원들은 소극적으로 저항하거나 적극적으로 방해하기도 한다.",
    "조사에 응한 관리자의 65퍼센트는 재정적 이득이 없어도 지금의 자동화 수준을 유지하겠다고 했다."
   ], ans: 3
  },
  {
   t: "write", q: "관리자들이 재정적 이득 없이도 자동화를 유지하겠다고 답한 까닭을 우리말 한 문장으로 써 보세요.",
   ans: "로봇이 사람보다 더 나은 품질의 일을 한다고 여기기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "③",
   toks: [
    ["This", "s"], ["is", "v"], ["the enhancement effect of automation,", null],
    ["but", "c"], ["it", "s"], ["will only happen", "v"], ["if", "c"],
    ["employees", "s2"], ["actually work", "v2"],
    ["with the respective automation technology.", "m"]
   ],
   ko: "이것이 자동화의 향상 효과인데, 그것은 직원들이 해당 자동화 기술과 실제로 함께 일할 때에만 일어난다."
  },
  drill: [
   {
    n: "②",
    en: "In economic terms, the use of automation technologies makes employees more productive because they can produce more products and serve more customers with the help of technology than before automation.",
    ans: "M In economic terms · S the use of automation technologies · △V makes · O employees more productive · [because] S′ they · △V′ can produce · O more products · [and] △V′ serve · O more customers with the help of technology than before automation",
    ko: "경제적으로 보면, 자동화 기술을 쓰는 일은 직원을 더 생산적으로 만든다. 기술의 도움으로 자동화 이전보다 더 많은 제품을 만들고 더 많은 손님을 응대할 수 있기 때문이다."
   },
   {
    n: "⑤",
    en: "They may passively support or actively embrace collaborative service robots, but they may also passively resist or actively sabotage an organisation's efforts to implement service robots.",
    ans: "S They · △V may passively support · [or] △V actively embrace · O collaborative service robots · [but] S they · △V may also passively resist · [or] △V actively sabotage · O an organisation's efforts to implement service robots",
    ko: "그들은 협업 서비스 로봇을 소극적으로 지지하거나 적극적으로 받아들일 수도 있지만, 서비스 로봇을 들이려는 조직의 노력에 소극적으로 저항하거나 적극적으로 훼방을 놓을 수도 있다."
   },
   {
    n: "⑥",
    en: "Hence, when employees have a high willingness to collaborate with automation technologies, it will be easier for companies and organisations to automate various processes in their operations.",
    ans: "M Hence · [when] S′ employees · △V′ have · O a high willingness to collaborate with automation technologies · S it · △V will be · C easier for companies and organisations to automate various processes in their operations",
    ko: "따라서 직원들이 자동화 기술과 협업할 뜻이 클 때, 기업과 조직이 운영의 여러 과정을 자동화하기가 더 쉬워진다."
   }
  ]
 },
 syn: [
  {
   n: "③",
   name: "only if (~할 때에만)",
   q: "…but it «will only happen if employees actually work with the respective automation technology».",
   d: "<b>only if</b>는 조건을 하나로 좁힌다. ‘그때에만’이라는 뜻이 되도록 only 의 자리를 살펴 읽는다.",
   k: "직원이 실제로 함께 일할 때에만"
  },
  {
   n: "⑧",
   name: "양보의 even if (설령 ~하더라도)",
   q: "…would keep the current level of automation «even if the financial benefits do not materialise»…",
   d: "<b>even if</b>는 아직 일어나지 않은 일을 앞세운 양보다. ‘설령 ~하더라도’로 읽는다.",
   k: "설령 재정적 이득이 실현되지 않더라도"
  }
 ],
 synd: [
  { u: "구문 1", en: "The gain appears only if the team uses the tool.", k: "그 이득은 팀이 그 도구를 쓸 때에만 나타난다." },
  { u: "구문 2", en: "They kept the robots even if the savings never came.", k: "절감이 끝내 오지 않더라도 그들은 로봇을 유지했다." },
  { u: "구문 1 + 2", en: "Even if the cost falls, the gain comes only if workers agree.", k: "설령 비용이 내려가더라도, 그 이득은 노동자가 동의할 때에만 온다." }
 ],
 why: [
  ["로봇 조립 과정은 글에 나오지 않는다"],
  ["정답"],
  ["글은 자동화가 생산성을 높인다고 말한다 — 정반대다"],
  ["온라인 학습 플랫폼은 조사 주체로 한 번 나올 뿐이다"],
  ["공장 사이렌의 역사는 글에서 다루지 않는다"]
 ],
 src: [["①"], ["②"], ["③과 어긋남 — 직원이 실제로 함께 일할 때만 나타난다"], ["⑤"], ["⑧"]],
 kb: {
  title: "코봇",
  lead: "사람 곁에서 일하는 기계",
  items: [
   ["코봇", "사람과 같은 공간에서 함께 일하도록 만든 로봇을 협동 로봇(collaborative robot), 줄여서 코봇(cobot)이라 한다. 안전 울타리 없이 나란히 서는 것이 특징이다."],
   ["향상 효과", "본문의 enhancement effect 는 도구가 사람의 산출을 키우는 효과다. 도구를 쓰지 않으면 그 효과는 계산에만 남고 현장에는 나타나지 않는다."],
   ["받아들임의 폭", "같은 기술을 두고도 적극적 수용부터 적극적 훼방까지 태도의 폭이 넓다. 도입의 성패가 기술만이 아니라 사람에게 달린 까닭이다."]
  ],
  ask: "여러분이 기계와 함께 일한다면 어떤 몫을 기계에 넘기고 어떤 몫을 쥐고 있겠는가?"
 },
 wtype: ["무관", "정답", "반대", "지엽", "무관"],
 stype: ["일치", "일치", "반대", "일치", "일치"]
},

/* ───────────────────────────── 60 ───────────────────────────── */
{
 no: "60", key: "needs", accent: "#9A6A2E", tint: "#F6EEE0", deep: "#6B4614",
 en: "Invented Consumer Needs in Capitalism",
 ko: "이 필요는 언제 생겼을까",
 goal: "마케팅이 어떻게 ‘필요’를 만들어 내는지, 필자가 그것을 왜 문제로 보는지 설명할 수 있다.",
 fig: "Figure 1  어떤 필요에는 생일이 있다.",
 tip: "먼저 생각해 보자. 지금 꼭 필요하다고 느끼는 물건은 언제부터 필요했을까?",
 sent: T(60).sent, kor: T(60).kor,
 bank: [
  ["umpteenth", "①", "몇 번째인지 모를"],
  ["quantitative", "③", "양적인"],
  ["superfluous", "⑤", "남아도는"],
  ["commons", "⑥", "공유재"],
  ["induce", "⑨", "유도하다"],
  ["narcissistic", "⑨", "자기도취적인"]
 ],
 defs: [
  ["umpteenth", "one more in a long, tiresome series"],
  ["quantitative", "counted in amounts, not in quality"],
  ["superfluous", "more than is needed or useful"],
  ["commons", "what a community shares and holds"],
  ["induce", "to bring about a certain behaviour"],
  ["narcissistic", "taken up with one's own image"]
 ],
 defOrder: [3, 0, 5, 1, 4, 2],
 flow: [
  ["The claim", "Most goods answer no real private or public need", null],
  ["The state's view", "They are needed because production boosts (  ①  )", "growth"],
  ["The method", "Demand is created by massive investments called (  ②  )", "marketing"],
  ["The damage", "Bottled water ads harm the (  ③  )", "commons"],
  ["The person", "The isolated buyer meets the “(  ④  ) crowd”", "lonely"]
 ],
 flowBogi: "growth · marketing · commons · lonely · quality · public",
 para: [
  ["① do not represent a need, either private or public", "Most of these goods answer no real ______.", "need"],
  ["③ conceived of as a merely quantitative function", "Growth is counted only as an ______.", "amount"],
  ["⑤ persuade consumers to think that they need", "Ads teach buyers to ______ they need it.", "believe"],
  ["⑧ invent new private wants and needs", "Marketing was built to ______ new wants.", "invent"],
  ["⑩ finds in products, in goods, in objects", "He looks for ties in ______, not people.", "things"]
 ],
 paraBogi: "need · amount · believe · invent · things · price · doubt · people",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Bottled Water Is Made",
    "The Needs That Were Invented",
    "Why Marketing Rarely Works",
    "A Guide to Saving Money",
    "The History of Shoe Design"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "필자는 오늘의 생산 방식이 내놓는 대부분의 재화가 실제 필요를 나타내지 않는다고 본다.",
    "국가의 관점에서도 이 재화들은 필요하지 않은 것으로 여겨진다.",
    "사적 재화에 대한 필요는 마케팅이라 불리는 투자로 수요를 조작해 만들어진다.",
    "생수 광고는 공유재를 해치는 사례로 제시된다.",
    "마케팅 전략은 새로운 사적 욕구와 필요를 만들어 내려고 개발되었다."
   ], ans: 2
  },
  {
   t: "write", q: "필자가 ‘성장’이라는 말을 무책임한 이념이라고 부르는 까닭을 우리말 한 문장으로 써 보세요.",
   ans: "성장을 오로지 양적인 함수로만 생각하기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "④",
   toks: [
    ["The need for private goods", "s"], ["is created", "v"],
    ["by manipulating demand", "m"],
    ["by means of specific and massive investments called marketing.", "m"]
   ],
   ko: "사적 재화에 대한 필요는 마케팅이라 불리는 구체적이고 대규모의 투자로 수요를 조작해 만들어진다."
  },
  drill: [
   {
    n: "②",
    en: "From the state's perspective, nonetheless, these goods are needed in so far as their production boosts growth and development of the national economy.",
    ans: "M From the state's perspective, nonetheless · S these goods · △V are needed · [in so far as] S′ their production · △V′ boosts · O growth and development of the national economy",
    ko: "그렇지만 국가의 관점에서 이 재화들은 그 생산이 국민 경제의 성장과 발전을 밀어 올리는 한에서는 필요한 것이다."
   },
   {
    n: "⑥",
    en: "In some cases, marketing activities increase the consumption and accumulation of private goods as if there were a need for them, thus damaging the commons, such as in the case of commercial ads for bottled drinking water.",
    ans: "M In some cases · S marketing activities · △V increase · O the consumption and accumulation of private goods · [as if] △V′ there were · C a need for them · M thus damaging the commons, such as in the case of commercial ads for bottled drinking water",
    ko: "어떤 경우에 마케팅 활동은 마치 그것들이 필요한 것처럼 사적 재화의 소비와 축적을 늘려, 생수 광고의 사례처럼 공유재를 해친다."
   },
   {
    n: "⑨",
    en: "Marketing induces consumer behaviour that has devastating ecological effects, by creating false images and materialistic myths of an egocentric and narcissistic character.",
    ans: "S Marketing · △V induces · O consumer behaviour · [that] △V′ has · O devastating ecological effects · M by creating false images and materialistic myths of an egocentric and narcissistic character",
    ko: "마케팅은 자기중심적이고 자기도취적인 성격의 거짓 이미지와 물질주의 신화를 만들어 냄으로써, 생태에 파괴적인 영향을 미치는 소비 행동을 유도한다."
   }
  ]
 },
 syn: [
  {
   n: "②",
   name: "in so far as (~하는 한에서는)",
   q: "…these goods are needed «in so far as their production boosts growth and development»…",
   d: "<b>in so far as</b>는 조건의 범위를 긋는다. ‘~하는 한에서만 그렇다’로 읽는다.",
   k: "성장을 밀어 올리는 한에서는"
  },
  {
   n: "⑥",
   name: "as if there were (마치 ~인 것처럼)",
   q: "…increase the consumption and accumulation of private goods «as if there were a need for them»…",
   d: "실제로는 아닌 일을 빗대는 자리라 <b>were</b>가 쓰인다. ‘마치 ~이라도 되는 것처럼’으로 읽는다.",
   k: "마치 그것들이 필요하기라도 한 것처럼"
  }
 ],
 synd: [
  { u: "구문 1", en: "The rule holds in so far as the market stays open.", k: "그 규칙은 시장이 열려 있는 한에서 성립한다." },
  { u: "구문 2", en: "They stocked the shelves as if there were a shortage.", k: "그들은 마치 품귀가 있기라도 한 것처럼 선반을 채웠다." },
  { u: "구문 1 + 2", en: "The ad works in so far as it makes us act as if there were a need.", k: "그 광고는 마치 필요가 있는 것처럼 행동하게 만드는 한에서 통한다." }
 ],
 why: [
  ["생수 제조 공정은 글에 나오지 않는다"],
  ["정답"],
  ["글은 마케팅이 강하게 작동한다고 말한다 — 정반대다"],
  ["절약 방법은 글의 관심사가 아니다"],
  ["신발 디자인의 역사는 글의 초점이 아니다"]
 ],
 src: [["①"], ["②와 어긋남 — 국가의 관점에서는 성장을 밀어 올려 필요하다고 본다"], ["④"], ["⑥"], ["⑧"]],
 kb: {
  title: "만들어진 필요",
  lead: "필요와 욕구 사이",
  items: [
   ["필요와 욕구", "경제학과 사회학에서는 need(필요)와 want(욕구)를 나눈다. 본문은 마케팅이 욕구를 필요처럼 보이게 만든다고 본다."],
   ["‘고독한 군중’", "본문이 인용한 ‘the lonely crowd’는 사회학자 데이비드 리스먼(David Riesman)이 1950년에 낸 책의 제목에서 온 표현이다."],
   ["생수와 공유재", "수돗물이 안전한 곳에서도 생수 광고는 병에 든 물을 필요처럼 만든다. 그사이 공동의 자산인 상수도에 대한 신뢰와 투자는 줄어든다."]
  ],
  ask: "여러분이 ‘꼭 필요하다’고 느끼는 물건 가운데 십 년 전에는 없던 것은 무엇인가?"
 },
 wtype: ["무관", "정답", "반대", "무관", "지엽"],
 stype: ["일치", "반대", "일치", "일치", "일치"]
}

 ]
};
