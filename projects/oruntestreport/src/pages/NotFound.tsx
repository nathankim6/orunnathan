import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 에러: 존재하지 않는 경로에 접근 시도:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="u-page u-center">
      <div className="u-panel u-panel--pad u-panel--gold u-rise" style={{ maxWidth: 640, width: "100%", padding: "clamp(32px, 6vw, 60px)" }}>
        <i className="u-corner u-corner--tl" aria-hidden="true" />
        <i className="u-corner u-corner--br" aria-hidden="true" />
        <span className="u-eyebrow u-eyebrow--gold">Lost in Space · Error</span>
        <h1 className="u-hero-title u-hero-title--404" style={{ marginTop: 14 }}>
          4<b>0</b>4
        </h1>
        <p className="u-h2" style={{ marginTop: 18 }}>페이지를 찾을 수 없습니다</p>
        <p className="u-lede" style={{ marginTop: 10 }}>
          요청하신 페이지가 존재하지 않거나, 이동되었거나, 접근 권한이 없습니다.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
          <button type="button" onClick={() => navigate("/")} className="u-btn u-btn--gold">
            <Home aria-hidden="true" />
            홈으로 돌아가기
          </button>
          <button type="button" onClick={() => navigate(-1)} className="u-btn">
            <ArrowLeft aria-hidden="true" />
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
