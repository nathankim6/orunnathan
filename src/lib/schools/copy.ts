/**
 * 분석지·설명회 덱의 모든 문구.
 *
 * 웹(AnalysisReport, SchoolPicker, Schools)과 PPT(deck.ts)가 같은 파일을 읽는다.
 * 여기 없는 문장은 화면에 나오지 않는다.
 *
 * 말투 원칙
 *  - 설명회에서 원장이 직접 말하듯 쓴다. '~합니다'가 기본, 해요체는 가끔만.
 *  - 제목에 물음표를 쓰지 않는다. 묻지 말고 그냥 말한다.
 *  - 비유를 쓰지 않는다. 얼굴, 지도, 두껍다 같은 말 대신 숫자와 사실로 쓴다.
 *  - 한 문장에 한 가지만. 대구나 역설로 멋을 부리지 않는다.
 *  - 줄표(—)와 가운뎃점(·)을 제목에 쓰지 않는다.
 *  - 영문 아이브로우는 브랜드 장치. 짧게.
 */

import type { IconName } from "@/assets/art";

export const YEAR = "2027학년도";

export const APP = {
  brand: "ORUN ENGLISH",
  eyebrow: "옳은영어 학교 분석지",
  title: "학교를 고르기 전에 시험지부터 봅니다",
  lede: "학교마다 인원과 시험지를 같이 놓고 정리했습니다. 설명회에서 그대로 쓰는 자료입니다.",
  generatorLink: "문항 생성기로",
  tabs: {
    pick: "학교 고르기",
    report: "분석지",
    calc: "1등급 계산기",
    edit: "학교 기록",
  },
  calc: {
    en: "SEATS, LIVE",
    title: "1등급은 딱 몇 자리인가",
    lede: "인원을 넣으면 1등급이 몇 자리인지 바로 나옵니다. 공통과목과 선택과목은 분모가 다릅니다.",
  },
  empty: {
    text: "고른 학교가 없습니다.",
    cta: "학교 고르러 가기",
  },
  edit: {
    en: "OUR NOTES",
    title: "학교 기록",
    lede: "시험지를 본 사람만 아는 것을 적어 두는 곳입니다. 올해 적어 두면 내년에 그대로 씁니다.",
  },
  stats: {
    fact: (n: number) => `학교 ${n}곳`,
    seen: (n: number) => `시험지를 직접 본 ${n}곳`,
  },
  steps: [
    { icon: "school", title: "학교 고르기", text: "학교를 고르면 인원, 학급, 진학 숫자가 채워집니다." },
    { icon: "paper", title: "분석지 읽기", text: "올해 시험지 분석과 국영수 성취도가 학교별로 붙습니다." },
    { icon: "slides", title: "PPT로 내보내기", text: "설명회 슬라이드로 바로 나옵니다. 글자와 그림 모두 고칠 수 있습니다." },
  ] as { icon: IconName; title: string; text: string }[],
  theme: { toDark: "어둡게 보기", toLight: "밝게 보기" },
};

export const PICKER = {
  en: "PICK YOUR SCHOOLS",
  title: "오늘 볼 학교",
  hint: "고른 학교만 분석지에 들어갑니다.",
  search: "학교 이름으로 찾기",
  filterSourced: "자료 있는 학교만",
  selectAll: "보이는 학교 다 담기",
  clearVisible: "담은 것 다 빼기",
  emptyGroup: "이 범위에 학교가 없습니다. 위에서 범위를 넓혀 주세요.",
  badgeObs: "우리 기록",
  badgeSourced: "2026 분석",
  badgeAchieve: "성취도 3년",
  footer: (n: number) => `고른 학교 ${n}곳`,
  footerDetail: (deep: number, light: number) => `자세히 ${deep}곳, 요약 ${light}곳`,
  cta: "분석지 만들기",
  g1: (n: number) => `1학년 ${n}명`,
};

export const TOOLBAR = {
  back: "학교 다시 고르기",
  count: (n: number) => `${n}곳 분석지`,
  ppt: "PPT로 내보내기",
  pptBusy: "만드는 중",
  pptFailed: "PPT를 만들지 못했습니다. 한 번 더 눌러 주세요.",
  print: "인쇄·PDF",
};

export const COVER = {
  eyebrow: "옳은영어 학교 분석지",
  high: {
    title: ["같은 동작구인데", "시험이 이렇게 다릅니다"],
    lede: (year: string) =>
      `${year} 예비 고1 학부모님께. 올해 1학기 시험지를 학교별로 펴 놓고 정리했습니다.`,
  },
  mid: {
    title: ["중학교 3년이", "고등학교를 정합니다"],
    lede: (year: string) =>
      `${year} 예비 중1 학부모님께. 이 중학교 졸업생이 어느 고등학교로 갔는지, 영어 수업은 어떻게 하는지 봅니다.`,
  },
  footer: "옳은영어 ORUN ENGLISH, 정확한 분석 옳은 방향",
};

