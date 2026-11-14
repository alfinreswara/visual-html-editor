import {
  CSS_PROPERTIES,
  STYLE_KEYS,
  type ElementStyle,
  type StyleKey,
  type StyleScope,
} from "@/lib/editor-messages";

export const MEDIA_QUERIES: Record<Exclude<StyleScope, "desktop">, string> = {
  tablet: "(max-width: 1024px) and (min-width: 641px)",
  mobile: "(max-width: 640px)",
};

export function mediaQueryForScope(scope: StyleScope): string | null {
  if (scope === "desktop") return null;
  return MEDIA_QUERIES[scope];
}

export function scopeHint(scope: StyleScope): string {
  if (scope === "desktop") return "Desktop · inline / rule dasar";
  return `@media ${MEDIA_QUERIES[scope]}`;
}

export function escapeCssIdentifier(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);
}

export function classSelectorFor(className: string): string {
  return `.${escapeCssIdentifier(className.trim())}`;
}

function isWhitespace(character: string): boolean {
  return (
    character === " " ||
    character === "\n" ||
    character === "\t" ||
    character === "\r" ||
    character === "\f"
  );
}

function skipComment(css: string, index: number): number {
  const end = css.indexOf("*/", index + 2);
  return end < 0 ? css.length : end + 2;
}

function skipString(css: string, index: number): number {
  const quote = css[index];
  let cursor = index + 1;
  while (cursor < css.length) {
    const character = css[cursor];
    if (character === "\\") {
      cursor += 2;
      continue;
    }
    if (character === quote) return cursor + 1;
    cursor += 1;
  }
  return css.length;
}

function findMatchingBrace(css: string, openIndex: number): number {
  let depth = 0;
  let cursor = openIndex;
  while (cursor < css.length) {
    const character = css[cursor];
    if (character === "/" && css[cursor + 1] === "*") {
      cursor = skipComment(css, cursor);
      continue;
    }
    if (character === '"' || character === "'") {
      cursor = skipString(css, cursor);
      continue;
    }
    if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return cursor;
    }
    cursor += 1;
  }
  return -1;
}

function normalizeMediaCondition(condition: string): string {
  return condition.replace(/\s+/g, "").toLowerCase();
}

function normalizeSelector(selector: string): string {
  return selector
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*([>+~])\s*/g, "$1")
    .toLowerCase();
}

interface BlockLocation {
  start: number;
  open: number;
  close: number;
}

interface RuleLocation extends BlockLocation {
  selector: string;
}

function findMediaBlock(css: string, media: string): BlockLocation | null {
  const target = normalizeMediaCondition(media);
  let cursor = 0;

  while (cursor < css.length) {
    const character = css[cursor];
    if (character === "/" && css[cursor + 1] === "*") {
      cursor = skipComment(css, cursor);
      continue;
    }
    if (character === '"' || character === "'") {
      cursor = skipString(css, cursor);
      continue;
    }

    if (character === "@") {
      const start = cursor;
      let preludeEnd = cursor + 1;
      let semicolonStop = -1;
      while (preludeEnd < css.length) {
        const next = css[preludeEnd];
        if (next === "/" && css[preludeEnd + 1] === "*") {
          preludeEnd = skipComment(css, preludeEnd);
          continue;
        }
        if (next === '"' || next === "'") {
          preludeEnd = skipString(css, preludeEnd);
          continue;
        }
        if (next === ";") {
          semicolonStop = preludeEnd;
          break;
        }
        if (next === "{") break;
        preludeEnd += 1;
      }
      if (semicolonStop >= 0) {
        cursor = semicolonStop + 1;
        continue;
      }
      if (preludeEnd >= css.length) return null;

      const prelude = css.slice(start + 1, preludeEnd).trim();
      const close = findMatchingBrace(css, preludeEnd);
      if (close < 0) return null;

      const mediaMatch = /^media\b/i.test(prelude);
      if (mediaMatch) {
        const condition = prelude.replace(/^media\b/i, "").trim();
        if (normalizeMediaCondition(condition) === target) {
          return { start, open: preludeEnd, close };
        }
      }
      cursor = close + 1;
      continue;
    }

    if (character === "{") {
      const close = findMatchingBrace(css, cursor);
      if (close < 0) return null;
      cursor = close + 1;
      continue;
    }

    cursor += 1;
  }

  return null;
}

