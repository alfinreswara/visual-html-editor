"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Code2,
  Download,
  Eye,
  FileCode2,
  FileSearch,
  FolderTree,
  Globe,
  History,
  Layers,
  LoaderCircle,
  Monitor,
  MousePointer2,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  PencilLine,
  Plus,
  Redo2,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Tablet,
  Undo2,
  X,
  type LucideIcon,
} from "lucide-react";
import AddPanel from "@/components/editor/add-panel";
import AiSidebar from "@/components/editor/ai-sidebar";
import AuditModal from "@/components/editor/audit-modal";
import FilesPanel from "@/components/editor/files-panel";
import GlobalThemeModal from "@/components/editor/global-theme-modal";
import LayersPanel from "@/components/editor/layers-panel";
import PageManagerModal from "@/components/editor/page-manager-modal";
import PageSettingsModal from "@/components/editor/page-settings-modal";
import PropertiesPanel from "@/components/editor/properties-panel";
import VersionHistoryModal from "@/components/editor/version-history-modal";
import { Brand, BrandMark } from "@/components/brand";
import { ToastViewport, useToast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";
import {
  auditHtml,
  canInsertInsideTag,
  clearElementInlineStyles,
  createBlankPageHtml,
  deleteElement,
  duplicateElement,
  getElementCssSelector,
  getElementHtml,
  insertElement,
  insertHtmlFragment,
  moveElement,
  moveElementTo,
  normalizePageHtml,
  replaceElementWithHtml,
  updateElementHref,
  updateElementImageSource,
  updateElementStyle,
  updateElementText,
  updateInternalLinks,
  type InsertPosition,
  type NewElementKind,
} from "@/lib/html";
import {
  PREVIEW_CHANNEL,
  parseBridgeMessage,
  type BridgeCommand,
  type ElementStyle,
  type ParentToBridgeMessage,
  type PreviewMode as Mode,
  type SelectedElement,
  type StyleKey,
} from "@/lib/editor-messages";
import { classSelectorFor } from "@/lib/css-rules";
import { writeStyleRuleToProject } from "@/lib/style-files";
import {
  bytesToBase64,
  fileExtension,
  findEntryHtml,
  getReferencedStylesheets,
  getTextFile,
  isHtmlPath,
  isImagePath,
  makeBinaryFile,
  makeTextFile,
  monacoLanguageForPath,
  relativeProjectReference,
  resolveProjectReference,
  type ProjectFiles,
} from "@/lib/project-files";
import {
  cleanProjectName,
  loadProject,
  saveProject,
  saveProjectAsync,
  type Project,
  type ProjectVersion,
} from "@/lib/projects";
import { createProjectZip, createProjectBackupZip } from "@/lib/project-export";
import { writeGlobalThemeToProject, type GlobalTheme } from "@/lib/style-files";
import {
  buildProjectPreview,
  revokePreviewUrls,
} from "@/lib/project-preview";
import { cn } from "@/lib/utils";

const CodePane = dynamic(() => import("@/components/editor/code-pane"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#0b0b0e]">
      <LoaderCircle className="size-4 animate-spin text-zinc-600" />
    </div>
  ),
});

type LoadState = "loading" | "ready" | "missing" | "error";
type ViewMode = "preview" | "code";
type DeviceMode = "desktop" | "tablet" | "mobile";
type SaveState = "saved" | "saving" | "error";
type MobilePanel = "files" | "ai" | "properties" | null;

interface Snapshot {
  files: ProjectFiles;
  activePath: string;
}

interface HistoryState {
  past: Snapshot[];
  present: Snapshot;
  future: Snapshot[];
}

interface LastSaved {
  present: Snapshot;
  name: string;
}

const MAX_HISTORY = 100;
const SAVE_DELAY = 650;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "ico", "bmp", "svg"]);
const IMAGE_MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
  "image/bmp": "bmp",
  "image/svg+xml": "svg",
};

const EMPTY_SNAPSHOT: Snapshot = { files: {}, activePath: "" };

const DEVICES: Array<{
  id: DeviceMode;
  label: string;
  icon: LucideIcon;
  width: string;
  hint: string;
}> = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: "1280px", hint: "1280 px" },
  { id: "tablet", label: "Tablet", icon: Tablet, width: "768px", hint: "768 px" },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: "390px", hint: "390 px" },
];

