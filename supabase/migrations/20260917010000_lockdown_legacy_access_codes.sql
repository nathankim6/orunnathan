-- 보안 조치 (2단계): 레거시 접근코드 게이트 차단
--
-- 조치 전 상태
--   access_codes / access_code_usage 모두 `public` 롤에 대해 using(true) 로
--   SELECT/INSERT/UPDATE/DELETE 가 전부 열려 있었다. anon 키는 배포 번들에
--   노출되므로, 사실상 누구나 전체 접근코드를 열람하고, 자기 코드를 발급하고,
--   전량 삭제할 수 있었다.
--
-- 이 게이트가 죽어 있다고 판단한 근거
--   1. access_codes 3행은 전부 2025-01-13~15 생성이고 그 뒤 추가가 없다.
--   2. access_code_usage 가 0행이다 — 코드 검증이 단 한 번도 기록된 적이 없다.
--   3. 이 게이트를 쓰던 앱(Lovable 프로젝트 orunquizmaker, 이 저장소의 README 가
--      가리키는 바로 그 프로젝트)은 현재 다른 Supabase 프로젝트
--      (jpanpwbdlhsxnyaldddm) 를 바라본다. 즉 이 저장소의 클론은 구버전이고
--      라이브 앱은 이미 이전했다.
--   4. 최근 24시간 엣지 로그에 실사용 호출이 없다(관측된 GET 은 점검용 curl).
--
-- 되살릴 일이 생기면: 아래 정책을 그대로 복원하지 말고, 코드 검증을
-- 엣지 함수(service_role)로 옮긴 뒤 테이블은 닫힌 채로 두는 것이 맞다.
-- 클라이언트가 access_codes 를 직접 SELECT 하는 구조 자체가 결함이다
-- (코드 하나만 알아도 전체 코드를 조회할 수 있게 된다).

drop policy if exists "Allow all users to read access_codes"   on public.access_codes;
drop policy if exists "Allow all users to insert access_codes" on public.access_codes;
drop policy if exists "Allow all users to update access_codes" on public.access_codes;
drop policy if exists "Allow all users to delete access_codes" on public.access_codes;
alter table public.access_codes enable row level security;
revoke all on public.access_codes from anon, authenticated;

drop policy if exists "Allow all users to read access_code_usage"   on public.access_code_usage;
drop policy if exists "Allow all users to insert access_code_usage" on public.access_code_usage;
alter table public.access_code_usage enable row level security;
revoke all on public.access_code_usage from anon, authenticated;

-- ── 아직 열려 있는 두 테이블 (앱에 로그인이 없어 지금은 못 닫는다) ──
--
-- oracle_docs : 185행, 2026-09-15~16 생성 — 실사용 중. 다만 어느 앱이 쓰는지
--   아직 특정하지 못했다(이 저장소엔 참조 0건, 엣지 로그에 Origin 헤더 없음).
--   현재 누구나 전체 문서를 읽고 지울 수 있다. 소유 앱을 찾는 것이 다음 과제.
--
-- orun_question_edits : 옳은문법이 쓴다. 이 앱은 단일 HTML 이고 로그인이 없어
--   편집자를 식별할 수단이 없다. 지금 닫으면 편집 기능이 통째로 죽는다.
--   앱에 로그인을 붙이는 것이 선행 조건.
