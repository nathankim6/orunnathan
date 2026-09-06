import pymupdf, sys
d = pymupdf.open(sys.argv[1])
for pg in [int(x) for x in sys.argv[2].split(',')]:
    print(f'===== page {pg} =====')
    for b in d[pg-1].get_text('dict')['blocks']:
        for l in b.get('lines', []):
            t = ''.join(s['text'] for s in l['spans']).strip()
            if not t: continue
            x0, y0, x1, y1 = l['bbox']
            print(f'{x0:6.1f} {y0:6.1f} {x1:6.1f} | {t[:88]}')