function findRuleInRange(
  css: string,
  start: number,
  end: number,
  selector: string,
): RuleLocation | null {
  const target = normalizeSelector(selector);
  let cursor = start;

  while (cursor < end) {
    const character = css[cursor];
    if (isWhitespace(character)) {
      cursor += 1;
      continue;
    }
    if (character === "/" && css[cursor + 1] === "*") {
      cursor = skipComment(css, cursor);
      continue;
    }

    if (character === "@") {
      let preludeEnd = cursor + 1;
      let semicolonStop = -1;
      while (preludeEnd < end) {
        const next = css[preludeEnd];
        if (next === "/" && css[preludeEnd + 1] === "*") {
          preludeEnd = skipComment(css, preludeEnd);
          continue;
        }
        if (next === '"' || next === "'") {
          preludeEnd = skipString(css, preludeEnd);
          continue;
        }
        if (next === ";") {
          semicolonStop = preludeEnd;
          break;
        }
        if (next === "{") break;
        preludeEnd += 1;
      }
      if (semicolonStop >= 0) {
        cursor = semicolonStop + 1;
        continue;
      }
      if (preludeEnd >= end) return null;
      const close = findMatchingBrace(css, preludeEnd);
      if (close < 0) return null;
      cursor = close + 1;
      continue;
    }

    const ruleStart = cursor;
    let open = cursor;
    while (open < end) {
      const next = css[open];
      if (next === "/" && css[open + 1] === "*") {
        open = skipComment(css, open);
        continue;
      }
      if (next === '"' || next === "'") {
        open = skipString(css, open);
        continue;
      }
      if (next === "{") break;
      open += 1;
    }
    if (open >= end) return null;

    const rawSelector = css.slice(ruleStart, open);
    const close = findMatchingBrace(css, open);
    if (close < 0) return null;

    if (normalizeSelector(rawSelector) === target) {
      return {
        start: ruleStart,
        open,
        close,
        selector: rawSelector.trim(),
      };
    }

    cursor = close + 1;
  }

  return null;
}

function findTopLevelRule(css: string, selector: string): RuleLocation | null {
  return findRuleInRange(css, 0, css.length, selector);
}

interface Declaration {
  property: string;
  value: string;
}

