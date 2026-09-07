# -*- coding: utf-8 -*-
import json, re

def dq(t):
    out=[]; open_=True
    for i,c in enumerate(t):
        if c=='"':
            prev = t[i-1] if i else " "
            out.append("“" if (prev in " ([—-‘“" or i==0) else "”")
        else: out.append(c)
    return "".join(out)

def sq(t):
    out=[]; inq=False
    for i,c in enumerate(t):
        if c=="'":
            prev = t[i-1] if i else " "
            nxt  = t[i+1] if i+1<len(t) else " "
            if not inq and (i==0 or prev in " ([“—-") and (nxt.isalnum()):
                out.append("‘"); inq=True; continue
            if inq and not (prev.isalpha() and nxt.isalpha()):
                out.append("’"); inq=False; continue
        out.append(c)
    return "".join(out)

FIXWORD=[("cliche","cliché"),("Rene Magritte","Rene Magritte")]

def norm(t):
    t=dq(t); t=sq(t)
    for a,b in FIXWORD: t=t.replace(a,b)
    return t

R=json.load(open("src/orig/all.json",encoding="utf-8"))
for r in R:
    r["en"]=norm(r["en"]); r["ko"]=norm(r["ko"])
    r["sent"]=[norm(s) for s in r["sent"]]
    r["kor"]=[norm(s) for s in r["kor"]]
json.dump(R, open("src/orig/all.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
print("normalized", len(R))
