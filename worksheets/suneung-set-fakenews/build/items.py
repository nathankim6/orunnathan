# -*- coding: utf-8 -*-
"""지문별 출제 데이터.

키 규칙
  implication  phrase(밑줄 구문·원문 그대로) / ch(영어 5) / ans / sol
  mainPoint    ch(한국어 5) / ans / sol
  topic,title  ch(영어 5) / ans / sol / tr(보기 해석 5)
  mismatch     ch(영어 5) / ans / sol / tr(보기 해석 5)
  blank        target(빈칸 처리할 원문 구문) / ch(영어 5) / ans / sol
  order        lead(주어진 글 문장 수) / cuts(나머지를 세 덩이로 자를 위치) / ans / sol
  insert       take(빼낼 문장 번호) / ans(들어갈 자리 번호) / sol
  summary      tmpl(요약문) / ch[(A,B) 5] / ans / sol
"""

TYPES = {
    'implication': {'no': '[21]',    'name': '함축 의미',   'label': '21 함축의미',
                    'stem': '밑줄 친 부분이 다음 글에서 의미하는 바로 가장 적절한 것은?'},
    'mainPoint':   {'no': '[22]',    'name': '요지',        'label': '22 요지',
                    'stem': '다음 글의 요지로 가장 적절한 것은?'},
    'topic':       {'no': '[23]',    'name': '주제',        'label': '23 주제',
                    'stem': '다음 글의 주제로 가장 적절한 것은?'},
    'title':       {'no': '[24]',    'name': '제목',        'label': '24 제목',
                    'stem': '다음 글의 제목으로 가장 적절한 것은?'},
    'mismatch':    {'no': '[25-27]', 'name': '내용 불일치', 'label': '25-27 내용불일치',
                    'stem': '다음 글의 내용과 일치하지 않는 것은?'},
    'blank':       {'no': '[32-34]', 'name': '빈칸 추론',   'label': '32-34 빈칸',
                    'stem': '다음 빈칸에 들어갈 말로 가장 적절한 것은?'},
    'order':       {'no': '[36-37]', 'name': '글의 순서',   'label': '36-37 순서',
                    'stem': '주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?'},
    'insert':      {'no': '[38-39]', 'name': '문장 삽입',   'label': '38-39 문장삽입',
                    'stem': '글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?'},
    'summary':     {'no': '[40]',    'name': '요약문 완성', 'label': '40 요약문',
                    'stem': '다음 글의 내용을 한 문장으로 요약하고자 한다. '
                            '빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?'},
}

TYPE_ORDER = ['implication', 'mainPoint', 'topic', 'title', 'mismatch',
              'blank', 'order', 'insert', 'summary']

ITEMS = {}

