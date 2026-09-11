import React from 'react';

/**
 * 모듈 머리.
 *
 * 레퍼런스의 표기를 그대로 따른다. 왼쪽에 굵은 제목, 오른쪽에 회색 대문자
 * 보조어, 그 아래 두꺼운 괘선. 보조어는 첫 줄만 크게 잡아 리듬을 만든다.
 * 제목 둘째 줄은 흐리게 눌러, 한 덩어리가 아니라 두 박자로 읽히게 한다.
 */
const IgHead: React.FC<{
  title: string;
  /** 제목 둘째 줄 — 흐리게 */
  title2?: string;
  /** 오른쪽 보조어. 첫 줄이 가장 크다. */
  sub?: string[];
  rule?: 'heavy' | 'soft' | 'none';
  className?: string;
}> = ({ title, title2, sub, rule = 'heavy', className = '' }) => (
  <div className={className}>
    <div className="ig-head">
      <h2 className="ig-h pdf-capture-nowrap">
        {title}
        {title2 && (
          <>
            <br />
            <span className="ig-h-mute">{title2}</span>
          </>
        )}
      </h2>
      {sub && sub.length > 0 && (
        <p className="ig-sub">
          {sub.map((line, i) => (
            <span key={i} className={i === 0 ? 'ig-sub-1' : 'block'}>
              {line}
            </span>
          ))}
        </p>
      )}
    </div>
    {rule !== 'none' && <div className={rule === 'heavy' ? 'ig-rule' : 'ig-rule-soft'} />}
  </div>
);

export default IgHead;