export const SECTION = {
  numbers: {
    en: "READ THE NUMBERS",
    ko: "1등급은 분모부터 봅니다",
    lede: "1등급 몇 명이라는 말은 분모를 빼면 뜻이 없습니다. 여기서부터 시작합니다.",
  },
  compare: {
    en: "SIDE BY SIDE",
    ko: "학교별 숫자 한 표",
    lede: "상담에서 제일 많이 묻는 것만 골랐습니다.",
    subHigh: "고등학교",
    subMid: "중학교",
    howTo: "이 표 읽는 법",
    howToText:
      "1등급 자리는 1학년 인원의 상위 10%, 소수점은 버립니다. 중학교는 석차등급이 없어 이 칸이 없습니다. 전출은 1학년 중 다른 학교로 옮긴 비율입니다. 맨 오른쪽 진학 수치는 직전 졸업생 기준이라 지금 1학년과 3년 차이가 납니다.",
    anomaly: "숫자 한 번 더 확인",
    anomalyText:
      "표에 * 가 붙은 학교입니다. 전년과 차이가 커서 학교 입력 오류일 수 있습니다. 발표 자료에 쓰기 전에 한 번 더 확인해 주세요.",
  },
  achieve: {
    en: "GRADES ON PAPER",
    ko: "국영수 성취도 3개년",
    lede: "A는 90점 이상입니다. A 인원과 1등급 자리를 맞대 보면 이 학교 1등급 컷이 90점 위인지 아래인지 나옵니다.",
    ledeMid: "중학교는 등급이 없고 성취도 A~E만 나옵니다. A 비율과 평균으로 시험이 어떤지 봅니다.",
    subHigh: (g: number, y: number) => `고${g}, ${y}학년도 기준`,
    subMid: (g: number, y: number) => `중${g}, ${y}학년도 기준`,
    cols: { school: "학교", n: "수강자", seats: "1등급 자리", a: (s: string) => `${s} A 비율`, avg: "평균(국/영/수)", verdict: "1등급 컷" },
    above: "90점 위",
    below: "90점 아래",
    aCount: (n: number) => `${n}명`,
    legend: "A 인원이 1등급 자리보다 많으면 90점을 넘겨도 1등급이 아닙니다. 막대 위 검은 선이 1등급 자리(5등급제 10%, 9등급제 4%)입니다.",
    dist: "성취도 분포",
    years: "학년도",
    trendUp: (a: number, b: number) => `3년 사이 A 비율이 ${a.toFixed(1)}%에서 ${b.toFixed(1)}%로 올랐습니다. 상위권이 늘었습니다.`,
    trendDown: (a: number, b: number) => `3년 사이 A 비율이 ${a.toFixed(1)}%에서 ${b.toFixed(1)}%로 내려왔습니다. 시험이 어려워졌거나 상위권이 줄었습니다.`,
    trendFlat: (a: number) => `3년 동안 A 비율이 ${a.toFixed(1)}% 안팎입니다.`,
    keySubject: (s: string, a: number) => `국영수 중 ${s} A 비율이 ${a.toFixed(1)}%로 가장 낮습니다. 이 학교는 ${s}가 등급을 가릅니다.`,
    fitTitle: "이런 학생에게 맞습니다",
    cautionTitle: "미리 알아 두실 것",
    empty: {
      title: "성취도 자료가 아직 없습니다",
      text: "이 화면은 사람만 보도록 막혀 있어 프로그램이 대신 받아 오지 못합니다. 학교마다 엑셀 세 개를 받아 '학교 기록' 탭에 놓으면 이 자리가 채워집니다.",
      steps: [
        "'학교 기록' 탭 체크리스트에서 '학교알리미 열기'를 누릅니다.",
        "공시정보에서 '4-나. 교과별 학업성취 사항'을 열고 보안문자를 입력합니다.",
        "'엑셀다운로드'를 누르고, 공시연도를 2025와 2024로 바꿔 두 번 더 받습니다.",
        "받은 파일을 체크리스트 아래 상자에 한 번에 끌어다 놓습니다.",
      ],
    },
    partial: (names: string) => `${names}는 성취도 자료가 아직 없습니다. 엑셀을 불러오면 함께 비교됩니다.`,
  },
  exam2026: {
    en: "THIS YEAR'S PAPER",
    ko: "올해 시험지, 이렇게 나왔다",
    lede: "강사진이 시험지를 직접 보고 학교별로 적었습니다. 중간과 기말을 나눠 실었습니다.",
    subHigh: "고1 기준",
    subMid: "중3 기준, 없으면 중2",
    foot: "학교별 상세는 아래 학교 페이지에 중간, 기말로 나눠 실었습니다.",
    cols: { school: "학교", mid: "중간고사", fin: "기말고사", cut: "1등급 컷", oneLiner: "한 줄로" },
  },
  seats: {
    en: "SEATS",
    ko: "1등급 자리부터 세어 봅니다",
    lede: "5등급제에서 1등급은 상위 10%입니다. 학교가 크면 자리도 늘고 경쟁자도 같이 늡니다.",
    unit: "자리",
    callout: "꼭 알아 두실 것",
    calloutA:
      "이 숫자는 공통과목에서만 맞습니다. 석차등급은 학년 정원이 아니라 그 과목을 고른 사람 수로 매깁니다. 수강자가 30명이면 1등급은 3명, 15명이면 1명입니다.",
    calloutB:
      "상위 10% 안이어야 하므로 소수점은 버립니다. 167명이면 16자리, 170명이면 17자리입니다. 수강자가 10명 미만이면 1등급 자리가 없습니다. 고교학점제에서는 어떤 과목을 고르느냐가 등급을 바꿉니다.",
  },
  paths: {
    en: "WHERE THEY WENT",
    ko: "졸업생이 간 고등학교",
    lede: "중학교 내신은 대입에 들어가지 않습니다. 대신 어느 고등학교로 가느냐가 남습니다.",
    grads: (n: number, year: string) => `졸업생 ${n}명, ${year}년 기준`,
    specialDetail: "특목고 안을 열어 보면",
    callout: "이 숫자 읽는 법",
    calloutA:
      "서울 중학교는 사는 곳 학교군 안에서 추첨입니다. 그래서 이 표는 중학교 순위가 아닙니다. 우리 동네 아이들이 실제로 어디로 갔는지 보는 자료입니다.",
    calloutB:
      "특목고 비율이 높다고 그 중학교가 더 좋은 것은 아닙니다. 다만 외고나 국제고를 생각한다면 중2부터 준비해야 하고, 그 출발은 영어입니다.",
  },
  midEnglish: {
    en: "ENGLISH CLASS",
    ko: "중학교 영어 수업",
    lede: "중학교는 등급이 없고 성취도 A~E만 나옵니다. 그래서 몇 등급인지보다 어떻게 배우는지가 중요합니다.",
    cols: { school: "학교", perClass: "학급당", weekly: "주당 시수", leveled: "수준별 수업", subjectRoom: "교과교실제", after: "방과후 참여" },
    on: "운영",
    off: "미운영",
    callout: "수준별 수업",
    calloutOn: (names: string) =>
      `영어와 수학을 실력에 따라 반을 나눠 가르치는 방식입니다. 고른 학교 중 ${names}가 운영합니다. 상위반에 들어가려면 1학년 첫 시험이 중요합니다. 한 번 갈린 반은 잘 바뀌지 않습니다.`,
    calloutOff: "영어와 수학을 실력에 따라 반을 나눠 가르치는 방식입니다. 고른 학교 중에는 운영하는 곳이 없어 전체가 같은 진도로 배웁니다.",
  },
  results: {
    en: "SCOREBOARD",
    ko: "옳은영어 성적표",
    lede: "2026년 1학기 기말고사 기준입니다. 아래 두 지표는 분모가 달라 따로 실었습니다.",
    enrolledSub: "분모는 옳은영어 재원생 수",
    schoolTopSub: "분모는 그 학교 전체 1등급 인원",
    foot: "옳은영어 재원생 자체 집계",
  },
  school: {
    en: "ZOOM IN",
    ko: "학교 하나씩 들여다보기",
    ledeSeen: (seen: number, total: number) =>
      seen === total
        ? `직접 시험지를 본 ${total}곳입니다. 학교마다 시험 성격이 다릅니다.`
        : `직접 시험지를 본 ${seen}곳을 포함해 ${total}곳입니다. 학교마다 시험 성격이 다릅니다.`,
    ledePlain: (total: number) => `${total}곳을 한 학교씩 정리했습니다.`,
  },
};

