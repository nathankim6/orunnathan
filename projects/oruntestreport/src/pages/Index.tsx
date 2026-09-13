import React, { useEffect, useState, type PointerEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SaveAll, Plus, ArrowRight, ArrowDown, Pause, Play } from "lucide-react";
import orunLogoAsset from "@/assets/orun-logo.png.asset.json";
import iconPreciseAnalysis from "@/assets/icons/icon-precise-analysis.png.asset.json";
import iconEasyWriting from "@/assets/icons/icon-easy-writing.png.asset.json";
import iconInstantShare from "@/assets/icons/icon-instant-share.png.asset.json";
import { isUniversePaused, prefersReducedMotion, setUniversePaused, subscribeUniverseMotion } from "@/components/universe/motion";

const orunLogo = orunLogoAsset.url;
const idx = (i: number) => ({ "--i": i } as React.CSSProperties);

const features = [
  { iconUrl: iconPreciseAnalysis.url, eyebrow: "Automation", title: "자동화", desc: "고급 추론 AI 모델을 활용한 시험 자동 분석", glyph: "A", tone: "u-tile--cyan", n: "03" },
  { iconUrl: iconEasyWriting.url, eyebrow: "Refinement", title: "정교함", desc: "직접 수정을 통한 분석의 정교함 강화", glyph: "R", tone: "u-tile--violet", n: "04" },
  { iconUrl: iconInstantShare.url, eyebrow: "Personalization", title: "개인화", desc: "링크 전달 한 번으로 학생별 취약 유형 파악", glyph: "P", tone: "u-tile--rose", n: "05" },
];

