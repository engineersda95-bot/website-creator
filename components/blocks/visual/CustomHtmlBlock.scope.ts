/**
 * Scopes all CSS rules in `css` under `#scopeId` so that multiple
 * CustomHtmlBlocks on the same page never conflict with each other.
 *
 * Handles:
 *  - Regular rules:  .hero { ... }  →  #id .hero { ... }
 *  - :root selectors: :root { ... }  →  #id { ... }
 *  - @media / @container wrappers: selectors inside are scoped too
 *  - @keyframes / @font-face: left untouched (not element selectors)
 */
export function scopeBlockCss(css: string, scopeId: string): string {
  if (!css) return '';

  const prefix = `#${scopeId}`;

  // Tokenise the CSS into chunks: at-blocks with braces, or plain rule blocks
  const result: string[] = [];
  let i = 0;
  const len = css.length;

  while (i < len) {
    // Skip whitespace/comments between rules
    const ws = css.slice(i).match(/^(\s*\/\*[\s\S]*?\*\/\s*|\s+)/);
    if (ws) { result.push(ws[0]); i += ws[0].length; continue; }

    // At-rule
    if (css[i] === '@') {
      const atMatch = css.slice(i).match(/^(@[\w-]+[^{;]*)/);
      if (!atMatch) { result.push(css[i]); i++; continue; }
      const atKeyword = atMatch[1].trim().toLowerCase();
      i += atMatch[1].length;

      // @keyframes, @font-face, @charset, @import, @layer (declaration) — pass through unchanged
      if (
        atKeyword.startsWith('@keyframes') ||
        atKeyword.startsWith('@-webkit-keyframes') ||
        atKeyword.startsWith('@font-face') ||
        atKeyword.startsWith('@charset') ||
        atKeyword.startsWith('@import') ||
        atKeyword.startsWith('@namespace')
      ) {
        // Read until end of block or semicolon
        if (css[i] === '{') {
          const block = readBlock(css, i);
          result.push(atMatch[1] + block);
          i += block.length;
        } else {
          const semi = css.indexOf(';', i);
          const end = semi === -1 ? len : semi + 1;
          result.push(atMatch[1] + css.slice(i, end));
          i = end;
        }
        continue;
      }

      // @media, @container, @supports, @layer (block) — scope inner rules
      if (css[i] === '{') {
        const inner = readBlock(css, i);
        const innerContent = inner.slice(1, -1); // strip outer { }
        const scopedInner = scopeBlockCss(innerContent, scopeId);
        result.push(atMatch[1] + '{' + scopedInner + '}');
        i += inner.length;
      } else {
        result.push(atMatch[1]);
      }
      continue;
    }

    // Regular rule: read selector(s) then block
    const openBrace = css.indexOf('{', i);
    if (openBrace === -1) { result.push(css.slice(i)); break; }

    const selectorStr = css.slice(i, openBrace);
    const block = readBlock(css, openBrace);

    const scopedSelectors = selectorStr
      .split(',')
      .map(sel => {
        const s = sel.trim();
        if (!s) return '';
        // :root → use scope element itself
        if (s === ':root') return prefix;
        // Already scoped (shouldn't happen but defensive)
        if (s.startsWith(prefix)) return s;
        return `${prefix} ${s}`;
      })
      .filter(Boolean)
      .join(', ');

    result.push(scopedSelectors + block);
    i = openBrace + block.length;
  }

  return result.join('');
}

/** Reads a complete { ... } block starting at position `start` (which must be `{`). */
function readBlock(css: string, start: number): string {
  let depth = 0;
  let i = start;
  while (i < css.length) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') { depth--; if (depth === 0) return css.slice(start, i + 1); }
    i++;
  }
  return css.slice(start); // malformed — return rest
}
