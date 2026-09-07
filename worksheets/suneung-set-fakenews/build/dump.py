# -*- coding: utf-8 -*-
"""완성된 docx를 읽는 순서대로 텍스트로 뽑아 교정용으로 쓴다."""
import sys
from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph
from docx.oxml.ns import qn

def walk(doc):
    body = doc.element.body
    for child in body.iterchildren():
        if child.tag == qn('w:p'):
            yield Paragraph(child, doc).text
        elif child.tag == qn('w:tbl'):
            t = Table(child, doc)
            for row in t.rows:
                cells = [c.text.strip() for c in row.cells]
                yield '    | ' + ' | '.join(cells)

if __name__ == '__main__':
    doc = Document(sys.argv[1])
    for line in walk(doc):
        if line.strip():
            print(line)
