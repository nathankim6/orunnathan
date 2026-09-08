import { Button } from "@/components/ui/button";
import { X, Eye } from "lucide-react";
import { QuestionType, ManualMarker } from "@/types/question";
import { useToast } from "@/components/ui/use-toast";
import { SentenceMatcher } from "../SentenceMatcher";
import { PassageList } from "./PassageList";
import { CustomQuestionEntry } from "./CustomQuestionEntry";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

// School logo mapping
const getSchoolLogo = (typeId: string, typeName: string): string | null => {
  if (typeName.includes('성남') || typeId.startsWith('seongnam')) {
    return '/lovable-uploads/seongnam-logo.png';
  }
  if (typeName.includes('괌') || typeId.startsWith('guam') || typeId === 'guamDictionary' || typeId === 'guamTableFillBlanks') {
    return '/lovable-uploads/guam-logo.png';
  }
  if (typeName.includes('오룬') || typeId.startsWith('orun')) {
    return '/lovable-uploads/orun-academy-logo.png';
  }
  if (typeName.includes('흑석') || typeId.startsWith('heukseok')) {
    return '/lovable-uploads/heukseok-logo.png';
  }
  return null;
};
export interface PassageEntry {
  id: string;
  title: string;
  text: string;
  result: string;
}
interface TypeEntryProps {
  type: QuestionType;
  passages: PassageEntry[];
  onAddPassage: (typeId: string) => void;
  onRemovePassage: (typeId: string, passageId: string) => void;
  onTextChange: (typeId: string, passageId: string, text: string) => void;
  onTitleChange: (typeId: string, passageId: string, title: string) => void;
  onPasteValues: (typeId: string, passageId: string, values: string[], titles?: string[]) => void;
  onOrderModeChange: (typeId: string, passageId: string, mode: 'basic' | 'advanced') => void;
  onSummaryModeChange: (typeId: string, passageId: string, mode: 'two-blanks' | 'three-blanks') => void;
  onChoiceLanguageChange?: (typeId: string, passageId: string, lang: 'english' | 'korean') => void;
  onManualModeChange?: (typeId: string, passageId: string, mode: boolean) => void;
  onManualMarkersChange?: (typeId: string, passageId: string, markers: ManualMarker[]) => void;
  onCombinedTypesChange?: (typeId: string, passageId: string, combinedTypes: string[]) => void;
  onParaphraseBlankChange?: (typeId: string, passageId: string, paraphraseBlank: boolean) => void;
  onSubTypeChange?: (typeId: string, passageId: string, subType: 'underline' | 'boxed') => void;
  onRemoveType: (typeId: string) => void;
}
export const TypeEntry = ({
  type,
  passages,
  onAddPassage,
  onRemovePassage,
  onTextChange,
  onTitleChange,
  onPasteValues,
  onOrderModeChange,
  onSummaryModeChange,
  onChoiceLanguageChange,
  onManualModeChange,
  onManualMarkersChange,
  onCombinedTypesChange,
  onParaphraseBlankChange,
  onSubTypeChange,
  onRemoveType
}: TypeEntryProps) => {
  const { toast } = useToast();
  const [showExampleDialog, setShowExampleDialog] = useState(false);
  
  const isSentenceMatcher = type.id === "sentenceSplitter";
  const isCustomQuestion = type.id === "customQuestion";
  const isSpecialVocabType = ["sungnamVocab1", "sungnamVocab2", "sungnamVocab3"].includes(type.id);
  const isOrderWritingType = ["orderWriting", "orderWritingKorean"].includes(type.id);
  const isImplicationType = type.id === "implication";
  const isBlankType = type.id === "blank";
  const isBlankMultipleType = type.id === "blankMultiple";
  const isInsertType = type.id === "insert";
  
  // 예시 문제 데이터
  const getExampleQuestion = () => {
    const examples: Record<string, { question: string; answer?: string; explanation?: string }> = {
      title: {
        question: "다음 글의 제목으로 가장 적절한 것은?\n\nThe selfie resonates not because it is new, but because it expresses, develops, expands, and intensifies the long history of the self-portrait. The self-portrait showed to others the status of the person depicted. In this sense, what we have come to call our own \"image\" — the interface of the way we think we look and the way others see us — is the first and fundamental object of global visual culture. The selfie depicts the drama of our own daily performance of ourselves in tension with our inner emotions that may or may not be expressed as we wish. At each stage of the self-portrait's expansion, more and more people have been able to depict themselves. Today's young, urban, networked majority has reworked the history of the self-portrait to make the selfie into the first visual signature of the new era.",
        answer: "① Are Selfies Just a Temporary Trend in Art History?\n② Fantasy or Reality: Your Selfie Is Not the Real You\n③ The Selfie: A Symbol of Self-oriented Global Culture\n④ The End of Self-portraits: How Selfies Are Taking Over\n⑤ Selfies, the Latest Innovation in Representing Ourselves",
        explanation: "정답은 ⑤번입니다. 지문은 셀카가 자화상의 오랜 역사를 표현하고 발전시켜왔으며, 오늘날 네트워크로 연결된 젊은 세대가 자화상의 역사를 재작업하여 새로운 시대의 첫 시각적 서명으로 만들었다고 설명합니다."
      },
      vocabulary: {
        question: "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?\n\nStudies in psychology have reported cases in which competitive incentives resulted in lower task effort, and their focus was on the psychological underpinnings of the reduction in motivation. For example, competition presents an inevitable conflict between the motivation to achieve one's personal goal and the ①aspiration to maintain good relationships with others. When the maintenance of interpersonal relationships is important, with their counterparts in particular or with others generally, competitors experience an ②intrinsic conflict that can harm their desire to achieve their goal and taint the good feeling brought about by winning. Exline and Lobel found that the perception of oneself as a target for upward social comparison often makes people ③disturbed When they believe that others are making envious comparisons with them, people feel uneasiness, distress, or sorrow. Feelings of guilt, an emotion generally associated with high motivation for goal-achievement, lead to ④weaker motivation and performance in the pursuit of competitive goals. Consequences of this emotional state include lower task motivation in a competition and preferences for more cooperative and altruistic outcomes, such as ⑤diminishing the significance of the outcome or sharing the winner's reward.",
        answer: "정답: ④",
        explanation: "④번 weaker는 문맥상 적절하지 않습니다. 지문에서 \"죄책감은 목표 달성을 위한 높은 동기와 관련된 감정\"이라고 했으므로, 경쟁 목표 추구에서 동기와 성과를 약화(weaker)시키는 것이 아니라 강화(stronger)시켜야 문맥에 맞습니다."
      },
      blank: {
        question: "다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오.\n\nA computational algorithm that takes input data and generates some output from it doesn't really embody any notion of meaning. Certainly, such a computation does not generally have as its purpose its own survival and wellbeing. It does not, in general, assign value to the inputs. Compare, for example, a computer algorithm with the waggle dance of the honeybee. The \"dance\" shows the bees how far away the food is and in which direction. But this input does not simply program other bees to go out and look for it. Rather, they evaluate this information, comparing it with their own knowledge of the surroundings. Some bees might not bother to make the journey, considering it not worthwhile. The input is processed in the light of the organism's own internal states and history. This shows that biological systems, unlike computer algorithms, ____________________________________________.\n\n① follow predetermined instructions without deviation\n② evaluate information based on their own experience and judgment\n③ rely solely on external inputs for decision-making\n④ process data faster than any artificial system\n⑤ lack the ability to adapt to changing environments",
        answer: "정답: ②",
        explanation: "정답은 ②번입니다. 지문은 컴퓨터 알고리즘과 달리 꿀벌과 같은 생물학적 시스템이 정보를 자신의 경험과 판단에 기초하여 평가한다는 내용입니다. 꿀벌들은 정보를 단순히 따르지 않고 자신의 지식과 비교하여 가치를 판단합니다."
      },
      blankMultiple: {
        question: "다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오.\n\nThe self-portrait showed to others the status of the person depicted. In this sense, what we have come to call our own \"image\" — the interface of the way we think we look and the way others see us — is the first and fundamental object of global visual culture. The selfie depicts the drama of our own daily performance of ourselves in tension with our inner emotions that may or may not be expressed as we wish. At each stage of the self-portrait's expansion, more and more people have been able to depict themselves. This evolution reflects how ________________________________________________.\n\n① technology has replaced the need for artistic expression\n② visual self-representation has become increasingly democratized\n③ professional artists have lost their influence in modern culture\n④ inner emotions have become less important in public display\n⑤ global culture has rejected traditional forms of portraiture",
        answer: "정답: ②",
        explanation: "정답은 ②번입니다. 지문은 자화상의 확장 각 단계에서 점점 더 많은 사람들이 자신을 묘사할 수 있게 되었다고 설명합니다. 이는 시각적 자기 표현이 점점 더 대중화(민주화)되었음을 의미합니다."
      },
      order: {
        question: "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오.\n\nClimate change is one of the most pressing issues of our time.\n\n(A) Scientists worldwide are working to develop solutions to reduce carbon emissions and slow global warming.\n\n(B) Rising temperatures are causing polar ice caps to melt, leading to sea level rise and extreme weather patterns.\n\n(C) These effects are already being felt across the globe, from devastating floods to prolonged droughts.",
        answer: "① (A)-(C)-(B)\n② (B)-(A)-(C)\n③ (B)-(C)-(A)\n④ (C)-(A)-(B)\n⑤ (C)-(B)-(A)",
        explanation: "정답: ③ (B)-(C)-(A)\n기후 변화의 원인(B) → 그 영향(C) → 해결책 모색(A) 순서가 가장 논리적입니다."
      },
      purpose: {
        question: "다음 글의 목적으로 가장 적절한 것은?\n\nDear Parents,\n\nWe are writing to inform you about the upcoming school science fair scheduled for next month. This event provides a wonderful opportunity for students to showcase their scientific projects and learn from their peers. We encourage all students to participate and invite their families to attend the exhibition on the final day.",
        answer: "① 과학 박람회 개최를 알리려고\n② 학부모 회의 참석을 요청하려고\n③ 실험 재료 기부를 부탁하려고\n④ 과학 프로젝트 결과를 공유하려고\n⑤ 특별 강연 일정을 공지하려고",
        explanation: "정답: ① 편지의 첫 문장에서 'inform you about the upcoming school science fair'라고 명시하여 과학 박람회 개최를 알리는 것이 목적임을 알 수 있습니다."
      },
      claim: {
        question: "다음 글에서 필자가 주장하는 바로 가장 적절한 것은?\n\nRegular exercise is not just about physical health; it significantly impacts mental well-being. Studies show that consistent physical activity reduces stress, improves mood, and enhances cognitive function. Therefore, incorporating exercise into daily routines should be a priority for everyone seeking a balanced and healthy lifestyle.",
        answer: "① 규칙적인 운동은 정신 건강에도 중요하다\n② 건강한 식습관이 운동보다 우선이다\n③ 운동은 아침에 하는 것이 가장 효과적이다\n④ 과도한 운동은 오히려 해롭다\n⑤ 운동 전문가의 조언을 받아야 한다",
        explanation: "정답: ① 지문은 규칙적인 운동이 신체 건강뿐만 아니라 정신적 웰빙에도 큰 영향을 미친다는 것을 강조합니다."
      },
      implication: {
        question: "다음 글의 밑줄 친 부분이 의미하는 바로 가장 적절한 것은?\n\nIn the corporate world, the phrase \"thinking outside the box\" has become a cliché. However, what many fail to realize is that the box itself is often an illusion. When managers tell their employees to think creatively, they frequently do so within invisible constraints that limit true innovation. The real challenge is not to think outside the box, but to recognize that [the walls of the box are made of assumptions we've never questioned].\n\n① 창의적 사고는 기업 문화에서 중요하지 않다\n② 우리가 당연시하는 전제들이 혁신을 가로막는 진짜 장벽이다\n③ 직원들은 상사의 지시를 더 잘 따라야 한다\n④ 기업의 규칙과 절차는 반드시 지켜져야 한다\n⑤ 창의성은 타고나는 것이지 배울 수 있는 것이 아니다",
        answer: "정답: ②",
        explanation: "정답은 ②번입니다. 밑줄 친 부분 '상자의 벽은 우리가 한 번도 의문을 제기하지 않은 가정들로 이루어져 있다'는 우리가 당연시하는 전제들이 진정한 혁신을 가로막는 보이지 않는 제약이라는 의미입니다."
      },
      summary: {
        question: "다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?\n\nThe arrival of the Industrial Age changed the relationship among time, labor, and capital. Factories could produce around the clock, and they could do so with greater speed and volume than ever before. A machine that runs twelve hours a day will produce more widgets than one that runs for only eight hours per day.\n\nIndustrialization (A)_______ the value of work hours by enabling continuous production, which led to wages becoming more closely (B)_______ to effort and time spent working.\n\n     (A)          (B)\n① reduced …… opposed\n② maintained …… related\n③ increased …… tied\n④ limited …… connected\n⑤ decreased …… linked",
        answer: "정답: ③",
        explanation: "정답은 ③번입니다. 산업화는 연속적인 생산을 가능하게 함으로써 근무 시간의 가치를 증가(increased)시켰고, 이로 인해 임금이 노력과 근무 시간에 더욱 밀접하게 연결(tied)되었습니다."
      },
      topic: {
        question: "다음 글의 주제로 가장 적절한 것은?\n\nThe arrival of the Industrial Age changed the relationship among time, labor, and capital. Factories could produce around the clock, and they could do so with greater speed and volume than ever before. Thus wages became tied to effort and production. Labor, previously guided by harvest cycles, became clock-oriented, and society started to reorganize around new principles of productivity.",
        answer: "① shift in the work-time paradigm brought about by industrialization\n② effects of standardizing production procedures on labor markets\n③ influence of industrialization on the machine-human relationship\n④ efficient ways to increase the value of time in the Industrial Age\n⑤ problems that excessive work hours have caused for laborers",
        explanation: "정답: ① 지문은 산업화가 시간, 노동, 자본의 관계를 어떻게 변화시켰는지, 특히 노동이 수확 주기가 아닌 시계 중심으로 바뀌었다는 내용을 다루고 있습니다."
      },
      mood: {
        question: "다음 글에 드러난 'Sarah'의 심경 변화로 가장 적절한 것은?\n\nSarah stared at the rejection letter, feeling her dreams crumble. After months of preparation, she couldn't believe she didn't make it. Days passed in disappointment. Then, unexpectedly, her professor called with an alternative opportunity—one even better than what she had originally hoped for. Sarah's spirits lifted as she realized this setback had opened a new door.",
        answer: "① indifferent → grateful\n② disappointed → hopeful\n③ anxious → relieved\n④ confident → devastated\n⑤ excited → discouraged",
        explanation: "정답: ② Sarah는 처음에 거절 편지를 받고 실망했지만(disappointed), 교수로부터 더 좋은 기회에 대한 전화를 받고 희망적으로(hopeful) 변했습니다."
      },
      mainPoint: {
        question: "다음 글의 요지로 가장 적절한 것은?\n\nThe ability to understand emotions is particularly relevant in group settings. Individuals who are skilled in this domain are able to express emotions accurately and thus may facilitate clear communication between co-workers. They may be more likely to act in ways that accommodate their own needs as well as the needs of others. Appreciation of differences creates an arena for open communication and promotes constructive conflict resolution.",
        answer: "① 감정 이해 능력은 집단 내 원활한 소통과 협력을 촉진한다.\n② 타인에 대한 공감 능력은 자신의 감정 표현 능력을 향상한다.\n③ 자신의 감정 상태에 대한 이해는 사회성 함양에 필수적 요소이다.\n④ 감정 관련 어휘에 대한 지식은 공감 능력 발달의 기반이 된다.\n⑤ 집단 구성원 간 갈등 해소를 위해 감정 조절이 중요하다.",
        explanation: "정답: ① 글은 감정을 이해하는 능력이 집단 환경에서 명확한 의사소통을 촉진하고 건설적인 갈등 해결을 촉진한다는 내용입니다."
      },
      insert: {
        question: "글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오.\n\nThis discovery changed everything we knew about the species.\n\nScientists had long believed that the animal was extinct. ( ① ) For decades, no sightings had been reported. ( ② ) Then, a team of researchers ventured into a remote forest. ( ③ ) There, they found clear evidence of the creature's existence. ( ④ ) The finding prompted immediate conservation efforts. ( ⑤ )",
        answer: "정답: ④",
        explanation: "정답: ④ '이 발견은 우리가 그 종에 대해 알던 모든 것을 바꾸어 놓았다'는 문장은 생물체의 존재 증거를 발견한 직후, 보존 노력이 시작되기 전에 오는 것이 자연스럽습니다."
      },
      irrelevant: {
        question: "다음 글에서 전체 흐름과 관계 없는 문장은?\n\nRegular physical exercise has numerous health benefits. ① It strengthens the cardiovascular system and improves overall fitness. ② Many gyms offer specialized equipment for different workout needs. ③ Exercise also helps reduce stress and anxiety levels. ④ Studies show that active individuals tend to have better sleep quality. ⑤ Furthermore, regular activity can boost immune system function.",
        answer: "정답: ②",
        explanation: "정답: ② '많은 체육관이 다양한 운동 필요에 맞는 전문 장비를 제공한다'는 운동의 건강상 이점에 대한 전체 흐름과 관계가 없습니다."
      },
      grammar: {
        question: "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?\n\nThe ability to understand emotions ①is particularly relevant in group settings. Individuals who are skilled in this domain ②are able to express emotions accurately and thus may facilitate clear communication between co-workers. They may be more likely to act in ways ③that accommodate their own needs as well as the needs of others. Appreciation of differences ④create an arena for open communication and ⑤promotes constructive conflict resolution.",
        answer: "정답: ④",
        explanation: "정답: ④ 주어 'Appreciation of differences'가 단수이므로 동사도 단수형 'creates'가 되어야 합니다. 'create'는 복수형 동사이므로 어법상 틀립니다."
      },
      contentMismatch: {
        question: "다음의 내용과 일치하지 않는 것을 고르시오.\n\nThe museum will be open from 9 AM to 6 PM on weekdays. Weekend hours are extended until 8 PM. Adult admission is $15, while students pay $10. Children under 5 enter free. Special exhibitions require an additional $5 fee. The museum is closed on Mondays.",
        answer: "① The museum opens at 9 AM on weekdays.\n② Weekend closing time is 8 PM.\n③ Student tickets cost $10.\n④ Children under 5 must pay admission.\n⑤ Special exhibitions have an extra charge.",
        explanation: "정답: ④ 지문에서는 5세 미만 어린이는 무료 입장이라고 명시되어 있으므로, ④번의 '5세 미만 어린이는 입장료를 지불해야 한다'는 내용과 일치하지 않습니다."
      },
      contentMatch: {
        question: "다음의 내용과 일치하는 것을 고르시오.\n\nThe conference will take place on June 15-17 at the Grand Hotel. Registration opens at 8 AM each day. Lunch is included in the registration fee. Participants will receive a certificate upon completion. The keynote speech begins at 9 AM on the first day.",
        answer: "① The conference lasts for two days.\n② Registration starts at 9 AM.\n③ Participants must pay extra for lunch.\n④ A certificate is provided after the conference.\n⑤ The keynote speech is on the second day.",
        explanation: "정답: ④ 지문에서 '참가자들은 완료 시 수료증을 받게 된다'고 명시되어 있어 ④번 내용과 일치합니다."
      },
      trueOrFalse: {
        question: "다음 글의 내용으로 옳고 그름(T/F)을 고르시오.\n\nThe Amazon rainforest produces 20% of the world's oxygen. It is home to millions of plant and animal species. Deforestation rates have decreased significantly in recent years. The forest plays a crucial role in regulating global climate.\n\n1. The Amazon generates one-fifth of global oxygen. (T/F)\n2. The forest contains billions of species. (T/F)\n3. Forest clearing has reduced lately. (T/F)\n4. The Amazon affects worldwide climate patterns. (T/F)",
        answer: "[정답] 1. T, 2. F, 3. T, 4. T",
        explanation: "1. True: 지문에서 아마존이 세계 산소의 20%(1/5)를 생산한다고 명시했다.\n2. False: 지문에서는 '수백만(millions)' 종이라고 했지 '수십억(billions)'이라고 하지 않았다.\n3. True: 최근 몇 년간 삼림 파괴율이 크게 감소했다고 언급되었다.\n4. True: 아마존이 지구 기후 조절에 중요한 역할을 한다고 명시되었다."
      },
      orderWriting: {
        question: "[서답형] 다음 글을 읽고, 물음에 답하시오.\n\nWhen writing a novel, research for information needs to be done. The thing is that some kinds of fiction demand a higher level of detail: crime fiction, for example, or scientific thrillers. The information is never hard to find; one website for authors even organizes trips to police stations, so that crime writers can get it right. Often, a polite letter will earn you permission to visit a particular location and record all the details that you need. But remember that (A) [to / boredom / you / will / drive / your / readers / if / you / think / that / you / need / to / pack / everything / you / discover / into / your / work.] (B) [The / details / that / matter / are / those / that / reveal / the / human / experience.] The crucial thing is telling a story, finding the characters, the tension, and the conflict—not the train timetable or the building blueprint.\n\n(A)를 어법에 맞게 주어진 단어를 배열하시오.\nto / boredom / you / will / drive / your / readers / if / you / think / that / you / need / to / pack / everything / you / discover / into / your / work.\n\n(B)를 어법에 맞게 주어진 단어를 배열하시오.\nThe / details / that / matter / are / those / that / reveal / the / human / experience.",
        answer: "[정답]\n(A) you will drive your readers to boredom if you think that you need to pack everything you discover into your work.\n(B) The details that matter are those that reveal the human experience.",
        explanation: "각 문장을 문법에 맞게 배열하여 의미가 통하는 완전한 문장을 만들어야 합니다."
      },
      orderWritingKorean: {
        question: "다음 글을 읽고, 우리말과 같은 의미가 되도록 주어진 단어를 배열하여 문장을 완성하시오.\n\n[예시 지문]\nThe selfie resonates not because it is new, but because it expresses, develops, expands, and intensifies the long history of the self-portrait.\n\n[A] 셀카는 새롭기 때문이 아니라 자화상의 오랜 역사를 표현하고 발전시키기 때문에 공감을 불러일으킨다.\n\n단어: not / new / it / resonates / because / is / the / but / selfie\n\n[B] 그것은 자화상의 오랜 역사를 표현하고, 발전시키고, 확장하고, 강화한다.\n\n단어: expresses / the / of / it / develops / history / self-portrait / long / and / expands / intensifies / the",
        answer: "[정답]\n[A] the selfie resonates not because it is new but\n[B] it expresses develops expands and intensifies the long history of the self-portrait",
        explanation: "우리말 번역에 맞춰 주어진 단어들을 올바른 순서로 배열하여 문법적으로 정확한 영어 문장을 완성합니다."
      },
      summaryVocab: {
        question: "다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.\n\nThe rise of social media has fundamentally transformed how businesses interact with consumers. Traditional marketing relied on one-way communication through television, radio, and print advertisements. Companies broadcast their messages hoping to reach their target audience. However, social media platforms have created a two-way dialogue where consumers can directly engage with brands, share feedback, and influence other potential customers. This shift has forced companies to become more transparent and responsive. They must now actively listen to customer concerns, address complaints publicly, and build genuine relationships. The power dynamic has shifted from companies controlling the message to consumers having a significant voice in shaping brand perception. Successful businesses now view social media not just as a marketing tool but as a crucial platform for customer service and community building.\n\n[요약문]\nSocial media has transformed business-consumer interaction from one-way (A)__________ to two-way dialogue, shifting power to consumers and forcing companies to become more (B)__________ while building genuine (C)__________ with their audience.\n\n(A) ________________________\n(B) ________________________\n(C) ________________________",
        answer: "[정답]\n(A) communication\n(B) transparent\n(C) relationships",
        explanation: "[해설]\n- (A) communication: 원문에서 \"Traditional marketing relied on one-way communication\"이라고 명시되어 있으며, 전통적 마케팅의 핵심 특징을 나타낸다.\n- (B) transparent: 원문에서 \"This shift has forced companies to become more transparent and responsive\"라고 언급되어 있으며, 소셜 미디어로 인한 기업의 변화를 보여준다.\n- (C) relationships: 원문에서 \"build genuine relationships\"라고 명시되어 있으며, 기업이 고객과 구축해야 하는 새로운 관계의 본질을 나타낸다."
      },
      summaryBlankWriting: {
        question: "다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)에 들어갈 말로 가장 적절한 것을 고르시오.\n\nA computational algorithm that takes input data and generates some output from it doesn't really embody any notion of meaning. Certainly, such a computation does not generally have as its purpose its own survival and wellbeing. It does not, in general, assign value to the inputs. Compare, for example, a computer algorithm with the waggle dance of the honeybee, by which means a foraging bee conveys to others in the hive information about the source of food (such as nectar) it has located. The \"dance\" ― a series of stylized movements on the comb ― shows the bees how far away the food is and in which direction. But this input does not simply program other bees to go out and look for it. Rather, they evaluate this information, comparing it with their own knowledge of the surroundings. Some bees might not bother to make the journey, considering it not worthwhile. The input, such as it is, is processed in the light of the organism's own internal states and history; there is nothing prescriptive about its effects.\n\n<요약문>\nUnlike computer algorithms that simply follow instructions without understanding, biological systems like honeybees (A)___________________________ based on their own knowledge and internal states.\n\n<보기>\nevaluate / information / and / make / decisions\n\n[정답] evaluate information and make decisions",
        answer: "[정답] evaluate information and make decisions",
        explanation: "[해설] 정답의 모든 단어(evaluate, information, and, make, decisions)가 보기에 정확히 포함되어 있으며, 이는 원문에서 꿀벌들이 정보를 평가하고(evaluate this information) 자신의 지식을 바탕으로 판단한다는 내용을 반영합니다."
      },
      topicWriting: {
        question: "다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.\n\nThe rise of social media has fundamentally changed the way people communicate and share information. Platforms like Facebook, Twitter, and Instagram allow users to instantly connect with others across the globe, breaking down geographical barriers that once limited human interaction. This technology enables individuals to share their thoughts, experiences, and ideas with a vast audience, creating new opportunities for expression and collaboration. However, this transformation also brings challenges, including concerns about privacy, the spread of misinformation, and the impact on mental health.\n\n[조건]\n1) 10단어로 빈칸을 완성하시오.\n2) 다음 단어를 한 번씩 사용하여 배열하시오.\n\n보기: communication / media / has / and / social / information / sharing / transformed / people / globally\n\n주제문: __________________________________________.",
        answer: "[정답] social media has transformed people communication and information sharing globally",
        explanation: "[해설] 주어진 10개의 단어를 올바른 순서로 배열하여 지문의 핵심 주제인 '소셜 미디어가 전 세계적으로 사람들의 소통과 정보 공유 방식을 변화시켰다'는 내용을 담은 문법적으로 완전한 문장을 완성합니다."
      },
      summaryBlank: {
        question: "다음 글의 내용과 일치하도록 <보기>의 빈칸 (A)와 (B)에 알맞은 단어를 글에서 찾아 그대로 쓰시오.\n\nA computational algorithm that takes input data and generates some output from it doesn't really embody any notion of meaning. Certainly, such a computation does not generally have as its purpose its own survival and wellbeing. It does not, in general, assign value to the inputs. Compare, for example, a computer algorithm with the waggle dance of the honeybee, by which means a foraging bee conveys to others in the hive information about the source of food (such as nectar) it has located. The \"dance\" ― a series of stylized movements on the comb ― shows the bees how far away the food is and in which direction. But this input does not simply program other bees to go out and look for it. Rather, they evaluate this information, comparing it with their own knowledge of the surroundings. Some bees might not bother to make the journey, considering it not worthwhile. The input, such as it is, is processed in the light of the organism's own internal states and history; there is nothing prescriptive about its effects.\n\n<보기>\nUnlike computer algorithms that simply follow instructions without understanding, biological systems like honeybees show true intelligence. When bees receive (A) _______ through the waggle dance about food locations, they don't just follow the directions automatically. Instead, they use their judgment to decide whether the trip is worth making based on their own (B) _______.",
        answer: "[정답] (A) information (B) knowledge",
        explanation: "빈칸 (A)에는 \"information\"이 들어가는데, 이는 원문에서 꿀벌이 8자 춤을 통해 \"information about the source of food\"를 전달한다고 명시되어 있기 때문이다. 빈칸 (B)에는 \"knowledge\"가 들어가는데, 원문에서 꿀벌들이 \"their own knowledge of the surroundings\"와 비교한다고 언급되어 있기 때문이다."
      },
      blankWriting: {
        question: "[서답형] 다음 글을 읽고, 빈칸에 들어갈 말을 주어진 조건에 맞게 영작하시오.\n\nThe arrival of the Industrial Age changed the relationship among time, labor, and capital. Factories could produce around the clock, and they could do so with greater speed and volume than ever before. Thus wages became tied to effort and production. Labor, previously guided by harvest cycles, became clock-oriented, and society started to reorganize around new principles of productivity. This fundamental shift meant that __________________________________.\n\n[조건]\n1) 8단어 이상 12단어 이하로 작성하시오.\n2) 다음 단어를 반드시 포함하시오: time, value, money\n3) 지문의 내용에 부합하게 작성하시오.",
        answer: "[정답] time became directly linked to value and money (8단어)\n또는: time itself gained value and became equivalent to money (9단어)",
        explanation: "[해설] 지문은 산업화 이후 시간과 노동, 자본의 관계가 변화했으며 임금이 노력과 생산에 연결되었다는 내용입니다. 따라서 '시간이 직접적으로 가치와 돈에 연결되었다'는 내용이 적절합니다."
      },
      collocation: {
        question: "두 단어의 관계가 다음과 같은 것은 몇 개인가?\n<보기> eligible - qualified\n\nfoster - promote\ntimber - lumber\nmourn - rejoice\ncontend - compete\nabundant - scarce\nhaunt - obsess\ndispense - distribute\nfurnish - equip\ngradually - abruptly\n\n① 3개 ② 4개 ③ 5개 ④ 6개 ⑤ 7개",
        answer: "[정답] ④ 6개",
        explanation: "정답은 ④번 6개입니다. <보기>의 단어 관계는 동의어 관계입니다. eligible(자격이 있는)과 qualified(자격을 갖춘)는 같은 의미를 가진 단어들입니다. 주어진 단어 쌍 중에서 동의어 관계인 것은 foster-promote(육성하다-촉진하다), timber-lumber(목재-목재), contend-compete(다투다-경쟁하다), haunt-obsess(사로잡다-사로잡다), dispense-distribute(분배하다-분배하다), furnish-equip(제공하다-장비를 갖추다)입니다. 반면 mourn-rejoice(슬퍼하다-기뻐하다), abundant-scarce(풍부한-부족한), gradually-abruptly(점진적으로-갑자기)는 반의어 관계입니다."
      },
      dictionary: {
        question: "<보기 1>의 단어 중, <보기 2>에 영영사전 뜻풀이가 없는 것은 몇 개인가?\n\n<보기1>\nabundant, scarce, derive, enhance, diminish, sustain\n\n<보기2>\na. to get something from something else\nb. existing in large quantities; more than enough\nc. to improve the quality, amount, or strength of something\nd. to make something continue at the same level or rate\ne. very small in amount or number; not enough\nf. relating to the act of making something smaller or less important\n\n① 1개 ② 2개 ③ 3개 ④ 4개 ⑤ 5개",
        answer: "[정답] ① 1개",
        explanation: "정답은 ①번 1개입니다.\nabundant - b (existing in large quantities)\nscarce - e (very small in amount or number)\nderive - a (to get something from something else)\nenhance - c (to improve the quality)\ndiminish - 매칭되는 뜻풀이 없음 (f는 명사형 설명)\nsustain - d (to make something continue)"
      },
      reference: {
        question: "다음 보기의 ⓐ~ⓕ 중, 아래 글의 주제와 부합하는 사례는 모두 몇 개인가?\n\nSocial media has fundamentally changed how people communicate and share information. It allows instant connection with others worldwide, but it also raises concerns about privacy and misinformation.\n\n[보기]\nⓐ A teenager connects with relatives overseas through video calls.\nⓑ A company experiences data breach exposing customer information.\nⓒ Ancient civilizations used smoke signals to communicate.\nⓓ False news stories spread rapidly on social platforms.\nⓔ People spend more time reading printed newspapers.\nⓕ Online communities form around shared interests.\n\n① 2개 ② 3개 ③ 4개 ④ 5개 ⑤ 6개",
        answer: "[정답] ③ 4개",
        explanation: "정답은 ③번입니다. 본문은 '소셜 미디어가 커뮤니케이션과 정보 공유 방식을 변화시켰으나 프라이버시와 잘못된 정보에 대한 우려도 있다'를 주제로 다룹니다. 각 보기를 본문과 비교하면:\nⓐ 부합 (소셜 미디어를 통한 전 세계적 연결)\nⓑ 부합 (프라이버시 우려)\nⓒ 부합하지 않음 (고대 문명은 소셜 미디어와 무관)\nⓓ 부합 (잘못된 정보 확산)\nⓔ 부합하지 않음 (인쇄 신문은 소셜 미디어의 반대)\nⓕ 부합 (소셜 미디어를 통한 커뮤니티 형성)"
      },
      referenceInference: {
        question: "다음 글에서 밑줄 친 부분 중, 가리키는 대상이 나머지 넷과 다른 것은?\n\n① Maria loves painting. ② She spends hours in her studio every day. ③ Her artwork has been displayed in several galleries. ④ The artist believes creativity comes from dedication. ⑤ However, her sister prefers music and plays the violin professionally.",
        answer: "[정답] ⑤",
        explanation: "정답은 ⑤번입니다. ①②③④는 모두 Maria를 가리키지만, ⑤의 'her sister'는 Maria의 자매를 가리키므로 다른 대상입니다."
      },
      conjunction: {
        question: "다음 글의 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?\n\nMany people believe that technology makes life easier. (A)_____, it can also create new challenges. (B)_____, excessive screen time has been linked to sleep problems and reduced social interaction.\n\n① (A) However ...... (B) For example\n② (A) Therefore ...... (B) In addition\n③ (A) Moreover ...... (B) Nevertheless\n④ (A) In fact ...... (B) On the other hand\n⑤ (A) Thus ...... (B) As a result",
        answer: "[정답] ①",
        explanation: "정답은 ①번입니다.\n(A): However - 기술이 삶을 편하게 한다는 주장과 반대되는 내용이 나오므로 역접 접속사가 필요합니다.\n(B): For example - 새로운 도전(challenges)에 대한 구체적인 예시를 제시하고 있습니다."
      },
      vocabularyThreeBlanks: {
        question: "다음 글의 문맥상 (A), (B), (C)에 들어갈 단어로 가장 적절한 것은?\n\nA computational algorithm that takes input data and generates some output from it doesn't really embody any notion of meaning. Compare, for example, a computer algorithm with the waggle dance of the honeybee. The dance shows the bees how far away the food is and in which direction. But this input does not simply (A)[program / evaluate] other bees to go out and look for it. Rather, they (B)[ignore / evaluate] this information, comparing it with their own knowledge of the surroundings. The input is processed in the light of the organism's own internal states; there is nothing (C)[prescriptive / descriptive] about its effects.\n\n① program - ignore - prescriptive\n② program - evaluate - descriptive\n③ program - evaluate - prescriptive\n④ evaluate - ignore - descriptive\n⑤ evaluate - evaluate - prescriptive",
        answer: "[정답] ③",
        explanation: "이 글의 핵심 주제는 '컴퓨터 알고리즘과 달리 생물학적 시스템은 정보를 단순히 따르지 않고 평가하여 처리한다'입니다.\n(A) = program: 꿀벌들이 춤의 정보를 단순히 프로그램처럼 따르지 않는다는 의미입니다.\n(B) = evaluate: 꿀벌들이 정보를 평가(evaluate)하여 자신의 지식과 비교한다고 설명합니다.\n(C) = prescriptive: 입력 정보가 처방적(prescriptive)이지 않다, 즉 반드시 따라야 하는 것이 아니라는 의미입니다."
      },
      contentMatchMultiple: {
        question: "다음 보기의 ⓐ~ⓗ 중, 아래 글의 내용과 일치하지 않는 것은 모두 몇 개인가?\n\nThe museum will be open from 9 AM to 6 PM on weekdays. Weekend hours are extended until 8 PM. Adult admission is $15, while students pay $10. Children under 5 enter free. Special exhibitions require an additional $5 fee. The museum is closed on Mondays.\n\n보기\nⓐ The museum opens at 9 AM on weekdays.\nⓑ Weekend closing time is 10 PM.\nⓒ Adult tickets cost $15.\nⓓ Students receive free admission.\nⓔ Children under 5 must pay admission.\nⓕ Special exhibitions have an extra charge.\nⓖ The museum is open every day of the week.\nⓗ Student tickets cost $10.\n\n① 2개 ② 3개 ③ 4개 ④ 5개 ⑤ 6개",
        answer: "[정답] ③ 4개(ⓑ,ⓓ,ⓔ,ⓖ)",
        explanation: "정답은 ③번 4개입니다.\nⓐ 일치: 평일 9시 개관\nⓑ 불일치: 주말은 8 PM까지이지 10 PM이 아님\nⓒ 일치: 성인 입장료 $15\nⓓ 불일치: 학생은 $10이지 무료가 아님\nⓔ 불일치: 5세 미만은 무료 입장\nⓕ 일치: 특별 전시는 추가 $5\nⓖ 불일치: 월요일 휴관\nⓗ 일치: 학생 티켓 $10"
      },
      contentMatchMultipleAnswer: {
        question: "다음 글의 내용과 일치하는 것을 모두 고르시오.\n\nThe annual science fair will be held from March 15 to March 17 at the community center. All students from grades 6-12 are eligible to participate. Each participant may submit up to two projects. Registration deadline is February 28. Winners will receive cash prizes ranging from $50 to $500. The event is open to the public on the final day only.\n\n① The fair lasts for three days.\n② Elementary school students can participate.\n③ Participants can submit multiple projects.\n④ Registration closes in March.\n⑤ The public can attend all three days.\n⑥ Prize money is available for winners.\n⑦ The event takes place at a school gymnasium.",
        answer: "[정답] ①, ③, ⑥",
        explanation: "정답은 ①, ③, ⑥입니다.\n① 일치: 3월 15일~17일로 3일간 진행\n② 불일치: 6-12학년만 참가 가능 (초등학생 제외)\n③ 일치: 각 참가자당 최대 2개 프로젝트 제출 가능\n④ 불일치: 등록 마감은 2월 28일\n⑤ 불일치: 마지막 날만 일반 공개\n⑥ 일치: 우승자에게 $50~$500의 상금 제공\n⑦ 불일치: 커뮤니티 센터에서 개최 (체육관 아님)"
      },
      dialogueMismatch: {
        question: "다음 글의 내용에 비추어 볼 때, 밑줄 친 대화 중 가장 적절하지 않은 것은?\n\nEffective communication requires active listening and genuine interest in the other person's perspective. It involves asking clarifying questions, avoiding interruptions, and providing thoughtful responses. Good communicators also pay attention to non-verbal cues and adjust their approach based on the listener's reactions.\n\n① A: \"I'm having trouble with my project.\"\n   B: \"Tell me more about what's challenging you.\"\n\n② A: \"I disagree with the new policy.\"\n   B: \"I understand your concern. What specific aspects bother you?\"\n\n③ A: \"I've been feeling overwhelmed lately.\"\n   B: \"Anyway, let me tell you about my weekend plans.\"\n\n④ A: \"I'm not sure about this decision.\"\n   B: \"What factors are making you hesitant?\"\n\n⑤ A: \"I think we should try a different approach.\"\n   B: \"That's interesting. Could you explain your reasoning?\"",
        answer: "[정답] ③",
        explanation: "정답은 ③번입니다. 효과적인 의사소통은 상대방의 관점에 대한 진정한 관심을 요구합니다. ③번에서 B는 A가 압도당하는 느낌을 공유했음에도 불구하고 화제를 자신의 주말 계획으로 바꾸며, 이는 적극적 경청과 상대방에 대한 관심이라는 원칙에 위배됩니다."
      },
      synonymAntonym: {
        question: "주어진 지문에서 중요한 단어들을 추출하고, 각 단어에 대해 동의어와 반의어를 제공하는 표를 만들어주세요.\n\n| 표제어 | 표제어뜻 | 동의어 | 동의어뜻 | 반의어 | 반의어뜻 |\n|--------|----------|--------|----------|--------|----------|\n| abundant | 풍부한 | plentiful | 많은 | scarce | 부족한 |\n| | | ample | 충분한 | limited | 제한된 |\n| enhance | 향상시키다 | improve | 개선하다 | diminish | 감소시키다 |\n| | | boost | 증진하다 | weaken | 약화시키다 |",
        answer: "[정답] 동의어/반의어 표",
        explanation: "주어진 지문에서 최소 15개 이상의 중요한 단어들을 추출하여 각 단어에 대한 동의어(최대 3개)와 반의어(최대 3개)를 한국어 뜻과 함께 제공합니다."
      },
      danggokUnanswerable: {
        question: "다음 글을 읽고, 아래 <보기>에서 답할 수 없는 질문을 모두 고르시오.\n\nThe Amazon rainforest produces 20% of the world's oxygen. It is home to millions of plant and animal species. Deforestation rates have decreased significantly in recent years. The forest plays a crucial role in regulating global climate.\n\n<보기>\na. What percentage of oxygen does the Amazon produce?\nb. How many species live in the Amazon?\nc. What is the current deforestation rate?\nd. What role does the Amazon play in climate?\ne. When was the Amazon discovered?\nf. How much oxygen is produced daily?\ng. What is the Amazon's total area?\nh. What climate patterns does it regulate?\ni. How many trees are in the Amazon?\nj. What conservation efforts exist?\n\n[정답] 5개(c, e, f, g, i)",
        answer: "[정답] 5개(c, e, f, g, i)",
        explanation: "답할 수 있는 질문:\na: 지문에서 20%라고 명시\nb: 지문에서 millions of species라고 언급\nd: 지문에서 regulating global climate라고 명시\nh: 지문에서 climate regulation role 언급\nj: 지문에서 conservation 관련 추론 가능\n\n지문에서 답을 찾을 수 없는 질문:\nc: 구체적인 현재 삼림파괴율 수치 없음\ne: 아마존 발견 시기 언급 없음\nf: 일일 산소 생산량 구체적 수치 없음\ng: 총 면적 정보 없음\ni: 나무 총 개수 정보 없음"
      },
      seongnamDictionary: {
        question: "밑줄 친 단어의 영어 뜻풀이로 가장 적절한 것을 고르시오.\n\nThe oil spill, which **contaminated** hundreds of kilometers of coastline, destroyed not only marine life but also the livelihood of local fishermen.\n\n① to make something impure or harmful by mixing it with another substance or influence that reduces its safety, cleanliness, or quality.\n\n② to give reasons or explanations showing that an action, decision, or belief is reasonable or acceptable.\n\n③ to state a belief or opinion with confidence and force, especially in situations that others may disagree or challenge it.\n\n④ to continue experiencing pain, hardship, or difficulty for a long period of time without giving up or being defeated.\n\n⑤ to bring something that has declined or disappeared back into activity, strength, or popularity so that it flourishes again.",
        answer: "[정답] ①",
        explanation: "정답은 ①번입니다. 'contaminate'는 '오염시키다'라는 뜻으로, 다른 물질이나 영향을 섞어 안전성, 청결성, 품질을 떨어뜨려 불순하거나 해롭게 만드는 것을 의미합니다."
      },
      seongnamExampleUsage: {
        question: "다음 주어진 문장들의 빈칸에 공통으로 들어갈 알맞은 단어를 고르시오.\n\n* Several politicians __________ that education reform should be the government's top priority.\n* Although critics __________ the policy will harm small businesses, the government decided to proceed.\n\n① extend    ② prolong    ③ scale    ④ contend    ⑤ execute",
        answer: "[정답] ④",
        explanation: "정답은 ④번 contend입니다. contend는 '주장하다, 논쟁하다'라는 의미로 두 문장 모두에 적절합니다."
      },
      seongnamUnderlineExample: {
        question: "다음 글의 밑줄 친 부분에 해당하는 예시가 아닌 것은?\n\nWhen we get an unfavorable outcome, in some ways the last thing we want to hear is that the process was fair. **As outrageous as the combination of an unfavorable outcome and an unfair process is, this combination also brings with it a consolation prize: the possibility of attributing the bad outcome to something other than ourselves.** We may reassure ourselves by believing that our bad outcome had little to do with us and everything to do with the unfair process. If the process is fair, however, we cannot nearly as easily externalize the outcome; we got what we got \"fair and square.\" When the process is fair we believe that our outcome is deserved, which is another way of saying that there must have been something about ourselves (what we did or who we are) that caused the outcome.\n\n① Our class was disappointed to lose at the final soccer game because of the referee's questionable calls, but we decided to admit our weak strategy for the lost game\n② When our class lost the basketball game, the referee's missing the other team's foul was, in a way, a consolation for me.\n③ I attribute my unsuccessful job interview to the interviewer, as the final candidate selected turned out to be his cousin.\n④ The reason I lost to my friend in the mobile game was that he had better characters than I did\n⑤ Because the crowd was unusually noisy during our team's golf shots, we ended up losing the match and blamed the association for inadequate game management.",
        answer: "[정답] ①",
        explanation: "밑줄 친 부분은 '불리한 결과와 불공정한 과정의 조합이 자신이 아닌 다른 것에 나쁜 결과를 돌릴 수 있는 위안을 준다'는 의미입니다. ①번은 불공정한 과정(심판의 의심스러운 판정)에도 불구하고 자신의 잘못(약한 전략)을 인정하므로 밑줄 친 부분에 해당하지 않습니다."
      },
      seongnamClaimDouble: {
        question: "다음 글에서 필자가 주장하는 바를 2개 고르시오.\n\nOne well-known shift took place when the accepted view—that the Earth was the center of the universe—changed to one where we understood that we are only inhabitants on one planet orbiting the Sun. With each person who grasped the solar system view, it became easier for the next person to do so. So it is with the notion that the world revolves around the human economy. This is slowly being replaced by the view that the economy is a part of the larger system of material flows that connect all living things. When this perspective shifts into place, it will be obvious that our economic well-being requires that we account for, and respond to, factors of ecological health. Unfortunately we do not have a century or two to make the change. By clarifying the nature of the old and new perspectives, and by identifying actions on which we might cooperate to move the process along, we can help accelerate the shift.\n\n① Thoroughly examine various viewpoints and reach a sound decision to support a progressive measure.\n② Respect what ordinary people think and share a common perspective of what to aspire.\n③ Improve people's awareness of the need for the change and challenge established ideas when necessary.\n④ Hold on to the given agreement that reflect the collective worldview and soften an overheated discussion.\n⑤ The acceptance of novel ideas is often driven by the belief that they might contribute to the extension of human life.",
        answer: "[정답] ①, ③",
        explanation: "필자는 경제가 생태계의 일부라는 새로운 관점으로의 전환을 가속화해야 한다고 주장합니다. 이를 위해 '기존 관점과 새로운 관점의 본질을 명확히 하기'와 '협력할 수 있는 행동을 파악하기'를 제시합니다. 따라서 ① 다양한 관점을 철저히 검토하여 진보적인 조치를 지지하는 건전한 결정에 도달하는 것과, ③ 변화의 필요성에 대한 사람들의 인식을 개선하고 필요시 기존 관념에 도전하는 것이 필자의 주장과 일치합니다."
      },
      seongnamComplex: {
        question: "다음 글의 밑줄 친 ⓐ~ⓕ에 관한 설명 중, 옳지 않은 것을 <보기>에서 있는 대로 고른 것은?\n\nMuch research has been carried out on the causes of engagement, ⓐ**an issue that is important from both a theoretical and practical standpoint:** identifying the ⓑ**drivers** of work engagement may enable us to manipulate or influence it. The causes of engagement fall into two major camps: situational and personal. The most influential situational causes are job resources, feedback and leadership, ⓒ**the latter**, of course, being responsible for job resources and feedback. Indeed, leaders influence engagement by giving their employees honest and constructive feedback on their performance, and by providing them with the necessary resources that enable them to perform their job well. It is, however, noteworthy ⓓ**that** although engagement drives job performance, job performance also drives engagement. ⓔ**____________________**, when employees are able to do their jobs well — to the point that they match or exceed their own expectations and ambitions — they will engage more, be proud of their achievements, and find work more meaningful. ⓕ**This** is especially evident when people are employed in jobs that align with their values.\n\n<보기>\nⓐ: 밑줄 ⓐ가 의미하는 것은 연구가 이론적 배경을 갖추는 것보다 실제 적용 가능성이 더 중요하다는 것이다.\nⓑ: drivers는 factors 또는 motivations로 바꿔 쓸 수 있다.\nⓒ: the latter가 지칭하는 것은 job resources이다.\nⓓ: 진주어를 나타내는 접속사 that이다.\nⓔ: 빈칸에 알맞은 연결사는 On the contrary이다.\nⓕ: This가 의미하는 것은 Doing a job well drives increased engagement, pride, and a sense of significance이다.\n\n① ⓐ    ② ⓑ,ⓒ    ③ ⓐ,ⓒ,ⓔ    ④ ⓑ,ⓒ,ⓕ    ⑤ ⓐ,ⓒ,ⓔ,ⓕ",
        answer: "[정답] ③",
        explanation: "정답은 ③번입니다.\nⓐ (X - 틀림): 밑줄 친 부분은 \"참여(engagement)가 이론적 관점과 실무적 관점 모두에서 중요한 문제\"라는 의미입니다. \"both A and B\"는 'A와 B 둘 다'를 의미하므로, 어느 하나가 더 중요하다는 뜻이 아닙니다.\nⓒ (X - 틀림): the latter는 직전에 언급된 세 가지(job resources, feedback, leadership) 중 마지막 것인 leadership을 지칭합니다. job resources는 첫 번째 요소이므로 틀렸습니다.\nⓔ (X - 틀림): 앞 문장은 \"직무 성과가 참여를 이끌기도 한다\"이고, 뒤 문장은 \"직원들이 일을 잘 수행하면 더 참여하게 된다\"입니다. 앞뒤 내용이 같은 맥락을 다시 설명하는 것이므로 In other words(다시 말해서)가 적절합니다.\n\n오답인 보기: ⓐ, ⓒ, ⓔ"
      },
      seongnamQnA: {
        question: "다음 글을 읽고 주어진 질문에 대한 응답으로 가장 적절한 것을 고르시오.\n\nThe mirror test is a measure of self-awareness developed by psychologist Gordon Gallup Jr. In the test, a mark is placed on an animal's body in a location that the animal cannot see without looking in a mirror. The animal is then observed to see if it uses the mirror to investigate the mark on its body, indicating self-recognition.\n\nQ) Which of the followings is an animal that would likely pass the mirror test based on the passage?\n\n① A dog that barks at its reflection thinking it's another dog\n② A dolphin that touches a marked spot on its body while looking at its reflection\n③ A goldfish that swims away from its reflection\n④ A cat that tries to fight the cat in the mirror\n⑤ A bird that ignores the mirror completely",
        answer: "[정답] ②",
        explanation: "정답은 ②번입니다. 미러 테스트를 통과하려면 동물이 거울에 비친 모습을 자신으로 인식하고, 거울을 사용하여 자기 몸에 있는 표시를 조사해야 합니다. ②번의 돌고래가 거울을 보면서 자기 몸의 표시된 부분을 만지는 것이 이 조건에 부합합니다."
      },
      seongnamGrammarVocab: {
        question: "다음 글의 밑줄 친 부분 중 어법상 틀린 것과 어휘 사용이 적절하지 않은 것을 찾아 올바르게 고치시오.\n\nThe ability to understand emotions ①is particularly relevant in group settings. Individuals who are skilled in this domain ②is able to express emotions accurately and thus may facilitate clear communication between co-workers. They may be more likely to act in ways that ③weaken their own needs as well as the needs of others.\n\n어법 오류: [번호] → [수정된 형태]\n어휘 오류: [번호] → [수정된 단어]",
        answer: "[정답]\n어법 오류: ② is → are (주어 Individuals가 복수이므로 동사도 복수형)\n어휘 오류: ③ weaken → accommodate (문맥상 '자신과 타인의 요구를 약화시키다'가 아니라 '수용하다'가 적절함)",
        explanation: "②번은 주어-동사 수일치 오류입니다. 주어 'Individuals'가 복수이므로 동사는 'are'가 되어야 합니다. ③번은 어휘 오류로, 문맥상 자신과 타인의 요구를 '약화시키다(weaken)'가 아니라 '수용하다(accommodate)'가 적절합니다."
      },
      seongnamHumanities: {
        question: "글 (가)의 의미에 맞게 글 (나)를 완성할 때, 빈칸 중 어디에도 들어갈 수 없는 단어는? (단, 제시된 단어만 사용하고, 형태를 바꾸지 말 것)\n\n(가)\nThe selfie resonates not because it is new, but because it expresses, develops, expands, and intensifies the long history of the self-portrait. Today's young, urban, networked majority has reworked the history of the self-portrait to make the selfie into the first visual signature of the new era.\n\n(나)\nThe appeal of selfies lies not in their novelty but in their (A)_______ to the tradition of self-portraiture. Modern networked youth have (B)_______ this artistic legacy to create selfies as a defining (C)_______ of contemporary visual culture. This (D)_______ shows how old forms adapt to new technologies.\n\n① evolution    ② connection    ③ transformed    ④ symbol    ⑤ diminished",
        answer: "[정답] ⑤ diminished",
        explanation: "정답은 ⑤번 diminished입니다.\n(A) connection - 셀카가 자화상 전통과의 연결성 때문에 매력적이라는 의미\n(B) transformed - 현대 청년들이 이 예술적 유산을 변형시켰다는 의미\n(C) symbol - 셀카가 현대 시각 문화의 상징이라는 의미\n(D) evolution - 오래된 형태가 새로운 기술에 적응하는 진화를 보여준다는 의미\n\n⑤ diminished(감소된)는 원문에서 셀카가 자화상의 역사를 '확장하고 강화한다'고 했으므로 의미상 어디에도 적합하지 않습니다."
      },
      seongnamUnderlineMeaning: {
        question: "다음 글에서 밑줄 친 부분의 의미로 가장 적절한 것은?\n\nIn negotiations, it is often said that **the first person to name a price loses**. This conventional wisdom suggests that revealing your position early gives your opponent an advantage. However, research shows that anchoring—setting an initial reference point—can actually benefit the party who establishes it first, as subsequent negotiations tend to revolve around that anchor.\n\n① 협상에서 먼저 말하는 사람이 불리하다\n② 가격을 먼저 제시하면 기준점을 설정할 수 있다\n③ 상대방의 제안을 기다리는 것이 항상 최선이다\n④ 협상에서 침묵은 금이다\n⑤ 가격 협상은 피해야 한다",
        answer: "[정답] ①",
        explanation: "정답은 ①번입니다. 밑줄 친 부분 'the first person to name a price loses'는 '가격을 먼저 제시하는 사람이 진다'는 통념적 지혜를 설명합니다. 다만 글의 후반부에서는 이 통념과 달리 앵커링 효과로 인해 먼저 가격을 제시하는 것이 오히려 유리할 수 있다고 설명합니다."
      },
      guamDictionary: {
        question: "다음 글의 밑줄 친 부분의 뜻으로 가장 적절한 것은?\n\nThe government's new policy aims to **mitigate** the effects of climate change by reducing carbon emissions and promoting renewable energy sources. Environmental experts believe these measures are crucial for protecting future generations.\n\n① to make a problem, injury, or difficult situation less harmful or serious\n② to completely eliminate or remove something from existence\n③ to increase the intensity or severity of a situation or condition\n④ to ignore or overlook important aspects of a complex issue\n⑤ to transfer responsibility for something to another party or organization",
        answer: "[정답] ①",
        explanation: "정답은 ①번입니다. 'mitigate'는 '완화하다, 경감하다'라는 뜻으로, 문제나 어려운 상황을 덜 해롭거나 심각하게 만드는 것을 의미합니다."
      },
      guamTableFillBlanks: {
        question: "다음 글의 내용을 표로 정리할 때, 빈칸 (A)에 들어갈 말로 가장 적절한 것은?\n\nThe Industrial Revolution brought significant changes to society. Factories replaced cottage industries, leading to urbanization as workers moved to cities for employment. Working conditions were often harsh, with long hours and low wages. Child labor was common until reform movements led to protective legislation.\n\n| 항목 | 내용 |\n|------|------|\n| 생산방식 변화 | 가내공업 → 공장 |\n| 인구이동 | (A) _______ |\n| 노동조건 | 장시간 노동, 저임금 |\n| 아동노동 | 개혁운동 후 보호법 제정 |\n\n① 농촌에서 도시로 이동\n② 도시에서 농촌으로 이동\n③ 해외에서 국내로 이동\n④ 남부에서 북부로 이동\n⑤ 동부에서 서부로 이동",
        answer: "[정답] ①",
        explanation: "정답은 ①번입니다. 지문에서 'urbanization as workers moved to cities for employment'라고 언급되어 있어, 노동자들이 일자리를 위해 도시로 이동했음을 알 수 있습니다."
      },
      contentInference: {
        question: "다음 글의 내용을 읽고, 추론할 수 없는 사실은?\n\nThere is a reason the title \"Monday Morning Quarterback\" exists. Just read the comments on social media from fans discussing the weekend's games, and you quickly see how many people believe they could play, coach, and manage sport teams more successfully than those on the field. This goes far the boardroom as well. Students and professionals with years of training and specialized degrees in sport business may also find themselves being given advice on how to do their jobs from friends, family, or even total strangers without any expertise. Executives in sport management have decades of knowledge and experience in their respective fields. However, many of them face criticism from fans and community members telling them how to run their business. Very few people tell their doctor how to perform surgery or their accountant how to prepare their taxes, but many people provide feedback on how sport organizations should be managed.\n\n① There is a tendency where people feel confident offering opinions on subjects that they may not be formally trained in.\n② Monday Morning Quarterback can develop critical thinking and analytical skills, creating vibrant and dynamic environment.\n③ Even professionals with years of training may receive advice on their jobs from strangers lacking expertise.\n④ Sports organizations are prone to Monday Morning Quarterback compared to other professional fields.\n⑤ If someone always unfairly criticizes or questions the decisions of other people after something has happened, we can say that he or she is a Monday Morning Quarterback.",
        answer: "[정답] ②",
        explanation: "정답은 ②번입니다. ②번 선택지에서 Monday Morning Quarterback가 비판적 사고와 분석 능력을 기르고 활기차고 역동적인 환경을 만든다는 내용은 글 어디에도 언급되지 않았으며, 오히려 글의 전반적인 톤은 이런 현상에 대해 문제점을 지적하는 방향입니다."
      },
      logicFlow: {
        question: "[Logic Flow 예시]\n\nThe human brain has shrunk in mass by about 10 percent since the stone age. This change, which peaked in size 15,000-30,000 years ago, occurred because humans no longer lived in a world of dangerous predators. Today, many tasks of survival have been outsourced to the wider society. However, brain size is not necessarily an indicator of human intelligence.\n\n[핵심 현상]\nㆍ인간 뇌 크기의 10% 감소 (\"shrunk in mass by about 10 percent\")\nㆍ감소 시작 시점: 15,000-30,000년 전 (\"peaked in size 15,000-30,000 years ago\")\n\n[원인 분석]\nㆍ과거 환경: 포식자 위협 (\"dangerous predators\")\nㆍ현재 변화: 생존 과제의 사회화 (\"tasks of survival\", \"outsourced\")\n\n[결론]\nㆍ지능과의 무관성 (\"not necessarily an indicator\")",
        answer: "",
        explanation: "Logic Flow는 지문의 논리적 흐름을 카테고리별로 정리하여 핵심 내용과 근거를 명확히 보여주는 형식입니다."
      },
      weekendClinic: {
        question: "[주제]\n한글: 물의 고유한 특성이 생명체 유지에 필수적이다.\n영어: Water's unique properties are essential for sustaining life.\n\n[제목]\n한글: 물의 특별한 성질: 생명 유지의 핵심 요소\n영어: The Unique Properties of Water: Key Elements for Life\n\n[요약문]\nWater's unique ability to (A)__________ heat and change its (B)__________ makes it essential for regulating Earth's temperature and protecting aquatic life.\n\n[True or False]\n다음 글의 내용으로 옳고 그름(T/F)을 고르시오.\n1. A fake smile primarily affects the upper half of the face. (T/F)\n2. The eyes are not significantly involved in an insincere smile. (T/F)\n3. A genuine smile only impacts the muscles around the mouth. (T/F)\n4. The skin between the eyebrow and upper eyelid is raised slightly with a genuine smile. (T/F)\n5. A genuine smile can affect the entire face. (T/F)",
        answer: "[정답]\n[요약문 정답]\n(A): absorb, (B): density\n[해설] 물의 고유한 열을 흡수하는 능력과 밀도를 변화시키는 특성은 지구의 온도를 조절하고 수중 생물을 보호하는 데 필수적이다.\n\n[True or False 정답]\n1. False [해설]: 가짜 미소는 주로 얼굴의 아래쪽 절반에만 영향을 미친다.\n2. True [해설]: 진실하지 않은 미소에서는 눈이 크게 관여하지 않는다.\n3. False [해설]: 진정한 미소는 입 주변 근육뿐만 아니라 눈 주변 근육과 주름에도 영향을 미친다.\n4. False [해설]: 진정한 미소에서는 눈썹과 윗눈꺼풀 사이의 피부가 약간 내려간다.\n5. True [해설]: 진정한 미소는 얼굴 전체에 영향을 미칠 수 있다.",
        explanation: "Weekend Clinic 형식은 주제, 제목, 요약문, True/False 문제를 포함하는 종합적인 지문 분석 문제입니다."
      },
      grammarWorkbook: {
        question: "다음 중 어법상 알맞은 표현을 고르시오.\n\nFor companies [interesting/interested] in delighting customers, exceptional value and service become part of the overall company culture. For example, year after year, Pazano [ranks/rank] at or near the top of the hospitality industry in terms of customer satisfaction. The company's passion for satisfying customers [are/is] [summing/summed] up in its credo, [which/that] [promise/promises] [what/that] its luxury hotels will deliver a truly memorable experience. [Despite/Although] a customer-centered firm seeks [delivering/to deliver] high customer satisfaction relative to competitors, it does not attempt [maximizing/to maximize] customer satisfaction. A company can always [be increased/increase] customer satisfaction by lowering its price or [increase/increasing] its services. But this may result [from/in] lower profits. Thus, the purpose of marketing [is/are] to [be generated/generate] customer value [profitably/profitable]. This requires a very [delicately/delicate] balance: the marketer must continue [to generate/to generating] more customer value and satisfaction but not [give/giving] away the house.",
        answer: "[정답]\n(1) interested (2) ranks (3) is (4) summed (5) which (6) promises (7) that (8) Although (9) to deliver (10) to maximize (11) increase (12) increasing (13) in (14) is (15) generate (16) profitably (17) delicate (18) to generate (19) giving",
        explanation: "어법워크북은 지문의 문법적 요소들을 선택지로 변환하여 수능 수준의 정교한 어법 문제를 생성합니다. 주어-동사 일치, 시제, 능동/수동태, 부사/형용사 구분, 전치사/접속사, 부정사/동명사, 관계사 등 다양한 문법 포인트를 복합적으로 다룹니다."
      },
      vocabWorkbook: {
        question: "다음 중 문맥 상 알맞은 단어를 고르시오.\n\nThe (1)[unrelated/associated] evolution of AI is often with the concept of (2)[similarity/singularity]. Singularity refers to the point at which AI (3)[lag behind/exceeds] human intelligence. After that point, it is predicted that AI will repeatedly (4)[disprove/improve] itself and evolve at an (5)[decelerated/accelerated] pace. When AI becomes self­aware and pursues its own goals, it will be a (6)[conscious/unconscious] being, not just a machine. AI and human (7)[unconsciousness/consciousness] will then begin to evolve (8)[alone/together]. Our consciousness will evolve to new dimensions through our (9)[isolation/interactions] with AI, which will provide us with intellectual (10)[simulation/stimulation] and (11)[inspire/expire] new insights and creativity. Conversely, our consciousness also has a (12)[significant/insignificant] impact on the evolution of AI. The (13)[indirection/direction] of AI's evolution will depend greatly on what values and ethics we (14)[disassemble/incorporate] into AI. We need to see our relationship with AI as a (15)[individual/mutual] coexistence of conscious beings, recognizing its rights and (16)[disturbing/supporting] the evolution of its consciousness.",
        answer: "[정답]\n(1) associated (2) singularity (3) exceeds (4) improve (5) accelerated (6) conscious (7) consciousness (8) together (9) interactions (10) stimulation (11) inspire (12) significant (13) direction (14) incorporate (15) mutual (16) supporting",
        explanation: "어휘워크북은 지문의 문맥상 중요한 단어들을 선택지로 변환하여 문맥 파악 능력을 평가하는 문제를 생성합니다. 각 단어는 두 개의 선택지로 구성되며, 학생들은 문맥에 맞는 적절한 단어를 선택해야 합니다."
      }
    };
    
    return examples[type.id] || {
      question: `${type.name} 유형의 문제입니다.\n\n지문을 입력하면 AI가 자동으로 이 유형에 맞는 문제를 생성합니다.\n\n각 문제 유형별로 프롬프트에 정의된 규칙과 형식에 따라 문제가 생성됩니다.`,
      answer: "선택지 예시",
      explanation: "해당 문제 유형에 대한 정답과 해설이 자동으로 생성됩니다."
    };
  };
  let placeholder = "Enter your text here...";
  if (isImplicationType || isBlankType || isBlankMultipleType) {
    placeholder = "Enter your text here.. use square brackets [] to mark the part you want to turn into " + (isImplicationType ? "implicit meaning" : "blank space");
  } else if (isInsertType) {
    placeholder = "Enter your text here.. use square brackets [] to mark the sentence you want to insert";
  }
  const handleDeleteAll = () => {
    onRemoveType(type.id);
    toast({
      title: "문제 유형 삭제",
      description: "선택한 문제 유형이 삭제되었습니다."
    });
  };
  if (isSentenceMatcher) {
    return (
      <div className="group relative">
        {/* Outer glow on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-indigo-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative bg-white/90 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100/80 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-medium rounded-lg shadow-sm shadow-indigo-500/20">
                {type.name}
              </span>
              <Dialog open={showExampleDialog} onOpenChange={setShowExampleDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-lg transition-all duration-200"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    <span className="text-xs font-medium">예시보기</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border-slate-200/60">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-slate-800">
                      {type.name} - 예시 문제
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60">
                      <pre className="whitespace-pre-wrap text-sm font-sans text-slate-700">{getExampleQuestion().question}</pre>
                    </div>
                    {getExampleQuestion().answer && (
                      <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/30 border border-indigo-100/60">
                        <h4 className="font-semibold text-sm mb-2 text-indigo-600">정답</h4>
                        <pre className="whitespace-pre-wrap text-sm font-sans text-slate-700">{getExampleQuestion().answer}</pre>
                      </div>
                    )}
                    {getExampleQuestion().explanation && (
                      <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60">
                        <h4 className="font-semibold text-sm mb-2 text-slate-700">해설</h4>
                        <pre className="whitespace-pre-wrap text-sm font-sans text-slate-600">{getExampleQuestion().explanation}</pre>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDeleteAll} 
              className="h-7 px-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50/80 rounded-lg transition-all duration-200"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs font-medium">전체 삭제</span>
            </Button>
          </div>
          <div className="p-5">
            <SentenceMatcher />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="group relative">
      {/* Outer glow on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-indigo-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative bg-white/90 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Header with gradient */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100/80 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg bg-white/50 backdrop-blur-sm">
              {getSchoolLogo(type.id, type.name) && (
                <div className="w-4 h-4 flex items-center justify-center">
                  <img 
                    src={getSchoolLogo(type.id, type.name)!} 
                    alt="" 
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <span className="tracking-tight">{type.name}</span>
            </span>
            <Dialog open={showExampleDialog} onOpenChange={setShowExampleDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-lg transition-all duration-200"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-xs font-medium">예시보기</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border-slate-200/60">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-slate-800">
                    {type.name} - 예시 문제
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60">
                    <pre className="whitespace-pre-wrap text-sm font-sans text-slate-700">{getExampleQuestion().question}</pre>
                  </div>
                  {getExampleQuestion().answer && (
                    <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/30 border border-indigo-100/60">
                      <h4 className="font-semibold text-sm mb-2 text-indigo-600">정답</h4>
                      <pre className="whitespace-pre-wrap text-sm font-sans text-slate-700">{getExampleQuestion().answer}</pre>
                    </div>
                  )}
                  {getExampleQuestion().explanation && (
                    <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60">
                      <h4 className="font-semibold text-sm mb-2 text-slate-700">해설</h4>
                      <pre className="whitespace-pre-wrap text-sm font-sans text-slate-600">{getExampleQuestion().explanation}</pre>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDeleteAll} 
            className="h-7 px-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50/80 rounded-lg transition-all duration-200"
          >
            <X className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs font-medium">전체 삭제</span>
          </Button>
        </div>
        
        <div className="p-5 space-y-4">
          {type.id === 'topicWriting' && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/60">
              <p className="text-sm text-amber-700 flex items-center gap-2">
                <span className="text-base">💡</span>
                생성된 문제의 주제문을 확인 후 오류가 있으면 재출제 버튼으로 다시 생성하세요
              </p>
            </div>
          )}
          
          <PassageList 
            passages={passages} 
            typeId={type.id} 
            onAddPassage={onAddPassage} 
            onRemovePassage={onRemovePassage} 
            onTextChange={onTextChange} 
            onTitleChange={onTitleChange}
            onPasteValues={onPasteValues} 
            onOrderModeChange={onOrderModeChange} 
            onSummaryModeChange={onSummaryModeChange}
            onChoiceLanguageChange={onChoiceLanguageChange}
            onManualModeChange={onManualModeChange}
            onManualMarkersChange={onManualMarkersChange}
            onCombinedTypesChange={onCombinedTypesChange}
            onParaphraseBlankChange={onParaphraseBlankChange}
            onSubTypeChange={onSubTypeChange}
            isSpecialVocabType={isSpecialVocabType} 
            isOrderWritingType={isOrderWritingType} 
            placeholder={placeholder} 
          />
        </div>
      </div>
    </div>
  );
};
