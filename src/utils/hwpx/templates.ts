// HWPX templates — base assets + dynamic patches for bold/underline charPr support
import mimetypeRaw from "./assets/mimetype?raw";
import versionXmlRaw from "./assets/version.xml?raw";
import settingsXmlRaw from "./assets/settings.xml?raw";
import containerXmlRaw from "./assets/META-INF/container.xml?raw";
import manifestXmlRaw from "./assets/META-INF/manifest.xml?raw";
import contentHpfRaw from "./assets/Contents/content.hpf?raw";
import headerXmlRaw from "./assets/Contents/header.xml?raw";

// charPr IDs we inject for formatting:
//   7 = bold
//   8 = underline
//   9 = bold + underline
export const CHARPR_NORMAL = 0;
export const CHARPR_BOLD = 7;
export const CHARPR_UNDERLINE = 8;
export const CHARPR_BOLD_UNDERLINE = 9;
// paraPr ID we inject for center-aligned paragraphs (e.g. page header)
export const PARAPR_CENTER = 20;
// borderFill ID we inject for solid-black box borders (used by <box> renderer)
export const BORDERFILL_BOX = 3;

const BOX_BORDERFILL_XML = `<hh:borderFill id="${BORDERFILL_BOX}" threeD="0" shadow="0" centerLine="NONE" breakCellSeparateLine="0">
    <hh:slash type="NONE" Crooked="0" isCounter="0"/>
    <hh:backSlash type="NONE" Crooked="0" isCounter="0"/>
    <hh:leftBorder type="SOLID" width="0.2 mm" color="#000000"/>
    <hh:rightBorder type="SOLID" width="0.2 mm" color="#000000"/>
    <hh:topBorder type="SOLID" width="0.2 mm" color="#000000"/>
    <hh:bottomBorder type="SOLID" width="0.2 mm" color="#000000"/>
    <hh:diagonal type="SOLID" width="0.1 mm" color="#000000"/>
  </hh:borderFill>`;

function makeCharPr(id: number, bold: boolean, underline: boolean): string {
  return `<hh:charPr id="${id}" height="1000" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="2">
    <hh:fontRef hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
    <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
    <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
    <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
    <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
    <hh:italic value="0"/>
    <hh:bold value="${bold ? 1 : 0}"/>
    <hh:underline type="${underline ? "BOTTOM" : "NONE"}" shape="SOLID" color="#000000"/>
    <hh:strikeout shape="NONE" color="#000000"/>
    <hh:outline type="NONE"/>
    <hh:shadow type="NONE" color="#C0C0C0" offsetX="10" offsetY="10"/>
  </hh:charPr>`;
}

function makeCenterParaPr(id: number): string {
  return `<hh:paraPr id="${id}" tabPrIDRef="0" condense="0" fontLineHeight="0" snapToGrid="1" suppressLineNumbers="0" checked="0" textDir="LTR">
    <hh:align horizontal="CENTER" vertical="BASELINE"/>
    <hh:heading type="NONE" idRef="0" level="0"/>
    <hh:breakSetting breakLatinWord="KEEP_WORD" breakNonLatinWord="BREAK_WORD" widowOrphan="0" keepWithNext="0" keepLines="0" pageBreakBefore="0" lineWrap="BREAK"/>
    <hh:autoSpacing eAsianEng="0" eAsianNum="0"/>
    <hp:switch>
      <hp:case hp:required-namespace="http://www.hancom.co.kr/hwpml/2016/HwpUnitChar">
        <hh:margin>
          <hc:intent value="0" unit="HWPUNIT"/>
          <hc:left value="0" unit="HWPUNIT"/>
          <hc:right value="0" unit="HWPUNIT"/>
          <hc:prev value="0" unit="HWPUNIT"/>
          <hc:next value="0" unit="HWPUNIT"/>
        </hh:margin>
        <hh:lineSpacing type="PERCENT" value="160" unit="HWPUNIT"/>
      </hp:case>
      <hp:default>
        <hh:margin>
          <hc:intent value="0" unit="HWPUNIT"/>
          <hc:left value="0" unit="HWPUNIT"/>
          <hc:right value="0" unit="HWPUNIT"/>
          <hc:prev value="0" unit="HWPUNIT"/>
          <hc:next value="0" unit="HWPUNIT"/>
        </hh:margin>
        <hh:lineSpacing type="PERCENT" value="160" unit="HWPUNIT"/>
      </hp:default>
    </hp:switch>
    <hh:border borderFillIDRef="2" offsetLeft="0" offsetRight="0" offsetTop="0" offsetBottom="0" connect="0" ignoreMargin="0"/>
  </hh:paraPr>`;
}

// Patch header.xml: append bold/underline/both charPr entries + center paraPr, bumping itemCnts
function patchHeader(raw: string): string {
  const extraChar = [
    makeCharPr(CHARPR_BOLD, true, false),
    makeCharPr(CHARPR_UNDERLINE, false, true),
    makeCharPr(CHARPR_BOLD_UNDERLINE, true, true),
  ].join("\n");
  const extraPara = makeCenterParaPr(PARAPR_CENTER);
  return raw
    .replace(/<hh:borderFills itemCnt="(\d+)">/, (_m, n) => {
      const newCnt = parseInt(n, 10) + 1;
      return `<hh:borderFills itemCnt="${newCnt}">`;
    })
    .replace("</hh:borderFills>", `${BOX_BORDERFILL_XML}\n    </hh:borderFills>`)
    .replace(/<hh:charProperties itemCnt="(\d+)">/, (_m, n) => {
      const newCnt = parseInt(n, 10) + 3;
      return `<hh:charProperties itemCnt="${newCnt}">`;
    })
    .replace("</hh:charProperties>", `${extraChar}\n    </hh:charProperties>`)
    .replace(/<hh:paraProperties itemCnt="(\d+)">/, (_m, n) => {
      const newCnt = parseInt(n, 10) + 1;
      return `<hh:paraProperties itemCnt="${newCnt}">`;
    })
    .replace("</hh:paraProperties>", `${extraPara}\n    </hh:paraProperties>`);
}

export const MIMETYPE = mimetypeRaw.trim();
export const VERSION_XML = versionXmlRaw;
export const SETTINGS_XML = settingsXmlRaw;
export const CONTAINER_XML = containerXmlRaw;
export const MANIFEST_XML = manifestXmlRaw;
export const CONTENT_HPF = contentHpfRaw;
export const HEADER_XML = patchHeader(headerXmlRaw);
