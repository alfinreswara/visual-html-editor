"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  BookmarkPlus,
  Box,
  ChevronDown,
  ChevronRight,
  Code2,
  CornerLeftUp,
  Eye,
  Image as ImageIcon,
  Layers,
  Layout,
  Link2,
  Lock,
  Maximize2,
  Minus,
  MousePointer2,
  Move,
  Palette,
  Plus,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Square,
  Tablet,
  Trash2,
  Type,
  Unlock,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  FONT_WEIGHTS,
  type ElementStyle,
  type SelectedElement,
  type StyleKey,
} from "@/lib/editor-messages";
import { isTransparentColor, toHexColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

const FIELD_CLASS =
  "focus-ring h-7 w-full rounded-md border border-white/[0.08] bg-white/[0.025] px-2 text-[10.5px] text-zinc-200 outline-none transition placeholder:text-zinc-600 hover:border-white/[0.14] focus:border-[#3b82f6]/50 focus:bg-white/[0.04]";

const PRESET_COLORS = [
  "#ffffff",
  "#e4e4e7",
  "#71717a",
  "#18181b",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

const DESIGN_TOKEN_SWATCHES = [
  { name: "Primary", token: "var(--color-primary, #3b82f6)" },
  { name: "Secondary", token: "var(--color-secondary, #475569)" },
  { name: "Latar", token: "var(--color-bg, #ffffff)" },
  { name: "Surface", token: "var(--color-surface, #f8fafc)" },
  { name: "Teks", token: "var(--color-text, #0f172a)" },
  { name: "Border", token: "var(--color-border, #e2e8f0)" },
];

const POPULAR_FONTS = [
  { value: "", label: "Bawaan (Inherit)" },
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "'Plus Jakarta Sans', sans-serif", label: "Plus Jakarta Sans" },
  { value: "Poppins, sans-serif", label: "Poppins" },
  { value: "Roboto, sans-serif", label: "Roboto" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "Merriweather, serif", label: "Merriweather" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "system-ui, sans-serif", label: "System UI" },
];

const SHADOW_PRESETS = [
  { value: "", label: "Tanpa Bayangan" },
  { value: "0 1px 3px rgba(0,0,0,0.1)", label: "Subtle (Kecil)" },
  { value: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)", label: "Medium (Sedang)" },
  { value: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)", label: "Large (Besar)" },
  { value: "0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.04)", label: "Floating (Melayang)" },
];

const TRANSITION_PRESETS = [
  { value: "", label: "Tanpa Transisi" },
  { value: "all 150ms ease", label: "Cepat (150ms)" },
  { value: "all 300ms ease", label: "Normal (300ms)" },
  { value: "all 500ms ease-in-out", label: "Halus (500ms)" },
];

function parseNumericWithUnit(val: string): { num: number; unit: string } {
  const match = val.trim().match(/^(-?\d+(?:\.\d+)?)\s*([a-z%]*)$/i);
  if (!match) return { num: 0, unit: "px" };
  return { num: parseFloat(match[1]) || 0, unit: match[2] || "px" };
}

function ResponsiveBadge({
  scope,
  overrides,
}: {
  scope: string;
  overrides?: { tablet?: boolean; mobile?: boolean };
}) {
  if (!overrides) return null;
  const hasTablet = Boolean(overrides.tablet);
  const hasMobile = Boolean(overrides.mobile);

  if (!hasTablet && !hasMobile) return null;

  return (
    <div className="flex items-center gap-1">
      {hasTablet ? (
        <span
          className="flex items-center gap-0.5 rounded bg-blue-500/15 px-1 py-0.2 text-[8px] font-semibold text-blue-400"
          title="Nilai ini memiliki override untuk Tablet"
        >
          <Tablet className="size-2" />
          Tab
        </span>
      ) : null}
      {hasMobile ? (
        <span
          className="flex items-center gap-0.5 rounded bg-purple-500/15 px-1 py-0.2 text-[8px] font-semibold text-purple-400"
          title="Nilai ini memiliki override untuk Mobile"
        >
          <Smartphone className="size-2" />
          Mob
        </span>
      ) : null}
    </div>
  );
}

function StepperInput({
  label,
  value,
  placeholder,
  step = 1,
  min,
  max,
  overrides,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  step?: number;
  min?: number;
  max?: number;
  overrides?: { tablet?: boolean; mobile?: boolean };
  onChange: (val: string) => void;
}) {
  const inputId = useId();

  function adjust(delta: number) {
    const { num, unit } = parseNumericWithUnit(value || "0");
    let next = num + delta;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    onChange(`${next}${unit || "px"}`);
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={inputId} className="text-[10px] font-medium text-zinc-400">
          {label}
        </label>
        <ResponsiveBadge scope="" overrides={overrides} />
      </div>
      <div className="flex h-7 items-center rounded-md border border-white/[0.08] bg-white/[0.025] transition-colors focus-within:border-[#3b82f6]/50 focus-within:bg-white/[0.04]">
        <input
          id={inputId}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="focus-ring min-w-0 flex-1 bg-transparent px-2 text-[10.5px] font-mono text-zinc-200 outline-none placeholder:text-zinc-600"
        />
        <div className="flex items-center border-l border-white/[0.07] px-0.5">
          <button
            type="button"
            onClick={() => adjust(-step)}
            className="grid size-5.5 place-items-center rounded text-zinc-500 transition hover:bg-white/[0.08] hover:text-zinc-200 active:scale-95"
            title="Kurangi"
            aria-label={`Kurangi ${label}`}
          >
            <Minus className="size-2.5" />
          </button>
          <button
            type="button"
            onClick={() => adjust(step)}
            className="grid size-5.5 place-items-center rounded text-zinc-500 transition hover:bg-white/[0.08] hover:text-zinc-200 active:scale-95"
            title="Tambah"
            aria-label={`Tambah ${label}`}
          >
            <Plus className="size-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FourSidesInput({
  label,
  top,
  right,
  bottom,
  left,
  all,
  onChangeAll,
  onChangeSide,
}: {
  label: string;
  top: string;
  right: string;
  bottom: string;
  left: string;
  all: string;
  onChangeAll: (val: string) => void;
  onChangeSide: (side: "Top" | "Right" | "Bottom" | "Left", val: string) => void;
}) {
  const [split, setSplit] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-zinc-400">{label}</span>
        <button
          type="button"
          onClick={() => setSplit(!split)}
          className="flex items-center gap-1 text-[9px] text-zinc-500 hover:text-zinc-300 transition"
          title={split ? "Satukan semua sisi" : "Pisah tiap sisi (Atas, Kanan, Bawah, Kiri)"}
        >
          {split ? <Unlock className="size-2.5 text-blue-400" /> : <Lock className="size-2.5" />}
          <span>{split ? "4 Sisi Terpisah" : "Semua Sisi"}</span>
        </button>
      </div>

      {!split ? (
        <StepperInput
          label="Semua Sisi"
          value={all || top || "0px"}
          placeholder="0px"
          step={2}
          onChange={onChangeAll}
        />
      ) : (
        <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-white/[0.06] bg-black/20 p-2">
          <StepperInput
            label="Atas (Top)"
            value={top}
            placeholder="0px"
            step={2}
            onChange={(val) => onChangeSide("Top", val)}
          />
          <StepperInput
            label="Kanan (Right)"
            value={right}
            placeholder="0px"
            step={2}
            onChange={(val) => onChangeSide("Right", val)}
          />
          <StepperInput
            label="Bawah (Bottom)"
            value={bottom}
            placeholder="0px"
            step={2}
            onChange={(val) => onChangeSide("Bottom", val)}
          />
          <StepperInput
            label="Kiri (Left)"
            value={left}
            placeholder="0px"
            step={2}
            onChange={(val) => onChangeSide("Left", val)}
          />
        </div>
      )}
    </div>
  );
}

