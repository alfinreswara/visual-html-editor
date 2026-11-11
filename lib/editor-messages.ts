export const PREVIEW_CHANNEL = "kanvas-preview-v1";

export const STYLE_KEYS = [
  "color",
  "backgroundColor",
  "fontSize",
  "fontWeight",
  "padding",
  "margin",
  "borderRadius",
  "display",
  "flexDirection",
  "flexWrap",
  "alignItems",
  "justifyContent",
  "gap",
  "gridTemplateColumns",
] as const;

export type StyleKey = (typeof STYLE_KEYS)[number];
export type ElementStyle = Record<StyleKey, string>;

export const CSS_PROPERTIES: Record<StyleKey, string> = {
  color: "color",
  backgroundColor: "background-color",
  fontSize: "font-size",
  fontWeight: "font-weight",
  padding: "padding",
  margin: "margin",
  borderRadius: "border-radius",
  display: "display",
  flexDirection: "flex-direction",
  flexWrap: "flex-wrap",
  alignItems: "align-items",
  justifyContent: "justify-content",
  gap: "gap",
  gridTemplateColumns: "grid-template-columns",
};

export type StyleScope = "desktop" | "tablet" | "mobile";

export const STYLE_SCOPES: Array<{
  id: StyleScope;
  label: string;
  media: string | null;
}> = [
  { id: "desktop", label: "Desktop", media: null },
  {
    id: "tablet",
    label: "Tablet",
    media: "(max-width: 1024px) and (min-width: 641px)",
  },
  { id: "mobile", label: "Mobile", media: "(max-width: 640px)" },
];

export interface SelectedElement {
  id: string;
  tag: string;
  className: string;
  text: string;
  href: string;
  src: string;
  hasChildren: boolean;
  style: ElementStyle;
}

export type PreviewMode = "editing" | "viewing";

export type BridgeCommand =
  | "delete"
  | "duplicate"
  | "undo"
  | "redo"
  | "move-up"
  | "move-down"
  | "select-parent";

type Envelope<TType extends string, TPayload = undefined> = TPayload extends undefined
  ? { channel: typeof PREVIEW_CHANNEL; type: TType }
  : { channel: typeof PREVIEW_CHANNEL; type: TType; payload: TPayload };

export type BridgeToParentMessage =
  | Envelope<"ready">
  | Envelope<"select", SelectedElement>
  | Envelope<"text", { id: string; text: string }>
  | Envelope<"link", { href: string; external: boolean }>
  | Envelope<"command", { name: BridgeCommand }>
  | Envelope<"multi-select", { elements: SelectedElement[] }>
  | Envelope<"deselect">;

export type ParentToBridgeMessage =
  | Envelope<"set-mode", { mode: PreviewMode }>
  | Envelope<"set-style", { id: string; styles: Partial<ElementStyle> }>
  | Envelope<"set-text", { id: string; text: string }>
  | Envelope<"set-attribute", { id: string; name: "href" | "src"; value: string }>
  | Envelope<"delete-element", { id: string }>
  | Envelope<"select-parent", { id: string }>
  | Envelope<"select", { id: string; scroll?: boolean }>
  | Envelope<"set-css", {
      selector: string;
      scope: StyleScope;
      styles: Partial<ElementStyle>;
    }>;

export const EMPTY_STYLE: ElementStyle = {
  color: "",
  backgroundColor: "",
  fontSize: "",
  fontWeight: "",
  padding: "",
  margin: "",
  borderRadius: "",
  display: "",
  flexDirection: "",
  flexWrap: "",
  alignItems: "",
  justifyContent: "",
  gap: "",
  gridTemplateColumns: "",
};

export const STYLE_LABELS: Record<StyleKey, string> = {
  color: "Warna teks",
  backgroundColor: "Latar",
  fontSize: "Ukuran font",
  fontWeight: "Ketebalan font",
  padding: "Padding",
  margin: "Margin",
  borderRadius: "Radius sudut",
  display: "Display",
  flexDirection: "Arah flex",
  flexWrap: "Flex wrap",
  alignItems: "Align items",
  justifyContent: "Justify content",
  gap: "Gap",
  gridTemplateColumns: "Kolom grid",
};

export const FONT_WEIGHTS = [
  { value: "300", label: "Light · 300" },
  { value: "400", label: "Regular · 400" },
  { value: "500", label: "Medium · 500" },
  { value: "600", label: "Semibold · 600" },
  { value: "700", label: "Bold · 700" },
  { value: "800", label: "Extra bold · 800" },
  { value: "900", label: "Black · 900" },
];

const ID_PATTERN = /^ve-\d{1,8}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

export function isSelectedElement(value: unknown): value is SelectedElement {
  if (!isRecord(value)) return false;
  if (!isString(value.id, 32) || !ID_PATTERN.test(value.id)) return false;
  if (!isString(value.tag, 64) || !/^[a-z][a-z0-9-]*$/i.test(value.tag)) return false;
  if (!isString(value.className, 4_000)) return false;
  if (!isString(value.text, 200_000)) return false;
  if (!isString(value.href, 2_000)) return false;
  if (!isString(value.src, 4_000)) return false;
  if (typeof value.hasChildren !== "boolean") return false;
  if (!isRecord(value.style)) return false;
  const style = value.style;

  return STYLE_KEYS.every((key) => isString(style[key], 2_000));
}

export function parseBridgeMessage(value: unknown): BridgeToParentMessage | null {
  if (!isRecord(value) || value.channel !== PREVIEW_CHANNEL) return null;
  if (typeof value.type !== "string") return null;

  if (value.type === "ready" || value.type === "deselect") {
    return { channel: PREVIEW_CHANNEL, type: value.type };
  }

  const payload = value.payload;

  if (value.type === "select") {
    if (!isSelectedElement(payload)) return null;
    return { channel: PREVIEW_CHANNEL, type: "select", payload };
  }
  if (value.type === "multi-select") {
    if (!isRecord(payload) || !Array.isArray(payload.elements)) return null;
    const validElements = payload.elements.filter(isSelectedElement);
    return { channel: PREVIEW_CHANNEL, type: "multi-select", payload: { elements: validElements } };
  }

  if (value.type === "text") {
    if (!isRecord(payload)) return null;
    if (!isString(payload.id, 32) || !ID_PATTERN.test(payload.id)) return null;
    if (!isString(payload.text, 200_000)) return null;
    return {
      channel: PREVIEW_CHANNEL,
      type: "text",
      payload: { id: payload.id, text: payload.text },
    };
  }

  if (value.type === "link") {
    if (!isRecord(payload)) return null;
    if (!isString(payload.href, 2_000) || typeof payload.external !== "boolean") {
      return null;
    }
    return {
      channel: PREVIEW_CHANNEL,
      type: "link",
      payload: { href: payload.href, external: payload.external },
    };
  }

  if (value.type === "command") {
    if (!isRecord(payload)) return null;
    const validCommands = [
      "delete",
      "duplicate",
      "undo",
      "redo",
      "move-up",
      "move-down",
      "select-parent",
    ];
    if (typeof payload.name !== "string" || !validCommands.includes(payload.name)) {
      return null;
    }
    return {
      channel: PREVIEW_CHANNEL,
      type: "command",
      payload: { name: payload.name as BridgeCommand },
    };
  }

  return null;
}

export function normalizeCssValue(value: string): string {
  return value.trim();
}
