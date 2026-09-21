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
python3 audit_visible.py
