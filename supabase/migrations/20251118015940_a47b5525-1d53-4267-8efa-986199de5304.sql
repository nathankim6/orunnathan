-- backgrounds 테이블의 기존 데이터를 모두 삭제하고 새 영상 URL을 삽입
DELETE FROM backgrounds;

INSERT INTO backgrounds (url, is_video)
VALUES ('https://jpanpwbdlhsxnyaldddm.supabase.co/storage/v1/object/public/backgrounds/___202511181049.mp4', true);
