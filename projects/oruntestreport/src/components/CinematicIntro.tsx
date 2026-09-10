import React, { useEffect, useState } from 'react';

/**
 * 리포트를 열 때 잠깐 지나가는 표제 화면.
 *
 * 영화의 오프닝처럼 학교와 시험 이름을 한 번 크게 보여 준 뒤 걷힌다.
 * 2초 남짓이고, 아무 데나 누르거나 스크롤하면 바로 걷힌다. 급한 사람을
 * 붙잡아 두면 멋이 아니라 방해가 된다.
 *
 * 움직임을 줄이도록 설정한 사람에게는 아예 뜨지 않는다.
 */
const CinematicIntro: React.FC<{ school: string; exam: string; accent: string }> = ({
  school,
  exam,
  accent,
}) => {
  const [phase, setPhase] = useState<'in' | 'out' | 'gone'>(() => {
    const reduce =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
    return reduce ? 'gone' : 'in';
  });

  useEffect(() => {
    if (phase === 'gone') return;
    const leave = () => setPhase('out');
    const timer = window.setTimeout(leave, 2100);
    window.addEventListener('pointerdown', leave, { once: true });
    window.addEventListener('wheel', leave, { once: true, passive: true });
    window.addEventListener('keydown', leave, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', leave);
      window.removeEventListener('wheel', leave);
      window.removeEventListener('keydown', leave);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'out') return;
    const timer = window.setTimeout(() => setPhase('gone'), 900);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === 'gone') return null;

  return (
    <div
      className={`cinema-intro capture-hide print:hidden ${phase === 'out' ? 'is-out' : ''}`}
      aria-hidden="true"
    >
      <div className="cinema-intro-inner">
        <p className="cinema-intro-kicker" style={{ color: accent }}>
          ORUN ENGLISH
        </p>
        <h2 className="cinema-intro-school">{school}</h2>
        <p className="cinema-intro-exam">{exam}</p>
        <span className="cinema-intro-rule" style={{ background: accent }} />
      </div>
    </div>
  );
};

export default CinematicIntro;
