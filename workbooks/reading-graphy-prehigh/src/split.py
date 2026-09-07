# -*- coding: utf-8 -*-
import re, json, sys

ABBR = {"Mr.","Mrs.","Ms.","Dr.","Prof.","St.","Capt.","Sr.","Jr.","vs.","etc.","i.e.","e.g.",
        "U.S.","U.K.","No.","Fig.","cf.","approx.","Gen.","Col.","Rev.","Hon."}

def split_en(t):
    t = re.sub(r"\s+"," ",t.strip())
    out, buf, i, n = [], "", 0, len(t)
    while i < n:
        c = t[i]; buf += c
        if c in ".?!":
            # closing quote/paren right after
            j = i+1
            while j < n and t[j] in '"”’\')':
                buf += t[j]; j += 1
            # need a space then capital / digit / quote
            if j < n and t[j] == " ":
                nxt = t[j+1:j+2]
                last = buf.split(" ")[-1]
                single_initial = bool(re.match(r"^(?:[A-Z]\.)+$", last))
                if (last in ABBR and last != "etc.") or single_initial:
                    i = j; continue
                if nxt and (nxt.isupper() or nxt.isdigit() or nxt in '"“‘\''):
                    out.append(buf.strip()); buf = ""; i = j+1; continue
                i = j; continue
            elif j >= n:
                out.append(buf.strip()); buf = ""; i = j; continue
            else:
                i = j; continue
        i += 1
    if buf.strip(): out.append(buf.strip())
    return out

def split_ko(t):
    t = re.sub(r"\s+"," ",t.strip())
    out, buf, i, n = [], "", 0, len(t)
    while i < n:
        c = t[i]; buf += c
        if c in ".?!":
            j = i+1
            while j < n and t[j] in "'’”\")":
                buf += t[j]; j += 1
            if j < n and t[j] == " ":
                last = buf.split(" ")[-1]
                if re.match(r"^(?:[A-Z]\.)+$", last) or last in ABBR:
                    i = j; continue
                out.append(buf.strip()); buf = ""; i = j+1; continue
            elif j >= n:
                out.append(buf.strip()); buf = ""; i = j; continue
            else:
                i = j; continue
        i += 1
    if buf.strip(): out.append(buf.strip())
    return out

FIX=json.load(open("src/fix.json",encoding="utf-8"))

def apply_fix(no,k):
    f=FIX.get(str(no))
    if not f: return k
    for i,parts in sorted(f.get("split",{}).items(), key=lambda x:-int(x[0])):
        i=int(i); k = k[:i] + parts + k[i+1:]
    for a,b in sorted(f.get("merge",[]), key=lambda x:-x[0]):
        k = k[:a] + [" ".join(k[a:b+1])] + k[b+1:]
    return k

rows=[]
for line in open("src/orig/raw.tsv", encoding="utf-8"):
    line=line.rstrip("\n")
    if not line.strip(): continue
    p=line.split("|~|")
    assert len(p)==5, p[0]
    no=int(p[0]); en_t=p[1]; en=p[2]; ko_t=p[3]; ko=p[4]
    s=split_en(en); k=apply_fix(no, split_ko(ko))
    rows.append({"no":no,"en":en_t,"ko":ko_t,"words":len(en.split()),
                 "sent":s,"kor":k})
json.dump(rows, open("src/orig/all.json","w"), ensure_ascii=False, indent=1)
bad=[r for r in rows if len(r["sent"])!=len(r["kor"])]
print("themes:",len(rows),"  mismatched:",len(bad))
for r in bad: print("  T%02d  en=%d ko=%d"%(r["no"],len(r["sent"]),len(r["kor"])))
