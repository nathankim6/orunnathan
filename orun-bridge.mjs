#!/usr/bin/env node
// ORUN 브리지 — 내 구독으로 동형 모의고사를 뽑는다
// ---------------------------------------------------------------------------
// 무엇을 하는가
//   이 컴퓨터에 깔려 있는 Claude Code(또는 Codex)를 대신 불러 주는 아주 작은
//   중계소다. 생성기 화면은 브라우저에서 이 중계소에게 "이 글로 문항을 써 줘"
//   하고, 중계소는 그 도구를 그대로 실행해 나오는 글자를 되돌려 준다.
//
// 왜 필요한가
//   ChatGPT·Claude 구독 자격은 그 도구가 들고 있고, 브라우저는 그것을 읽을 수
//   없다. Codex 의 app-server 는 Origin 헤더가 붙은 요청을 아예 403 으로 막아
//   두어서 브라우저가 직접 말을 걸 수도 없다. 그래서 중간에 이 한 겹을 둔다.
//
// 무엇을 하지 않는가
//   · 로그인 정보를 보지도 저장하지도 않는다. 자격은 claude / codex 가 들고 있다.
//   · 바깥으로 열지 않는다. 127.0.0.1 에만 붙고 그 밖의 주소는 거절한다.
//   · 시험지 내용을 어디에도 적어 두지 않는다. 받은 즉시 도구에 넘기고 잊는다.
//
// 쓰는 법
//   node orun-bridge.mjs
//   화면에 뜨는 여섯 자리 코드를 생성기의 "브리지 코드" 칸에 한 번 넣으면 끝.
//
// 옵션
//   --port 8787              듣는 문 번호
//   --allow-origin <주소>    이 주소의 화면도 허용한다 (여러 번 쓸 수 있다)
//   --timeout 900            한 번 부를 때 기다려 주는 초
//   --token ABC123           코드를 직접 정한다 (안 쓰면 그때그때 새로 만든다)
//   --app <주소>             생성기 화면을 어디서 받아 올지 (기본은 배포본)
//   --open <주소>            다 뜬 뒤 브라우저로 이 주소를 연다 (루프백만)
// ---------------------------------------------------------------------------

import http from "node:http";
import { spawn, execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const VERSION = "1.2.0";

// ── 뜰 때 준 것들 ──────────────────────────────────────────────────────────
function readArgs(argv) {
  const out = { port: 8787, timeout: 900, token: "", origins: [], app: "", open: "" };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = argv[i + 1];
    if (k === "--port") { out.port = Number(v) || out.port; i++; }
    else if (k === "--timeout") { out.timeout = Number(v) || out.timeout; i++; }
    else if (k === "--token") { out.token = String(v || "").trim(); i++; }
    else if (k === "--allow-origin") { if (v) out.origins.push(String(v).replace(/\/$/, "")); i++; }
    else if (k === "--app") { if (v) out.app = String(v).trim(); i++; }
    else if (k === "--open") { if (v) out.open = String(v).trim(); i++; }
  }
  return out;
}
const ARGS = readArgs(process.argv.slice(2));

// 코드 — 아무 웹사이트나 내 구독을 태우지 못하게 막는 자물쇠.
// 사람이 눈으로 옮겨 적으므로 헷갈리는 글자(0·O·1·I)는 뺀다.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newToken() {
  const b = randomBytes(6);
  let s = "";
  for (const n of b) s += ALPHABET[n % ALPHABET.length];
  return s;
}
const TOKEN = ARGS.token || newToken();