function FourCornersRadiusInput({
  label,
  all,
  topLeft,
  topRight,
  bottomRight,
  bottomLeft,
  onChangeAll,
  onChangeCorner,
}: {
  label: string;
  all: string;
  topLeft: string;
  topRight: string;
  bottomRight: string;
  bottomLeft: string;
  onChangeAll: (val: string) => void;
  onChangeCorner: (
    corner: "borderTopLeftRadius" | "borderTopRightRadius" | "borderBottomRightRadius" | "borderBottomLeftRadius",
    val: string,
  ) => void;
}) {
  const [split, setSplit] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-zinc-400">{label}</span>
        <button
          type="button"
          onClick={() => setSplit(!split)}
          className="flex items-center gap-1 text-[9px] text-zinc-500 hover:text-zinc-300 transition"
          title={split ? "Satukan semua sudut" : "Pisah tiap sudut"}
        >
          {split ? <Unlock className="size-2.5 text-blue-400" /> : <Lock className="size-2.5" />}
          <span>{split ? "Sudut Terpisah" : "Semua Sudut"}</span>
        </button>
      </div>

      {!split ? (
        <StepperInput
          label="Radius Sudut"
          value={all || topLeft || "0px"}
          placeholder="0px"
          step={2}
          onChange={onChangeAll}
        />
      ) : (
        <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-white/[0.06] bg-black/20 p-2">
          <StepperInput
            label="Kiri-Atas"
            value={topLeft}
            placeholder="0px"
            step={2}
            onChange={(val) => onChangeCorner("borderTopLeftRadius", val)}
          />
          <StepperInput
            label="Kanan-Atas"
            value={topRight}
            placeholder="0px"
            step={2}
            onChange={(val) => onChangeCorner("borderTopRightRadius", val)}
          />
          <StepperInput
            label="Kiri-Bawah"
            value={bottomLeft}
            placeholder="0px"
            step={2}
            onChange={(val) => onChangeCorner("borderBottomLeftRadius", val)}
          />
          <StepperInput
            label="Kanan-Bawah"
            value={bottomRight}
            placeholder="0px"
            step={2}
            onChange={(val) => onChangeCorner("borderBottomRightRadius", val)}
          />
        </div>
      )}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  allowClear = false,
  overrides,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowClear?: boolean;
  overrides?: { tablet?: boolean; mobile?: boolean };
}) {
  const inputId = useId();
  const colorId = useId();
  const transparent = isTransparentColor(value);
  const hex = toHexColor(value, "#ffffff");
  const [draft, setDraft] = useState(transparent ? "transparan" : hex);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDraft(transparent ? "transparan" : hex);
    }
  }, [focused, hex, transparent]);

  function handleTextChange(next: string) {
    setDraft(next);
    const cleaned = next.trim();
    if (cleaned.toLowerCase() === "transparan" || cleaned === "") {
      if (allowClear) onChange("");
      return;
    }
    if (
      /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cleaned) ||
      cleaned.startsWith("var(") ||
      cleaned.startsWith("rgb(") ||
      cleaned.startsWith("rgba(") ||
      cleaned.startsWith("hsl(")
    ) {
      onChange(cleaned);
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={inputId} className="text-[10px] font-medium text-zinc-400">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          <ResponsiveBadge scope="" overrides={overrides} />
          {allowClear && !transparent ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[9px] text-zinc-500 hover:text-zinc-300"
              title="Reset warna"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex h-7 items-center rounded-md border border-white/[0.08] bg-white/[0.025] px-1.5 transition-colors focus-within:border-[#3b82f6]/50 focus-within:bg-white/[0.04]">
        <label
          htmlFor={colorId}
          className="relative grid size-4.5 shrink-0 cursor-pointer place-items-center overflow-hidden rounded border border-white/20 shadow-sm"
          style={{
            backgroundColor: transparent ? "transparent" : hex,
            backgroundImage: transparent
              ? "linear-gradient(45deg, #27272a 25%, transparent 25%), linear-gradient(-45deg, #27272a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #27272a 75%), linear-gradient(-45deg, transparent 75%, #27272a 75%)"
              : undefined,
            backgroundSize: "6px 6px",
            backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0px",
          }}
          title="Buka pemilih warna"
        >
          <input
            id={colorId}
            type="color"
            value={hex}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </label>

        <input
          id={inputId}
          type="text"
          value={draft}
          spellCheck={false}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setDraft(transparent ? "transparan" : (value.startsWith("var(") ? value : hex));
          }}
          onChange={(e) => handleTextChange(e.target.value)}
          className="focus-ring min-w-0 flex-1 bg-transparent px-2 font-mono text-[10px] text-zinc-200 outline-none"
        />
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={cn(
                "size-3 rounded-full border border-white/20 transition-transform hover:scale-125",
                hex.toLowerCase() === preset.toLowerCase() && !transparent && "ring-1 ring-blue-400",
              )}
              style={{ backgroundColor: preset }}
              title={`Pilih ${preset}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-0.5">
          {DESIGN_TOKEN_SWATCHES.map((swatch) => (
            <button
              key={swatch.name}
              type="button"
              onClick={() => onChange(swatch.token)}
              className={cn(
                "px-1 py-0.5 text-[8.5px] font-mono rounded bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.1] transition",
                value === swatch.token && "bg-blue-500/20 text-blue-300 font-semibold",
              )}
              title={swatch.token}
            >
              {swatch.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AccordionSection({
  title,
  icon: Icon,
  isOpen,
  hasValue = false,
  badge,
  onToggle,
  children,
}: {
  title: string;
  icon: LucideIcon;
  isOpen: boolean;
  hasValue?: boolean;
  badge?: ReactNode;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-white/[0.06]">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-8.5 w-full items-center justify-between px-3 text-left transition hover:bg-white/[0.02]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Icon className="size-3.5 text-zinc-400" />
          <span className="text-[11px] font-medium text-zinc-200">{title}</span>
          {badge}
          {hasValue ? (
            <span className="size-1.5 rounded-full bg-blue-400" />
          ) : null}
        </div>
        {isOpen ? (
          <ChevronDown className="size-3 text-zinc-500" />
        ) : (
          <ChevronRight className="size-3 text-zinc-500" />
        )}
      </button>
      {isOpen && <div className="space-y-3 px-3 pb-3 pt-1">{children}</div>}
    </div>
  );
}

export default function PropertiesPanel({
  selection,
  mode,
  device,
  imagePaths,
  responsiveOverrides,
  onStyleChange,
  onTextChange,
  onHrefChange,
  onImageUpload,
  onImageSelect,
  onSelectParent,
  onSaveSection,
  onDelete,
  onClose,
}: {
  selection: SelectedElement | null;
  mode: "editing" | "viewing";
  device: "desktop" | "tablet" | "mobile";
  imagePaths: string[];
  responsiveOverrides?: Record<string, { tablet?: boolean; mobile?: boolean }>;
  onStyleChange: (
    styles: Partial<ElementStyle>,
    targetClass: string | null,
  ) => void;
  onTextChange: (text: string) => void;
  onHrefChange: (href: string) => void;
  onImageUpload: (file: File) => void;
  onImageSelect: (path: string) => void;
  onSelectParent: () => void;
  onSaveSection?: () => void;
  onDelete: () => void;
  onClose?: () => void;
}) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    layout: true,
    size: true,
    spacing: true,
    typography: true,
    background: false,
    border: false,
    effects: false,
    position: false,
    media: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const classes = selection?.className.trim().split(/\s+/).filter(Boolean) ?? [];
  const selectionId = selection?.id ?? "";
  const defaultClass = classes[0] ?? "";
  const [applyToClass, setApplyToClass] = useState(false);
  const [classTarget, setClassTarget] = useState(defaultClass);

  useEffect(() => {
    setApplyToClass(false);
    setClassTarget(defaultClass);
  }, [defaultClass, selectionId]);

  const activeClass =
    applyToClass && classes.includes(classTarget) ? classTarget : null;

  const currentWeight = selection?.style.fontWeight || "400";
  const weightOptions = FONT_WEIGHTS.some(
    (weight) => weight.value === currentWeight,
  )
    ? FONT_WEIGHTS
    : [
        {
          value: currentWeight,
          label: `Kustom (${currentWeight})`,
        },
        ...FONT_WEIGHTS,
      ];

  const canEditText =
    Boolean(selection) &&
    !selection?.hasChildren &&
    !["img", "input", "br", "hr", "video", "audio", "iframe"].includes(
      selection?.tag ?? "",
    );

  function updateStyle(key: StyleKey, value: string) {
    onStyleChange({ [key]: value }, activeClass);
  }

  function updateMultipleStyles(styles: Partial<ElementStyle>) {
    onStyleChange(styles, activeClass);
  }

  const s = selection?.style;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0d0d11]">
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.07] px-3">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-white/[0.04] text-zinc-400">
            <SlidersHorizontal className="size-3" />
          </span>
          <h2 className="text-xs font-semibold tracking-tight text-zinc-100">
            Inspector
          </h2>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[8.5px] font-medium tracking-wide",
              device === "desktop" && "bg-zinc-800 text-zinc-300",
              device === "tablet" && "bg-blue-500/20 text-blue-300",
              device === "mobile" && "bg-purple-500/20 text-purple-300",
            )}
          >
            {device.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {selection ? (
            <span className="flex items-center gap-1 rounded bg-[#3b82f6]/15 px-1.5 py-0.5 text-[8.5px] font-mono font-medium text-[#60a5fa]">
              <span className="size-1 rounded-full bg-[#3b82f6]" />
              &lt;{selection.tag}&gt;
            </span>
          ) : null}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="grid size-6.5 place-items-center rounded-md text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
              aria-label="Tutup inspector"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {!selection ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-3">
            <span className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-lg" />
            <span className="relative grid size-11 place-items-center rounded-xl border border-white/[0.08] bg-[#141418] text-zinc-400 shadow-lg">
              {mode === "viewing" ? (
                <Eye className="size-5" />
              ) : (
                <MousePointer2 className="size-5" />
              )}
            </span>
          </div>
          <h3 className="text-xs font-medium text-zinc-200">
            {mode === "viewing" ? "Mode Lihat Aktif" : "Belum Ada Elemen Terpilih"}
          </h3>
          <p className="mt-1.5 max-w-[200px] text-[11px] leading-4 text-zinc-500">
            {mode === "viewing"
              ? "Beralih ke mode Sunting untuk memilih dan memodifikasi elemen di preview."
              : "Klik elemen apa pun di preview atau pilih dari panel Layers."}
          </p>
          {mode === "editing" ? (
            <div className="mt-4 flex flex-col items-center gap-1 text-[9.5px] text-zinc-500">
              <span className="rounded border border-white/[0.07] bg-white/[0.02] px-2 py-1">
                Pilih teks di canvas untuk floating toolbar
              </span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Target Selector Banner */}
          <div className="border-b border-white/[0.07] bg-[#101015] p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Code2 className="size-3 text-blue-400" />
                  <span className="font-mono text-[11px] font-semibold text-blue-300">
                    &lt;{selection.tag}&gt;
                  </span>
                  <span className="rounded border border-white/[0.08] bg-white/[0.03] px-1 py-0.2 font-mono text-[8px] text-zinc-400">
                    {selection.style.display || "block"}
                  </span>
                </div>
                <p className="mt-0.5 truncate font-mono text-[9px] text-zinc-500">
                  {selection.className ? `.${selection.className}` : "tanpa class"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onSelectParent}
                  className="grid size-6 place-items-center rounded border border-white/[0.08] bg-white/[0.02] text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
                  title="Pilih parent"
                >
                  <CornerLeftUp className="size-3" />
                </button>
                {onSaveSection && (
                  <button
                    type="button"
                    data-testid="save-section-btn"
                    onClick={onSaveSection}
                    className="grid size-6 place-items-center rounded border border-white/[0.08] bg-white/[0.02] text-zinc-400 transition hover:bg-white/[0.06] hover:text-[#60a5fa]"
                    title="Simpan sebagai section reusable"
                  >
                    <BookmarkPlus className="size-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onDelete}
                  className="grid size-6 place-items-center rounded border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                  title="Hapus elemen"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>

            {/* Target Mode Toggle */}
            <div className="mt-2.5 grid grid-cols-2 gap-1 rounded-md border border-white/[0.07] bg-black/30 p-0.5">
              <button
                type="button"
                onClick={() => setApplyToClass(false)}
                className={cn(
                  "h-6 rounded text-[9.5px] font-medium transition",
                  !applyToClass
                    ? "bg-white/10 text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                Inline Style
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!classes.length) return;
                  setApplyToClass(true);
                  if (!classes.includes(classTarget)) {
                    setClassTarget(classes[0]);
                  }
                }}
                disabled={classes.length === 0}
                className={cn(
                  "h-6 rounded text-[9.5px] font-medium transition",
                  applyToClass
                    ? "bg-white/10 text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300",
                  classes.length === 0 && "cursor-not-allowed opacity-40",
                )}
              >
                Class CSS
              </button>
            </div>

            {applyToClass && classes.length > 0 ? (
              <div className="mt-2">
                <select
                  value={classTarget}
                  onChange={(e) => setClassTarget(e.target.value)}
                  className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      .{cls}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          {/* 1. LAYOUT */}
          <AccordionSection
            title="Tata Letak (Layout)"
            icon={Layout}
            isOpen={Boolean(openSections.layout)}
            hasValue={Boolean(s?.display && s?.display !== "block")}
            onToggle={() => toggleSection("layout")}
          >
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-medium text-zinc-400">
                  Display
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { value: "block", label: "Block" },
                    { value: "flex", label: "Flex" },
                    { value: "grid", label: "Grid" },
                    { value: "inline-block", label: "Inline-B" },
                    { value: "inline", label: "Inline" },
                    { value: "none", label: "Hidden" },
                  ].map((opt) => {
                    const active = (s?.display || "block").toLowerCase() === opt.value.toLowerCase();
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateStyle("display", opt.value)}
                        className={cn(
                          "h-6.5 rounded border border-white/[0.06] text-[10px] font-medium transition",
                          active
                            ? "border-blue-500/40 bg-blue-500/15 text-blue-300"
                            : "bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200",
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direction */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-400">
                  Direction
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { value: "ltr", label: "LTR (Kiri ke Kanan)" },
                    { value: "rtl", label: "RTL (Kanan ke Kiri)" },
                  ].map((item) => {
                    const active = (s?.direction || "ltr") === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => updateStyle("direction", item.value)}
                        className={cn(
                          "h-6 rounded border border-white/[0.06] text-[9.5px] transition",
                          active
                            ? "bg-blue-500/20 text-blue-300 font-semibold"
                            : "bg-white/[0.02] text-zinc-400 hover:text-zinc-200",
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Flexbox Settings */}
              {(s?.display || "").toLowerCase() === "flex" ? (
                <div className="space-y-2.5 rounded-lg border border-blue-500/20 bg-blue-500/[0.03] p-2.5">
                  <span className="block text-[9.5px] font-bold uppercase tracking-wider text-blue-400">
                    Flexbox
                  </span>

                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Direction
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { value: "row", label: "Row →" },
                        { value: "column", label: "Col ↓" },
                        { value: "row-reverse", label: "Row ←" },
                        { value: "column-reverse", label: "Col ↑" },
                      ].map((item) => {
                        const active = (s?.flexDirection || "row") === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => updateStyle("flexDirection", item.value)}
                            className={cn(
                              "h-6 rounded border border-white/[0.06] text-[9.5px] transition",
                              active
                                ? "bg-blue-500/20 text-blue-300 font-semibold"
                                : "bg-white/[0.02] text-zinc-400 hover:text-zinc-200",
                            )}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Flex Wrap
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { value: "nowrap", label: "No Wrap" },
                        { value: "wrap", label: "Wrap" },
                        { value: "wrap-reverse", label: "Wrap-Rev" },
                      ].map((item) => {
                        const active = (s?.flexWrap || "nowrap") === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => updateStyle("flexWrap", item.value)}
                            className={cn(
                              "h-6 rounded border border-white/[0.06] text-[9.5px] transition",
                              active
                                ? "bg-blue-500/20 text-blue-300 font-semibold"
                                : "bg-white/[0.02] text-zinc-400 hover:text-zinc-200",
                            )}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Justify Content
                    </label>
                    <select
                      value={s?.justifyContent || "flex-start"}
                      onChange={(e) => updateStyle("justifyContent", e.target.value)}
                      className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                    >
                      <option value="flex-start">Flex Start (Awal)</option>
                      <option value="center">Center (Tengah)</option>
                      <option value="flex-end">Flex End (Akhir)</option>
                      <option value="space-between">Space Between</option>
                      <option value="space-around">Space Around</option>
                      <option value="space-evenly">Space Evenly</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Align Items
                    </label>
                    <select
                      value={s?.alignItems || "stretch"}
                      onChange={(e) => updateStyle("alignItems", e.target.value)}
                      className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                    >
                      <option value="stretch">Stretch</option>
                      <option value="flex-start">Flex Start</option>
                      <option value="center">Center</option>
                      <option value="flex-end">Flex End</option>
                      <option value="baseline">Baseline</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Align Self
                    </label>
                    <select
                      value={s?.alignSelf || "auto"}
                      onChange={(e) => updateStyle("alignSelf", e.target.value)}
                      className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                    >
                      <option value="auto">Auto</option>
                      <option value="flex-start">Flex Start</option>
                      <option value="center">Center</option>
                      <option value="flex-end">Flex End</option>
                      <option value="stretch">Stretch</option>
                      <option value="baseline">Baseline</option>
                    </select>
                  </div>

                  <StepperInput
                    label="Gap"
                    value={s?.gap || ""}
                    placeholder="0px"
                    step={2}
                    overrides={responsiveOverrides?.gap}
                    onChange={(val) => updateStyle("gap", val)}
                  />
                </div>
              ) : null}

              {/* Grid Settings */}
              {(s?.display || "").toLowerCase() === "grid" ? (
                <div className="space-y-2.5 rounded-lg border border-purple-500/20 bg-purple-500/[0.03] p-2.5">
                  <span className="block text-[9.5px] font-bold uppercase tracking-wider text-purple-400">
                    CSS Grid
                  </span>

                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Grid Template Columns
                    </label>
                    <div className="grid grid-cols-3 gap-1 mb-1.5">
                      {[
                        { value: "1fr", label: "1 Kolom" },
                        { value: "repeat(2, 1fr)", label: "2 Kolom" },
                        { value: "repeat(3, 1fr)", label: "3 Kolom" },
                        { value: "repeat(4, 1fr)", label: "4 Kolom" },
                        { value: "repeat(6, 1fr)", label: "6 Kolom" },
                        { value: "repeat(12, 1fr)", label: "12 Kolom" },
                      ].map((col) => {
                        const active = s?.gridTemplateColumns === col.value;
                        return (
                          <button
                            key={col.value}
                            type="button"
                            onClick={() => updateStyle("gridTemplateColumns", col.value)}
                            className={cn(
                              "h-6 rounded border border-white/[0.06] text-[9.5px] transition",
                              active
                                ? "bg-purple-500/20 text-purple-300 font-semibold"
                                : "bg-white/[0.02] text-zinc-400 hover:text-zinc-200",
                            )}
                          >
                            {col.label}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      type="text"
                      value={s?.gridTemplateColumns || ""}
                      onChange={(e) => updateStyle("gridTemplateColumns", e.target.value)}
                      placeholder="Kustom kolom (mis: 200px 1fr)"
                      className={FIELD_CLASS}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Grid Template Rows
                    </label>
                    <input
                      type="text"
                      value={s?.gridTemplateRows || ""}
                      onChange={(e) => updateStyle("gridTemplateRows", e.target.value)}
                      placeholder="Kustom baris (mis: auto 1fr)"
                      className={FIELD_CLASS}
                    />
                  </div>

                  <StepperInput
                    label="Gap"
                    value={s?.gap || ""}
                    placeholder="0px"
                    step={2}
                    overrides={responsiveOverrides?.gap}
                    onChange={(val) => updateStyle("gap", val)}
                  />
                </div>
              ) : null}
            </div>
          </AccordionSection>

          {/* 2. SIZE */}
          <AccordionSection
            title="Ukuran (Size)"
            icon={Maximize2}
            isOpen={Boolean(openSections.size)}
            hasValue={Boolean(s?.width || s?.height || s?.minWidth || s?.maxWidth)}
            onToggle={() => toggleSection("size")}
          >
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <StepperInput
                  label="Width (Lebar)"
                  value={s?.width || ""}
                  placeholder="auto"
                  step={4}
                  overrides={responsiveOverrides?.width}
                  onChange={(val) => updateStyle("width", val)}
                />
                <StepperInput
                  label="Height (Tinggi)"
                  value={s?.height || ""}
                  placeholder="auto"
                  step={4}
                  overrides={responsiveOverrides?.height}
                  onChange={(val) => updateStyle("height", val)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <StepperInput
                  label="Min Width"
                  value={s?.minWidth || ""}
                  placeholder="0px"
                  step={4}
                  overrides={responsiveOverrides?.minWidth}
                  onChange={(val) => updateStyle("minWidth", val)}
                />
                <StepperInput
                  label="Max Width"
                  value={s?.maxWidth || ""}
                  placeholder="none"
                  step={4}
                  overrides={responsiveOverrides?.maxWidth}
                  onChange={(val) => updateStyle("maxWidth", val)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <StepperInput
                  label="Min Height"
                  value={s?.minHeight || ""}
                  placeholder="0px"
                  step={4}
                  overrides={responsiveOverrides?.minHeight}
                  onChange={(val) => updateStyle("minHeight", val)}
                />
                <StepperInput
                  label="Max Height"
                  value={s?.maxHeight || ""}
                  placeholder="none"
                  step={4}
                  overrides={responsiveOverrides?.maxHeight}
                  onChange={(val) => updateStyle("maxHeight", val)}
                />
              </div>
            </div>
          </AccordionSection>

          {/* 3. SPACING */}
          <AccordionSection
            title="Spasi (Spacing)"
            icon={Box}
            isOpen={Boolean(openSections.spacing)}
            hasValue={Boolean(
              s?.margin || s?.marginTop || s?.padding || s?.paddingTop,
            )}
            onToggle={() => toggleSection("spacing")}
          >
            <div className="space-y-3">
              <FourSidesInput
                label="Margin (Spasi Luar)"
                top={s?.marginTop || ""}
                right={s?.marginRight || ""}
                bottom={s?.marginBottom || ""}
                left={s?.marginLeft || ""}
                all={s?.margin || ""}
                onChangeAll={(val) =>
                  updateMultipleStyles({
                    margin: val,
                    marginTop: "",
                    marginRight: "",
                    marginBottom: "",
                    marginLeft: "",
                  })
                }
                onChangeSide={(side, val) =>
                  updateStyle(`margin${side}` as StyleKey, val)
                }
              />

              <FourSidesInput
                label="Padding (Spasi Dalam)"
                top={s?.paddingTop || ""}
                right={s?.paddingRight || ""}
                bottom={s?.paddingBottom || ""}
                left={s?.paddingLeft || ""}
                all={s?.padding || ""}
                onChangeAll={(val) =>
                  updateMultipleStyles({
                    padding: val,
                    paddingTop: "",
                    paddingRight: "",
                    paddingBottom: "",
                    paddingLeft: "",
                  })
                }
                onChangeSide={(side, val) =>
                  updateStyle(`padding${side}` as StyleKey, val)
                }
              />
            </div>
          </AccordionSection>

          {/* 4. TYPOGRAPHY */}
          <AccordionSection
            title="Tipografi (Typography)"
            icon={Type}
            isOpen={Boolean(openSections.typography)}
            hasValue={Boolean(s?.fontSize || s?.fontFamily || s?.color)}
            onToggle={() => toggleSection("typography")}
          >
            <div className="space-y-3">
              {/* Font Family */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[10px] font-medium text-zinc-400">
                    Font Family
                  </label>
                  <ResponsiveBadge scope="" overrides={responsiveOverrides?.fontFamily} />
                </div>
                <select
                  value={s?.fontFamily || ""}
                  onChange={(e) => updateStyle("fontFamily", e.target.value)}
                  className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                >
                  {POPULAR_FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size & Weight */}
              <div className="grid grid-cols-2 gap-2">
                <StepperInput
                  label="Ukuran Font"
                  value={s?.fontSize || ""}
                  placeholder="16px"
                  step={1}
                  min={8}
                  overrides={responsiveOverrides?.fontSize}
                  onChange={(val) => updateStyle("fontSize", val)}
                />

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-[10px] font-medium text-zinc-400">
                      Ketebalan
                    </label>
                    <ResponsiveBadge scope="" overrides={responsiveOverrides?.fontWeight} />
                  </div>
                  <select
                    value={currentWeight}
                    onChange={(e) => updateStyle("fontWeight", e.target.value)}
                    className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                  >
                    {weightOptions.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Line Height & Letter Spacing */}
              <div className="grid grid-cols-2 gap-2">
                <StepperInput
                  label="Line Height"
                  value={s?.lineHeight || ""}
                  placeholder="normal"
                  step={0.1}
                  overrides={responsiveOverrides?.lineHeight}
                  onChange={(val) => updateStyle("lineHeight", val)}
                />
                <StepperInput
                  label="Letter Spacing"
                  value={s?.letterSpacing || ""}
                  placeholder="normal"
                  step={0.5}
                  overrides={responsiveOverrides?.letterSpacing}
                  onChange={(val) => updateStyle("letterSpacing", val)}
                />
              </div>

              {/* Text Align */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-400">
                  Perataan Teks (Text Align)
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { value: "left", icon: AlignLeft, label: "Kiri" },
                    { value: "center", icon: AlignCenter, label: "Tengah" },
                    { value: "right", icon: AlignRight, label: "Kanan" },
                    { value: "justify", icon: AlignJustify, label: "Rata" },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = (s?.textAlign || "left").toLowerCase() === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => updateStyle("textAlign", item.value)}
                        className={cn(
                          "flex h-7 items-center justify-center rounded border border-white/[0.06] text-[10px] transition",
                          active
                            ? "bg-blue-500/20 text-blue-300 font-semibold"
                            : "bg-white/[0.02] text-zinc-400 hover:text-zinc-200",
                        )}
                        title={item.label}
                      >
                        <Icon className="size-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Decoration & Transform */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-400">
                    Dekorasi
                  </label>
                  <select
                    value={s?.textDecoration || "none"}
                    onChange={(e) => updateStyle("textDecoration", e.target.value)}
                    className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                  >
                    <option value="none">None</option>
                    <option value="underline">Underline</option>
                    <option value="line-through">Line-Through</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-400">
                    Transformasi
                  </label>
                  <select
                    value={s?.textTransform || "none"}
                    onChange={(e) => updateStyle("textTransform", e.target.value)}
                    className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                  >
                    <option value="none">None</option>
                    <option value="uppercase">UPPERCASE</option>
                    <option value="lowercase">lowercase</option>
                    <option value="capitalize">Capitalize</option>
                  </select>
                </div>
              </div>

              <ColorField
                label="Warna Teks"
                value={s?.color || ""}
                overrides={responsiveOverrides?.color}
                onChange={(val) => updateStyle("color", val)}
              />
            </div>
          </AccordionSection>

          {/* 5. BACKGROUND */}
          <AccordionSection
            title="Latar Belakang (Background)"
            icon={Palette}
            isOpen={Boolean(openSections.background)}
            hasValue={Boolean(s?.backgroundColor || s?.backgroundImage)}
            onToggle={() => toggleSection("background")}
          >
            <div className="space-y-3">
              <ColorField
                label="Warna Latar (Background Color)"
                value={s?.backgroundColor || ""}
                allowClear
                overrides={responsiveOverrides?.backgroundColor}
                onChange={(val) => updateStyle("backgroundColor", val)}
              />

              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-400">
                  Gambar / Gradasi Latar (Background Image)
                </label>
                <input
                  type="text"
                  value={s?.backgroundImage || ""}
                  onChange={(e) => updateStyle("backgroundImage", e.target.value)}
                  placeholder="linear-gradient(...) atau url(...)"
                  className={FIELD_CLASS}
                />
              </div>

              {s?.backgroundImage ? (
                <div className="space-y-2 rounded-lg border border-white/[0.06] bg-black/20 p-2.5">
                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Background Size
                    </label>
                    <select
                      value={s?.backgroundSize || "auto"}
                      onChange={(e) => updateStyle("backgroundSize", e.target.value)}
                      className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                    >
                      <option value="auto">Auto</option>
                      <option value="cover">Cover (Penuh)</option>
                      <option value="contain">Contain (Muat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Background Position
                    </label>
                    <select
                      value={s?.backgroundPosition || "center"}
                      onChange={(e) => updateStyle("backgroundPosition", e.target.value)}
                      className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Background Repeat
                    </label>
                    <select
                      value={s?.backgroundRepeat || "repeat"}
                      onChange={(e) => updateStyle("backgroundRepeat", e.target.value)}
                      className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                    >
                      <option value="no-repeat">No Repeat</option>
                      <option value="repeat">Repeat</option>
                      <option value="repeat-x">Repeat X</option>
                      <option value="repeat-y">Repeat Y</option>
                    </select>
                  </div>
                </div>
              ) : null}
            </div>
          </AccordionSection>

          {/* 6. BORDER */}
          <AccordionSection
            title="Border & Radius"
            icon={Square}
            isOpen={Boolean(openSections.border)}
            hasValue={Boolean(s?.borderWidth || s?.borderRadius)}
            onToggle={() => toggleSection("border")}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <StepperInput
                  label="Ketebalan Border"
                  value={s?.borderWidth || ""}
                  placeholder="0px"
                  step={1}
                  overrides={responsiveOverrides?.borderWidth}
                  onChange={(val) => updateStyle("borderWidth", val)}
                />

                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-400">
                    Gaya Border
                  </label>
                  <select
                    value={s?.borderStyle || "none"}
                    onChange={(e) => updateStyle("borderStyle", e.target.value)}
                    className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                  >
                    <option value="none">None</option>
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="double">Double</option>
                  </select>
                </div>
              </div>

              <ColorField
                label="Warna Border"
                value={s?.borderColor || ""}
                allowClear
                overrides={responsiveOverrides?.borderColor}
                onChange={(val) => updateStyle("borderColor", val)}
              />

              <FourCornersRadiusInput
                label="Radius Sudut"
                all={s?.borderRadius || ""}
                topLeft={s?.borderTopLeftRadius || ""}
                topRight={s?.borderTopRightRadius || ""}
                bottomRight={s?.borderBottomRightRadius || ""}
                bottomLeft={s?.borderBottomLeftRadius || ""}
                onChangeAll={(val) =>
                  updateMultipleStyles({
                    borderRadius: val,
                    borderTopLeftRadius: "",
                    borderTopRightRadius: "",
                    borderBottomRightRadius: "",
                    borderBottomLeftRadius: "",
                  })
                }
                onChangeCorner={(corner, val) => updateStyle(corner, val)}
              />
            </div>
          </AccordionSection>

          {/* 7. EFFECTS */}
          <AccordionSection
            title="Efek (Effects)"
            icon={Sparkles}
            isOpen={Boolean(openSections.effects)}
            hasValue={Boolean(s?.boxShadow || s?.opacity || s?.transform || s?.filter)}
            onToggle={() => toggleSection("effects")}
          >
            <div className="space-y-3">
              {/* Opacity */}
              <StepperInput
                label="Opasitas (0 - 1)"
                value={s?.opacity || ""}
                placeholder="1"
                step={0.1}
                min={0}
                max={1}
                overrides={responsiveOverrides?.opacity}
                onChange={(val) => updateStyle("opacity", val)}
              />

              {/* Box Shadow */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-400">
                  Box Shadow (Bayangan)
                </label>
                <select
                  value={
                    SHADOW_PRESETS.some((p) => p.value === s?.boxShadow)
                      ? s?.boxShadow || ""
                      : "custom"
                  }
                  onChange={(e) => {
                    if (e.target.value !== "custom") {
                      updateStyle("boxShadow", e.target.value);
                    }
                  }}
                  className={cn(FIELD_CLASS, "cursor-pointer appearance-none mb-1.5")}
                >
                  {SHADOW_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                  <option value="custom">Kustom...</option>
                </select>
                <input
                  type="text"
                  value={s?.boxShadow || ""}
                  onChange={(e) => updateStyle("boxShadow", e.target.value)}
                  placeholder="Kustom shadow (mis: 0 4px 12px rgba(0,0,0,0.15))"
                  className={FIELD_CLASS}
                />
              </div>

              {/* Transform */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-400">
                  Transform
                </label>
                <input
                  type="text"
                  value={s?.transform || ""}
                  onChange={(e) => updateStyle("transform", e.target.value)}
                  placeholder="scale(1.05), rotate(5deg), etc."
                  className={FIELD_CLASS}
                />
              </div>

              {/* Transition */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-400">
                  Transition (Transisi)
                </label>
                <select
                  value={
                    TRANSITION_PRESETS.some((p) => p.value === s?.transition)
                      ? s?.transition || ""
                      : "custom"
                  }
                  onChange={(e) => {
                    if (e.target.value !== "custom") {
                      updateStyle("transition", e.target.value);
                    }
                  }}
                  className={cn(FIELD_CLASS, "cursor-pointer appearance-none mb-1.5")}
                >
                  {TRANSITION_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                  <option value="custom">Kustom...</option>
                </select>
                <input
                  type="text"
                  value={s?.transition || ""}
                  onChange={(e) => updateStyle("transition", e.target.value)}
                  placeholder="mis: all 200ms ease"
                  className={FIELD_CLASS}
                />
              </div>

              {/* Filter */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-400">
                  Filter Efek
                </label>
                <input
                  type="text"
                  value={s?.filter || ""}
                  onChange={(e) => updateStyle("filter", e.target.value)}
                  placeholder="blur(4px), grayscale(100%), etc."
                  className={FIELD_CLASS}
                />
              </div>
            </div>
          </AccordionSection>

          {/* 8. POSITION */}
          <AccordionSection
            title="Posisi (Position)"
            icon={Move}
            isOpen={Boolean(openSections.position)}
            hasValue={Boolean(s?.position && s?.position !== "static")}
            onToggle={() => toggleSection("position")}
          >
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-400">
                  Position Type
                </label>
                <select
                  value={s?.position || "static"}
                  onChange={(e) => updateStyle("position", e.target.value)}
                  className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                >
                  <option value="static">Static (Default)</option>
                  <option value="relative">Relative</option>
                  <option value="absolute">Absolute</option>
                  <option value="fixed">Fixed</option>
                  <option value="sticky">Sticky</option>
                </select>
              </div>

              {s?.position && s.position !== "static" ? (
                <div className="space-y-2 rounded-lg border border-white/[0.06] bg-black/20 p-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <StepperInput
                      label="Top"
                      value={s?.top || ""}
                      placeholder="auto"
                      step={2}
                      overrides={responsiveOverrides?.top}
                      onChange={(val) => updateStyle("top", val)}
                    />
                    <StepperInput
                      label="Right"
                      value={s?.right || ""}
                      placeholder="auto"
                      step={2}
                      overrides={responsiveOverrides?.right}
                      onChange={(val) => updateStyle("right", val)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <StepperInput
                      label="Bottom"
                      value={s?.bottom || ""}
                      placeholder="auto"
                      step={2}
                      overrides={responsiveOverrides?.bottom}
                      onChange={(val) => updateStyle("bottom", val)}
                    />
                    <StepperInput
                      label="Left"
                      value={s?.left || ""}
                      placeholder="auto"
                      step={2}
                      overrides={responsiveOverrides?.left}
                      onChange={(val) => updateStyle("left", val)}
                    />
                  </div>

                  <StepperInput
                    label="Z-Index"
                    value={s?.zIndex || ""}
                    placeholder="auto"
                    step={1}
                    overrides={responsiveOverrides?.zIndex}
                    onChange={(val) => updateStyle("zIndex", val)}
                  />
                </div>
              ) : null}
            </div>
          </AccordionSection>

          {/* 9. MEDIA & CONTENT */}
          <AccordionSection
            title="Konten & Tautan"
            icon={Link2}
            isOpen={Boolean(openSections.media)}
            hasValue={Boolean(selection.href || selection.src || selection.text)}
            onToggle={() => toggleSection("media")}
          >
            <div className="space-y-3">
              {/* Text content if editable */}
              {canEditText ? (
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-zinc-400">
                    Konten Teks
                  </label>
                  <textarea
                    ref={textAreaRef}
                    value={selection.text}
                    onChange={(e) => onTextChange(e.target.value)}
                    rows={3}
                    maxLength={100_000}
                    placeholder="Teks konten..."
                    className="focus-ring block min-h-[58px] w-full resize-y rounded-md border border-white/[0.08] bg-white/[0.025] p-2 text-[10.5px] leading-4 text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-[#3b82f6]/50 focus:bg-white/[0.04]"
                  />
                </div>
              ) : null}

              {/* Link input */}
              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-400">
                  Href (Tautan Link)
                </label>
                <input
                  value={selection.href}
                  onChange={(e) => onHrefChange(e.target.value)}
                  placeholder="#bagian atau https://..."
                  spellCheck={false}
                  className={FIELD_CLASS}
                />
              </div>

              {/* Image input if img tag */}
              {selection.tag === "img" ? (
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <label className="block text-[10px] font-medium text-zinc-400">
                    Sumber Gambar (src)
                  </label>
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif,image/x-icon,image/bmp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) onImageUpload(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    className="focus-ring flex h-7.5 w-full items-center justify-center gap-1.5 rounded-md border border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[10px] font-medium text-[#93c5fd] transition hover:bg-[#3b82f6]/20"
                  >
                    <Upload className="size-3" />
                    Upload Gambar Baru
                  </button>

                  {imagePaths.length > 0 ? (
                    <div>
                      <label className="mb-1 block text-[9.5px] text-zinc-500">
                        Atau pilih dari aset proyek
                      </label>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) onImageSelect(e.target.value);
                        }}
                        className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                      >
                        <option value="">Pilih gambar...</option>
                        {imagePaths.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </AccordionSection>
        </div>
      )}

      {selection ? (
        <div className="flex h-7 shrink-0 items-center justify-between border-t border-white/[0.07] px-3 font-mono text-[9px] text-zinc-500">
          <span>{selection.id}</span>
          <span className="flex items-center gap-1 text-emerald-400/80">
            <span className="size-1 rounded-full bg-emerald-400" />
            Live sync
          </span>
        </div>
      ) : null}
    </div>
  );
}