/** 카드 위 조명이 마우스를 따라간다 */
const moveLight = (event: PointerEvent<HTMLElement>) => {
  if (event.pointerType !== "mouse") return;
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--light-x", `${event.clientX - box.left}px`);
  event.currentTarget.style.setProperty("--light-y", `${event.clientY - box.top}px`);
};

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [paused, setPaused] = useState(() => isUniversePaused());
  const reduced = prefersReducedMotion();
  useEffect(() => subscribeUniverseMotion(setPaused), []);

  return (
    <div className="u-page">
      <main className="u-shell">
        {/* ── 히어로 ─────────────────────────────────────────── */}
        <section className="u-hero" aria-labelledby="hero-title">
          <div className="u-parallax" style={{ "--u-px": "-16px" } as React.CSSProperties}>
            <div className="u-hero-inner">
              <p className="u-eyebrow u-eyebrow--rule u-rise" style={idx(0)}>
                <i aria-hidden="true" />
                <span className="u-hero-brand">
                  <img src={orunLogo} alt="" onError={(e) => { e.currentTarget.hidden = true; }} />
                  ORUN ENGLISH
                </span>
                <i aria-hidden="true" />
              </p>
              <h1 id="hero-title" className="u-hero-title">
                ORUN <b>EXAM ANALYTICS</b>
              </h1>
              <p className="u-hero-korean u-rise" style={idx(2)}>내신시험 분석 리포트</p>
              <p className="u-lede u-hero-lede u-rise" style={idx(3)}>
                고급 AI 추론 모델로 학교 기출 시험을 자동 분석하고, 학생별 취약 유형까지 링크 한 번으로 전달합니다.
              </p>
              <div className="u-hero-actions u-rise" style={idx(4)}>
                <button type="button" onClick={() => navigate("/create-report")} className="u-btn u-btn--gold u-btn--lg">
                  <Plus aria-hidden="true" />
                  새 리포트 작성
                  <ArrowRight aria-hidden="true" />
                </button>
                <button type="button" onClick={() => navigate("/saved-reports")} className="u-btn u-btn--lg">
                  <SaveAll aria-hidden="true" />
                  저장된 리포트
                </button>
              </div>
            </div>
          </div>

          <a className="u-scroll-cue" href="#modules" aria-label="아래 기능 소개로 이동">
            <span>EXPLORE</span>
            <ArrowDown size={16} strokeWidth={1.4} aria-hidden="true" />
          </a>
          <button
            className="u-motion-toggle"
            type="button"
            disabled={reduced}
            onClick={() => setUniversePaused(!paused)}
            aria-pressed={paused}
            aria-label="배경 애니메이션 일시정지"
            title={reduced ? "기기의 모션 줄이기 설정이 적용되었습니다" : paused ? "배경 애니메이션 재생" : "배경 애니메이션 일시정지"}
          >
            {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            <span>MOTION {paused ? "OFF" : "ON"}</span>
          </button>
        </section>

        {/* ── 모듈 타일 ──────────────────────────────────────── */}
        <section id="modules" className="u-section-block" aria-label="리포트 서비스" tabIndex={-1}>
          <div className="u-section-block-head">
            <span className="u-eyebrow u-eyebrow--gold">Services</span>
            <h2 className="u-h2">리포트 작성부터 공유까지, 한 은하 안에서</h2>
            <p className="u-lede">두 개의 입구와 세 가지 원칙. 시험지를 올리면 분석이 시작되고, 저장된 리포트는 언제든 다시 열립니다.</p>
          </div>
          <div className="u-grid">
            <Link to="/create-report" className="u-tile u-tile--big u-tile--gold" onPointerMove={moveLight}>
              <span className="u-tile-accent" aria-hidden="true" />
              <span className="u-tile-orbit" aria-hidden="true" />
              <span className="u-tile-number">01</span>
              <span className="u-tile-glyph" aria-hidden="true">N</span>
              <div className="u-tile-content">
                <span className="u-tile-eyebrow">New Report</span>
                <h3>새 리포트 작성</h3>
                <p>학교 유형을 고르고 시험지 PDF를 올리면, AI가 문항별 범위·배점·난도·정답을 채웁니다.</p>
              </div>
              <span className="u-tile-enter"><span>ENTER</span><b><ArrowRight aria-hidden="true" /></b></span>
            </Link>
            <Link to="/saved-reports" className="u-tile u-tile--big u-tile--blue" onPointerMove={moveLight}>
              <span className="u-tile-accent" aria-hidden="true" />
              <span className="u-tile-orbit" aria-hidden="true" />
              <span className="u-tile-number">02</span>
              <span className="u-tile-glyph" aria-hidden="true">S</span>
              <div className="u-tile-content">
                <span className="u-tile-eyebrow">Saved Reports</span>
                <h3>저장된 리포트</h3>
                <p>선생님별·시험별로 보관된 리포트를 열어 확인하고 수정하거나, 학생 성적 제출 링크를 보냅니다.</p>
              </div>
              <span className="u-tile-enter"><span>ENTER</span><b><ArrowRight aria-hidden="true" /></b></span>
            </Link>
            {features.map((f) => (
              <div key={f.title} className={`u-tile u-tile--static ${f.tone}`} onPointerMove={moveLight}>
                <span className="u-tile-accent" aria-hidden="true" />
                <span className="u-tile-orbit" aria-hidden="true" />
                <span className="u-tile-number">{f.n}</span>
                <span className="u-tile-glyph" aria-hidden="true">{f.glyph}</span>
                <img src={f.iconUrl} alt="" loading="lazy" width={52} height={52} className="u-tile-icon" onError={(e) => { e.currentTarget.hidden = true; }} />
                <div className="u-tile-content">
                  <span className="u-tile-eyebrow">{f.eyebrow}</span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
                <span className="u-tile-enter"><span>PRINCIPLE</span><b>{f.n}</b></span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 파이프라인 패널 ───────────────────────────────── */}
        <section aria-labelledby="pipeline-title">
          <div className="u-parallax" style={{ "--u-px": "-6px" } as React.CSSProperties}>
            <div className="u-panel u-universe-panel">
              <i className="u-corner u-corner--tl" aria-hidden="true" />
              <i className="u-corner u-corner--br" aria-hidden="true" />
              <div className="u-universe-copy">
                <span className="u-chip">Report Pipeline</span>
                <h2 id="pipeline-title" className="u-hero-title u-hero-title--md">
                  FIVE <b>STEPS</b>
                </h2>
                <p className="u-lede">
                  기본 정보, 문항 수, 문제 유형, 출제 특징과 킬러 문항, 종합 평가. 다섯 단계를 지나면 학부모용 리포트 한 장이 완성됩니다.
                </p>
                <button type="button" className="u-btn u-btn--gold" onClick={() => navigate("/create-report")}>
                  <span className="u-btn-kicker">Enter</span>
                  리포트 작성 시작
                  <ArrowRight aria-hidden="true" />
                </button>
              </div>
              <div className="u-galaxy-list" aria-label="작성 단계">
                <span>Basic</span><span>Count</span><span>Types</span><span>Insight</span><span>Evaluation</span>
              </div>
            </div>
          </div>
        </section>

        <footer className="u-footer">
          <p><b>ORUN ENGLISH ACADEMY</b> · 옳은영어</p>
          <p>Copyright © 2025 ORUN ENGLISH. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
