-- 보안 점검 결과 조치 (1단계)
--
-- 배경: public 스키마의 모든 테이블이 `public` 롤에 대해 using(true) 정책으로
-- 전 권한(SELECT/INSERT/UPDATE/DELETE)이 열려 있었다. anon 키는 배포된 HTML 안에
-- 그대로 노출돼 있으므로, 사실상 누구나 읽고 고치고 지울 수 있는 상태였다.
--
-- 이 마이그레이션은 그중 **애플리케이션 코드에서 단 한 번도 호출되지 않는**
-- 두 테이블만 차단한다(src 전체에서 types.ts 외 참조 0건 확인). 나머지 테이블은
-- 실사용 중이라 여기서 건드리지 않는다 — 아래 '남은 과제' 참고.
--
-- service_role(대시보드·엣지 함수)은 RLS 를 우회하므로 영향받지 않는다.

-- secrets: 공개 anon 키로 읽기·수정·삭제가 모두 가능했다. 가장 위험했던 항목.
drop policy if exists "Anyone can read secrets"                  on public.secrets;
drop policy if exists "Anyone can insert secrets"                on public.secrets;
drop policy if exists "Anyone can update secrets"                on public.secrets;
drop policy if exists "Anyone can delete secrets"                on public.secrets;
drop policy if exists "Allow all users to read secrets"          on public.secrets;
drop policy if exists "Allow all users to insert/update secrets" on public.secrets;
drop policy if exists "Allow all users to update secrets"        on public.secrets;
alter table public.secrets enable row level security;
revoke all on public.secrets from anon, authenticated;

-- backgrounds: 실사용 0건
drop policy if exists "Allow anonymous read access"   on public.backgrounds;
drop policy if exists "Allow anonymous insert access" on public.backgrounds;
drop policy if exists "Allow anonymous delete access" on public.backgrounds;
alter table public.backgrounds enable row level security;
revoke all on public.backgrounds from anon, authenticated;

-- ── 남은 과제 (코드 변경이 함께 필요해 이 마이그레이션에 포함하지 않음) ──
--
-- 1) access_codes / access_code_usage
--    로그인 게이트(AccessCodeCheck, AuthContainer)와 관리자 UI(AccessCodeManager)가
--    anon 키로 직접 CRUD 한다. 지금 잠그면 두 기능이 모두 죽는다.
--    올바른 해법: 코드 검증과 발급을 엣지 함수로 옮기고(service_role 사용)
--    테이블에서 anon 권한을 전면 회수.
--
-- 2) 관리자 인증
--    src/pages/Admin.tsx 는 localStorage 의 "isAdmin" 값만 본다.
--    브라우저 콘솔에 localStorage.setItem("isAdmin","true") 한 줄이면 통과된다.
--    Supabase Auth 또는 서버 검증으로 교체 필요.
--
-- 3) oracle_docs
--    이 저장소가 아닌 다른 앱이 실제로 쓰고 있다(로그상 POST 다수).
--    소유 앱을 특정하기 전에는 잠그면 안 된다.
--
-- 4) orun_question_edits
--    옳은문법이 쓰는 테이블. DELETE 가 공개라 편집본 전량 삭제가 가능하다.
--    편집자 식별 수단이 없어 지금은 좁힐 수 없다. 1)과 같은 방식으로 해결해야 한다.