# ─────────────────────────────────────────────────────────── 교1
ITEMS['교1'] = {
 'implication': {
   'phrase': 'Gina herself had accidentally contributed to the spread of fake news',
   'ch': ['she had unknowingly become one of the very people she had blamed',
          'she had deliberately invented a false story to attract attention',
          'she had failed to notice that her friends were spreading rumors',
          'she had lost all interest in checking the news she read online',
          'she had been misled by a reporter who covered the wrong story'],
   'ans': 1,
   'sol': '지나는 예전에 가짜 뉴스를 만들고 퍼뜨린 사람들을 비판했지만, 이번에는 흔들바위 기사를 확인 없이 '
          '친구들에게 공유해 그 확산에 일조했다. 따라서 밑줄 친 부분은 자신도 모르는 사이에 과거 자신이 '
          '비난했던 바로 그 사람들과 같은 처지가 되었다는 뜻이므로 ①이 가장 적절하다. ②는 "고의로" 지어냈다는 '
          '점에서, ③·④·⑤는 지문에 없는 내용이라는 점에서 답이 될 수 없다.'},
 'mainPoint': {
   'ch': ['확인하지 않고 공유한 뉴스는 누구든 가짜 뉴스의 유포자로 만들 수 있다.',
          '가짜 뉴스를 만든 콘텐츠 제작자는 반드시 법적 책임을 져야 한다.',
          '소셜 미디어보다 텔레비전 뉴스가 더 정확한 정보를 전달한다.',
          '유명인에 관한 기사는 조회수를 위해 과장되는 경우가 많다.',
          '친한 사이일수록 정보를 나눌 때 예의를 지켜야 한다.'],
   'ans': 1,
   'sol': '가짜 뉴스를 만든 사람들을 비판하던 지나가 정작 자신은 헤드라인만 보고 기사를 공유해 가짜 뉴스의 '
          '확산에 기여했다는 일화이다. 확인 없이 공유하는 순간 누구나 유포자가 될 수 있다는 것이 글의 요지이므로 '
          '①이 적절하다.'},
 'topic': {
   'ch': ['how an ordinary user can become a spreader of fake news',
          'why online news travels faster than television news does',
          'ways to punish content creators who invent false stories',
          'the damage that false reports cause to famous athletes',
          'the role of reporters in correcting errors in the media'],
   'ans': 1,
   'sol': '헤드라인만 보고 기사를 공유한 지나가 결국 가짜 뉴스 확산에 가담하게 된 과정을 보여 주는 글이므로, '
          '주제로는 ① ‘평범한 이용자가 어떻게 가짜 뉴스의 유포자가 되는가’가 가장 적절하다.',
   'tr': ['평범한 이용자가 어떻게 가짜 뉴스의 유포자가 되는가',
          '온라인 뉴스가 텔레비전 뉴스보다 빠르게 퍼지는 이유',
          '거짓 기사를 지어낸 콘텐츠 제작자를 처벌하는 방법',
          '거짓 보도가 유명 운동선수에게 입히는 피해',
          '언론의 오보를 바로잡는 기자의 역할']},
 'title': {
   'ch': ['Check Before You Share: Anyone Can Spread Fake News',
          'Who Really Profits from the Clicks You Give Away?',
          'Television News Still Beats Social Media in Speed',
          'The Rock That Never Fell: A Reporter’s Big Scoop',
          'Famous Athletes, the Easiest Target of Online Rumors'],
   'ans': 1,
   'sol': '가짜 뉴스를 비판하던 지나조차 확인 없이 공유해 유포자가 되었다는 내용이므로, 제목으로는 '
          '① ‘공유하기 전에 확인하라: 누구나 가짜 뉴스를 퍼뜨릴 수 있다’가 가장 적절하다.',
   'tr': ['공유하기 전에 확인하라: 누구나 가짜 뉴스를 퍼뜨릴 수 있다',
          '당신이 내주는 클릭으로 실제 이득을 보는 사람은 누구인가?',
          '텔레비전 뉴스는 여전히 소셜 미디어보다 빠르다',
          '무너지지 않은 바위: 어느 기자의 특종',
          '유명 운동선수, 온라인 루머의 가장 쉬운 표적']},
 'mismatch': {
   'ch': ['Gina saw the headline about the Heundeulbawi while scrolling through social media.',
          'Gina shared the shocking story with her close friends right away.',
          'A TV reporter stood next to the undamaged rock and said the stories were fake.',
          'Gina said nothing when the news about the famous athlete spread online.',
          'The false news about the athlete was made to raise the number of views.'],
   'ans': 4,
   'sol': '④번 선택지는 운동선수에 관한 뉴스가 퍼졌을 때 지나가 아무 말도 하지 않았다고 했는데, 지문에서는 '
          '"Gina criticized those who had made and spread fake news"라고 하여 당시 지나가 그들을 '
          '비판했다고 했으므로 글의 내용과 일치하지 않는다.',
   'tr': ['지나는 소셜 미디어를 넘겨 보다가 흔들바위에 관한 표제를 보았다.',
          '지나는 그 충격적인 이야기를 곧바로 친한 친구들에게 공유했다.',
          '한 TV 기자가 피해 없는 바위 옆에 서서 그 기사들이 가짜라고 말했다.',
          '지나는 그 유명 운동선수에 관한 뉴스가 퍼졌을 때 아무 말도 하지 않았다.',
          '그 운동선수에 관한 거짓 뉴스는 조회수를 높이기 위해 만들어졌다.']},
 'blank': {
   'target': 'to make money by raising the number of views of their posts',
   'ch': ['to earn income by driving up the traffic to their own posts',
          'to warn the public about the dangers of online rumors',
          'to protect the reputation of the athlete they admired',
          'to test how quickly readers could detect false reports',
          'to help reporters gather evidence for the morning news'],
   'ans': 1,
   'sol': '콘텐츠 제작자들이 사람들의 관심을 노려 자극적인 거짓 기사를 만들었다는 흐름이므로, 빈칸에는 그 '
          '목적인 ‘게시물 조회수를 올려 돈을 번다’가 들어가야 한다. 원문의 make money by raising the '
          'number of views를 earn income by driving up the traffic으로 바꾸어 쓴 ①이 정답이다. ②·③은 '
          '거짓 기사를 만드는 동기와 반대되고, ④·⑤는 지문에 없는 내용이다.'},
 'order': {'lead': 1, 'cuts': (3, 6), 'ans': 4,
   'sol': '지나가 헤드라인을 보고 놀랐다는 주어진 글 다음에는, 그것을 곧바로 공유했고 TV 보도로 가짜임이 '
          '밝혀져 당황했다는 (C)가 온다. 이어서 그 일이 예전의 다른 가짜 뉴스 사건을 떠올리게 했다는 (B)가 '
          '오고, 그 기사가 조회수를 노린 것이었으며 당시와 달리 이번에는 자신이 확산에 기여했다는 (A)로 '
          '마무리된다.'},
 'insert': {'take': 3, 'ans': 3,
   'sol': '주어진 문장은 지나가 가짜 뉴스를 퍼뜨렸다는 사실에 당황했다는 내용이다. 기자가 그 기사들이 '
          '가짜였다고 밝힌 문장 바로 뒤에 와야 자연스럽고, 그 뒤 문장의 It(그 일)이 가리키는 대상도 분명해지므로 '
          '③이 적절하다.'},
 'summary': {
   'tmpl': 'Gina, who had once ___(A)___ the makers of fake news, ended up ___(B)___ its spread '
           'herself simply by sharing a headline she had not checked.',
   'ch': [('blamed', 'fueling'), ('blamed', 'exposing'), ('ignored', 'fueling'),
          ('praised', 'blocking'), ('ignored', 'blocking')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 가짜 뉴스 제작자를 비판했던 지나가 확인하지 않은 헤드라인을 공유해 스스로 가짜 '
          '뉴스 확산에 일조했다. 2. 정답: 과거의 태도는 blamed(비난했다), 이번 결과는 fueling(확산을 '
          '부추김)이므로 ①이 적절하다. 3. 오답: exposing(폭로)·blocking(차단)은 결과와 반대이고, '
          'ignored·praised는 지나의 과거 태도와 맞지 않는다.'},
}

# ─────────────────────────────────────────────────────────── 교2
ITEMS['교2'] = {
 'implication': {
   'phrase': 'becoming an accidental distributor of fake news like Gina is not unusual',
   'ch': ['ordinary people commonly pass on false stories without meaning to',
          'most fake news is actually written by professional journalists',
          'people rarely notice the harm that online rumors cause to others',
          'sharing news on the Internet has become a serious legal offense',
          'social media companies seldom delete inaccurate information'],
   'ans': 1,
   'sol': '바로 앞 단락에서 지나가 확인 없이 기사를 공유한 일이 소개되었고, 이 문장은 그런 일이 드물지 않다고 '
          '말한다. 즉 평범한 사람들이 의도치 않게 가짜 뉴스를 퍼뜨리는 일이 흔하다는 뜻이므로 ①이 적절하다. '
          '②는 제작 주체를, ④·⑤는 처벌과 플랫폼 정책을 말하고 있어 문맥과 무관하다.'},
 'mainPoint': {
   'ch': ['가짜 뉴스는 의도적으로 만들어져 개인과 사회에 실질적인 피해를 준다.',
          '재난 상황에서는 정부가 모든 언론 보도를 사전에 검열해야 한다.',
          '지진 피해 주민에게는 심리 상담이 가장 먼저 제공되어야 한다.',
          '소셜 미디어는 정치 광고를 전면적으로 금지할 필요가 있다.',
          '뉴스의 출처를 밝히기만 해도 정보의 신뢰도는 크게 높아진다.'],
   'ans': 1,
   'sol': '가짜 뉴스는 관심·이익·정치적 이득을 노린 집단이 의도적으로 만든 것이며, 암본 지진 사례처럼 '
          '비상 상황에서 사람들을 혼란에 빠뜨리고 사회를 어지럽힌다는 내용이다. 따라서 ①이 요지로 적절하다.'},
 'topic': {
   'ch': ['the nature of fake news and the harm it does in a crisis',
          'the legal punishment given to creators of false reports',
          'the process of rebuilding a city after a strong earthquake',
          'the difficulty of predicting aftershocks with modern science',
          'the growing profits of social media platforms in Asia'],
   'ans': 1,
   'sol': '가짜 뉴스의 정의와 제작 의도를 설명한 뒤, 암본 지진 사례로 비상 상황에서의 피해를 보여 주는 글이다. '
          '따라서 주제로는 ① ‘가짜 뉴스의 본질과 위기 상황에서 그것이 끼치는 해악’이 적절하다.',
   'tr': ['가짜 뉴스의 본질과 위기 상황에서 그것이 끼치는 해악',
          '거짓 보도를 만든 사람에게 내려지는 법적 처벌',
          '강한 지진이 지나간 뒤 도시를 재건하는 과정',
          '현대 과학으로 여진을 예측하는 일의 어려움',
          '아시아 소셜 미디어 기업들의 늘어나는 수익']},
 'title': {
   'ch': ['When a Lie Shakes a City: Fake News in a Crisis',
          'Earthquakes and Tsunamis: How to Read the Warnings',
          'Why Shelters Are Safer Than Homes After a Quake',
          'Political Advertising: The Hidden Face of the Media',
          'Sharing Is Caring: The Bright Side of Social Media'],
   'ans': 1,
   'sol': '의도적으로 만들어진 가짜 뉴스가 비상 상황에서 도시 전체를 공포에 빠뜨린 사례를 다루므로, '
          '제목으로는 ① ‘거짓말이 도시를 뒤흔들 때: 위기 속의 가짜 뉴스’가 가장 적절하다.',
   'tr': ['거짓말이 도시를 뒤흔들 때: 위기 속의 가짜 뉴스',
          '지진과 쓰나미: 경보를 읽는 법',
          '지진 뒤에는 왜 집보다 대피소가 안전한가',
          '정치 광고: 언론의 숨은 얼굴',
          '나누는 것이 배려다: 소셜 미디어의 밝은 면']},
 'mismatch': {
   'ch': ['Fake news is a deliberate attempt to manipulate people with inaccurate information.',
          'Fake news can be produced for political benefits as well as for profit.',
          'The earthquake that struck Ambon in September 2019 measured 6.5.',
          'Residents of Ambon went back to their homes soon after the earthquake.',
          'The government had to announce that the information spreading online was fake.'],
   'ans': 4,
   'sol': '④번 선택지는 주민들이 지진 직후 집으로 돌아갔다고 했는데, 지문에서는 "thousands of residents '
          'did not return to their homes and were still in shelters for two weeks"라고 하여 수천 명이 '
          '2주 동안 대피소에 머물렀다고 했으므로 내용과 일치하지 않는다.',
   'tr': ['가짜 뉴스는 부정확한 정보로 사람들을 조종하려는 의도적인 시도이다.',
          '가짜 뉴스는 이익뿐 아니라 정치적 이득을 위해서도 만들어질 수 있다.',
          '2019년 9월 암본을 강타한 지진의 규모는 6.5였다.',
          '암본 주민들은 지진이 난 뒤 곧 집으로 돌아갔다.',
          '정부는 온라인에 퍼지던 그 정보가 가짜라고 발표해야 했다.']},
 'blank': {
   'target': 'did not return to their homes and were still in shelters for two weeks',
   'ch': ['stayed away from their houses and remained in shelters for a fortnight',
          'rushed back to the ruins to recover the belongings they had lost',
          'refused to accept any of the assistance offered by the government',
          'gathered in the city center to demand more accurate reporting',
          'moved to other islands to avoid the coming rainy season'],
   'ans': 1,
   'sol': '뒤 문장에서 또 다른 지진과 쓰나미가 온다는 가짜 뉴스 때문이었다고 밝히고 있으므로, 빈칸에는 '
          '주민들이 집에 돌아가지 못하고 대피소에 머물렀다는 내용이 들어가야 한다. 원문의 did not return '
          'to their homes and were still in shelters for two weeks를 stayed away ... for a fortnight로 '
          '바꾸어 쓴 ①이 정답이다. ②·③·④·⑤는 모두 지문에 근거가 없다.'},
 'order': {'lead': 1, 'cuts': (3, 5), 'ans': 2,
   'sol': '가짜 뉴스의 우발적 유포가 드물지 않다는 주어진 글 다음에는, 가짜 뉴스의 정의와 제작 의도, 그리고 '
          '그 해악을 설명한 (C)가 온다. 이어 비상 상황에서 흔히 퍼진다는 일반 진술과 암본 지진 사례를 든 (A)가 '
          '오고, 그 원인이 된 가짜 뉴스의 구체적 내용과 정부의 대응을 밝힌 (B)로 마무리된다.'},
 'insert': {'take': 4, 'ans': 4,
   'sol': '주어진 문장은 비상 상황에서 가짜 뉴스가 매우 흔히 퍼진다는 일반적 진술이다. 가짜 뉴스의 해악을 '
          '설명한 문장 뒤이면서 For example로 시작하는 암본 지진 사례 앞인 ④에 들어가야 글의 흐름이 자연스럽다.'},
 'summary': {
   'tmpl': 'Fake news is ___(A)___ created to win attention, money, or power, and in an emergency '
           'it can spread so widely that the authorities have to step in and ___(B)___ it.',
   'ch': [('intentionally', 'deny'), ('accidentally', 'deny'), ('intentionally', 'confirm'),
          ('carelessly', 'spread'), ('accidentally', 'ignore')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 가짜 뉴스는 관심·이익·정치적 이득을 노린 집단이 의도적으로 만들며, 암본 지진 때는 '
          '정부가 나서서 그것이 가짜라고 발표해야 했다. 2. 정답: a deliberate attempt에 대응하는 '
          'intentionally, 정부의 대응에 대응하는 deny가 들어간 ①이 적절하다. 3. 오답: accidentally· '
          'carelessly는 "의도적"이라는 지문과 어긋나고, confirm·spread·ignore는 정부의 대응과 반대이다.'},
}

# ─────────────────────────────────────────────────────────── 교3
ITEMS['교3'] = {
 'implication': {
   'phrase': 'people in their daily lives tend to think simply and effortlessly',
   'ch': ['in everyday life people accept claims without examining them closely',
          'people find complicated scientific reports too hard to understand',
          'people prefer short news articles to long and detailed ones',
          'people are far too busy to read any news during the working day',
          'people trust the opinions of experts more than their own judgment'],
   'ans': 1,
   'sol': '밑줄 뒤 문장에서 사람들이 비판적으로 검토하는 대신 증거 없이 새로운 정보를 믿기 쉽다고 했다. 즉 '
          '일상에서 사람들은 정보를 따져 보지 않고 받아들인다는 뜻이므로 ①이 적절하다. ②·③·④·⑤는 모두 '
          '지문이 말하는 "손쉬운 사고"의 의미와 다르다.'},
 'mainPoint': {
   'ch': ['가짜 뉴스는 자극 추구, 무비판적 사고, 확증 편향 때문에 빠르게 퍼진다.',
          '선거 기간에는 후보자에 대한 언론 보도를 제한할 필요가 있다.',
          '소셜 미디어 기업은 뉴스가 퍼지는 속도를 인위적으로 늦추어야 한다.',
          '새로운 정보일수록 사실 확인에 더 오랜 시간이 걸리기 마련이다.',
          '대학의 연구 결과는 언론 보도보다 언제나 신뢰할 만하다.'],
   'ans': 1,
   'sol': '가짜 뉴스가 빨리 퍼지는 이유로 새롭고 자극적인 것을 좋아하는 성향, 손쉽게 믿어 버리는 사고 습관, '
          '자기 신념만 받아들이는 확증 편향을 들고 있다. 따라서 ①이 요지로 적절하다.'},
 'topic': {
   'ch': ['psychological reasons why false stories travel fast online',
          'the methods researchers use to measure the speed of news',
          'the influence of election campaigns on voter turnout',
          'the responsibility of platforms for checking user posts',
          'the main differences between print media and social media'],
   'ans': 1,
   'sol': '가짜 뉴스가 진짜 뉴스보다 훨씬 빠르게 퍼지는 현상을 제시한 뒤, 그 원인을 사람의 심리에서 찾고 있는 '
          '글이다. 따라서 주제로는 ① ‘거짓 이야기가 온라인에서 빠르게 퍼지는 심리적 이유’가 적절하다.',
   'tr': ['거짓 이야기가 온라인에서 빠르게 퍼지는 심리적 이유',
          '연구자들이 뉴스의 확산 속도를 측정하는 방법',
          '선거 운동이 투표율에 미치는 영향',
          '이용자 게시물 검토에 대한 플랫폼의 책임',
          '인쇄 매체와 소셜 미디어의 주요 차이점']},
 'title': {
   'ch': ['Why Lies Outrun the Truth Online',
          'Six Times Faster: How Scientists Time the News',
          'Election Season: A Guide to Fair Reporting',
          'Confirmation Bias Is Good for Your Memory',
          'Break the Habit of Reading Only Headlines'],
   'ans': 1,
   'sol': '가짜 뉴스가 진실보다 6배 빠르게 퍼지는 이유를 사람의 심리로 설명하는 글이므로, 제목으로는 '
          '① ‘거짓말은 왜 온라인에서 진실보다 빨리 달리는가’가 가장 적절하다.',
   'tr': ['거짓말은 왜 온라인에서 진실보다 빨리 달리는가',
          '6배 더 빠르게: 과학자들은 뉴스의 속도를 어떻게 재는가',
          '선거철: 공정 보도를 위한 안내',
          '확증 편향은 기억력에 이롭다',
          '표제만 읽는 습관을 버려라']},
 'mismatch': {
   'ch': ['An MIT study found that fake news spreads about six times faster than real news.',
          'People want to share astonishing information because they find it stimulating.',
          'Posting previously unknown information first can bring a user attention.',
          'People usually examine new information critically before they believe it.',
          'Confirmation bias leads people to ignore news that does not support their beliefs.'],
   'ans': 4,
   'sol': '④번 선택지는 사람들이 새로운 정보를 믿기 전에 비판적으로 검토한다고 했는데, 지문에서는 '
          '"believe new information without any proof, instead of critically examining it"라고 하여 '
          '오히려 검토 없이 믿을 가능성이 크다고 했으므로 내용과 일치하지 않는다.',
   'tr': ['MIT의 한 연구는 가짜 뉴스가 진짜 뉴스보다 약 6배 빠르게 퍼진다는 것을 밝혔다.',
          '사람들은 놀라운 정보가 자극적이라고 느끼기 때문에 그것을 공유하고 싶어 한다.',
          '아직 알려지지 않은 정보를 먼저 올리면 이용자는 주목을 받을 수 있다.',
          '사람들은 대개 새로운 정보를 믿기 전에 그것을 비판적으로 검토한다.',
          '확증 편향은 사람들이 자기 신념을 뒷받침하지 않는 뉴스를 무시하게 만든다.']},
 'blank': {
   'target': "they selectively accept news in a way that only confirms their beliefs and ignore news that doesn't support them",
   'ch': ['they take in only the reports that agree with what they already think',
          'they double-check every report before passing it on to other people',
          'they lose all interest in politics as soon as an election is over',
          'they prefer news written by journalists they have met in person',
          'they remember negative headlines much longer than positive ones'],
   'ans': 1,
   'sol': '빈칸 앞에서 확증 편향의 함정에 빠진다고 했고, 뒤에서는 선호 후보에 관한 긍정적 보도만 맹목적으로 '
          '믿는 예를 들고 있다. 따라서 빈칸에는 자기 신념에 맞는 뉴스만 받아들인다는 내용이 와야 하므로, '
          '원문 표현을 바꾸어 쓴 ①이 정답이다. ②는 확증 편향과 반대이고 ③·④·⑤는 근거가 없다.'},
 'order': {'lead': 2, 'cuts': (3, 6), 'ans': 5,
   'sol': '가짜 뉴스가 훨씬 빠르게 퍼진다는 현상과 MIT 연구 결과가 주어진 글이다. 그 첫 번째 설명으로 '
          '새롭고 자극적인 것을 좋아해 남보다 먼저 공유하려 한다는 (A)가 오고, 두 번째 설명으로 손쉽게 '
          '믿어 버리는 사고 습관과 편견에 부합하는 정보를 믿는 성향을 든 (C)가 이어진다. 마지막으로 그 결과인 '
          '확증 편향과 선거철 사례를 든 (B)로 마무리된다.'},
 'insert': {'take': 5, 'ans': 3,
   'sol': '주어진 문장은 Also로 시작하며 가짜 뉴스가 퍼지는 두 번째 이유를 꺼내는 문장이다. 첫 번째 이유'
          '(자극 추구)에 대한 설명이 끝나는 자리이자, 증거 없이 믿는다는 부연 설명 앞인 ③이 적절하다.'},
 'summary': {
   'tmpl': 'False stories travel fast because readers are drawn to what is ___(A)___ and because '
           'they take in information ___(B)___, especially when it fits what they already believe.',
   'ch': [('startling', 'uncritically'), ('startling', 'reluctantly'),
          ('familiar', 'uncritically'), ('familiar', 'cautiously'), ('official', 'reluctantly')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 사람들은 놀랍고 자극적인 정보에 끌리고, 증거 없이 손쉽게 믿으며, 자기 신념에 맞는 '
          '뉴스만 받아들인다. 2. 정답: 자극적이라는 뜻의 startling과 비판 없이라는 뜻의 uncritically가 들어간 '
          '①이 적절하다. 3. 오답: familiar·official은 "새롭고 자극적"이라는 지문과 어긋나고, '
          'reluctantly·cautiously는 손쉽게 믿는다는 내용과 반대이다.'},
}

# ─────────────────────────────────────────────────────────── 교4
ITEMS['교4'] = {
 'implication': {
   'phrase': "don't read the news at face value",
   'ch': ['do not accept a report as true simply because of the way it looks',
          'do not read any news that has not been printed on paper',
          'do not pay for the news services that you cannot afford',
          'do not discuss the news you have read with your close friends',
          'do not believe any report that criticizes your own opinion'],
   'ans': 1,
   'sol': '밑줄 뒤에서 비판적 사고로 뉴스를 판단하고, 읽은 것을 질문하고 분석하고 평가하라고 했다. 즉 겉으로 '
          '보이는 대로 사실이라고 받아들이지 말라는 뜻이므로 ①이 적절하다. ②·③·④는 지문과 무관하고, '
          '⑤는 오히려 반대되는 의견의 기사도 찾아보라는 글의 조언과 어긋난다.'},
 'mainPoint': {
   'ch': ['정보를 비판적·객관적으로 검토하면 가짜 뉴스의 피해를 줄일 수 있다.',
          '인터넷 뉴스는 종이 신문보다 정보의 양이 훨씬 많고 빠르다.',
          '자극적인 표제를 다는 언론사는 반드시 제재를 받아야 한다.',
          '뉴스를 읽는 시간을 정해 두면 학습 집중력이 향상된다.',
          '자신의 의견과 일치하는 기사를 읽어야 내용 이해가 빠르다.'],
   'ans': 1,
   'sol': '표제 너머 읽기, 액면 그대로 믿지 않기, 자신의 편견 점검하기, 출처의 신뢰성 확인하기라는 네 가지 '
          '방법을 제시한 뒤, 비판적·객관적으로 정보를 볼 수 있다면 피해를 줄일 수 있다고 결론짓는다. '
          '따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['practical steps for telling reliable news from false news',
          'reasons why online headlines have become more and more extreme',
          'the legal duties of media companies in the digital age',
          'the difficulty of removing false information from the Internet',
          'the way personal beliefs are formed during childhood'],
   'ans': 1,
   'sol': '가짜 뉴스에 속지 않기 위한 네 가지 구체적인 방법을 차례로 제시하는 글이므로, 주제로는 '
          '① ‘믿을 만한 뉴스와 거짓 뉴스를 가려내는 실질적인 방법’이 적절하다.',
   'tr': ['믿을 만한 뉴스와 거짓 뉴스를 가려내는 실질적인 방법',
          '온라인 표제가 점점 더 자극적으로 변해 가는 이유',
          '디지털 시대에 언론사가 지는 법적 의무',
          '인터넷에서 거짓 정보를 없애는 일의 어려움',
          '어린 시절에 개인의 신념이 형성되는 방식']},
 'title': {
   'ch': ['Four Habits That Keep Fake News from Fooling You',
          'Headlines Are Enough: Read Faster, Know More',
          'Why the Internet Will Never Be Free of Lies',
          'Choose Only the News That Suits Your Opinion',
          'How Reporters Check Their Sources Every Day'],
   'ans': 1,
   'sol': '표제 너머 읽기, 액면 그대로 믿지 않기, 편견 점검하기, 출처 확인하기라는 네 가지 습관을 제안하는 '
          '글이므로, 제목으로는 ① ‘가짜 뉴스에 속지 않게 해 주는 네 가지 습관’이 가장 적절하다.',
   'tr': ['가짜 뉴스에 속지 않게 해 주는 네 가지 습관',
          '표제면 충분하다: 더 빨리 읽고 더 많이 알라',
          '인터넷이 결코 거짓말에서 자유로울 수 없는 이유',
          '자신의 의견에 맞는 뉴스만 골라 읽어라',
          '기자들은 매일 어떻게 출처를 확인하는가']},
 'mismatch': {
   'ch': ['Provocative headlines are made stimulating in order to attract more clicks.',
          'Readers are advised to question, analyze, and evaluate what they read.',
          'Readers should also look for articles that oppose their own opinion.',
          'The writer says that all false information online can now be removed.',
          'Checking who wrote a story and why is part of judging its source.'],
   'ans': 4,
   'sol': '④번 선택지는 온라인의 모든 거짓 정보를 없앨 수 있다고 했는데, 지문에서는 "it might be impossible '
          'to avoid or eliminate all false information that spreads online"이라고 하여 그것이 불가능할 수 '
          '있다고 했으므로 내용과 일치하지 않는다.',
   'tr': ['자극적인 표제는 더 많은 클릭을 끌기 위해 자극적으로 만들어진다.',
          '독자는 자신이 읽은 것에 대해 질문하고 분석하고 평가하도록 권고받는다.',
          '독자는 자신의 의견에 반대되는 기사도 찾아보아야 한다.',
          '글쓴이는 온라인의 모든 거짓 정보를 이제 없앨 수 있다고 말한다.',
          '누가 왜 그 기사를 썼는지 확인하는 것은 출처를 판단하는 일의 일부이다.']},
 'blank': {
   'target': 'if you have the ability to view information critically and objectively',
   'ch': ['if you can look at what you read with a questioning and neutral eye',
          'if you limit the time that you spend on social media each day',
          'if you share news only with the friends whom you trust most',
          'if you read the same story in as many languages as possible',
          'if you report suspicious posts to the platform immediately'],
   'ans': 1,
   'sol': '앞에서 제시한 네 가지 방법은 모두 정보를 따져 보고 객관적으로 판단하라는 것이며, 빈칸 문장은 그 '
          '조건이 갖추어지면 피해를 줄일 수 있다는 결론이다. 원문의 view information critically and '
          'objectively를 look at what you read with a questioning and neutral eye로 바꾸어 쓴 ①이 '
          '정답이다. 나머지는 모두 글에서 제시한 방법이 아니다.'},
 'order': {'lead': 4, 'cuts': (3, 6), 'ans': 2,
   'sol': '질문과 첫 번째 조언(표제 너머 읽기)이 주어진 글이다. 다음으로 두 번째 조언인 액면 그대로 읽지 '
          '말라는 (C)가 오고, 세 번째 조언인 자신의 편견 점검하기 (A)가 이어지며, 마지막 조언인 출처의 '
          '신뢰성 확인과 전체 결론을 담은 (B)로 마무리된다.'},
 'insert': {'take': 10, 'ans': 4,
   'sol': '주어진 문장은 Finally로 시작하는 네 번째 조언이다. 세 번째 조언인 편견 점검에 대한 설명이 끝나는 '
          '자리이자, 누가 왜 기사를 썼는지 살피라는 구체적 설명 앞인 ④에 들어가야 한다.'},
 'summary': {
   'tmpl': 'To avoid being ___(A)___ by false reports, readers should look past headlines, judge '
           'stories critically, watch their own biases, and check the ___(B)___ of the source.',
   'ch': [('deceived', 'reliability'), ('deceived', 'popularity'),
          ('entertained', 'reliability'), ('informed', 'popularity'), ('entertained', 'length')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 가짜 뉴스에 현혹되지 않으려면 네 가지 방법을 실천해야 하며, 그 마지막이 출처의 '
          '신뢰성 확인이다. 2. 정답: mislead에 대응하는 deceived, credibility에 대응하는 reliability가 '
          '들어간 ①이 적절하다. 3. 오답: entertained·informed는 글의 목적과 맞지 않고, '
          'popularity·length는 확인해야 할 대상이 아니다.'},
}

# ─────────────────────────────────────────────────────────── 25년9월20번
ITEMS['25년9월20번'] = {
 'implication': {
   'phrase': 'The first minutes set the tone for the rest of the class',
   'ch': ['how a lesson begins shapes the mood and pace of all that follows',
          'teachers should spend the opening minutes reviewing the last lesson',
          'students decide within minutes whether they like their new teacher',
          'the start of a class is the best time to check who is absent',
          'short lessons work better than long ones for younger learners'],
   'ans': 1,
   'sol': '앞뒤 문장에서 첫 10분을 훌륭한 출발에 쓸 수도, 낭비할 수도 있다고 했고, 시작 루틴이 있으면 학생들이 '
          '새 학습에 집중할 준비를 한다고 했다. 즉 수업의 첫 몇 분이 남은 수업 전체의 분위기와 흐름을 '
          '결정한다는 뜻이므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['효과적인 수업 출발을 위해 시작 루틴을 마련해야 한다.',
          '지각하는 학생에게는 분명한 벌칙을 적용해야 한다.',
          '교사에게는 충분한 수업 준비 시간이 보장되어야 한다.',
          '학생의 정서적 안정이 학업 성취보다 우선되어야 한다.',
          '수업 시간은 과목의 특성에 따라 달리 편성해야 한다.'],
   'ans': 1,
   'sol': '비효율적인 교사는 수업 첫 몇 분의 힘을 간과하지만, 시작 루틴을 가르쳐 두면 학생들이 짧은 시간에 '
          '마음을 전환하고 학습에 집중할 수 있다는 내용이다. 마지막 문장에서 시작 루틴을 마련하라고 직접 '
          '요약하고 있으므로 ①이 요지이다.'},
 'topic': {
   'ch': ['the value of a planned routine for the opening minutes of class',
          'strategies for dealing with students who are always late',
          'the effect of class size on the concentration of students',
          'ways of reducing the administrative workload of teachers',
          'the importance of reviewing material at the end of a lesson'],
   'ans': 1,
   'sol': '수업 첫 몇 분을 낭비하지 말고 시작 루틴을 마련하라는 글이므로, 주제로는 ① ‘수업 시작 몇 분을 위한 '
          '계획된 루틴의 가치’가 가장 적절하다.',
   'tr': ['수업 시작 몇 분을 위한 계획된 루틴의 가치',
          '늘 지각하는 학생을 다루는 전략',
          '학급 규모가 학생의 집중력에 미치는 영향',
          '교사의 행정 업무 부담을 줄이는 방법',
          '수업 끝에 학습 내용을 복습하는 일의 중요성']},
 'title': {
   'ch': ['The First Ten Minutes Decide the Whole Lesson',
          'Why Students Arrive Late and How to Punish Them',
          'Teach Less, Learn More: A New Design for Class',
          'Paperwork Is Quietly Stealing Your Teaching Time',
          'End Every Class with a Powerful Summary'],
   'ans': 1,
   'sol': '수업의 첫 몇 분이 나머지 수업의 분위기를 결정하므로 시작 루틴을 세우라는 글이다. 따라서 제목으로는 '
          '① ‘첫 10분이 수업 전체를 결정한다’가 가장 적절하다.',
   'tr': ['첫 10분이 수업 전체를 결정한다',
          '학생들은 왜 지각하며 어떻게 벌해야 하는가',
          '덜 가르치고 더 배우게 하라: 새로운 수업 설계',
          '서류 업무가 당신의 수업 시간을 조용히 훔치고 있다',
          '모든 수업을 강력한 요약으로 끝내라']},
 'mismatch': {
   'ch': ['Inefficient teachers overlook the power of the opening minutes of class.',
          'More than ten minutes can disappear before a class actually begins.',
          'Students have little reason to be on time when class starts late.',
          'The writer advises teachers to use the first ten minutes for a short rest.',
          'An opening routine helps students make mental and emotional transitions.'],
   'ans': 4,
   'sol': '④번 선택지는 첫 10분을 짧은 휴식에 쓰라고 조언한다고 했는데, 지문에서는 "You can use the first '
          'ten minutes to get your class off to a great start"라고 하여 훌륭한 출발에 쓰라고 했으므로 '
          '내용과 일치하지 않는다.',
   'tr': ['비효율적인 교사는 수업 시작 몇 분의 힘을 간과한다.',
          '수업이 실제로 시작되기 전에 10분 이상이 사라질 수 있다.',
          '수업이 늦게 시작되면 학생들은 제시간에 올 이유가 거의 없다.',
          '글쓴이는 교사에게 첫 10분을 짧은 휴식에 쓰라고 조언한다.',
          '시작 루틴은 학생들이 정신적·정서적 전환을 하도록 돕는다.']},
 'blank': {
   'target': 'to make mental and emotional transitions from the last class or subject and prepare to focus on learning new material',
   'ch': ['to shift their minds and feelings away from the previous lesson and get ready for new content',
          'to finish the homework that they failed to complete the night before',
          'to chat freely with their classmates until the teacher finally arrives',
          'to decide for themselves which subject they would like to study that day',
          'to judge how well their previous teacher had explained the topic'],
   'ans': 1,
   'sol': '시작 루틴이 마련되어 있을 때 학생들이 짧은 시간을 어떻게 쓰는지가 빈칸의 내용이며, 뒤이어 효과적인 '
          '출발을 위해 루틴을 세우라는 결론이 온다. 원문의 make mental and emotional transitions ... '
          'prepare to focus on learning new material을 바꾸어 쓴 ①이 정답이다. 나머지는 모두 수업 준비와 '
          '무관하거나 글의 취지에 어긋난다.'},
 'order': {'lead': 1, 'cuts': (2, 4), 'ans': 1,
   'sol': '비효율적인 교사가 수업 첫 몇 분을 간과한다는 주어진 글 다음에는, 그 결과 10분 이상이 사라지고 '
          '학생들이 제시간에 올 이유가 없어진다는 (B)가 온다. 이어 그 시간을 잘 쓸 수도 낭비할 수도 있으며 '
          '첫 몇 분이 분위기를 정한다는 (C)가 오고, 시작 루틴의 효과와 결론을 담은 (A)로 마무리된다.'},
 'insert': {'take': 4, 'ans': 4,
   'sol': '주어진 문장은 첫 몇 분이 나머지 수업의 분위기를 결정한다는 일반 진술이다. 첫 10분을 잘 쓸 수도 '
          '낭비할 수도 있다는 문장 바로 뒤에서 그 이유를 밝히는 자리인 ④가 적절하다.'},
 'summary': {
   'tmpl': 'Because the opening minutes ___(A)___ the atmosphere of an entire lesson, a teacher '
           'should set up a fixed opening ___(B)___ rather than let that time slip away.',
   'ch': [('determine', 'routine'), ('determine', 'test'), ('ignore', 'routine'),
          ('shorten', 'break'), ('ignore', 'break')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 수업 첫 몇 분이 수업 전체의 분위기를 정하므로 시작 루틴을 마련해야 한다. '
          '2. 정답: set the tone에 대응하는 determine, opening routine에 대응하는 routine이 들어간 ①이 '
          '적절하다. 3. 오답: ignore·shorten은 첫 몇 분의 힘을 강조한 글과 반대이고, test·break는 글이 '
          '제안한 방법이 아니다.'},
}

# ─────────────────────────────────────────────────────────── 25년9월21번
ITEMS['25년9월21번'] = {
 'implication': {
   'phrase': "You're the present caretaker of the atoms in your body",
   'ch': ['you hold these atoms only for a while before they move on to others',
          'you are responsible for keeping your own body in good health',
          'you can decide which atoms will stay inside your body forever',
          'you inherited most of your atoms from your closest relatives',
          'you must protect the environment that supplies you with atoms'],
   'ans': 1,
   'sol': '앞에서 원자를 소유하는 것이 아니라 빌리는 것이며 우리 모두가 같은 원자풀을 공유한다고 했고, 뒤에서는 '
          '당신의 뒤를 이을 이들이 많을 것이라고 했다. 따라서 밑줄 친 부분은 잠시 맡아 두었다가 다음 사람에게 '
          '넘겨준다는 뜻이므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['우리 몸의 원자는 소유하는 것이 아니라 잠시 빌려 쓰는 것이다.',
          '인체를 이루는 원자의 수는 평생 동안 일정하게 유지된다.',
          '호흡은 몸속 노폐물을 내보내는 가장 효율적인 방법이다.',
          '우주의 나이는 원자의 무게를 재어 정확히 계산할 수 있다.',
          '생물과 무생물은 서로 다른 종류의 원자로 이루어져 있다.'],
   'ans': 1,
   'sol': '몸을 이루는 원자는 소유물이 아니라 빌린 것이고, 호흡과 땀을 통해 사람 사이를 끝없이 순환하며, 우리는 '
          '그것의 현재 관리인일 뿐이라는 내용이다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['the endless circulation of the atoms that all of us share',
          'the chemical process by which the human body grows old',
          'methods of measuring the exact age of the universe',
          'the essential difference between living and nonliving matter',
          'the role that breathing plays in keeping the body warm'],
   'ans': 1,
   'sol': '몸속 원자가 우주의 시작부터 존재하며 사람과 사람 사이를 끝없이 순환한다는 내용이므로, 주제로는 '
          '① ‘우리 모두가 공유하는 원자의 끝없는 순환’이 가장 적절하다.',
   'tr': ['우리 모두가 공유하는 원자의 끝없는 순환',
          '인간의 몸이 늙어 가는 화학적 과정',
          '우주의 나이를 정확히 측정하는 방법',
          '생물과 무생물의 본질적인 차이',
          '호흡이 체온 유지에서 하는 역할']},
 'title': {
   'ch': ['Borrowed, Not Owned: The Atoms Inside You',
          'How Old Is the Universe? Ask the Heavy Atoms',
          'Every Breath You Take Creates Brand-New Matter',
          'The Human Body: A Perfectly Sealed System',
          'Why Living Things Need Atoms of Their Own'],
   'ans': 1,
   'sol': '몸속 원자는 소유하는 것이 아니라 빌려 쓰는 것이며 우리는 그 현재 관리인일 뿐이라는 글이므로, '
          '제목으로는 ① ‘소유가 아니라 빌린 것: 당신 안의 원자들’이 가장 적절하다.',
   'tr': ['소유가 아니라 빌린 것: 당신 안의 원자들',
          '우주는 몇 살인가? 무거운 원자에게 물어보라',
          '당신이 쉬는 모든 숨은 완전히 새로운 물질을 만든다',
          '인간의 몸: 완벽하게 밀폐된 계',
          '생물에게 자기만의 원자가 필요한 이유']},
 'mismatch': {
   'ch': ['Only some of the atoms you inhale are exhaled in your very next breath.',
          'Atoms move from person to person as people breathe and as sweat evaporates.',
          'Most of the heavier atoms are older than both the Sun and the Earth.',
          'The atoms that make up your body belong to you permanently.',
          'Some atoms in your body have existed since the first moments of time.'],
   'ans': 4,
   'sol': '④번 선택지는 몸을 이루는 원자가 영구히 자기 것이라고 했는데, 지문에서는 "You don\'t \'own\' the '
          'atoms that make up your body; you borrow them"이라고 하여 빌리는 것이라고 했으므로 내용과 '
          '일치하지 않는다.',
   'tr': ['당신이 들이마신 원자 중 일부만이 바로 다음 숨에 내뱉어진다.',
          '원자는 사람이 숨 쉬고 땀이 증발하면서 사람에게서 사람에게로 옮겨 간다.',
          '더 무거운 원자 대부분은 태양과 지구보다 더 오래되었다.',
          '당신의 몸을 이루는 원자는 영구히 당신의 것이다.',
          '당신 몸속에는 태초부터 존재해 온 원자가 있다.']},
 'blank': {
   'target': 'We all share from the same atom pool because atoms forever travel around, within, and among us',
   'ch': ['Every one of us draws on one common store of endlessly moving atoms',
          'Each person is born with a fixed set of atoms that never changes',
          'The atoms in living things differ from those in lifeless objects',
          'Heavier atoms travel far more slowly through the air than light ones',
          'Our bodies create brand-new atoms whenever they happen to need them'],
   'ans': 1,
   'sol': '앞에서 원자를 소유하지 않고 빌린다고 했고, 뒤에서는 호흡과 땀을 통해 사람 사이를 순환한다고 했다. '
          '따라서 빈칸에는 우리 모두가 같은 원자풀을 나누어 쓴다는 내용이 와야 하므로 ①이 정답이다. ②는 '
          '"빌린다"는 논지와 반대이고, ③·④·⑤는 지문에 근거가 없다.'},
 'order': {'lead': 1, 'cuts': (3, 6), 'ans': 4,
   'sol': '몸속 원자가 우주만큼 오래되었다는 주어진 글 다음에는, 호흡을 예로 들어 원자가 몸에 머물다 떠나며 '
          '소유가 아니라 빌리는 것임을 밝힌 (C)가 온다. 이어 같은 원자풀을 공유하며 대규모로 재순환한다는 '
          '(B)가 오고, 원자의 기원과 현재의 관리인이라는 결론을 담은 (A)로 마무리된다.'},
 'insert': {'take': 6, 'ans': 5,
   'sol': '주어진 문장은 앞의 내용을 한 문장으로 정리하는 진술이다. 호흡과 땀을 통해 원자가 사람 사이를 '
          '순환한다는 구체적 설명 바로 뒤인 ⑤에 들어가야 자연스럽다.'},
 'summary': {
   'tmpl': 'The atoms in your body are not your own ___(A)___ but part of a shared pool that has '
           'been ___(B)___ ever since the universe began.',
   'ch': [('property', 'recycled'), ('property', 'destroyed'), ('creation', 'recycled'),
          ('invention', 'stored'), ('creation', 'destroyed')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 몸속 원자는 소유물이 아니라 빌린 것이며, 우주의 시작부터 끝없이 재순환해 왔다. '
          '2. 정답: own의 대응어 property와 recycle의 대응어 recycled가 들어간 ①이 적절하다. 3. 오답: '
          'destroyed는 순환한다는 내용과 반대이고, creation·invention은 원자를 만들어 낸다는 뜻이어서 '
          '지문과 어긋난다.'},
}

# ─────────────────────────────────────────────────────────── 25년9월22번
ITEMS['25년9월22번'] = {
 'implication': {
   'phrase': "It's a low-impact way to stay active and fit",
   'ch': ['it keeps the body healthy without placing a heavy strain on it',
          'it takes far less time than most other forms of sport do',
          'it costs almost nothing once the first set of tools is bought',
          'it produces food that is much fresher than store-bought food',
          'it can be practised indoors whatever the weather may be like'],
   'ans': 1,
   'sol': '밑줄 친 부분은 전통적인 운동을 힘들어하는 사람에게 원예가 특히 이롭다는 문장에 이어지며, 모든 연령과 '
          '신체 능력의 사람이 할 수 있게 해 준다고 덧붙인다. 즉 몸에 큰 부담을 주지 않으면서 건강을 유지하는 '
          '방법이라는 뜻이므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['원예는 신체 건강과 정신 건강을 함께 길러 주는 활동이다.',
          '명상은 반복적인 노동보다 스트레스 완화에 더 효과적이다.',
          '전통적인 운동은 나이가 들수록 부상 위험이 커진다.',
          '채소를 직접 길러 먹으면 식비를 크게 줄일 수 있다.',
          '자연에서 보내는 시간은 학습 능력 향상과는 관련이 없다.'],
   'ans': 1,
   'sol': '앞부분은 원예가 근력·유연성·지구력을 길러 주는 신체 활동임을, 뒷부분은 스트레스와 불안을 줄이고 '
          '기분과 인지를 개선하는 정신 건강 효과를 설명한다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['the physical and mental benefits that gardening brings',
          'practical tips for starting a garden in a small space',
          'the reasons why traditional exercise is losing popularity',
          'the effect of growing plants on the air quality of cities',
          'the scientific process by which compost is produced'],
   'ans': 1,
   'sol': '원예의 신체적 효과와 정신적 효과를 차례로 제시하는 글이므로, 주제로는 ① ‘원예가 가져다주는 신체적·'
          '정신적 이점’이 가장 적절하다.',
   'tr': ['원예가 가져다주는 신체적·정신적 이점',
          '좁은 공간에서 정원을 시작하는 실용적인 요령',
          '전통적인 운동이 인기를 잃어 가는 이유',
          '식물 재배가 도시의 공기 질에 미치는 영향',
          '퇴비가 만들어지는 과학적 과정']},
 'title': {
   'ch': ['Dig, Water, Heal: What a Garden Does for You',
          "A Beginner's Guide to Growing Your Own Food",
          'Meditation Beats Exercise for a Healthy Mind',
          'Why Weeding Is the Hardest Job in the Garden',
          'Green Cities: Planting Trees to Clean the Air'],
   'ans': 1,
   'sol': '원예가 몸을 튼튼하게 하는 동시에 마음을 가라앉히고 치유한다는 내용이므로, 제목으로는 ① ‘파고, 물 '
          '주고, 치유하라: 정원이 당신에게 해 주는 일’이 가장 적절하다.',
   'tr': ['파고, 물 주고, 치유하라: 정원이 당신에게 해 주는 일',
          '초보자를 위한 먹거리 직접 기르기 안내',
          '건강한 마음에는 운동보다 명상이 낫다',
          '잡초 뽑기가 정원에서 가장 힘든 일인 이유',
          '녹색 도시: 공기를 맑게 하려고 나무를 심다']},
 'mismatch': {
   'ch': ['Gardening involves motions ranging from digging and planting to harvesting.',
          'Small tasks such as weeding or turning compost can burn many calories.',
          'Gardening is a high-impact activity suited only to physically fit adults.',
          'The repetitive tasks of gardening can bring about a state of mindfulness.',
          'Watching plants grow and thrive can raise self-esteem and well-being.'],
   'ans': 3,
   'sol': '③번 선택지는 원예가 신체가 튼튼한 성인에게만 맞는 고강도 활동이라고 했는데, 지문에서는 '
          '"a low-impact way ... accessible for people of all ages and physical abilities"라고 하여 '
          '모든 연령과 신체 능력의 사람이 할 수 있다고 했으므로 내용과 일치하지 않는다.',
   'tr': ['원예는 파기와 심기에서 수확에 이르는 다양한 동작을 포함한다.',
          '잡초 뽑기나 퇴비 뒤섞기 같은 작은 일도 많은 열량을 태울 수 있다.',
          '원예는 신체가 튼튼한 성인에게만 맞는 고강도 활동이다.',
          '원예의 반복적인 일은 마음 챙김의 상태를 이끌어 낼 수 있다.',
          '식물이 자라고 무성해지는 것을 지켜보면 자존감과 행복감이 높아질 수 있다.']},
 'blank': {
   'target': 'spending time in nature, even in a small garden, can elevate mood, improve cognition, and reduce depression symptoms',
   'ch': ['being outdoors, even in a tiny plot, lifts the spirits, sharpens thinking, and eases depression',
          'working with soil strengthens the muscles that are used for lifting heavy objects',
          'growing vegetables at home lowers the cost of a family’s weekly shopping',
          'regular contact with plants builds up resistance to seasonal allergies',
          'caring for a garden teaches young children the value of hard work'],
   'ans': 1,
   'sol': '빈칸 앞은 원예가 명상과 비슷한 마음 챙김 상태를 이끈다는 내용이고, 뒤는 성취감이 자존감을 높인다는 '
          '내용이다. 따라서 빈칸에는 자연에서 보내는 시간이 기분과 인지, 우울 증상에 미치는 긍정적 효과가 와야 '
          '하므로 원문을 바꾸어 쓴 ①이 정답이다. ②~⑤는 모두 지문이 말하는 정신 건강 효과와 무관하다.'},
 'order': {'lead': 1, 'cuts': (3, 5), 'ans': 2,
   'sol': '원예 자체가 훌륭한 신체 활동이라는 주어진 글 다음에는, 그 구체적 동작과 효과를 설명한 (C)가 온다. '
          '이어 전통적 운동이 힘든 사람에게 특히 이롭다는 (A)가 오고, 신체 건강 외의 정신 건강 효과를 다룬 '
          '(B)로 마무리된다.'},
 'insert': {'take': 6, 'ans': 4,
   'sol': '주어진 문장은 Besides physical health로 신체 건강에서 정신 건강으로 화제를 바꾸는 문장이다. '
          '따라서 신체적 이점에 관한 설명이 끝나는 자리이자, 식물 돌보기가 마음을 가라앉힌다는 설명 앞인 '
          '④가 적절하다.'},
 'summary': {
   'tmpl': 'Gardening works as a gentle form of ___(A)___ that strengthens the body, while its '
           'repetitive, absorbing tasks also ___(B)___ the mind.',
   'ch': [('exercise', 'calm'), ('exercise', 'exhaust'), ('therapy', 'exhaust'),
          ('competition', 'calm'), ('competition', 'distract')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 원예는 부담이 적은 신체 활동이면서 동시에 스트레스와 불안을 줄여 주는 활동이다. '
          '2. 정답: a fantastic form of physical activity에 대응하는 exercise, calming and meditative에 '
          '대응하는 calm이 들어간 ①이 적절하다. 3. 오답: exhaust·distract는 정신적 효과와 반대이고, '
          'competition은 원예를 경쟁으로 규정해 지문과 어긋난다.'},
}

# ─────────────────────────────────────────────────────────── 25년9월23번 (5문장·문장삽입 제외)
ITEMS['25년9월23번'] = {
 'implication': {
   'phrase': 'expanding the reach of our current senses',
   'ch': ['stretching what the senses we already have are able to detect',
          'replacing human senses with machines that work automatically',
          'training people to observe the natural world more patiently',
          'making scientific instruments smaller, lighter and cheaper',
          'recording natural phenomena so they can be studied later'],
   'ans': 1,
   'sol': '밑줄 뒤에 자외선을 가시 이미지로 만들거나 사람이 못 듣는 소리를 들리는 신호로 바꾸는 예가 이어진다. '
          '즉 이미 가지고 있는 감각이 닿는 범위를 넓힌다는 뜻이므로 ①이 적절하다. ②는 감각을 대체한다는 '
          '점에서, ③·④·⑤는 지문에 없는 내용이라는 점에서 답이 될 수 없다.'},
 'mainPoint': {
   'ch': ['도구는 감지할 수 없는 자연 현상을 지각 가능한 형태로 바꾸어 준다.',
          '망원경의 발명은 천문학의 발전을 결정적으로 앞당겼다.',
          '인간의 감각은 훈련을 통해 상당한 수준까지 예민해질 수 있다.',
          '과학 기기는 정확도보다 사용의 편리함을 먼저 고려해야 한다.',
          '자외선과 초음파는 인체에 해로우므로 취급에 주의해야 한다.'],
   'ans': 1,
   'sol': '인간은 오랫동안 감각으로 지각할 수 없는 자연 현상을 지각 가능한 형태로 바꾸어 주는 도구를 이용해 '
          '왔으며, 신호를 증폭하거나 변환하거나 아예 감각 능력이 없는 속성을 측정해 관찰 가능하게 만든다는 '
          '내용이다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['how instruments turn imperceptible signals into observable ones',
          'the historical development of the modern optical telescope',
          'the physical limits of the human eye and the human ear',
          'the process of training scientists to observe carefully',
          'the danger of relying too heavily on measuring devices'],
   'ans': 1,
   'sol': '지각할 수 없는 신호를 관찰 가능한 것으로 바꾸는 도구들을 세 가지 방식으로 나누어 설명하는 글이므로, '
          '주제로는 ① ‘도구가 지각할 수 없는 신호를 관찰 가능한 것으로 바꾸는 방식’이 적절하다.',
   'tr': ['도구가 지각할 수 없는 신호를 관찰 가능한 것으로 바꾸는 방식',
          '현대 광학 망원경의 역사적 발전 과정',
          '인간의 눈과 귀가 지닌 물리적 한계',
          '과학자에게 세심한 관찰을 훈련시키는 과정',
          '측정 장치에 지나치게 의존하는 것의 위험']},
 'title': {
   'ch': ['Instruments That Let Us Sense the Unsensed',
          'The Telescope: A Window on Distant Worlds',
          'Why Our Own Senses Cannot Be Fully Trusted',
          'Building Cheaper Tools for Modern Science',
          'Sound and Light: Two Sides of a Single Wave'],
   'ans': 1,
   'sol': '감각으로는 알 수 없는 현상을 지각할 수 있게 바꾸어 주는 도구들을 다룬 글이므로, 제목으로는 '
          '① ‘감지할 수 없는 것을 감지하게 해 주는 도구들’이 가장 적절하다.',
   'tr': ['감지할 수 없는 것을 감지하게 해 주는 도구들',
          '망원경: 먼 세계를 향한 창',
          '우리의 감각을 온전히 믿을 수 없는 이유',
          '현대 과학을 위한 더 값싼 도구 만들기',
          '소리와 빛: 하나의 파동의 두 얼굴']},
 'mismatch': {
   'ch': ['Humans have used tools that translate imperceptible phenomena for many centuries.',
          'A telescope brings into clear view what is too far away for our eyes.',
          'Some tools create visible images based on the ultraviolet spectrum of light.',
          'Every instrument mentioned works only by amplifying our normal senses.',
          'Some instruments measure properties that we cannot sense at all.'],
   'ans': 4,
   'sol': '④번 선택지는 언급된 모든 도구가 일반적인 감각을 증폭하는 방식으로만 작동한다고 했는데, 지문에서는 '
          '"some instruments measure properties for which we have no sensory capacity at all"이라고 하여 '
          '감각 능력이 전혀 없는 속성을 측정하는 도구도 있다고 했으므로 내용과 일치하지 않는다.',
   'tr': ['인간은 여러 세기 동안 지각할 수 없는 현상을 바꾸어 주는 도구를 이용해 왔다.',
          '망원경은 우리 눈에 너무 멀리 있는 것을 또렷한 시야로 가져다준다.',
          '어떤 도구는 빛의 자외선 스펙트럼을 바탕으로 가시 이미지를 만든다.',
          '언급된 모든 도구는 일반적인 감각을 증폭하는 방식으로만 작동한다.',
          '어떤 기기는 우리가 전혀 감지할 수 없는 속성을 측정한다.']},
 'blank': {
   'target': 'measure properties for which we have no sensory capacity at all and change them into that which we can observe',
   'ch': ['record qualities that no human sense can register and turn them into something we can see',
          'compare the strength of two different signals that reach our eyes at the same time',
          'store natural sounds carefully so that they can be played back much later',
          'reduce the errors that careless observers are likely to make in the field',
          'magnify objects that are simply too small to be seen with the naked eye'],
   'ans': 1,
   'sol': '앞에서 감각의 범위를 넓히는 도구를 설명한 뒤 Alternatively로 다른 종류의 도구를 제시하는 자리이다. '
          '따라서 빈칸에는 감각 능력이 아예 없는 속성을 측정해 관찰 가능하게 만든다는 내용이 와야 하므로 ①이 '
          '정답이다. ⑤는 감각의 증폭에 해당해 앞 내용과 겹치고, ②·③·④는 지문에 근거가 없다.'},
 'order': {'lead': 1, 'cuts': (1, 3), 'ans': 5,
   'sol': '감각으로 지각할 수 없는 현상을 바꾸어 주는 도구를 소개한 주어진 글 다음에는, 첫 번째 방식인 신호 '
          '증폭과 망원경의 예를 든 (A)가 온다. 이어 지각할 수 없는 신호를 관찰 가능한 것으로 바꾸는 두 번째 '
          '방식과 그 예를 든 (C)가 오고, Alternatively로 세 번째 방식을 덧붙인 (B)로 마무리된다.'},
 'summary': {
   'tmpl': 'For centuries people have built instruments that ___(A)___ signals lying beyond human '
           'senses, so that phenomena we cannot perceive become ___(B)___.',
   'ch': [('convert', 'observable'), ('convert', 'invisible'), ('ignore', 'observable'),
          ('weaken', 'measurable'), ('ignore', 'invisible')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 도구는 지각할 수 없는 신호를 증폭하거나 변환해 관찰 가능한 것으로 바꾸어 준다. '
          '2. 정답: translate·turn ... into에 대응하는 convert와, that which we can observe에 대응하는 '
          'observable이 들어간 ①이 적절하다. 3. 오답: ignore·weaken은 도구의 기능과 반대이고, invisible은 '
          '결과와 정반대이다.'},
}

# ─────────────────────────────────────────────────────────── 25년9월24번
ITEMS['25년9월24번'] = {
 'implication': {
   'phrase': 'the result of legal necessity, not evidence that animal experimentation led to medical advances',
   'ch': ['a link that exists only because the law demands it, so it proves nothing about cause',
          'a sign that the law should be changed so that fewer animals are used',
          'a warning that medical progress has slowed since the rules were introduced',
          'a hint that researchers hide the failures of their animal experiments',
          'a claim that correlation is a safer guide to truth than experiment is'],
   'ans': 1,
   'sol': '법이 모든 신약과 수술 기법을 사람에게 쓰기 전에 동물에게 시험하도록 규정하므로, 의학적 진보는 '
          '언제나 선행한 동물 실험과 상관관계를 보일 수밖에 없다. 즉 그 상관관계는 법적 요구가 만들어 낸 것일 '
          '뿐 인과의 증거가 아니라는 뜻이므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['동물 실험과 의학 발전의 상관관계는 인과관계의 증거가 되지 못한다.',
          '동물 실험은 윤리적 이유로 즉시 전면 금지되어야 한다.',
          '신약 개발 절차를 간소화해야 의학이 더 빨리 발전한다.',
          '사망률 감소의 가장 큰 원인은 위생 환경의 개선이다.',
          '임상 연구자는 동물 연구자보다 더 많은 지원을 받아야 한다.'],
   'ans': 1,
   'sol': '동물 실험 옹호자는 상관관계를 근거로 인과관계를 주장하지만, 반대자는 그 상관관계가 법적 필요에서 '
          '비롯된 것이며 임상적 발견이 더 큰 역할을 했다고 반박한다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['why the correlation between animal testing and medical progress proves little',
          'the ethical problems that arise from experimenting on living animals',
          'the legal steps that are required before a new drug reaches the market',
          'the main causes of the long-term decline in human mortality rates',
          'the growing cooperation between clinical and animal researchers'],
   'ans': 1,
   'sol': '동물 실험과 의학 발전 사이의 상관관계가 왜 인과의 근거가 될 수 없는지를 논증하는 글이므로, 주제로는 '
          '① ‘동물 실험과 의학 발전의 상관관계가 거의 아무것도 증명하지 못하는 이유’가 적절하다.',
   'tr': ['동물 실험과 의학 발전의 상관관계가 거의 아무것도 증명하지 못하는 이유',
          '살아 있는 동물을 실험하는 데서 생기는 윤리적 문제',
          '신약이 시장에 나오기까지 요구되는 법적 절차',
          '인간 사망률의 장기적 감소를 가져온 주요 원인',
          '임상 연구자와 동물 연구자 사이의 늘어나는 협력']},
 'title': {
   'ch': ['Correlation Is Not Cause: Rethinking Animal Testing',
          'A Short History of Modern Surgical Techniques',
          'How the Law Protects Animals Kept in Laboratories',
          'Clinical Trials: The Final Step Before Approval',
          'Why Mortality Fell Faster Than Doctors Expected'],
   'ans': 1,
   'sol': '동물 실험과 의학 발전의 상관관계가 법적 필요의 산물일 뿐 인과의 증거가 아니라는 반박이 글의 핵심이다. '
          '따라서 제목으로는 ① ‘상관관계는 원인이 아니다: 동물 실험을 다시 생각한다’가 가장 적절하다.',
   'tr': ['상관관계는 원인이 아니다: 동물 실험을 다시 생각한다',
          '현대 외과 기술의 짧은 역사',
          '법은 실험실의 동물을 어떻게 보호하는가',
          '임상 시험: 승인 직전의 마지막 단계',
          '사망률은 왜 의사들의 예상보다 빨리 떨어졌는가']},
 'mismatch': {
   'ch': ['Defenders of research argue that animal experimentation caused medical advancement.',
          'The law requires new drugs to be tried on animals before they are used in humans.',
          'Opponents accept the inference that the defenders draw from the correlation.',
          'Several influential physicians have offered historical evidence against the defenders.',
          'Opponents claim that clinical discoveries played a more substantial role.'],
   'ans': 3,
   'sol': '③번 선택지는 반대자가 옹호자의 추론을 받아들인다고 했는데, 지문에서는 "Opponents of research '
          'reject this inference"라고 하여 그 추론을 거부한다고 했으므로 내용과 일치하지 않는다.',
   'tr': ['연구 옹호자들은 동물 실험이 의학 발전을 가져왔다고 주장한다.',
          '법은 신약을 사람에게 쓰기 전에 동물에게 시험하도록 요구한다.',
          '반대자들은 옹호자들이 상관관계에서 이끌어 낸 추론을 받아들인다.',
          '여러 영향력 있는 의사들이 옹호자들에 반대하는 역사적 증거를 제시했다.',
          '반대자들은 임상적 발견이 더 실질적인 역할을 했다고 주장한다.']},
 'blank': {
   'target': 'we have independent reasons to expect these phenomena to be correlated',
   'ch': ['there are separate grounds that would make the two go together in any case',
          'the two events have in fact never once been observed together',
          'most researchers have misread the statistics that they collected',
          'the correlation grows steadily weaker as the sample size increases',
          'animal testing was introduced long after medicine began to advance'],
   'ans': 1,
   'sol': '빈칸 뒤에서 법이 동물 실험을 의무화하므로 모든 의학적 진보가 선행 동물 실험과 상관관계를 보일 수밖에 '
          '없다고 설명한다. 즉 인과와 무관하게 둘이 함께 나타날 별도의 이유가 있다는 뜻이므로 ①이 정답이다. '
          '②는 상관관계 자체를 부정해 논지와 어긋나고 ③·④·⑤는 근거가 없다.'},
 'order': {'lead': 1, 'cuts': (2, 5), 'ans': 4,
   'sol': '동물 실험 반대자의 주장을 소개한 주어진 글 다음에는, 옹호자의 상관관계 논증과 그에 대한 반대자의 '
          '거부를 담은 (C)가 온다. 이어 그 거부의 근거로 법적 의무 때문에 상관관계가 생긴다는 (B)가 오고, '
          'Moreover로 역사적 증거를 덧붙인 (A)로 마무리된다.'},
 'insert': {'take': 3, 'ans': 3,
   'sol': '주어진 문장은 After all로 시작하여 앞의 거부에 대한 근거를 꺼내는 문장이다. 반대자가 그 추론을 '
          '거부한다는 문장 바로 뒤이자, 법적 의무를 설명하는 Since 문장 앞인 ③이 적절하다.'},
 'summary': {
   'tmpl': 'Opponents argue that animal testing and medical progress appear together only because '
           'the law ___(A)___ such testing, so the correlation supplies no ___(B)___ that one '
           'brought about the other.',
   'ch': [('requires', 'proof'), ('requires', 'benefit'), ('forbids', 'proof'),
          ('delays', 'record'), ('forbids', 'benefit')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 법이 동물 실험을 의무화하기 때문에 상관관계가 생기며, 그것은 인과의 증거가 아니다. '
          '2. 정답: the law prescribes에 대응하는 requires, not evidence에 대응하는 proof가 들어간 ①이 '
          '적절하다. 3. 오답: forbids·delays는 법의 내용과 반대이고, benefit·record는 논점인 "증거"와 '
          '무관하다.'},
}

