#!/usr/bin/env python3
"""선생님 한 분의 questions/*.json 을 모두 읽어 분포·평균을 센다.

프로파일(profile.md)에 들어가는 숫자는 전부 이 스크립트가 낸 값을 쓴다.
사람(Claude 포함)이 눈대중으로 비율을 어림하지 않게 하려고 만든 결정적 계산기다.
같은 입력이면 항상 같은 출력이 나온다.

사용법:
    python3 teacher-memory/scripts/count_stats.py <선생님-폴더>
    (예: teacher-memory/schools/heukseok-go/teachers/yoon-eunyoung)

<선생님-폴더>/questions/*.json 을 전부 읽어 결과를 JSON 으로 표준출력에 낸다.
"""
import json
import sys
from collections import defaultdict
from pathlib import Path


def load_exams(teacher_dir: Path):
    qdir = teacher_dir / "questions"
    exams = []
    for f in sorted(qdir.glob("*.json")):
        data = json.loads(f.read_text(encoding="utf-8"))
        data.setdefault("examId", f.stem)
        data.setdefault("questions", [])
        for i, q in enumerate(data["questions"]):
            q.setdefault("order", i + 1)
        exams.append(data)
    exams.sort(key=lambda e: (e.get("date") or "", e.get("examId") or ""))
    return exams


def share_dist(counter: dict, total: int):
    if not total:
        return {}
    return {k: round(v / total, 4) for k, v in sorted(counter.items(), key=lambda kv: -kv[1])}


def build_stats(exams):
    all_q = []
    for e in exams:
        for q in e["questions"]:
            all_q.append({**q, "_examId": e["examId"]})

    n_exams = len(exams)
    n_q = len(all_q)

    type_counter = defaultdict(int)
    type_points = defaultdict(list)
    type_diff = defaultdict(lambda: defaultdict(int))
    format_counter = defaultdict(int)
    diff_counter = defaultdict(int)
    grammar_counter = defaultdict(int)
    vocab_counter = defaultdict(int)
    external_known = 0
    external_yes = 0
    subj_q = []
    subj_conditions = defaultdict(int)
    all_points = []

    for q in all_q:
        t = q.get("type") or "미분류"
        type_counter[t] += 1
        if q.get("points") is not None:
            type_points[t].append(q["points"])
            all_points.append(q["points"])
        if q.get("difficulty"):
            type_diff[t][q["difficulty"]] += 1
            diff_counter[q["difficulty"]] += 1
        fmt = q.get("format") or ("서술형" if t == "서술형" else "객관식")
        format_counter[fmt] += 1
        if fmt == "서술형":
            subj_q.append(q)
            for c in q.get("subjectiveConditions") or []:
                subj_conditions[c] += 1
        for g in q.get("grammarPoints") or []:
            grammar_counter[g] += 1
        for v in q.get("vocabPoints") or []:
            vocab_counter[v] += 1
        if q.get("external") is not None:
            external_known += 1
            if q["external"]:
                external_yes += 1

    type_dist = {}
    for t, n in type_counter.items():
        pts = type_points.get(t, [])
        type_dist[t] = {
            "n": n,
            "share": round(n / n_q, 4) if n_q else 0,
            "perExam": round(n / n_exams, 2) if n_exams else 0,
            "avgPoints": round(sum(pts) / len(pts), 2) if pts else None,
            "difficulty": share_dist(type_diff[t], sum(type_diff[t].values())),
        }
    type_dist = dict(sorted(type_dist.items(), key=lambda kv: -kv[1]["n"]))

    exam_summaries = []
    for e in exams:
        qs = e["questions"]
        pts = [q["points"] for q in qs if q.get("points") is not None]
        exam_summaries.append({
            "examId": e["examId"],
            "label": e.get("examLabel") or e["examId"],
            "date": e.get("date"),
            "nQuestions": len(qs),
            "totalPoints": e.get("totalPoints") or (sum(pts) if pts else None),
        })

    subj_pts = [q["points"] for q in subj_q if q.get("points") is not None]

    trend = None
    if n_exams >= 2:
        recent = exams[-1]
        recent_qs = recent["questions"]
        recent_n = len(recent_qs) or 1
        recent_type = defaultdict(int)
        for q in recent_qs:
            recent_type[q.get("type") or "미분류"] += 1
        recent_share = {t: n / recent_n for t, n in recent_type.items()}
        prior_qs = [q for e in exams[:-1] for q in e["questions"]]
        prior_n = len(prior_qs) or 1
        prior_type = defaultdict(int)
        for q in prior_qs:
            prior_type[q.get("type") or "미분류"] += 1
        prior_share = {t: n / prior_n for t, n in prior_type.items()}
        keys = set(recent_share) | set(prior_share)
        type_delta = {k: round(recent_share.get(k, 0) - prior_share.get(k, 0), 4) for k in keys}
        recent_subj = sum(1 for q in recent_qs if (q.get("format") or "") == "서술형") / recent_n
        prior_subj = sum(1 for q in prior_qs if (q.get("format") or "") == "서술형") / prior_n if prior_qs else 0
        trend = {
            "recentExam": recent["examId"],
            "typeShareDelta": {k: v for k, v in sorted(type_delta.items(), key=lambda kv: -abs(kv[1])) if abs(v) >= 0.01},
            "subjectiveShareDelta": round(recent_subj - prior_subj, 4),
        }

    return {
        "nExams": n_exams,
        "nQuestions": n_q,
        "exams": exam_summaries,
        "typeDist": type_dist,
        "formatMix": share_dist(format_counter, n_q),
        "difficultyMix": share_dist(diff_counter, sum(diff_counter.values())),
        "avgPointsOverall": round(sum(all_points) / len(all_points), 2) if all_points else None,
        "grammarPoints": [{"point": k, "n": v} for k, v in sorted(grammar_counter.items(), key=lambda kv: -kv[1])],
        "vocabPoints": [{"point": k, "n": v} for k, v in sorted(vocab_counter.items(), key=lambda kv: -kv[1])],
        "externalRatio": round(external_yes / external_known, 4) if external_known else None,
        "subjective": {
            "n": len(subj_q),
            "perExam": round(len(subj_q) / n_exams, 2) if n_exams else 0,
            "avgPoints": round(sum(subj_pts) / len(subj_pts), 2) if subj_pts else None,
            "conditionsTop": [{"text": k, "n": v} for k, v in sorted(subj_conditions.items(), key=lambda kv: -kv[1])[:8]],
        },
        "trend": trend,
    }


def main():
    if len(sys.argv) != 2:
        print(__doc__, file=sys.stderr)
        sys.exit(1)
    teacher_dir = Path(sys.argv[1])
    qdir = teacher_dir / "questions"
    if not qdir.is_dir():
        print(json.dumps({"error": f"{qdir} 폴더가 없습니다 — 아직 데이터화된 시험이 없어요."}, ensure_ascii=False))
        sys.exit(0)
    exams = load_exams(teacher_dir)
    stats = build_stats(exams)
    print(json.dumps(stats, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
