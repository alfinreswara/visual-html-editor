export const PREVIEW_CHANNEL = "kanvas-preview-v1";

export const STYLE_KEYS = [
  // Layout
  "display",
  "flexDirection",
  "flexWrap",
  "justifyContent",
  "alignItems",
  "alignSelf",
  "gap",
  "direction",
  "gridTemplateColumns",
  "gridTemplateRows",

  // Size
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",

  // Spacing
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",

  // Typography
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "textDecoration",
  "textTransform",
  "color",

  // Background
  "backgroundColor",
  "backgroundImage",
  "backgroundSize",
  "backgroundPosition",
  "backgroundRepeat",

  // Border
  "borderWidth",
  "borderStyle",
  "borderColor",
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius",

  // Effects
  "boxShadow",
  "opacity",
  "transform",
  "transition",
  "filter",

  // Position
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "zIndex",
] as const;

export type StyleKey = (typeof STYLE_KEYS)[number];
export type ElementStyle = Record<StyleKey, string>;

export const CSS_PROPERTIES: Record<StyleKey, string> = {
  // Layout
  display: "display",
  flexDirection: "flex-direction",
  flexWrap: "flex-wrap",
  justifyContent: "justify-content",
  alignItems: "align-items",
  alignSelf: "align-self",
  gap: "gap",
  direction: "direction",
  gridTemplateColumns: "grid-template-columns",
  gridTemplateRows: "grid-template-rows",

  // Size
  width: "width",
  height: "height",
  minWidth: "min-width",
  maxWidth: "max-width",
  minHeight: "min-height",
  maxHeight: "max-height",

  // Spacing
  margin: "margin",
  marginTop: "margin-top",
  marginRight: "margin-right",
  marginBottom: "margin-bottom",
  marginLeft: "margin-left",
  padding: "padding",
  paddingTop: "padding-top",
  paddingRight: "padding-right",
  paddingBottom: "padding-bottom",
  paddingLeft: "padding-left",

  // Typography
  fontFamily: "font-family",
  fontSize: "font-size",
  fontWeight: "font-weight",
  lineHeight: "line-height",
  letterSpacing: "letter-spacing",
  textAlign: "text-align",
  textDecoration: "text-decoration",
  textTransform: "text-transform",
  color: "color",

  // Background
  backgroundColor: "background-color",
  backgroundImage: "background-image",
  backgroundSize: "background-size",
  backgroundPosition: "background-position",
  backgroundRepeat: "background-repeat",

  // Border
  borderWidth: "border-width",
  borderStyle: "border-style",
  borderColor: "border-color",
  borderRadius: "border-radius",
  borderTopLeftRadius: "border-top-left-radius",
  borderTopRightRadius: "border-top-right-radius",
  borderBottomRightRadius: "border-bottom-right-radius",
  borderBottomLeftRadius: "border-bottom-left-radius",

  // Effects
  boxShadow: "box-shadow",
  opacity: "opacity",
  transform: "transform",
  transition: "transition",
  filter: "filter",

  // Position
  position: "position",
  top: "top",
  right: "right",
  bottom: "bottom",
  left: "left",
  zIndex: "z-index",
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
  | "select-parent"
  | "select-child"
  | "copy"
  | "cut"
  | "paste"
  | "save-section";

type Envelope<TType extends string, TPayload = undefined> = TPayload extends undefined
  ? { channel: typeof PREVIEW_CHANNEL; sessionToken?: string; type: TType }
  : { channel: typeof PREVIEW_CHANNEL; sessionToken?: string; type: TType; payload: TPayload };

export type BridgeToParentMessage =
  | Envelope<"ready">
  | Envelope<"select", SelectedElement>
  | Envelope<"text", { id: string; text: string }>
  | Envelope<"html", { id: string; html: string }>
  | Envelope<"link", { href: string; external: boolean }>
  | Envelope<"command", { name: BridgeCommand }>
  | Envelope<"multi-select", { elements: SelectedElement[] }>
  | Envelope<
      "move-to",
      {
        sourceId: string;
        targetId: string;
        position: "before" | "after" | "inside";
      }
    >
  | Envelope<"deselect">;

export type ParentToBridgeMessage =
  | Envelope<"set-mode", { mode: PreviewMode }>
  | Envelope<"set-style", { id: string; styles: Partial<ElementStyle> }>
  | Envelope<"set-text", { id: string; text: string }>
  | Envelope<"set-html", { id: string; html: string }>
  | Envelope<"set-attribute", { id: string; name: "href" | "src"; value: string }>
  | Envelope<"delete-element", { id: string }>
  | Envelope<"select-parent", { id: string }>
  | Envelope<"select-child", { id: string }>
  | Envelope<"select", { id: string; scroll?: boolean }>
  | Envelope<"set-css", {
      selector: string;
      scope: StyleScope;
      styles: Partial<ElementStyle>;
    }>;

export const EMPTY_STYLE: ElementStyle = {
  // Layout
  display: "",
  flexDirection: "",
  flexWrap: "",
  justifyContent: "",
  alignItems: "",
  alignSelf: "",
  gap: "",
  direction: "",
  gridTemplateColumns: "",
  gridTemplateRows: "",

  // Size
  width: "",
  height: "",
  minWidth: "",
  maxWidth: "",
  minHeight: "",
  maxHeight: "",

  // Spacing
  margin: "",
  marginTop: "",
  marginRight: "",
  marginBottom: "",
  marginLeft: "",
  padding: "",
  paddingTop: "",
  paddingRight: "",
  paddingBottom: "",
  paddingLeft: "",

  // Typography
  fontFamily: "",
  fontSize: "",
  fontWeight: "",
  lineHeight: "",
  letterSpacing: "",
  textAlign: "",
  textDecoration: "",
  textTransform: "",
  color: "",

  // Background
  backgroundColor: "",
  backgroundImage: "",
  backgroundSize: "",
  backgroundPosition: "",
  backgroundRepeat: "",

  // Border
  borderWidth: "",
  borderStyle: "",
  borderColor: "",
  borderRadius: "",
  borderTopLeftRadius: "",
  borderTopRightRadius: "",
  borderBottomRightRadius: "",
  borderBottomLeftRadius: "",

  // Effects
  boxShadow: "",
  opacity: "",
  transform: "",
  transition: "",
  filter: "",

  // Position
  position: "",
  top: "",
  right: "",
  bottom: "",
  left: "",
  zIndex: "",
};

export const STYLE_LABELS: Record<StyleKey, string> = {
  // Layout
  display: "Display",
  flexDirection: "Arah flex",
  flexWrap: "Flex wrap",
  justifyContent: "Justify content",
  alignItems: "Align items",
  alignSelf: "Align self",
  gap: "Gap",
  direction: "Arah teks",
  gridTemplateColumns: "Kolom grid",
  gridTemplateRows: "Baris grid",

  // Size
  width: "Lebar",
  height: "Tinggi",
  minWidth: "Min lebar",
  maxWidth: "Max lebar",
  minHeight: "Min tinggi",
  maxHeight: "Max tinggi",

  // Spacing
  margin: "Margin",
  marginTop: "Margin atas",
  marginRight: "Margin kanan",
  marginBottom: "Margin bawah",
  marginLeft: "Margin kiri",
  padding: "Padding",
  paddingTop: "Padding atas",
  paddingRight: "Padding kanan",
  paddingBottom: "Padding bawah",
  paddingLeft: "Padding kiri",

  // Typography
  fontFamily: "Font family",
  fontSize: "Ukuran font",
  fontWeight: "Ketebalan font",
  lineHeight: "Line height",
  letterSpacing: "Letter spacing",
  textAlign: "Perataan teks",
  textDecoration: "Dekorasi teks",
  textTransform: "Kapitalisasi teks",
  color: "Warna teks",

  // Background
  backgroundColor: "Warna latar",
  backgroundImage: "Gambar / gradasi latar",
  backgroundSize: "Ukuran latar",
  backgroundPosition: "Posisi latar",
  backgroundRepeat: "Pengulangan latar",

  // Border
  borderWidth: "Ketebalan border",
  borderStyle: "Gaya border",
  borderColor: "Warna border",
  borderRadius: "Radius sudut",
  borderTopLeftRadius: "Radius kiri-atas",
  borderTopRightRadius: "Radius kanan-atas",
  borderBottomRightRadius: "Radius kanan-bawah",
  borderBottomLeftRadius: "Radius kiri-bawah",

  // Effects
  boxShadow: "Bayangan kotak",
  opacity: "Opasitas",
  transform: "Transform",
  transition: "Transisi",
  filter: "Filter efek",

  // Position
  position: "Posisi",
  top: "Top",
  right: "Right",
  bottom: "Bottom",
  left: "Left",
  zIndex: "Z-index",
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

  for (const key of Object.keys(style)) {
    if (!isString(style[key], 2_000)) return false;
  }
  return true;
}

export function parseBridgeMessage(
  value: unknown,
  expectedToken?: string,
): BridgeToParentMessage | null {
  if (!isRecord(value) || value.channel !== PREVIEW_CHANNEL) return null;
  if (typeof value.type !== "string") return null;

  const sessionToken = typeof value.sessionToken === "string" ? value.sessionToken : undefined;
  if (expectedToken && sessionToken !== expectedToken) {
    return null;
  }

  const tokenField = sessionToken ? { sessionToken } : {};

  if (value.type === "ready" || value.type === "deselect") {
    return { channel: PREVIEW_CHANNEL, ...tokenField, type: value.type };
  }

  const payload = value.payload;

  if (value.type === "select") {
    if (!isSelectedElement(payload)) return null;
    return { channel: PREVIEW_CHANNEL, ...tokenField, type: "select", payload };
  }
  if (value.type === "multi-select") {
    if (!isRecord(payload) || !Array.isArray(payload.elements)) return null;
    const validElements = payload.elements.filter(isSelectedElement);
    return {
      channel: PREVIEW_CHANNEL,
      ...tokenField,
      type: "multi-select",
      payload: { elements: validElements },
    };
  }

  if (value.type === "text") {
    if (!isRecord(payload)) return null;
    if (!isString(payload.id, 32) || !ID_PATTERN.test(payload.id)) return null;
    if (!isString(payload.text, 200_000)) return null;
    return {
      channel: PREVIEW_CHANNEL,
      ...tokenField,
      type: "text",
      payload: { id: payload.id, text: payload.text },
    };
  }

  if (value.type === "html") {
    if (!isRecord(payload)) return null;
    if (!isString(payload.id, 32) || !ID_PATTERN.test(payload.id)) return null;
    if (!isString(payload.html, 500_000)) return null;
    return {
      channel: PREVIEW_CHANNEL,
      ...tokenField,
      type: "html",
      payload: { id: payload.id, html: payload.html },
    };
  }

  if (value.type === "link") {
    if (!isRecord(payload)) return null;
    if (!isString(payload.href, 2_000) || typeof payload.external !== "boolean") {
      return null;
    }
    return {
      channel: PREVIEW_CHANNEL,
      ...tokenField,
      type: "link",
      payload: { href: payload.href, external: payload.external },
    };
  }

  if (value.type === "move-to") {
    if (!isRecord(payload)) return null;
    if (!isString(payload.sourceId, 32) || !ID_PATTERN.test(payload.sourceId)) return null;
    if (!isString(payload.targetId, 32) || !ID_PATTERN.test(payload.targetId)) return null;
    if (
      payload.position !== "before" &&
      payload.position !== "after" &&
      payload.position !== "inside"
    ) {
      return null;
    }
    return {
      channel: PREVIEW_CHANNEL,
      ...tokenField,
      type: "move-to",
      payload: {
        sourceId: payload.sourceId,
        targetId: payload.targetId,
        position: payload.position,
      },
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
      "select-child",
      "copy",
      "cut",
      "paste",
      "save-section",
    ];
    if (typeof payload.name !== "string" || !validCommands.includes(payload.name)) {
      return null;
    }
    return {
      channel: PREVIEW_CHANNEL,
      ...tokenField,
      type: "command",
      payload: { name: payload.name as BridgeCommand },
    };
  }

  return null;
}

export function normalizeCssValue(value: string): string {
  return value.trim();
}