# ─────────────────────────────────────────────────────────── 25년9월29번
ITEMS['25년9월29번'] = {
 'implication': {
   'phrase': 'stand their ground when threatened',
   'ch': ['hold their position instead of running away at once',
          'attack the predator before it can come any closer',
          'hide themselves under trees until the danger passes',
          'take turns watching for enemies while the others rest',
          'move to a different feeding area every single day'],
   'ans': 1,
   'sol': '밑줄 친 부분은 즉각 도망치도록 프로그램된 예민한 종과 대비되는 느긋한 종의 특징을 설명하는 자리이며, '
          '바로 뒤에 필요할 때까지는 달아나지 않는다는 말이 이어진다. 따라서 곧바로 도망치지 않고 그 자리를 '
          '지킨다는 뜻이므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['위협을 느끼면 즉시 달아나는 예민한 초식동물은 가축화되기 어렵다.',
          '가젤은 비옥한 초승달 지대에서 가장 흔한 사냥감이었다.',
          '무리를 이루는 동물일수록 포식자의 공격에 더 취약하다.',
          '야생동물을 우리에 가두는 것은 윤리적으로 정당화되기 어렵다.',
          '가축화의 성공 여부는 인간의 사육 기술 수준에 달려 있다.'],
   'ans': 1,
   'sol': '예민한 종은 우리에 갇히면 공황에 빠져 죽기 때문에 가축화가 어렵고, 오랜 세월 가장 많이 사냥되어 '
          '기회가 충분했던 가젤조차 끝내 가축화되지 않았다는 내용이다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['why nervous herbivores resist being domesticated by humans',
          'the hunting methods used in the ancient Fertile Crescent',
          'the physical abilities that make gazelles hard to catch',
          'differences in the diets of large mammalian herbivores',
          'the benefits that living in a herd brings to grazing animals'],
   'ans': 1,
   'sol': '위협에 즉각 도망치는 예민한 초식동물이 왜 가축화되지 못하는지를 가젤의 예로 보여 주는 글이므로, '
          '주제로는 ① ‘예민한 초식동물이 인간의 가축화에 저항하는 이유’가 적절하다.',
   'tr': ['예민한 초식동물이 인간의 가축화에 저항하는 이유',
          '고대 비옥한 초승달 지대에서 쓰인 사냥 방법',
          '가젤을 잡기 어렵게 만드는 신체 능력',
          '대형 포유류 초식동물의 먹이의 차이',
          '무리 생활이 방목 동물에게 주는 이점']},
 'title': {
   'ch': ['Too Nervous to Tame: The Lesson of the Gazelle',
          'The Fastest Runners of the Ancient Grasslands',
          'How Fences Changed the History of Farming',
          'Why Herds Are Safer Than Living Alone',
          'Hunting and Herding: Two Ancient Skills'],
   'ans': 1,
   'sol': '가젤은 가축화할 기회가 가장 많았음에도 지나치게 예민해 끝내 가축이 되지 못했다는 글이므로, '
          '제목으로는 ① ‘길들이기엔 너무 예민한: 가젤이 주는 교훈’이 가장 적절하다.',
   'tr': ['길들이기엔 너무 예민한: 가젤이 주는 교훈',
          '고대 초원의 가장 빠른 달림꾼들',
          '울타리는 농경의 역사를 어떻게 바꾸었나',
          '무리 생활이 홀로 사는 것보다 안전한 이유',
          '사냥과 목축: 두 가지 오래된 기술']},
 'mismatch': {
   'ch': ['Some herbivore species are programmed for instant flight when they sense a threat.',
          'Slower species seek protection in herds and do not run until it is necessary.',
          'Nervous species may die of shock when they are put into an enclosure.',
          'Gazelles were successfully domesticated by the first settled peoples of the area.',
          'Gazelles can leap nearly 30 feet and run at a speed of 50 miles per hour.'],
   'ans': 4,
   'sol': '④번 선택지는 가젤이 그 지역의 첫 정착민에 의해 성공적으로 가축화되었다고 했는데, 지문에서는 '
          '"no gazelle species has ever been domesticated"라고 하여 어떤 가젤 종도 가축화된 적이 없다고 '
          '했으므로 내용과 일치하지 않는다.',
   'tr': ['어떤 초식동물 종은 위협을 감지하면 즉시 달아나도록 프로그램되어 있다.',
          '느린 종은 무리 속에서 보호를 찾고 필요해질 때까지는 달아나지 않는다.',
          '예민한 종은 우리에 갇히면 충격으로 죽을 수 있다.',
          '가젤은 그 지역의 첫 정착민에 의해 성공적으로 가축화되었다.',
          '가젤은 거의 30피트를 뛰어오르고 시속 50마일로 달릴 수 있다.']},
 'blank': {
   'target': 'the nervous species are difficult to keep in captivity',
   'ch': ['the highly strung kinds do not survive well once they are confined',
          'the larger kinds need far more food than early farmers could supply',
          'the slower kinds are always the first to be hunted by human beings',
          'the herd-living kinds lose their sense of direction inside a field',
          'the fastest kinds become tame more quickly than any other kind'],
   'ans': 1,
   'sol': '빈칸 뒤에서 우리에 넣으면 공황에 빠져 충격사하거나 울타리에 몸을 부딪쳐 죽는다고 설명하므로, '
          '빈칸에는 예민한 종이 가둬 기르기 어렵다는 내용이 와야 한다. 원문 표현을 바꾸어 쓴 ①이 정답이며, '
          '⑤는 글의 결론과 정반대이고 ②·③·④는 근거가 없다.'},
 'order': {'lead': 1, 'cuts': (2, 4), 'ans': 1,
   'sol': '대형 초식동물이 위험에 서로 다르게 반응한다는 주어진 글 다음에는, 그 두 가지 유형을 나누어 설명한 '
          '(B)가 온다. 이어 예민한 종이 왜 가둬 기르기 어려운지를 밝힌 (C)가 오고, 그 사례로 가젤을 들어 '
          '가축화 기회가 충분했음에도 실패했음을 보여 주는 (A)로 마무리된다.'},
 'insert': {'take': 5, 'ans': 5,
   'sol': '주어진 문장은 앞의 일반적 설명에 대한 구체적 사례로 가젤을 처음 언급하는 문장이다. 우리에 갇힌 '
          '예민한 종이 어떻게 되는지를 설명한 문장 바로 뒤인 ⑤에 들어가야 뒤의 가젤 이야기와 이어진다.'},
 'summary': {
   'tmpl': 'Herbivores ___(A)___ enough to panic and injure themselves inside a fence have never '
           'been tamed, which is why gazelles, despite countless opportunities, were never ___(B)___.',
   'ch': [('nervous', 'domesticated'), ('nervous', 'hunted'), ('slow', 'domesticated'),
          ('aggressive', 'hunted'), ('slow', 'studied')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 예민한 초식동물은 갇히면 공황에 빠져 죽기 때문에 가축화되지 못했고, 가젤이 그 '
          '대표적인 예이다. 2. 정답: nervous species에 대응하는 nervous, domesticated가 들어간 ①이 '
          '적절하다. 3. 오답: 가젤은 오히려 가장 많이 사냥된 종이었으므로 hunted는 사실과 어긋나고, '
          'slow·aggressive는 예민한 종의 특징이 아니다.'},
}

