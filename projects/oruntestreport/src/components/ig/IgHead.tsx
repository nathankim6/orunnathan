import React from 'react';

/**
 * 모듈 머리.
 *
 * 레퍼런스의 표기를 그대로 따른다. 왼쪽에 굵은 제목(두 줄), 그 옆에 흐린
 * 거대 숫자, 오른쪽에 회색 대문자 보조어(2~3줄), 그 아래 두꺼운 괘선.
 * 제목은 줄바꿈 금지 대신 keep-all + balance 로 두 줄을 고르게 나눈다.
 * 좁은 모듈(span-2)에서는 CSS 가 머리를 세로로 쌓는다.
 */
const IgHead: React.FC<{
  title: string;
  /** 제목 둘째 줄 — 흐리게 */
  title2?: string;
  /** 오른쪽 보조어. 첫 줄이 가장 크다. */
  sub?: string[];
  /** 제목 옆 거대 숫자 — 실데이터만(문항 수, 킬러 수 …) */
  big?: string | number;
  bigUnit?: string;
  /** 보조어 아래 오른쪽 열에 얹을 것(점 매트릭스 등) */
  aside?: React.ReactNode;
  rule?: 'heavy' | 'soft' | 'none';
  className?: string;
}> = ({ title, title2, sub, big, bigUnit, aside, rule = 'heavy', className = '' }) => (
  <div className={className}>
    <div className="ig-head">
      <div className="flex items-start gap-3 min-w-0">
        <h2 className="ig-h">
          {title}
          {title2 && (
            <>
              <br />
              <span className="ig-h-mute">{title2}</span>
            </>
          )}
        </h2>
        {big !== undefined && big !== null && big !== '' && (
          <span className="ig-big" aria-label={`${big}${bigUnit ?? ''}`}>
            {big}
            {bigUnit && <span className="ig-big-unit">{bigUnit}</span>}
          </span>
        )}
      </div>
      {(sub && sub.length > 0) || aside ? (
        <div className="flex flex-col items-end gap-2 flex-none">
          {sub && sub.length > 0 && (
            <p className="ig-sub">
              {sub.map((line, i) => (
                <span key={i} className={i === 0 ? 'ig-sub-1' : 'block'}>
                  {line}
                </span>
              ))}
            </p>
          )}
          {aside}
        </div>
      ) : null}
    </div>
    {rule !== 'none' && <div className={rule === 'heavy' ? 'ig-rule' : 'ig-rule-soft'} />}
  </div>
);

export default IgHead;
