  // ==================================================================
  //  EXTRACT — 파일 → 텍스트. PDF(pdf.js) · DOCX · HWP 5.0 · HWPX · XLSX · TXT.
  //  글자가 없는 PDF(스캔본)는 쪽을 그림으로 만들어 모델이 옮겨 적는다(OCR).
  //  동형 모의고사 생성기의 추출기를 그대로 옮겨 왔다.
  // ==================================================================
  const EXTRACT = (function () {
    const PDF_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    function pdfWorkerReady() {
      try { return !!(globalThis.pdfjsWorker && globalThis.pdfjsWorker.WorkerMessageHandler); } catch (e) { return false; }
    }
    function withTimeout(promise, ms, msg) {
      let timer;
      const guard = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(msg)), ms); });
      return Promise.race([promise, guard]).finally(() => clearTimeout(timer));
    }
    function readAsBuffer(file) {
      return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = () => rej(new Error(file.name + " 파일을 읽지 못했습니다."));
        r.readAsArrayBuffer(file);
      });
    }
    function extOf(name) { const m = /\.([a-z0-9]+)$/i.exec(name || ""); return m ? m[1].toLowerCase() : ""; }
    function decodeEntities(s) {
      return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
              .replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&amp;/g, "&");
    }
    function xmlToText(xml, paraCloseTags) {
      let s = xml;
      paraCloseTags.forEach(t => { s = s.split(t).join("\n"); });
      s = s.replace(/<[^>]+>/g, "");
      return decodeEntities(s);
    }
    function tidy(s) { return String(s || "").replace(/ /g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim(); }

    async function openPdf(buf) {
      if (typeof pdfjsLib === "undefined") throw new Error("PDF 처리 라이브러리를 불러오지 못했습니다. 페이지를 새로 고친 뒤 다시 시도해 주세요.");
      if (!pdfWorkerReady()) pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER;
      try {
        return await withTimeout(pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise, 90000,
          "PDF를 여는 데 시간이 너무 오래 걸립니다. 페이지를 새로 고친 뒤 다시 올려주세요.");
      } catch (e) {
        const raw = (e && e.message) || "";
        if (/fake worker|Cannot load script|Worker was destroyed/i.test(raw)) throw new Error("PDF 처리 모듈을 불러오지 못했습니다. 페이지를 새로 고친 뒤 다시 올려주세요.");
        if (/password/i.test(raw)) throw new Error("암호가 걸린 PDF입니다. 암호를 푼 파일로 올려주세요.");
        if (/Invalid PDF|structure/i.test(raw)) throw new Error("PDF 파일이 손상되었거나 형식이 올바르지 않습니다.");
        throw e;
      }
    }
    async function pdfText(buf) {
      const doc = await openPdf(buf);
      let out = "";
      for (let p = 1; p <= doc.numPages; p++) {
        const page = await doc.getPage(p);
        const tc = await page.getTextContent();
        const lines = [];
        let line = "", lastY = null, lastEnd = null;
        for (const it of tc.items) {
          if (typeof it.str !== "string") continue;
          const y = Math.round(it.transform[5]), x = it.transform[4];
          if (lastY !== null && Math.abs(y - lastY) > 3) { lines.push(line); line = ""; lastEnd = null; }
          if (line && lastEnd !== null && x - lastEnd > 1.5 && !line.endsWith(" ") && !it.str.startsWith(" ")) line += " ";
          line += it.str;
          lastY = y; lastEnd = x + (it.width || 0);
          if (it.hasEOL) { lines.push(line); line = ""; lastEnd = null; }
        }
        if (line) lines.push(line);
        out += "[p." + p + "]\n" + lines.join("\n") + "\n\n";
      }
      const pages = doc.numPages;
      if (doc.cleanup) try { doc.cleanup(); } catch (e) {}
      return { text: tidy(out), pages };
    }
    // 글자가 거의 없거나 깨진 PDF — 스캔본이거나 글꼴 정보가 빠진 파일
    function looksUnreadable(text) {
      const t = String(text || "").replace(/\[p\.\d+\]/g, "");
      const solid = t.replace(/\s/g, "");
      if (solid.length < 200) return true;
      const letters = (t.match(/[A-Za-z가-힣]/g) || []).length;
      if (letters / solid.length < 0.45) return true;
      if ((t.match(/�/g) || []).length > solid.length / 200) return true;
      return false;
    }
    async function docx(buf) {
      if (typeof JSZip === "undefined") throw new Error("문서 처리 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.");
      const zip = await JSZip.loadAsync(buf);
      const doc = zip.file("word/document.xml");
      if (!doc) throw new Error("Word 문서 형식이 올바르지 않습니다.");
      let xml = await doc.async("string");
      xml = xml.replace(/<w:tab[^>]*\/>/g, "\t").replace(/<w:br[^>]*\/>/g, "\n");
      return tidy(xmlToText(xml, ["</w:p>"]));
    }
    async function hwpx(buf) {
      if (typeof JSZip === "undefined") throw new Error("문서 처리 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.");
      const zip = await JSZip.loadAsync(buf);
      const names = Object.keys(zip.files).filter(n => /^Contents\/section\d+\.xml$/i.test(n))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      if (!names.length) throw new Error("HWPX 문서 형식이 올바르지 않습니다.");
      let out = "";
      for (const n of names) out += xmlToText(await zip.file(n).async("string"), ["</hp:p>", "</p>"]) + "\n";
      return tidy(out);
    }
    function sheet(buf) {
      if (typeof XLSX === "undefined") throw new Error("엑셀 처리 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.");
      const wb = XLSX.read(new Uint8Array(buf), { type: "array", codepage: 949 });
      let out = "";
      wb.SheetNames.forEach(name => { const csv = XLSX.utils.sheet_to_csv(wb.Sheets[name]); if (csv.trim()) out += "[시트: " + name + "]\n" + csv + "\n\n"; });
      return tidy(out);
    }
    function hwp(buf) {
      if (typeof XLSX === "undefined" || typeof pako === "undefined") throw new Error("HWP 처리 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.");
      let cfb;
      try { cfb = XLSX.CFB.read(new Uint8Array(buf), { type: "buffer" }); }
      catch (_) { throw new Error("HWP 5.0 형식이 아닙니다. (구버전 HWP는 한글에서 '다른 이름으로 저장'으로 변환해 주세요)"); }
      const header = XLSX.CFB.find(cfb, "FileHeader");
      if (!header) throw new Error("HWP 파일 헤더를 찾지 못했습니다.");
      const hb = new Uint8Array(header.content);
      const flags = hb[36] | (hb[37] << 8) | (hb[38] << 16) | (hb[39] << 24);
      const compressed = (flags & 1) === 1;
      if ((flags & 2) === 2) throw new Error("암호가 걸린 HWP 파일은 지원하지 않습니다. 암호를 해제 후 올려주세요.");
      const sections = (cfb.FullPaths || []).map((p, i) => ({ p, i })).filter(e => /BodyText\/Section\d+$/i.test(e.p))
        .sort((a, b) => a.p.localeCompare(b.p, undefined, { numeric: true }));
      if (!sections.length) throw new Error("HWP 본문 섹션을 찾지 못했습니다.");
      let out = "";
      for (const sec of sections) {
        let data = new Uint8Array(cfb.FileIndex[sec.i].content);
        if (compressed) { try { data = pako.inflateRaw(data); } catch (_) { try { data = pako.inflate(data); } catch (__) { continue; } } }
        out += hwpRecords(data);
      }
      return tidy(out);
    }
    function hwpRecords(data) {
      const PARA_TEXT = 67;
      let pos = 0, out = "";
      const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
      while (pos + 4 <= data.length) {
        const hdr = dv.getUint32(pos, true); pos += 4;
        const tag = hdr & 0x3ff;
        let size = (hdr >>> 20) & 0xfff;
        if (size === 0xfff) { if (pos + 4 > data.length) break; size = dv.getUint32(pos, true); pos += 4; }
        if (pos + size > data.length) break;
        if (tag === PARA_TEXT) {
          let i = pos; const end = pos + size;
          while (i + 1 < end) {
            const code = dv.getUint16(i, true);
            if (code >= 32) { out += String.fromCharCode(code); i += 2; }
            else if (code === 13 || code === 10) { out += "\n"; i += 2; }
            else if (code === 9) { out += "\t"; i += 16; }
            else if (code === 0 || (code >= 24 && code <= 31)) { i += 2; }
            else { i += 16; }
          }
          out += "\n";
        }
        pos += size;
      }
      return out;
    }
    function docLegacy(buf) {
      if (typeof XLSX === "undefined") throw new Error("문서 처리 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.");
      let cfb;
      try { cfb = XLSX.CFB.read(new Uint8Array(buf), { type: "buffer" }); }
      catch (_) { throw new Error(".doc 형식을 해석하지 못했습니다. Word에서 .docx로 저장 후 올려주세요."); }
      const wd = XLSX.CFB.find(cfb, "WordDocument");
      if (!wd) throw new Error(".doc 본문 스트림을 찾지 못했습니다. .docx로 변환해 올려주세요.");
      const b = new Uint8Array(wd.content);
      const ok = (c) => c === 9 || c === 10 || c === 13 || (c >= 32 && c <= 126) || (c >= 0xac00 && c <= 0xd7a3) || (c >= 0x3130 && c <= 0x318f) ||
        (c >= 0x4e00 && c <= 0x9fff) || (c >= 0x2010 && c <= 0x2027) || c === 0xb7 || (c >= 0xc0 && c <= 0x17f);
      let out = "", run = "";
      for (let i = 0; i + 1 < b.length; i += 2) {
        const c = b[i] | (b[i + 1] << 8);
        if (ok(c)) run += (c === 13 ? "\n" : String.fromCharCode(c));
        else { if (run.replace(/\s/g, "").length >= 8) out += run + "\n"; run = ""; }
      }
      if (run.replace(/\s/g, "").length >= 8) out += run;
      const text = tidy(out);
      if (text.length < 40) throw new Error(".doc에서 텍스트를 충분히 추출하지 못했습니다. Word에서 .docx로 저장 후 올려주세요.");
      return text;
    }
    async function plain(file) {
      const buf = await readAsBuffer(file);
      let text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
      if ((text.match(/�/g) || []).length > text.length / 100) { try { text = new TextDecoder("euc-kr").decode(buf); } catch (_) {} }
      return tidy(text);
    }

    // ---- 스캔본: 쪽을 그림으로 그려 모델에게 옮겨 적게 한다 ----
    const OCR_MAX_PAGES = 40, OCR_SCALE_TARGET = 1700, OCR_MAX_PX = 9e6, OCR_PAGE_MS = 60000, OCR_PER_CALL = 4;
    const OCR_RULES =
      "너는 시험지 스캔 이미지를 글자로 옮기는 일을 한다.\n규칙:\n" +
      "1. 보이는 내용을 빠짐없이, 보이는 순서대로 그대로 옮겨 적는다.\n" +
      "2. 문항 번호, 배점 표기([3점] 등), 선택지 기호(①②③④⑤)를 원문 그대로 유지한다.\n" +
      "3. 영어 지문은 철자를 그대로 옮긴다. 요약하거나 고쳐 쓰지 않는다.\n" +
      "4. 밑줄·굵게 등 표시가 있는 부분은 그 자리에 <u>...</u> 로 표시한다.\n" +
      "5. 표는 각 행을 한 줄로, 칸은 | 로 나눠 적는다.\n" +
      "6. 읽을 수 없는 글자는 [?] 로 둔다. 추측해서 지어내지 않는다.\n" +
      "7. 설명이나 인사말 없이 옮겨 적은 내용만 출력한다.";
    async function renderPage(doc, pageNo, target) {
      const page = await doc.getPage(pageNo);
      const base = page.getViewport({ scale: 1 });
      let scale = Math.min(3, Math.max(1, (target || OCR_SCALE_TARGET) / base.width));
      const px = base.width * base.height * scale * scale;
      if (px > OCR_MAX_PX) scale *= Math.sqrt(OCR_MAX_PX / px);
      const vp = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(vp.width); canvas.height = Math.round(vp.height);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.88));
      canvas.width = canvas.height = 0;
      return blob;
    }
    // ocrPdf(buf, { onStep({phase, page, total, chars}), signal }) → { text, pages, truncated }
    async function ocrPdf(buf, o) {
      o = o || {};
      if (!API.ready()) throw new Error("API 키를 저장해야 스캔본을 읽을 수 있어요. 설정에서 키를 넣어 주세요.");
      const doc = await openPdf(buf);
      const total = Math.min(doc.numPages, OCR_MAX_PAGES);
      const out = [];
      const step = (x) => { if (o.onStep) o.onStep(Object.assign({ total }, x)); };
      for (let start = 1; start <= total; start += OCR_PER_CALL) {
        if (o.signal && o.signal.aborted) throw API.err("cancelled", "중단됨");
        const nos = []; for (let n = start; n < start + OCR_PER_CALL && n <= total; n++) nos.push(n);
        const blobs = [];
        for (const n of nos) {
          step({ phase: "render", page: n });
          let img = null;
          try { img = await withTimeout(renderPage(doc, n), OCR_PAGE_MS, "__slow__"); }
          catch (e) {
            if (e.message !== "__slow__") throw e;
            img = await withTimeout(renderPage(doc, n, 1100), OCR_PAGE_MS, n + "쪽이 너무 무거워 그림으로 만들지 못했어요. 스캔을 200~300dpi로 다시 저장해 주세요.");
          }
          if (!img) throw new Error(n + "쪽 이미지를 만들지 못했어요.");
          blobs.push(img);
        }
        const a = nos[0], z = nos[nos.length - 1];
        step({ phase: "read", page: a, to: z });
        const r = await API.call(OCR_RULES + "\n\n첨부한 그림은 시험지 " + (a === z ? a + "쪽" : a + "~" + z + "쪽") + "이다(순서대로). " +
          "각 쪽의 시작에 [p.쪽번호] 를 한 줄로 넣고 이어서 옮겨 적어라. 이 묶음의 첫 쪽 번호는 " + a + " 이다.",
          { images: blobs, tier: "default", signal: o.signal, onText: ({ text }) => step({ phase: "read", page: a, to: z, chars: text.length }) });
        out.push(String(r.text || "").trim());
      }
      if (doc.cleanup) try { doc.cleanup(); } catch (e) {}
      const joined = tidy(out.join("\n\n"));
      if (joined.replace(/\s/g, "").length < 80) throw new Error("스캔본에서 글자를 읽어내지 못했어요. 사진이 흐리거나 기울어져 있지 않은지 확인해 주세요.");
      return { text: joined, pages: total, truncated: doc.numPages > total };
    }

    // 파일 하나 → { text, note, ocr, pages }. 글자 없는 PDF 는 자동으로 스캔본 읽기로 넘어간다.
    async function fromFile(file, o) {
      o = o || {};
      const ext = extOf(file.name);
      if (file.size > 100 * 1024 * 1024) throw new Error("100MB 를 넘는 파일은 올릴 수 없어요.");
      if (ext === "pdf") {
        const buf = await readAsBuffer(file);
        const copy = buf.slice(0);                      // pdf.js 가 버퍼를 가져가므로 스캔본용 사본을 둔다
        if (!o.forceOcr) {
          const r = await pdfText(buf);
          if (!looksUnreadable(r.text)) return { text: r.text, note: "", ocr: false, pages: r.pages };
          if (!API.ready()) throw new Error("글자가 없는(스캔) PDF 예요. API 키를 저장하면 그림으로 읽어 드려요.");
        }
        const s = await ocrPdf(copy, o);
        return { text: s.text, note: "스캔본 · " + s.pages + "쪽을 그림으로 읽었어요" + (s.truncated ? " (앞 " + OCR_MAX_PAGES + "쪽만)" : ""), ocr: true, pages: s.pages };
      }
      if (ext === "docx") return { text: await docx(await readAsBuffer(file)), note: "", ocr: false };
      if (ext === "doc") return { text: docLegacy(await readAsBuffer(file)), note: "구버전 .doc — 추출 품질 제한", ocr: false };
      if (ext === "xlsx" || ext === "xls") return { text: sheet(await readAsBuffer(file)), note: "", ocr: false };
      if (ext === "hwp") return { text: hwp(await readAsBuffer(file)), note: "", ocr: false };
      if (ext === "hwpx") return { text: await hwpx(await readAsBuffer(file)), note: "", ocr: false };
      if (ext === "csv" || ext === "txt" || ext === "md") return { text: await plain(file), note: "", ocr: false };
      if (/^(jpg|jpeg|png|webp)$/.test(ext)) {
        if (!API.ready()) throw new Error("사진은 API 키를 저장해야 읽을 수 있어요.");
        const r = await API.call(OCR_RULES + "\n\n첨부한 그림은 시험지 사진이다. 그대로 옮겨 적어라.", { images: [file], tier: "default", signal: o.signal });
        return { text: tidy(r.text), note: "사진을 그림으로 읽었어요", ocr: true, pages: 1 };
      }
      throw new Error("지원하지 않는 형식이에요: ." + (ext || "?") + " (PDF · 한글 · 워드 · 텍스트 · 사진)");
    }
    const ACCEPT = ".pdf,.hwp,.hwpx,.docx,.doc,.txt,.md,.csv,.xlsx,.xls,.jpg,.jpeg,.png,.webp";
    return { fromFile, extOf, tidy, looksUnreadable, ACCEPT, readAsBuffer, withTimeout };
  })();
