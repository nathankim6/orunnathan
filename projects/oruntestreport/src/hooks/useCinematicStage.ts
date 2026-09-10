import { useEffect } from 'react';

/**
 * 시네마틱 무대의 두 가지 잔손질.
 *
 * 1) 조금이라도 스크롤하면 위아래 시네마 바를 걷는다. 처음 열었을 때만
 *    영화가 시작하는 느낌을 주고, 읽기 시작하면 방해하지 않는다.
 * 2) 섹션이 화면에 들어올 때 살짝 떠오르게 한다. 클래스를 각 컴포넌트에
 *    일일이 달지 않고 여기서 한 번에 붙인다 — 섹션이 늘어도 손댈 곳이 없다.
 *
 * 캡처(PDF·이미지) 중에는 body.rp-capturing 이 붙어 등장 효과가 꺼진다.
 * captureUtils 가 그 클래스를 붙였다 뗀다.
 */
const useCinematicStage = (rootRef: React.RefObject<HTMLElement>, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    // 리포트 화면임을 바깥(상단 내비게이션)에도 알린다.
    document.body.classList.add('cinema-page');

    const onScroll = () => {
      document.body.classList.toggle('cinema-scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let observer: IntersectionObserver | null = null;

    if (!reduce && rootRef.current && 'IntersectionObserver' in window) {
      const sections = Array.from(rootRef.current.querySelectorAll<HTMLElement>('.report-section'));
      sections.forEach((el) => el.classList.add('rp-reveal'));
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            // 한 번 떠오른 뒤에는 그대로 둔다 — 오르내릴 때마다 깜빡이면 산만하다.
            observer?.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.06 },
      );
      sections.forEach((el) => observer?.observe(el));
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('cinema-scrolled');
      document.body.classList.remove('cinema-page');
      observer?.disconnect();
    };
  }, [rootRef, enabled]);
};

export default useCinematicStage;
