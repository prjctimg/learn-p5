import {
  JETBRAINS_MONO_REGULAR_BASE64,
  JETBRAINS_MONO_BOLD_BASE64,
} from "../../constants/fontBase64.generated";
import { escapeHtmlAttribute } from "./p5Html";

/**
 * @font-face rules for the editor/preview web documents. When the fonts are
 * available as app-private files they are referenced by URL; otherwise the
 * bundled base64 copies are inlined.
 */
export function fontFaceCss({
  regularUrl,
  boldUrl,
}: {
  regularUrl?: string | null;
  boldUrl?: string | null;
} = {}): string {
  const regular = regularUrl
    ? `url("${escapeHtmlAttribute(regularUrl)}")`
    : `url(data:font/truetype;charset=utf-8;base64,${JETBRAINS_MONO_REGULAR_BASE64})`;
  const bold = boldUrl
    ? `url("${escapeHtmlAttribute(boldUrl)}")`
    : `url(data:font/truetype;charset=utf-8;base64,${JETBRAINS_MONO_BOLD_BASE64})`;

  return `  @font-face {
    font-family: 'JetBrains Mono';
    font-style: normal;
    font-weight: 400;
    src: ${regular} format('truetype');
  }
  @font-face {
    font-family: 'JetBrains Mono';
    font-style: normal;
    font-weight: 700;
    src: ${bold} format('truetype');
  }`;
}
