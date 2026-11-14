"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { loader, type BeforeMount, type OnMount } from "@monaco-editor/react";
import { Braces, CheckCircle2 } from "lucide-react";
import { languageLabelForPath } from "@/lib/project-files";

loader.config({ paths: { vs: "/monaco/vs" } });

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((module) => module.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#0b0b0e]">
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-600">
          <span className="size-3 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-400" />
          Memuat editor kode...
        </div>
      </div>
    ),
  },
);

const defineTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("kanvas-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "tag", foreground: "7fa7ff" },
      { token: "tag.id", foreground: "8fd4ff" },
      { token: "metatag", foreground: "8b8b98" },
      { token: "attribute.name", foreground: "b4a2ff" },
      { token: "attribute.value", foreground: "9fd8af" },
      { token: "string", foreground: "9fd8af" },
      { token: "number", foreground: "f1bd7c" },
      { token: "comment", foreground: "5a5a65", fontStyle: "italic" },
      { token: "delimiter", foreground: "777783" },
      { token: "keyword", foreground: "8db4ff" },
      { token: "attribute.value.number.css", foreground: "f1bd7c" },
      { token: "attribute.value.unit.css", foreground: "f1bd7c" },
      { token: "attribute.value.hex.css", foreground: "9fd8af" },
    ],
    colors: {
      "editor.background": "#0b0b0e",
      "editor.foreground": "#d8d8df",
      "editorGutter.background": "#0b0b0e",
      "editorLineNumber.foreground": "#3d3d46",
      "editorLineNumber.activeForeground": "#8f8f9d",
      "editor.lineHighlightBackground": "#ffffff05",
      "editor.lineHighlightBorder": "#00000000",
      "editor.selectionBackground": "#2f5bbb88",
      "editor.inactiveSelectionBackground": "#2f5bbb44",
      "editorIndentGuide.background1": "#ffffff0a",
      "editorIndentGuide.activeBackground1": "#42424d",
      "editorCursor.foreground": "#7fa7ff",
      "editorWhitespace.foreground": "#26262d",
      "editorWidget.background": "#141418",
      "editorWidget.border": "#2a2a31",
      "editorSuggestWidget.background": "#141418",
      "editorSuggestWidget.border": "#2a2a31",
      "editorSuggestWidget.selectedBackground": "#25252d",
      "editorHoverWidget.background": "#141418",
      "editorHoverWidget.border": "#2a2a31",
      "scrollbar.shadow": "#00000000",
      "scrollbarSlider.background": "#ffffff12",
      "scrollbarSlider.hoverBackground": "#ffffff20",
      "scrollbarSlider.activeBackground": "#ffffff2c",
    },
  });
};

export default function CodePane({
  path,
  language,
  value,
  onChange,
}: {
  path: string;
  language: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model && model.getValue() !== value) {
        editorRef.current.setValue(value);
      }
    }
  }, [value, path]);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    if (typeof window !== "undefined") {
      (window as any).__kanvasEditor = editor;
    }
    editor.updateOptions({ padding: { top: 16, bottom: 24 } });
  };
  const lineCount = value ? value.split("\n").length : 1;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#0b0b0e]">
      <div className="flex h-9 shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0e0e12] px-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <Braces className="size-3.5 shrink-0 text-blue-400" />
          <span
            className="truncate font-mono text-[10px] text-zinc-400"
            title={path}
          >
            {path}
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span className="hidden truncate text-[10px] text-zinc-600 sm:inline">
            Edit kode dan preview akan mengikuti
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-[9px] text-zinc-600">
          <span className="size-1.5 rounded-full bg-emerald-400/80" />
          {languageLabelForPath(path)}
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <MonacoEditor
          key={path}
          height="100%"
          path={path}
          language={language}
          theme="kanvas-dark"
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          beforeMount={defineTheme}
          onMount={handleMount}
          loading={
            <div className="flex h-full items-center justify-center bg-[#0b0b0e]">
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-600">
                <span className="size-3 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-400" />
                Memuat editor kode...
              </div>
            </div>
          }
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            fontFamily:
              "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, mono",
            fontSize: 12.5,
            lineHeight: 21,
            wordWrap: "on",
            wrappingIndent: "indent",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            renderLineHighlight: "line",
            renderWhitespace: "selection",
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: false,
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true, indentation: true },
            stickyScroll: { enabled: false },
            padding: { top: 16, bottom: 24 },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              useShadows: false,
            },
          }}
        />
      </div>
      <div className="flex h-7 shrink-0 items-center justify-between border-t border-white/[0.055] bg-[#0c0c0f] px-3.5 font-mono text-[9px] text-zinc-600">
        <span>{lineCount} baris</span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="size-2.5 text-emerald-500/70" />
          Sinkron dengan project
        </span>
      </div>
    </div>
  );
}
