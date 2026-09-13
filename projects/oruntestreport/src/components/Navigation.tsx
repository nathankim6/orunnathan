import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { FileText, Plus, SaveAll, Home, School, GraduationCap } from "lucide-react";
import orunLogoAsset from "@/assets/orun-logo.png.asset.json";

/**
 * 상단 내비게이션 — 어디서나 어두운 유리 바(은하 톤).
 * 인쇄·캡처에서는 빠진다(print:hidden · capture-hide). 높이 64px 는 App 의 pt-16 과 짝이다.
 */
const Navigation: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isWriting = location.pathname.startsWith("/create-report") || location.pathname.startsWith("/edit-report");

  return (
    <header className="u-nav capture-hide print:hidden" data-capture-hide>
      <div className="u-nav-inner">
        <Link to="/" className="u-nav-brand" aria-label="내신시험 분석 리포트 홈">
          <span className="u-nav-diamond" aria-hidden="true" />
          <img
            src={orunLogoAsset.url}
            alt=""
            className="u-nav-logo"
            onError={(e) => { e.currentTarget.hidden = true; }}
          />
          <span className="u-nav-text">
            <span className="u-nav-title">내신시험 분석 리포트</span>
            <span className="u-nav-eyebrow">ORUN ENGLISH · EXAM ANALYTICS</span>
          </span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="u-nav-links">
            <NavigationMenuItem>
              <Link to="/" className="u-nav-link" data-active={isActive("/")} aria-current={isActive("/") ? "page" : undefined}>
                <Home aria-hidden="true" />
                <span className="u-nav-link-label">홈</span>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="u-nav-link" data-active={isWriting}>
                <Plus aria-hidden="true" />
                <span className="u-nav-link-label">리포트 작성</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="u-nav-menu">
                  <span className="u-nav-menu-kicker">New Report</span>
                  <Link to="/create-report/middle"><School aria-hidden="true" />중학교 리포트 작성</Link>
                  <Link to="/create-report/high"><GraduationCap aria-hidden="true" />고등학교 리포트 작성</Link>
                  <Link to="/create-report"><FileText aria-hidden="true" />학교 유형 선택</Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/saved-reports" className="u-nav-link" data-active={isActive("/saved-reports")} aria-current={isActive("/saved-reports") ? "page" : undefined}>
                <SaveAll aria-hidden="true" />
                <span className="u-nav-link-label">저장된 리포트</span>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default Navigation;
