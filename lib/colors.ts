const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGB_PATTERN = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i;

function toByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function isTransparentColor(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "transparent") return true;
  const match = normalized.match(RGB_PATTERN);
  if (!match) return false;
  if (match[4] === undefined) return false;
  const alpha = match[4].endsWith("%")
    ? Number.parseFloat(match[4]) / 100
    : Number.parseFloat(match[4]);
  return !Number.isFinite(alpha) || alpha <= 0;
}

export function toHexColor(value: string, fallback = "#ffffff"): string {
  const normalized = value.trim();
  if (HEX_PATTERN.test(normalized)) {
    const hex = normalized.slice(1);
    if (hex.length === 3) {
      return `#${hex
        .split("")
        .map((character) => character + character)
        .join("")}`.toLowerCase();
    }
    return normalized.toLowerCase();
  }

  const match = normalized.match(RGB_PATTERN);
  if (!match) return fallback;

  return `#${[match[1], match[2], match[3]]
    .map((channel) => toByte(Number.parseFloat(channel)).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function toCssHex(hex: string): string {
  return HEX_PATTERN.test(hex) ? hex : "#ffffff";
}
