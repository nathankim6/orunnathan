#!/bin/bash
# 정답 자리 재배치 전체 순서 — 뒷정리(해설 번호·총평 위치)까지 반드시 함께 돈다.
set -e
cd "$(dirname "$0")"
python3 replan.py
python3 rebalance.py --apply
python3 rebalance_order.py --apply
python3 rebalance_33.py --apply
python3 rebalance_r1.py --apply
python3 rebalance_r4.py --apply
python3 rebalance_step5.py --apply
python3 fix_r1_tail.py --apply      # 문장을 섞으면 총평이 딸려간다
python3 fix_step5_order.py --apply  # 번호만 바뀌고 차례가 남는다
python3 fix_panel.py --apply        # 요약 패널은 라벨·값이 나뉘어 있어 따로 맞춘다
python3 audit_consistency.py        # 패널·해설이 어긋나면 교사용이 틀린 곳에 표시한다
python3 verify_endtoend.py
python3 audit_empty.py              # 라벨만 있고 답이 빠진 항목
python3 audit_visible.py
