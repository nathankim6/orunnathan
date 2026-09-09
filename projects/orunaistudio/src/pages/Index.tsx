import { useEffect, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import orunEnglishLogo from '@/assets/orun-english-logo.png.asset.json';

type Module = {
  t: string;
  k: string;
  c: string;
  h: string;
  g: string;
  big?: boolean;
};

const modules: Module[] = [
  { t: 'ORUN UNIVERSE', k: '다섯 Galaxy로 보는 커리큘럼 지도', c: '#f5c518', h: '/universe', g: 'U', big: true },
  { t: 'ORUN GRAMMAR', k: '영문법 개념과 문제풀이 학습', c: '#388cff', h: '/grammar', g: 'G', big: true },
  { t: 'ORUN TEST', k: '옳은영어 표준 시험 솔루션', c: '#b07cff', h: 'https://omr-quiz-scan.lovable.app/', g: 'T' },
  { t: 'ORUN VOCA', k: '옳은영어 단어 학습 플랫폼', c: '#4adf9e', h: 'https://orunvoca.lovable.app', g: 'V' },
  { t: 'QUIZ MAKER', k: '맞춤형 변형문제 생성 도구', c: '#6366f1', h: 'https://orunquiz.lovable.app', g: 'Q' },
  { t: 'WORKBOOK MAKER', k: '워크북 자동 생성 도구', c: '#ff5f8a', h: 'https://orunworkbook.lovable.app', g: 'W' },
  { t: 'ORUN HOMEWORK', k: '학생별 숙제 관리 및 피드백', c: '#ff8a5f', h: 'https://orunhomework.com', g: 'H' },
  { t: 'SCHOOL ANALYSIS', k: '3개년 학교별 기출 분석', c: '#38bdf8', h: 'https://schoolanalysis.lovable.app', g: 'S' },
  { t: 'MOCK EXAM CREATOR', k: '동형 모의고사 생성기', c: '#ffd400', h: 'https://nathankim6.github.io/orunnathan/mock-exam.html', g: 'M', big: true },
];


const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    // 장면 파일은 #gl 캔버스를 직접 찾아 스스로 실행된다.
    import('@/scene/orunScene.js');
  }, []);

  useEffect(() => {
    const onScroll = () => document.body.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('scrolled');
    };
  }, []);

  return (
    <div className="cinema-page">
      <canvas ref={canvasRef} id="gl" aria-hidden="true" />
      <div className="cinema-vignette" aria-hidden="true" />
      <div className="letterbox letterbox-top" aria-hidden="true" />
      <div className="letterbox letterbox-bottom" aria-hidden="true" />


      <main className="cinema-content">
        <section id="top" className="hero-section">
          <div className="hero-inner">
            <p className="hero-eyebrow"><span /><img src={orunEnglishLogo.url} alt="옳은영어 ORUN ENGLISH" className="hero-logo" /><span /></p>
            <h1>ORUN <b>STUDIO</b></h1>
            <p className="hero-copy">English Learning by Christian Value.</p>
          </div>
        </section>

        <section id="modules" className="modules-section">
          <div className="section-shell">
            <div className="module-grid">
              {modules.map((module, index) => {
                const external = module.h.startsWith('http');
                const props = {
                  className: `module-tile${module.big ? ' module-tile-big' : ''}`,
                  style: { '--module-accent': module.c } as CSSProperties,
                  key: module.t,
                };
                const children = (
                  <>
                    <span className="module-accent" aria-hidden="true" />
                    <span className="module-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="module-glyph" aria-hidden="true">{module.g}</span>
                    <h3>{module.t}</h3>
                    <p>{module.k}</p>
                    <span className="module-enter">ENTER <b>▸</b></span>
                  </>
                );
                return external ? (
                  <a {...props} href={module.h} target="_blank" rel="noopener">
                    {children}
                  </a>
                ) : (
                  <Link {...props} to={module.h}>
                    {children}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="universe" className="universe-section">
          <div className="universe-panel">
            <span className="corner corner-top" aria-hidden="true" />
            <span className="corner corner-bottom" aria-hidden="true" />
            <div className="universe-copy">
              <span className="universe-badge">CURRICULUM MAP</span>
              <h2>ORUN <b>UNIVERSE</b></h2>
              <p>영어 학습의 모든 영역을 다섯 개의 Galaxy로 연결한 옳은영어의 커리큘럼 지도.</p>
              <Link className="cinema-button cinema-button-gold" to="/universe">ENTER UNIVERSE <span>→</span></Link>
            </div>
            <div className="galaxy-list" aria-label="Universe 학습 영역">
              <span>VOCAB</span><span>GRAMMAR</span><span>SYNTAX</span><span>USAGE</span><span>READING</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>ORUN ENGLISH · 옳은영어 · 서울 동작구</p>
        <p>© 2026 ORUN STUDIO</p>
      </footer>
    </div>
  );
};

export default Index;
