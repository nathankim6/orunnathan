/* Unit 11 · Environment, Resources & Ecology — 원문 Theme 51–55 */
const R = require("../src/orig/all.json");
const T = n => R[n - 1];

module.exports = {
 no: 11,
 field: "Environment, Resources & Ecology",
 ko: "환경·자원·생태",
 tagline: "함께 쓰는 것 — 권리·유역·대기·고통·공감",
 next: { en: "Current Affairs", ko: "지금 벌어지고 있는 일들을 읽습니다", words: "240–282 words" },
 lessons: [

/* ───────────────────────────── 51 ───────────────────────────── */
{
 no: "51", key: "commons", accent: "#2F7268", tint: "#E3F0EE", deep: "#1C4E46",
 en: "Property Rights to Natural Resources",
 ko: "권리가 생겨나는 자리",
 goal: "자원이 귀해질 때 재산권이 어떻게 바뀌기 시작하는지 수요·공급의 틀로 설명할 수 있다.",
 fig: "Figure 1  권리가 정해진 자원과 정해지지 않은 자원.",
 tip: "먼저 생각해 보자. 아무나 쓸 수 있던 것이 귀해지면 무슨 일이 생길까?",
 sent: T(51).sent, kor: T(51).kor,
 bank: [
  ["determinant", "①", "결정 요인"],
  ["scarce", "②", "희소한"],
  ["demographics", "③", "인구 구성"],
  ["welfare", "⑤", "후생"],
  ["exogenous", "⑦", "외생적인"],
  ["externality", "⑩", "외부 효과"]
 ],
 defs: [
  ["determinant", "a factor that settles how something turns out"],
  ["scarce", "too little to meet what people want"],
  ["demographics", "the make-up of a population by age and sort"],
  ["welfare", "how well off a person or group is"],
  ["exogenous", "coming from outside the system itself"],
  ["externality", "a cost or gain that falls on an outsider"]
 ],
 defOrder: [4, 0, 5, 2, 1, 3],
 flow: [
  ["When it does not matter", "Rights are irrelevant while the resource is plentiful", null],
  ["The turn", "Rights start to matter once the resource becomes (  ①  )", "scarce"],
  ["The frame", "Think of rights in terms of supply and (  ②  )", "demand"],
  ["The village", "An outside change suddenly (  ③  ) demand for the resource", "raises"],
  ["The demand", "Users now want a system that avoids these (  ④  )", "losses"]
 ],
 flowBogi: "scarce · demand · raises · losses · plentiful · gains",
 para: [
  ["① Property rights are key determinants", "Rights largely ______ how a resource is used.", "decide"],
  ["② the rights to use it are generally irrelevant", "When there is plenty, rights hardly ______.", "matter"],
  ["⑤ their welfare would be enhanced", "They would be better ______ under new rules.", "off"],
  ["⑧ would now adversely affect use by others", "One person's use now ______ everyone else.", "hurts"],
  ["⑨ an incentive to “demand” a change", "They now have a ______ to ask for change.", "reason"]
 ],
 paraBogi: "decide · matter · off · hurts · reason · hide · worse · rule",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "A Guide to Village Farming",
    "When a Resource Starts to Need an Owner",
    "Why Property Rights Never Change",
    "How Fishing Boats Are Built",
    "The History of Trade Agreements"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "자원이 수요에 견주어 귀하지 않으면 사용 권리는 대개 문제가 되지 않는다.",
    "필자는 권리 제도를 수요와 공급의 틀로 보는 것이 쓸모없다고 말한다.",
    "선호·기술·인구 구성의 변화는 자원을 경제적으로 귀하게 만들 수 있다.",
    "개방 접근이 이어지면 각자의 사용 증가가 다른 사람의 사용에 나쁜 영향을 준다.",
    "외부 효과나 공공재 같은 시장 실패도 권리 변화로 효율을 높일 여지를 준다."
   ], ans: 2
  },
  {
   t: "write", q: "재산권에 대한 ‘수요’가 생기는 때를 우리말 한 문장으로 써 보세요.",
   ans: "지금의 재산권 제도가 바뀌면 자기 후생이 나아지리라는 것을 사람들이 깨달을 때다."
  }
 ],
 fl: {
  model: {
   n: "⑤",
   toks: [
    ["The demand for property rights", "s"], ["arises", "v"], ["when", "c"],
    ["groups or individuals", "s2"], ["realize", "v2"], ["that", "c"],
    ["their welfare", "s2"], ["would be enhanced", "v2"], ["if", "c"],
    ["the current property rights system", "s2"], ["were changed.", "v2"]
   ],
   ko: "재산권에 대한 수요는, 지금의 재산권 제도가 바뀌면 자기 후생이 나아지리라는 것을 집단이나 개인이 깨달을 때 생긴다."
  },
  drill: [
   {
    n: "②",
    en: "When a natural resource is not scarce relative to the existing demand, the rights to use it are generally irrelevant.",
    ans: "[When] S′ a natural resource · △V′ is not · C scarce relative to the existing demand · S the rights to use it · △V are · C generally irrelevant",
    ko: "천연자원이 지금의 수요에 견주어 귀하지 않을 때, 그것을 쓸 권리는 대개 문제가 되지 않는다."
   },
   {
    n: "⑧",
    en: "If open access persists, each individual's increased use of the resource would now adversely affect use by others, causing welfare losses.",
    ans: "[If] S′ open access · △V′ persists · S each individual's increased use of the resource · △V would now adversely affect · O use by others · M causing welfare losses",
    ko: "개방 접근이 이어지면, 각자가 자원을 더 많이 쓰는 일이 이제 다른 사람의 사용에 나쁜 영향을 주어 후생 손실을 낳게 된다."
   },
   {
    n: "⑩",
    en: "This observation applies more generally: most market failures, such as externalities, public goods, and asymmetric information, afford the possibility to increase efficiency through changes in property rights.",
    ans: "S This observation · △V applies · M more generally · S most market failures, such as externalities, public goods, and asymmetric information · △V afford · O the possibility to increase efficiency through changes in property rights",
    ko: "이 관찰은 더 널리 적용된다. 외부 효과·공공재·정보 비대칭 같은 대부분의 시장 실패는 재산권을 바꾸어 효율을 높일 가능성을 준다."
   }
  ]
 },
 syn: [
  {
   n: "③",
   name: "삽입된 예시 such as ~",
   q: "…changes occur that render the resource economically scarce, however, «such as shifts in preferences, technology, or demographics», rights…",
   d: "<b>such as</b> 뒤의 예시는 앞말을 설명하려고 끼어든 부분이다. 괄호로 묶어 건너뛰고 뼈대를 먼저 잡는다.",
   k: "선호·기술·인구 구성의 변화 같은"
  },
  {
   n: "⑤",
   name: "가정법 과거 (if + 과거형, would + 동사원형)",
   q: "…their welfare «would be enhanced if the current property rights system were changed».",
   d: "지금 사실과 다른 일을 그려 볼 때 쓴다. if 절에 과거형, 주절에 <b>would</b>가 온다.",
   k: "제도가 바뀐다면 후생이 나아질 것이다"
  }
 ],
 synd: [
  { u: "구문 1", en: "Many goods, such as air and water, once had no owner.", k: "공기와 물 같은 많은 것들에는 한때 주인이 없었다." },
  { u: "구문 2", en: "If the rule were clearer, fewer boats would come.", k: "규칙이 더 분명하다면 배가 덜 올 것이다." },
  { u: "구문 1 + 2", en: "If the catch, such as cod or tuna, were limited, stocks would recover.", k: "대구나 참치 같은 어획이 제한된다면 자원량은 회복될 것이다." }
 ],
 why: [
  ["마을 농사법은 글에 나오지 않는다"],
  ["정답"],
  ["글은 권리 제도가 바뀌어 간다고 말한다 — 정반대다"],
  ["어선 제작은 글의 관심사가 아니다"],
  ["무역 협정의 역사는 글의 초점이 아니다"]
 ],
 src: [["②"], ["④와 어긋남 — 수요·공급의 틀로 보는 것이 쓸모 있다고 말한다"], ["③"], ["⑧"], ["⑩"]],
 kb: {
  title: "공유 자원과 권리",
  lead: "누구의 것도 아닌 것",
  items: [
   ["공유지의 비극", "1968년 개릿 하딘(Garrett Hardin)이 쓴 표현이다. 누구나 쓸 수 있는 목초지에서 각자가 한 마리씩 더 놓아 결국 모두가 손해를 본다는 이야기다."],
   ["오스트롬의 반론", "엘리너 오스트롬(Elinor Ostrom)은 실제 어촌·관개 공동체가 스스로 규칙을 만들어 자원을 지켜 온 사례를 모았다. 2009년 노벨 경제학상을 받았다."],
   ["시장 실패", "외부 효과·공공재·정보 비대칭은 시장이 스스로 효율에 이르지 못하는 대표적인 경우다. 본문은 이때 권리를 손보는 길이 있다고 말한다."]
  ],
  ask: "여러분 주변에서 ‘아무도 주인이 아닌 것’이 상한 사례를 떠올려 보자."
 },
 wtype: ["무관", "정답", "반대", "무관", "지엽"],
 stype: ["일치", "반대", "일치", "일치", "일치"]
},

