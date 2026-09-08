-- 동형 모의고사 생성기(public/mocktest-generator.html)가 만든 시험지를 계정별로 보관한다.
create table if not exists public.mock_exam_papers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  note text,
  question_count integer not null default 0,
  page_count integer not null default 0,
  provider text,
  model text,
  meta jsonb not null default '{}'::jsonb,
  paper_html text not null,
  answer_key jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mock_exam_papers_owner_recent_idx
  on public.mock_exam_papers (user_id, created_at desc);

alter table public.mock_exam_papers enable row level security;

drop policy if exists "own rows readable" on public.mock_exam_papers;
create policy "own rows readable" on public.mock_exam_papers
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "own rows insertable" on public.mock_exam_papers;
create policy "own rows insertable" on public.mock_exam_papers
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "own rows updatable" on public.mock_exam_papers;
create policy "own rows updatable" on public.mock_exam_papers
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "own rows deletable" on public.mock_exam_papers;
create policy "own rows deletable" on public.mock_exam_papers
  for delete to authenticated using (user_id = (select auth.uid()));

create or replace function public.tg_mock_exam_papers_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists mock_exam_papers_touch on public.mock_exam_papers;
create trigger mock_exam_papers_touch
  before update on public.mock_exam_papers
  for each row execute function public.tg_mock_exam_papers_touch();