export const BLOCK = {
  character: { en: "THE SCHOOL", ko: "한 줄 소개" },
  subjects: { en: "WHAT'S HARD", ko: "과목별 난이도" },
  scope: { en: "ON THE TEST", ko: "시험 범위" },
  scopeMid: { en: "ON THE TEST", ko: "시험 범위 (중3 기준)" },
  cutoff: { en: "CUT LINE", ko: "1등급 커트라인" },
  middleReport: { en: "ON THE REPORT", ko: "성적표에 남는 것" },
  freeSemester: "지필평가 없는 학기",
  features: { en: "HOW THEY TEST", ko: "이 학교 시험 방식" },
  signature: { en: "SIGNATURE", ko: "여기서만 나오는 문제" },
  signatureMake: "바로 뽑기",
  fit: { en: "WHO FITS", ko: "이런 학생에게 맞는 학교" },
  exam2026: { en: "THIS YEAR", ko: "올해 시험지 리포트", tag: "2026 1학기" },
  examGrade: (level: string, g: number) => `${level}${g}`,
  results: { en: "PROOF", ko: "이 학교에서 낸 결과", tag: "2026 실적" },
  insights: { en: "FROM THE STAGE", ko: "강사진이 짚은 포인트" },
  tmi: { en: "TMI", ko: "선배들의 TMI" },
  stats: { g1: "1학년", classes: "1학년 학급", perClass: "학급당", seats: "1등급 자리", coed: "남 : 여", aRatio: "영어 성취도 A", ratio: "지필 : 수행", textbook: "교과서" },
};

