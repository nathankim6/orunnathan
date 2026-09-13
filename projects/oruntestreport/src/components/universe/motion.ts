/**
 * 우주 무대의 재생/일시정지 스위치.
 *
 * 랜딩의 MOTION 토글과 App 에 하나만 마운트된 무대 사이를 잇는 작은 버스.
 * 선택은 localStorage 에 남고, 저장된 값이 없으면 기기의
 * prefers-reduced-motion 설정을 따른다.
 */
const KEY = 'orun-universe-motion';

type Listener = (paused: boolean) => void;
const listeners = new Set<Listener>();
let paused: boolean | null = null;

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

export function isUniversePaused(): boolean {
  if (paused === null) {
    try {
      const stored = localStorage.getItem(KEY);
      paused = stored === 'off' ? true : stored === 'on' ? false : prefersReducedMotion();
    } catch {
      paused = prefersReducedMotion();
    }
  }
  return paused;
}

export function setUniversePaused(value: boolean): void {
  paused = value;
  try {
    localStorage.setItem(KEY, value ? 'off' : 'on');
  } catch {
    /* 저장 불가 — 세션 동안만 유지 */
  }
  listeners.forEach((listener) => listener(value));
}

export function subscribeUniverseMotion(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
