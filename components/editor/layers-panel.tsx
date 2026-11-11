"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Box,
  ChevronDown,
  ChevronRight,
  Copy,
  GripVertical,
  Heading2,
  Image as ImageIcon,
  Layers,
  LayoutPanelTop,
  Link2,
  MousePointer2,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import {
  canInsertInsideTag,
  getDomTree,
  type DomTreeNode,
  type InsertPosition,
  type NewElementKind,
} from "@/lib/html";
import { cn } from "@/lib/utils";

type DropPosition = "before" | "after" | "inside";

const ADD_ITEMS: Array<{
  kind: NewElementKind;
  label: string;
  description: string;
  icon: typeof Type;
}> = [
  { kind: "text", label: "Teks", description: "Paragraf", icon: Type },
  { kind: "heading", label: "Heading", description: "Judul H2", icon: Heading2 },
  { kind: "button", label: "Tombol", description: "Tombol aksi", icon: MousePointer2 },
  { kind: "image", label: "Gambar", description: "Placeholder", icon: ImageIcon },
  { kind: "link", label: "Link", description: "Tautan teks", icon: Link2 },
  { kind: "container", label: "Container", description: "Pembungkus", icon: Box },
  { kind: "section", label: "Section", description: "Blok halaman", icon: LayoutPanelTop },
];

interface NodePath {
  ancestors: string[];
  siblings: DomTreeNode[];
  index: number;
}

function findNodePath(
  node: DomTreeNode,
  id: string,
  ancestors: string[] = [],
  siblings: DomTreeNode[] = [],
): NodePath | null {
  if (node.id === id) {
    return {
      ancestors,
      siblings,
      index: siblings.findIndex((item) => item.id === id),
    };
  }
  const nextAncestors = [...ancestors, node.id];
  for (const child of node.children) {
    const found = findNodePath(child, id, nextAncestors, node.children);
    if (found) return found;
  }
  return null;
}

function countNodes(node: DomTreeNode): number {
  return 1 + node.children.reduce((total, child) => total + countNodes(child), 0);
}

function nodeLabel(node: DomTreeNode): string {
  if (node.className) {
    return node.className
      .trim()
      .split(/\s+/)
      .map((className) => `.${className}`)
      .join(" ");
  }
  return node.text;
}