// 허용하는 화면 주소. 기본은 배포된 생성기와 이 컴퓨터에서 연 것들이다.
const DEFAULT_ORIGINS = [
  "https://nathankim6.github.io",
  "https://orunaistudio.lovable.app",
];
const ALLOW = new Set([...DEFAULT_ORIGINS, ...ARGS.origins]);
function originOk(origin) {
  if (!origin) return true;                       // 헤더가 없는 호출(curl 등)
  if (origin === "null") return true;             // 파일을 그대로 연 화면(file://)
  if (ALLOW.has(origin)) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

// ── 도구 찾기 ──────────────────────────────────────────────────────────────
// 어떤 도구를 어떻게 부르는지는 한 곳에 모아 둔다. 새 도구를 붙일 자리이기도 하다.
const AGENTS = {
  claude: {
    name: "Claude Code",
    bin: "claude",
    plan: "Claude Pro · Max 구독",
    versionArgs: ["--version"],
    images: true,          // 그림을 파일로 놓아 주면 Read 로 본다
    // 코딩 도구가 아니라 글 쓰는 도구로 쓴다 — 연장은 전부 내려놓게 한다.
    // 스캔본을 읽을 때만 Read 하나를 열어 준다. 일하는 곳이 빈 임시 방이라
    // 거기 놓인 쪽 그림 말고는 열 것이 없다.
    runArgs(model, withImages) {
      const a = [
        "-p",
        "--output-format", "stream-json",
        "--include-partial-messages",
        "--verbose",
        "--disable-slash-commands",
        "--disallowed-tools",
        withImages
          ? "Bash Edit Write Glob Grep WebFetch WebSearch Task NotebookEdit"
          : "Bash Edit Write Read Glob Grep WebFetch WebSearch Task NotebookEdit",
        "--system-prompt",
        "너는 한국 고등학교 영어 시험지를 만드는 출제 조력자다. "
        + "받은 지시문을 그대로 따르고, 요청받은 형식(HTML 조각 또는 JSON)만 답한다. "
        + "설명·인사·머리말을 덧붙이지 않는다."
        + (withImages ? " 지금 폴더에 놓인 쪽 그림 말고 다른 파일은 열지 않는다." : ""),
      ];
      if (withImages) a.push("--allowedTools", "Read");
      if (model) a.push("--model", model);
      return a;
    },
    // 한 줄(JSON)을 읽어 무엇이 일어났는지 알려 준다.
    parse(ev) {
      if (ev.type === "stream_event" && ev.event && ev.event.type === "content_block_delta") {
        const d = ev.event.delta;
        if (d && d.type === "text_delta" && d.text) return { delta: d.text };
      }
      if (ev.type === "result") {
        if (ev.is_error) return { fail: String(ev.result || ev.subtype || "실패") };
        return { done: String(ev.result || ""), usage: ev.usage || null };
      }
      if (ev.type === "rate_limit_event" && ev.rate_limit_info) {
        const w = ev.rate_limit_info.unifiedWindows || {};
        return { limit: {
          five_hour: w.five_hour || null,
          seven_day: w.seven_day || null,
          status: ev.rate_limit_info.status || "",
        } };
      }
      return null;
    },
  },
  codex: {
    name: "Codex",
    bin: "codex",
    plan: "ChatGPT Plus · Pro · Team 구독",
    versionArgs: ["--version"],
    images: false,         // codex exec 는 --json 과 --image 를 같이 주면 멈춘다
    // exec 는 한 번 돌고 끝나는 모드다. 읽기 전용 상자 안에서만 돌게 묶는다.
    runArgs(model) {
      const a = ["exec", "--json", "--sandbox", "read-only", "--skip-git-repo-check"];
      if (model) a.push("--model", model);
      a.push("-");                                 // 지시문은 stdin 으로 넣는다
      return a;
    },
    parse(ev) {
      // 부분 글자는 item.updated 로 온다. 앞서 받은 만큼을 빼고 새로 온 것만 넘긴다.
      if ((ev.type === "item.updated" || ev.type === "item.completed") && ev.item
          && (ev.item.type === "agent_message" || ev.item.type === "assistant_message")) {
        return { whole: String(ev.item.text || "") , final: ev.type === "item.completed" };
      }
      if (ev.type === "turn.completed") return { done: null, usage: ev.usage || null };
      if (ev.type === "turn.failed") return { fail: String((ev.error && ev.error.message) || "실패") };
      return null;
    },
  },
};

function probe(agent) {
  return new Promise((res) => {
    execFile(agent.bin, agent.versionArgs, { timeout: 15000 }, (err, out) => {
      if (err) return res({ ok: false, version: "" });
      res({ ok: true, version: String(out || "").trim().split("\n")[0].slice(0, 60) });
    });
  });
}

// ── 한 번 부르기 ───────────────────────────────────────────────────────────
// SSE 로 delta 를 흘려 보내고 done 으로 끝낸다. 화면이 끊으면 아이를 죽인다.
const IMG_EXT = { "image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg", "image/webp": "webp" };

async function run(agent, prompt, model, images, res, timeoutMs) {
  const dir = await mkdtemp(join(tmpdir(), "orun-bridge-"));   // 빈 방에서 돌린다
  let child, closed = false, sent = 0, whole = "", finished = false;

  // 스캔본은 방 안에 쪽 그림으로 놓고, 지시문 맨 앞에 "이것부터 보라" 고 적는다.
  // 방은 이 호출이 끝나면 통째로 지운다 — 시험지 그림이 컴퓨터에 남지 않는다.
  let head = "";
  if (images && images.length) {
    const names = [];
    for (let i = 0; i < images.length; i++) {
      const im = images[i] || {};
      const ext = IMG_EXT[String(im.mediaType || im.media_type || "").toLowerCase()] || "png";
      const name = "page" + (i + 1) + "." + ext;
      try { await writeFile(join(dir, name), Buffer.from(String(im.data || ""), "base64")); }
      catch (e) { continue; }
      names.push(name);
    }
    if (!names.length) {
      await rm(dir, { recursive: true, force: true }).catch(() => {});
      res.writeHead(200, { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-store" });
      res.write("data: " + JSON.stringify({ type: "error", message: "쪽 그림을 옮기지 못했어요." }) + "\n\n");
      return res.end();
    }
    head = "[첨부 그림]\n지금 폴더에 시험지 쪽 그림이 있다: " + names.join(", ") + "\n"
      + "Read 도구로 " + names.length + "장을 하나씩 열어 본 뒤 아래 지시를 따른다. "
      + "그림 밖의 파일은 열지 않는다.\n\n";
  }

  const send = (obj) => { if (!closed) res.write("data: " + JSON.stringify(obj) + "\n\n"); };
  const finish = (obj) => {
    if (finished) return;
    finished = true;
    send(obj);
    if (!closed) res.end();
    cleanup();
  };
  const cleanup = () => {
    clearTimeout(timer);
    try { if (child && child.exitCode === null) child.kill("SIGTERM"); } catch (e) {}
    rm(dir, { recursive: true, force: true }).catch(() => {});
  };
  const timer = setTimeout(() => finish({ type: "error", message: "시간이 너무 오래 걸려 멈췄어요 (" + Math.round(timeoutMs / 1000) + "초)." }), timeoutMs);

  res.on("close", () => { closed = true; cleanup(); });

  try {
    child = spawn(agent.bin, agent.runArgs(model, !!(images && images.length)), {
      cwd: dir,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
    });
  } catch (e) {
    return finish({ type: "error", message: agent.name + " 을 실행하지 못했어요. 설치돼 있는지 확인해 주세요." });
  }

  child.on("error", (e) => finish({
    type: "error",
    message: e && e.code === "ENOENT"
      ? agent.name + " 을 찾지 못했어요. 먼저 설치하고 로그인해 주세요."
      : agent.name + " 을 실행하지 못했어요: " + (e && e.message),
  }));

  let buf = "", errBuf = "";
  child.stderr.on("data", (d) => { errBuf = (errBuf + d).slice(-4000); });
  child.stdout.on("data", (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf("\n")) !== -1) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line || line[0] !== "{") continue;
      let ev; try { ev = JSON.parse(line); } catch (e) { continue; }
      let r; try { r = agent.parse(ev); } catch (e) { r = null; }
      if (!r) continue;
      if (r.delta) { whole += r.delta; sent = whole.length; send({ type: "delta", text: r.delta }); }
      if (typeof r.whole === "string") {
        // 통째로 오는 쪽 — 지난번보다 늘어난 만큼만 흘려 보낸다
        if (r.whole.length > sent) { send({ type: "delta", text: r.whole.slice(sent) }); sent = r.whole.length; }
        whole = r.whole;
      }
      if (r.limit) send({ type: "limit", limit: r.limit });
      if (r.fail) return finish({ type: "error", message: r.fail });
      if (r.done !== undefined) {
        const text = (r.done === null ? whole : r.done) || whole;
        if (text.length > sent) send({ type: "delta", text: text.slice(sent) });
        return finish({ type: "done", text, usage: r.usage || null });
      }
    }
  });

  child.on("close", (code) => {
    if (finished) return;
    if (whole.trim()) return finish({ type: "done", text: whole, usage: null });
    const tail = errBuf.trim().split("\n").slice(-3).join(" ").slice(0, 300);
    finish({ type: "error", message: agent.name + " 이 답을 내지 못하고 끝났어요"
      + (code ? " (종료 코드 " + code + ")" : "") + (tail ? " — " + tail : "")
      + ". 터미널에서 " + agent.bin + " 을 한 번 실행해 로그인이 살아 있는지 확인해 주세요." });
  });

  child.stdin.on("error", () => {});
  child.stdin.end(head + prompt);
}

