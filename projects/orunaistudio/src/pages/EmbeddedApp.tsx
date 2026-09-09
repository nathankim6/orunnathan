import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * public/ 에 올려 둔 "한 파일짜리 HTML 앱"을 내려받기가 아니라 화면에 띄운다.
 *
 * 왜 이런 껍데기가 필요한가
 * -------------------------
 * Lovable 은 public 폴더의 .html 을 페이지가 아니라 첨부 파일로 내보낸다.
 * 응답 헤더가 content-disposition: attachment 라서 주소창으로 열면 브라우저가
 * 화면에 그리지 않고 내려받기를 시작한다. iframe 으로 감싸도 결과는 같다 —
 * 첨부 파일은 어디서 열든 내려받기가 된다.
 *
 * 그래서 순서를 뒤집는다. 파일을 자바스크립트로 먼저 받아 오고(fetch 는
 * content-disposition 을 보지 않는다), 받아 온 내용을 blob 주소로 만들어
 * iframe 에 띄운다. blob 주소는 이 사이트와 같은 출신(origin)이라 안에서
 * 도는 스크립트 · WebGL · localStorage 가 전부 그대로 작동한다.
 *
 * 동기화
 * ------
 * 원본 경로는 언제나 no-store 로 다시 물어본다. 파일을 새로 올리면 안내
 * 페이지가 가리키는 주소가 바뀌는데 캐시를 쓰지 않으므로, 새로 고치는 순간
 * 바뀐 내용이 그대로 뜬다. 이 화면을 다시 배포할 필요가 없다.
 */

/** 안내 페이지는 몇 KB 밖에 안 된다. 이보다 크면 그게 이미 본문이다. */
const STUB_LIMIT = 256 * 1024;

/** 안내 페이지가 담고 있는 "진짜 파일 주소" */
const REFRESH_RE =
  /<meta[^>]+http-equiv\s*=\s*["']?refresh["']?[^>]*content\s*=\s*["'][^"']*url\s*=\s*([^"'\s>]+)/i;

/** patch 의 바꿀 글자 안에서 이 자리에 이 페이지의 진짜 주소가 들어간다. */
const PAGE_URL_TOKEN = '%PAGE_URL%';

export interface EmbeddedAppProps {
  /** public 폴더 기준 경로 — 예: '/orun-universe.html' */
  src: string;
  /** 불러오는 동안 크게 보여 줄 이름 */
  title: string;
  /** 이름 아래 한 줄 설명 */
  subtitle?: string;
  /** 불러오는 동안 뒤에 깔 그림 */
  poster?: string;
  /**
   * 원본 HTML 안의 글자를 그대로 바꿔 넣는다.
   *
   * blob 주소에서는 location.pathname 이 blob 식별자라, 원본이 그것으로
   * 공유 링크를 만들면 학생에게 쓸 수 없는 주소가 나간다. 그런 자리를
   * %PAGE_URL% 을 써서 이 페이지의 진짜 주소로 바꿔 준다.
   *
   * 렌더마다 새 배열을 만들면 계속 다시 불러오니 파일 바깥의 상수로 둔다.
   */
  patch?: Array<[string, string]>;
}

type Status = 'loading' | 'ready' | 'error';

const withBuster = (path: string): string =>
  `${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`;

/** 안내 페이지를 지나 진짜 파일 응답까지 도달한다. */
const resolvePayload = async (src: string, signal: AbortSignal): Promise<Response> => {
  const first = await fetch(withBuster(src), { cache: 'no-store', signal });
  if (!first.ok) throw new Error(`${first.status} ${first.statusText}`.trim());

  const size = Number(first.headers.get('content-length') ?? 0);
  if (size > STUB_LIMIT) return first; // 안내 페이지가 아니라 본문이다.

  const head = await first.text();
  const found = REFRESH_RE.exec(head);
  if (!found) return new Response(head, { headers: { 'content-type': 'text/html' } });

  const target = new URL(found[1], window.location.href).toString();
  const real = await fetch(target, { cache: 'no-store', signal });
  if (!real.ok) throw new Error(`${real.status} ${real.statusText}`.trim());
  return real;
};

/** 받는 동안 얼마나 왔는지 알려 주면서 조각들을 모은다. */
const readWithProgress = async (
  res: Response,
  onProgress: (loaded: number, total: number) => void,
): Promise<Uint8Array[]> => {
  const total = Number(res.headers.get('content-length') ?? 0);
  const reader = res.body?.getReader();

  if (!reader) {
    const whole = new Uint8Array(await res.arrayBuffer());
    onProgress(whole.byteLength, whole.byteLength);
    return [whole];
  }

  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    chunks.push(value);
    loaded += value.byteLength;
    onProgress(loaded, total);
  }
  return chunks;
};