/* ───────────────────────────── 52 ───────────────────────────── */
{
 no: "52", key: "lake", accent: "#2E6E8E", tint: "#E4EFF4", deep: "#194C64",
 en: "Urban Lake Restoration",
 ko: "파이프 끝에 놓인 호수",
 goal: "도시 호수가 나빠지는 과정과 그 관리가 실패해 온 이유를 설명할 수 있다.",
 fig: "Figure 1  도시가 흘려보낸 것을 마지막에 받는 곳.",
 tip: "먼저 생각해 보자. 도시의 물은 마지막에 어디로 갈까?",
 sent: T(52).sent, kor: T(52).kor,
 bank: [
  ["degraded", "①", "훼손된"],
  ["run-off", "②", "유출수"],
  ["decomposition", "④", "분해"],
  ["flammable", "⑤", "인화성의"],
  ["interconnectedness", "⑦", "상호 연결성"],
  ["catchment", "⑦", "유역"]
 ],
 defs: [
  ["degraded", "made much worse in quality"],
  ["run-off", "water that flows off land into a stream"],
  ["decomposition", "the breaking down of dead matter"],
  ["flammable", "easily set on fire"],
  ["interconnectedness", "the way parts are tied to one another"],
  ["catchment", "the land whose water drains to one place"]
 ],
 defOrder: [1, 5, 0, 4, 2, 3],
 flow: [
  ["The place", "Urban lakes sit at the end of the pipe", null],
  ["Bengaluru", "Bellandur Lake caught (  ①  ) and produced foam", "fire"],
  ["The chain", "Decomposition took the (  ②  ) out of the water", "oxygen"],
  ["The gas", "It also produced huge amounts of (  ③  )", "methane"],
  ["The failure", "Treatment lags behind fast-growing (  ④  )", "populations"]
 ],
 flowBogi: "fire · oxygen · methane · populations · foam · rainfall",
 para: [
  ["① urban lakes are often poorly managed", "City lakes are ______ looked after.", "badly"],
  ["② receiving large volumes of wastewater", "They take in what the city ______ away.", "sends"],
  ["④ led to a loss of oxygen from the water", "The water ______ its oxygen.", "lost"],
  ["⑥ current approaches to managing water quality", "Today's way of managing water has ______.", "failed"],
  ["⑦ lagging behind rapidly growing populations", "Treatment cannot ______ up with the city.", "keep"]
 ],
 paraBogi: "badly · sends · lost · failed · keep · well · holds · gained",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How to Swim Safely in a City Lake",
    "The Lake at the End of the Pipe",
    "Why Urban Lakes Clean Themselves",
    "A Guide to Indian Monsoons",
    "How Methane Is Used as Fuel"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "도시 호수는 도시에서 나온 하수와 빗물 유출수를 대량으로 받는 자리에 있다.",
    "벨란두르 호수는 상류에 사는 수백만 명의 처리되지 않은 하수를 받았다.",
    "유기물의 분해로 물속 산소가 줄고 어류와 대부분의 동물이 줄었다.",
    "인도의 호수 수질 평가 계획은 관리자에게 쓸모 있는 기간 안에 호수의 여러 이용 가치를 평가하도록 설계되어 있다.",
    "도시 호수 관리는 여러 기관에 나뉘어 있다."
   ], ans: 4
  },
  {
   t: "write", q: "벨란두르 호수 수면에서 불이 난 원인으로 필자가 꼽는 것을 우리말 한 문장으로 써 보세요.",
   ans: "분해가 심하고 산소가 없어 대량으로 만들어진 인화성 기체 메탄이다."
  }
 ],
 fl: {
  model: {
   n: "②",
   toks: [
    ["This", "s"], ["is", "v"], ["because", "c"], ["they", "s2"], ["are,", "v2"],
    ["by their very nature,", "m"], ["at the “end-of-the-pipe,”", null],
    ["often receiving large volumes of wastewater and stormwater run-off produced in cities.", "m"]
   ],
   ko: "그것은 도시 호수가 본디 ‘파이프의 끝’에 있어서, 도시에서 나온 하수와 빗물 유출수를 대량으로 받는 일이 잦기 때문이다."
  },
  drill: [
   {
    n: "③",
    en: "One particularly severe example is Bellandur Lake in Bengaluru, which often caught fire and produced foam in the past because it received large amounts of untreated wastewater from millions of people living upstream.",
    ans: "S One particularly severe example · △V is · C Bellandur Lake in Bengaluru · [which] △V′ often caught · O fire · [and] △V′ produced · O foam · M in the past · [because] S′ it · △V′ received · O large amounts of untreated wastewater from millions of people living upstream",
    ko: "특히 심한 사례는 벵갈루루의 벨란두르 호수인데, 상류에 사는 수백만 명의 처리되지 않은 하수를 대량으로 받았기 때문에 과거에 자주 불이 붙고 거품을 만들어 냈다."
   },
   {
    n: "⑤",
    en: "The high levels of decomposition and absence of oxygen also resulted in a huge production of the greenhouse gas methane, a flammable gas that was the likely cause of the fires on the lake surface.",
    ans: "S The high levels of decomposition and absence of oxygen · △V also resulted · M in a huge production of the greenhouse gas methane · M a flammable gas · [that] △V′ was · C the likely cause of the fires on the lake surface",
    ko: "높은 분해 수준과 산소의 부재는 온실가스 메탄을 대량으로 만들어 냈는데, 이는 호수 표면의 화재를 일으켰을 법한 인화성 기체다."
   },
   {
    n: "⑨",
    en: "The management of city lakes is divided among different groups, including water supply and sewage services, city departments that handle rainwater, and pollution regulators who mostly focus on industrial waste rather than household wastewater.",
    ans: "S The management of city lakes · △V is divided · M among different groups, including water supply and sewage services, city departments that handle rainwater, and pollution regulators · [who] △V′ mostly focus · M on industrial waste rather than household wastewater",
    ko: "도시 호수 관리는 상하수도 서비스, 빗물을 다루는 시 부서, 그리고 생활 하수보다 산업 폐기물에 주로 집중하는 오염 규제 기관 등 여러 집단에 나뉘어 있다."
   }
  ]
 },
 syn: [
  {
   n: "⑦",
   name: "Not only + 도치 (~일 뿐 아니라)",
   q: "«Not only have city authorities failed to recognise the interconnectedness», but also the centralised … infrastructure is often highly inadequate…",
   d: "<b>Not only</b>가 문장 앞에 오면 뒤가 의문문처럼 뒤집힌다. ‘~하지 못했을 뿐 아니라’로 읽는다.",
   k: "~하지 못했을 뿐 아니라"
  },
  {
   n: "⑨",
   name: "A rather than B (B가 아니라 A)",
   q: "…pollution regulators who mostly focus on «industrial waste rather than household wastewater».",
   d: "<b>rather than</b> 앞이 실제로 하는 쪽이다. 두 대상을 나란히 놓고 견준다.",
   k: "생활 하수가 아니라 산업 폐기물에"
  }
 ],
 synd: [
  { u: "구문 1", en: "Not only did the plan fail, but the cost also rose.", k: "그 계획이 실패했을 뿐 아니라 비용도 올랐다." },
  { u: "구문 2", en: "They watched the inflow rather than the lake itself.", k: "그들은 호수 자체가 아니라 흘러드는 물을 지켜보았다." },
  { u: "구문 1 + 2", en: "Not only did they test the water, but they also traced the streets rather than the shore.", k: "그들은 물을 검사했을 뿐 아니라, 호숫가가 아니라 거리를 따라 추적하기도 했다." }
 ],
 why: [
  ["호수에서 안전하게 헤엄치는 법은 글에 나오지 않는다"],
  ["정답"],
  ["글은 도시 호수가 심하게 훼손된다고 말한다 — 정반대다"],
  ["몬순은 배경으로 한 번 나올 뿐이다"],
  ["메탄을 연료로 쓰는 법은 글에서 다루지 않는다"]
 ],
 src: [["②"], ["③"], ["④"], ["⑧과 어긋남 — 그렇게 설계되어 있지 않다"], ["⑨"]],
 kb: {
  title: "도시 호수",
  lead: "파이프의 끝에서 벌어지는 일",
  items: [
   ["벨란두르 호수", "인도 벵갈루루의 벨란두르 호수는 거품과 화재로 널리 알려졌다. 처리되지 않은 생활 하수가 대량으로 흘러들면서 생긴 일이다."],
   ["부영양화", "영양분이 지나치게 들어오면 미생물이 늘고 분해가 활발해져 물속 산소가 바닥난다. 이를 부영양화(eutrophication)라 한다."],
   ["유역이라는 단위", "호수를 고치려면 호수만 볼 수 없다. 물이 모여드는 땅 전체, 곧 유역(catchment)을 하나의 단위로 다루어야 한다는 것이 본문의 지적이다."]
  ],
  ask: "여러분이 사는 곳의 빗물은 어디로 흘러가 어디에 모일까?"
 },
 wtype: ["무관", "정답", "반대", "지엽", "무관"],
 stype: ["일치", "일치", "일치", "반대", "일치"]
},