# ─────────────────────────────────────────────────────────── 25년9월30번
ITEMS['25년9월30번'] = {
 'implication': {
   'phrase': 'the bigger our fences',
   'ch': ['the more we shut other people out as our possessions grow',
          'the more land we buy so that we can farm it ourselves',
          'the more we invest in the safety of our public spaces',
          'the more carefully we choose the friends we keep near us',
          'the more we cooperate with the neighbours living beside us'],
   'ans': 1,
   'sol': '밑줄 친 부분은 "가진 것이 많을수록"이라는 조건 뒤에 이어지며, 사람들을 막기 위한 보안이 정교해지고 '
          '나누려는 마음은 줄어든다는 말과 나란히 놓인다. 즉 가진 것이 늘수록 타인을 더 차단하게 된다는 '
          '뜻이므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['가진 것이 많아질수록 사람들은 오히려 나누기를 꺼리게 된다.',
          '유목 부족의 생활 방식은 현대 사회에서도 유지될 수 있다.',
          '여행자에게 베푸는 환대의 방식은 문화마다 크게 다르다.',
          '협력은 자원이 풍부한 사회에서 더욱 활발하게 일어난다.',
          '안전 설비에 대한 투자는 범죄 예방에 실질적 효과가 있다.'],
   'ans': 1,
   'sol': '가진 것이 적을 때는 생존을 위해 기꺼이 나누지만, 풍족해질수록 울타리를 높이고 나누기를 꺼리며 '
          '현실과 단절된다는 내용이다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['how abundance weakens the human tendency to share',
          'the survival strategies used by nomadic tribes today',
          'the historical origins of private property and fences',
          "the effect of travel on a person's view of other cultures",
          'the reasons why security technology keeps improving'],
   'ans': 1,
   'sol': '자원이 부족할 때 발달한 나눔과 협력의 성향이 오히려 풍족할 때 약해진다는 역설을 다룬 글이므로, '
          '주제로는 ① ‘풍요가 나누려는 인간의 성향을 어떻게 약화시키는가’가 적절하다.',
   'tr': ['풍요가 나누려는 인간의 성향을 어떻게 약화시키는가',
          '오늘날 유목 부족이 사용하는 생존 전략',
          '사유 재산과 울타리의 역사적 기원',
          '여행이 타 문화에 대한 시각에 미치는 영향',
          '보안 기술이 계속 발전하는 이유']},
 'title': {
   'ch': ['The More We Own, the Less We Give',
          'Nomads: The Last Truly Free People',
          'Building Better Fences for Safer Towns',
          'Hospitality: A Skill That Can Be Taught',
          'Scarcity Is the Real Enemy of Cooperation'],
   'ans': 1,
   'sol': '많이 가질수록 울타리는 높아지고 나누려는 마음은 줄어든다는 역설이 글의 핵심이므로, 제목으로는 '
          '① ‘많이 가질수록 우리는 덜 준다’가 가장 적절하다.',
   'tr': ['많이 가질수록 우리는 덜 준다',
          '유목민: 마지막 진정한 자유인',
          '더 안전한 마을을 위한 더 나은 울타리 세우기',
          '환대: 가르칠 수 있는 기술',
          '결핍이야말로 협력의 진짜 적이다']},
 'mismatch': {
   'ch': ['People tend to be more open to sharing what they have when they have less.',
          'Some nomadic tribes share readily because doing so serves their own interest.',
          'Nomads open up their homes and give travelers food and hospitality.',
          'The writer says that people share more freely as their wealth increases.',
          'A desire for more can create a disconnection or blindness to reality.'],
   'ans': 4,
   'sol': '④번 선택지는 부가 늘수록 더 기꺼이 나눈다고 했는데, 지문에서는 "the more we have ... the less '
          'we want to share"라고 하여 많이 가질수록 나누기를 덜 원한다고 했으므로 내용과 일치하지 않는다.',
   'tr': ['사람들은 가진 것이 적을 때 자기 것을 더 기꺼이 나누는 경향이 있다.',
          '어떤 유목 부족은 그렇게 하는 것이 자신에게 이롭기 때문에 기꺼이 나눈다.',
          '유목민은 집을 열어 여행자에게 음식과 환대를 베푼다.',
          '글쓴이는 부가 늘어날수록 사람들이 더 기꺼이 나눈다고 말한다.',
          '더 많이 가지려는 욕구는 현실과의 단절이나 무감각을 만들 수 있다.']},
 'blank': {
   'target': 'their survival depends on sharing, for they know that they may be the travelers in need of food and shelter another day',
   'ch': ['staying alive requires giving, since they too may be the ones asking for help tomorrow',
          'their religion orders them to welcome every stranger who arrives at the camp',
          'they have far more food stored than their own families could possibly eat',
          'they wish to be remembered as the most generous tribe in the whole region',
          'visitors bring them news that they could not obtain in any other way'],
   'ans': 1,
   'sol': '빈칸 앞에서 그들이 단지 착해서가 아니라고 못 박았으므로, 빈칸에는 나눔이 곧 자신의 생존과 직결된다는 '
          '이유가 와야 한다. 원문 표현을 바꾸어 쓴 ①이 정답이며, ②·③·④·⑤는 모두 지문에 없는 동기이다.'},
 'order': {'lead': 1, 'cuts': (2, 4), 'ans': 2,
   'sol': '풍족해지면 나눔의 성향이 복잡해진다는 주어진 글 다음에는, 적게 가질수록 더 잘 나눈다는 일반화와 '
          '유목 부족의 예를 든 (C)가 온다. 이어 그들이 여행자에게 베푸는 모습과 그 진짜 이유를 밝힌 (A)가 '
          '오고, 반대로 많이 가질수록 울타리가 높아진다는 (B)로 마무리된다.'},
 'insert': {'take': 5, 'ans': 5,
   'sol': '주어진 문장은 Ironically로 시작하여 앞의 유목 부족 사례와 정반대되는 상황으로 전환하는 문장이다. '
          '나눔이 생존과 직결된다는 설명이 끝나는 자리이자, 더 많이 가지려는 욕구의 결과를 말하는 문장 앞인 '
          '⑤가 적절하다.'},
 'summary': {
   'tmpl': 'Those who have ___(A)___ share willingly because their survival depends on it, whereas '
           'growing wealth makes people raise higher walls and grow ___(B)___ toward others.',
   'ch': [('little', 'indifferent'), ('little', 'grateful'), ('much', 'indifferent'),
          ('enough', 'grateful'), ('much', 'generous')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 적게 가진 사람은 생존을 위해 기꺼이 나누지만, 풍족해질수록 담을 높이고 타인에게 '
          '무관심해진다. 2. 정답: When we have less에 대응하는 little, 단절과 무감각에 대응하는 indifferent가 '
          '들어간 ①이 적절하다. 3. 오답: much·enough는 나누는 쪽의 조건이 아니고, grateful·generous는 '
          '풍요의 결과와 반대이다.'},
}

# ─────────────────────────────────────────────────────────── 25년9월32번
ITEMS['25년9월32번'] = {
 'implication': {
   'phrase': 'a lack of sleep catches up with you',
   'ch': ['the sleep you have missed eventually forces itself upon you',
          'you gradually learn to work well on a very small amount of sleep',
          'your body begins to produce far more adenosine than before',
          'you start to feel sleepy at the same hour every single day',
          'your memory of the previous night slowly begins to fade'],
   'ans': 1,
   'sol': '앞 문장에서 분자 수준의 되먹임 때문에 몸이 필요로 하는 것보다 적게 자는 데 익숙해질 수 없다고 했다. '
          '따라서 밑줄 친 부분은 미뤄 둔 잠이 결국 몰려와 갚게 된다는 뜻이므로 ①이 적절하다. ②는 글의 결론과 '
          '정반대이고 ③·④·⑤는 지문에 없는 내용이다.'},
 'mainPoint': {
   'ch': ['아데노신의 분자 되먹임 때문에 부족한 잠은 결국 갚아야 한다.',
          '수면 시간을 줄이는 훈련을 하면 활동 시간을 늘릴 수 있다.',
          '수면의 질은 잠자리에 드는 시각에 따라 크게 달라진다.',
          '낮잠은 밤잠의 부족을 완전히 대체할 수 있는 수단이다.',
          '혈액 검사를 통해 개인에게 필요한 수면 시간을 알 수 있다.'],
   'ans': 1,
   'sol': '깨어 있는 동안 쌓이고 자는 동안 분해되는 아데노신이 잃어버린 잠을 기록하고 수면을 유발하며, 그런 '
          '되먹임 때문에 적게 자는 데 익숙해질 수 없다는 내용이다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['the molecular mechanism that makes lost sleep impossible to ignore',
          'the chemical differences between deep sleep and light sleep',
          'the effect of daytime activity on the quality of night sleep',
          'methods of measuring the amount of adenosine in the blood',
          'the reasons why some people need less sleep than others do'],
   'ans': 1,
   'sol': '아데노신이라는 물질을 통해 잃어버린 잠이 왜 반드시 갚아지는지를 설명하는 글이므로, 주제로는 '
          '① ‘잃어버린 잠을 무시할 수 없게 만드는 분자 수준의 기제’가 가장 적절하다.',
   'tr': ['잃어버린 잠을 무시할 수 없게 만드는 분자 수준의 기제',
          '깊은 잠과 얕은 잠의 화학적 차이',
          '낮 동안의 활동이 밤잠의 질에 미치는 영향',
          '혈액 속 아데노신의 양을 측정하는 방법',
          '어떤 사람은 왜 잠을 덜 필요로 하는가']},
 'title': {
   'ch': ['Sleep Debt Always Comes Due',
          'Adenosine: The Chemistry of Dreaming',
          'How to Train Your Body to Need Less Sleep',
          'A Short Guide to Better Sleeping Habits',
          'Why a Nap Beats a Full Night of Rest'],
   'ans': 1,
   'sol': '부족한 잠은 수면 빚으로 쌓여 결국 더 오래 자서 갚아야 한다는 내용이므로, 제목으로는 ① ‘수면 빚은 '
          '언제나 갚아야 할 때가 온다’가 가장 적절하다.',
   'tr': ['수면 빚은 언제나 갚아야 할 때가 온다',
          '아데노신: 꿈의 화학',
          '잠을 덜 필요로 하도록 몸을 훈련하는 법',
          '더 나은 수면 습관을 위한 짧은 안내',
          '낮잠이 밤새 자는 것보다 나은 이유']},
 'mismatch': {
   'ch': ['Adenosine builds up in the blood as the time spent awake increases.',
          'The body breaks down adenosine while a person is asleep.',
          'A sleep debt has to be made up by sleeping longer than normal.',
          'People can get used to sleeping less than their bodies actually need.',
          'Adenosine may be what the body uses to keep track of lost sleep.'],
   'ans': 4,
   'sol': '④번 선택지는 몸이 필요로 하는 것보다 적게 자는 데 익숙해질 수 있다고 했는데, 지문에서는 "you '
          "can't become accustomed to getting less sleep than your body needs\"라고 하여 그것이 "
          '불가능하다고 했으므로 내용과 일치하지 않는다.',
   'tr': ['아데노신은 깨어 있는 시간이 늘어남에 따라 혈액 속에 쌓인다.',
          '몸은 사람이 잠든 동안 아데노신을 분해한다.',
          '수면 빚은 평소보다 더 오래 자서 갚아야 한다.',
          '사람은 자기 몸이 필요로 하는 것보다 적게 자는 데 익숙해질 수 있다.',
          '아데노신은 몸이 잃어버린 잠을 기록하는 데 쓰는 물질일 수 있다.']},
 'blank': {
   'target': "you can't become accustomed to getting less sleep than your body needs",
   'ch': ['there is no way to train yourself to live on less rest than you actually require',
          'the amount of sleep that an adult needs falls steadily with age',
          'your body produces adenosine only when you are under heavy stress',
          'a single long night of sleep can repay any amount of sleep debt',
          'sleeping longer than usual makes you feel more tired afterwards'],
   'ans': 1,
   'sol': '빈칸 앞은 아데노신이 쌓여 수면 빚을 만든다는 설명이고, 뒤는 결국 부족한 잠이 몰려온다는 결론이다. '
          '따라서 빈칸에는 필요한 것보다 적게 자는 데 익숙해질 수 없다는 내용이 와야 하므로 ①이 정답이다. '
          '④는 수면 빚을 더 오래 자서 갚는다는 설명과 어긋나고 ②·③·⑤는 근거가 없다.'},
 'order': {'lead': 1, 'cuts': (2, 4), 'ans': 4,
   'sol': '잠을 미뤄도 결국 자게 된다는 주어진 글 다음에는, 그 원인 물질인 아데노신을 소개하고 깨어 있을 때 '
          '쌓인다고 설명한 (C)가 온다. 이어 잘 때 분해되므로 잃어버린 잠을 기록하는 물질일 수 있다는 (B)가 '
          '오고, 수면 빚과 그 결론을 담은 (A)로 마무리된다.'},
 'insert': {'take': 4, 'ans': 3,
   'sol': '주어진 문장은 Thus로 시작하여 앞의 두 사실(깨어 있을 때 쌓이고 잘 때 분해됨)에서 결론을 이끄는 '
          '문장이다. 따라서 아데노신이 분해된다는 문장 바로 뒤인 ③이 적절하다.'},
 'summary': {
   'tmpl': 'Adenosine, which ___(A)___ while you are awake and is broken down while you sleep, '
           'serves as a built-in record of lost sleep, so a sleep debt must in the end be ___(B)___.',
   'ch': [('accumulates', 'repaid'), ('accumulates', 'ignored'), ('disappears', 'repaid'),
          ('weakens', 'forgotten'), ('disappears', 'ignored')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 아데노신은 깨어 있는 동안 쌓이고 자는 동안 분해되며, 그 되먹임 때문에 수면 빚은 더 '
          '오래 자서 갚아야 한다. 2. 정답: builds up에 대응하는 accumulates, make up에 대응하는 repaid가 '
          '들어간 ①이 적절하다. 3. 오답: disappears·weakens는 축적된다는 설명과 반대이고, '
          'ignored·forgotten은 결국 갚게 된다는 결론과 어긋난다.'},
}