/**
 * 조각들을 blob 하나로 묶는다.
 * 고칠 글자가 없으면 바이트 그대로 묶어 메모리를 아끼고,
 * 고칠 게 있을 때만 문자열로 푼다.
 */
const toBlob = (chunks: Uint8Array[], patch?: Array<[string, string]>): Blob => {
  const type = 'text/html;charset=utf-8';
  if (!patch || patch.length === 0) return new Blob(chunks as BlobPart[], { type });

  const decoder = new TextDecoder('utf-8');
  let html = '';
  chunks.forEach((chunk, i) => {
    html += decoder.decode(chunk, { stream: i < chunks.length - 1 });
  });

  const pageUrl = `${window.location.origin}${window.location.pathname}`;
  patch.forEach(([from, to]) => {
    html = html.split(from).join(to.split(PAGE_URL_TOKEN).join(pageUrl));
  });
  return new Blob([html], { type });
};

const asMb = (bytes: number): string => (bytes / 1024 / 1024).toFixed(1);

const EmbeddedApp = ({ src, title, subtitle, poster, patch }: EmbeddedAppProps) => {
  const [status, setStatus] = useState<Status>('loading');
  const [frameUrl, setFrameUrl] = useState('');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const titleRef = useRef(document.title);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const previous = titleRef.current;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = '';
    let cancelled = false;

    const run = async () => {
      setStatus('loading');
      setLoaded(0);
      setTotal(0);
      setError('');
      try {
        const res = await resolvePayload(src, controller.signal);
        const chunks = await readWithProgress(res, (got, all) => {
          if (cancelled) return;
          setLoaded(got);
          setTotal(all);
        });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(toBlob(chunks, patch));
        // 원본이 #take 같은 해시로 화면을 고르므로 그대로 넘겨 준다.
        setFrameUrl(`${objectUrl}${window.location.hash}`);
        setStatus('ready');
      } catch (err) {
        if (cancelled || controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
        setStatus('error');
      }
    };

    void run();

    return () => {
      cancelled = true;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, patch, attempt]);

  const percent = total > 0 ? Math.min(99, Math.round((loaded / total) * 100)) : 0;

  return (
    <div className="embed-shell">
      {status === 'ready' && frameUrl && (
        <iframe
          className="embed-frame"
          src={frameUrl}
          title={title}
          allow="fullscreen; clipboard-write"
        />
      )}

      {status !== 'ready' && (
        <div
          className="embed-cover"
          style={poster ? { backgroundImage: `url('${poster}')` } : undefined}
        >
          <span className="corner corner-top" aria-hidden="true" />
          <span className="corner corner-bottom" aria-hidden="true" />

          <div className="embed-cover-inner">
            <p className="embed-eyebrow">
              <span />
              {status === 'error' ? 'SIGNAL LOST' : 'NOW LOADING'}
              <span />
            </p>
            <h1>{title}</h1>
            {subtitle && <p className="embed-copy">{subtitle}</p>}

            {status === 'loading' && (
              <>
                <div
                  className={`embed-rail${total > 0 ? '' : ' embed-rail-idle'}`}
                  role="progressbar"
                  aria-label={`${title} 불러오는 중`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={total > 0 ? percent : undefined}
                >
                  <span style={total > 0 ? { width: `${percent}%` } : undefined} />
                </div>
                <p className="embed-meter">
                  <b>{total > 0 ? percent : '--'}</b>%
                  <span>
                    {asMb(loaded)}
                    {total > 0 ? ` / ${asMb(total)}` : ''} MB
                  </span>
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <p className="embed-copy">화면을 불러오지 못했습니다. ({error})</p>
                <div className="embed-actions">
                  <button
                    type="button"
                    className="cinema-button cinema-button-gold"
                    onClick={retry}
                  >
                    다시 시도 <span aria-hidden="true">↻</span>
                  </button>
                  <Link className="cinema-button cinema-button-outline" to="/">
                    STUDIO 로 돌아가기
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Link className="embed-back" to="/">
        <span aria-hidden="true">←</span> STUDIO
      </Link>
    </div>
  );
};

export default EmbeddedApp;