// ── 문 열기 ────────────────────────────────────────────────────────────────
function cors(req, res) {
  const origin = req.headers.origin;
  if (!originOk(origin)) return false;
  if (origin) {
    res.setHeader("access-control-allow-origin", origin);
    res.setHeader("vary", "origin");
  }
  res.setHeader("access-control-allow-headers", "content-type, authorization");
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-max-age", "600");
  // 크롬 142 부터 공개 사이트가 이 컴퓨터 안을 부르려면 이 줄이 있어야 한다
  if (req.headers["access-control-request-private-network"] === "true") {
    res.setHeader("access-control-allow-private-network", "true");
  }
  return true;
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let n = 0; const parts = [];
    req.on("data", (d) => {
      n += d.length;
      if (n > limit) { reject(new Error("too_large")); req.destroy(); return; }
      parts.push(d);
    });
    req.on("end", () => resolve(Buffer.concat(parts).toString("utf8")));
    req.on("error", reject);
  });
}

const BODY_LIMIT = 48 * 1024 * 1024;   // 쪽 그림이 base64 로 실려 온다

// ── 생성기 화면을 여기서 내준다 ────────────────────────────────────────────
// 크롬은 공개 https 사이트가 이 컴퓨터 안(127.0.0.1)을 부르면 그 요청을 붙잡아
// 둔다(로컬 네트워크 권한). 답이 영영 오지 않아 화면이 "확인하는 중" 에서 멈춘다.
// 그래서 화면도 여기서 내준다 — 화면과 중계소가 같은 자리면 막을 것이 없다.
// 사본을 만드는 것이 아니라 배포된 그 한 벌을 받아 와 그대로 흘려 준다.
const APP_URL = ARGS.app || process.env.ORUN_APP_SRC || "https://nathankim6.github.io/orunnathan/mock-exam.html";
const APP_CACHE = join(dirname(fileURLToPath(import.meta.url)), "orun-app.html");
let appMem = null;            // 이번에 켠 동안 들고 있는 것
async function fetchApp() {
  if (APP_URL.startsWith("file://")) return await readFile(fileURLToPath(APP_URL), "utf8");
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(APP_URL, { cache: "no-store", signal: ctl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.text();
  } finally { clearTimeout(timer); }
}
async function appHtml() {
  if (appMem) return appMem;
  try {
    const html = await fetchApp();
    if (!/<html|<body|orun/i.test(html)) throw new Error("생성기 화면이 아닙니다");
    appMem = html;
    writeFile(APP_CACHE, html).catch(() => {});
    return html;
  } catch (e) {
    // 인터넷이 끊겨도 지난번에 받아 둔 것으로 연다
    try { appMem = await readFile(APP_CACHE, "utf8"); return appMem; } catch (e2) {}
    throw e;
  }
}

const server = http.createServer(async (req, res) => {
  if (!cors(req, res)) {
    res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    return res.end("이 주소의 화면은 허용돼 있지 않아요. --allow-origin 으로 넣어 주세요.");
  }
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  const url = new URL(req.url, "http://127.0.0.1");
  const json = (code, obj) => {
    res.writeHead(code, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    res.end(JSON.stringify(obj));
  };

  // 생성기 화면 — 여기서 열어야 크롬이 막지 않는다
  if (req.method === "GET" && ["/", "/index.html", "/mock-exam.html", "/mocktest-generator.html"].includes(url.pathname)) {
    try {
      const html = await appHtml();
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      return res.end(html);
    } catch (e) {
      res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
      return res.end("생성기 화면을 받아 오지 못했어요. 인터넷 연결을 확인한 뒤 새로 고쳐 주세요.\n" + String(e && e.message || e));
    }
  }

  // 어떤 도구가 준비돼 있는지 — 코드 없이도 볼 수 있게 둔다(코드 맞추기 화면용)
  if (req.method === "GET" && url.pathname === "/health") {
    const [claude, codex] = await Promise.all([probe(AGENTS.claude), probe(AGENTS.codex)]);
    return json(200, {
      ok: true, name: "orun-bridge", version: VERSION,
      agents: {
        claude: { ...claude, label: AGENTS.claude.name, plan: AGENTS.claude.plan, images: AGENTS.claude.images },
        codex: { ...codex, label: AGENTS.codex.name, plan: AGENTS.codex.plan, images: AGENTS.codex.images },
      },
      images: AGENTS.claude.images || AGENTS.codex.images,
    });
  }

  const bearer = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (bearer.toUpperCase() !== TOKEN) return json(401, { ok: false, error: "bad_token", message: "브리지 코드가 맞지 않아요. 터미널에 뜬 여섯 자리를 다시 넣어 주세요." });

  if (req.method === "POST" && url.pathname === "/run") {
    let body;
    try { body = JSON.parse(await readBody(req, BODY_LIMIT)); }
    catch (e) {
      return json(e && e.message === "too_large" ? 413 : 400,
        { ok: false, error: "bad_body", message: e && e.message === "too_large" ? "보낸 글이 너무 커요." : "요청을 읽지 못했어요." });
    }
    const agent = AGENTS[body.agent === "codex" ? "codex" : "claude"];
    const prompt = String(body.prompt || "");
    if (!prompt.trim()) return json(400, { ok: false, error: "no_prompt", message: "보낼 글이 비어 있어요." });
    const images = Array.isArray(body.images) ? body.images : [];
    if (images.length && !agent.images) {
      return json(400, { ok: false, error: "no_images",
        message: agent.name + " 으로는 아직 스캔본(그림)을 못 읽어요. 쓸 도구를 Claude Code 로 바꾸거나, API 키 방식으로 돌려 주세요." });
    }
    if (images.length > 12) {
      return json(400, { ok: false, error: "too_many_images", message: "한 번에 보낼 수 있는 쪽 그림은 12장까지예요." });
    }
    res.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    });
    res.write(": open\n\n");
    return run(agent, prompt, String(body.model || "").trim(), images, res, Math.max(30, ARGS.timeout) * 1000);
  }

  json(404, { ok: false, error: "not_found" });
});