export const NUMBERS = {
  cards: "2026년 1학기, 숫자로",
  posterCaptions: [
    "2026 1학기 중간고사 결과. 흑석고1 학교 1등급의 35%, 수도여고1 재원생 30%, 영등포고1 40%, 숭의여고1 33%",
    "2026 1학기 기말고사 전 과목 1등급. 흑석고1 3명, 영등포고1 1명",
    "2026 1학기 기말고사 고등부 성적 우수자. 90점 이상 및 1등급",
  ],
};

export const FOOTER = {
  left: "옳은영어 ORUN ENGLISH",
  tagline: "정확한 분석, 옳은 방향",
};

/* ── 덱 전용 ─────────────────────────────── */

export const DECK = {
  fileName: (stamp: string) => `옳은영어_학교분석_${stamp}.pptx`,
  author: "옳은영어 ORUN ENGLISH",
  cover: {
    eyebrow: "옳은영어 학교 분석지",
    subHigh: (year: string) => `${year} 예비고1을 위한 학교별 내신 리포트`,
    subMid: (year: string) => `${year} 예비중1을 위한 학교별 리포트`,
    footer: "옳은영어 ORUN ENGLISH, 정확한 분석 옳은 방향",
    note: (n: number) =>
      `[템플릿 사용법] 표지. 학교 목록은 담은 순서 그대로 들어갑니다.\n\n[발표 스크립트] 오늘 ${n}개 학교를 봅니다. 숫자 먼저 보고, 그다음에 저희가 시험지에서 본 것을 말씀드리겠습니다.`,
  },
  title: (year: string) => `${year} 옳은영어 학교 분석지`,
  sectionNote: (heading: string, summary: string) => `[템플릿 사용법] 섹션 표지. 큰 숫자는 순번입니다. 그림은 벡터라 색과 크기를 바꿀 수 있습니다.\n\n[발표 스크립트] ${heading}. ${summary}`,
  toc: { en: "TODAY", title: "오늘 볼 학교", count: (n: number) => `${n}곳`, note: "[발표 스크립트] 순서대로 한 학교씩 봅니다." },
  sections: {
    numbers: { title: "1등급은 분모부터 봅니다", summary: "1등급 몇 명이라는 말은 분모를 빼면 뜻이 없습니다." },
    compare: { title: "학교별 숫자 한 표", summary: "인원, 학급, 1등급 자리, 진학까지 한 표에 놓았습니다." },
    exam2026: { title: "올해 시험지, 이렇게 나왔다", summary: "강사진이 시험지를 직접 보고 적었습니다. 중간과 기말을 나눠 실었습니다." },
    seats: { title: "1등급 자리부터 세어 봅니다", summary: "상위 10%가 몇 명인지 세어 봅니다. 분모가 무엇인지가 전부입니다." },
    paths: { title: "졸업생이 간 고등학교", summary: "서울 중학교는 학교군 추첨입니다. 순위가 아니라 흐름으로 보셔야 합니다." },
    school: { title: "학교 하나씩 들여다보기" },
  },
  numbers: {
    en: "READ THE NUMBERS",
    title: "1등급은 분모부터 봅니다",
    sub: "1등급 몇 명이라는 말은 분모를 빼면 뜻이 없습니다",
    note: "[템플릿 사용법] 오프닝. 학원 자랑보다 숫자 읽는 법을 먼저 드립니다.\n\n[발표 스크립트] 100명 중 10명이 1등급인 학원과 다섯 명 중 한 명이 1등급인 학원. 어느 쪽이 잘 가르치는 곳이겠습니까.",
  },
  orunResults: {
    en: "SCOREBOARD, 2026 1학기",
    title: "2026년 1학기, 옳은영어 성적표",
    foot: "학교 1등급 중 비율과 재원생 중 비율은 분모가 다릅니다",
    note: "[발표 스크립트] 전 과목 1등급 4명, 전교 1등 2명입니다.",
  },
  compare: {
    en: "SIDE BY SIDE",
    title: "학교별 숫자 한 표",
    part: (i: number, n: number) => `학교별 숫자 한 표 (${i}/${n})`,
    subHigh: "고1 인원부터 1등급 자리, 진학까지 한 표에",
    subMid: "중학교는 석차등급이 없어 1등급 자리 칸이 없습니다",
    foot: "1등급 자리는 1학년 인원의 상위 10%, 소수점은 버립니다. 진학 수치는 작년 졸업생 기준",
    footNoGrad: (names: string) => `${names}는 아직 졸업생이 없어 진학과 전출 자료가 없습니다`,
    note: "[발표 스크립트] 먼저 숫자만 나란히 놓고 봅니다. 해석은 잠시 뒤에 붙일게요.",
    cols: { school: "학교", g1: "1학년", classes: "반", perClass: "반당", seats: "1등급 자리", moved: (l: string) => `${l}1 전출`, headHigh: "4년제", headMid: "특목·자율고" },
  },
  seats: {
    en: "SEATS",
    title: "1등급 자리부터 세어 봅니다",
    of: (n: number) => `1학년 ${n}명 중`,
    explain:
      "석차등급은 학년 정원이 아니라 그 과목을 고른 사람 수로 매깁니다. 2학년과 3학년 선택과목에서 수강자가 30명이면 1등급은 3명, 15명이면 1명입니다.\n상위 10% 안이어야 하므로 소수점은 버립니다. 167명이면 16자리입니다.",
    note: "[발표 스크립트] 숫자 하나만 먼저 보여 드리겠습니다. 1등급은 상위 10%입니다. 다만 이건 공통과목이고, 2학년부터 고르는 과목에서는 분모가 크게 줄어듭니다.",
  },
  paths: {
    en: "WHERE THEY WENT",
    title: (name: string) => `${name} 졸업생이 간 고등학교`,
    sub: (n: number, year: string) => `졸업생 ${n}명, ${year}년 기준`,
    special: (items: string) => `특목고 안을 열어 보면 ${items}`,
    note: "[발표 스크립트] 이 학교를 나온 선배들이 실제로 어디로 갔는지 봅니다. 서울 중학교는 학교군 안에서 추첨이라 순위로 읽으시면 안 됩니다.",
  },
  achieve: {
    en: "GRADES ON PAPER",
    title: "국영수 성취도 3개년",
    part: (i: number, n: number) => `국영수 성취도 3개년 (${i}/${n})`,
    sub: (g: number, y: number) => `고${g} ${y}학년도 기준`,
    subMid: (g: number, y: number) => `중${g} ${y}학년도 기준`,
    cols: ["학교", "수강자", "1등급 자리", "국어 A", "영어 A", "수학 A", "평균 국/영/수", "1등급 컷, 90점 기준"],
    above: "90점 위",
    below: "90점 아래",
    foot: "A 인원 = 수강자 × A 비율. 1등급 자리 = 수강자 × 10%(5등급제) 또는 4%(9등급제), 소수점 버림. A 인원이 자리보다 많으면 컷이 90점 위",
    note: "[발표 스크립트] 성취도 숫자만으로 1등급 컷이 어디쯤인지 읽어 봅니다. 90점 이상이 몇 명인지와 1등급 자리가 몇 개인지를 맞대 보면 됩니다.",
    schoolTitle: (name: string) => `${name}, 성취도로 읽은 학교`,
    schoolSub: (type: string) => type,
    fit: "이런 학생에게 맞습니다",
    caution: "미리 알아 두실 것",
    seatLine: "1등급 자리",
    noteSchool: (name: string, summary: string) => `[발표 스크립트] ${name}입니다. ${summary}`,
    sectionTitle: "국영수 성취도 3개년",
    sectionSummary: "A 인원과 1등급 자리를 맞대 보면 컷이 어디 있는지 보입니다.",
  },
  exam2026Table: {
    en: "THIS YEAR'S PAPER",
    title: "올해 시험지, 이렇게 나왔다",
    part: (i: number, n: number) => `올해 시험지, 이렇게 나왔다 (${i}/${n})`,
    sub: (level: string, g: number) => `${level}${g} 기준. 강사진이 시험지를 직접 보고 적었습니다`,
    foot: "학교별 상세는 뒤 학교 페이지에 중간, 기말로 나눠 실었습니다",
    note: "[발표 스크립트] 같은 동네인데 시험 성격이 이렇게 다릅니다. 객관식 100%인 학교와 서답형 35점인 학교가 나란히 있습니다.",
  },
  examTrend: {
    en: "THIS YEAR",
    title: (name: string, level: string, g: number) => `${name} ${level}${g}, 올해 시험지`,
    cut: "1등급 컷",
    cut2: (v: string) => `2등급 ${v}`,
    avg: (v: string) => `평균 ${v}`,
    scope: (v: string) => `범위 ${v}`,
    note: (name: string, g: number, lines: string) => `[발표 스크립트] ${name} ${g}학년 2026년 1학기입니다. ${lines}`,
  },
  insights: {
    en: "FROM THE STAGE",
    title: (name: string) => `${name}, 강사진이 짚은 포인트`,
  },
  tmi: {
    en: "TMI",
    title: (name: string) => `${name} 선배들의 TMI`,
    sub: "옳은영어 재원생 선배들이 직접 써 준 답입니다",
    note: "[발표 스크립트] 어른이 알려 주지 못하는 것들입니다. 급식, 계단, 매점.",
  },
  school: {
    en: { the: "THE SCHOOL", hard: "WHAT'S HARD", how: "HOW THEY TEST", fit: "WHO FITS" },
    character: "한 줄 소개",
    subjects: "과목별 난이도",
    scope: "시험 범위",
    cutoff: "1등급 커트라인",
    aRatio: "영어 성취도 A",
    ratio: (v: string) => `지필:수행 ${v}`,
    features: "이 학교 시험 방식",
    signature: "여기서만 나오는 문제",
    fit: (name: string) => `${name}, 이런 학생에게 맞는 학교`,
    noteCharacter: (name: string, c: string) => `[발표 스크립트] ${name}입니다. ${c}`,
    noteHard: (name: string, lv: string, c: string) => `[발표 스크립트] ${name}는 영어가 ${lv}입니다. ${c}`,
    noteHow: (name: string, f: string) => `[발표 스크립트] ${name} 시험 방식입니다. ${f}`,
    noteFit: "[발표 스크립트] 그래서 이런 학생에게 맞습니다.",
  },
  results: {
    en: "SCOREBOARD",
    title: "옳은영어 성적표",
    foot: (term: string) => `${term} 기준. 두 지표는 분모가 다릅니다`,
    note: "[발표 스크립트] 두 숫자는 기준이 다릅니다. 섞어서 비교하시면 안 됩니다.",
  },
  closing: {
    en: "THANK YOU",
    title: ["정확한 분석,", "옳은 방향"],
    brand: "옳은영어 ORUN ENGLISH",
    tagline: "동작구에서 12년, 옳은영어",
    note: "[발표 스크립트] 개별 상담은 끝나고 바로 받겠습니다.",
  },
};

