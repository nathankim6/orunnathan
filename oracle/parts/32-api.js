  // ==================================================================
  //  API — 브라우저에서 api.anthropic.com / api.openai.com 으로 직접 보낸다. 서버 없음.
  //  키는 이 브라우저에만 둔다. 동형 모의고사 생성기와 같은 저장 키를 써서 같은 주소에서 키를 나눠 쓴다.
  // ==================================================================
  const API = (function () {
    const AN_URL = "https://api.anthropic.com/v1/messages";
    const OA_URL = "https://api.openai.com/v1/chat/completions";
    const OA_MODELS_URL = "https://api.openai.com/v1/models";
    const K = {
      an: "orun_api_key", oa: "orun_openai_key", provider: "orun_provider",
      anModel: "orun_api_model", oaModel: "orun_openai_model", keep: "orun_api_keep",
    };
    const AN_MODELS = { opus: "claude-opus-5", sonnet: "claude-sonnet-5", fable: "claude-fable-5-1", opus46: "claude-opus-4-6" };
    const AN_LABELS = { opus: "Opus 5", sonnet: "Sonnet 5", fable: "Fable 5.1", opus46: "Opus 4.6" };
    const OA_PRESETS = ["gpt-5.6-terra", "gpt-6-astra", "gpt-5.6-sol", "gpt-5.6-luna"];
    const OA_DEFAULT = "gpt-5.6-terra";
    const MAX_TOKENS = { complex: 32000, default: 8000, small: 2000 };
    let fallbackOk = true;                       // 서버가 폴백 베타를 모르면 이후로는 빼고 보낸다
    let oaMaxField = "max_completion_tokens";    // 옛 모델은 max_tokens 만 받는다

    const ls = { get(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } },
                 set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
                 del(k) { try { localStorage.removeItem(k); } catch (e) {} } };
    const ss = { get(k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } },
                 set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
                 del(k) { try { sessionStorage.removeItem(k); } catch (e) {} } };

    function provider() { return ls.get(K.provider) === "openai" ? "openai" : "anthropic"; }
    function setProvider(v) { ls.set(K.provider, v === "openai" ? "openai" : "anthropic"); }
    function providerName() { return provider() === "openai" ? "OpenAI" : "Anthropic"; }
    function keepMode() { return ls.get(K.keep) === "session" ? "session" : "browser"; }
    function readKey(store) { return (ss.get(store) || ls.get(store) || "").trim(); }
    function writeKey(store, k) {
      ss.del(store); ls.del(store);
      if (!k) return;
      (keepMode() === "session" ? ss : ls).set(store, k.trim());
    }
    function setKeepMode(v) {
      const a = readKey(K.an), o = readKey(K.oa);
      ls.set(K.keep, v === "session" ? "session" : "browser");
      writeKey(K.an, a); writeKey(K.oa, o);
    }
    function anModelKey() { const m = ls.get(K.anModel) || "opus"; return AN_MODELS[m] ? m : "opus"; }
    function anModelId() { return AN_MODELS[anModelKey()]; }
    function setAnModel(k) { if (AN_MODELS[k]) ls.set(K.anModel, k); }
    function oaModel() { return (ls.get(K.oaModel) || "").trim() || OA_DEFAULT; }
    function setOaModel(v) { ls.set(K.oaModel, (v || "").trim()); }
    function currentKey() { return readKey(provider() === "openai" ? K.oa : K.an); }
    function setCurrentKey(k) { writeKey(provider() === "openai" ? K.oa : K.an, k); }
    function keyLooksRight(v) {
      v = (v || "").trim();
      if (provider() === "openai") return v.indexOf("sk-") === 0 && v.indexOf("sk-ant-") !== 0;
      return v.indexOf("sk-ant-") === 0;
    }
    function ready() { return !!currentKey() && (provider() !== "openai" || !!oaModel()); }
    function modelLabel() { return provider() === "openai" ? oaModel() : AN_LABELS[anModelKey()]; }

    function err(code, message, status) { const e = new Error(message || code); e.code = code; if (status) e.status = status; return e; }
    function netMsg(host) {
      return host + " 에 연결하지 못했어요. " + (location.protocol === "file:"
        ? "파일을 그대로 연 상태(file://)라 브라우저가 요청을 막았을 수 있어요. 웹 주소(https://…)에 올려서 열면 해결돼요."
        : "인터넷 연결과 광고 차단 확장(또는 사내 보안 프로그램)을 확인해 주세요.");
    }
    function httpErr(status, body, oa) {
      let msg = "";
      try { const j = JSON.parse(body); msg = (j.error && j.error.message) || ""; } catch (e) { msg = String(body || "").slice(0, 200); }
      const low = msg.toLowerCase();
      if (status === 401 || status === 403) return err("bad_key", msg, status);
      if (status === 429) return err(oa && low.includes("quota") ? "no_credit" : "rate_limited", msg, status);
      if (status === 413 || low.includes("too long") || low.includes("too large") || low.includes("context length")) return err("prompt_too_large", msg, status);
      if (status === 400 && low.includes("image")) return err("image_rejected", msg, status);
      if (status === 400 && low.includes("credit")) return err("no_credit", msg, status);
      if (status === 404 && oa) return err("bad_model", msg, status);
      if (status === 529 || status === 503 || status === 502) return err("overloaded", msg, status);
      return err("http_" + status, msg || ("HTTP " + status), status);
    }
    // 사람이 읽을 안내문
    function friendly(e) {
      const c = (e && e.code) || "";
      const m = { no_key: "API 키를 먼저 저장해 주세요.",
        bad_key: "API 키가 맞지 않아요. 키를 다시 확인해 주세요.",
        no_credit: "API 잔액이 없어요. " + providerName() + " 콘솔에서 결제 상태를 확인해 주세요.",
        rate_limited: "요청이 너무 잦아요. 잠시 뒤 다시 시도해 주세요.",
        prompt_too_large: "한 번에 보내는 양이 너무 커요. 파일을 나눠 올려 주세요.",
        image_rejected: "그림을 받아 주지 않았어요. 스캔 해상도를 낮춰 다시 저장해 보세요.",
        overloaded: providerName() + " 서버가 붐벼요. 잠시 뒤 다시 시도해 주세요.",
        bad_model: "모델 이름이 맞지 않아요. 설정에서 모델을 확인해 주세요.",
        cancelled: "중단했어요.", refused: "모델이 이 요청을 거절했어요. 내용을 조금 바꿔 다시 시도해 주세요.",
        invalid_json: "응답을 해석하지 못했어요. 한 번 더 시도해 주세요.", empty_completion: "빈 응답이 왔어요. 한 번 더 시도해 주세요.",
        network: (e && e.message) || "" };
      return m[c] || (e && e.message) || "알 수 없는 오류가 났어요.";
    }

    function blobToBase64(blob) {
      return new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(String(fr.result).split(",")[1] || "");
        fr.onerror = () => rej(new Error("이미지를 변환하지 못했습니다."));
        fr.readAsDataURL(blob);
      });
    }
    async function imageParts(images, oa) {
      const out = [];
      for (const im of images || []) {
        let mt = "image/jpeg", data = "";
        if (im instanceof Blob) { mt = im.type || mt; data = await blobToBase64(im); }
        else if (im && im.data) { mt = im.mediaType || im.media_type || mt; data = im.data; }
        else continue;
        out.push(oa ? { type: "image_url", image_url: { url: "data:" + mt + ";base64," + data } }
                    : { type: "image", source: { type: "base64", media_type: mt, data } });
      }
      return out;
    }

    // ---- SSE 읽기 (두 회사 모두) ----
    async function readSse(res, onLine, signal) {
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        if (signal && signal.aborted) { try { reader.cancel(); } catch (e) {} throw err("cancelled", "중단됨"); }
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, i).replace(/\r$/, "");
          buf = buf.slice(i + 1);
          if (line) onLine(line);
        }
      }
      if (buf.trim()) onLine(buf.trim());
    }
    async function readAnthropic(res, onText, signal) {
      let text = "", stop = null, evName = "", usage = { input: 0, output: 0, cached: 0 };
      await readSse(res, (line) => {
        if (line.startsWith("event:")) { evName = line.slice(6).trim(); return; }
        if (!line.startsWith("data:")) return;
        let ev; try { ev = JSON.parse(line.slice(5).trim()); } catch (e) { return; }
        const t = ev.type || evName;
        if (t === "content_block_delta" && ev.delta && ev.delta.type === "text_delta") {
          text += ev.delta.text || "";
          if (onText) onText({ text, delta: ev.delta.text || "" });
        } else if (t === "message_start" && ev.message && ev.message.usage) {
          usage.input = ev.message.usage.input_tokens || 0; usage.cached = ev.message.usage.cache_read_input_tokens || 0;
        } else if (t === "message_delta" && ev.delta) {
          if (ev.delta.stop_reason) stop = ev.delta.stop_reason;
          if (ev.usage && ev.usage.output_tokens) usage.output = ev.usage.output_tokens;
        } else if (t === "error") { const er = ev.error || {}; throw err(er.type || "stream_error", er.message || "스트림 오류"); }
      }, signal);
      return { text, stop, usage };
    }
    async function readOpenai(res, onText, signal) {
      let text = "", stop = null, usage = { input: 0, output: 0, cached: 0 };
      await readSse(res, (line) => {
        if (!line.startsWith("data:")) return;
        const raw = line.slice(5).trim();
        if (raw === "[DONE]") return;
        let ev; try { ev = JSON.parse(raw); } catch (e) { return; }
        if (ev.usage) { usage.input = ev.usage.prompt_tokens || usage.input; usage.output = ev.usage.completion_tokens || usage.output; }
        const ch = ev.choices && ev.choices[0];
        if (!ch) { if (ev.error) throw err("stream_error", ev.error.message || "스트림 오류"); return; }
        const d = ch.delta && ch.delta.content;
        if (d) { text += d; if (onText) onText({ text, delta: d }); }
        if (ch.finish_reason) stop = ch.finish_reason === "length" ? "max_tokens" : ch.finish_reason;
      }, signal);
      return { text, stop, usage };
    }

    // ---- 호출 ----
    // call(prompt, { system, cacheSystem, images, tier, effort, light, onText, signal }) → { text, truncated, usage }
    //   light: 대량 추출 단계 — Anthropic 이면 Sonnet 5 로 돌려 비용을 아낀다 (설정으로 끌 수 있다)
    const totals = { input: 0, output: 0, cached: 0, calls: 0 };
    let lightOn = true;
    function setLight(v) { lightOn = !!v; }
    function modelFor(opts) {
      if (opts.model) return opts.model;
      if (opts.light && lightOn && provider() !== "openai") return "claude-sonnet-5";
      return provider() === "openai" ? oaModel() : anModelId();
    }
    async function call(prompt, opts) {
      opts = opts || {};
      const key = currentKey();
      if (!key) throw err("no_key", "API 키가 없습니다.");
      const oa = provider() === "openai";
      const tier = MAX_TOKENS[opts.tier] ? opts.tier : "complex";
      const model = modelFor(opts);
      const imgs = await imageParts(opts.images, oa);
      const send = async (url, headers, body) => {
        try { return await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: opts.signal }); }
        catch (e) {
          if (e && e.name === "AbortError") throw err("cancelled", "중단됨");
          throw err("network", netMsg(oa ? "api.openai.com" : "api.anthropic.com"));
        }
      };
      let res, r;
      if (oa) {
        const content = imgs.concat([{ type: "text", text: prompt }]);
        const messages = (opts.system ? [{ role: "system", content: opts.system }] : []).concat([{ role: "user", content }]);
        const headers = { "content-type": "application/json", authorization: "Bearer " + key };
        const mk = (field) => { const b = { model, messages, stream: true, stream_options: { include_usage: true } }; b[field] = MAX_TOKENS[tier]; return b; };
        res = await send(OA_URL, headers, mk(oaMaxField));
        if (res.status === 400) {
          const txt = await res.text();
          if (/max_tokens|max_completion_tokens/i.test(txt)) {
            oaMaxField = oaMaxField === "max_tokens" ? "max_completion_tokens" : "max_tokens";
            res = await send(OA_URL, headers, mk(oaMaxField));
            if (!res.ok) throw httpErr(res.status, await res.text(), true);
          } else throw httpErr(400, txt, true);
        } else if (!res.ok) throw httpErr(res.status, await res.text(), true);
        r = await readOpenai(res, opts.onText, opts.signal);
      } else {
        const body = { model, max_tokens: MAX_TOKENS[tier], stream: true, thinking: { type: "adaptive" },
                       messages: [{ role: "user", content: imgs.concat([{ type: "text", text: prompt }]) }] };
        if (opts.effort) body.output_config = { effort: opts.effort };
        if (opts.system) body.system = opts.cacheSystem ? [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }] : opts.system;
        const headers = { "content-type": "application/json", "x-api-key": key,
                          "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" };
        const fbBody = Object.assign({}, body, { fallbacks: "default" });
        const fbHeaders = Object.assign({}, headers, { "anthropic-beta": "server-side-fallback-2026-07-01" });
        res = fallbackOk ? await send(AN_URL, fbHeaders, fbBody) : await send(AN_URL, headers, body);
        if (res.status === 400 && fallbackOk) {
          const txt = await res.text();
          if (/fallback|anthropic-beta|beta/i.test(txt)) { fallbackOk = false; res = await send(AN_URL, headers, body); }
          else throw httpErr(400, txt);
        }
        if (!res.ok) throw httpErr(res.status, await res.text());
        r = await readAnthropic(res, opts.onText, opts.signal);
        if (r.stop === "refusal") throw err("refused", "거절");
      }
      if (r.usage) { totals.input += r.usage.input; totals.output += r.usage.output; totals.cached += r.usage.cached; totals.calls++; }
      if (!r.text.trim()) throw err("empty_completion", "빈 응답");
      return { text: r.text, truncated: r.stop === "max_tokens", usage: r.usage, model };
    }
    // 느슨한 JSON 해석 — 코드펜스·앞뒤 설명을 벗겨 내고 첫 [ 또는 { 부터 마지막 짝까지
    function parseLoose(raw, wantArray) {
      let s = String(raw || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const open = wantArray ? "[" : "{", close = wantArray ? "]" : "}";
      const a = s.indexOf(open), b = s.lastIndexOf(close);
      if (a === -1) throw err("invalid_json", "JSON 아님");
      let body = b > a ? s.slice(a, b + 1) : s.slice(a);        // 닫는 괄호가 없으면(잘림) 끝까지 두고 아래에서 살린다
      try { return JSON.parse(body); } catch (e) {}
      // 흔한 손상: 끝의 쉼표, 스마트 따옴표
      body = body.replace(/,\s*([\]}])/g, "$1").replace(/[“”]/g, '"');
      try { return JSON.parse(body); } catch (e) {}
      // 잘린 출력: 마지막으로 온전한 항목까지만 살린다 (배열 항목 경계 "}," 에서 잘라 닫는다)
      const salvaged = salvage(body, wantArray);
      if (salvaged) return salvaged;
      throw err("invalid_json", "JSON 해석 실패");
    }
    function salvage(body, wantArray) {
      let cut = body.length;
      for (let i = 0; i < 60; i++) {
        cut = body.lastIndexOf("}", cut - 1);
        if (cut < 0) return null;
        const head = body.slice(0, cut + 1);
        // 열린 괄호를 세어 닫아 준다
        let depthA = 0, depthO = 0, inStr = false, escp = false;
        for (const ch of head) { if (inStr) { if (escp) escp = false; else if (ch === "\\") escp = true; else if (ch === '"') inStr = false; continue; } if (ch === '"') inStr = true; else if (ch === "[") depthA++; else if (ch === "]") depthA--; else if (ch === "{") depthO++; else if (ch === "}") depthO--; }
        if (inStr || depthA < 0 || depthO < 0) continue;
        let tail = "";
        // 닫는 순서는 열린 순서의 역순이어야 하지만, 여기서는 배열/객체가 번갈아 중첩된 흔한 꼴만 다룬다
        const stack = []; inStr = false; escp = false;
        for (const ch of head) { if (inStr) { if (escp) escp = false; else if (ch === "\\") escp = true; else if (ch === '"') inStr = false; continue; } if (ch === '"') inStr = true; else if (ch === "[" || ch === "{") stack.push(ch); else if (ch === "]" || ch === "}") stack.pop(); }
        while (stack.length) tail += stack.pop() === "[" ? "]" : "}";
        try { const v = JSON.parse(head + tail); if (wantArray ? Array.isArray(v) : (v && typeof v === "object")) return v; } catch (e) {}
      }
      return null;
    }
    // json(prompt, opts) — 잘못된 JSON 이 오면 한 번 더 요청한다 (두 번째는 더 엄한 꼬리말)
    async function json(prompt, opts) {
      opts = opts || {};
      let last;
      for (let attempt = 0; attempt < (opts.retries === undefined ? 2 : opts.retries + 1); attempt++) {
        const p = attempt === 0 ? prompt : prompt + "\n\n[중요] 바로 앞 응답이 올바른 JSON 이 아니었습니다. 설명 없이 JSON 만, 코드펜스 없이 출력하세요.";
        const r = await call(p, opts);
        try {
          const v = parseLoose(r.text, !!opts.array);
          if (opts.validate) { const why = opts.validate(v); if (why) throw err("invalid_json", why); }
          return v;
        } catch (e) {
          if (e.code !== "invalid_json") throw e;
          last = e;
          if (opts.signal && opts.signal.aborted) throw err("cancelled", "중단됨");
        }
      }
      throw last || err("invalid_json", "JSON 해석 실패");
    }
    // 키와 연결을 실제로 확인한다 — 가장 작은 요청 하나로 끝낸다.
    async function probe() {
      const key = currentKey();
      if (!key) return { ok: false, msg: "키를 먼저 저장해 주세요." };
      const oa = provider() === "openai";
      let res;
      try {
        res = oa
          ? await fetch(OA_URL, { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + key },
              body: JSON.stringify({ model: oaModel(), messages: [{ role: "user", content: "hi" }], max_completion_tokens: 16 }) })
          : await fetch(AN_URL, { method: "POST", headers: { "content-type": "application/json", "x-api-key": key,
              "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
              body: JSON.stringify({ model: anModelId(), max_tokens: 1, messages: [{ role: "user", content: "hi" }] }) });
      } catch (e) { return { ok: false, msg: netMsg(oa ? "api.openai.com" : "api.anthropic.com") }; }
      if (res.ok) return { ok: true, msg: "연결됐어요 — " + modelLabel() + " 로 바로 쓸 수 있어요." };
      let body = await res.text();
      if (oa && res.status === 400 && /max_tokens|max_completion_tokens/i.test(body)) {
        oaMaxField = "max_tokens";
        try {
          res = await fetch(OA_URL, { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + key },
            body: JSON.stringify({ model: oaModel(), messages: [{ role: "user", content: "hi" }], max_tokens: 16 }) });
        } catch (e) { return { ok: false, msg: netMsg("api.openai.com") }; }
        if (res.ok) return { ok: true, msg: "연결됐어요 — " + oaModel() + " 로 바로 쓸 수 있어요." };
        body = await res.text();
      }
      return { ok: false, msg: friendly(httpErr(res.status, body, oa)) };
    }
    async function listOaModels() {
      const key = readKey(K.oa);
      if (!key) return [];
      try {
        const res = await fetch(OA_MODELS_URL, { headers: { authorization: "Bearer " + key } });
        if (!res.ok) return [];
        const j = await res.json();
        return (j.data || []).map(m => m.id).filter(id => /^(gpt|o[0-9])/.test(id)).sort();
      } catch (e) { return []; }
    }
    return { provider, setProvider, providerName, keepMode, setKeepMode, anModelKey, anModelId, setAnModel, AN_MODELS, AN_LABELS,
             oaModel, setOaModel, OA_PRESETS, currentKey, setCurrentKey, keyLooksRight, ready, modelLabel, setLight, totals,
             call, json, parseLoose, probe, listOaModels, friendly, err, blobToBase64 };
  })();
