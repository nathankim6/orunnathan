export const playNotify = () => {
  try {
    const audio = new Audio('/assets/notify.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {
    // ignore audio errors
  }
};