server.on("clientError", (e, sock) => { try { sock.destroy(); } catch (x) {} });

server.listen(ARGS.port, "127.0.0.1", async () => {
  const [claude, codex] = await Promise.all([probe(AGENTS.claude), probe(AGENTS.codex)]);
  const line = (a, p) => "  " + (p.ok ? "준비됨" : "없음  ") + "  " + a.name.padEnd(12)
    + (p.ok ? p.version + (a.images ? "   · 스캔본 읽기 됨" : "   · 스캔본 안 됨") : "— " + a.plan + " 으로 로그인한 뒤 다시 켜 주세요");
  console.log("");
  console.log("  ORUN 브리지 " + VERSION + " — 내 구독으로 시험지를 뽑습니다");
  console.log("  " + "─".repeat(62));
  console.log(line(AGENTS.claude, claude));
  console.log(line(AGENTS.codex, codex));
  console.log("  " + "─".repeat(62));
  console.log("  화면      http://127.0.0.1:" + ARGS.port + "/     ← 여기서 여세요");
  console.log("  주소      http://127.0.0.1:" + ARGS.port);
  console.log("  코드      " + TOKEN + "   ← 생성기의 '브리지 코드' 칸에 넣으세요");
  console.log("  " + "─".repeat(62));
  console.log("  이 창을 열어 둔 동안에만 이어집니다. 끄려면 Ctrl+C.");
  // 다 뜬 다음에 브라우저를 연다. 먼저 열면 아직 듣지 않아 빈 화면이 난다.
  if (ARGS.open && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(ARGS.open)) {
    const how = process.platform === "win32" ? ["cmd", ["/c", "start", "", ARGS.open]]
      : process.platform === "darwin" ? ["open", [ARGS.open]] : ["xdg-open", [ARGS.open]];
    // spawn 은 못 찾으면 예외가 아니라 error 이벤트로 온다. 안 받으면 브리지가 통째로 죽는다.
    try {
      const ch = spawn(how[0], how[1], { stdio: "ignore", detached: true });
      ch.on("error", () => { console.log("  (브라우저를 열지 못했습니다 — 위 주소를 직접 열어 주세요)"); });
      ch.unref();
    } catch (e) {}
  }
  if (!claude.ok && !codex.ok) {
    console.log("");
    console.log("  ! 쓸 수 있는 도구가 없습니다. 둘 중 하나를 깔고 로그인해 주세요.");
    console.log("    Claude Code : npm i -g @anthropic-ai/claude-code   그리고  claude");
    console.log("    Codex       : npm i -g @openai/codex               그리고  codex");
  }
  console.log("");
});

server.on("error", (e) => {
  if (e && e.code === "EADDRINUSE") {
    console.error("\n  " + ARGS.port + "번 문이 이미 쓰이고 있어요. --port 8788 처럼 다른 번호를 주세요.\n");
    process.exit(1);
  }
  console.error(e);
  process.exit(1);
});
