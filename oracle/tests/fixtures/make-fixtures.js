// 시험지·범위 원문 텍스트 픽스처를 만든다 (모의 API 가 같은 텍스트를 읽어 답을 만든다)
const fs = require("fs");
const P = [
  ["Lesson 1 · Reading 1", "The idea that people can change their habits is older than most of us think. Ancient philosophers argued that character is formed by repeated action. Modern psychology has largely confirmed this view with careful experiments. When a behavior is repeated in a stable context, it becomes automatic. This is why small daily routines matter more than grand resolutions. In the end, we are what we repeatedly do."],
  ["Lesson 1 · Reading 2", "When people talk about happiness, they often mean a feeling that comes and goes. Researchers, however, distinguish between momentary pleasure and lasting satisfaction. The first depends on events, while the second depends on meaning. People who report high satisfaction usually describe strong relationships and clear purposes. Money helps only up to a certain point. Beyond that point, additional income brings surprisingly little."],
  ["Lesson 2 · Reading 1", "Scientists have long wondered why some animals migrate thousands of miles every year. Birds such as the Arctic tern travel from pole to pole, guided by the sun and the stars. Recent studies suggest that they also sense the magnetic field of the Earth. This ability allows them to keep a steady course even on cloudy nights. Migration is costly, yet the rewards of rich feeding grounds justify the risk. Nature, it seems, is an excellent accountant."],
  ["Lesson 2 · Reading 2", "For centuries, cities grew around rivers because water carried goods and people cheaply. With the arrival of railways, however, new towns appeared far from any river. Later, highways and airports changed the map again. Each new technology of movement rewrote the rules of where people could live. Today the internet is doing the same thing to work itself. Distance still matters, but less than it ever has before."],
  ["Lesson 3 · Reading 1", "Learning a language as an adult is often described as impossible, but the evidence says otherwise. Adults learn grammar faster than children because they can reason about rules. What children do better is pronunciation, which depends on hearing sounds early. The adult learner, therefore, should focus on listening far more than on memorizing lists. Confidence grows with every conversation that succeeds. Mistakes are not failures but data."],
  ["Lesson 3 · Reading 2", "A famous experiment asked volunteers to count basketball passes while a person in a gorilla suit walked across the court. Half of the viewers never noticed the gorilla at all. This effect, called inattentional blindness, shows how attention filters what we perceive. We see what we expect to see and miss the rest. Good designers and good teachers both understand this limit. They place the important thing exactly where attention already is."],
];
let scope = "고1 영어 교과서 시험범위 원문 (Lesson 1~3)\n\n";
P.forEach(([src, text]) => { scope += src + "\n" + text + "\n\n"; });
const KO = ["다음 글의 주제로 가장 적절한 것은?", "다음 글의 빈칸에 들어갈 말로 가장 적절한 것은? [3점]", "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?", "다음 글의 제목으로 가장 적절한 것은?", "글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?", "다음 글의 내용과 일치하지 않는 것은?"];
function exam(year, sem, term) {
  let t = `2${year}학년도 ${sem}학기 ${term}고사 1학년 영어\n동작고등학교\n\n`;
  const opts = ["① to repeat small actions daily", "② to make grand resolutions", "③ to study ancient philosophy", "④ to avoid stable contexts", "⑤ to confirm modern psychology"];
  P.forEach(([src, text], i) => {
    const q = (i + (term === "기말" ? 3 : 0)) % KO.length;
    let body = text;
    if (q === 1) body = text.replace(/In the end, we are what we repeatedly do\.|Money helps only up to a certain point\.|Nature, it seems, is an excellent accountant\.|Distance still matters, but less than it ever has before\.|Mistakes are not failures but data\.|They place the important thing exactly where attention already is\./, "________________.");
    if (q === 2) body = text.replace(/ (is|are|has|have|was|were) /g, (m, v) => " <u>" + v + "</u> ");
    t += `${i + 1}. ${KO[q]}\n${body}\n${opts.join("\n")}\n\n`;
  });
  t += `서술형 1. 다음 조건에 맞게 영작하시오. [5점]\n<조건> 주어진 단어를 모두 사용할 것 / 10단어 이내로 쓸 것\n(habit, repeated, automatic)\n\n정답 및 해설\n1. ① 2. ③ 3. ② 4. ④ 5. ⑤ 6. ②\n`;
  return t;
}
fs.writeFileSync(__dirname + "/scope.txt", scope);
fs.writeFileSync(__dirname + "/exam1.txt", exam("025", 1, "중간"));
fs.writeFileSync(__dirname + "/exam2.txt", exam("025", 2, "기말"));
fs.writeFileSync(__dirname + "/passages.json", JSON.stringify(P));
console.log("fixtures written", scope.length, exam("025", 1, "중간").length);
// 선생님 프린트(학습지) — 교과서 지문 둘을 다시 싣고, 어법 정리·단어·예상 문제를 붙인다. 예상 문제 발문은 기출과 똑같이 둔다(반영율 검사용).
const stems = [...exam("025", 1, "중간").matchAll(/^\d{1,2}\. (.+)$/gm)].map(m => m[1]).filter(s => /빈칸|어법/.test(s));
fs.writeFileSync(__dirname + "/handout.txt", `2025학년도 1학기 중간고사 대비 프린트 (영어A · 윤은영)

[본문 다시 읽기] ${P[0][0]}
${P[0][1]}

[본문 다시 읽기] ${P[2][0]}
${P[2][1]}

[어법 핵심 정리]
- 수일치: 주어와 동사의 수를 맞춘다. The idea that people can change their habits is older than most of us think.
- 시제: 과거의 일반적 사실은 과거시제, 현재의 습관은 현재시제로 쓴다.
- 관계사: which 와 that 은 선행사가 사물일 때, who 는 사람일 때 쓴다.

[단어 정리]
habit, resolution, philosophy, psychology, repeat, automatic, satisfaction, migrate, magnetic, confirm

[예상 문제]
${stems.map((s, i) => (i + 1) + ". " + s).join("\n")}
`);