/* ───────────────────────────── 53 ───────────────────────────── */
{
 no: "53", key: "mars", accent: "#A65A3C", tint: "#F7EAE4", deep: "#77361D",
 en: "Modifying Mars' Atmosphere",
 ko: "화성의 공기를 두껍게",
 goal: "화성의 대기압을 높이려는 방안들과 그 한계를 수치와 함께 설명할 수 있다.",
 fig: "Figure 1  다 모아도 못 미치는 기압.",
 tip: "먼저 생각해 보자. 공기를 두껍게 만들면 사람이 살 수 있을까?",
 sent: T(53).sent, kor: T(53).kor,
 bank: [
  ["concentration", "②", "농도"],
  ["detonate", "④", "폭발시키다"],
  ["radiation", "⑤", "복사"],
  ["liquefy", "⑥", "액화하다"],
  ["vaporise", "⑦", "기화시키다"],
  ["intermingle", "⑫", "뒤섞이다"]
 ],
 defs: [
  ["concentration", "how much of a substance sits in a space"],
  ["detonate", "to set off an explosion"],
  ["radiation", "energy that travels out as rays or waves"],
  ["liquefy", "to turn a solid or gas into liquid"],
  ["vaporise", "to turn something into gas or vapour"],
  ["intermingle", "to be mixed in among other things"]
 ],
 defOrder: [2, 0, 4, 1, 5, 3],
 flow: [
  ["The problem", "Mars has too little pressure for human activity", null],
  ["The idea", "Warm the (  ①  ) carbon dioxide so it returns to the air", "frozen"],
  ["One method", "Set off explosives at the (  ②  ) to melt the ice fast", "poles"],
  ["The check", "Polar ice would only (  ③  ) the pressure, to 1.2%", "double"],
  ["Other sources", "Soil and clathrates would add under (  ④  ) percent more", "5"]
 ],
 flowBogi: "frozen · poles · double · 5 · liquid · 40",
 para: [
  ["① does not produce enough atmospheric pressure", "The air is far too ______ for people.", "thin"],
  ["③ warm up the carbon dioxide that exists", "Heat would send the gas ______ into the air.", "back"],
  ["⑤ darkening the zone around the detonation", "Dust would make the ground ______.", "darker"],
  ["⑦ the amount of carbon dioxide at the poles", "The poles hold too ______ of the gas.", "little"],
  ["⑪ heating the soil could provide up to 4%", "Warming the dust would ______ a little more.", "give"]
 ],
 paraBogi: "thin · back · darker · little · give · thick · out · much",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Explosives Are Made",
    "Not Enough Gas to Make an Air",
    "Why Mars Already Has Thick Air",
    "A History of Mars Probes",
    "How to Grow Plants in Sand"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "이산화탄소는 화성 대기의 주성분이다.",
    "극지의 폭발은 빠른 융해와 함께 먼지구름을 만들어 낼 것이다.",
    "극관을 모두 기화시키면 지구와 비슷한 기압에 이를 수 있다.",
    "화성 토양의 먼지 입자에는 이산화탄소가 들어 있다.",
    "클라스레이트 화합물이 녹으면 기체가 대기로 방출될 것이다."
   ], ans: 3
  },
  {
   t: "write", q: "극지에 폭약을 터뜨리자는 방안이 노리는 두 가지 효과를 우리말 한 문장으로 써 보세요.",
   ans: "빠르게 얼음을 녹이고, 먼지구름으로 주변을 어둡게 해 태양 복사를 더 잘 흡수하게 하는 것이다."
  }
 ],
 fl: {
  model: {
   n: "③",
   toks: [
    ["One common idea", "s"], ["is", "v"], ["to warm up the carbon dioxide", null],
    ["that", "c"], ["exists", "v2"],
    ["in a frozen state both at the poles and beneath the surface", "m"],
    ["so that", "c"], ["it", "s2"], ["can return", "v2"], ["to the atmosphere.", "m"]
   ],
   ko: "흔한 생각 하나는 극지와 지표 아래에 언 상태로 있는 이산화탄소를 데워 대기로 되돌아갈 수 있게 하는 것이다."
  },
  drill: [
   {
    n: "⑤",
    en: "This would cause a quick melt and would also generate a cloud of dust, darkening the zone around the detonation, thus making solar radiation absorption more efficient.",
    ans: "S This · △V would cause · O a quick melt · [and] △V would also generate · O a cloud of dust · M darkening the zone around the detonation · M thus making solar radiation absorption more efficient",
    ko: "이는 빠른 융해를 일으키고 먼지구름도 만들어 폭발 주변을 어둡게 함으로써 태양 복사 흡수를 더 효율적으로 만들 것이다."
   },
   {
    n: "⑧",
    en: "If we want to have liquid water at a suitable temperature in a stable way on Mars, an atmospheric pressure similar to the one we have on Earth is required.",
    ans: "[If] S′ we · △V′ want · O to have liquid water at a suitable temperature in a stable way on Mars · S an atmospheric pressure similar to the one we have on Earth · △V is required",
    ko: "화성에서 알맞은 온도의 액체 물을 안정적으로 두고 싶다면, 지구에서 우리가 가진 것과 비슷한 대기압이 필요하다."
   },
   {
    n: "⑫",
    en: "Carbon dioxide molecules which are intermingled with ice molecules called “clathrate compounds” have also been observed, which upon melting would release the gas to the atmosphere.",
    ans: "S Carbon dioxide molecules · [which] △V′ are intermingled · M with ice molecules called “clathrate compounds” · △V have also been observed · [which] M upon melting · △V′ would release · O the gas to the atmosphere",
    ko: "‘클라스레이트 화합물’이라 불리는 얼음 분자와 뒤섞인 이산화탄소 분자도 관측되었는데, 그것은 녹으면 기체를 대기로 내놓을 것이다."
   }
  ]
 },
 syn: [
  {
   n: "③",
   name: "so that + 주어 + can (~할 수 있도록)",
   q: "…warm up the carbon dioxide … «so that it can return to the atmosphere».",
   d: "<b>so that</b>은 목적을 나타낸다. ‘~할 수 있도록’으로 읽고, 앞의 행동과 이어 본다.",
   k: "대기로 돌아갈 수 있도록"
  },
  {
   n: "⑤",
   name: "결과를 잇는 분사구문 두 개",
   q: "…a cloud of dust, «darkening the zone around the detonation, thus making solar radiation absorption more efficient».",
   d: "분사구문이 잇달아 붙어 결과가 사슬처럼 이어진다. ‘그래서 ~하고, 그래서 ~한다’로 읽는다.",
   k: "주변을 어둡게 해서 흡수를 더 효율적으로 만든다"
  }
 ],
 synd: [
  { u: "구문 1", en: "They warmed the soil so that the gas could escape.", k: "그들은 기체가 빠져나올 수 있도록 토양을 데웠다." },
  { u: "구문 2", en: "The blast raised dust, darkening the ice and speeding the melt.", k: "그 폭발은 먼지를 일으켜 얼음을 어둡게 하고 융해를 빠르게 했다." },
  { u: "구문 1 + 2", en: "They darkened the cap so that it could absorb more light, warming the ground.", k: "그들은 극관이 빛을 더 흡수할 수 있도록 어둡게 만들어 지면을 데웠다." }
 ],
 why: [
  ["폭약 제조법은 글에 나오지 않는다"],
  ["정답"],
  ["글은 화성의 기압이 너무 낮다고 말한다 — 정반대다"],
  ["탐사선 자체의 역사는 글의 초점이 아니다"],
  ["모래에서 식물을 기르는 법은 글에서 다루지 않는다"]
 ],
 src: [["①"], ["⑤"], ["⑦과 어긋남 — 지구 값의 1.2%에 이를 뿐이다"], ["⑩"], ["⑫"]],
 kb: {
  title: "화성의 공기",
  lead: "두껍게 만들 수 있을까",
  items: [
   ["지금의 기압", "화성의 평균 대기압은 지구의 1퍼센트에도 못 미친다. 그래서 액체 물이 표면에 오래 머물지 못하고 곧 기화한다."],
   ["극관", "화성의 극관에는 물 얼음과 함께 언 이산화탄소(드라이아이스)가 쌓여 있다. 계절에 따라 그 크기가 눈에 띄게 달라진다."],
   ["클라스레이트", "기체 분자가 얼음 격자 안에 갇힌 구조를 클라스레이트라 한다. 지구에서는 해저의 메탄 하이드레이트가 잘 알려진 예다."]
  ],
  ask: "공기를 두껍게 만드는 일과 숨 쉴 수 있게 만드는 일은 어떻게 다를까?"
 },
 wtype: ["무관", "정답", "반대", "지엽", "무관"],
 stype: ["일치", "일치", "반대", "일치", "일치"]
},