/* ── 1등급 계산기 ─────────────────────────── */

export const CALC = {
  common: { en: "COMMON", title: "공통과목", hint: "1학년 공통과목은 학년 전체가 듣습니다. 분모가 학년 정원입니다.", placeholder: "학년 정원" },
  elective: { en: "ELECTIVE", title: "선택과목", hint: "2, 3학년 선택과목은 그 과목을 고른 학생끼리만 겨룹니다. 분모가 수강자 수입니다.", placeholder: "예상 수강자 수" },
  seatsLabel: "1등급",
  unit: "명",
  cols: { grade: "등급", seats: "인원", cum: "누적" },
  foot: "2025학년도 고1부터 5등급제입니다. 1등급 10%, 2등급까지 34%, 3등급까지 66%, 4등급까지 90%. 상위 10% 안이어야 하므로 소수점은 버립니다.",
};

/* ── 학교 기록(입력 화면) ───────────────── */

export const EDITOR = {
  pickSchool: "학교를 골라 주세요",
  pickHint: "적어 둘 학교를 위에서 골라 주세요. 한 학교에 10분이면 됩니다.",
  recorded: "직접 적은 학교",
  progress: (total: number, filled: number) => `전체 ${total}곳 중 직접 적은 곳 ${filled}곳`,
  pct: (p: number) => `${p}% 채움`,
  saved: "저장했습니다",
  saveFailed: "저장하지 못했습니다. 브라우저 저장공간을 확인해 주세요.",
  reset: "기록 지우기",
  resetConfirm: (name: string) => `${name}에 적어 둔 것을 지웁니다. 계속할까요?`,
  fact: { en: "AUTO FILLED", ko: "학교 기본 정보", hint: "자동으로 채워집니다. 손댈 수 없습니다.", tag: "읽기만" },
  character: {
    phHigh: "이 학교를 한 문단으로. 설명회 첫 장에 그대로 실립니다.",
    phMid: "이 중학교를 한 문단으로. 분위기, 진학 성향, 영어 수업 특징.",
  },
  subjects: {
    phHigh: "난이도에 대한 설명. 성취도 분포에서 읽어낸 것",
    phMid: "성취도 분포에서 읽어낸 것. 중학교는 등급이 없습니다.",
  },
  scope: { add: "시험 하나 더", termHigh: "1학기 중간", termMid: "3학년 1학기 중간", ph: "교과서 Lesson 1~2, 부교재 Unit 1~4 (총 30지문)" },
  middle: {
    hint: "중학교는 석차등급이 없습니다. 성적표에는 성취도 A~E만 남습니다.",
    aRatio: "영어 성취도 A 비율",
    ratio: "지필 : 수행",
    freeSemester: "지필평가 없는 학기",
    textbook: "교과서",
    ph: { aRatio: "예: 32%", ratio: "예: 60 : 40", freeSemester: "예: 1학년 전체 (자유학년)", textbook: "예: 동아 윤정미" },
  },
  cutoff: {
    hint: "근거를 꼭 같이 적어 주세요. 추정치가 학교 발표처럼 보이면 안 됩니다.",
    g1: "1등급",
    g2: "2등급",
    basis: "기준",
    ph: { g1: "87~91", g2: "63~71", basis: "영어, 원점수 기준" },
  },
  features: { add: "한 줄 더", ph: "시험지를 받아 본 사람만 아는 것" },
  signature: { hint: "문항 유형을 걸어 두면 설명회 자리에서 바로 문제를 뽑을 수 있습니다.", add: "문항 하나 더", title: "문제 발문이나 유형 이름", note: "왜 이 문제가 등급을 가르는지", noType: "문항 유형 안 걸기" },
  fit: { hint: "어떤 학생에게 맞는지 적어 두면 학교 페이지 끝에 실립니다.", add: "하나 더", phHigh: "어떤 학생에게 맞는 학교인가", phMid: "어떤 학생에게 맞는 중학교인가" },
  rows: { up: "위로", down: "아래로", remove: "지우기" },
  stats: { g1: "1학년", classes: "학급", perClass: "학급당", male: "남", female: "여" },
};