export default function LayersPanel({
  html,
  selectionId,
  selectionTag,
  mode,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onMove,
  onMoveTo,
}: {
  html: string;
  selectionId: string | null;
  selectionTag: string | null;
  mode: "editing" | "viewing";
  onSelect: (id: string) => void;
  onAdd: (kind: NewElementKind, position: InsertPosition) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
  onMoveTo: (sourceId: string, targetId: string, position: DropPosition) => void;
}) {
  const tree = useMemo(() => getDomTree(html), [html]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const [insertPosition, setInsertPosition] = useState<InsertPosition>("inside");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    position: DropPosition;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());
  const lastRevealedRef = useRef<string | null>(null);
  const editing = mode === "editing";

  const selectedPath = useMemo(() => {
    if (!tree || !selectionId) return null;
    return findNodePath(tree, selectionId);
  }, [selectionId, tree]);

  const canMoveUp = Boolean(selectedPath && selectedPath.index > 0);
  const canMoveDown = Boolean(
    selectedPath &&
      selectedPath.index >= 0 &&
      selectedPath.index < selectedPath.siblings.length - 1,
  );
  const canInsertInside = selectionTag
    ? canInsertInsideTag(selectionTag)
    : true;
  const elementCount = tree ? countNodes(tree) : 0;

  useEffect(() => {
    if (!selectionId) {
      lastRevealedRef.current = null;
      return;
    }
    if (!selectedPath) return;

    const parents = selectedPath.ancestors;
    if (parents.length) {
      setCollapsed((current) => {
        let changed = false;
        const next = new Set(current);
        for (const id of parents) {
          if (next.delete(id)) changed = true;
        }
        return changed ? next : current;
      });
    }

    if (lastRevealedRef.current === selectionId) return;
    lastRevealedRef.current = selectionId;
    const timer = window.setTimeout(() => {
      rowRefs.current.get(selectionId)?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    }, 20);
    return () => window.clearTimeout(timer);
  }, [selectedPath, selectionId]);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function toggleCollapsed(id: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openMenu() {
    if (!editing) return;
    setInsertPosition(canInsertInside ? "inside" : "after");
    setMenuOpen((current) => !current);
  }

  function chooseAdd(kind: NewElementKind) {
    onAdd(kind, insertPosition);
    setMenuOpen(false);
  }

  function handleDragStart(event: DragEvent<HTMLButtonElement>, node: DomTreeNode) {
    if (!editing) {
      event.preventDefault();
      return;
    }
    event.stopPropagation();
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", node.id);
    setDragId(node.id);
    setDropTarget(null);
  }

  function resolveDropPosition(
    event: DragEvent<HTMLButtonElement>,
    node: DomTreeNode,
  ): DropPosition {
    if (node.tag === "body") return "inside";
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / Math.max(rect.height, 1);
    let position: DropPosition =
      ratio < 0.3 ? "before" : ratio > 0.7 ? "after" : "inside";
    if (position === "inside" && !canInsertInsideTag(node.tag)) {
      position = ratio < 0.5 ? "before" : "after";
    }
    return position;
  }

  function handleDragOver(event: DragEvent<HTMLButtonElement>, node: DomTreeNode) {
    if (!dragId || dragId === node.id) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    const position = resolveDropPosition(event, node);
    setDropTarget((current) =>
      current?.id === node.id && current.position === position
        ? current
        : { id: node.id, position },
    );
  }

  function handleDragLeave(event: DragEvent<HTMLButtonElement>, node: DomTreeNode) {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
    setDropTarget((current) =>
      current?.id === node.id ? null : current,
    );
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>, node: DomTreeNode) {
    event.preventDefault();
    event.stopPropagation();
    const sourceId = dragId ?? event.dataTransfer.getData("text/plain");
    const position =
      dropTarget?.id === node.id
        ? dropTarget.position
        : resolveDropPosition(event, node);
    setDragId(null);
    setDropTarget(null);
    if (!sourceId || sourceId === node.id) return;
    onMoveTo(sourceId, node.id, position);
  }

  function renderNode(node: DomTreeNode, depth: number) {
    const hasChildren = node.children.length > 0;
    const expanded = hasChildren && !collapsed.has(node.id);
    const selected = node.id === selectionId;
    const detail = nodeLabel(node);
    const drop = dropTarget?.id === node.id ? dropTarget.position : null;
    const dragging = dragId === node.id;

    return (
      <div key={node.id}>
        <button
          ref={(element) => {
            if (element) rowRefs.current.set(node.id, element);
            else rowRefs.current.delete(node.id);
          }}
          type="button"
          draggable={editing}
          onDragStart={(event) => handleDragStart(event, node)}
          onDragEnd={() => {
            setDragId(null);
            setDropTarget(null);
          }}
          onDragOver={(event) => handleDragOver(event, node)}
          onDragLeave={(event) => handleDragLeave(event, node)}
          onDrop={(event) => handleDrop(event, node)}
          onClick={() => onSelect(node.id)}
          aria-current={selected ? "true" : undefined}
          aria-expanded={hasChildren ? expanded : undefined}
          className={cn(
            "focus-ring group relative flex h-7 w-full touch-manipulation items-center gap-1 rounded-md pr-1.5 text-left transition",
            selected
              ? "bg-[#5b8cff]/16 text-[#dbe6ff]"
              : "text-zinc-400 hover:bg-white/[0.045] hover:text-zinc-200",
            dragging && "opacity-45",
            drop === "inside" && "bg-[#5b8cff]/20 ring-1 ring-inset ring-[#6e9bff]/70",
            drop === "before" &&
              "before:absolute before:inset-x-1 before:top-0 before:h-0.5 before:rounded-full before:bg-[#7da4ff]",
            drop === "after" &&
              "after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[#7da4ff]",
          )}
          style={{ paddingLeft: 4 + depth * 12 }}
          title={
            node.className
              ? `${node.tag} · ${node.className}${node.text ? ` · ${node.text}` : ""}`
              : `${node.tag}${node.text ? ` · ${node.text}` : ""}`
          }
          aria-label={`Pilih elemen ${node.tag}${node.className ? ` ${node.className}` : ""}`}
        >
          {hasChildren ? (
            <span
              role="presentation"
              onClick={(event) => {
                event.stopPropagation();
                toggleCollapsed(node.id);
              }}
              className="grid size-3.5 shrink-0 place-items-center rounded text-zinc-600 hover:bg-white/[0.07] hover:text-zinc-300"
            >
              {expanded ? (
                <ChevronDown className="size-3" />
              ) : (
                <ChevronRight className="size-3" />
              )}
            </span>
          ) : (
            <span className="size-3.5 shrink-0" />
          )}

          <GripVertical className="size-2.5 shrink-0 text-zinc-700 opacity-0 transition group-hover:opacity-100" />
          <span
            className={cn(
              "shrink-0 font-mono text-[9.5px] font-semibold",
              selected ? "text-[#b9ceff]" : "text-[#8fa9e8]",
            )}
          >
            {node.tag}
          </span>
          {detail ? (
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-[9px]",
                node.className
                  ? selected
                    ? "text-[#c9d8ff]/75"
                    : "text-zinc-500"
                  : "text-zinc-600",
              )}
            >
              {detail}
            </span>
          ) : null}
          {node.id === "ve-0" ? (
            <span className="shrink-0 rounded bg-white/[0.04] px-1 font-mono text-[7px] uppercase tracking-wide text-zinc-600">
              root
            </span>
          ) : null}
        </button>

        {expanded ? (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        ) : null}
      </div>
    );
  }

  return (
    <section className="relative flex h-[clamp(188px,28vh,280px)] shrink-0 flex-col border-b border-white/[0.07]">
      <div className="flex h-9 shrink-0 items-center justify-between gap-2 px-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <Layers className="size-3 text-zinc-600" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Layers
          </span>
          <span className="rounded border border-white/[0.06] bg-white/[0.025] px-1.5 py-0.5 font-mono text-[8px] text-zinc-600">
            {elementCount}
          </span>
        </div>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={openMenu}
            disabled={!editing}
            className={cn(
              "focus-ring inline-flex h-6 items-center gap-1 rounded-md border px-1.5 text-[9px] font-semibold transition",
              editing
                ? "border-[#5b8cff]/25 bg-[#5b8cff]/12 text-[#b8ccff] hover:border-[#5b8cff]/40 hover:bg-[#5b8cff]/18"
                : "cursor-not-allowed border-white/[0.05] bg-white/[0.02] text-zinc-600",
            )}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title={editing ? "Tambah elemen" : "Aktifkan mode Edit untuk menambah elemen"}
          >
            <Plus className="size-3" />
            Tambah
            <ChevronDown className="size-2.5 opacity-70" />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-7 z-50 w-[218px] overflow-hidden rounded-xl border border-white/[0.11] bg-[#121216] p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
              <div className="mb-1.5 rounded-lg border border-white/[0.06] bg-black/20 p-1">
                <p className="px-1.5 pb-1 text-[8px] font-semibold uppercase tracking-[0.09em] text-zinc-600">
                  Sisipkan
                </p>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setInsertPosition("inside")}
                    disabled={!canInsertInside}
                    className={cn(
                      "focus-ring h-6 rounded-md text-[9px] font-medium transition",
                      insertPosition === "inside"
                        ? "bg-white/[0.09] text-zinc-100"
                        : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300",
                      !canInsertInside && "cursor-not-allowed opacity-35",
                    )}
                  >
                    Di dalam
                  </button>
                  <button
                    type="button"
                    onClick={() => setInsertPosition("after")}
                    disabled={!selectionTag || selectionTag === "body"}
                    className={cn(
                      "focus-ring h-6 rounded-md text-[9px] font-medium transition",
                      insertPosition === "after"
                        ? "bg-white/[0.09] text-zinc-100"
                        : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300",
                      (!selectionTag || selectionTag === "body") &&
                        "cursor-not-allowed opacity-35",
                    )}
                  >
                    Setelah
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1" role="menu">
                {ADD_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.kind}
                      type="button"
                      role="menuitem"
                      onClick={() => chooseAdd(item.kind)}
                      className="focus-ring flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-white/[0.055]"
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-md border border-white/[0.06] bg-white/[0.025] text-zinc-500">
                        <Icon className="size-3" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[9.5px] font-medium text-zinc-300">
                          {item.label}
                        </span>
                        <span className="block truncate text-[8px] text-zinc-600">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex h-7 shrink-0 items-center gap-0.5 border-y border-white/[0.045] bg-black/10 px-2">
        <button
          type="button"
          onClick={onDuplicate}
          disabled={!editing || !selectionId}
          className="focus-ring grid size-5.5 place-items-center rounded text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-25"
          title="Duplikat elemen (Ctrl/Cmd+D)"
          aria-label="Duplikat elemen"
        >
          <Copy className="size-3" />
        </button>
        <button
          type="button"
          onClick={() => onMove("up")}
          disabled={!editing || !canMoveUp}
          className="focus-ring grid size-5.5 place-items-center rounded text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-25"
          title="Naikkan urutan"
          aria-label="Naikkan urutan elemen"
        >
          <ArrowUp className="size-3" />
        </button>
        <button
          type="button"
          onClick={() => onMove("down")}
          disabled={!editing || !canMoveDown}
          className="focus-ring grid size-5.5 place-items-center rounded text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-25"
          title="Turunkan urutan"
          aria-label="Turunkan urutan elemen"
        >
          <ArrowDown className="size-3" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={!editing || !selectionId}
          className="focus-ring grid size-5.5 place-items-center rounded text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-25"
          title="Hapus elemen (Delete)"
          aria-label="Hapus elemen"
        >
          <Trash2 className="size-3" />
        </button>
        <span className="mx-1 h-3 w-px bg-white/[0.06]" />
        <span className="truncate text-[8px] text-zinc-600">
          {selectionId
            ? "Tarik node untuk memindah urutan"
            : "Pilih node atau elemen di preview"}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-1">
        {tree ? (
          renderNode(tree, 0)
        ) : (
          <p className="px-3 py-6 text-center text-[10px] text-zinc-600">
            Struktur DOM belum tersedia.
          </p>
        )}
      </div>
    </section>
  );
}
