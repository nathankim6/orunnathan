import sys, pymupdf
A="/root/.claude/uploads/fb3c6112-8157-579c-a0b3-ba399ff1355a/14ecc274-1111111____1.pdf"
B="/root/.claude/uploads/fb3c6112-8157-579c-a0b3-ba399ff1355a/583dd3f8-22222222222222___.pdf"
def pageof(T):
    N=(T-1)//5+1; M=T-(N-1)*5
    if T<=39: return A, 6+(N-1)*12+(M-1)*2
    if T==40: return B, 1
    return B, 5+(N-9)*12+(M-1)*2
def render(T, dpi=200, crop=None, out=None):
    f,p = pageof(T)
    d=pymupdf.open(f); pg=d[p-1]
    r=pg.rect
    clip=None
    if crop:
        x0,y0,x1,y1=crop
        clip=pymupdf.Rect(r.x0+r.width*x0, r.y0+r.height*y0, r.x0+r.width*x1, r.y0+r.height*y1)
    pix=pg.get_pixmap(dpi=dpi, clip=clip)
    out=out or f"src/pg/t{T:02d}.png"
    pix.save(out); print(out, pix.width, pix.height, "pdfpage", p)
if __name__=="__main__":
    T=int(sys.argv[1]); dpi=int(sys.argv[2]) if len(sys.argv)>2 else 200
    crop=[float(x) for x in sys.argv[3].split(",")] if len(sys.argv)>3 else None
    out=sys.argv[4] if len(sys.argv)>4 else None
    render(T,dpi,crop,out)

def render_ex(T, dpi=160, crop=(0.03,0.03,0.99,0.55)):
    f,p = pageof(T)
    render_at(f, p+1, dpi, crop, f"src/pg/e{T:02d}.png")

def render_at(f, p, dpi, crop, out):
    d=pymupdf.open(f); pg=d[p-1]; r=pg.rect
    x0,y0,x1,y1=crop
    clip=pymupdf.Rect(r.x0+r.width*x0, r.y0+r.height*y0, r.x0+r.width*x1, r.y0+r.height*y1)
    pix=pg.get_pixmap(dpi=dpi, clip=clip); pix.save(out); print(out, pix.width, pix.height, "pdfpage", p)