export const BACKUP = {
  en: "BACKUP",
  title: "이 브라우저에만 남습니다",
  text: (n: number) =>
    `직접 적은 ${n}곳이 이 브라우저에 남아 있습니다. 다른 컴퓨터에서 쓰거나 백업하려면 파일로 내보내 주세요. 브라우저 데이터를 지우면 같이 사라집니다. 프로그램에 기본으로 들어 있는 학교는 내보내기에 들어가지 않습니다.`,
  export: "파일로 내보내기",
  import: "파일 불러오기",
  imported: (n: number) => `${n}곳을 불러왔습니다.`,
};

/* ── 학업성취 프로필 ───────────────────── */

type Fit = { name: string; en: string; summary: (p: { seats: number; aCount: number; avg: string; sd: string; aMean: string }) => string; fit: string[]; caution: string[] };

export const ACHIEVE_PROFILE: Record<"thick" | "steep" | "flat" | "standard", Fit> = {
  thick: {
    name: "상위권이 많은 학교",
    en: "DEEP TOP",
    summary: ({ seats, aCount }) => `1등급 자리 ${seats}명보다 90점 이상(A) 인원 ${aCount}명이 많습니다. 90점을 넘겨도 1등급이 아닐 수 있습니다.`,
    fit: ["실수 없이 만점 가까이 마무리하는 습관이 있는 최상위권", "내신 경쟁이 세더라도 학생부·비교과로 같이 버틸 수 있는 학생", "친구들 수준이 높을 때 자극을 받는 유형"],
    caution: ["90점대 초반은 2등급을 각오해야 합니다.", "한 문제 차이가 등급을 바꿉니다. 서답형 감점 관리가 핵심입니다."],
  },
  steep: {
    name: "어렵게 내고 크게 벌리는 학교",
    en: "STEEP TEST",
    summary: ({ avg, sd }) => `평균 ${avg}점, 표준편차 ${sd}. 시험을 어렵게 내서 점수가 넓게 퍼집니다. 1등급 컷이 90점 아래로 내려옵니다.`,
    fit: ["응용과 심화 문제에 강하고 어려운 시험에 흔들리지 않는 학생", "상위권을 노린다면 경쟁자가 적어 유리합니다.", "점수보다 등급을 보고 스스로를 평가할 수 있는 학생"],
    caution: ["중위권은 점수 자체가 낮아 성취도 C와 D가 나올 수 있습니다. 자신감 관리가 필요합니다.", "고난도 훈련 없이는 상위권 진입이 어렵습니다."],
  },
  flat: {
    name: "완만하게 내는 학교",
    en: "GENTLE SLOPE",
    summary: ({ avg, sd }) => `평균 ${avg}점, 표준편차 ${sd}. 시험이 완만해서 점수가 몰려 있습니다. 한 문제가 등급을 바꿉니다.`,
    fit: ["꼼꼼하고 정확한 학생, 실수를 잘 안 하는 유형", "수업 내용을 충실히 따라가는 성실형", "심화보다 기본을 완벽하게 하는 쪽이 강한 학생"],
    caution: ["변별이 약해 1등급 컷이 매우 높습니다. 95점 안팎까지 올라갈 수 있습니다.", "쉬운 시험이라고 방심하면 등급이 한 번에 내려갑니다."],
  },
  standard: {
    name: "표준형 학교",
    en: "STANDARD",
    summary: ({ aMean }) => `국영수 A 비율 평균 ${aMean}%. 평균과 분포가 서울 일반고 표준에 가깝습니다.`,
    fit: ["꾸준히 하는 만큼 등급이 따라오는 구조라 성실한 학생에게 맞습니다.", "특정 과목 쏠림 없이 국영수를 고르게 하는 학생"],
    caution: ["표준형일수록 과목별 편차를 봐야 합니다. 아래 '등급을 가르는 과목'을 확인하세요."],
  },
};

