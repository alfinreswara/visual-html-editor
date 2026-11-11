"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  Box,
  ChevronDown,
  ChevronRight,
  Circle,
  Code2,
  CornerLeftUp,
  Eye,
  Image as ImageIcon,
  Layout,
  Link2,
  Maximize2,
  Minus,
  MousePointer2,
  Palette,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Square,
  Trash2,
  Type,
  Upload,
  X,
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

const DISPLAY_OPTIONS = [
  { value: "block", label: "Block" },
  { value: "flex", label: "Flex" },
  { value: "grid", label: "Grid" },
  { value: "inline-block", label: "Inline-B" },
  { value: "inline", label: "Inline" },
  { value: "none", label: "Hidden" },
];

function parseNumericWithUnit(val: string): { num: number; unit: string } {
  const match = val.trim().match(/^(-?\d+(?:\.\d+)?)\s*([a-z%]*)$/i);
  if (!match) return { num: 0, unit: "px" };
  return { num: parseFloat(match[1]) || 0, unit: match[2] || "px" };
}

function StepperInput({
  label,
  value,
  placeholder,
  step = 2,
  min = 0,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  step?: number;
  min?: number;
  onChange: (val: string) => void;
}) {
  const inputId = useId();

  function adjust(delta: number) {
    const { num, unit } = parseNumericWithUnit(value || "0");
    const next = Math.max(min, num + delta);
    onChange(`${next}${unit || "px"}`);
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={inputId} className="text-[10px] font-medium text-zinc-400">
          {label}
        </label>
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

function ColorField({
  label,
  value,
  onChange,
  allowClear = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowClear?: boolean;
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
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cleaned)) {
      onChange(cleaned);
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={inputId} className="text-[10px] font-medium text-zinc-400">
          {label}
        </label>
        {allowClear && !transparent ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[9px] text-zinc-500 hover:text-zinc-300"
            title="Hapus background (transparan)"
          >
            Reset
          </button>
        ) : null}
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
            setDraft(transparent ? "transparan" : hex);
          }}
          onChange={(e) => handleTextChange(e.target.value)}
          className="focus-ring min-w-0 flex-1 bg-transparent px-2 font-mono text-[10px] text-zinc-200 outline-none"
        />
      </div>

      {/* Preset Swatches */}
      <div className="mt-1.5 flex items-center gap-1">
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
    </div>
  );
}

