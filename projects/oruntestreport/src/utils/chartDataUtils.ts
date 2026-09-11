import { MAIN_CATEGORIES, formatCategoryLabel } from "./problemTypeUtils";

type ProblemType = {
  id: string;
  name: string;
  category: string;
  questionType: 'objective' | 'subjective';
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
};

// 고등학교 대분류 카테고리 정의 - 실제 데이터에 맞게 수정
const HIGH_SCHOOL_CATEGORIES = ["부교재(모의고사)", "교과서", "핸드아웃", "부교재", "모의고사", "워크북", "단어장"];

// 직접입력으로 추가된 사용자 정의 카테고리 여부
const isCustomCategory = (category: string): boolean => {
  return !!category && category.startsWith("기타(직접입력):");
};

const normalizeCategoryLabel = formatCategoryLabel;

export const calculateChartData = (problemTypes: ProblemType[], isHighSchool: boolean = false) => {
  // Group problem types by their categories
  const categoryCount: Record<string, number> = {};

  if (isHighSchool) {
    // For high school: group by actual category names and filter to only show high school categories
    problemTypes.forEach(type => {
      const category = type.category;
      // 고등학교 표준 카테고리 또는 "기타(직접입력): XXX" 사용자 입력 카테고리 카운트
      if (HIGH_SCHOOL_CATEGORIES.includes(category) || isCustomCategory(category)) {
        const label = normalizeCategoryLabel(category);
        if (!categoryCount[label]) {
          categoryCount[label] = 0;
        }
        categoryCount[label] += 1;
      }
    });
  } else {
    // For middle school: use predefined main categories (어휘, 대화문, 본문, 문법/어법, 서술형)
    problemTypes.forEach(type => {
      const category = type.category;
      // 중등 표준 카테고리(빈 "기타(직접입력)" 제외) 또는 사용자 입력 카테고리 카운트
      const isStandard = MAIN_CATEGORIES.includes(category) && category !== "기타(직접입력)";
      if (isStandard || isCustomCategory(category)) {
        const label = normalizeCategoryLabel(category);
        if (!categoryCount[label]) {
          categoryCount[label] = 0;
        }
        categoryCount[label] += 1;
      }
    });
  }

  // 고정 목록은 리포트 양식이 정해져 있을 때만 맞는다. AI 자동 채움처럼 category 에
  // 문항 유형(어법·빈칸추론·순서배열…)이 들어오면 목록에 걸리는 게 한둘뿐이라
  // "어휘 50% · 서답형 50%" 처럼 두 개만 남고 나머지 문항이 조용히 사라진다.
  // 그래서 걸린 문항이 6할이 안 되면 실제 값 그대로 묶는다. 잘못 묶이는 것보다
  // 하나도 안 빠지는 쪽이 낫다.
  const counted = Object.values(categoryCount).reduce((sum, n) => sum + n, 0);
  if (problemTypes.length > 0 && counted / problemTypes.length < 0.6) {
    Object.keys(categoryCount).forEach((k) => delete categoryCount[k]);
    problemTypes.forEach((type) => {
      const label = normalizeCategoryLabel(type.category || '미분류');
      categoryCount[label] = (categoryCount[label] || 0) + 1;
    });
  }

  // Get raw counts for all categories that have problems
  const rawData = Object.entries(categoryCount)
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => {
      return {
        name,
        value: count
      };
    });

  // Calculate percentages
  const totalCount = problemTypes.length;

  // First pass: calculate initial percentages and sort by count
  const initialData = rawData.map(item => {
    const exactPercentage = item.value / totalCount * 100;
    const flooredPercentage = Math.floor(exactPercentage);
    return {
      name: item.name,
      value: item.value,
      exactPercentage,
      percentage: flooredPercentage
    };
  }).sort((a, b) => b.value - a.value);

  // Calculate how many percentage points we need to distribute
  const initialTotal = initialData.reduce((sum, item) => sum + item.percentage, 0);
  const pointsToDistribute = 100 - initialTotal;

  // Distribute remaining points based on decimal parts
  if (pointsToDistribute > 0) {
    // Sort by fractional part descending to distribute points fairly
    const sortedByFraction = [...initialData].sort((a, b) => {
      return (b.exactPercentage - b.percentage) - (a.exactPercentage - a.percentage);
    });

    // Distribute the points
    for (let i = 0; i < pointsToDistribute; i++) {
      if (sortedByFraction[i % sortedByFraction.length]) {
        sortedByFraction[i % sortedByFraction.length].percentage += 1;
      }
    }
  }

  // Final data with integer percentages, sorted by value
  const finalData = initialData.map(item => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage.toString()
  })).sort((a, b) => b.value - a.value);
  
  return finalData;
};

export const calculateSubcategoryData = (problemTypes: ProblemType[]) => {
  // Group problem types by their specific names (subcategories)
  const subcategoryCount: Record<string, number> = {};

  // Count occurrences of each unique problem type name
  problemTypes.forEach(type => {
    const subcategory = type.name;
    if (!subcategoryCount[subcategory]) {
      subcategoryCount[subcategory] = 0;
    }
    subcategoryCount[subcategory] += 1;
  });

  // Get raw counts for all subcategories that have problems
  const rawData = Object.entries(subcategoryCount)
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => {
      return {
        name,
        value: count
      };
    });

  // Calculate percentages
  const totalCount = problemTypes.length;

  // First pass: calculate initial percentages and sort by count
  const initialData = rawData.map(item => {
    const exactPercentage = item.value / totalCount * 100;
    const flooredPercentage = Math.floor(exactPercentage);
    return {
      name: item.name,
      value: item.value,
      exactPercentage,
      percentage: flooredPercentage
    };
  }).sort((a, b) => b.value - a.value);

  // Calculate how many percentage points we need to distribute
  const initialTotal = initialData.reduce((sum, item) => sum + item.percentage, 0);
  const pointsToDistribute = 100 - initialTotal;

  // Distribute remaining points based on decimal parts
  if (pointsToDistribute > 0) {
    // Sort by fractional part descending to distribute points fairly
    const sortedByFraction = [...initialData].sort((a, b) => {
      return (b.exactPercentage - b.percentage) - (a.exactPercentage - a.percentage);
    });

    // Distribute the points
    for (let i = 0; i < pointsToDistribute; i++) {
      if (sortedByFraction[i % sortedByFraction.length]) {
        sortedByFraction[i % sortedByFraction.length].percentage += 1;
      }
    }
  }

  // Final data with integer percentages, sorted by value
  return initialData.map(item => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage.toString()
  })).sort((a, b) => b.value - a.value);
};