/** 중학교용 — 등급이 없으니 A 비율과 평균으로만 말한다 */
export const ACHIEVE_MID = {
  high: { name: "A가 많은 학교", summary: (a: string) => `A 비율 ${a}%. 성취도 A가 흔해서 학교 시험만으로는 상위권이 갈리지 않습니다.`, fit: ["특목고나 자사고를 생각하면 학교 시험 밖에서 실력을 확인해야 합니다.", "내신 부담이 덜해 영어 원서와 심화에 시간을 쓸 수 있는 학생"], caution: ["고교 첫 시험에서 성적표 충격을 받기 쉽습니다. 중3 겨울이 중요합니다."] },
  low: { name: "A가 적은 학교", summary: (a: string) => `A 비율 ${a}%. 시험이 까다로워 A가 적습니다.`, fit: ["학교 시험으로 실력을 검증받고 싶은 학생", "서답형과 넓은 범위 같은 고교 내신 방식을 미리 겪어 보려는 학생"], caution: ["성취도 B와 C가 실력 부족이 아닐 수 있습니다. 점수보다 위치를 보세요."] },
  mid: { name: "표준형 학교", summary: (a: string) => `A 비율 ${a}%. 서울 중학교 표준에 가깝습니다.`, fit: ["꾸준한 학생이 노력만큼 결과를 받는 구조입니다."], caution: ["자유학기가 있는 학년은 지필 성취가 없습니다. 비교할 때 학년을 확인하세요."] },
};

