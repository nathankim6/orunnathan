// Playwright 크로미움을 찾아 띄운다 — 헤드리스 GPU 없이 WebGL 이 돌도록 swiftshader 를 켠다.
// 우선순위: CHROMIUM_PATH 환경변수 → playwright 가 아는 경로 → PLAYWRIGHT_BROWSERS_PATH 안의 chromium-* 아무거나
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path"), os = require("os");
function findChromium() {
  if (process.env.CHROMIUM_PATH && fs.existsSync(process.env.CHROMIUM_PATH)) return process.env.CHROMIUM_PATH;
  try { const p = chromium.executablePath(); if (p && fs.existsSync(p)) return p; } catch (e) {}
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, path.join(os.homedir(), ".cache", "ms-playwright")].filter(Boolean);
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const d of fs.readdirSync(root).filter(x => /^chromium-\d+$/.test(x)).sort().reverse()) {
      for (const rel of ["chrome-linux/chrome", "chrome-linux64/chrome", "chrome-mac/Chromium.app/Contents/MacOS/Chromium", "chrome-win/chrome.exe"]) {
        const p = path.join(root, d, rel); if (fs.existsSync(p)) return p;
      }
    }
  }
  return undefined;   // playwright 기본값에 맡긴다 (없으면 npx playwright install chromium)
}
async function launch(extra) {
  const executablePath = findChromium();
  return chromium.launch(Object.assign({ executablePath, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--no-sandbox"] }, extra || {}));
}
module.exports = { launch, findChromium };