# ─────────────────────────────────────────────────────────── 수능36번
ITEMS['수능36번'] = {
 'implication': {
   'phrase': 'The eons shaped our brains in the opposite direction',
   'ch': ['over vast stretches of time evolution built minds that avoid contradiction',
          'human intelligence has slowly declined over the past few centuries',
          'the brain works much faster when it is given one clear single task',
          'our distant ancestors valued emotion far more highly than reason',
          'modern people think in ways their ancestors would not recognize'],
   'ans': 1,
   'sol': '앞 문장은 상반된 두 생각을 동시에 품는 능력이 일류 지성의 시험이라는 피츠제럴드의 견해이고, 뒤 '
          '문장은 확증 편향이 모순과 마주하기를 체계적으로 피하는 방식이라는 설명이다. 즉 오랜 진화가 뇌를 '
          '그 반대 방향, 곧 모순을 피하도록 만들었다는 뜻이므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['확증 편향 때문에 뇌는 자신의 믿음과 어긋나는 증거를 배척한다.',
          '상반된 두 생각을 동시에 품는 것이 지성의 유일한 척도이다.',
          '부족의 전통은 외부 문화와 접촉하면 빠르게 사라진다.',
          '극심한 슬픔은 시간이 지나면 자연스럽게 치유되기 마련이다.',
          '역사 기록은 당사자의 증언보다 언제나 객관적이다.'],
   'ans': 1,
   'sol': '확증 편향은 믿음을 확인해 주는 증거를 과대평가하고 반박하는 증거를 무시하게 만들며, 크로 부족의 '
          '증언은 그 극단적 사례라는 내용이다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['the way the mind rejects evidence that contradicts its own feelings',
          'the historical causes of the destruction of the Crow culture',
          'the gap between literary and scientific views of intelligence',
          'the process by which a language disappears from a community',
          'the influence of buffalo hunting on the economy of the plains'],
   'ans': 1,
   'sol': '확증 편향의 정의와 작동 방식을 설명하고 크로 부족의 증언을 그 극단적 예로 든 글이므로, 주제로는 '
          '① ‘마음이 자신의 감정에 어긋나는 증거를 물리치는 방식’이 가장 적절하다.',
   'tr': ['마음이 자신의 감정에 어긋나는 증거를 물리치는 방식',
          '크로 문화가 파괴된 역사적 원인',
          '지성에 대한 문학적 관점과 과학적 관점의 차이',
          '한 언어가 공동체에서 사라져 가는 과정',
          '들소 사냥이 대평원의 경제에 미친 영향']},
 'title': {
   'ch': ['A Mind That Refuses What It Cannot Bear',
          'The Crow Tribe: A Complete History',
          'Two Opposed Ideas: The Real Test of Genius',
          'How Emotion Improves Our Memory of Facts',
          'When the Buffalo Returned to the Plains'],
   'ans': 1,
   'sol': '감정이 너무 강해서 일상이 계속되고 있다는 증거조차 뇌가 물리쳤다는 내용이 결론이므로, 제목으로는 '
          '① ‘견딜 수 없는 것을 거부하는 마음’이 가장 적절하다.',
   'tr': ['견딜 수 없는 것을 거부하는 마음',
          '크로 부족: 완전한 역사',
          '상반된 두 생각: 천재성의 진짜 시험',
          '감정은 어떻게 사실에 대한 기억을 향상시키는가',
          '들소가 대평원으로 돌아왔을 때']},
 'mismatch': {
   'ch': ['Fitzgerald saw holding two opposed ideas at once as a test of intelligence.',
          'Confirmation bias is the way the mind avoids confronting contradiction.',
          'Plenty Coups reported that after the buffalo went away nothing happened.',
          'Plenty Coups was the only Crow member to describe despair in that way.',
          'The emotion was strong enough to make the brain reject contrary evidence.'],
   'ans': 4,
   'sol': '④번 선택지는 그런 식으로 절망을 표현한 사람이 Plenty Coups뿐이라고 했는데, 지문에서는 "He was '
          'not alone in describing the depth of despair as the end of history"라고 하여 다른 크로 전사도 '
          '같은 말을 했다고 했으므로 내용과 일치하지 않는다.',
   'tr': ['피츠제럴드는 상반된 두 생각을 동시에 품는 것을 지성의 시험으로 보았다.',
          '확증 편향은 마음이 모순과 마주하기를 피하는 방식이다.',
          'Plenty Coups는 들소가 사라진 뒤 아무 일도 일어나지 않았다고 말했다.',
          '그런 식으로 절망을 표현한 크로 부족 사람은 Plenty Coups뿐이었다.',
          '그 감정은 뇌가 반대되는 증거를 물리칠 만큼 강했다.']},
 'blank': {
   'target': 'overvaluing evidence that confirms what we already think or feel and undervaluing or simply disregarding evidence that refutes it',
   'ch': ['giving too much weight to what agrees with us and too little to what does not',
          'gathering as much information as possible before making any judgment',
          'remembering pleasant events far more vividly than painful ones',
          'trusting the testimony of witnesses rather than written records',
          'changing our beliefs whenever fresh evidence happens to appear'],
   'ans': 1,
   'sol': '빈칸 문장은 마음이 모순을 피하는 구체적인 방식을 설명하는 자리이다. 따라서 자기 생각을 확인해 주는 '
          '증거는 과대평가하고 반박하는 증거는 무시한다는 내용이 와야 하므로 ①이 정답이다. ②·⑤는 확증 편향과 '
          '정반대이고 ③·④는 지문의 논점이 아니다.'},
 'order': {'lead': 2, 'cuts': (2, 5), 'ans': 5,
   'sol': '피츠제럴드의 견해와 그 반대 방향으로 형성된 뇌가 주어진 글이다. 다음으로 확증 편향의 정의와 작동 '
          '방식을 밝힌 (A)가 오고, 그 극단적 사례로 크로 부족의 증언을 소개한 (C)가 이어지며, 다른 전사의 '
          '증언과 그에 대한 해석을 담은 (B)로 마무리된다.'},
 'insert': {'take': 4, 'ans': 3,
   'sol': '주어진 문장은 앞의 설명(this)에 대한 극단적이고 비극적인 사례를 예고하는 문장이다. 확증 편향의 '
          '작동 방식을 설명한 문장 바로 뒤이자, Plenty Coups의 증언이 시작되는 자리 앞인 ③이 적절하다.'},
 'summary': {
   'tmpl': 'Confirmation bias leads the mind to ___(A)___ whatever contradicts what it feels, and '
           'the Crow testimony shows that grief can make this refusal so complete that ordinary '
           'life itself seems to have ___(B)___.',
   'ch': [('dismiss', 'stopped'), ('dismiss', 'improved'), ('welcome', 'stopped'),
          ('record', 'continued'), ('welcome', 'improved')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 확증 편향은 반박하는 증거를 무시하게 만들며, 크로 부족은 슬픔이 너무 커서 일상이 '
          '계속된다는 증거조차 받아들이지 못했다. 2. 정답: disregarding에 대응하는 dismiss와, "After this '
          'nothing happened"에 대응하는 stopped가 들어간 ①이 적절하다. 3. 오답: welcome·record는 확증 '
          '편향의 작동과 반대이고, improved·continued는 증언의 내용과 어긋난다.'},
}

# ─────────────────────────────────────────────────────────── 22년9월22번 (4문장·문장삽입 제외)
ITEMS['22년9월22번'] = {
 'implication': {
   'phrase': 'When Too Much of a Good Thing May Be Bad',
   'ch': ['even a helpful thing can do harm when there is too much of it',
          'decoration should be removed from every classroom wall at once',
          'children learn best when they are given complete freedom',
          'good teachers rarely need any teaching materials at all',
          'studies of very young children are difficult to carry out well'],
   'ans': 1,
   'sol': '연구 제목은 장식이라는 좋은 것도 지나치면 해로울 수 있다는 뜻이며, 뒤이어 지나친 장식이 주의를 '
          '흩뜨리고 학업 성취를 떨어뜨린다는 결과가 제시된다. 따라서 ①이 적절하다. ②는 글이 균형을 강조한 '
          '점과 어긋나고 ③·④·⑤는 지문에 없는 내용이다.'},
 'mainPoint': {
   'ch': ['교실 장식은 지나치지도 부족하지도 않은 균형점을 찾아야 한다.',
          '어린이의 학업 성취는 교실의 크기에 크게 좌우된다.',
          '시각 자료는 어린이의 집중력을 높이는 가장 좋은 수단이다.',
          '교실 환경보다 교사의 수업 방식이 학습에 더 중요하다.',
          '어린이는 자기 작품으로 교실을 꾸밀 때 성취감을 느낀다.'],
   'ans': 1,
   'sol': '지나친 장식은 주의를 흩뜨려 성취를 떨어뜨리고, 장식이 적으면 아이들이 덜 산만해져 더 잘 배운다는 '
          '연구를 소개한 뒤, 과도한 장식과 완전한 부재 사이의 균형을 찾는 것이 어른의 몫이라고 결론짓는다. '
          '따라서 ①이 요지이다.'},
 'topic': {
   'ch': ["the need to balance classroom decoration for young children's attention",
          "the effect of classroom lighting on students' academic results",
          'methods of measuring the cognitive performance of young children',
          'the value of letting children decorate their own classrooms',
          'the growing cost of preparing visual materials for lessons'],
   'ans': 1,
   'sol': '교실 장식의 양이 어린이의 주의와 학습에 미치는 영향을 다루며 균형을 강조하는 글이므로, 주제로는 '
          '① ‘어린이의 주의를 위해 교실 장식의 균형을 잡을 필요성’이 가장 적절하다.',
   'tr': ['어린이의 주의를 위해 교실 장식의 균형을 잡을 필요성',
          '교실 조명이 학생의 학업 결과에 미치는 영향',
          '어린이의 인지 수행을 측정하는 방법',
          '아이들이 자기 교실을 직접 꾸미게 하는 것의 가치',
          '수업용 시각 자료 준비 비용의 증가']},
 'title': {
   'ch': ['Too Much on the Walls Can Cost Attention',
          'Bare Classrooms Make the Happiest Children',
          'How to Decorate a Whole Classroom in One Day',
          'Why Young Children Learn Faster Than Adults',
          'Colors and Memory: A Surprising Connection'],
   'ans': 1,
   'sol': '벽에 장식이 지나치면 어린이의 주의가 흩어져 학습에 손해가 된다는 내용이므로, 제목으로는 ① ‘벽이 '
          '너무 화려하면 주의력을 잃는다’가 가장 적절하다. ②는 완전한 부재도 답이 아니라는 결론과 어긋난다.',
   'tr': ['벽이 너무 화려하면 주의력을 잃는다',
          '텅 빈 교실이 아이들을 가장 행복하게 한다',
          '교실 전체를 하루 만에 꾸미는 법',
          '어린이가 어른보다 빨리 배우는 이유',
          '색과 기억: 놀라운 연결 고리']},
 'mismatch': {
   'ch': ['The study was carried out by a university located in Pittsburgh.',
          'Visually overstimulated children have great difficulty concentrating.',
          'Children in less decorated rooms spend more time on their activities.',
          'The writer concludes that all decoration should be removed from classrooms.',
          "Too much decoration directly affects children's cognitive performance."],
   'ans': 4,
   'sol': '④번 선택지는 교실에서 장식을 모두 없애야 한다고 결론짓는다고 했는데, 지문에서는 "find the right '
          'balance between excessive decoration and the complete absence of it"이라고 하여 균형을 찾아야 '
          '한다고 했으므로 내용과 일치하지 않는다.',
   'tr': ['그 연구는 피츠버그에 있는 한 대학에서 수행되었다.',
          '시각적으로 과도한 자극을 받은 아이들은 집중하는 데 큰 어려움을 겪는다.',
          '장식이 적은 교실의 아이들은 활동에 더 많은 시간을 쓴다.',
          '글쓴이는 교실에서 모든 장식을 없애야 한다고 결론짓는다.',
          '지나친 장식은 아이들의 인지 수행에 직접적으로 영향을 미친다.']},
 'blank': {
   'target': 'to find the right balance between excessive decoration and the complete absence of it',
   'ch': ['to strike a middle point between overdoing the display and leaving the walls bare',
          'to replace all wall posters with digital screens in every classroom',
          'to let the children themselves decide how their classroom should look',
          'to repeat the same study with older students in secondary schools',
          'to reduce the number of children who share a single classroom'],
   'ans': 1,
   'sol': '지나친 장식과 장식이 거의 없는 경우의 결과를 모두 제시한 뒤 결론을 내리는 자리이므로, 빈칸에는 그 '
          '둘 사이의 균형을 찾는다는 내용이 와야 한다. 원문 표현을 바꾸어 쓴 ①이 정답이며, 나머지는 모두 '
          '글에서 제시하지 않은 방안이다.'},
 'order': {'lead': 1, 'cuts': (1, 2), 'ans': 4,
   'sol': '지나친 장식이 어린이의 주의를 흩뜨린다는 연구를 소개한 주어진 글 다음에는, 그 결과 집중이 어려워져 '
          '성취가 떨어진다는 (C)가 온다. 이어 On the other hand로 장식이 적을 때의 결과를 대비한 (B)가 오고, '
          'So로 시작하여 균형을 찾아야 한다는 결론인 (A)로 마무리된다.'},
 'summary': {
   'tmpl': 'Because heavy classroom decoration ___(A)___ young children and lowers their results, '
           'teachers should aim at a ___(B)___ between too much display and none at all.',
   'ch': [('distracts', 'balance'), ('distracts', 'contrast'), ('motivates', 'balance'),
          ('calms', 'choice'), ('motivates', 'contrast')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 지나친 장식은 주의를 흩뜨려 성취를 낮추므로 과도함과 부재 사이의 균형이 필요하다. '
          '2. 정답: a source of distraction에 대응하는 distracts, the right balance에 대응하는 balance가 '
          '들어간 ①이 적절하다. 3. 오답: motivates·calms는 지나친 장식의 효과와 반대이고, contrast·choice는 '
          '결론의 핵심이 아니다.'},
}

# ─────────────────────────────────────────────────────────── 22년9월23번 (5문장·문장삽입 제외)
ITEMS['22년9월23번'] = {
 'implication': {
   'phrase': 'evolution smiled upon those with a strong need to belong',
   'ch': ['natural selection favoured individuals who wanted to be part of a group',
          'evolution rewarded those who were able to live entirely on their own',
          'friendly people tend to be much happier than unfriendly people are',
          'early humans chose their leaders by how kind those leaders were',
          'modern society values cooperation far more than it values competition'],
   'ans': 1,
   'sol': '뒤 문장에서 생존과 번식이 자연 선택의 성공 기준이며 관계를 맺는 것이 둘 다에 유용하다고 했다. '
          '따라서 밑줄 친 부분은 소속 욕구가 강한 개체가 자연 선택에서 유리했다는 뜻이므로 ①이 적절하다. '
          '②는 정반대이고 ③·④·⑤는 지문에 없는 내용이다.'},
 'mainPoint': {
   'ch': ['소속 욕구가 강한 개체가 생존과 번식에 유리해 자연 선택되었다.',
          '집단생활은 자원 경쟁을 심화시켜 갈등을 키우는 경향이 있다.',
          '인간의 번식 성공률은 양육자의 수와 관계없이 결정된다.',
          '효율적인 분업은 현대 조직 운영의 가장 중요한 원리이다.',
          '포식자를 쫓는 데에는 집단보다 개체의 민첩성이 중요하다.'],
   'ans': 1,
   'sol': '집단은 자원을 나누고 아픈 구성원을 돌보며 포식자를 쫓는 등 생존에 기여하고, 소속감은 짝짓기와 양육을 '
          '도와 번식에도 유리하다는 내용이다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['the evolutionary advantages of a strong need to belong',
          'the ways in which early humans divided tasks within a group',
          'the conflicts that arise when groups compete for resources',
          'the role that parents play in the education of young children',
          'the essential difference between natural and sexual selection'],
   'ans': 1,
   'sol': '소속 욕구가 생존과 번식 양쪽에서 어떻게 유리하게 작용했는지를 설명하는 글이므로, 주제로는 '
          '① ‘강한 소속 욕구가 지니는 진화적 이점’이 가장 적절하다.',
   'tr': ['강한 소속 욕구가 지니는 진화적 이점',
          '초기 인류가 집단 안에서 일을 나눈 방식',
          '집단이 자원을 두고 경쟁할 때 생기는 갈등',
          '어린 자녀 교육에서 부모가 하는 역할',
          '자연 선택과 성 선택의 본질적 차이']},
 'title': {
   'ch': ['Why We Are Built to Belong',
          'Alone but Strong: The Power of Independence',
          'How Groups Divide Their Work Most Efficiently',
          'Predators and Prey: An Endless Contest',
          'Choosing a Mate: What Really Matters'],
   'ans': 1,
   'sol': '소속 욕구가 강한 개체가 생존과 번식에서 유리했기 때문에 진화가 그것을 선택했다는 글이므로, '
          '제목으로는 ① ‘우리는 왜 소속되도록 만들어졌는가’가 가장 적절하다.',
   'tr': ['우리는 왜 소속되도록 만들어졌는가',
          '홀로, 그러나 강하게: 독립의 힘',
          '집단은 어떻게 가장 효율적으로 일을 나누는가',
          '포식자와 먹이: 끝없는 겨루기',
          '짝을 고르기: 정말 중요한 것은 무엇인가']},
 'mismatch': {
   'ch': ['Survival and reproduction are the criteria of success by natural selection.',
          'Groups can share resources and care for members who have fallen sick.',
          'When an individual and a group want the same resource, the individual usually wins.',
          'Belongingness can bring potential mates into contact with each other.',
          'Children are much more likely to survive if they have more than one caregiver.'],
   'ans': 3,
   'sol': '③번 선택지는 개체와 집단이 같은 자원을 원할 때 대개 개체가 이긴다고 했는데, 지문에서는 "the group '
          'will generally prevail"이라고 하여 대개 집단이 이긴다고 했으므로 내용과 일치하지 않는다.',
   'tr': ['생존과 번식은 자연 선택에 의한 성공의 기준이다.',
          '집단은 자원을 나누고 병든 구성원을 돌볼 수 있다.',
          '개체와 집단이 같은 자원을 원할 때는 대개 개체가 이긴다.',
          '소속감은 잠재적인 짝들을 서로 만나게 해 줄 수 있다.',
          '아이들은 양육자가 한 명보다 많을 때 살아남을 가능성이 훨씬 크다.']},
 'blank': {
   'target': 'if an individual and a group want the same resource, the group will generally prevail',
   'ch': ['when one person and a group seek the very same thing, the group usually wins',
          'when resources grow scarce, most groups tend to break apart very quickly',
          'when a group becomes too large, its members gradually stop cooperating',
          'when people live alone, they use up far fewer resources than groups do',
          'when parents separate, their children soon learn to be independent'],
   'ans': 1,
   'sol': '빈칸 뒤에서 그러므로 자원 경쟁이 소속 욕구를 특히 유리하게 만든다고 했으므로, 빈칸에는 자원을 두고 '
          '다툴 때 집단이 개체를 이긴다는 내용이 와야 한다. 따라서 원문을 바꾸어 쓴 ①이 정답이다. ②·③은 집단의 '
          '이점을 부정하고 ④·⑤는 논점과 무관하다.'},
 'order': {'lead': 1, 'cuts': (1, 3), 'ans': 5,
   'sol': '소속 욕구가 강한 개체가 진화적으로 선택되었다는 주어진 글 다음에는, 생존과 번식이 성공의 기준이며 '
          '관계 형성이 둘 다에 유용하다는 (A)가 온다. 이어 집단이 생존에 기여하는 방식과 자원 경쟁에서의 '
          '이점을 설명한 (C)가 오고, 번식 면에서의 이점을 덧붙인 (B)로 마무리된다.'},
 'summary': {
   'tmpl': 'Natural selection favoured a strong need to belong because group life ___(A)___ the '
           'chances of staying alive and at the same time ___(B)___ successful reproduction.',
   'ch': [('raised', 'supported'), ('raised', 'prevented'), ('lowered', 'supported'),
          ('measured', 'delayed'), ('lowered', 'prevented')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 집단생활은 생존 가능성을 높이고 번식에도 유리하게 작용했기 때문에 소속 욕구가 '
          '선택되었다. 2. 정답: contribute to survival에 대응하는 raised, promote reproduction에 대응하는 '
          'supported가 들어간 ①이 적절하다. 3. 오답: lowered·prevented·delayed는 모두 집단생활의 이점과 '
          '반대되는 뜻이다.'},
}

# ─────────────────────────────────────────────────────────── 22년9월24번 (5문장·문장삽입 제외)
ITEMS['22년9월24번'] = {
 'implication': {
   'phrase': 'take those roads less travelled',
   'ch': ['choose the paths that most other people avoid taking',
          'travel to places that lie far away from your own home',
          'walk to work instead of using public transport every day',
          'follow the advice of the people who are older than you',
          'study the subjects that very few schools actually teach'],
   'ans': 1,
   'sol': '앞 문장에서 사람들이 미지의 것에 대한 두려움 때문에 안전지대에만 머문다고 했고, 밑줄 친 부분은 그럴 '
          '용기가 있는 사람들이 큰 보상을 얻는다는 맥락에 놓인다. 즉 남들이 가지 않는 길을 택한다는 뜻이므로 '
          '①이 적절하다.'},
 'mainPoint': {
   'ch': ['안전지대에만 머무르지 말고 과감한 선택을 할 줄 알아야 한다.',
          '위험을 무릅쓴 결정은 대부분 실패로 끝나기 마련이다.',
          '성공한 사람들은 대개 신중하고 조심스러운 성격을 지닌다.',
          '잠재력은 타고나는 것이므로 노력으로 바꾸기 어렵다.',
          '주변 사람의 조언을 따르는 것이 실패를 줄이는 길이다.'],
   'ans': 1,
   'sol': '안전지대에만 머무르면 더 큰 것을 이룰 기회를 놓치며, 지나치게 조심하면 잠재력의 최고 수준에 이르지 '
          '못한다고 하면서 과감한 결정을 배우라고 권한다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ["the need to take bold risks in order to reach one's full potential",
          'the psychological causes of the human fear of the unknown',
          'the ways in which successful people plan their careers',
          'the danger of making decisions without enough information',
          'the value of learning from the mistakes of other people'],
   'ans': 1,
   'sol': '안전지대를 벗어나 과감한 결정을 내려야 잠재력을 온전히 발휘할 수 있다는 글이므로, 주제로는 '
          '① ‘자신의 잠재력에 이르기 위해 과감한 위험을 감수할 필요성’이 가장 적절하다.',
   'tr': ['자신의 잠재력에 이르기 위해 과감한 위험을 감수할 필요성',
          '미지의 것에 대한 인간의 두려움이 지닌 심리적 원인',
          '성공한 사람들이 자신의 경력을 계획하는 방식',
          '충분한 정보 없이 결정을 내리는 것의 위험',
          '다른 사람의 실수에서 배우는 일의 가치']},
 'title': {
   'ch': ['Step Out of the Safe Zone to Grow',
          'Careful Planning Always Beats Blind Courage',
          'Why Most Bold Decisions End in Failure',
          'Follow the Crowd and You Will Stay Safe',
          'Talent Alone Decides How Far You Can Go'],
   'ans': 1,
   'sol': '안전지대에 머물면 잠재력을 다 펼치지 못하므로 남들이 가지 않는 길을 택하라는 글이다. 따라서 '
          '제목으로는 ① ‘성장하려면 안전지대 밖으로 나서라’가 가장 적절하다.',
   'tr': ['성장하려면 안전지대 밖으로 나서라',
          '신중한 계획은 언제나 맹목적인 용기를 이긴다',
          '대담한 결정 대부분이 실패로 끝나는 이유',
          '다수를 따르면 안전하게 지낼 수 있다',
          '재능만이 당신이 얼마나 멀리 갈지 결정한다']},
 'mismatch': {
   'ch': ['Many people operate only along the safe zones and miss great opportunities.',
          'A fear of the unknown is what keeps people inside their safe zones.',
          'Being overcautious can prevent you from reaching your greatest potential.',
          'The writer advises readers to take only the chances that others have taken.',
          'Brave people can derive major satisfaction from their courageous moves.'],
   'ans': 4,
   'sol': '④번 선택지는 남들이 이미 택한 기회만 잡으라고 조언한다고 했는데, 지문에서는 "take those chances '
          'that many people around you will not take"라고 하여 남들이 택하지 않는 기회를 잡으라고 했으므로 '
          '내용과 일치하지 않는다.',
   'tr': ['많은 사람이 안전지대에서만 움직이다가 큰 기회를 놓친다.',
          '미지의 것에 대한 두려움이 사람들을 안전지대에 머물게 한다.',
          '지나치게 조심하면 가장 높은 수준의 잠재력에 이르지 못할 수 있다.',
          '글쓴이는 남들이 이미 택한 기회만 잡으라고 조언한다.',
          '용감한 사람들은 자신의 과감한 행동에서 큰 만족을 얻을 수 있다.']},
 'blank': {
   'target': 'your success will flow from those bold decisions that you will take along the way',
   'ch': ['what you achieve will grow out of the daring choices you make along the road',
          'the people around you will finally admit that they had been mistaken',
          'your family will be the first to benefit from your careful planning',
          'every risk that you take will be repaid within a very short time',
          'luck plays a far larger part in success than most people will admit'],
   'ans': 1,
   'sol': '빈칸 앞에서 주위 사람들이 잡지 않는 기회를 잡는 법을 배우라고 했으므로, 빈칸에는 그 이유로 성공이 '
          '그런 과감한 결정에서 비롯된다는 내용이 와야 한다. 원문 표현을 바꾸어 쓴 ①이 정답이며, ②·③·④·⑤는 '
          '지문에 근거가 없다.'},
 'order': {'lead': 1, 'cuts': (1, 3), 'ans': 1,
   'sol': '안전지대에만 머물러 기회를 놓친다는 주어진 글 다음에는, 그 이유가 미지의 것에 대한 두려움임을 밝힌 '
          '(B)가 온다. 이어 용기 있는 사람이 얻는 보상과 지나친 신중함의 대가를 대비한 (C)가 오고, 그러므로 '
          '과감한 결정을 배우라는 결론인 (A)로 마무리된다.'},
 'summary': {
   'tmpl': 'People who stay inside their ___(A)___ out of fear of the unknown never reach their '
           'full potential, so real success calls for the courage to make ___(B)___ choices.',
   'ch': [('comfort zones', 'bold'), ('comfort zones', 'cautious'), ('social groups', 'bold'),
          ('daily routines', 'familiar'), ('social groups', 'cautious')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 안전지대에만 머물면 잠재력을 다 펼치지 못하므로 과감한 결정을 내려야 한다. '
          '2. 정답: safe zones에 대응하는 comfort zones, bold decisions에 대응하는 bold가 들어간 ①이 '
          '적절하다. 3. 오답: cautious·familiar는 글의 조언과 정반대이고, social groups는 안전지대의 의미가 '
          '아니다.'},
}

# ─────────────────────────────────────────────────────────── 22년9월29번 (5문장·문장삽입 제외)
ITEMS['22년9월29번'] = {
 'implication': {
   'phrase': 'we have effectively domesticated ourselves',
   'ch': ['we now live in the tame, protected conditions we made for ourselves',
          'we have learned to keep far more animals than our ancestors did',
          'we have become physically stronger than earlier human beings were',
          'we depend on machines for almost every task that we perform',
          'we no longer need to cooperate with the people living around us'],
   'ans': 1,
   'sol': '밑줄 뒤에서 즉각적인 죽음을 피하는 일부터 집을 짓고 먹을 것을 구하는 일까지 생존 과제가 사회에 '
          '맡겨졌다고 했고, 이어 가축이 야생 근연종보다 작다는 사실이 언급된다. 즉 스스로 만든 안전한 환경 '
          '속에서 길들여진 상태로 산다는 뜻이므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['뇌가 작아진 것은 어리석어진 것이 아니라 배선이 달라진 결과일 수 있다.',
          '뇌의 크기는 지능을 재는 가장 믿을 만한 지표이다.',
          '인류는 포식자를 피하기 위해 집단생활을 시작하게 되었다.',
          '가축은 야생 근연종보다 수명이 길고 번식률이 높다.',
          '현대인의 생존 능력은 조상보다 전반적으로 뛰어나다.'],
   'ans': 1,
   'sol': '인간의 뇌가 약 10퍼센트 줄어든 이유를 자기 가축화에서 찾은 뒤, 뇌 크기가 지능의 지표는 아니며 오늘날의 '
          '뇌는 다르게, 어쩌면 더 효율적으로 배선되었을 수 있다고 결론짓는다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['why the human brain has grown smaller without becoming less capable',
          'the process by which wild animals were first domesticated',
          'the dangers that ancient humans faced from large predators',
          'the relationship between body height and life expectancy',
          'the methods used to measure the size of ancient human skulls'],
   'ans': 1,
   'sol': '뇌가 작아진 원인과 그것이 지능 저하를 뜻하지 않는 이유를 설명하는 글이므로, 주제로는 ① ‘인간의 뇌가 '
          '능력을 잃지 않은 채 작아진 이유’가 가장 적절하다.',
   'tr': ['인간의 뇌가 능력을 잃지 않은 채 작아진 이유',
          '야생 동물이 처음 가축화된 과정',
          '고대 인류가 큰 포식자에게서 겪은 위험',
          '신장과 기대 수명 사이의 관계',
          '고대 두개골의 크기를 측정하는 데 쓰인 방법']},
 'title': {
   'ch': ['Smaller Brains, Not Duller Minds',
          'How Predators Made Our Ancestors Clever',
          'The Domestication of Animals: A Short Story',
          'Why Modern People Keep Growing Taller',
          'Measuring Intelligence: An Impossible Task'],
   'ans': 1,
   'sol': '뇌가 작아졌다고 해서 더 어리석어진 것은 아니며 다르게 배선되었을 뿐이라는 결론이므로, 제목으로는 '
          '① ‘더 작아진 뇌, 그러나 둔해지지 않은 정신’이 가장 적절하다.',
   'tr': ['더 작아진 뇌, 그러나 둔해지지 않은 정신',
          '포식자는 어떻게 우리 조상을 영리하게 만들었나',
          '동물 가축화의 짧은 이야기',
          '현대인이 계속 키가 커지는 이유',
          '지능 측정: 불가능한 과제']},
 'mismatch': {
   'ch': ['The human brain has shrunk in mass by about 10 percent since its peak.',
          'Ancient humans had to keep their wits about them at all times to stay alive.',
          'Many of the tasks of survival have been outsourced to the wider society.',
          'Domestic animals are generally larger than their wild relatives.',
          'Brain size is not necessarily an indicator of human intelligence.'],
   'ans': 4,
   'sol': '④번 선택지는 가축이 야생 근연종보다 대체로 크다고 했는데, 지문에서는 "domestic animals ... are '
          'generally smaller than their wild cousins"라고 하여 더 작다고 했으므로 내용과 일치하지 않는다.',
   'tr': ['인간의 뇌는 정점을 찍은 이후 질량이 약 10퍼센트 줄어들었다.',
          '고대 인류는 살아남기 위해 늘 정신을 바짝 차려야 했다.',
          '생존을 위한 여러 과제가 더 넓은 사회로 넘겨졌다.',
          '가축은 야생 근연종보다 대체로 몸집이 크다.',
          '뇌의 크기가 반드시 인간 지능의 지표인 것은 아니다.']},
 'blank': {
   'target': 'our brains today are wired up differently, and perhaps more efficiently, than those of our ancestors',
   'ch': ['our minds are simply organized in another and possibly better way than theirs were',
          'our ancestors would be quite unable to survive in the modern world',
          'our intelligence will keep falling as long as society protects us',
          'our brains will soon return to the size that they once used to be',
          'our memory has improved even as our brains have grown smaller'],
   'ans': 1,
   'sol': '빈칸 앞에서 뇌 크기가 지능의 지표는 아니라고 못 박았으므로, 빈칸에는 지능이 낮아진 것이 아니라 배선이 '
          '달라졌을 뿐이라는 내용이 와야 한다. 원문을 바꾸어 쓴 ①이 정답이며, ③은 앞 문장과 정면으로 어긋나고 '
          '②·④·⑤는 지문에 근거가 없다.'},
 'order': {'lead': 1, 'cuts': (1, 3), 'ans': 2,
   'sol': '인간의 뇌가 작아졌다는 사실을 제시한 주어진 글 다음에는, 그 가능한 이유로 과거의 위험한 환경을 든 '
          '(C)가 온다. 이어 오늘날 스스로 길들여져 생존 과제를 사회에 넘겼고 몸집도 작아졌다는 (A)가 오고, '
          '그것이 지능 저하를 뜻하지는 않는다는 결론인 (B)로 마무리된다.'},
 'summary': {
   'tmpl': 'Because humans have ___(A)___ themselves and handed many survival tasks over to '
           'society, their brains have grown smaller, which may point not to less intelligence but '
           'to a more ___(B)___ organization.',
   'ch': [('domesticated', 'efficient'), ('domesticated', 'fragile'), ('isolated', 'efficient'),
          ('endangered', 'rigid'), ('isolated', 'fragile')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 인간은 스스로를 가축화해 생존 과제를 사회에 맡겼고, 그 결과 뇌가 작아졌지만 이는 '
          '더 효율적인 배선을 뜻할 수 있다. 2. 정답: domesticated ourselves와 more efficiently에 각각 '
          '대응하는 ①이 적절하다. 3. 오답: isolated·endangered는 사회에 의존한다는 내용과 어긋나고, '
          'fragile·rigid는 결론의 방향과 반대이다.'},
}