function AccordionSection({
  id,
  title,
  icon: Icon,
  isOpen,
  hasValue = false,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  icon: typeof Type;
  isOpen: boolean;
  hasValue?: boolean;
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
  onStyleChange,
  onTextChange,
  onHrefChange,
  onImageUpload,
  onImageSelect,
  onSelectParent,
  onDelete,
  onClose,
}: {
  selection: SelectedElement | null;
  mode: "editing" | "viewing";
  device: "desktop" | "tablet" | "mobile";
  imagePaths: string[];
  onStyleChange: (
    styles: Partial<ElementStyle>,
    targetClass: string | null,
  ) => void;
  onTextChange: (text: string) => void;
  onHrefChange: (href: string) => void;
  onImageUpload: (file: File) => void;
  onImageSelect: (path: string) => void;
  onSelectParent: () => void;
  onDelete: () => void;
  onClose?: () => void;
}) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    text: true,
    spacing: true,
    colors: true,
    borders: true,
    display: true,
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
                Klik dua kali teks untuk edit inline
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

          {/* 1. TEKS */}
          <AccordionSection
            id="text"
            title="Teks"
            icon={Type}
            isOpen={Boolean(openSections.text)}
            hasValue={Boolean(selection.style.fontSize || selection.text)}
            onToggle={() => toggleSection("text")}
          >
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

            <div className="grid grid-cols-2 gap-2">
              <StepperInput
                label="Ukuran Font"
                value={selection.style.fontSize}
                placeholder="16px"
                step={1}
                min={8}
                onChange={(val) => updateStyle("fontSize", val)}
              />

              <div>
                <label className="mb-1 block text-[10px] font-medium text-zinc-400">
                  Ketebalan
                </label>
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

            <ColorField
              label="Warna Teks"
              value={selection.style.color}
              onChange={(val) => updateStyle("color", val)}
            />
          </AccordionSection>

          {/* 2. UKURAN DAN SPASI */}
          <AccordionSection
            id="spacing"
            title="Ukuran dan Spasi"
            icon={Maximize2}
            isOpen={Boolean(openSections.spacing)}
            hasValue={Boolean(selection.style.padding || selection.style.margin)}
            onToggle={() => toggleSection("spacing")}
          >
            <div className="grid grid-cols-2 gap-2">
              <StepperInput
                label="Padding (Spasi Dalam)"
                value={selection.style.padding}
                placeholder="0px"
                step={2}
                onChange={(val) => updateStyle("padding", val)}
              />
              <StepperInput
                label="Margin (Spasi Luar)"
                value={selection.style.margin}
                placeholder="0px"
                step={2}
                onChange={(val) => updateStyle("margin", val)}
              />
            </div>
          </AccordionSection>

          {/* 3. WARNA */}
          <AccordionSection
            id="colors"
            title="Warna"
            icon={Palette}
            isOpen={Boolean(openSections.colors)}
            hasValue={Boolean(
              selection.style.color || selection.style.backgroundColor,
            )}
            onToggle={() => toggleSection("colors")}
          >
            <div className="space-y-3">
              <ColorField
                label="Warna Teks"
                value={selection.style.color}
                onChange={(val) => updateStyle("color", val)}
              />
              <ColorField
                label="Warna Latar (Background)"
                value={selection.style.backgroundColor}
                onChange={(val) => updateStyle("backgroundColor", val)}
                allowClear
              />
            </div>
          </AccordionSection>

          {/* 4. BORDER DAN RADIUS */}
          <AccordionSection
            id="borders"
            title="Border dan Radius"
            icon={Square}
            isOpen={Boolean(openSections.borders)}
            hasValue={Boolean(selection.style.borderRadius)}
            onToggle={() => toggleSection("borders")}
          >
            <StepperInput
              label="Radius Sudut"
              value={selection.style.borderRadius}
              placeholder="0px"
              step={2}
              onChange={(val) => updateStyle("borderRadius", val)}
            />
          </AccordionSection>

          {/* 5. TAMPILAN & TATA LETAK */}
          <AccordionSection
            id="display"
            title="Tampilan & Tata Letak"
            icon={Layout}
            isOpen={Boolean(openSections.display)}
            hasValue={Boolean(selection.style.display && selection.style.display !== "block")}
            onToggle={() => toggleSection("display")}
          >
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-medium text-zinc-400">
                  Display Mode
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { value: "block", label: "Block" },
                    { value: "flex", label: "Flex" },
                    { value: "grid", label: "Grid" },
                    { value: "inline-block", label: "Inline" },
                  ].map((opt) => {
                    const active =
                      (selection.style.display || "block").toLowerCase() ===
                      opt.value.toLowerCase();
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

              {/* Kontrol Flexbox */}
              {(selection.style.display || "").toLowerCase() === "flex" ? (
                <div className="space-y-2.5 rounded-lg border border-blue-500/20 bg-blue-500/[0.03] p-2.5">
                  <span className="block text-[9.5px] font-bold uppercase tracking-wider text-blue-400">
                    Pengaturan Flexbox
                  </span>

                  {/* Arah Flex */}
                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Arah (Direction)
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { value: "row", label: "Row →" },
                        { value: "column", label: "Col ↓" },
                        { value: "row-reverse", label: "Row ←" },
                        { value: "column-reverse", label: "Col ↑" },
                      ].map((item) => {
                        const active = (selection.style.flexDirection || "row") === item.value;
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

                  {/* Wrap */}
                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Bungkus Baris (Flex Wrap)
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { value: "nowrap", label: "No Wrap (1 Baris)" },
                        { value: "wrap", label: "Wrap (Multi Baris)" },
                      ].map((item) => {
                        const active = (selection.style.flexWrap || "nowrap") === item.value;
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

                  {/* Align Items */}
                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Perataan Silang (Align Items)
                    </label>
                    <select
                      value={selection.style.alignItems || "stretch"}
                      onChange={(e) => updateStyle("alignItems", e.target.value)}
                      className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                    >
                      <option value="stretch">Stretch (Penuh)</option>
                      <option value="flex-start">Start (Awal)</option>
                      <option value="center">Center (Tengah)</option>
                      <option value="flex-end">End (Akhir)</option>
                      <option value="baseline">Baseline</option>
                    </select>
                  </div>

                  {/* Justify Content */}
                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Distribusi Utama (Justify Content)
                    </label>
                    <select
                      value={selection.style.justifyContent || "flex-start"}
                      onChange={(e) => updateStyle("justifyContent", e.target.value)}
                      className={cn(FIELD_CLASS, "cursor-pointer appearance-none")}
                    >
                      <option value="flex-start">Start (Rata Kiri/Awal)</option>
                      <option value="center">Center (Tengah)</option>
                      <option value="flex-end">End (Rata Kanan/Akhir)</option>
                      <option value="space-between">Space Between (Ujung ke Ujung)</option>
                      <option value="space-around">Space Around</option>
                      <option value="space-evenly">Space Evenly (Jarak Rata)</option>
                    </select>
                  </div>

                  {/* Gap Stepper */}
                  <StepperInput
                    label="Jarak Antar Item (Gap)"
                    value={selection.style.gap}
                    placeholder="0px"
                    step={2}
                    onChange={(val) => updateStyle("gap", val)}
                  />
                </div>
              ) : null}

              {/* Kontrol CSS Grid */}
              {(selection.style.display || "").toLowerCase() === "grid" ? (
                <div className="space-y-2.5 rounded-lg border border-purple-500/20 bg-purple-500/[0.03] p-2.5">
                  <span className="block text-[9.5px] font-bold uppercase tracking-wider text-purple-400">
                    Pengaturan CSS Grid
                  </span>

                  {/* Jumlah Kolom */}
                  <div>
                    <label className="mb-1 block text-[9.5px] text-zinc-400">
                      Jumlah Kolom (Grid Columns)
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { value: "1fr", label: "1 Kolom" },
                        { value: "repeat(2, 1fr)", label: "2 Kolom" },
                        { value: "repeat(3, 1fr)", label: "3 Kolom" },
                        { value: "repeat(4, 1fr)", label: "4 Kolom" },
                        { value: "repeat(6, 1fr)", label: "6 Kolom" },
                        { value: "repeat(12, 1fr)", label: "12 Kolom" },
                      ].map((col) => {
                        const active = selection.style.gridTemplateColumns === col.value;
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
                    <div className="mt-1.5">
                      <input
                        type="text"
                        value={selection.style.gridTemplateColumns || ""}
                        onChange={(e) => updateStyle("gridTemplateColumns", e.target.value)}
                        placeholder="Kustom (mis: 200px 1fr 2fr)"
                        className={FIELD_CLASS}
                      />
                    </div>
                  </div>

                  {/* Gap Stepper */}
                  <StepperInput
                    label="Jarak Antar Kolom/Baris (Gap)"
                    value={selection.style.gap}
                    placeholder="0px"
                    step={2}
                    onChange={(val) => updateStyle("gap", val)}
                  />
                </div>
              ) : null}
            </div>
          </AccordionSection>

          {/* 6. LINK DAN GAMBAR */}
          <AccordionSection
            id="media"
            title="Link dan Gambar"
            icon={Link2}
            isOpen={Boolean(openSections.media)}
            hasValue={Boolean(selection.href || selection.src)}
            onToggle={() => toggleSection("media")}
          >
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
