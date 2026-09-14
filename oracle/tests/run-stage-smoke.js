// 3D 무대 연기 검사 — parts/40-post.js + parts/41-stage.js 를 그대로 얹은 페이지를 띄워 셰이더 컴파일·이펙트에 오류가 없는지 본다.
const { launch } = require("./browser");
const fs = require("fs"), path = require("path");
const T = __dirname, P = path.join(T, "..", "parts");
// three.js 주소는 build.sh 의 <script> 줄에서 읽는다 — 버전을 올려도 여기를 따로 고치지 않게
const THREE_URL = (/<script src="(https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/[^"]+)"/.exec(fs.readFileSync(path.join(T, "..", "build.sh"), "utf8")) || [])[1];
if (!THREE_URL) { console.error("FAIL build.sh 에서 three.js <script> 줄을 찾지 못했다"); process.exit(1); }
const html = '<title>stage smoke</title>\n<style>html,body{margin:0;height:100%;background:#03060e}#fx{position:fixed;inset:0;width:100%;height:100%}</style>\n<canvas id="fx"></canvas>\n' +
  '<script src="' + THREE_URL + '"></script>\n<script>\n' +
  fs.readFileSync(path.join(P, "40-post.js"), "utf8") + "\n" + fs.readFileSync(path.join(P, "41-stage.js"), "utf8") + "\n" +
  fs.readFileSync(path.join(T, "stage-smoke.tail.js"), "utf8") + "\n</script>\n";
fs.mkdirSync(path.join(T, "out"), { recursive: true });
const page_ = path.join(T, "out", "stage-smoke.html"); fs.writeFileSync(page_, html);
(async () => {
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.route(/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/, route => {
    const u = route.request().url().split("?")[0];
    const f = path.join(T, "cdn", u.replace("https://", "").replace(/\//g, "__"));
    if (fs.existsSync(f)) route.fulfill({ path: f, contentType: "text/javascript" }); else route.abort();
  });
  let bad = 0;
  const shots = [["a-idle", "?fx=0", 9000], ["c-learn", "?fx=1", 8000]];
  for (const [name, qs, wait] of shots) {
    const page = await ctx.newPage();
    const logs = [];
    page.on("console", m => { if (m.type() === "error") logs.push(m.text().slice(0, 300)); });
    page.on("pageerror", e => logs.push("pageerror: " + e.message));
    await page.goto("file://" + page_ + qs);
    await page.waitForTimeout(wait);
    await page.screenshot({ path: path.join(T, "out", "stage-" + name + ".png") });
    const info = await page.evaluate(() => ({ ok: !!window.__stage, errors: window.__errors }));
    const fine = info.ok && !info.errors.length && !logs.length; if (!fine) bad++;
    console.log((fine ? "ok   " : "FAIL ") + name, JSON.stringify(info), logs.length ? logs.join(" | ") : "no console errors");
    await page.close();
  }
  await browser.close();
  console.log(bad ? "STAGE SMOKE FAILED" : "STAGE SMOKE PASSED");
  process.exitCode = bad ? 1 : 0;
})().catch(e => { console.error("FAIL", e); process.exit(1); });