# ─────────────────────────────────────────────────────────── 22년9월30번
ITEMS['22년9월30번'] = {
 'implication': {
   'phrase': 'it is your body that has the intelligence to regain health, and not the herbs',
   'ch': ["recovery comes from the body's own capacity rather than from the plants",
          'herbs work only when they are taken in very large amounts',
          'doctors understand the human body better than patients ever will',
          'the mind can be trained to control physical pain completely',
          'traditional remedies ought to be tested in modern laboratories'],
   'ans': 1,
   'sol': '앞에서 약초가 효과 있어 보이는 이유가 혈액 순환 증가와 위약 효과일 뿐이라고 설명했고, 뒤에서는 약초가 '
          '몸을 낫게 할 지능을 가질 수 없다고 반문한다. 즉 건강을 되찾는 힘은 약초가 아니라 몸 자체에 있다는 '
          '뜻이므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['약초가 병을 고친다는 믿음은 근거가 없으며 회복의 주체는 몸 자체이다.',
          '약초는 혈액 순환을 개선해 만성 질환을 예방하는 데 효과적이다.',
          '위약 효과는 실제 치료 효과와 구별하기가 매우 어렵다.',
          '전통 의학은 현대 의학의 한계를 보완할 수 있는 대안이다.',
          '건강을 되찾으려면 무엇보다 규칙적인 운동이 필요하다.'],
   'ans': 1,
   'sol': '특정 약초가 특정 장기를 낫게 한다는 통념은 비과학적이며, 효과처럼 보이는 것은 혈액 순환 증가나 위약 '
          '효과일 뿐 회복의 주체는 몸이라는 내용이다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['the groundlessness of the belief that herbs themselves cure disease',
          'the chemical process by which herbs increase blood circulation',
          'the role of the placebo effect in modern medical treatment',
          'the historical development of herbal medicine in the East',
          'the safest ways of taking herbs together with prescribed medicine'],
   'ans': 1,
   'sol': '약초가 스스로 병을 고친다는 믿음이 왜 근거가 없는지를 논증하는 글이므로, 주제로는 ① ‘약초 자체가 '
          '병을 고친다는 믿음의 무근거함’이 가장 적절하다.',
   'tr': ['약초 자체가 병을 고친다는 믿음의 무근거함',
          '약초가 혈액 순환을 증가시키는 화학적 과정',
          '현대 의학 치료에서 위약 효과가 하는 역할',
          '동양에서 약초 의학이 발전해 온 역사',
          '약초를 처방약과 함께 복용하는 가장 안전한 방법']},
 'title': {
   'ch': ['Herbs Don’t Heal You ― Your Body Does',
          'The Placebo Effect: Medicine Without Medicine',
          'Ancient Herbs for Modern Diseases',
          'How Blood Circulation Shapes Your Health',
          'Why Doctors Distrust Every New Remedy'],
   'ans': 1,
   'sol': '회복의 지능은 약초가 아니라 몸에 있다는 것이 글의 결론이므로, 제목으로는 ① ‘약초가 당신을 낫게 하는 '
          '것이 아니다 ― 당신의 몸이 한다’가 가장 적절하다.',
   'tr': ['약초가 당신을 낫게 하는 것이 아니다 ― 당신의 몸이 한다',
          '위약 효과: 약 없는 약',
          '현대의 병에 쓰는 고대의 약초',
          '혈액 순환은 당신의 건강을 어떻게 좌우하는가',
          '의사들이 새로운 치료법을 모두 불신하는 이유']},
 'mismatch': {
   'ch': ['Herbs tend to increase blood circulation as the body tries to eliminate them.',
          'Increased circulation can create a temporary feeling of a high.',
          'Herbs can have a placebo effect just as other methods can.',
          'The writer accepts that herbs possess the intelligence needed to heal the body.',
          'The writer says that the body itself has the intelligence to regain health.'],
   'ans': 4,
   'sol': '④번 선택지는 글쓴이가 약초에 몸을 낫게 할 지능이 있음을 인정한다고 했는데, 지문에서는 "How can '
          'herbs have the intelligence ...? That is impossible."이라고 하여 그것이 불가능하다고 했으므로 '
          '내용과 일치하지 않는다.',
   'tr': ['약초는 몸이 그것을 배출하려 하면서 혈액 순환을 증가시키는 경향이 있다.',
          '증가한 혈액 순환은 일시적인 고양감을 만들어 낼 수 있다.',
          '약초는 다른 방법과 마찬가지로 위약 효과를 낼 수 있다.',
          '글쓴이는 약초가 몸을 낫게 할 지능을 지녔음을 인정한다.',
          '글쓴이는 건강을 되찾는 지능이 몸 자체에 있다고 말한다.']},
 'blank': {
   'target': 'herbs are more intelligent than the human body, which is truly hard to believe',
   'ch': ['plants somehow know more than the body itself does, which is hard to accept',
          'the human body cannot recover at all without outside help of some kind',
          'modern medicine has failed to explain how healing really takes place',
          'people ought to stop using every kind of traditional remedy at once',
          'the placebo effect is far stronger than any chemical treatment'],
   'ans': 1,
   'sol': '빈칸 앞은 약초가 몸에 들어가 알아서 문제를 고친다고 상상해 보라는 반문이고, Otherwise는 그렇지 '
          '않다면이라는 뜻이다. 따라서 빈칸에는 약초가 인체보다 더 지능적이라는, 믿기 어려운 결론이 와야 하므로 '
          '①이 정답이다. ②·③·④·⑤는 모두 글의 논지와 무관하다.'},
 'order': {'lead': 2, 'cuts': (3, 6), 'ans': 4,
   'sol': '약초가 병을 고친다는 통념과 그것이 비과학적이라는 반박이 주어진 글이다. 다음으로 약초가 효과 있어 '
          '보이는 두 가지 이유를 설명한 (C)가 오고, 회복의 주체는 몸이며 약초에 지능이 있을 수 없다는 (B)가 '
          '이어지며, 상상해 보라는 권유와 최종 결론을 담은 (A)로 마무리된다.'},
 'insert': {'take': 5, 'ans': 3,
   'sol': '주어진 문장은 Whatever the case로 앞의 두 가지 설명을 한꺼번에 받아 결론을 내는 문장이다. 따라서 '
          '위약 효과를 언급한 문장 바로 뒤이자, 약초에 지능이 있을 수 있느냐는 반문 앞인 ③이 적절하다.'},
 'summary': {
   'tmpl': 'The apparent effect of herbs comes from increased circulation or a ___(A)___ response, '
           'so the real source of recovery is the ___(B)___ itself.',
   'ch': [('placebo', 'body'), ('placebo', 'herb'), ('chemical', 'body'),
          ('allergic', 'herb'), ('chemical', 'doctor')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 약초가 듣는 것처럼 보이는 이유는 혈액 순환 증가와 위약 효과이며, 회복의 주체는 '
          '몸이다. 2. 정답: placebo effect에 대응하는 placebo, your body에 대응하는 body가 들어간 ①이 '
          '적절하다. 3. 오답: herb·doctor는 글이 부정하는 주체이고, chemical·allergic은 지문이 든 이유가 '
          '아니다.'},
}

# ─────────────────────────────────────────────────────────── 22년9월33번
ITEMS['22년9월33번'] = {
 'implication': {
   'phrase': 'to avoid the appearance of empty shelf space',
   'ch': ['to keep the shelves from ever looking bare to the shoppers',
          'to reduce the cost of transporting goods to each of the stores',
          'to make certain that every sandwich is sold before closing time',
          'to satisfy the legal rules that govern food safety labelling',
          'to offer customers a far wider choice of fresh products'],
   'ans': 1,
   'sol': '밑줄 친 부분은 소매업체가 왜 필요 이상으로 많이 주문하는지를 설명하는 자리이며, 그 결과 공급이 수요를 '
          '넘어서 많은 폐기물이 생긴다고 이어진다. 즉 진열대가 비어 보이지 않게 하려는 것이므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['신선함에 대한 요구는 감춰진 환경 비용과 대규모 음식물 낭비를 낳는다.',
          '유통기한 표시는 소비자의 안전을 지키는 가장 좋은 장치이다.',
          '온실 재배는 추운 기후에서 농업 생산성을 크게 높여 준다.',
          '소매업체는 재고 관리 기술에 더 많이 투자할 필요가 있다.',
          '지역에서 생산된 농산물이 수입 농산물보다 값이 저렴하다.'],
   'ans': 1,
   'sol': '연중 신선한 농산물을 요구하면서 온실과 총체적 품질 관리에 의존하게 되었고, 유통기한 표시와 과다 주문 '
          '관행이 대규모 폐기를 낳았다는 내용이다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['the hidden environmental and social costs of demanding freshness',
          'the marketing techniques used to sell exotic vegetables abroad',
          "the legal meaning of 'best before' and 'sell by' date labels",
          'the technology that has made year-round farming possible',
          'the campaigns organized to help hungry people around the world'],
   'ans': 1,
   'sol': '신선함에 대한 수요가 환경 비용과 음식물 낭비라는 감춰진 대가를 치르게 한다는 글이므로, 주제로는 '
          '① ‘신선함을 요구하는 데 따르는 감춰진 환경적·사회적 비용’이 가장 적절하다.',
   'tr': ['신선함을 요구하는 데 따르는 감춰진 환경적·사회적 비용',
          '이국적인 채소를 해외에 파는 데 쓰이는 마케팅 기법',
          "'유통기한'과 '판매기한' 표시의 법적 의미",
          '연중 농업을 가능하게 만든 기술',
          '전 세계 굶주린 사람들을 돕기 위해 조직된 운동']},
 'title': {
   'ch': ['The Price We Pay for Always-Fresh Food',
          'Hot Houses: Farming Beyond the Seasons',
          'How to Read a Food Label Correctly',
          'Sandwiches: The Fastest-Growing Market',
          'Nature’s Return: A New Food Movement'],
   'ans': 1,
   'sol': '언제나 신선한 먹거리를 원하는 요구가 환경 비용과 폐기물이라는 대가를 치르게 한다는 글이므로, '
          '제목으로는 ① ‘언제나 신선한 먹거리에 우리가 치르는 값’이 가장 적절하다.',
   'tr': ['언제나 신선한 먹거리에 우리가 치르는 값',
          '온실: 계절을 넘어선 농사',
          '식품 표시를 올바로 읽는 법',
          '샌드위치: 가장 빠르게 성장하는 시장',
          '자연으로의 회귀: 새로운 먹거리 운동']},
 'mismatch': {
   'ch': ['The demand for year-round fresh produce has spread the use of hot houses.',
          'Total quality control includes temperature control and the use of pesticides.',
          'Date labels such as ‘sell by’ have legally allowed institutional waste.',
          'Tristram Stuart argues that retailers usually order less than they expect to sell.',
          'Waste grows to high volumes when supply regularly exceeds demand.'],
   'ans': 4,
   'sol': '④번 선택지는 소매업체가 예상 판매량보다 적게 주문한다고 했는데, 지문에서는 "over-ordering is '
          'standard practice across the retail sector"라고 하여 과다 주문이 관행이라고 했으므로 내용과 '
          '일치하지 않는다.',
   'tr': ['연중 신선한 농산물에 대한 수요가 온실 사용을 널리 퍼뜨렸다.',
          '총체적 품질 관리에는 온도 관리와 농약 사용이 포함된다.',
          "'판매기한' 같은 날짜 표시는 제도적 폐기를 법적으로 허용해 왔다.",
          'Tristram Stuart는 소매업체가 예상 판매량보다 적게 주문한다고 주장한다.',
          '공급이 수요를 꾸준히 넘어서면 폐기물이 대량으로 늘어난다.']},
 'blank': {
   'target': 'over-ordering is standard practice across the retail sector',
   'ch': ['ordering far more than is needed is the normal rule throughout retailing',
          'shops now prepare their sandwiches only after a customer has ordered one',
          'suppliers are legally required to take back any products left unsold',
          'customers have begun to prefer frozen food to freshly made food',
          'small shops throw away much more food than large supermarkets do'],
   'ans': 1,
   'sol': '빈칸 뒤에서 진열대가 비어 보이지 않게 하려는 것이며 공급이 수요를 넘어 폐기물이 대량으로 생긴다고 '
          '했으므로, 빈칸에는 과다 주문이 업계의 관행이라는 내용이 와야 한다. 원문을 바꾸어 쓴 ①이 정답이며, '
          '②는 과다 주문과 반대이고 ③·④·⑤는 근거가 없다.'},
 'order': {'lead': 1, 'cuts': (1, 3), 'ans': 5,
   'sol': '신선함에 대한 요구에 감춰진 환경 비용이 있다는 주어진 글 다음에는, 연중 공급 요구가 온실과 총체적 '
          '품질 관리로 이어졌다는 (A)가 온다. 이어 그 요구가 음식물 낭비 문제도 낳았고 날짜 표시가 제도적 '
          '폐기를 허용했다는 (C)가 오고, 운동가들의 폭로와 구체적 사례를 든 (B)로 마무리된다.'},
 'insert': {'take': 2, 'ans': 2,
   'sol': '주어진 문장은 also를 써서 환경 비용에 이어 두 번째 문제인 음식물 낭비로 화제를 옮기는 문장이다. '
          '따라서 온실과 품질 관리 등 환경 비용에 관한 설명이 끝나는 자리이자, 날짜 표시가 폐기를 허용했다는 '
          '문장 앞인 ②가 적절하다.'},
 'summary': {
   'tmpl': 'The demand for year-round ___(A)___ carries hidden costs, since it drives '
           'energy-heavy production and, through date labels and over-ordering, generates '
           'enormous ___(B)___.',
   'ch': [('freshness', 'waste'), ('freshness', 'profit'), ('cheapness', 'waste'),
          ('safety', 'demand'), ('cheapness', 'profit')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 연중 신선함을 요구한 결과 온실과 물류에 의존하게 되었고, 날짜 표시와 과다 주문이 '
          '대량 폐기를 낳았다. 2. 정답: The demand for freshness에 대응하는 freshness, food wastage에 '
          '대응하는 waste가 들어간 ①이 적절하다. 3. 오답: cheapness·safety는 글이 다룬 요구가 아니고, '
          'profit·demand는 감춰진 비용이 아니다.'},
}