/* ───────────────────────────── 54 ───────────────────────────── */
{
 no: "54", key: "painres", accent: "#7A4A6B", tint: "#F4E9F1", deep: "#542F49",
 en: "The Ethical Dilemmas of Pain Research in Animals",
 ko: "아프게 해야 알 수 있는 것",
 goal: "통증 연구가 안고 있는 윤리적 딜레마와, 물고기 실험이 보여 준 것을 설명할 수 있다.",
 fig: "Figure 1  쓸모와 책임이 같은 사실에서 나온다.",
 tip: "먼저 생각해 보자. 동물이 아픔을 느끼는지 우리는 어떻게 알 수 있을까?",
 sent: T(54).sent, kor: T(54).kor,
 bank: [
  ["welfare", "②", "복지"],
  ["statistically", "③", "통계적으로"],
  ["agnostic", "⑥", "판단을 유보하는"],
  ["exemplify", "⑦", "전형적으로 보여 주다"],
  ["venom", "⑧", "독"],
  ["nociception", "⑭", "통각 수용"]
 ],
 defs: [
  ["welfare", "how well an animal or person is doing"],
  ["statistically", "in terms of what the numbers can prove"],
  ["agnostic", "holding no firm view either way"],
  ["exemplify", "to be a clear example of something"],
  ["venom", "poison that an animal injects by a sting"],
  ["nociception", "sensing harm without feeling it as pain"]
 ],
 defOrder: [5, 2, 0, 4, 1, 3],
 flow: [
  ["The bind", "Pain researchers must harm the animals they hope to help", null],
  ["The count", "Use as few animals as possible, yet enough to be (  ①  ) sound", "statistically"],
  ["The debate", "Few people are (  ②  ) about whether animals feel pain", "agnostic"],
  ["The trout", "Injected fish breathed heavily and stopped (  ③  )", "eating"],
  ["The reading", "The behaviour faded after a shot of (  ④  )", "morphine"]
 ],
 flowBogi: "statistically · agnostic · eating · morphine · swimming · saline",
 para: [
  ["② have to harm the creatures they work with", "They must hurt the animals they hope to ______.", "help"],
  ["③ use as few animals as possible", "They keep the number of animals ______.", "low"],
  ["⑨ these unfortunate individuals began breathing", "The injected fish ______ hard for a while.", "breathed"],
  ["⑬ this went away when they got a shot of morphine", "Morphine made the change ______.", "stop"],
  ["⑮ They saw animals in pain.", "They read it as real ______.", "pain"]
 ],
 paraBogi: "help · low · breathed · stop · pain · harm · high · calm",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How to Keep Trout in a Tank",
    "Harming the Animals You Hope to Help",
    "Why Fish Cannot Feel Anything",
    "A Guide to Making Vinegar",
    "The History of Morphine"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "시각이나 청각을 연구하는 과학자들은 동물에게 영상과 소리를 들려줄 수 있다.",
    "통증 연구자들은 되도록 적은 수의 동물을 쓰려 하지만 통계적으로 타당할 만큼은 써야 한다.",
    "Robyn Crook 은 판단을 유보하는 중간 지대가 넓지 않다고 말한다.",
    "식염수를 주입한 물고기와 달리, 벌 독을 주입한 물고기는 거칠게 호흡하기 시작했다.",
    "주입 뒤에 나타난 행동은 모르핀을 맞아도 그대로였다."
   ], ans: 5
  },
  {
   t: "write", q: "Sneddon 연구진이 관찰한 행동을 단순한 통각 수용으로 볼 수 없다고 본 까닭을 우리말 한 문장으로 써 보세요.",
   ans: "그 행동이 주입한 지 한참 뒤까지 이어졌기 때문이다."
  }
 ],
 fl: {
  model: {
   n: "②",
   toks: [
    ["But", "c"], ["those", "s"], ["who", "c"], ["study", "v2"], ["pain", null],
    ["have to harm", "v"], ["the creatures they work with", null],
    ["in the pursuit of knowledge", "m"], ["that", "c"], ["might improve", "v2"],
    ["the welfare of those same creatures.", null]
   ],
   ko: "그러나 통증을 연구하는 사람들은 바로 그 동물들의 복지를 나아지게 할 지식을 얻으려고 함께 일하는 그 동물들을 해쳐야 한다."
  },
  drill: [
   {
    n: "⑧",
    en: "In the early 2000s, Lynne Sneddon, Mike Gentle, and Victoria Braithwaite injected trout in the lips with bee venom or acetic acid, the substance that gives vinegar its kick.",
    ans: "M In the early 2000s · S Lynne Sneddon, Mike Gentle, and Victoria Braithwaite · △V injected · O trout in the lips · M with bee venom or acetic acid, the substance · [that] △V′ gives · O vinegar its kick",
    ko: "2000년대 초에 Lynne Sneddon, Mike Gentle, Victoria Braithwaite 는 송어의 입술에 벌 독이나, 식초의 톡 쏘는 맛을 내는 물질인 아세트산을 주입했다."
   },
   {
    n: "⑬",
    en: "They no longer kept their distance from unfamiliar objects, as if something was distracting them, but this went away when they got a shot of morphine.",
    ans: "S They · △V no longer kept · O their distance from unfamiliar objects · [as if] S′ something · △V′ was distracting · O them · [but] S this · △V went away · [when] S′ they · △V′ got · O a shot of morphine",
    ko: "그들은 더 이상 낯선 물체와 거리를 두지 않았는데, 마치 무언가가 주의를 흩뜨리는 듯했다. 그러나 모르핀을 한 대 맞자 이런 모습은 사라졌다."
   },
   {
    n: "⑭",
    en: "Sneddon and her colleagues couldn't see how these actions, which persisted well after the injections, could be attributed to mere nociception.",
    ans: "S Sneddon and her colleagues · △V couldn't see · O how these actions could be attributed to mere nociception · [which] △V′ persisted · M well after the injections",
    ko: "Sneddon 과 동료들은 주입한 지 한참 뒤까지 이어진 이런 행동이 어떻게 단순한 통각 수용 탓으로 돌려질 수 있는지 알 수 없었다."
   }
  ]
 },
 syn: [
  {
   n: "⑬",
   name: "as if + 절 (마치 ~인 것처럼)",
   q: "They no longer kept their distance from unfamiliar objects, «as if something was distracting them»…",
   d: "<b>as if</b>는 눈에 보이는 모습을 빗대어 말한다. ‘마치 ~인 것처럼’으로 읽는다.",
   k: "마치 무언가가 주의를 흩뜨리는 것처럼"
  },
  {
   n: "⑭",
   name: "주어와 동사 사이에 끼어든 관계절",
   q: "…how these actions, «which persisted well after the injections», could be attributed…",
   d: "콤마 사이에 낀 <b>which</b>절을 건너뛰면 ‘these actions … could be attributed’가 남는다.",
   k: "주입한 지 한참 뒤까지 이어진 이 행동"
  }
 ],
 synd: [
  { u: "구문 1", en: "The fish rocked from side to side, as if something hurt.", k: "그 물고기는 마치 어딘가 아픈 것처럼 몸을 좌우로 흔들었다." },
  { u: "구문 2", en: "The signs, which lasted for hours, puzzled the team.", k: "몇 시간 이어진 그 징후는 연구진을 당황하게 했다." },
  { u: "구문 1 + 2", en: "The trout, which had eaten well before, now refused food as if in pain.", k: "전에는 잘 먹던 그 송어는 이제 마치 아픈 것처럼 먹이를 거부했다." }
 ],
 why: [
  ["송어 사육법은 글에 나오지 않는다"],
  ["정답"],
  ["글은 물고기가 통증을 느낀다고 본 연구를 전한다 — 정반대다"],
  ["식초 만드는 법은 글의 관심사가 아니다"],
  ["모르핀의 역사는 글의 초점이 아니다"]
 ],
 src: [["①"], ["③"], ["⑥"], ["⑨"], ["⑬과 어긋남 — 모르핀을 맞자 그 행동이 사라졌다"]],
 kb: {
  title: "통증과 통각 수용",
  lead: "느끼는 것과 감지하는 것",
  items: [
   ["두 낱말", "nociception(통각 수용)은 해로운 자극을 감지해 반응하는 일이고, pain(통증)은 그것을 괴로움으로 느끼는 일이다. 둘을 가르는 일이 이 분야의 어려움이다."],
   ["송어 실험", "2003년 Lynne Sneddon 연구진의 무지개송어 실험은 물고기의 통증 논쟁에 불을 붙였다. 진통제로 행동이 되돌아온 점이 핵심 근거로 꼽힌다."],
   ["3R 원칙", "동물 실험에는 대체(Replacement)·감소(Reduction)·개선(Refinement)의 3R 원칙이 있다. 되도록 적은 수를, 되도록 덜 아프게 쓰자는 기준이다."]
  ],
  ask: "동물이 아픔을 느낀다고 판단하려면 어떤 증거가 있어야 할까?"
 },
 wtype: ["무관", "정답", "반대", "무관", "지엽"],
 stype: ["일치", "일치", "일치", "일치", "반대"]
},

