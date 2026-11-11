"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  FileImage,
  FileText,
  Folder,
  FolderOpen,
  Globe2,
} from "lucide-react";
import {
  fileExtension,
  isCssPath,
  isHtmlPath,
  isImagePath,
  isJavaScriptPath,
  isSvgPath,
  type ProjectFile,
  type ProjectFiles,
} from "@/lib/project-files";
import { cn } from "@/lib/utils";

type ViewMode = "preview" | "code";

interface FileNode {
  type: "file";
  name: string;
  path: string;
  file: ProjectFile;
}

interface FolderNode {
  type: "folder";
  name: string;
  path: string;
  children: TreeNode[];
}

type TreeNode = FileNode | FolderNode;

function buildTree(files: ProjectFiles): FolderNode {
  const root: FolderNode = { type: "folder", name: "", path: "", children: [] };

  for (const path of Object.keys(files).sort((a, b) => a.localeCompare(b))) {
    const segments = path.split("/");
    let current = root;

    for (let index = 0; index < segments.length - 1; index += 1) {
      const name = segments[index];
      const folderPath = segments.slice(0, index + 1).join("/");
      let folder = current.children.find(
        (node): node is FolderNode =>
          node.type === "folder" && node.name === name,
      );
      if (!folder) {
        folder = { type: "folder", name, path: folderPath, children: [] };
        current.children.push(folder);
      }
      current = folder;
    }

    const name = segments[segments.length - 1];
    current.children.push({
      type: "file",
      name,
      path,
      file: files[path],
    });
  }

  const sort = (node: FolderNode) => {
    node.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const child of node.children) {
      if (child.type === "folder") sort(child);
    }
  };
  sort(root);
  return root;
}

function FileIcon({ path }: { path: string }) {
  if (isHtmlPath(path)) {
    return <Globe2 className="size-3.5 shrink-0 text-sky-400/90" />;
  }
  if (isCssPath(path)) {
    return <FileCode2 className="size-3.5 shrink-0 text-violet-400/90" />;
  }
  if (isJavaScriptPath(path)) {
    return <FileCode2 className="size-3.5 shrink-0 text-amber-400/90" />;
  }
  if (isSvgPath(path)) {
    return <FileCode2 className="size-3.5 shrink-0 text-orange-400/90" />;
  }
  if (isImagePath(path)) {
    return <FileImage className="size-3.5 shrink-0 text-emerald-400/80" />;
  }
  if (fileExtension(path) === "json") {
    return <FileText className="size-3.5 shrink-0 text-yellow-400/70" />;
  }
  return <FileText className="size-3.5 shrink-0 text-zinc-500" />;
}

export default function FilesPanel({
  files,
  activePath,
  activeCodePath,
  view,
  onOpenFile,
}: {
  files: ProjectFiles;
  activePath: string;
  activeCodePath: string;
  view: ViewMode;
  onOpenFile: (path: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const tree = useMemo(() => buildTree(files), [files]);
  const fileCount = Object.keys(files).length;

  function toggleFolder(path: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function renderNodes(nodes: TreeNode[], depth: number): ReactNode {
    return nodes.map((node) => {
      if (node.type === "folder") {
        const isCollapsed = collapsed.has(node.path);
        return (
          <div key={`folder:${node.path}`}>
            <button
              type="button"
              onClick={() => toggleFolder(node.path)}
              aria-expanded={!isCollapsed}
              className="focus-ring flex h-7 w-full items-center gap-1.5 rounded-md pr-2 text-left text-[10.5px] text-zinc-400 transition hover:bg-white/[0.045] hover:text-zinc-200"
              style={{ paddingLeft: 8 + depth * 12 }}
              title={node.path}
            >
              {isCollapsed ? (
                <ChevronRight className="size-3 shrink-0 text-zinc-600" />
              ) : (
                <ChevronDown className="size-3 shrink-0 text-zinc-600" />
              )}
              {isCollapsed ? (
                <Folder className="size-3.5 shrink-0 text-zinc-500" />
              ) : (
                <FolderOpen className="size-3.5 shrink-0 text-[#8ea9ff]/80" />
              )}
              <span className="truncate">{node.name}</span>
            </button>
            {isCollapsed ? null : renderNodes(node.children, depth + 1)}
          </div>
        );
      }

      const isActive =
        view === "code"
          ? node.path === activeCodePath
          : node.path === activePath;
      const isActivePage = node.path === activePath;

      return (
        <button
          key={`file:${node.path}`}
          type="button"
          onClick={() => onOpenFile(node.path)}
          className={cn(
            "focus-ring group flex h-7 w-full items-center gap-1.5 rounded-md pr-2 text-left text-[10.5px] transition",
            isActive
              ? "bg-[#5b8cff]/12 text-[#cedbff]"
              : "text-zinc-400 hover:bg-white/[0.045] hover:text-zinc-200",
          )}
          style={{ paddingLeft: 8 + depth * 12 + 12 }}
          aria-label={`Buka file ${node.path}`}
          title={node.path}
        >
          <FileIcon path={node.path} />
          <span className="min-w-0 flex-1 truncate">{node.name}</span>
          {isActivePage ? (
            <span
              className="size-1.5 shrink-0 rounded-full bg-emerald-400/80"
              title="Halaman aktif"
            />
          ) : null}
        </button>
      );
    });
  }

  return (
    <section className="flex h-[clamp(168px,29vh,264px)] shrink-0 flex-col border-b border-white/[0.07]">
      <div className="flex h-9 shrink-0 items-center justify-between gap-2 px-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            File project
          </span>
          <span className="rounded border border-white/[0.06] bg-white/[0.025] px-1.5 py-0.5 font-mono text-[8px] text-zinc-600">
            {fileCount}
          </span>
        </div>
        <span className="truncate font-mono text-[8px] text-zinc-600" title={activePath}>
          {activePath}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {tree.children.length > 0 ? (
          renderNodes(tree.children, 0)
        ) : (
          <p className="px-3 py-6 text-center text-[10px] text-zinc-600">
            Belum ada file.
          </p>
        )}
      </div>
    </section>
  );
}