# ─────────────────────────────────────────────────────────── 22년9월34번 (5문장·문장삽입 제외)
ITEMS['22년9월34번'] = {
 'implication': {
   'phrase': 'The trick was to see if you could totally focus on the main message and also hear someone talking in your other ear',
   'ch': ['the design tested whether attention can be split between two streams of speech',
          'the study tried to find out which ear hears human speech more accurately',
          'the researcher wanted to measure how loudly people speak in a noisy room',
          'the participants were asked to guess the topic of the second message',
          'the experiment checked how quickly people can repeat a long sentence'],
   'ans': 1,
   'sol': '한쪽 귀의 메시지를 따라 말하게 하면서 다른 쪽 귀로도 말소리를 들려준 실험 설계를 설명하는 자리이다. '
          '즉 주의를 두 개의 말소리에 동시에 나눌 수 있는지 알아보려는 것이었으므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['사람은 두 가지 정보를 동시에 처리할 수 없다.',
          '한쪽 귀는 다른 쪽 귀보다 언어 인식에 유리하다.',
          '따라 말하기 훈련은 청취 능력을 크게 높여 준다.',
          '소음 속에서는 모국어가 외국어보다 잘 들린다.',
          '실험 참가자의 수가 많을수록 결과가 정확해진다.'],
   'ans': 1,
   'sol': '참가자들은 반대쪽 귀의 메시지가 남자 목소리인지 여자 목소리인지, 영어인지 다른 언어인지조차 알지 '
          '못했으며, 글은 이를 사람이 두 정보를 동시에 처리할 수 없다는 결론으로 정리한다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['experimental evidence that attention cannot be divided between two messages',
          'the difference in hearing ability between the left ear and the right ear',
          'the training methods that are used to improve listening comprehension',
          'the history of psychological research carried out at MIT in the 1950s',
          'the effect of background noise on the accuracy of recorded speech'],
   'ans': 1,
   'sol': 'Cherry의 실험을 통해 주의가 두 메시지로 나뉠 수 없음을 보여 주는 글이므로, 주제로는 ① ‘주의가 두 '
          '메시지로 나뉠 수 없다는 실험적 증거’가 가장 적절하다.',
   'tr': ['주의가 두 메시지로 나뉠 수 없다는 실험적 증거',
          '왼쪽 귀와 오른쪽 귀의 청력 차이',
          '듣기 이해력을 높이는 데 쓰이는 훈련 방법',
          '1950년대 MIT에서 이루어진 심리학 연구의 역사',
          '배경 소음이 녹음된 말소리의 정확도에 미치는 영향']},
 'title': {
   'ch': ['One Voice at a Time: The Limits of Listening',
          'Shadowing: A New Way to Learn a Language',
          'Which Ear Do You Really Listen With?',
          'Noise and Speech: An Unequal Contest',
          'How MIT Changed Modern Psychology'],
   'ans': 1,
   'sol': '두 사람의 말을 동시에 들을 수 없다는 실험 결과가 핵심이므로, 제목으로는 ① ‘한 번에 한 목소리: 듣기의 '
          '한계’가 가장 적절하다.',
   'tr': ['한 번에 한 목소리: 듣기의 한계',
          '따라 말하기: 언어를 배우는 새로운 방법',
          '당신은 정말 어느 쪽 귀로 듣는가?',
          '소음과 말소리: 불공평한 겨루기',
          'MIT는 현대 심리학을 어떻게 바꾸었나']},
 'mismatch': {
   'ch': ["Cherry's studies were carried out at MIT back in the 1950s.",
          'Participants had to repeat back the message that came into one ear.',
          "Participants could tell whether the other ear's message was in English.",
          'Participants listened through one ear at a time and then through both ears.',
          'The study concluded that two pieces of information cannot be processed at once.'],
   'ans': 3,
   'sol': '③번 선택지는 참가자가 반대쪽 귀의 메시지가 영어인지 알 수 있었다고 했는데, 지문에서는 "it was '
          'impossible for his participants to know whether the message in the other ear was ... in '
          'English or another language"라고 했으므로 내용과 일치하지 않는다.',
   'tr': ['Cherry의 연구는 1950년대에 MIT에서 수행되었다.',
          '참가자들은 한쪽 귀로 들어온 메시지를 따라 말해야 했다.',
          '참가자들은 반대쪽 귀의 메시지가 영어인지 알 수 있었다.',
          '참가자들은 한 번에 한쪽 귀로, 그다음에는 양쪽 귀로 들었다.',
          '그 연구는 두 정보를 동시에 처리할 수 없다는 결론을 내렸다.']},
 'blank': {
   'target': 'people could not process two pieces of information at the same time',
   'ch': ['the mind is unable to deal with two streams of information at once',
          'listeners remember spoken words far better than written ones',
          'the ear that is not being attended to actually hears more accurately',
          'repeating a message aloud makes it a great deal easier to recall',
          'people can follow two speakers as long as the speakers talk slowly'],
   'ans': 1,
   'sol': '빈칸 문장은 In other words로 앞의 실험 결과를 한 문장으로 정리하는 자리이다. 반대쪽 귀의 정보를 '
          '전혀 파악하지 못했으므로, 두 정보를 동시에 처리할 수 없다는 ①이 정답이다. ③·⑤는 실험 결과와 '
          '반대이고 ②·④는 지문의 논점이 아니다.'},
 'order': {'lead': 1, 'cuts': (1, 3), 'ans': 4,
   'sol': '두 사람의 말을 동시에 들을 수 있는지 알아본 실험을 소개한 주어진 글 다음에는, 그 구체적 방법인 '
          '따라 말하기를 설명한 (C)가 온다. 이어 실험의 핵심 의도와 놀라운 결과를 밝힌 (B)가 오고, 그 결과를 '
          '한 문장으로 정리한 (A)로 마무리된다.'},
 'summary': {
   'tmpl': 'In Cherry’s shadowing experiments listeners could not even identify the ___(A)___ of '
           'the message in the unattended ear, which shows that attention cannot be ___(B)___ '
           'between two messages.',
   'ch': [('basic features', 'divided'), ('basic features', 'restored'),
          ('exact volume', 'divided'), ('total length', 'shared'), ('exact volume', 'restored')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 참가자들은 반대쪽 귀 메시지의 화자 성별, 언어, 실제 단어 여부조차 알지 못했다. '
          '2. 정답: 그 기본적인 특징을 뜻하는 basic features와, 주의를 나눌 수 없다는 divided가 들어간 ①이 '
          '적절하다. 3. 오답: exact volume·total length는 지문이 언급한 항목이 아니고, restored·shared는 '
          '결론과 맞지 않는다.'},
}

# ─────────────────────────────────────────────────────────── 22년9월35번 (5문장·문장삽입 제외)
ITEMS['22년9월35번'] = {
 'implication': {
   'phrase': 'empowering tourists with mobile access to services',
   'ch': ['giving travellers the power to arrange services from their own phones',
          'teaching tourists how to use unfamiliar digital devices while abroad',
          'allowing hotels to collect far more personal data about their guests',
          'letting local guides advertise their own tours on the Internet',
          'providing free wireless networks at every major tourist attraction'],
   'ans': 1,
   'sol': '밑줄 뒤에 호텔 예약, 항공권 발권, 지역 명소 추천 같은 예가 이어지고 그것이 큰 관심과 상당한 수익을 '
          '낳는다고 했다. 즉 관광객이 휴대전화로 직접 서비스를 이용할 수 있게 한다는 뜻이므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['정보통신기술, 특히 모바일 앱이 관광 산업과 고객 경험을 바꾸어 놓았다.',
          '호텔의 서비스 품질은 직원 교육 수준에 의해 결정된다.',
          '관광객은 가격보다 지역 문화 체험을 더 중시한다.',
          '항공권 예약은 대리점을 통하는 편이 더 안전하다.',
          '관광 산업의 성장은 지역 경제에 부담을 준다.'],
   'ans': 1,
   'sol': '정보통신기술의 빠른 발전이 관광·환대 산업의 사업 모델과 경쟁 양상을 바꾸었고, 가장 최근의 도약은 '
          '모바일 애플리케이션이라는 내용이다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['the way ICTs, and especially mobile apps, have reshaped tourism',
          'the training that hotel staff need to receive in the digital age',
          'the reasons why tourists prefer local attractions to famous ones',
          'the security problems caused by online hotel reservation systems',
          'the competition between airlines over the price of tickets'],
   'ans': 1,
   'sol': '정보통신기술이 관광 산업의 사업 모델과 고객 경험을 바꾸었고 그 최신 국면이 모바일 앱이라는 글이므로, '
          '주제로는 ① ‘정보통신기술, 특히 모바일 앱이 관광을 재편한 방식’이 가장 적절하다.',
   'tr': ['정보통신기술, 특히 모바일 앱이 관광을 재편한 방식',
          '디지털 시대에 호텔 직원이 받아야 할 교육',
          '관광객이 유명한 곳보다 지역 명소를 선호하는 이유',
          '온라인 호텔 예약 시스템이 낳는 보안 문제',
          '항공권 가격을 둘러싼 항공사 간 경쟁']},
 'title': {
   'ch': ['Tourism in Your Pocket: How Apps Changed Travel',
          'Why Hotels Will Always Need a Front Desk',
          'Loyalty Programs: Winning Customers for Life',
          'The Hidden Cost of Very Cheap Air Tickets',
          'Local Attractions That Are Worth a Long Journey'],
   'ans': 1,
   'sol': '모바일 앱이 관광객에게 서비스 접근 권한을 주면서 산업 전체를 바꾸었다는 내용이므로, 제목으로는 '
          '① ‘주머니 속의 관광: 앱은 여행을 어떻게 바꾸었나’가 가장 적절하다.',
   'tr': ['주머니 속의 관광: 앱은 여행을 어떻게 바꾸었나',
          '호텔에 언제나 프런트가 필요한 이유',
          '고객 충성 프로그램: 평생 고객 얻기',
          '아주 값싼 항공권의 숨은 비용',
          '먼 길을 갈 만한 지역 명소들']},
 'mismatch': {
   'ch': ['ICTs have radically transformed the business models of the tourism industry.',
          'New services change the customer experience and raise competitiveness.',
          'Unique experiences and convenient services can lead to customer loyalty.',
          'The writer says that mobile applications have had little effect on tourism.',
          'Mobile access to ticketing and recommendations generates considerable profits.'],
   'ans': 4,
   'sol': '④번 선택지는 모바일 앱이 관광에 별 영향을 주지 않았다고 했는데, 지문에서는 "the most recent '
          'technological boost received by the tourism sector is represented by mobile '
          'applications"라고 하여 가장 최근의 큰 도약이라고 했으므로 내용과 일치하지 않는다.',
   'tr': ['정보통신기술은 관광 산업의 사업 모델을 근본적으로 바꾸어 놓았다.',
          '새로운 서비스는 고객 경험을 바꾸고 경쟁 수준을 높인다.',
          '독특한 경험과 편리한 서비스는 고객 충성으로 이어질 수 있다.',
          '글쓴이는 모바일 앱이 관광에 거의 영향을 주지 않았다고 말한다.',
          '발권과 추천에 대한 모바일 접근은 상당한 수익을 낳는다.']},
 'blank': {
   'target': 'leads to satisfaction and, eventually, customer loyalty to the service provider or brand',
   'ch': ['brings contentment and, in time, a lasting attachment to the provider or brand',
          'lowers the price that travellers have to pay for the rooms they book',
          'reduces the number of staff that a large hotel needs to employ',
          'makes it much harder for new companies to enter the market',
          'shortens the time that tourists spend at each of the attractions'],
   'ans': 1,
   'sol': '독특한 경험과 편리한 서비스가 고객에게 어떤 결과를 가져오는지가 빈칸의 내용이며, 앞에서 새로운 '
          '서비스가 고객 경험을 바꾼다고 했다. 따라서 만족과 궁극적인 충성으로 이어진다는 ①이 정답이다. '
          '②·③·④·⑤는 모두 고객이 얻는 결과가 아니다.'},
 'order': {'lead': 1, 'cuts': (1, 3), 'ans': 1,
   'sol': '정보통신기술이 관광 산업을 바꾸었다는 주어진 글 다음에는, 그것이 경쟁과 고객 경험을 바꾼다는 (B)가 '
          '온다. 이어 그 결과가 만족과 충성이며 최신 도약이 모바일 앱이라는 (C)가 오고, 모바일 접근이 낳는 '
          '구체적 효과를 든 (A)로 마무리된다.'},
 'summary': {
   'tmpl': 'The rapid growth of ICTs has reshaped tourism by raising ___(A)___ among service '
           'providers, and mobile applications now let travellers arrange services themselves, '
           'which produces strong interest and ___(B)___.',
   'ch': [('competitiveness', 'profits'), ('competitiveness', 'complaints'),
          ('uniformity', 'profits'), ('secrecy', 'delays'), ('uniformity', 'complaints')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 정보통신기술은 서비스 제공자 간 경쟁을 새롭게 만들었고, 모바일 앱은 큰 관심과 상당한 '
          '수익을 낳는다. 2. 정답: new levels/forms of competitiveness에 대응하는 competitiveness, '
          'considerable profits에 대응하는 profits가 들어간 ①이 적절하다. 3. 오답: uniformity·secrecy는 '
          '경쟁 심화와 어긋나고, complaints·delays는 결과와 반대이다.'},
}

# ─────────────────────────────────────────────────────────── 22년9월36번
ITEMS['22년9월36번'] = {
 'implication': {
   'phrase': 'you do not starve because you have no food, you starve because you have no money',
   'ch': ['hunger today comes from a lack of purchasing power, not a lack of supply',
          'food shortages are far worse now than at any other time in history',
          'money is much more useful than food in an emergency situation',
          'farmers ought to be paid more for the crops that they grow',
          'exporting food is always harmful to a developing country'],
   'ans': 1,
   'sol': '앞에서 세계 기아 인구의 79퍼센트가 식량 순수출국에 살며, 그곳의 농산물이 현지인이 감당할 수 없는 '
          '값에 세계 시장에 팔린다고 했다. 즉 오늘날의 굶주림은 식량이 없어서가 아니라 살 돈이 없어서 생긴다는 '
          '뜻이므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['세계적 기아의 가장 큰 원인은 식량 부족이 아니라 빈곤이다.',
          '식량 수출국은 자국민의 식량 소비를 우선해야 한다.',
          '세계 시장의 곡물 가격은 정부가 직접 통제해야 한다.',
          '기아 문제는 농업 기술의 발전만으로 해결될 수 있다.',
          '국제 원조는 식량보다 현금 형태가 더 효과적이다.'],
   'ans': 1,
   'sol': '기아의 가장 큰 원인이 빈곤이며, 식량이 없어서가 아니라 살 돈이 없어서 굶는다는 것이 글의 핵심이다. '
          '결론에서도 식량 가격을 낮추는 흐름을 이어 가는 데 답이 있다고 했으므로 ①이 요지이다.'},
 'topic': {
   'ch': ['poverty rather than scarcity as the main cause of world hunger',
          'the steady growth of international trade in agricultural goods',
          'the technologies that have raised crop yields around the world',
          'the political conflicts that follow a sudden shortage of food',
          'the difficulty of counting how many people go hungry each year'],
   'ans': 1,
   'sol': '기아의 원인이 식량의 절대적 부족이 아니라 빈곤임을 통계와 논증으로 밝히는 글이므로, 주제로는 '
          '① ‘세계 기아의 주된 원인으로서 결핍이 아닌 빈곤’이 가장 적절하다.',
   'tr': ['세계 기아의 주된 원인으로서 결핍이 아닌 빈곤',
          '농산물 국제 무역의 꾸준한 성장',
          '전 세계 작물 수확량을 늘린 기술들',
          '갑작스러운 식량 부족 뒤에 따르는 정치적 갈등',
          '해마다 굶주리는 사람의 수를 세는 일의 어려움']},
 'title': {
   'ch': ['Hungry in a Land That Exports Food',
          'Feeding the World: A Farming Challenge',
          'Why Food Prices Keep Rising Every Year',
          'Charity Alone Can Bring an End to Hunger',
          'The Return of the Small Family Farm'],
   'ans': 1,
   'sol': '식량을 수출하는 나라에서 오히려 사람들이 굶주린다는 역설이 글의 핵심이므로, 제목으로는 ① ‘식량을 '
          '수출하는 땅에서 굶주리다’가 가장 적절하다.',
   'tr': ['식량을 수출하는 땅에서 굶주리다',
          '세계를 먹여 살리기: 농업의 과제',
          '식량 가격이 해마다 오르는 이유',
          '자선만으로도 굶주림을 끝낼 수 있다',
          '소규모 가족 농장의 귀환']},
 'mismatch': {
   'ch': ['There is no single cause of hunger among nearly a billion people.',
          "Seventy-nine percent of the world's hungry live in net food-exporting nations.",
          'Local citizens often cannot afford the food that is produced in their own country.',
          'The writer argues that hunger is caused mainly by a shortage of food.',
          'The writer suggests continuing the trend of lowering the cost of food.'],
   'ans': 4,
   'sol': '④번 선택지는 기아의 주된 원인이 식량 부족이라고 했는데, 지문에서는 "you do not starve because '
          'you have no food, you starve because you have no money"라고 하여 원인을 빈곤으로 보았으므로 '
          '내용과 일치하지 않는다.',
   'tr': ['거의 10억 명에 이르는 굶주림에는 단 하나의 원인이 있는 것이 아니다.',
          '세계 기아 인구의 79퍼센트는 식량 순수출국에 살고 있다.',
          '현지 주민은 자국에서 생산된 식량을 살 여력이 없는 경우가 많다.',
          '글쓴이는 굶주림이 주로 식량 부족 때문에 생긴다고 주장한다.',
          '글쓴이는 식량 가격을 낮추는 흐름을 이어 갈 것을 제안한다.']},
 'blank': {
   'target': 'food is, in the grand scheme of things, too expensive and many people are too poor to buy it',
   'ch': ['food costs more than many people can pay, not that there is too little of it',
          'food is shared out unfairly between the northern and the southern regions',
          'farmers in poor nations grow crops that their own neighbours cannot eat',
          'governments spend far too little on storing grain for emergencies',
          'world markets remain closed to producers from developing countries'],
   'ans': 1,
   'sol': '빈칸 앞에서 돈이 없어서 굶는다고 했고, 뒤에서는 식량 가격을 낮추는 흐름을 이어 가는 데 답이 있다고 '
          '했다. 따라서 빈칸에는 식량이 너무 비싸고 사람들이 너무 가난하다는 내용이 와야 하므로 ①이 정답이다. '
          '②·③·④·⑤는 모두 뒤에 이어지는 해법과 연결되지 않는다.'},
 'order': {'lead': 1, 'cuts': (2, 4), 'ans': 2,
   'sol': '굶주림에 단 하나의 원인은 없다는 주어진 글 다음에는, 가장 큰 원인이 빈곤이라며 식량 순수출국 통계를 '
          '제시한 (C)가 온다. 이어 그 이유를 묻고 답하는 (A)가 오고, 돈이 없어 굶는다는 정리와 해법을 담은 '
          '(B)로 마무리된다.'},
 'insert': {'take': 2, 'ans': 2,
   'sol': '주어진 문장은 빈곤이 가장 큰 원인이라는 주장을 뒷받침하는 통계이다. 그 주장 바로 뒤이자, 그 통계를 '
          '받아 "How can this be?"라고 묻는 문장 앞인 ②에 들어가야 한다.'},
 'summary': {
   'tmpl': 'Most of the world’s hungry live in countries that ___(A)___ food, which shows that '
           'hunger arises less from scarcity than from an inability to ___(B)___ what is grown.',
   'ch': [('export', 'afford'), ('export', 'store'), ('import', 'afford'),
          ('waste', 'store'), ('import', 'grow')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 기아 인구의 대부분이 식량 순수출국에 살며, 그들은 생산된 식량을 살 돈이 없다. '
          '2. 정답: net exporters of food에 대응하는 export, afford에 대응하는 afford가 들어간 ①이 '
          '적절하다. 3. 오답: import·waste는 통계와 어긋나고, store·grow는 굶주림의 원인이 아니다.'},
}