/* ───────────────────────────── 55 ───────────────────────────── */
{
 no: "55", key: "empathy", accent: "#6C7A3A", tint: "#EFF2E2", deep: "#48541F",
 en: "Darwin's View on Empathy Found in Animals",
 ko: "다윈이 본 동물의 공감",
 goal: "다윈이 도덕성과 공감을 어떻게 보았는지, 그 견해의 핵심을 설명할 수 있다.",
 fig: "Figure 1  함께 쓰였지만 절반만 기억된 이야기.",
 tip: "먼저 생각해 보자. 동물에게 남을 돕는 마음이 있을까?",
 sent: T(55).sent, kor: T(55).kor,
 bank: [
  ["morality", "①", "도덕성"],
  ["instinct", "①", "본능"],
  ["sympathy", "②", "공감"],
  ["filial", "⑥", "자식의"],
  ["conscience", "⑥", "양심"],
  ["dormant", "⑨", "잠들어 있는"]
 ],
 defs: [
  ["morality", "the sense of what is right and wrong"],
  ["instinct", "a way of acting that is inborn, not learned"],
  ["sympathy", "feeling for what another creature feels"],
  ["filial", "of a child towards its parent"],
  ["conscience", "the inner sense that judges one's acts"],
  ["dormant", "resting and not active for a long time"]
 ],
 defOrder: [3, 1, 5, 0, 4, 2],
 flow: [
  ["The claim", "Human morality grows out of social instincts", null],
  ["The focus", "Darwin gave special attention to (  ①  )", "sympathy"],
  ["The birds", "A blind pelican stayed fat, fed by its (  ②  )", "companions"],
  ["The base", "Sympathy is the foundation stone for other social (  ③  )", "instincts"],
  ["The verdict", "The difference from animals is one of (  ④  ), not kind", "degree"]
 ],
 flowBogi: "sympathy · companions · instincts · degree · kind · silence",
 para: [
  ["① human morality is an extension of social instincts", "Morality grows out of instincts we ______.", "share"],
  ["② evidenced in a large number of animals", "He saw the sign in ______ animals.", "many"],
  ["③ must have been well fed for a long time", "Others must have ______ it for months.", "fed"],
  ["⑤ the foundation stone for other social instincts", "Sympathy is the ______ the rest stands on.", "base"],
  ["⑨ his ideas lay mostly dormant", "The idea ______ still for a century.", "lay"]
 ],
 paraBogi: "share · many · fed · base · lay · hide · few · rose",
 check: [
  {
   t: "title", q: "이 글의 제목으로 가장 알맞은 것은?",
   ch: [
    "How Pelicans Catch Fish",
    "Morality as a Matter of Degree",
    "Why Darwin Rejected Sympathy",
    "A Guide to Bird Watching",
    "The Publishing History of On the Origin of Species"
   ], ans: 2
  },
  {
   t: "fact", q: "이 글의 내용과 일치하지 <b>않는</b> 것은?",
   ch: [
    "다윈은 인간의 도덕성이 사회적 본능의 연장이라고 보았다.",
    "다윈은 인간과 동물의 차이가 정도가 아니라 종류의 차이라고 강조했다.",
    "Stansbury 는 유타의 소금 호수에서 눈먼 늙은 펠리컨을 발견했다.",
    "다윈은 공감을 다른 사회적 본능의 주춧돌이라고 불렀다.",
    "다윈의 생각은 한 세기 넘게 대체로 잠들어 있었다."
   ], ans: 2
  },
  {
   t: "write", q: "다윈이 눈먼 펠리컨 이야기에서 읽어 낸 것을 우리말 한 문장으로 써 보세요.",
   ans: "동료들이 오랫동안 먹여 주었다는 점에서 동물에게도 공감의 능력이 있다는 것이다."
  }
 ],
 fl: {
  model: {
   n: "⑦",
   toks: [
    ["Darwin", "s"], ["emphasized", "v"], ["that", "c"],
    ["the differences between humans and other animals", "s2"],
    ["— in all realms, including the moral sentiments —", "m"],
    ["were", "v2"], ["of degree, not of kind.", null]
   ],
   ko: "다윈은 인간과 다른 동물의 차이가 — 도덕 감정을 포함해 모든 영역에서 — 종류가 아니라 정도의 차이라고 강조했다."
  },
  drill: [
   {
    n: "①",
    en: "Charles Darwin suggested that human morality is an extension of social instincts, and that human morality is continuous with similar social behavior in other animals.",
    ans: "S Charles Darwin · △V suggested · [that] S′ human morality · △V′ is · C an extension of social instincts · [and that] S′ human morality · △V′ is · C continuous with similar social behavior in other animals",
    ko: "찰스 다윈은 인간의 도덕성이 사회적 본능의 연장이며, 다른 동물의 비슷한 사회적 행동과 이어져 있다고 보았다."
   },
   {
    n: "②",
    en: "He paid special attention to the capacity for sympathy, which he believed was evidenced in a large number of animals.",
    ans: "S He · △V paid · O special attention to the capacity for sympathy · [which] S′ he · △V′ believed · △V′ was evidenced · M in a large number of animals",
    ko: "그는 공감의 능력에 특별히 주목했는데, 그가 믿기로 그것은 아주 많은 동물에게서 확인되는 것이었다."
   },
   {
    n: "⑧",
    en: "Darwin, it turns out, was quite right about the importance of the sentiments, about the role of sympathy, and about the evolutionary continuity between humans and other social animals.",
    ans: "S Darwin · M it turns out · △V was · C quite right about the importance of the sentiments, about the role of sympathy, and about the evolutionary continuity between humans and other social animals",
    ko: "알고 보니 다윈은 감정의 중요성에 대해서도, 공감의 역할에 대해서도, 인간과 다른 사회적 동물 사이의 진화적 연속성에 대해서도 상당히 옳았다."
   }
  ]
 },
 syn: [
  {
   n: "②",
   name: "관계절 안에 끼어든 he believed",
   q: "…the capacity for sympathy, «which he believed was evidenced in a large number of animals».",
   d: "<b>he believed</b>는 끼어든 부분이다. 빼고 읽으면 ‘which was evidenced …’가 남는다.",
   k: "그가 믿기로 아주 많은 동물에게서 확인된"
  },
  {
   n: "③",
   name: "must have + p.p. (~했음이 틀림없다)",
   q: "…an old and completely blind pelican, which was very fat, and «must have been well fed for a long time by his companions».",
   d: "<b>must have + p.p.</b>는 지난 일에 대한 강한 추측이다. ‘~했음이 틀림없다’로 읽는다.",
   k: "오랫동안 잘 먹여졌음이 틀림없다"
  }
 ],
 synd: [
  { u: "구문 1", en: "The bird, which he thought was blind, still found food.", k: "그가 눈이 멀었다고 여긴 그 새는 그래도 먹이를 찾아냈다." },
  { u: "구문 2", en: "The crow must have shared its food for weeks.", k: "그 까마귀는 몇 주 동안 먹이를 나누었음이 틀림없다." },
  { u: "구문 1 + 2", en: "The pelican, which he saw daily, must have been fed by others.", k: "그가 날마다 본 그 펠리컨은 다른 새들이 먹여 주었음이 틀림없다." }
 ],
 why: [
  ["펠리컨의 사냥법은 글에 나오지 않는다"],
  ["정답"],
  ["글은 다윈이 공감을 중히 여겼다고 말한다 — 정반대다"],
  ["탐조 안내는 글의 관심사가 아니다"],
  ["『종의 기원』의 출판 이력은 글의 초점이 아니다"]
 ],
 src: [["①"], ["⑦과 어긋남 — 종류가 아니라 정도의 차이라고 했다"], ["③"], ["⑤"], ["⑨"]],
 kb: {
  title: "다윈과 도덕",
  lead: "정도의 차이라는 생각",
  items: [
   ["『인간의 유래』", "다윈은 1871년 『인간의 유래(The Descent of Man)』에서 도덕 감각을 사회적 본능에서 자라난 것으로 설명했다. 본문의 인용도 이 책에서 왔다."],
   ["절반만 읽힌 다윈", "‘적자생존’이라는 말로 경쟁만 기억되었지만, 다윈 자신은 공감과 협력에도 많은 지면을 썼다."],
   ["다시 열린 논의", "1990년대 이후 프란스 드 발(Frans de Waal) 등이 영장류의 위로 행동과 협력을 보고하면서, 잠들어 있던 다윈의 논의가 다시 다루어지기 시작했다."]
  ],
  ask: "동물이 서로를 돕는 모습을 본 적이 있다면 그것을 무엇이라 부르겠는가?"
 },
 wtype: ["무관", "정답", "반대", "무관", "지엽"],
 stype: ["일치", "반대", "일치", "일치", "일치"]
}

 ]
};