function EditorSkeleton() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#08080a]">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.07] px-4">
        <div className="size-8 animate-pulse rounded-lg bg-white/[0.05]" />
        <div className="h-4 w-32 animate-pulse rounded bg-white/[0.045]" />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Brand />
          <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-600">
            <LoaderCircle className="size-3 animate-spin" />
            Membuka project...
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorShell({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { toasts, toast, dismiss } = useToast();

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState("");
  const [name, setName] = useState("");
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: EMPTY_SNAPSHOT,
    future: [],
  });
  const [activeCodePath, setActiveCodePath] = useState("");
  const [srcDoc, setSrcDoc] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const [frameReady, setFrameReady] = useState(false);
  const [selection, setSelection] = useState<SelectedElement | null>(null);
  const [mode, setMode] = useState<Mode>("editing");
  const [view, setView] = useState<ViewMode>("preview");
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [exporting, setExporting] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [leftTab, setLeftTab] = useState<"files" | "layers" | "add" | "ai">("layers");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(300);
  const [isResizing, setIsResizing] = useState<"left" | "right" | null>(null);
  const [pagesMenuOpen, setPagesMenuOpen] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState<"left" | "right" | null>(null);
  const [multiSelection, setMultiSelection] = useState<SelectedElement[]>([]);
  const [clipboardElement, setClipboardElement] = useState<{ html: string; tag: string } | null>(null);
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);
  const [globalThemeOpen, setGlobalThemeOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [pageManagerOpen, setPageManagerOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    if (!isResizing) return;
    function onPointerMove(e: PointerEvent) {
      if (isResizing === "left") {
        const next = Math.max(220, Math.min(480, e.clientX - 48));
        setLeftWidth(next);
      } else if (isResizing === "right") {
        const next = Math.max(260, Math.min(440, window.innerWidth - e.clientX));
        setRightWidth(next);
      }
    }
    function onPointerUp() {
      setIsResizing(null);
    }
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isResizing]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HistoryState>(history);
  const nameRef = useRef("");
  const activeCodePathRef = useRef("");
  const selectionRef = useRef<SelectedElement | null>(null);
  const modeRef = useRef<Mode>("editing");
  const viewRef = useRef<ViewMode>("preview");
  const baseProjectRef = useRef<Project | null>(null);
  const lastSavedRef = useRef<LastSaved | null>(null);
  const saveErrorNotified = useRef(false);
  const previewUrlsRef = useRef<string[]>([]);
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());
  const mountedRef = useRef(true);
  const pendingSelectRef = useRef<{ id: string; scroll: boolean } | null>(null);
  const commandRef = useRef<(name: BridgeCommand) => void>(() => undefined);

  const applySelection = useCallback((next: SelectedElement | null) => {
    selectionRef.current = next;
    setSelection(next);
  }, []);

  const updateMode = useCallback((next: Mode) => {
    modeRef.current = next;
    setMode(next);
  }, []);

  const updateView = useCallback((next: ViewMode) => {
    viewRef.current = next;
    setView(next);
  }, []);

  const postToPreview = useCallback((message: ParentToBridgeMessage) => {
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    try {
      // iframe sandbox + srcDoc punya origin opaque ("null") di sejumlah browser.
      // Bridge tetap memvalidasi event.source dan origin pesan masuk.
      frame.contentWindow.postMessage(message, "*");
    } catch {
      // Preview mungkin sedang dimuat ulang.
    }
  }, []);

  const releasePreviewUrls = useCallback(() => {
    revokePreviewUrls(previewUrlsRef.current);
    previewUrlsRef.current = [];
  }, []);

  const refreshPreview = useCallback(
    (
      files: ProjectFiles,
      htmlPath: string,
      options?: { selectId?: string | null; scroll?: boolean },
    ) => {
      try {
        const preview = buildProjectPreview(files, htmlPath);
        revokePreviewUrls(previewUrlsRef.current);
        previewUrlsRef.current = preview.urls;
        pendingSelectRef.current = options?.selectId
          ? { id: options.selectId, scroll: options.scroll ?? true }
          : null;
        applySelection(null);
        setFrameReady(false);
        setSrcDoc(preview.srcDoc);
        setPreviewKey((current) => current + 1);
      } catch {
        toast("Preview gagal dirender. Coba periksa kembali file HTML-mu.", "error");
      }
    },
    [applySelection, toast],
  );

  const flushPendingSelection = useCallback(() => {
    const pending = pendingSelectRef.current;
    if (!pending) return;
    pendingSelectRef.current = null;
    postToPreview({
      channel: PREVIEW_CHANNEL,
      type: "select",
      payload: { id: pending.id, scroll: pending.scroll },
    });
  }, [postToPreview]);

  const updatePresent = useCallback(
    (files: ProjectFiles, nextActivePath: string) => {
      const current = historyRef.current;
      const next: HistoryState = {
        ...current,
        present: { files, activePath: nextActivePath },
      };
      historyRef.current = next;
      setHistory(next);
    },
    [],
  );

  const pushFiles = useCallback(
    (nextFiles: ProjectFiles, nextActivePath?: string) => {
      const current = historyRef.current;
      const activePath = nextActivePath ?? current.present.activePath;
      if (
        nextFiles === current.present.files &&
        activePath === current.present.activePath
      ) {
        return false;
      }

      const next: HistoryState = {
        past: [...current.past, current.present].slice(-MAX_HISTORY),
        present: { files: nextFiles, activePath },
        future: [],
      };
      historyRef.current = next;
      setHistory(next);
      return true;
    },
    [],
  );

  const writeFile = useCallback(
    (path: string, content: string) => {
      const current = historyRef.current.present;
      const file = current.files[path];
      if (!file || file.kind !== "text" || file.content === content) {
        return false;
      }
      const nextFiles = {
        ...current.files,
        [path]: { ...file, content },
      };
      return pushFiles(nextFiles);
    },
    [pushFiles],
  );

  const handleCodeChange = useCallback(
    (nextContent: string) => {
      const path = activeCodePathRef.current;
      const present = historyRef.current.present;
      if (!path || present.files[path]?.kind !== "text") return;
      writeFile(path, nextContent);
    },
    [writeFile],
  );

  const navigateToPage = useCallback(
    (path: string) => {
      const current = historyRef.current;
      const file = current.present.files[path];
      if (!file || file.kind !== "text" || !isHtmlPath(path)) return false;

      updatePresent(current.present.files, path);
      activeCodePathRef.current = path;
      setActiveCodePath(path);
      updateView("preview");
      applySelection(null);
      refreshPreview(current.present.files, path);
      return true;
    },
    [applySelection, refreshPreview, updatePresent, updateView],
  );

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  // Muat project sekali per id.
  useEffect(() => {
    let cancelled = false;
    releasePreviewUrls();
    setLoadState("loading");

    void (async () => {
      try {
        const project = await loadProject(projectId);
        if (cancelled) return;
        if (!project) {
          setLoadState("missing");
          return;
        }

        const files = project.files ?? {};
        const entry =
          findEntryHtml(files, project.entry) ??
          project.activePath ??
          Object.keys(files)[0] ??
          "";
        const activePath =
          project.activePath &&
          files[project.activePath] &&
          isHtmlPath(project.activePath)
            ? project.activePath
            : entry;

        const initialHistory: HistoryState = {
          past: [],
          present: { files, activePath },
          future: [],
        };

        baseProjectRef.current = project;
        historyRef.current = initialHistory;
        nameRef.current = project.name;
        activeCodePathRef.current = activePath;
        lastSavedRef.current = {
          present: initialHistory.present,
          name: project.name,
        };
        selectionRef.current = null;
        modeRef.current = "editing";
        viewRef.current = "preview";

        setName(project.name);
        setHistory(initialHistory);
        setActiveCodePath(activePath);
        setSelection(null);
        setMode("editing");
        setView("preview");
        setDevice("desktop");
        setSaveState("saved");
        setMobilePanel(null);
        setLoadError("");

        refreshPreview(files, activePath);
        setLoadState("ready");
        document.title = `${project.name} · Visual HTML Editor`;
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Project tidak dapat dibuka dari penyimpanan browser.",
          );
          setLoadState("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId, refreshPreview, releasePreviewUrls]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (loadState !== "ready") return;
    const nextTitle = `${cleanProjectName(name)} · Visual HTML Editor`;
    document.title = nextTitle;
    // Metadata rute Next dapat menimpa judul beberapa saat setelah navigasi.
    const timer = window.setTimeout(() => {
      if (document.title !== nextTitle) document.title = nextTitle;
    }, 120);
    return () => window.clearTimeout(timer);
  }, [name, loadState]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // source harus tepat iframe preview. Origin app diperbolehkan, begitu juga
      // "null" untuk srcdoc sandbox di browser yang memakai origin opaque.
      if (event.origin !== window.location.origin && event.origin !== "null") return;
      const frameWindow = iframeRef.current?.contentWindow;
      if (!frameWindow || event.source !== frameWindow) return;

      const message = parseBridgeMessage(event.data);
      if (!message) return;

      if (message.type === "ready") {
        setFrameReady(true);
        postToPreview({
          channel: PREVIEW_CHANNEL,
          type: "set-mode",
          payload: { mode: modeRef.current },
        });
        flushPendingSelection();
        return;
      }

      if (message.type === "command") {
        commandRef.current(message.payload.name);
        return;
      }

      if (message.type === "deselect") {
        applySelection(null);
        setMobilePanel((current) =>
          current === "properties" ? null : current,
        );
        return;
      }

      if (message.type === "link") {
        if (!message.payload.external) {
          const current = historyRef.current.present;
          const target = resolveProjectReference(
            current.activePath,
            message.payload.href,
          );
          if (!target || !navigateToPage(target.path)) {
            toast(
              "Halaman tujuan tidak ditemukan di project ini.",
              "info",
            );
          }
          return;
        }

        let href = message.payload.href.trim();
        if (href.startsWith("//")) href = `https:${href}`;
        let protocol = "";
        try {
          protocol = new URL(href).protocol;
        } catch {
          return;
        }
        if (!["http:", "https:", "mailto:", "tel:"].includes(protocol)) return;
        try {
          const opened = window.open(href, "_blank");
          if (opened) {
            opened.opener = null;
          } else {
            toast(
              "Tautan eksternal diblokir browser. Izinkan pop-up untuk membukanya.",
              "info",
            );
          }
        } catch {
          toast("Tautan eksternal tidak dapat dibuka.", "error");
        }
        return;
      }

      if (modeRef.current !== "editing") return;

      if (message.type === "select") {
        setMultiSelection([message.payload]);
        applySelection(message.payload);
        if (window.innerWidth < 1280) setMobilePanel("properties");
        return;
      }

      if (message.type === "multi-select") {
        setMultiSelection(message.payload.elements);
        if (message.payload.elements.length > 0) {
          applySelection(message.payload.elements[message.payload.elements.length - 1]);
        }
        return;
      }

      if (message.type === "text") {
        const current = selectionRef.current;
        if (!current || current.id !== message.payload.id) return;
        const present = historyRef.current.present;
        const html = getTextFile(present.files, present.activePath);
        if (html === null) return;
        const next = updateElementText(html, current.id, message.payload.text);
        if (!next) return;
        writeFile(present.activePath, next);
        applySelection({ ...current, text: message.payload.text });
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    applySelection,
    flushPendingSelection,
    navigateToPage,
    postToPreview,
    toast,
    writeFile,
  ]);

  // Simpan otomatis dengan jeda singkat.
  useEffect(() => {
    if (loadState !== "ready" || !lastSavedRef.current) return;
    const lastSaved = lastSavedRef.current;
    if (
      lastSaved.present === history.present &&
      lastSaved.name === name
    ) {
      return;
    }

    setSaveState("saving");
    const timer = window.setTimeout(() => {
      void persistProject();
    }, SAVE_DELAY);

    return () => window.clearTimeout(timer);
    // persistProject memakai ref sehingga stabil.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.present, name, loadState, toast]);

  function buildProjectFromSnapshot(
    snapshot: Snapshot,
    currentName: string,
  ): Project | null {
    const base = baseProjectRef.current;
    if (!base) return null;
    const entry =
      findEntryHtml(snapshot.files, base.entry) ?? snapshot.activePath;
    return {
      ...base,
      name: cleanProjectName(currentName),
      files: snapshot.files,
      entry,
      activePath: snapshot.activePath,
      html: getTextFile(snapshot.files, entry) ?? "",
      updatedAt: Date.now(),
    };
  }

  function persistProject(): Promise<void> {
    const base = baseProjectRef.current;
    if (!base) return Promise.resolve();

    const snapshot = historyRef.current.present;
    const currentName = nameRef.current;
    if (
      lastSavedRef.current?.present === snapshot &&
      lastSavedRef.current?.name === currentName
    ) {
      setSaveState("saved");
      return Promise.resolve();
    }

    const nextProject = buildProjectFromSnapshot(snapshot, currentName);
    if (!nextProject) return Promise.resolve();

    const run = async () => {
      try {
        const saved = await saveProjectAsync(nextProject);
        baseProjectRef.current = { ...nextProject, storage: saved.storage };
        lastSavedRef.current = { present: snapshot, name: currentName };
        saveErrorNotified.current = false;
        if (
          mountedRef.current &&
          historyRef.current.present === snapshot &&
          nameRef.current === currentName
        ) {
          setSaveState("saved");
        }
      } catch {
        if (!mountedRef.current) return;
        setSaveState("error");
        if (!saveErrorNotified.current) {
          saveErrorNotified.current = true;
          toast(
            "Perubahan gagal disimpan. Penyimpanan browser mungkin penuh.",
            "error",
          );
        }
      }
    };

    const chained = saveChainRef.current.then(run, run);
    saveChainRef.current = chained.catch(() => undefined);
    return chained;
  }

  function flushProjectSilently(): void {
    const base = baseProjectRef.current;
    if (!base) return;
    const snapshot = historyRef.current.present;
    const currentName = nameRef.current;
    if (
      lastSavedRef.current?.present === snapshot &&
      lastSavedRef.current?.name === currentName
    ) {
      return;
    }

    const nextProject = buildProjectFromSnapshot(snapshot, currentName);
    if (!nextProject) return;

    try {
      // Jalur sinkron ini cukup untuk project kecil dan penting saat pagehide.
      saveProject(nextProject);
      baseProjectRef.current = nextProject;
      lastSavedRef.current = { present: snapshot, name: currentName };
    } catch {
      void persistProject();
    }
  }

  // Flush saat tab ditutup/pindah, dan saat route editor ditinggalkan.
  useEffect(() => {
    function handlePageHide() {
      flushProjectSilently();
    }
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      flushProjectSilently();
      releasePreviewUrls();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [releasePreviewUrls]);

  useEffect(() => {
    if (!mobilePanel) return;
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setMobilePanel(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobilePanel]);

  // Saat lebar preview berubah, minta ulang nilai computed style elemen aktif
  // supaya panel properti menampilkan nilai pada breakpoint tersebut.
  useEffect(() => {
    if (loadState !== "ready" || view !== "preview" || mode !== "editing") {
      return;
    }
    const current = selectionRef.current;
    if (!current) return;

    const timer = window.setTimeout(() => {
      postToPreview({
        channel: PREVIEW_CHANNEL,
        type: "select",
        payload: { id: current.id, scroll: false },
      });
    }, 90);
    return () => window.clearTimeout(timer);
  }, [device, loadState, mode, postToPreview, view]);

  // Preview Desktop dirender pada lebar 1280px lalu diskalakan agar media
  // query tablet (<=1024px) tidak aktif hanya karena panel editor sempit.
  useEffect(() => {
    if (view !== "preview") return;
    const node = stageRef.current;
    if (!node) return;

    const measure = () => setStageWidth(node.clientWidth);
    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadState, view]);

  function handleFrameLoad() {
    setFrameReady(true);
    window.setTimeout(() => {
      postToPreview({
        channel: PREVIEW_CHANNEL,
        type: "set-mode",
        payload: { mode: modeRef.current },
      });
      flushPendingSelection();
    }, 30);
  }

  function commitStructure(
    result: { html: string; id: string },
    message: string,
  ): boolean {
    const present = historyRef.current.present;
    if (!writeFile(present.activePath, result.html)) {
      toast("Perubahan struktur tidak menghasilkan halaman baru.", "error");
      return false;
    }
    refreshPreview(historyRef.current.present.files, present.activePath, {
      selectId: result.id,
      scroll: true,
    });
    toast(message, "success");
    return true;
  }

  function handleStyleChange(
    styles: Partial<ElementStyle>,
    requestedClass: string | null,
  ) {
    const current = selectionRef.current;
    if (!current) return;
    const present = historyRef.current.present;
    const html = getTextFile(present.files, present.activePath);
    if (html === null) return;

    const classes = current.className.trim().split(/\s+/).filter(Boolean);
    const targetClass =
      requestedClass && classes.includes(requestedClass) ? requestedClass : null;
    const scope = device;
    const keys = Object.keys(styles) as StyleKey[];

    if (scope === "desktop" && !targetClass) {
      const next = updateElementStyle(html, current.id, styles);
      if (!next) {
        toast("Elemen tidak ditemukan. Pilih ulang elemen di preview.", "error");
        return;
      }
      postToPreview({
        channel: PREVIEW_CHANNEL,
        type: "set-style",
        payload: { id: current.id, styles },
      });
      writeFile(present.activePath, next);
      applySelection({
        ...current,
        style: { ...current.style, ...styles },
      });
      return;
    }

    const selector = targetClass
      ? classSelectorFor(targetClass)
      : getElementCssSelector(html, current.id);
    if (!selector) {
      toast("Selector elemen tidak dapat dibuat. Pilih ulang elemen.", "error");
      return;
    }

    const result = writeStyleRuleToProject(
      present.files,
      present.activePath,
      selector,
      styles,
      scope,
      scope !== "desktop",
    );
    if (!result) {
      toast("File CSS project tidak dapat diperbarui.", "error");
      return;
    }

    let nextFiles = result.files;

    // Saat menulis ke class pada Desktop, lepaskan properti yang sama dari
    // inline style agar rule class benar-benar berlaku.
    if (scope === "desktop" && targetClass) {
      const sourceHtml =
        getTextFile(result.files, present.activePath) ?? html;
      const stripped = clearElementInlineStyles(sourceHtml, current.id, keys);
      const file = result.files[present.activePath];
      if (stripped && file?.kind === "text") {
        nextFiles = {
          ...result.files,
          [present.activePath]: { ...file, content: stripped },
        };
      }

      const removals: Partial<ElementStyle> = {};
      for (const key of keys) removals[key] = "";
      postToPreview({
        channel: PREVIEW_CHANNEL,
        type: "set-style",
        payload: { id: current.id, styles: removals },
      });
    }

    if (!pushFiles(nextFiles)) {
      toast("Perubahan gaya tidak menghasilkan file baru.", "info");
      return;
    }

    postToPreview({
      channel: PREVIEW_CHANNEL,
      type: "set-css",
      payload: { selector, scope, styles },
    });
    applySelection({
      ...current,
      style: { ...current.style, ...styles },
    });
  }

  function handleTextChange(text: string) {
    const current = selectionRef.current;
    if (!current) return;
    const present = historyRef.current.present;
    const html = getTextFile(present.files, present.activePath);
    if (html === null) return;
    const next = updateElementText(html, current.id, text);
    if (!next) return;
    postToPreview({
      channel: PREVIEW_CHANNEL,
      type: "set-text",
      payload: { id: current.id, text },
    });
    writeFile(present.activePath, next);
    applySelection({ ...current, text });
  }

  function handleHrefChange(href: string) {
    const current = selectionRef.current;
    if (!current) return;
    const present = historyRef.current.present;
    const html = getTextFile(present.files, present.activePath);
    if (html === null) return;
    const next = updateElementHref(html, current.id, href);
    if (!next) return;
    postToPreview({
      channel: PREVIEW_CHANNEL,
      type: "set-attribute",
      payload: { id: current.id, name: "href", value: href },
    });
    writeFile(present.activePath, next);
    applySelection({ ...current, href: href.trim() });
  }

  function handleSelectParent() {
    const current = selectionRef.current;
    if (!current) return;
    postToPreview({
      channel: PREVIEW_CHANNEL,
      type: "select-parent",
      payload: { id: current.id },
    });
  }

  function handleDeleteElement() {
    const present = historyRef.current.present;
    let html = getTextFile(present.files, present.activePath);
    if (html === null) return;

    if (multiSelection.length > 1) {
      for (const el of multiSelection) {
        const next = deleteElement(html, el.id);
        if (next) html = next;
      }
      const count = multiSelection.length;
      setMultiSelection([]);
      writeFile(present.activePath, html);
      refreshPreview(historyRef.current.present.files, present.activePath, {
        selectId: null,
      });
      toast(`${count} elemen dihapus.`, "info");
      return;
    }

    const current = selectionRef.current;
    if (!current) return;
    const next = deleteElement(html, current.id);
    if (!next) {
      toast("Elemen tidak ditemukan. Pilih ulang elemen di preview.", "error");
      return;
    }
    if (!writeFile(present.activePath, next)) return;
    refreshPreview(historyRef.current.present.files, present.activePath, {
      selectId: null,
    });
    toast("Elemen dihapus. Gunakan Ctrl/Cmd+Z untuk membatalkannya.", "info");
  }

  function handleDuplicateElement() {
    const current = selectionRef.current;
    if (!current) return;
    const present = historyRef.current.present;
    const html = getTextFile(present.files, present.activePath);
    if (html === null) return;
    const result = duplicateElement(html, current.id);
    if (!result) {
      toast("Elemen ini tidak dapat diduplikasi.", "error");
      return;
    }
    commitStructure(result, "Elemen diduplikasi.");
  }

  function handleAddElement(kind: NewElementKind, position: InsertPosition) {
    const current = selectionRef.current;
    const present = historyRef.current.present;
    const html = getTextFile(present.files, present.activePath);
    if (html === null) return;
    const result = insertElement(html, current?.id ?? null, position, kind);
    if (!result) {
      toast(
        "Elemen tidak dapat disisipkan di sana. Pilih container lain.",
        "error",
      );
      return;
    }
    commitStructure(result, "Elemen baru ditambahkan.");
  }

  function handleMoveElement(direction: "up" | "down") {
    const current = selectionRef.current;
    if (!current) return;
    const present = historyRef.current.present;
    const html = getTextFile(present.files, present.activePath);
    if (html === null) return;
    const result = moveElement(html, current.id, direction);
    if (!result) {
      toast("Elemen sudah berada di urutan paling ujung.", "info");
      return;
    }
    commitStructure(result, "Urutan elemen diperbarui.");
  }

  function handleMoveElementTo(
    sourceId: string,
    targetId: string,
    position: "before" | "after" | "inside",
  ) {
    const present = historyRef.current.present;
    const html = getTextFile(present.files, present.activePath);
    if (html === null) return;
    const result = moveElementTo(html, sourceId, targetId, position);
    if (!result) {
      toast("Elemen tidak dapat dipindahkan ke posisi itu.", "error");
      return;
    }
    commitStructure(result, "Elemen dipindahkan.");
  }

  function handleLayerSelect(id: string) {
    if (modeRef.current !== "editing") handleModeChange("editing");
    postToPreview({
      channel: PREVIEW_CHANNEL,
      type: "select",
      payload: { id, scroll: true },
    });
  }

  function nextImagePath(
    files: ProjectFiles,
    activePath: string,
    originalName: string,
    mime: string,
  ): { path: string; extension: string } | null {
    let extension = fileExtension(originalName).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(extension)) {
      extension = IMAGE_MIME_EXTENSIONS[mime.toLowerCase()] ?? "";
    }
    if (!extension || !IMAGE_EXTENSIONS.has(extension)) return null;

    const base =
      originalName
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 42) || "gambar";
    const directory = activePath.includes("/")
      ? activePath.slice(0, activePath.lastIndexOf("/") + 1)
      : "";
    const folder = `${directory}assets`;
    let candidate = `${folder}/${base}.${extension}`;
    let counter = 2;
    while (files[candidate]) {
      candidate = `${folder}/${base}-${counter}.${extension}`;
      counter += 1;
    }
    return { path: candidate, extension };
  }

  async function handleImageUpload(file: File) {
    const current = selectionRef.current;
    if (!current || current.tag !== "img") return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast("Ukuran gambar terlalu besar. Maksimal 8 MB.", "error");
      return;
    }

    const present = historyRef.current.present;
    const htmlFile = present.files[present.activePath];
    const html = getTextFile(present.files, present.activePath);
    if (!html || htmlFile?.kind !== "text") return;

    const asset = nextImagePath(
      present.files,
      present.activePath,
      file.name,
      file.type,
    );
    if (!asset) {
      toast("Format gambar tidak didukung. Gunakan PNG, JPG, WebP, GIF, SVG, AVIF, ICO, atau BMP.", "error");
      return;
    }

    let base64 = "";
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      base64 = bytesToBase64(bytes);
    } catch {
      toast("Gambar gagal dibaca dari perangkat.", "error");
      return;
    }

    const reference = relativeProjectReference(present.activePath, asset.path);
    const nextHtml = updateElementImageSource(html, current.id, reference);
    if (!nextHtml) {
      toast("Elemen gambar tidak ditemukan lagi.", "error");
      return;
    }

    const nextFiles: ProjectFiles = {
      ...present.files,
      [asset.path]: makeBinaryFile(base64, asset.path),
      [present.activePath]: { ...htmlFile, content: nextHtml },
    };
    if (!pushFiles(nextFiles)) return;
    refreshPreview(nextFiles, present.activePath, {
      selectId: current.id,
      scroll: false,
    });
    toast(`Gambar disimpan sebagai ${asset.path}.`, "success");
  }

  function handleImageSelect(path: string) {
    const current = selectionRef.current;
    if (!current || current.tag !== "img") return;
    const present = historyRef.current.present;
    if (!present.files[path] || !isImagePath(path)) {
      toast("File gambar tidak ditemukan di project.", "error");
      return;
    }
    const html = getTextFile(present.files, present.activePath);
    if (html === null) return;

    const reference = relativeProjectReference(present.activePath, path);
    const next = updateElementImageSource(html, current.id, reference);
    if (!next) {
      toast("Elemen gambar tidak ditemukan lagi.", "error");
      return;
    }
    if (!writeFile(present.activePath, next)) return;
    refreshPreview(historyRef.current.present.files, present.activePath, {
      selectId: current.id,
      scroll: false,
    });
    toast(`Gambar diganti dengan ${path}.`, "success");
  }

  function restoreSnapshot(snapshot: Snapshot) {
    const htmlPath =
      snapshot.files[snapshot.activePath] && isHtmlPath(snapshot.activePath)
        ? snapshot.activePath
        : findEntryHtml(snapshot.files) ?? snapshot.activePath;
    let codePath = activeCodePathRef.current;
    if (!snapshot.files[codePath] || snapshot.files[codePath].kind !== "text") {
      codePath = htmlPath;
      activeCodePathRef.current = codePath;
      setActiveCodePath(codePath);
    }

    applySelection(null);
    if (viewRef.current === "preview") {
      refreshPreview(snapshot.files, htmlPath);
    }
  }

  function undo() {
    const current = historyRef.current;
    if (current.past.length === 0) return;
    const previous = current.past[current.past.length - 1];
    const next: HistoryState = {
      past: current.past.slice(0, -1),
      present: previous,
      future: [current.present, ...current.future].slice(0, MAX_HISTORY),
    };
    historyRef.current = next;
    setHistory(next);
    restoreSnapshot(previous);
  }

  function redo() {
    const current = historyRef.current;
    if (current.future.length === 0) return;
    const following = current.future[0];
    const next: HistoryState = {
      past: [...current.past, current.present].slice(-MAX_HISTORY),
      present: following,
      future: current.future.slice(1),
    };
    historyRef.current = next;
    setHistory(next);
    restoreSnapshot(following);
  }

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      const target = event.target;
      const editable =
        target instanceof Element &&
        Boolean(
          target.closest(
            "input, textarea, select, [contenteditable='true'], .monaco-editor",
          ),
        );
      if (editable) return;

      const modifier = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (modifier && (key === "z" || key === "y")) {
        event.preventDefault();
        if (key === "z" && !event.shiftKey) undo();
        else redo();
        return;
      }

      if (modifier && key === "d") {
        if (!selectionRef.current || modeRef.current !== "editing") return;
        event.preventDefault();
        if (!event.repeat) handleDuplicateElement();
        return;
      }
      if (modifier && key === "c") {
        if (!selectionRef.current || modeRef.current !== "editing" || viewRef.current !== "preview") return;
        const present = historyRef.current.present;
        const html = getTextFile(present.files, present.activePath);
        if (!html) return;
        const elemHtml = getElementHtml(html, selectionRef.current.id);
        if (elemHtml) {
          event.preventDefault();
          const item = { html: elemHtml, tag: selectionRef.current.tag };
          setClipboardElement(item);
          try {
            sessionStorage.setItem("kanvas.clipboard", JSON.stringify(item));
          } catch {}
          toast(`Elemen <${selectionRef.current.tag}> disalin.`, "info");
        }
        return;
      }

      if (modifier && key === "v") {
        if (modeRef.current !== "editing" || viewRef.current !== "preview") return;
        let item = clipboardElement;
        if (!item) {
          try {
            const raw = sessionStorage.getItem("kanvas.clipboard");
            if (raw) item = JSON.parse(raw);
          } catch {}
        }
        if (item) {
          event.preventDefault();
          const present = historyRef.current.present;
          const html = getTextFile(present.files, present.activePath);
          if (!html) return;
          const targetId = selectionRef.current?.id || "body";
          const pos = selectionRef.current ? "after" : "inside";
          const result = insertHtmlFragment(html, targetId, pos, item.html);
          if (result) {
            commitStructure(result, `Elemen <${item.tag}> ditempel.`);
            toast(`Elemen <${item.tag}> ditempel.`, "success");
          }
        }
        return;
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        !modifier &&
        !event.altKey &&
        selectionRef.current &&
        modeRef.current === "editing" &&
        viewRef.current === "preview"
      ) {
        event.preventDefault();
        if (!event.repeat) handleDeleteElement();
        return;
      }

      if (event.altKey && !modifier) {
        if (event.key === "1") {
          event.preventDefault();
          setLeftTab("files");
          setLeftCollapsed(false);
          return;
        }
        if (event.key === "2") {
          event.preventDefault();
          setLeftTab("layers");
          setLeftCollapsed(false);
          return;
        }
        if (event.key === "3") {
          event.preventDefault();
          setLeftTab("add");
          setLeftCollapsed(false);
          return;
        }
        if (event.key === "4") {
          event.preventDefault();
          setLeftTab("ai");
          setLeftCollapsed(false);
          return;
        }
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  commandRef.current = (name) => {
    if (name === "undo") undo();
    else if (name === "redo") redo();
    else if (name === "duplicate") handleDuplicateElement();
    else if (name === "delete") handleDeleteElement();
    else if (name === "move-up") handleMoveElement("up");
    else if (name === "move-down") handleMoveElement("down");
    else if (name === "select-parent") handleSelectParent();
  };

  function handleModeChange(nextMode: Mode) {
    if (nextMode === modeRef.current) return;
    updateMode(nextMode);
    if (nextMode === "viewing") {
      applySelection(null);
    }
    postToPreview({
      channel: PREVIEW_CHANNEL,
      type: "set-mode",
      payload: { mode: nextMode },
    });
  }

  function handleViewChange(nextView: ViewMode) {
    if (nextView === viewRef.current) return;
    updateView(nextView);
    applySelection(null);

    if (nextView === "code") {
      releasePreviewUrls();
      const present = historyRef.current.present;
      if (
        !activeCodePathRef.current ||
        present.files[activeCodePathRef.current]?.kind !== "text"
      ) {
        activeCodePathRef.current = present.activePath;
        setActiveCodePath(present.activePath);
      }
    } else {
      const present = historyRef.current.present;
      refreshPreview(present.files, present.activePath);
    }
  }

  function handleOpenFile(path: string) {
    const present = historyRef.current.present;
    const file = present.files[path];
    if (!file) return;

    if (isHtmlPath(path)) {
      if (!navigateToPage(path)) {
        toast("Halaman HTML tidak dapat dibuka.", "error");
        return;
      }
      if (window.innerWidth < 1280) setMobilePanel(null);
      return;
    }

    if (file.kind !== "text") {
      toast(
        `File ${path} adalah aset biner dan tidak bisa diedit di editor kode.`,
        "info",
      );
      return;
    }

    activeCodePathRef.current = path;
    setActiveCodePath(path);
    releasePreviewUrls();
    updateView("code");
    applySelection(null);
    if (window.innerWidth < 1280) setMobilePanel(null);
  }

  async function handleLeave() {
    await persistProject();
    router.push("/");
  }

  function handleApplyPage(fragment: string, baseHtml: string) {
    const present = historyRef.current.present;
    const html = getTextFile(present.files, present.activePath);
    if (html === null || html !== baseHtml) {
      throw new Error(
        "Halaman berubah saat AI memproses. Perubahan AI tidak diterapkan; coba kirim ulang instruksi.",
      );
    }
    const next = normalizePageHtml(fragment);
    if (!writeFile(present.activePath, next)) {
      throw new Error("Perubahan AI tidak menghasilkan halaman baru.");
    }
    updateView("preview");
    refreshPreview(historyRef.current.present.files, present.activePath);
    toast("Perubahan AI diterapkan ke halaman.", "success");
  }

  function handleApplyElement(id: string, fragment: string, baseHtml: string) {
    const present = historyRef.current.present;
    const html = getTextFile(present.files, present.activePath);
    if (html === null || html !== baseHtml) {
      throw new Error(
        "Halaman berubah saat AI memproses. Perubahan AI tidak diterapkan; coba kirim ulang instruksi.",
      );
    }
    const next = replaceElementWithHtml(html, id, fragment);
    if (!writeFile(present.activePath, next)) {
      throw new Error("Perubahan AI tidak menghasilkan elemen baru.");
    }
    updateView("preview");
    refreshPreview(historyRef.current.present.files, present.activePath);
    toast("Perubahan AI diterapkan ke elemen terpilih.", "success");
  }

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      const present = historyRef.current.present;
      const base = baseProjectRef.current;
      const result = await createProjectZip(
        nameRef.current,
        present.files,
        base?.source,
      );
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      // Beri waktu browser memulai unduhan sebelum blob dibersihkan.
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      toast(
        `Project diekspor sebagai file ZIP. ${result.entries.length} file disertakan.`,
        "success",
      );
    } catch {
      toast("Export gagal dibuat. Coba lagi.", "error");
    } finally {
      setExporting(false);
    }
  }
  const createVersionSnapshot = useCallback((label: string) => {
    const base = baseProjectRef.current;
    if (!base) return;
    const present = historyRef.current.present;
    const snapshot: ProjectVersion = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      label,
      files: { ...present.files },
      activePath: present.activePath,
    };
    const currentVersions = base.versions || [];
    const nextVersions = [snapshot, ...currentVersions].slice(0, 30);
    base.versions = nextVersions;
    void saveProjectAsync(base);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      createVersionSnapshot("Snapshot Otomatis");
    }, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [createVersionSnapshot]);

  function handleCreatePage(name: string, fromTemplate: "blank" | "duplicate") {
    const present = historyRef.current.present;
    if (present.files[name]) {
      toast(`File ${name} sudah ada di project.`, "error");
      return;
    }
    createVersionSnapshot(`Sebelum buat halaman ${name}`);
    const content =
      fromTemplate === "duplicate"
        ? (getTextFile(present.files, present.activePath) || createBlankPageHtml(name))
        : createBlankPageHtml(name.replace(/\.html?$/i, ""));

    const nextFiles = {
      ...present.files,
      [name]: makeTextFile(content, name),
    };
    pushFiles(nextFiles, name);
    navigateToPage(name);
    toast(`Halaman ${name} berhasil dibuat.`, "success");
  }

  function handleRenamePage(oldPath: string, newPath: string) {
    const present = historyRef.current.present;
    if (!present.files[oldPath]) return;
    if (present.files[newPath]) {
      toast(`File ${newPath} sudah ada di project.`, "error");
      return;
    }
    createVersionSnapshot(`Sebelum ganti nama ${oldPath} -> ${newPath}`);

    let updatedFiles = updateInternalLinks(present.files, oldPath, newPath);
    const file = updatedFiles[oldPath];
    delete updatedFiles[oldPath];
    updatedFiles[newPath] = file;

    const nextActivePath = present.activePath === oldPath ? newPath : present.activePath;
    pushFiles(updatedFiles, nextActivePath);

    if (baseProjectRef.current?.pageOrder) {
      baseProjectRef.current.pageOrder = baseProjectRef.current.pageOrder.map((p) =>
        p === oldPath ? newPath : p,
      );
    }

    if (present.activePath === oldPath) {
      navigateToPage(newPath);
    } else {
      refreshPreview(updatedFiles, nextActivePath);
    }
    toast(`Halaman diubah menjadi ${newPath}. Tautan internal diperbarui.`, "success");
  }

  function handleDuplicatePage(path: string) {
    const present = historyRef.current.present;
    const original = present.files[path];
    if (!original) return;

    const stem = path.replace(/\.html?$/i, "");
    let copyPath = `${stem}-salinan.html`;
    let count = 2;
    while (present.files[copyPath]) {
      copyPath = `${stem}-salinan-${count}.html`;
      count++;
    }

    createVersionSnapshot(`Duplikat ${path}`);
    const nextFiles = {
      ...present.files,
      [copyPath]: makeTextFile(original.content, copyPath),
    };
    pushFiles(nextFiles, copyPath);
    navigateToPage(copyPath);
    toast(`Salinan halaman dibuat: ${copyPath}`, "success");
  }

  function handleDeletePage(path: string) {
    const present = historyRef.current.present;
    const htmls = Object.keys(present.files).filter(isHtmlPath);
    if (htmls.length <= 1) {
      toast("Proyek harus memiliki setidaknya satu halaman.", "error");
      return;
    }
    createVersionSnapshot(`Sebelum hapus halaman ${path}`);

    const nextFiles = { ...present.files };
    delete nextFiles[path];

    const remainingHtml = Object.keys(nextFiles).filter(isHtmlPath);
    const nextActive =
      present.activePath === path
        ? remainingHtml[0] || "index.html"
        : present.activePath;
    pushFiles(nextFiles, nextActive);
    if (present.activePath === path) {
      navigateToPage(nextActive);
    } else {
      refreshPreview(nextFiles, nextActive);
    }
    toast(`Halaman ${path} berhasil dihapus.`, "info");
  }

  function handleReorderPages(reordered: string[]) {
    if (baseProjectRef.current) {
      baseProjectRef.current.pageOrder = reordered;
      void saveProjectAsync(baseProjectRef.current);
    }
  }

  function handleSaveGlobalTheme(theme: GlobalTheme) {
    const present = historyRef.current.present;
    createVersionSnapshot("Sebelum ubah tema global");
    const result = writeGlobalThemeToProject(present.files, present.activePath, theme);
    if (!result) return;

    if (baseProjectRef.current) {
      baseProjectRef.current.globalTheme = theme;
      void saveProjectAsync(baseProjectRef.current);
    }
    pushFiles(result.files, present.activePath);
    refreshPreview(result.files, present.activePath);
    toast("Tema global berhasil diterapkan ke stylesheet proyek.", "success");
  }

  function handleSavePageMetadata(nextHtml: string) {
    const present = historyRef.current.present;
    createVersionSnapshot("Sebelum ubah pengaturan SEO/meta");
    writeFile(present.activePath, nextHtml);
    refreshPreview(historyRef.current.present.files, present.activePath);
    toast("Pengaturan SEO & meta halaman disimpan.", "success");
  }

  function handleRestoreVersion(version: ProjectVersion) {
    createVersionSnapshot(`Sebelum pemulihan ke ${version.label}`);
    pushFiles(version.files, version.activePath);
    navigateToPage(version.activePath);
    toast(`Proyek dipulihkan ke versi "${version.label}".`, "success");
  }

  async function handleExportBackup() {
    if (exporting) return;
    setExporting(true);
    try {
      const present = historyRef.current.present;
      const base = baseProjectRef.current;
      if (!base) return;
      const result = await createProjectBackupZip(base, present.files);
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      toast("Cadangan proyek (.zip + metadata) berhasil diekspor.", "success");
    } catch {
      toast("Gagal mengekspor cadangan proyek.", "error");
    } finally {
      setExporting(false);
      setExportMenuOpen(false);
    }
  }


  function handleNameBlur() {
    const cleaned = cleanProjectName(name);
    if (cleaned !== name) {
      setName(cleaned);
      nameRef.current = cleaned;
    }
  }

  function closeMobilePanel() {
    setMobilePanel(null);
  }

  const activeHtml = getTextFile(
    history.present.files,
    history.present.activePath,
  ) ?? "";
  const activePath = history.present.activePath;
  const codeFilePath =
    activeCodePath &&
    history.present.files[activeCodePath]?.kind === "text"
      ? activeCodePath
      : activePath;
  const codeValue =
    getTextFile(history.present.files, codeFilePath) ?? "";
  const aiStylesheets = useMemo(
    () =>
      getReferencedStylesheets(
        history.present.files,
        history.present.activePath,
      ),
    [history.present.files, history.present.activePath],
  );
  const projectImagePaths = useMemo(
    () =>
      Object.keys(history.present.files)
        .filter((path) => isImagePath(path))
        .sort((a, b) => a.localeCompare(b)),
    [history.present.files],
  );
  const htmlPaths = useMemo(() => {
    const raw = Object.keys(history.present.files).filter((path) => isHtmlPath(path));
    const order = baseProjectRef.current?.pageOrder || [];
    return raw.sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA >= 0 && idxB >= 0) return idxA - idxB;
      if (idxA >= 0) return -1;
      if (idxB >= 0) return 1;
      return a.localeCompare(b);
    });
  }, [history.present.files]);
  const auditIssues = useMemo(() => auditHtml(activeHtml), [activeHtml]);
  const canInsertInside = canInsertInsideTag(selection?.tag ?? "");
  if (loadState === "loading") return <EditorSkeleton />;

  if (loadState !== "ready") {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#08080a] px-5 text-center">
        <div className="pointer-events-none absolute top-0 h-72 w-[600px] rounded-full bg-blue-600/10 blur-[100px]" />
        <Brand className="mb-8" />
        <span className="mb-4 grid size-12 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-zinc-500">
          <AlertTriangle className="size-5" />
        </span>
        <h1 className="text-xl font-semibold tracking-[-0.03em] text-zinc-100">
          {loadState === "missing" ? "Project tidak ditemukan" : "Project gagal dibuka"}
        </h1>
        <p className="mt-2 max-w-sm text-xs leading-5 text-zinc-500">
          {loadState === "missing"
            ? "Project ini mungkin sudah dihapus, atau tersimpan di browser yang berbeda."
            : loadError}
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="focus-ring mt-6 inline-flex h-9 items-center gap-2 rounded-lg bg-white px-4 text-xs font-semibold text-[#111114] transition hover:bg-zinc-200"
        >
          <ArrowLeft className="size-3.5" />
          Kembali ke daftar project
        </button>
      </div>
    );
  }

  const activeDevice = DEVICES.find((item) => item.id === device) ?? DEVICES[0];
  const deviceWidth = Number.parseInt(activeDevice.width, 10) || 1280;
  const previewScale =
    stageWidth > 0 ? Math.min(1, stageWidth / deviceWidth) : 1;
  const asideOpen = mobilePanel === "ai" || mobilePanel === "files";

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#09090b] text-zinc-200">
      {/* 1. Thin Modern Top Toolbar (~42px) */}
      <header className="relative z-30 flex h-10.5 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#101014] px-2.5 sm:px-3">
        {/* Left section: Back to Projects, Brand, Project Title & Save Status */}
        <div className="flex min-w-0 items-center gap-2">
          <Tooltip content="Kembali ke Daftar Project">
            <button
              type="button"
              onClick={() => void handleLeave()}
              className="focus-ring grid size-7 shrink-0 place-items-center rounded-md text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Kembali ke daftar project"
            >
              <ArrowLeft className="size-4" />
            </button>
          </Tooltip>

          <span className="hidden sm:inline-block">
            <BrandMark className="size-6 rounded-md" />
          </span>

          <div className="flex min-w-0 items-center gap-1.5">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                nameRef.current = e.target.value;
              }}
              onBlur={handleNameBlur}
              maxLength={80}
              aria-label="Nama project"
              title={name}
              className="focus-ring h-6.5 w-[110px] truncate rounded border border-transparent bg-transparent px-1.5 text-[11.5px] font-medium tracking-tight text-zinc-100 outline-none transition hover:border-white/10 hover:bg-white/[0.03] focus:border-[#3b82f6]/50 focus:bg-white/[0.04] sm:w-40 md:w-52"
            />
            <span
              className={cn(
                "hidden items-center gap-1 text-[9.5px] transition md:flex",
                saveState === "error" ? "text-red-400" : "text-zinc-500",
              )}
              aria-live="polite"
            >
              {saveState === "saving" ? (
                <>
                  <LoaderCircle className="size-2.5 animate-spin text-blue-400" />
                  <span className="hidden lg:inline text-zinc-400">Menyimpan</span>
                </>
              ) : saveState === "error" ? (
                <>
                  <AlertTriangle className="size-2.5" />
                  <span className="hidden lg:inline">Gagal simpan</span>
                </>
              ) : (
                <>
                  <Check className="size-2.5 text-emerald-400" />
                  <span className="hidden lg:inline text-zinc-500">Tersimpan</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Center section: Controls (horizontally scrollable on small screens) */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto px-2">
          {/* Mode Switcher: Sunting vs Lihat */}
          <div className="flex shrink-0 items-center rounded-lg border border-white/[0.08] bg-black/40 p-0.5">
            <Tooltip content="Mode Sunting — Pilih & ubah elemen" shortcut="Ctrl+E">
              <button
                type="button"
                onClick={() => handleModeChange("editing")}
                className={cn(
                  "focus-ring flex h-6 items-center gap-1 rounded-[5px] px-2 text-[10px] font-medium transition",
                  mode === "editing"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
                aria-pressed={mode === "editing"}
              >
                <PencilLine className="size-3" />
                <span className="hidden sm:inline">Sunting</span>
              </button>
            </Tooltip>
            <Tooltip content="Mode Lihat — Uji klik & navigasi">
              <button
                type="button"
                onClick={() => handleModeChange("viewing")}
                className={cn(
                  "focus-ring flex h-6 items-center gap-1 rounded-[5px] px-2 text-[10px] font-medium transition",
                  mode === "viewing"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
                aria-pressed={mode === "viewing"}
              >
                <Eye className="size-3" />
                <span className="hidden sm:inline">Lihat</span>
              </button>
            </Tooltip>
          </div>

          <span className="h-3.5 w-px shrink-0 bg-white/[0.08]" />

          {/* View Switcher: Visual vs Kode */}
          <div className="flex shrink-0 items-center rounded-lg border border-white/[0.08] bg-black/40 p-0.5">
            <Tooltip content="Editor Visual">
              <button
                type="button"
                onClick={() => handleViewChange("preview")}
                className={cn(
                  "focus-ring flex h-6 items-center gap-1 rounded-[5px] px-2 text-[10px] font-medium transition",
                  view === "preview"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
                aria-pressed={view === "preview"}
              >
                <Monitor className="size-3" />
                <span className="hidden md:inline">Visual</span>
              </button>
            </Tooltip>
            <Tooltip content="Editor Kode Sumber (Monaco)">
              <button
                type="button"
                onClick={() => handleViewChange("code")}
                className={cn(
                  "focus-ring flex h-6 items-center gap-1 rounded-[5px] px-2 text-[10px] font-medium transition",
                  view === "code"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
                aria-pressed={view === "code"}
              >
                <Code2 className="size-3" />
                <span className="hidden md:inline">Kode</span>
              </button>
            </Tooltip>
          </div>

          <span className="hidden sm:inline-block h-3.5 w-px shrink-0 bg-white/[0.08]" />

          {/* Responsive Device Switcher */}
          <div className="hidden sm:flex shrink-0 items-center gap-0.5 rounded-lg border border-white/[0.08] bg-black/40 p-0.5">
            {DEVICES.map((item) => {
               const Icon = item.icon;
               const active = device === item.id;
               return (
                <Tooltip key={item.id} content={`${item.label} (${item.hint})`}>
                  <button
                    type="button"
                    onClick={() => setDevice(item.id)}
                    className={cn(
                      "focus-ring grid size-6 place-items-center rounded-[5px] transition",
                      active
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300",
                    )}
                    aria-label={`Ukuran ${item.label}`}
                    aria-pressed={active}
                  >
                    <Icon className="size-3" />
                  </button>
                </Tooltip>
              );
            })}
          </div>

          {/* Viewport Scale Indicator */}
          <span className="hidden lg:inline-flex rounded border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 font-mono text-[8.5px] text-zinc-500">
            {Math.round(previewScale * 100)}%
          </span>
        </div>

        {/* Right section: History, Export & Inspector Toggle */}
        <div className="flex shrink-0 items-center gap-1">
          <div className="flex items-center gap-0.5 rounded-lg border border-white/[0.08] bg-black/40 p-0.5">
            <Tooltip content="Urungkan" shortcut="Ctrl+Z">
              <button
                type="button"
                onClick={undo}
                disabled={history.past.length === 0}
                className="focus-ring grid size-6 place-items-center rounded-[5px] text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label="Urungkan perubahan"
              >
                <Undo2 className="size-3" />
              </button>
            </Tooltip>
            <Tooltip content="Ulangi" shortcut="Ctrl+Y">
              <button
                type="button"
                onClick={redo}
                disabled={history.future.length === 0}
                className="focus-ring grid size-6 place-items-center rounded-[5px] text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label="Ulangi perubahan"
              >
                <Redo2 className="size-3" />
              </button>
            </Tooltip>
          </div>
          <span className="h-3.5 w-px shrink-0 bg-white/[0.08]" />

          {/* Audit / Pemeriksaan */}
          <Tooltip content={`Pemeriksaan Aksesibilitas & Link (${auditIssues.length} isu)`}>
            <button
              type="button"
              onClick={() => setAuditOpen(true)}
              className="focus-ring relative grid size-7 place-items-center rounded-md text-zinc-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Pemeriksaan Audit"
            >
              <ShieldCheck className="size-3.5" />
              {auditIssues.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-amber-500 font-mono text-[7px] font-bold text-black">
                  {auditIssues.length}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Global Theme */}
          <Tooltip content="Tema & Font Global">
            <button
              type="button"
              onClick={() => setGlobalThemeOpen(true)}
              className="focus-ring grid size-7 place-items-center rounded-md text-zinc-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Tema Global"
            >
              <Palette className="size-3.5" />
            </button>
          </Tooltip>

          {/* Page Settings (SEO) */}
          <Tooltip content="Pengaturan Halaman (SEO & Meta)">
            <button
              type="button"
              onClick={() => setPageSettingsOpen(true)}
              className="focus-ring grid size-7 place-items-center rounded-md text-zinc-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Pengaturan Halaman"
            >
              <Globe className="size-3.5" />
            </button>
          </Tooltip>

          {/* Version History */}
          <Tooltip content="Riwayat Versi & Snapshot">
            <button
              type="button"
              onClick={() => setVersionHistoryOpen(true)}
              className="focus-ring grid size-7 place-items-center rounded-md text-zinc-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Riwayat Versi"
            >
              <History className="size-3.5" />
            </button>
          </Tooltip>

          <span className="h-3.5 w-px shrink-0 bg-white/[0.08]" />

          {/* Export Dropdown */}
          <div className="relative">
            <div className="flex items-center rounded-md bg-[#3b82f6] text-white shadow-[0_2px_12px_rgba(59,130,246,0.3)]">
              <button
                type="button"
                onClick={() => void handleExport()}
                disabled={exporting}
                className="focus-ring inline-flex h-7 items-center gap-1.5 rounded-l-md px-2.5 text-[10.5px] font-medium transition hover:bg-[#2563eb] disabled:opacity-60"
                title="Ekspor project sebagai situs statis (.zip)"
              >
                {exporting ? (
                  <LoaderCircle className="size-3 animate-spin" />
                ) : (
                  <Download className="size-3" />
                )}
                <span className="hidden sm:inline">Ekspor</span>
              </button>
              <button
                type="button"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="grid size-7 place-items-center border-l border-white/20 rounded-r-md transition hover:bg-[#2563eb]"
                title="Pilihan ekspor lainnya"
              >
                <ChevronDown className="size-3" />
              </button>
            </div>

            {exportMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setExportMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl border border-white/10 bg-[#141418] p-1.5 shadow-2xl backdrop-blur-xl animate-fade-in text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setExportMenuOpen(false);
                      void handleExport();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-zinc-200 hover:bg-white/10"
                  >
                    <Download className="size-3.5 text-blue-400" />
                    <div>
                      <div className="font-medium text-[11px]">Situs Statis (.zip)</div>
                      <div className="text-[9.5px] text-zinc-400">Siap deploy ke hosting</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExportMenuOpen(false);
                      void handleExportBackup();
                    }}
                    className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-zinc-200 hover:bg-white/10"
                  >
                    <History className="size-3.5 text-purple-400" />
                    <div>
                      <div className="font-medium text-[11px]">Cadangan Proyek (.zip)</div>
                      <div className="text-[9.5px] text-zinc-400">Termasuk metadata & versi</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
          <span className="h-3.5 w-px shrink-0 bg-white/[0.08]" />

          {/* Inspector Toggle Button */}
          <Tooltip content={rightCollapsed ? "Buka Inspector" : "Tutup Inspector"}>
            <button
              type="button"
              onClick={() => setRightCollapsed(!rightCollapsed)}
              className={cn(
                "focus-ring grid size-7 place-items-center rounded-md transition",
                !rightCollapsed
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300",
              )}
              aria-label="Toggle inspector"
              aria-pressed={!rightCollapsed}
            >
              <SlidersHorizontal className="size-3.5" />
            </button>
          </Tooltip>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Narrow Left Icon Rail (48px fixed) */}
        <nav
          className="z-20 hidden md:flex w-12 shrink-0 flex-col items-center justify-between border-r border-white/[0.08] bg-[#0c0c10] py-2"
          aria-label="Navigasi Editor"
        >
          <div className="flex flex-col items-center gap-1 w-full">
            <Tooltip content="File Proyek" shortcut="Alt+1" side="right">
              <button
                type="button"
                onClick={() => {
                  if (leftTab === "files" && !leftCollapsed) {
                    setLeftCollapsed(true);
                  } else {
                    setLeftTab("files");
                    setLeftCollapsed(false);
                  }
                }}
                className={cn(
                  "focus-ring relative grid size-8.5 place-items-center rounded-lg transition",
                  leftTab === "files" && !leftCollapsed
                    ? "bg-[#3b82f6]/20 text-[#60a5fa]"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200",
                )}
                aria-label="File Proyek"
                aria-pressed={leftTab === "files" && !leftCollapsed}
              >
                <FolderTree className="size-4" />
                {leftTab === "files" && !leftCollapsed && (
                  <span className="absolute -left-1 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#3b82f6]" />
                )}
              </button>
            </Tooltip>

            <Tooltip content="Struktur DOM (Layers)" shortcut="Alt+2" side="right">
              <button
                type="button"
                onClick={() => {
                  if (leftTab === "layers" && !leftCollapsed) {
                    setLeftCollapsed(true);
                  } else {
                    setLeftTab("layers");
                    setLeftCollapsed(false);
                  }
                }}
                className={cn(
                  "focus-ring relative grid size-8.5 place-items-center rounded-lg transition",
                  leftTab === "layers" && !leftCollapsed
                    ? "bg-[#3b82f6]/20 text-[#60a5fa]"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200",
                )}
                aria-label="Layers DOM"
                aria-pressed={leftTab === "layers" && !leftCollapsed}
              >
                <Layers className="size-4" />
                {leftTab === "layers" && !leftCollapsed && (
                  <span className="absolute -left-1 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#3b82f6]" />
                )}
              </button>
            </Tooltip>

            <Tooltip content="Tambah Elemen" shortcut="Alt+3" side="right">
              <button
                type="button"
                onClick={() => {
                  if (leftTab === "add" && !leftCollapsed) {
                    setLeftCollapsed(true);
                  } else {
                    setLeftTab("add");
                    setLeftCollapsed(false);
                  }
                }}
                className={cn(
                  "focus-ring relative grid size-8.5 place-items-center rounded-lg transition",
                  leftTab === "add" && !leftCollapsed
                    ? "bg-[#3b82f6]/20 text-[#60a5fa]"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200",
                )}
                aria-label="Tambah Elemen"
                aria-pressed={leftTab === "add" && !leftCollapsed}
              >
                <Plus className="size-4" />
                {leftTab === "add" && !leftCollapsed && (
                  <span className="absolute -left-1 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#3b82f6]" />
                )}
              </button>
            </Tooltip>

            <Tooltip content="Asisten AI" shortcut="Alt+4" side="right">
              <button
                type="button"
                onClick={() => {
                  if (leftTab === "ai" && !leftCollapsed) {
                    setLeftCollapsed(true);
                  } else {
                    setLeftTab("ai");
                    setLeftCollapsed(false);
                  }
                }}
                className={cn(
                  "focus-ring relative grid size-8.5 place-items-center rounded-lg transition",
                  leftTab === "ai" && !leftCollapsed
                    ? "bg-[#3b82f6]/20 text-[#60a5fa]"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200",
                )}
                aria-label="Asisten AI"
                aria-pressed={leftTab === "ai" && !leftCollapsed}
              >
                <Sparkles className="size-4" />
                {leftTab === "ai" && !leftCollapsed && (
                  <span className="absolute -left-1 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#3b82f6]" />
                )}
              </button>
            </Tooltip>
          </div>

          <Tooltip content={leftCollapsed ? "Buka panel samping" : "Ciutkan panel samping"} side="right">
            <button
              type="button"
              onClick={() => setLeftCollapsed(!leftCollapsed)}
              className="focus-ring grid size-8.5 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
              aria-label="Toggle panel kiri"
            >
              {leftCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>
          </Tooltip>
        </nav>

        {/* 3. Left Resizable Panel Drawer (Desktop) */}
        {!leftCollapsed ? (
          <aside
            className="relative z-10 hidden md:flex h-full shrink-0 flex-col border-r border-white/[0.08] bg-[#0d0d11]"
            style={{ width: `${leftWidth}px` }}
          >
            {/* Header of left panel */}
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.07] px-3">
              <span className="text-[10.5px] font-semibold tracking-wide text-zinc-300 uppercase">
                {leftTab === "files" && "File Proyek"}
                {leftTab === "layers" && "Layers DOM"}
                {leftTab === "add" && "Tambah Elemen"}
                {leftTab === "ai" && "Asisten AI"}
              </span>
              <button
                type="button"
                onClick={() => setLeftCollapsed(true)}
                className="grid size-6 place-items-center rounded text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"
                title="Ciutkan panel"
              >
                <ChevronLeft className="size-3.5" />
              </button>
            </div>

            {/* Content of left panel */}
            <div className="min-h-0 flex-1 overflow-hidden">
              {leftTab === "files" && (
                <FilesPanel
                  files={history.present.files}
                  activePath={activePath}
                  activeCodePath={codeFilePath}
                  view={view}
                  onOpenFile={handleOpenFile}
                />
              )}
              {leftTab === "layers" && (
                <LayersPanel
                  html={activeHtml}
                  selectionId={selection?.id ?? null}
                  selectionTag={selection?.tag ?? null}
                  mode={mode}
                  onSelect={handleLayerSelect}
                  onAdd={handleAddElement}
                  onDuplicate={handleDuplicateElement}
                  onDelete={handleDeleteElement}
                  onMove={handleMoveElement}
                  onMoveTo={handleMoveElementTo}
                />
              )}
              {leftTab === "add" && (
                <AddPanel
                  selectionId={selection?.id ?? null}
                  selectionTag={selection?.tag ?? null}
                  canInsertInside={canInsertInside}
                  onAdd={handleAddElement}
                />
              )}
              {leftTab === "ai" && (
                <AiSidebar
                  html={activeHtml}
                  stylesheets={aiStylesheets}
                  selection={selection}
                  onApplyElement={handleApplyElement}
                  onApplyPage={handleApplyPage}
                  onClose={() => setLeftCollapsed(true)}
                />
              )}
            </div>

            {/* Draggable Resizer Handle */}
            <div
              onPointerDown={() => setIsResizing("left")}
              className="group absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-20"
              title="Geser untuk mengubah lebar panel"
            >
              <div className="mx-auto h-full w-0.5 bg-transparent group-hover:bg-[#3b82f6] transition-colors" />
            </div>
          </aside>
        ) : null}

        {/* 4. Center Canvas Preview / Code Pane */}
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#09090b]">
          {view === "code" ? (
            <div className="h-full min-h-0 p-2 sm:p-3">
              <div className="h-full overflow-hidden rounded-xl border border-white/[0.08] shadow-2xl">
                <CodePane
                  path={codeFilePath}
                  language={monacoLanguageForPath(codeFilePath)}
                  value={codeValue}
                  onChange={handleCodeChange}
                />
              </div>
            </div>
          ) : (
            <div className="canvas-dots relative flex min-h-0 flex-1 flex-col overflow-hidden p-2 sm:p-3.5">
              <div className="pointer-events-none absolute left-1/2 top-[-200px] h-[360px] w-[580px] -translate-x-1/2 rounded-full bg-blue-500/[0.055] blur-[100px]" />

              <div
                ref={stageRef}
                className="relative mx-auto flex h-full min-h-0 w-full flex-col transition-[max-width] duration-200 ease-out"
                style={{ maxWidth: activeDevice.width }}
              >
                {/* Device Window Frame Header */}
                <div className="flex h-8 shrink-0 items-center gap-2 rounded-t-xl border border-b-0 border-white/[0.09] bg-[#111115] px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[#ff6f70]/70" />
                    <span className="size-1.5 rounded-full bg-[#f3c458]/70" />
                    <span className="size-1.5 rounded-full bg-[#71d69a]/70" />
                  </div>
                  <span className="mx-0.5 h-3 w-px bg-white/[0.07]" />
                  <div className="flex min-w-0 flex-1 items-center justify-center">
                    <div className="flex h-5 max-w-[280px] flex-1 items-center justify-center gap-1.5 rounded-md border border-white/[0.055] bg-black/25 px-2 font-mono text-[8px] text-zinc-500">
                      <span className="size-1 shrink-0 rounded-full bg-emerald-400/70" />
                      <span className="truncate" title={activePath}>
                        {activePath || "Preview"}
                      </span>
                      <span className="hidden shrink-0 text-zinc-700 sm:inline">·</span>
                      <span className="hidden shrink-0 sm:inline">
                        {mode === "viewing" ? "lihat" : "sunting"}
                      </span>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 font-mono text-[8.5px] text-zinc-500">
                    <MousePointer2 className="size-2.5" />
                    {activeDevice.label}
                  </span>
                </div>

                {/* Iframe Preview Container */}
                <div className="relative min-h-0 flex-1 overflow-hidden rounded-b-xl border border-white/[0.09] bg-white shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
                  <iframe
                    key={previewKey}
                    ref={iframeRef}
                    title="Preview halaman"
                    srcDoc={srcDoc}
                    sandbox="allow-scripts allow-same-origin"
                    onLoad={handleFrameLoad}
                    className="h-full w-full border-0 bg-white"
                    style={{
                      width: `${deviceWidth}px`,
                      height: `${100 / previewScale}%`,
                      transform: `scale(${previewScale})`,
                      transformOrigin: "top left",
                    }}
                  />
                  {!frameReady ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0b0b0e]">
                      <div className="flex items-center gap-2 font-mono text-[10.5px] text-zinc-400">
                        <LoaderCircle className="size-3.5 animate-spin text-blue-400" />
                        Menyiapkan preview...
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Floating Pages Button (Bottom-Left Corner of Preview) */}
              <div className="absolute bottom-3 left-3 z-30">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPagesMenuOpen(!pagesMenuOpen)}
                    className="focus-ring flex h-8 items-center gap-2 rounded-lg border border-white/[0.12] bg-[#141418]/95 px-2.5 text-[11px] font-medium text-zinc-200 shadow-xl backdrop-blur-md transition hover:border-white/20 hover:bg-[#1a1a20]"
                    title="Daftar halaman HTML di project"
                  >
                    <FileCode2 className="size-3.5 text-blue-400" />
                    <span className="max-w-[130px] truncate">{activePath || "index.html"}</span>
                    <span className="rounded bg-white/10 px-1 py-0.2 font-mono text-[9px] text-zinc-400">
                      {htmlPaths.length} hal
                    </span>
                    <ChevronUp className={cn("size-3 text-zinc-400 transition-transform", pagesMenuOpen && "rotate-180")} />
                  </button>

                  {pagesMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setPagesMenuOpen(false)}
                      />
                      <div className="absolute bottom-full left-0 mb-1.5 z-50 w-56 rounded-xl border border-white/10 bg-[#141418] p-1.5 shadow-2xl backdrop-blur-xl animate-fade-in">
                        <div className="mb-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                          Halaman Proyek ({htmlPaths.length})
                        </div>
                        <div className="max-h-60 space-y-0.5 overflow-y-auto">
                          {htmlPaths.map((p) => {
                            const active = p === activePath;
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => {
                                  handleOpenFile(p);
                                  setPagesMenuOpen(false);
                                }}
                                className={cn(
                                  "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[11px] transition",
                                  active
                                    ? "bg-blue-500/15 font-medium text-blue-300"
                                    : "text-zinc-300 hover:bg-white/[0.05] hover:text-white",
                                )}
                              >
                                <span className="truncate">{p}</span>
                                {active ? (
                                  <Check className="size-3 text-blue-400 shrink-0" />
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                          <div className="mt-1.5 pt-1.5 border-t border-white/10">
                            <button
                              type="button"
                              onClick={() => {
                                setPagesMenuOpen(false);
                                setPageManagerOpen(true);
                              }}
                              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] py-1.5 text-center text-[10.5px] font-medium text-zinc-200 hover:bg-white/[0.08]"
                            >
                              <Layers className="size-3 text-blue-400" />
                              Kelola Halaman...
                            </button>
                          </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 5. Right Resizable Inspector Panel */}
        {!rightCollapsed ? (
          <aside
            className="relative z-10 hidden md:flex h-full shrink-0 flex-col border-l border-white/[0.08] bg-[#0d0d11]"
            style={{ width: `${rightWidth}px` }}
          >
            {/* Draggable Resizer Handle */}
            <div
              onPointerDown={() => setIsResizing("right")}
              className="group absolute -left-1 top-0 bottom-0 w-2 cursor-col-resize z-20"
              title="Geser untuk mengubah lebar inspector"
            >
              <div className="mx-auto h-full w-0.5 bg-transparent group-hover:bg-[#3b82f6] transition-colors" />
            </div>

            <PropertiesPanel
              selection={selection}
              mode={mode}
              device={device}
              imagePaths={projectImagePaths}
              onStyleChange={handleStyleChange}
              onTextChange={handleTextChange}
              onHrefChange={handleHrefChange}
              onImageUpload={(file) => void handleImageUpload(file)}
              onImageSelect={handleImageSelect}
              onSelectParent={handleSelectParent}
              onDelete={handleDeleteElement}
              onClose={() => setRightCollapsed(true)}
            />
          </aside>
        ) : null}

        {/* 6. Mobile & Small Screen Drawer Overlays */}
        {mobileDrawer ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              onClick={() => setMobileDrawer(null)}
              aria-label="Tutup panel"
            />
            <div className="fixed inset-y-0 left-0 z-50 w-[min(90vw,360px)] flex flex-col bg-[#0d0d11] shadow-2xl md:hidden animate-fade-in">
              <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.08] px-3.5">
                <span className="text-xs font-semibold text-zinc-200 uppercase">
                  {mobileDrawer === "left" && (
                    <>
                      {leftTab === "files" && "File Proyek"}
                      {leftTab === "layers" && "Layers DOM"}
                      {leftTab === "add" && "Tambah Elemen"}
                      {leftTab === "ai" && "Asisten AI"}
                    </>
                  )}
                  {mobileDrawer === "right" && "Inspector"}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileDrawer(null)}
                  className="grid size-7 place-items-center rounded-md text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                  aria-label="Tutup"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                {mobileDrawer === "left" && (
                  <>
                    {leftTab === "files" && (
                      <FilesPanel
                        files={history.present.files}
                        activePath={activePath}
                        activeCodePath={codeFilePath}
                        view={view}
                        onOpenFile={(p) => {
                          handleOpenFile(p);
                          setMobileDrawer(null);
                        }}
                      />
                    )}
                    {leftTab === "layers" && (
                      <LayersPanel
                        html={activeHtml}
                        selectionId={selection?.id ?? null}
                        selectionTag={selection?.tag ?? null}
                        mode={mode}
                        onSelect={(id) => {
                          handleLayerSelect(id);
                          setMobileDrawer(null);
                        }}
                        onAdd={(k, p) => {
                          handleAddElement(k, p);
                          setMobileDrawer(null);
                        }}
                        onDuplicate={handleDuplicateElement}
                        onDelete={handleDeleteElement}
                        onMove={handleMoveElement}
                        onMoveTo={handleMoveElementTo}
                      />
                    )}
                    {leftTab === "add" && (
                       <AddPanel
                         selectionId={selection?.id ?? null}
                         selectionTag={selection?.tag ?? null}
                         canInsertInside={canInsertInside}
                         onAdd={(k, p) => {
                           handleAddElement(k, p);
                           setMobileDrawer(null);
                         }}
                       />
                     )}
                     {leftTab === "ai" && (
                       <AiSidebar
                         html={activeHtml}
                         stylesheets={aiStylesheets}
                         selection={selection}
                         onApplyElement={handleApplyElement}
                         onApplyPage={handleApplyPage}
                         onClose={() => setMobileDrawer(null)}
                       />
                     )}
                   </>
                 )}
                 {mobileDrawer === "right" && (
                   <PropertiesPanel
                     selection={selection}
                     mode={mode}
                     device={device}
                     imagePaths={projectImagePaths}
                     onStyleChange={handleStyleChange}
                     onTextChange={handleTextChange}
                     onHrefChange={handleHrefChange}
                     onImageUpload={(file) => void handleImageUpload(file)}
                     onImageSelect={handleImageSelect}
                     onSelectParent={handleSelectParent}
                     onDelete={handleDeleteElement}
                     onClose={() => setMobileDrawer(null)}
                   />
                 )}
               </div>
             </div>
           </>
         ) : null}

         {/* 7. Mobile Bottom Navigation Bar (Area sentuh >= 40px) */}
         <div className="md:hidden fixed bottom-0 inset-x-0 z-30 flex h-12 items-center justify-around border-t border-white/[0.08] bg-[#101014]/95 px-2 backdrop-blur-xl">
           <button
             type="button"
             onClick={() => {
               setLeftTab("files");
               setMobileDrawer("left");
             }}
             className="flex min-h-[40px] min-w-[40px] flex-col items-center justify-center gap-0.5 text-zinc-400 active:text-white"
           >
             <FolderTree className="size-4" />
             <span className="text-[9px]">File</span>
           </button>
           <button
             type="button"
             onClick={() => {
               setLeftTab("layers");
               setMobileDrawer("left");
             }}
             className="flex min-h-[40px] min-w-[40px] flex-col items-center justify-center gap-0.5 text-zinc-400 active:text-white"
           >
             <Layers className="size-4" />
             <span className="text-[9px]">Layers</span>
           </button>
           <button
             type="button"
             onClick={() => {
               setLeftTab("add");
               setMobileDrawer("left");
             }}
             className="flex min-h-[40px] min-w-[40px] flex-col items-center justify-center gap-0.5 text-blue-400 active:text-blue-300"
           >
             <Plus className="size-4.5" />
             <span className="text-[9px]">Tambah</span>
           </button>
           <button
             type="button"
             onClick={() => {
               setLeftTab("ai");
               setMobileDrawer("left");
             }}
             className="flex min-h-[40px] min-w-[40px] flex-col items-center justify-center gap-0.5 text-zinc-400 active:text-white"
           >
             <Sparkles className="size-4" />
             <span className="text-[9px]">AI</span>
           </button>
           <button
             type="button"
             onClick={() => setMobileDrawer("right")}
             className="flex min-h-[40px] min-w-[40px] flex-col items-center justify-center gap-0.5 text-zinc-400 active:text-white"
           >
             <SlidersHorizontal className="size-4" />
             <span className="text-[9px]">Inspector</span>
           </button>
         </div>

         {/* 8. Invisible Pointer Shield while Resizing */}
         {isResizing !== null ? (
           <div className="fixed inset-0 z-[100] cursor-col-resize select-none" />
         ) : null}
       </div>

      <PageSettingsModal
        open={pageSettingsOpen}
        onClose={() => setPageSettingsOpen(false)}
        activePath={activePath}
        html={activeHtml}
        onSave={handleSavePageMetadata}
      />
      <GlobalThemeModal
        open={globalThemeOpen}
        onClose={() => setGlobalThemeOpen(false)}
        currentTheme={baseProjectRef.current?.globalTheme}
        onSave={handleSaveGlobalTheme}
      />
      <VersionHistoryModal
        open={versionHistoryOpen}
        onClose={() => setVersionHistoryOpen(false)}
        versions={baseProjectRef.current?.versions || []}
        onCreateSnapshot={createVersionSnapshot}
        onRestoreVersion={handleRestoreVersion}
      />
      <PageManagerModal
        open={pageManagerOpen}
        onClose={() => setPageManagerOpen(false)}
        pages={htmlPaths}
        activePage={activePath}
        onSelectPage={handleOpenFile}
        onCreatePage={handleCreatePage}
        onRenamePage={handleRenamePage}
        onDuplicatePage={handleDuplicatePage}
        onDeletePage={handleDeletePage}
        onReorderPages={handleReorderPages}
      />
      <AuditModal
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
        html={activeHtml}
        onSelectElement={(id) => {
          handleLayerSelect(id);
          setAuditOpen(false);
        }}
      />
    </div>
  );
}