# ─────────────────────────────────────────────────────────── 22년9월37번
ITEMS['22년9월37번'] = {
 'implication': {
   'phrase': 'when your mental machinery is loose rather than standing at attention',
   'ch': ['when the mind is relaxed instead of being sharply focused',
          'when the body has had a full night of really deep sleep',
          'when a person works together with a large and lively team',
          'when the task in front of you has a clear deadline to meet',
          'when someone has practised a single skill for many years'],
   'ans': 1,
   'sol': '앞 문장에서 정신과 몸이 절정기보다 덜 각성해 있을 때 창의성의 여신이 깨어나 더 자유로이 노닌다고 '
          '했다. 즉 정신이 팽팽히 긴장해 있지 않고 느슨할 때라는 뜻이므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['주의를 요하는 일은 최상의 시간에, 창의적인 일은 최악의 시간에 하는 것이 좋다.',
          '아침형 인간이 저녁형 인간보다 전반적으로 업무 효율이 높다.',
          '창의력은 반복적인 훈련을 통해서만 길러질 수 있다.',
          '하루 일과는 되도록 오전에 집중해서 배치해야 한다.',
          '충분한 수면은 창의적 사고를 위한 가장 중요한 조건이다.'],
   'ans': 1,
   'sol': '집중이 필요한 일은 하루 중 가장 좋은 시간에 처리하되, 창의성과 새로운 아이디어가 필요한 일은 오히려 '
          '가장 나쁜 시간에 하라는 조언이 글의 핵심이다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ["matching the type of a task to the right time of one's own day",
          'the biological causes of individual differences in sleep patterns',
          'the benefits of starting work in the very early morning hours',
          "the ways of measuring a person's level of creative thinking",
          'the role that deadlines play in improving work efficiency'],
   'ans': 1,
   'sol': '일의 성격에 따라 하루 중 어느 시간에 처리할지를 달리하라는 글이므로, 주제로는 ① ‘일의 종류를 하루 중 '
          '알맞은 시간과 맞추기’가 가장 적절하다.',
   'tr': ['일의 종류를 하루 중 알맞은 시간과 맞추기',
          '개인별 수면 유형의 생물학적 원인',
          '아주 이른 아침에 일을 시작하는 것의 이점',
          '창의적 사고 수준을 측정하는 방법',
          '마감 시한이 업무 효율을 높이는 데 하는 역할']},
 'title': {
   'ch': ['Do Your Creative Work at Your Worst Hour',
          'Early Birds Always Finish the Race First',
          'How to Stay Fully Alert All Day Long',
          'Creativity Simply Cannot Be Scheduled',
          'Sleep Well, Think Clearly, Work Faster'],
   'ans': 1,
   'sol': '창의적인 일은 각성이 낮은 "최악의" 시간에 해야 잘된다는 것이 글의 핵심 조언이므로, 제목으로는 '
          '① ‘창의적인 일은 당신의 최악의 시간에 하라’가 가장 적절하다. ④는 시간을 정할 수 없다는 뜻이어서 '
          '글의 조언과 어긋난다.',
   'tr': ['창의적인 일은 당신의 최악의 시간에 하라',
          '아침형 인간이 언제나 먼저 결승선에 닿는다',
          '하루 종일 완전히 각성 상태를 유지하는 법',
          '창의성은 도무지 계획할 수 없다',
          '잘 자고, 맑게 생각하고, 빨리 일하라']},
 'mismatch': {
   'ch': ['Some people feel that they are most active during the afternoon hours.',
          "Tasks that demand attention should be handled at one's best time of day.",
          'Tasks that demand creativity are best tackled at one\'s "worst" time of day.',
          'An early bird is advised to do creative work early in the morning.',
          'Creativity flows when the mental machinery is loose.'],
   'ans': 4,
   'sol': '④번 선택지는 아침형 인간에게 창의적인 일을 이른 아침에 하라고 조언한다고 했는데, 지문에서는 "if you '
          'are an early bird, make sure to attack your creative task in the evening"이라고 하여 저녁에 '
          '하라고 했으므로 내용과 일치하지 않는다.',
   'tr': ['어떤 사람은 오후 시간대에 가장 활동적이라고 느낀다.',
          '주의를 요하는 일은 하루 중 가장 좋은 시간에 처리해야 한다.',
          '창의성을 요하는 일은 하루 중 "최악의" 시간에 다루는 것이 가장 좋다.',
          '아침형 인간은 창의적인 일을 이른 아침에 하라고 권고받는다.',
          '정신의 기계 장치가 느슨할 때 창의성이 흘러나온다.']},
 'blank': {
   'target': 'the muse of creativity awakens and is allowed to roam more freely',
   'ch': ['imagination wakes up and is left free to wander wherever it likes',
          'the memory of the previous working day becomes a great deal clearer',
          'the body recovers from the strain of the long working hours',
          'attention narrows down to the single task placed in front of you',
          'the desire to finish the work quickly grows much stronger'],
   'ans': 1,
   'sol': '빈칸 문장은 각성이 낮은 시간에 창의적인 일을 하라는 조언의 근거이며, 뒤 문장은 정신이 느슨할 때 '
          '창의성이 흘러나온다고 다시 정리한다. 따라서 상상력이 깨어나 자유로이 노닌다는 ①이 정답이다. ④는 '
          '집중이 좁아진다는 뜻이어서 오히려 반대이다.'},
 'order': {'lead': 1, 'cuts': (2, 4), 'ans': 4,
   'sol': '누구에게나 최상의 시간대가 있다는 주어진 글 다음에는, 그 유형을 나누고 집중이 필요한 일은 최상의 '
          '시간에 하라는 (C)가 온다. 이어 However로 창의적인 일은 "최악의" 시간에 하라고 뒤집는 (B)가 오고, '
          '그 이유를 설명한 (A)로 마무리된다.'},
 'insert': {'take': 3, 'ans': 3,
   'sol': '주어진 문장은 However로 시작하여 앞의 조언을 뒤집는 전환 문장이다. 집중이 필요한 일을 최상의 시간에 '
          '하라는 조언 바로 뒤이자, So로 시작하는 구체적 지침 앞인 ③이 적절하다.'},
 'summary': {
   'tmpl': 'Work that calls for close ___(A)___ is best done at one’s peak hours, whereas creative '
           'work goes better when the mind is ___(B)___ at one’s low point of the day.',
   'ch': [('attention', 'relaxed'), ('attention', 'alert'), ('memory', 'relaxed'),
          ('speed', 'alert'), ('memory', 'exhausted')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 집중을 요하는 일은 최상의 시간에, 창의적인 일은 각성이 낮은 시간에 하는 것이 좋다. '
          '2. 정답: tasks that demand attention에 대응하는 attention, less alert·loose에 대응하는 relaxed가 '
          '들어간 ①이 적절하다. 3. 오답: alert는 창의성의 조건과 반대이고, memory·speed·exhausted는 지문이 '
          '다룬 개념이 아니다.'},
}

# ─────────────────────────────────────────────────────────── 22년9월38번
ITEMS['22년9월38번'] = {
 'implication': {
   'phrase': 'the more time we make for Friends, the less time we have for friends in real life',
   'ch': ['hours given to television characters are taken away from real relationships',
          'people who watch dramas learn how to make new friends more easily',
          'friendship on the screen is more honest than friendship in daily life',
          'watching television together is a good way to get to know neighbours',
          'modern viewers prefer comedies to any other kind of programme'],
   'ans': 1,
   'sol': '대문자 Friends는 텔레비전 드라마를, 소문자 friends는 현실의 친구를 가리킨다. 앞 문장에서 텔레비전을 '
          '많이 볼수록 자원봉사를 하거나 사람들과 시간을 보낼 가능성이 줄어든다고 했으므로, 화면 속 인물에게 쓴 '
          '시간만큼 현실의 관계가 줄어든다는 뜻인 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['텔레비전 시청은 사회적 욕구를 잠시 채워 주지만 실제 관계를 밀어낸다.',
          '여가 시간의 절반 이상을 취미 활동에 쓰는 것이 바람직하다.',
          '외로움을 느낄 때는 새로운 사람을 만나는 것이 가장 좋다.',
          '자원봉사는 사회적 유대를 넓히는 가장 좋은 방법이다.',
          '드라마 속 인물은 시청자의 성격 형성에 영향을 준다.'],
   'ans': 1,
   'sol': '외롭거나 사회적 연결이 필요할 때 텔레비전을 더 보게 되고 단기적으로는 그 욕구가 채워지지만, 더 지속적인 '
          '사회적 활동을 밀어낸다는 내용이다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['how television meets social needs while displacing real connection',
          'the rapid growth of the entertainment industry across Europe',
          'the reasons why people choose to volunteer their free time',
          'the effect of long-term loneliness on physical health in adults',
          'the differences between American and European viewing habits'],
   'ans': 1,
   'sol': '텔레비전이 사회적 욕구를 어느 정도 채워 주지만 더 지속적인 사회적 활동을 밀어낸다는 글이므로, '
          '주제로는 ① ‘텔레비전이 사회적 욕구를 채우면서 실제 관계를 밀어내는 방식’이 가장 적절하다.',
   'tr': ['텔레비전이 사회적 욕구를 채우면서 실제 관계를 밀어내는 방식',
          '유럽 전역에서 나타난 오락 산업의 빠른 성장',
          '사람들이 여가를 자원봉사에 쓰기로 하는 이유',
          '장기간의 외로움이 성인의 신체 건강에 미치는 영향',
          '미국과 유럽의 시청 습관의 차이']},
 'title': {
   'ch': ['Friends on Screen, Fewer Friends in Life',
          'Television: The Cheapest Way to Relax',
          'Why Volunteering Makes People Happier',
          'How to Choose the Right Show for You',
          'Loneliness: The Illness of Our Century'],
   'ans': 1,
   'sol': '화면 속 친구에게 쓴 시간이 현실의 친구와 보낼 시간을 줄인다는 마지막 문장이 글의 핵심이므로, '
          '제목으로는 ① ‘화면 속 친구, 줄어드는 현실의 친구’가 가장 적절하다.',
   'tr': ['화면 속 친구, 줄어드는 현실의 친구',
          '텔레비전: 가장 값싼 휴식 방법',
          '자원봉사가 사람을 더 행복하게 만드는 이유',
          '당신에게 맞는 프로그램을 고르는 법',
          '외로움: 우리 시대의 질병']},
 'mismatch': {
   'ch': ['Television consumes more than half of our free time in the US and Europe.',
          'People are more motivated to watch favourite shows when they feel lonely.',
          'Television watching satisfies social needs to some extent in the short run.',
          'Heavy viewers are more likely to volunteer their time than light viewers are.',
          'Television can crowd out activities with more lasting social value.'],
   'ans': 4,
   'sol': '④번 선택지는 텔레비전을 많이 보는 사람이 자원봉사를 더 많이 한다고 했는데, 지문에서는 "The more '
          'television we watch, the less likely we are to volunteer our time"이라고 하여 그 반대라고 '
          '했으므로 내용과 일치하지 않는다.',
   'tr': ['텔레비전은 미국과 유럽에서 우리 여가 시간의 절반 이상을 잡아먹는다.',
          '사람들은 외로움을 느낄 때 좋아하는 프로그램을 더 보고 싶어 한다.',
          '텔레비전 시청은 적어도 단기적으로는 사회적 욕구를 어느 정도 채워 준다.',
          '텔레비전을 많이 보는 사람이 적게 보는 사람보다 자원봉사를 더 많이 한다.',
          '텔레비전은 더 오래가는 사회적 가치를 지닌 활동을 밀어낼 수 있다.']},
 'blank': {
   'target': 'it is also likely to "crowd out" other activities that produce more sustainable social contributions to our social well-being',
   'ch': ['it tends to push aside the pursuits that build longer-lasting social ties',
          'it makes viewers far more critical of the programmes that they watch',
          'it encourages families to spend their evenings in the same room',
          'it reduces the amount of money that households spend on hobbies',
          'it teaches people how to recognize their own emotional needs'],
   'ans': 1,
   'sol': 'Unfortunately로 시작해 텔레비전의 부정적 측면을 꺼내는 자리이고, 뒤 문장에서 많이 볼수록 자원봉사나 '
          '사람들과의 시간이 줄어든다고 구체적으로 밝힌다. 따라서 지속적인 사회적 활동을 밀어낸다는 ①이 '
          '정답이며, ②·③·④·⑤는 모두 지문에 없는 내용이다.'},
 'order': {'lead': 1, 'cuts': (2, 4), 'ans': 5,
   'sol': '텔레비전이 여가의 절반 이상을 차지한다는 주어진 글 다음에는, 우리가 흔히 휴식 수단으로 여기지만 외로울 '
          '때 더 보게 된다는 (A)가 온다. 이어 그것이 단기적으로는 욕구를 채우지만 다른 활동을 밀어낸다는 (C)가 '
          '오고, 구체적 결과와 마무리 문장을 담은 (B)로 끝난다.'},
 'insert': {'take': 4, 'ans': 4,
   'sol': '주어진 문장은 Unfortunately로 시작하여 앞의 긍정적 진술을 뒤집는 문장이다. 텔레비전이 사회적 욕구를 '
          '어느 정도 채운다는 문장 바로 뒤이자, 그 부작용을 구체적으로 밝히는 문장 앞인 ④가 적절하다.'},
 'summary': {
   'tmpl': 'People turn to television most when they feel ___(A)___, and although it meets that '
           'need for a while, heavy viewing ___(B)___ the very activities that build lasting '
           'social ties.',
   'ch': [('lonely', 'displaces'), ('lonely', 'strengthens'), ('bored', 'displaces'),
          ('tired', 'strengthens'), ('bored', 'multiplies')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 외로울 때 텔레비전을 더 보게 되고 단기적으로 욕구가 채워지지만, 지속적인 사회적 '
          '활동은 밀려난다. 2. 정답: feeling lonely에 대응하는 lonely, crowd out에 대응하는 displaces가 '
          '들어간 ①이 적절하다. 3. 오답: bored·tired는 지문이 든 조건이 아니고, strengthens·multiplies는 '
          '결과와 정반대이다.'},
}

# ─────────────────────────────────────────────────────────── 22년9월40번
ITEMS['22년9월40번'] = {
 'implication': {
   'phrase': "Except they weren't",
   'ch': ['contrary to what we expected, two reasons did not work better than one',
          'the donors were unwilling to admit how much they had actually given',
          'the messages were not delivered to the alumni on the very same day',
          'the experiment had to be stopped before it was properly completed',
          'the two groups of alumni were not comparable in size or age'],
   'ans': 1,
   'sol': '앞 문장에서 이유가 둘이면 하나보다 낫다는 생각에 두 메시지를 합쳤다고 했고, 뒤 문장에서 기부율이 '
          '3퍼센트 아래로 떨어졌다고 밝힌다. 즉 기대와 달리 두 이유가 더 낫지 않았다는 뜻이므로 ①이 적절하다.'},
 'mainPoint': {
   'ch': ['설득의 이유를 여러 개 겹치면 오히려 저항을 불러 효과가 떨어진다.',
          '기부를 이끌어 내려면 감정에 호소하는 편이 더 효과적이다.',
          '동문의 기부율은 학교의 재정 상태에 비례해 달라진다.',
          '실험 참가자의 수가 많을수록 결과는 더 신뢰할 만하다.',
          '선행의 기회를 강조하면 기부 액수가 크게 늘어난다.'],
   'ans': 1,
   'sol': '각각 6.5퍼센트의 효과를 낸 두 메시지를 합치자 기부율이 3퍼센트 아래로 떨어졌고, 그 이유는 청중이 '
          '설득당하고 있음을 알아차리고 방어했기 때문이라는 내용이다. 따라서 ①이 요지이다.'},
 'topic': {
   'ch': ['why combining several persuasive reasons can backfire',
          'the best way to write a letter asking alumni for donations',
          'the emotional rewards that donors receive from their giving',
          'the financial difficulties that universities now have to face',
          'the difference between willing and unwilling volunteers'],
   'ans': 1,
   'sol': '서로 다른 설득의 이유를 함께 제시하자 오히려 효과가 절반 이하로 떨어졌다는 실험을 다루므로, 주제로는 '
          '① ‘여러 설득 이유를 합치는 것이 역효과를 낼 수 있는 이유’가 가장 적절하다.',
   'tr': ['여러 설득 이유를 합치는 것이 역효과를 낼 수 있는 이유',
          '동문에게 기부를 요청하는 편지를 쓰는 가장 좋은 방법',
          '기부자가 베풂에서 얻는 정서적 보상',
          '오늘날 대학이 겪는 재정적 어려움',
          '자발적 자원봉사자와 비자발적 자원봉사자의 차이']},
 'title': {
   'ch': ['Two Reasons Can Be Worse Than One',
          'The Warm Glow: Why People Love to Give',
          'How to Double Your Donation Rate',
          'Skeptical Audiences Never Change Their Minds',
          'Doing Good and Feeling Good: The Same Thing'],
   'ans': 1,
   'sol': '이유를 하나만 제시했을 때보다 둘을 합쳤을 때 효과가 절반 이하로 떨어졌다는 내용이므로, 제목으로는 '
          '① ‘두 개의 이유가 하나보다 못할 수 있다’가 가장 적절하다.',
   'tr': ['두 개의 이유가 하나보다 못할 수 있다',
          '따뜻한 빛: 사람들이 베풂을 좋아하는 이유',
          '기부율을 두 배로 높이는 법',
          '회의적인 청중은 결코 생각을 바꾸지 않는다',
          '선을 행하는 것과 기분이 좋아지는 것: 같은 일']},
 'mismatch': {
   'ch': ['The experiment tested two different messages on thousands of resistant alumni.',
          'One message stressed that donating would benefit students, faculty and staff.',
          'Each message on its own persuaded 6.5 percent of the unwilling alumni.',
          'Combining the two messages raised the giving rate above 6.5 percent.',
          'The combined message made the audience aware of an attempt to persuade them.'],
   'ans': 4,
   'sol': '④번 선택지는 두 메시지를 합쳤을 때 기부율이 6.5퍼센트를 넘었다고 했는데, 지문에서는 "the giving '
          'rate dropped below 3 percent"라고 하여 3퍼센트 아래로 떨어졌다고 했으므로 내용과 일치하지 않는다.',
   'tr': ['그 실험은 기부에 소극적인 수천 명의 동문에게 두 가지 메시지를 시험했다.',
          '한 메시지는 기부가 학생과 교수, 교직원에게 도움이 된다는 점을 강조했다.',
          '각각의 메시지는 따로 쓰였을 때 소극적인 동문의 6.5퍼센트를 설득했다.',
          '두 메시지를 합치자 기부율이 6.5퍼센트를 넘어섰다.',
          '합쳐진 메시지는 청중에게 설득하려는 시도를 알아차리게 했다.']},
 'blank': {
   'target': 'we triggered their awareness that someone was trying to persuade them',
   'ch': ['we made them notice that they were the target of a persuasion attempt',
          'we reminded them of the donations that they had already made',
          'we gave them more information than they could easily process',
          'we allowed them to choose which cause they wanted to support',
          'we convinced them that the university needed the money urgently'],
   'ans': 1,
   'sol': '빈칸 앞에서 청중이 이미 회의적이었다고 했고, 뒤에서는 그들이 스스로를 방어했다고 했다. 따라서 '
          '빈칸에는 설득당하고 있다는 사실을 알아차리게 만들었다는 내용이 와야 하므로 ①이 정답이다. ③은 '
          '정보량의 문제로 원인을 바꾸어 놓았고 ②·④·⑤는 지문에 없는 내용이다.'},
 'order': {'lead': 1, 'cuts': (3, 6), 'ans': 4,
   'sol': '두 메시지를 시험한 실험을 소개한 주어진 글 다음에는, 두 메시지의 내용과 동일한 효과를 밝힌 (C)가 '
          '온다. 이어 둘을 합쳤더니 기대와 달리 기부율이 떨어졌다는 (B)가 오고, 그 원인을 청중의 방어 심리로 '
          '설명한 (A)로 마무리된다.'},
 'insert': {'take': 7, 'ans': 5,
   'sol': '주어진 문장은 앞에서 제시한 두 수치(6.5퍼센트와 3퍼센트 미만)를 비교해 정리하는 문장이다. 따라서 '
          '합쳤을 때 기부율이 떨어졌다는 문장 바로 뒤인 ⑤에 들어가야 하며, 그 뒤로 원인 설명이 이어진다.'},
 'summary': {
   'tmpl': 'Offering two different reasons to donate ___(A)___ the giving rate, because the '
           'mixture made an already skeptical audience ___(B)___ that they were being persuaded.',
   'ch': [('lowered', 'realize'), ('lowered', 'forget'), ('doubled', 'realize'),
          ('raised', 'doubt'), ('doubled', 'forget')],
   'ans': 1,
   'sol': '1. 지문의 핵심: 두 이유를 합치자 기부율이 6.5퍼센트에서 3퍼센트 아래로 떨어졌고, 원인은 청중이 '
          '설득 시도를 알아차렸기 때문이다. 2. 정답: dropped에 대응하는 lowered, triggered their awareness에 '
          '대응하는 realize가 들어간 ①이 적절하다. 3. 오답: doubled·raised는 결과와 반대이고, forget·doubt는 '
          '청중의 반응과 맞지 않는다.'},
}
