import React, { type PointerEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, School, GraduationCap, ArrowRight } from "lucide-react";
import orunLogoAsset from "@/assets/orun-logo.png.asset.json";

const orunLogo = orunLogoAsset.url;
const idx = (i: number) => ({ "--i": i } as React.CSSProperties);

const moveLight = (event: PointerEvent<HTMLElement>) => {
  if (event.pointerType !== "mouse") return;
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--light-x", `${event.clientX - box.left}px`);
  event.currentTarget.style.setProperty("--light-y", `${event.clientY - box.top}px`);
};

const SchoolTypeSelector: React.FC = () => {
  const navigate = useNavigate();

  const cards = [
    { type: "middle", eyebrow: "Middle School", title: "중학교", sub: "중1 · 중2 · 중3 내신 분석 리포트", icon: School, glyph: "M", tone: "u-tile--blue", n: "01" },
    { type: "high", eyebrow: "High School", title: "고등학교", sub: "고등부 내신 · 모의고사 분석 리포트", icon: GraduationCap, glyph: "H", tone: "u-tile--gold", n: "02" },
  ];

  return (
    <div className="u-page">
      <div className="u-shell u-shell--narrow u-section">
        <div className="u-topbar u-rise" style={idx(0)}>
          <button type="button" onClick={() => navigate("/")} className="u-btn u-btn--sm">
            <ArrowLeft aria-hidden="true" />
            홈으로
          </button>
          <img src={orunLogo} alt="옳은영어 로고" className="u-nav-logo" style={{ width: 40, height: 40 }} onError={(e) => { e.currentTarget.hidden = true; }} />
        </div>

        <header className="u-page-head u-rise" style={idx(1)}>
          <span className="u-chip">Step 1 · School Type</span>
          <h1 className="u-h1">
            어떤 학교의 리포트를
            <br />
            작성할까요?
          </h1>
          <p className="u-lede">학교 유형을 선택하면 맞춤 입력 폼이 준비됩니다.</p>
        </header>

        <div className="u-stack">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <button
                key={c.type}
                type="button"
                onClick={() => navigate(`/create-report/${c.type}`)}
                onPointerMove={moveLight}
                className={`u-tile u-tile--row u-rise ${c.tone}`}
                style={{ ...idx(2 + i), width: "100%" }}
              >
                <span className="u-tile-accent" aria-hidden="true" />
                <span className="u-tile-glyph" aria-hidden="true">{c.glyph}</span>
                <span className="u-icon-tile u-icon-tile--lg" aria-hidden="true">
                  <Icon />
                </span>
                <div className="u-tile-content">
                  <span className="u-tile-eyebrow">{c.n} · {c.eyebrow}</span>
                  <h3>{c.title}</h3>
                  <p>{c.sub}</p>
                </div>
                <ArrowRight aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <p className="u-cap u-rise" style={{ ...idx(4), marginTop: 28 }}>
          선택한 유형은 이후 단계에서 변경할 수 있어요.
        </p>
      </div>
    </div>
  );
};

export default SchoolTypeSelector;