export const ACHIEVE_IMPORT = {
  en: "GRADES FROM SCHOOLINFO",
  title: "학교알리미 성취도 엑셀 불러오기",
  lede: "'교과별 학업성취 사항'에서 받은 엑셀을 여기 놓으면 국영수 성취도 분석이 켜집니다. 학교마다 2026, 2025, 2024년 세 파일을 받아 한 번에 놓으세요.",
  checklist: {
    title: "받을 파일 체크리스트",
    lede: "이 화면은 보안문자로 막혀 있어 프로그램이 대신 받지 못합니다. 대신 학교마다 세 번 클릭으로 끝나게 해 두었습니다.",
    steps: [
      "'학교알리미 열기'를 누르면 그 학교 페이지가 새 탭으로 열립니다.",
      "공시정보에서 '4-나. 교과별 학업성취 사항'을 열고 보안문자를 입력합니다.",
      "'엑셀다운로드'를 누르고, 공시연도를 2025와 2024로 바꿔 두 번 더 받습니다.",
      "받은 파일을 아래 상자에 한 번에 끌어다 놓으면 학교와 연도는 자동으로 맞춰집니다.",
    ],
    open: "학교알리미 열기",
    noLink: "이 학교는 주소가 등록되어 있지 않습니다. 사이트에서 학교명으로 검색해 주세요.",
    progress: (have: number, total: number) => `${have} / ${total} 파일`,
    done: "전부 받았습니다",
    noneSelected: "'학교 고르기'에서 학교를 담으면 여기에 학교별로 정리됩니다.",
    yearDone: (y: number) => `${y} 완료`,
    yearTodo: (y: number) => `${y} 받기`,
  },
  drop: "여기에 파일을 끌어다 놓거나 눌러서 고르기",
  hint: "xlsx, xls 여러 개 가능",
  parsed: (rows: number) => `${rows}행 읽음`,
  school: "학교",
  year: "학년도",
  pickSchool: "학교를 골라 주세요",
  save: "저장",
  saveAll: (n: number) => `${n}개 파일 저장`,
  saved: (n: number) => `${n}곳 저장했습니다.`,
  remove: "지우기",
  loaded: "불러온 학교",
  export: "JSON으로 내보내기",
  importJson: "JSON 불러오기",
  fileNote: (name: string, rows: number) => `${name}, ${rows}행`,
  none: "불러온 성취도 자료가 없습니다.",
  preview: "미리보기",
};