function splitDeclarations(body: string): Declaration[] {
  const clean = body.replace(/\/\*[\s\S]*?\*\//g, "");
  const chunks: string[] = [];
  let current = "";
  let depth = 0;
  let quote = "";

  for (let index = 0; index < clean.length; index += 1) {
    const character = clean[index];
    if (quote) {
      current += character;
      if (character === "\\") {
        if (index + 1 < clean.length) {
          current += clean[index + 1];
          index += 1;
        }
      } else if (character === quote) {
        quote = "";
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      current += character;
      continue;
    }
    if (character === "(") depth += 1;
    else if (character === ")") depth = Math.max(0, depth - 1);
    else if (character === ";" && depth === 0) {
      chunks.push(current);
      current = "";
      continue;
    }
    current += character;
  }
  if (current.trim()) chunks.push(current);

  const declarations: Declaration[] = [];
  for (const chunk of chunks) {
    const colon = chunk.indexOf(":");
    if (colon < 0) continue;
    const property = chunk.slice(0, colon).trim();
    const value = chunk.slice(colon + 1).trim();
    if (!property || !value) continue;
    declarations.push({ property, value });
  }
  return declarations;
}

function withImportant(value: string, important: boolean): string {
  if (!important || /!important\s*$/i.test(value)) return value;
  return `${value} !important`;
}

function sanitizeCssValue(value: string): string {
  return value.replace(/[;{}]/g, "").replace(/\s+/g, " ").trim();
}

function updateDeclarations(
  body: string,
  styles: Partial<ElementStyle>,
  important: boolean,
): Declaration[] {
  const declarations = splitDeclarations(body);
  const keys = Object.keys(styles) as StyleKey[];

  for (const key of keys) {
    if (!STYLE_KEYS.includes(key)) continue;
    const property = CSS_PROPERTIES[key];
    const rawValue = styles[key];
    if (rawValue === undefined) continue;
    const value = sanitizeCssValue(rawValue);

    if (!value) {
      const index = declarations.findIndex(
        (declaration) => declaration.property.toLowerCase() === property,
      );
      if (index >= 0) declarations.splice(index, 1);
      continue;
    }

    const index = declarations.findIndex(
      (declaration) => declaration.property.toLowerCase() === property,
    );
    const nextValue = withImportant(value, important);
    if (index >= 0) declarations[index] = { property, value: nextValue };
    else declarations.push({ property, value: nextValue });
  }

  return declarations;
}

function formatDeclarations(declarations: Declaration[], indent: string): string {
  return declarations
    .map(
      (declaration) =>
        `${indent}${declaration.property}: ${declaration.value};`,
    )
    .join("\n");
}

function formatRule(
  selector: string,
  declarations: Declaration[],
  indent: string,
): string {
  return `${indent}${selector} {\n${formatDeclarations(declarations, `${indent}  `)}\n${indent}}`;
}

function appendToDocument(css: string, block: string): string {
  const trimmed = css.replace(/\s+$/, "");
  return `${trimmed ? `${trimmed}\n\n` : ""}${block}\n`;
}

function insertBeforeBlock(
  css: string,
  block: BlockLocation,
  text: string,
): string {
  const before = css.slice(0, block.start).replace(/\s+$/, "");
  const after = css.slice(block.start);
  return `${before ? `${before}\n\n` : ""}${text}\n\n${after}`;
}

function insertIntoBlock(
  css: string,
  block: BlockLocation,
  text: string,
): string {
  const before = css.slice(0, block.close).replace(/\s+$/, "");
  const after = css.slice(block.close);
  return `${before}\n${text}\n${after}`;
}

function removeRule(css: string, rule: RuleLocation): string {
  const before = css.slice(0, rule.start).replace(/[ \t]+$/, "");
  const after = css.slice(rule.close + 1).replace(/^[ \t]*\n?/, "");
  return `${before.replace(/\n{3,}/g, "\n\n")}${after}`;
}

export function upsertStyleRule(
  css: string,
  selector: string,
  styles: Partial<ElementStyle>,
  scope: StyleScope,
  important = false,
): string {
  const media = mediaQueryForScope(scope);
  const hasValue = (Object.keys(styles) as StyleKey[]).some((key) =>
    sanitizeCssValue(styles[key] ?? ""),
  );

  if (!media) {
    const rule = findTopLevelRule(css, selector);
    if (rule) {
      const declarations = updateDeclarations(
        css.slice(rule.open + 1, rule.close),
        styles,
        important,
      );
      if (declarations.length === 0) return removeRule(css, rule);
      const replacement = formatRule(selector, declarations, "");
      return `${css.slice(0, rule.start)}${replacement}${css.slice(rule.close + 1)}`;
    }
    if (!hasValue) return css;
    const declarations = updateDeclarations("", styles, important);
    return appendToDocument(css, formatRule(selector, declarations, ""));
  }

  const mediaBlock = findMediaBlock(css, media);
  if (mediaBlock) {
    const rule = findRuleInRange(
      css,
      mediaBlock.open + 1,
      mediaBlock.close,
      selector,
    );
    if (rule) {
      const declarations = updateDeclarations(
        css.slice(rule.open + 1, rule.close),
        styles,
        important,
      );
      if (declarations.length === 0) return removeRule(css, rule);
      const replacement = formatRule(selector, declarations, "  ");
      return `${css.slice(0, rule.start)}${replacement}${css.slice(rule.close + 1)}`;
    }
    if (!hasValue) return css;
    const declarations = updateDeclarations("", styles, important);
    return insertIntoBlock(
      css,
      mediaBlock,
      formatRule(selector, declarations, "  "),
    );
  }

  if (!hasValue) return css;
  const declarations = updateDeclarations("", styles, important);
  const block = `@media ${media} {\n${formatRule(selector, declarations, "  ")}\n}`;

  if (scope === "tablet") {
    const mobileBlock = findMediaBlock(css, MEDIA_QUERIES.mobile);
    if (mobileBlock) return insertBeforeBlock(css, mobileBlock, block);
  }

  return appendToDocument(css, block);
}

export function hasStyleRule(
  css: string,
  selector: string,
  scope: StyleScope,
): boolean {
  const media = mediaQueryForScope(scope);
  if (!media) return findTopLevelRule(css, selector) !== null;
  const block = findMediaBlock(css, media);
  if (!block) return false;
  return findRuleInRange(css, block.open + 1, block.close, selector) !== null;
}

export interface ScopeRules {
  desktop: Partial<ElementStyle>;
  tablet: Partial<ElementStyle>;
  mobile: Partial<ElementStyle>;
}

export function extractRulesForSelector(
  css: string,
  selector: string,
): ScopeRules {
  const result: ScopeRules = {
    desktop: {},
    tablet: {},
    mobile: {},
  };

  function parseBodyIntoStyles(body: string): Partial<ElementStyle> {
    const decls = splitDeclarations(body);
    const styles: Partial<ElementStyle> = {};
    for (const decl of decls) {
      const propLower = decl.property.toLowerCase();
      for (const key of STYLE_KEYS) {
        if (CSS_PROPERTIES[key].toLowerCase() === propLower) {
          styles[key] = decl.value.replace(/!important/gi, "").trim();
          break;
        }
      }
    }
    return styles;
  }

  // 1. Desktop
  const topRule = findTopLevelRule(css, selector);
  if (topRule) {
    result.desktop = parseBodyIntoStyles(css.slice(topRule.open + 1, topRule.close));
  }

  // 2. Tablet
  const tabletBlock = findMediaBlock(css, MEDIA_QUERIES.tablet);
  if (tabletBlock) {
    const tabletRule = findRuleInRange(
      css,
      tabletBlock.open + 1,
      tabletBlock.close,
      selector,
    );
    if (tabletRule) {
      result.tablet = parseBodyIntoStyles(
        css.slice(tabletRule.open + 1, tabletRule.close),
      );
    }
  }

  // 3. Mobile
  const mobileBlock = findMediaBlock(css, MEDIA_QUERIES.mobile);
  if (mobileBlock) {
    const mobileRule = findRuleInRange(
      css,
      mobileBlock.open + 1,
      mobileBlock.close,
      selector,
    );
    if (mobileRule) {
      result.mobile = parseBodyIntoStyles(
        css.slice(mobileRule.open + 1, mobileRule.close),
      );
    }
  }

  return result;
}
