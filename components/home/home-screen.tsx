"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Code2,
  FileUp,
  HardDrive,
  LayoutTemplate,
  LoaderCircle,
  MousePointer2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  WandSparkles,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Modal } from "@/components/ui/modal";
import { ToastViewport, useToast } from "@/components/ui/toast";
import { getHtmlSummary } from "@/lib/html";
import {
  cleanProjectName,
  deleteProject,
  fileStem,
  formatRelativeTime,
  makeProject,
  makeProjectFromFiles,
  readProjects,
  saveProjectAsync,
  validateProjectFile,
  type Project,
  type ProjectVersion,
} from "@/lib/projects";
import {
  importProjectZip,
  normalizeProjectPath,
  projectNameFromFilename,
} from "@/lib/project-files";
import {
  DEFAULT_TEMPLATE,
  PROJECT_TEMPLATES,
  type ProjectTemplate,
} from "@/lib/templates";
import TemplateGallery from "@/components/templates/template-gallery";
import { cn } from "@/lib/utils";

const PREVIEW_PALETTES = [
  {
    bg: "linear-gradient(145deg, #ecf3ff 0%, #f9fbff 48%, #dbe8ff 100%)",
    text: "#172554",
    muted: "#64748b",
    accent: "#3c6ff2",
    chip: "#e2ebff",
  },
  {
    bg: "linear-gradient(145deg, #fdf1dd 0%, #fffaf2 50%, #f6dfb8 100%)",
    text: "#3e2a14",
    muted: "#806e58",
    accent: "#b96c24",
    chip: "#f8e8ce",
  },
  {
    bg: "linear-gradient(145deg, #e8f7ec 0%, #f8fdf9 48%, #d1edda 100%)",
    text: "#173b2b",
    muted: "#64796e",
    accent: "#2f855a",
    chip: "#d8f0e1",
  },
  {
    bg: "linear-gradient(145deg, #f1eaff 0%, #fbf9ff 48%, #e5d7ff 100%)",
    text: "#2e2050",
    muted: "#756b8c",
    accent: "#7a54d6",
    chip: "#eadfff",
  },
  {
    bg: "linear-gradient(145deg, #feecef 0%, #fff9fa 48%, #f8d6dd 100%)",
    text: "#4a1d2a",
    muted: "#856c74",
    accent: "#ca4b69",
    chip: "#f9dfe5",
  },
];

function getPalette(id: string) {
  const hash = Array.from(id).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return PREVIEW_PALETTES[hash % PREVIEW_PALETTES.length];
}

function ProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: (project: Project) => void;
}) {
  const summary = useMemo(
    () => project.summary ?? getHtmlSummary(project.html),
    [project.summary, project.html],
  );
  const palette = getPalette(project.id);
  const heading = summary.heading || project.name;
  const kicker = summary.title || "Halaman baru";
  const metaLabel =
    (project.fileCount ?? 1) > 1
      ? `${project.fileCount} file`
      : `${summary.elementCount} elemen`;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/[0.075] bg-[#0f0f12] transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
      <Link
        href={`/editor/${project.id}`}
        className="focus-ring block rounded-2xl"
        aria-label={`Buka project ${project.name}`}
      >
        <div
          className="relative aspect-[16/10] overflow-hidden p-4 sm:p-5"
          style={{ background: palette.bg }}
        >
          <div className="absolute inset-x-7 top-7 bottom-0 overflow-hidden rounded-t-[10px] bg-white/95 shadow-[0_20px_60px_rgba(28,37,65,0.18)] ring-1 ring-black/[0.05]">
            <div className="flex h-6 items-center gap-1.5 border-b border-black/[0.055] px-3">
              <span className="size-1.5 rounded-full bg-[#ff8f8f]" />
              <span className="size-1.5 rounded-full bg-[#ffd47a]" />
              <span className="size-1.5 rounded-full bg-[#9be1af]" />
              <span className="ml-2 h-2 w-20 rounded-full bg-black/[0.045]" />
            </div>
            <div className="px-5 pt-5">
              <div className="mb-2.5 flex items-center gap-1.5">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: palette.accent }}
                />
                <span
                  className="max-w-[65%] truncate font-mono text-[7px] font-semibold uppercase tracking-[0.13em]"
                  style={{ color: palette.accent }}
                >
                  {kicker}
                </span>
              </div>
              <h3
                className="line-clamp-2 max-w-[94%] font-serif text-[22px] leading-[1.03] tracking-[-0.045em] sm:text-[26px]"
                style={{ color: palette.text }}
              >
                {heading}
              </h3>
              <div className="mt-3 space-y-1.5">
                <span className="block h-1.5 w-[74%] rounded-full bg-black/[0.08]" />
                <span className="block h-1.5 w-[52%] rounded-full bg-black/[0.045]" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className="inline-flex h-5 items-center rounded-[5px] px-2.5 text-[7px] font-bold text-white"
                  style={{ backgroundColor: palette.accent }}
                >
                  Mulai
                </span>
                <span
                  className="inline-flex h-5 items-center rounded-[5px] px-2.5 text-[7px] font-semibold"
                  style={{ backgroundColor: palette.chip, color: palette.text }}
                >
                  Lihat karya
                </span>
              </div>
            </div>
          </div>
          <div className="absolute right-3 top-3 hidden items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/80 px-2.5 py-1 text-[9px] font-semibold text-zinc-600 shadow-sm backdrop-blur sm:flex">
            <span className="size-1 rounded-full bg-emerald-500" />
            {metaLabel}
          </div>
          <span className="absolute bottom-3 right-3 flex size-8 translate-y-2 items-center justify-center rounded-full bg-[#151519] text-white opacity-0 shadow-xl transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowRight className="size-3.5" />
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0">
            <h2 className="truncate text-[13px] font-semibold tracking-[-0.01em] text-zinc-100">
              {project.name}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-zinc-500">
              <Clock3 className="size-3 shrink-0" />
              Diperbarui {formatRelativeTime(project.updatedAt)}
            </p>
          </div>
          <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-white/[0.07] text-zinc-500 transition group-hover:border-white/[0.12] group-hover:text-zinc-200">
            <ArrowRight className="size-3.5" />
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => onDelete(project)}
        className="focus-ring absolute right-3 top-3 z-10 grid size-7 place-items-center rounded-lg border border-black/10 bg-white/90 text-zinc-500 opacity-100 shadow-sm backdrop-blur transition hover:bg-white hover:text-red-500 focus-visible:opacity-100 sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
        aria-label={`Hapus project ${project.name}`}
        title="Hapus project"
      >
        <Trash2 className="size-3.5" />
      </button>
    </article>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]" aria-hidden="true">
      <div className="absolute left-[12%] top-[8%] h-40 w-40 rounded-full bg-blue-500/20 blur-[70px]" />
      <div className="absolute bottom-[8%] right-[4%] h-44 w-44 rounded-full bg-violet-500/15 blur-[80px]" />

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d0d10]/95 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur">
        <div className="flex h-10 items-center gap-2 border-b border-white/[0.07] px-3.5">
          <span className="size-2 rounded-full bg-[#ff6f70]/80" />
          <span className="size-2 rounded-full bg-[#f3c458]/80" />
          <span className="size-2 rounded-full bg-[#71d69a]/80" />
          <div className="mx-auto flex h-5 w-[42%] items-center justify-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.025] font-mono text-[7px] text-zinc-600">
            editor.preview
          </div>
          <span className="h-5 w-11 rounded-md bg-[#5b8cff] text-center text-[7px] font-bold leading-5 text-white">
            Ekspor
          </span>
        </div>

        <div className="flex h-[284px] sm:h-[330px]">
          <div className="hidden w-[28%] flex-col border-r border-white/[0.06] p-3 sm:flex">
            <div className="mb-3 flex items-center gap-1.5 text-[8px] font-semibold text-zinc-300">
              <Sparkles className="size-2.5 text-[#7da4ff]" />
              Asisten AI
            </div>
            <div className="rounded-md border border-white/[0.06] bg-white/[0.025] p-2 text-[6.5px] leading-3 text-zinc-500">
              Rapikan hero dan buat CTA lebih menonjol.
            </div>
            <div className="ml-4 mt-2 rounded-md bg-[#5b8cff]/15 p-2 text-[6.5px] leading-3 text-blue-200">
              Siap. Saya ubah hanya elemen yang dipilih.
            </div>
            <div className="mt-auto flex h-7 items-center justify-between rounded-md border border-white/[0.07] px-2 text-[6.5px] text-zinc-600">
              Tulis instruksi...
              <span className="grid size-4 place-items-center rounded bg-white/10">
                <ArrowRight className="size-2 text-zinc-300" />
              </span>
            </div>
          </div>

          <div className="canvas-dots relative flex flex-1 items-center justify-center overflow-hidden bg-[#09090b] p-3.5">
            <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#f8f4ed] shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-serif text-[11px] font-semibold tracking-[-0.04em] text-[#15140f]">
                  nara.
                </span>
                <div className="flex gap-2">
                  <span className="h-1 w-4 rounded-full bg-black/15" />
                  <span className="h-1 w-4 rounded-full bg-black/10" />
                  <span className="h-1 w-4 rounded-full bg-black/10" />
                </div>
              </div>
              <div className="relative px-4 pt-5">
                <div className="mb-3 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-[#b45d38]" />
                  <span className="font-mono text-[5.5px] font-bold uppercase tracking-[0.12em] text-[#9c5c3d]">
                    Living, slowly
                  </span>
                </div>
                <p className="max-w-[78%] font-serif text-[25px] leading-[0.98] tracking-[-0.055em] text-[#201d18] sm:text-[31px]">
                  Ruang untuk hidup yang lebih pelan.
                </p>
                <p className="mt-2.5 max-w-[66%] text-[6.5px] leading-3 text-[#756d61]">
                  Furnitur dan objek untuk rumah yang terasa seperti kamu.
                </p>
                <span className="mt-3 inline-flex h-5 items-center rounded-full bg-[#28372d] px-3 text-[5.5px] font-bold text-white">
                  Jelajahi koleksi
                </span>
                <div className="absolute bottom-1.5 right-2 size-24 rounded-full bg-[linear-gradient(145deg,#ddc3a8,#9c6f4c)] opacity-90 sm:size-28" />
                <div className="absolute right-10 top-10 size-10 rounded-full border border-[#201d18]/10" />
              </div>
              <div className="absolute inset-x-4 bottom-4 flex h-5 items-center justify-between border-t border-black/[0.06] pt-2">
                <div className="flex gap-1">
                  <span className="h-1 w-5 rounded bg-black/15" />
                  <span className="h-1 w-3 rounded bg-black/[0.07]" />
                </div>
                <span className="text-[5px] text-black/30">Nara Living © 2026</span>
              </div>
            </div>
            <div className="absolute left-1/2 top-2.5 -translate-x-1/2 rounded-full border border-white/10 bg-[#17171c] px-2 py-1 text-[5.5px] font-semibold text-zinc-400">
              Desktop · 100%
            </div>
          </div>

          <div className="hidden w-[28%] flex-col border-l border-white/[0.06] p-3 md:flex">
            <div className="mb-3 flex items-center justify-between text-[8px] font-semibold text-zinc-300">
              Properti
              <span className="font-mono text-[6px] text-zinc-600">p</span>
            </div>
            <div className="mb-3 rounded-md border border-[#5b8cff]/25 bg-[#5b8cff]/[0.07] p-2">
              <div className="mb-1 flex items-center gap-1 text-[6px] text-zinc-400">
                <Code2 className="size-2 text-blue-400" />
                p · hero-copy
              </div>
              <div className="h-1 w-full rounded bg-white/10" />
              <div className="mt-1 h-1 w-3/4 rounded bg-white/5" />
            </div>
            <div className="space-y-2.5">
              <div>
                <div className="mb-1 text-[5.5px] uppercase tracking-wider text-zinc-600">
                  Warna teks
                </div>
                <div className="flex h-5 items-center gap-1.5 rounded border border-white/[0.07] px-1.5">
                  <span className="size-2.5 rounded-sm bg-white" />
                  <span className="font-mono text-[5.5px] text-zinc-500">#F8F4ED</span>
                </div>
              </div>
              <div>
                <div className="mb-1 text-[5.5px] uppercase tracking-wider text-zinc-600">
                  Padding
                </div>
                <div className="h-5 rounded border border-white/[0.07] px-1.5 text-[5.5px] leading-5 text-zinc-500">
                  24px
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="h-5 rounded border border-white/[0.07]" />
                <div className="h-5 rounded border border-white/[0.07]" />
              </div>
            </div>
            <div className="mt-auto grid place-items-center rounded-md border border-[#5b8cff]/30 bg-[#5b8cff]/10 py-1.5 text-[6px] font-semibold text-blue-300">
              Pilih parent
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-12 left-4 flex items-center gap-2 rounded-xl border border-white/10 bg-[#17171c]/95 px-3 py-2 shadow-2xl backdrop-blur">
        <span className="grid size-6 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
          <MousePointer2 className="size-3" />
        </span>
        <div>
          <p className="text-[9px] font-semibold text-zinc-200">Klik untuk edit</p>
          <p className="text-[7px] text-zinc-500">Seleksi elemen apa pun</p>
        </div>
      </div>
      <div className="absolute -top-12 right-5 flex items-center gap-2 rounded-xl border border-white/10 bg-[#17171c]/95 px-3 py-2 shadow-2xl backdrop-blur">
        <span className="grid size-6 place-items-center rounded-md bg-blue-500/10 text-blue-400">
          <WandSparkles className="size-3" />
        </span>
        <div>
          <p className="text-[9px] font-semibold text-zinc-200">AI siap membantu</p>
          <p className="text-[7px] text-zinc-500">Tetap dalam kendali kamu</p>
        </div>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { toasts, toast, dismiss } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState<ProjectTemplate["id"]>(
    DEFAULT_TEMPLATE.id,
  );
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [mainTab, setMainTab] = useState<"projects" | "templates">("projects");

  useEffect(() => {
    setProjects(readProjects());
    setHydrated(true);
  }, []);

  function openCreate() {
    setName("");
    setTemplateId(DEFAULT_TEMPLATE.id);
    setFormError("");
    setCreateOpen(true);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setFormError("");

    try {
      const template =
        PROJECT_TEMPLATES.find((item) => item.id === templateId) ??
        DEFAULT_TEMPLATE;
      const project = makeProject(
        cleanProjectName(name),
        template.html,
        "index.html",
        "template",
      );
      await saveProjectAsync(project);
      setCreateOpen(false);
      router.push(`/editor/${project.id}`);
    } catch {
      setFormError(
        "Project gagal disimpan. Ruang penyimpanan browser mungkin penuh.",
      );
      setCreating(false);
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateProjectFile(file);
    if (validationError) {
      toast(validationError, "error");
      return;
    }

    setUploading(true);
    try {
      if (/\.zip$/i.test(file.name) || file.type === "application/zip") {
        const imported = await importProjectZip(file);
        const name =
          imported.backupMetadata?.name || projectNameFromFilename(file.name);
        const project = makeProjectFromFiles(
          name,
          imported.files,
          imported.entry,
          "zip",
        );
        if (imported.backupMetadata) {
          if (imported.backupMetadata.versions) {
            project.versions = imported.backupMetadata.versions as unknown as ProjectVersion[];
          }
          if (imported.backupMetadata.pageOrder) {
            project.pageOrder = imported.backupMetadata.pageOrder;
          }
          if (imported.backupMetadata.globalTheme) {
            project.globalTheme = imported.backupMetadata.globalTheme;
          }
        }
        await saveProjectAsync(project);
        setProjects(readProjects());
        toast(
          `Project ZIP berhasil diimpor (${project.fileCount ?? 1} file).`,
          "success",
        );
        router.push(`/editor/${project.id}`);
        return;
      }

      const html = await file.text();
      const path = normalizeProjectPath(file.name) ?? "index.html";
      const project = makeProject(
        fileStem(file.name),
        html,
        path,
        "upload",
      );
      await saveProjectAsync(project);
      setProjects(readProjects());
      toast("File HTML berhasil diimpor.", "success");
      router.push(`/editor/${project.id}`);
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : "File gagal diimpor. Pastikan penyimpanan browser masih tersedia.",
        "error",
      );
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    try {
      await deleteProject(target.id);
      setProjects((current) =>
        current.filter((project) => project.id !== target.id),
      );
      setDeleteTarget(null);
      toast("Project dihapus.", "success");
    } catch {
      toast("Project gagal dihapus. Coba lagi.", "error");
    }
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#08080a] text-zinc-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] overflow-hidden">
        <div className="absolute left-1/2 top-[-330px] h-[720px] w-[1040px] -translate-x-1/2 rounded-full bg-[#2d57d8]/[0.14] blur-[120px]" />
        <div className="absolute left-[7%] top-[160px] h-[280px] w-[280px] rounded-full bg-[#7d48d8]/[0.08] blur-[100px]" />
        <div className="soft-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      </div>

      <header className="relative z-10 mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="focus-ring rounded-lg" aria-label="Beranda Visual HTML Editor">
          <Brand />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMainTab(mainTab === "templates" ? "projects" : "templates")}
            data-testid="nav-templates-btn"
            className={cn(
              "focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition",
              mainTab === "templates"
                ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                : "border-white/[0.09] bg-white/[0.025] text-zinc-300 hover:border-white/[0.15] hover:bg-white/[0.045] hover:text-white",
            )}
          >
            <LayoutTemplate className="size-3.5 text-blue-400" />
            <span>Pustaka Template</span>
          </button>
          <div className="mr-1 hidden items-center gap-1.5 text-[11px] text-zinc-500 sm:flex">
            <HardDrive className="size-3.5" />
            Tersimpan lokal
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label="Upload HTML atau ZIP"
            title="Impor file HTML atau ZIP"
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.025] px-3 text-xs font-medium text-zinc-300 transition hover:border-white/[0.15] hover:bg-white/[0.045] hover:text-white disabled:cursor-wait disabled:opacity-60"
          >
            {uploading ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            <span className="hidden sm:inline">Impor HTML/ZIP</span>
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-[#f4f5f7] px-3.5 text-xs font-semibold text-[#111114] transition hover:bg-white"
          >
            <Plus className="size-3.5" strokeWidth={2.4} />
            Project baru
          </button>
        </div>
      </header>

      <main className="relative z-[1] mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        <section className="grid items-center gap-14 pb-20 pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:pb-28 lg:pt-20">
          <div className="max-w-[580px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] py-1.5 pl-1.5 pr-3.5 text-[11px] text-zinc-400">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#5b8cff]/15 text-[#7fa3ff]">
                <Sparkles className="size-2.5" />
              </span>
              Editor HTML visual dengan AI
              <span className="size-1 rounded-full bg-zinc-700" />
              <span className="text-zinc-600">beta</span>
            </div>
            <h1 className="max-w-[600px] text-[42px] font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-[56px] lg:text-[64px]">
              Rancang halaman,
              <br />
              <span className="bg-[linear-gradient(110deg,#dfe9ff_10%,#82a8ff_52%,#b296ff_100%)] bg-clip-text text-transparent">
                langsung di browser.
              </span>
            </h1>
            <p className="mt-6 max-w-[480px] text-[15px] leading-7 text-zinc-400">
              Klik elemen di preview, ubah gaya lewat panel properti, dan
              minta AI merapikan sisanya. Tidak perlu setup, tidak perlu
              publish.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={openCreate}
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-[#5b8cff] px-5 text-[13px] font-semibold text-white shadow-[0_12px_36px_rgba(79,124,255,0.26)] transition hover:bg-[#6c99ff]"
              >
                <Plus className="size-4" strokeWidth={2.4} />
                Mulai project baru
              </button>
              <button
                type="button"
                onClick={() => setMainTab("templates")}
                data-testid="hero-explore-templates-btn"
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 text-[13px] font-medium text-zinc-200 transition hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white"
              >
                <LayoutTemplate className="size-4 text-blue-400" />
                Pustaka Template (8+)
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.025] px-4 text-[13px] font-medium text-zinc-300 transition hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white disabled:opacity-60"
              >
                <FileUp className="size-4" />
                Impor HTML / ZIP
              </button>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-zinc-600">
              <span className="flex items-center gap-1.5">
                <Check className="size-3 text-emerald-500/80" />
                Data tetap di perangkatmu
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-3 text-emerald-500/80" />
                Ekspor project sebagai ZIP
              </span>
            </div>
          </div>

          <HeroVisual />
        </section>

        <section aria-labelledby="projects-heading">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] pt-8">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
              <button
                type="button"
                onClick={() => setMainTab("projects")}
                data-testid="tab-projects"
                className={cn(
                  "focus-ring flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition",
                  mainTab === "projects"
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                <span>Project kamu</span>
                {hydrated && projects.length > 0 ? (
                  <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] tabular-nums text-zinc-400">
                    {projects.length}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => setMainTab("templates")}
                data-testid="tab-templates"
                className={cn(
                  "focus-ring flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition",
                  mainTab === "templates"
                    ? "bg-blue-500/15 text-blue-300 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                <LayoutTemplate className="size-3.5 text-blue-400" />
                <span>Pustaka Template</span>
                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.2 text-[9px] font-medium text-blue-300">
                  8+ Siap Pakai
                </span>
              </button>
            </div>
            {mainTab === "projects" && projects.length > 0 ? (
              <div className="hidden items-center gap-1.5 text-[10px] text-zinc-600 sm:flex">
                <LayoutTemplate className="size-3" />
                Disimpan otomatis
              </div>
            ) : null}
          </div>

          {mainTab === "templates" ? (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.01] p-4 sm:p-6">
              <TemplateGallery isEmbedded />
            </div>
          ) : !hydrated ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[280px] animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.02]"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.016] px-6 py-14 text-center">
              <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-[360px] -translate-x-1/2 rounded-full bg-blue-500/[0.07] blur-[60px]" />
              <div className="relative mx-auto flex max-w-sm flex-col items-center">
                <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-white/[0.08] bg-[#131318] text-zinc-400 shadow-xl">
                  <LayoutTemplate className="size-5" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  Belum ada project
                </h3>
                <p className="mt-1.5 max-w-[320px] text-xs leading-5 text-zinc-500">
                  Buat project pertamamu, pilih dari template siap pakai, atau impor
                  HTML/ZIP multi-file.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={openCreate}
                    className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3.5 text-xs font-semibold text-[#111114] transition hover:bg-zinc-200"
                  >
                    <Plus className="size-3.5" />
                    Buat project
                  </button>
                  <button
                    type="button"
                    onClick={() => setMainTab("templates")}
                    className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3.5 text-xs font-medium text-blue-300 transition hover:bg-blue-500/15"
                  >
                    <LayoutTemplate className="size-3.5" />
                    Pilih Template
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.09] px-3.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
                  >
                    <Upload className="size-3.5" />
                    Impor HTML/ZIP
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={setDeleteTarget}
                />
              ))}
              <button
                type="button"
                onClick={openCreate}
                className="focus-ring group flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.012] p-6 text-center transition hover:border-white/[0.18] hover:bg-white/[0.025] sm:min-h-0"
              >
                <span className="mb-3 grid size-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-zinc-500 transition group-hover:text-zinc-200">
                  <Plus className="size-4" />
                </span>
                <span className="text-xs font-medium text-zinc-400 transition group-hover:text-zinc-200">
                  Project baru
                </span>
                <span className="mt-1 text-[10px] text-zinc-600">
                  Halaman kosong atau template
                </span>
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="relative z-[1] border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-[10px] text-zinc-600 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <Brand compact className="opacity-60 grayscale-[0.2]" />
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Editor web visual & kode</span>
          </div>
          <p>Project kecil di localStorage, project besar otomatis ke IndexedDB.</p>
        </div>
      </footer>

      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.htm,.zip,text/html,application/zip"
        className="hidden"
        onChange={handleUpload}
        aria-label="Pilih file HTML atau ZIP"
      />

      <Modal
        open={createOpen}
        onClose={() => {
          if (!creating) setCreateOpen(false);
        }}
        title="Project baru"
        description="Beri nama dan pilih titik awal untuk project barumu."
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
              className="focus-ring h-9 rounded-lg px-3 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              form="create-project-form"
              disabled={creating}
              className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-[#5b8cff] px-4 text-xs font-semibold text-white transition hover:bg-[#6b99ff] disabled:opacity-60"
            >
              {creating ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              Buat & mulai edit
            </button>
          </>
        }
      >
        <form
          id="create-project-form"
          onSubmit={handleCreate}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="project-name"
              className="mb-1.5 block text-[11px] font-medium text-zinc-400"
            >
              Nama project
            </label>
            <input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              autoFocus
              placeholder="Portfolio baru"
              className="focus-ring h-10 w-full rounded-lg border border-white/[0.09] bg-white/[0.025] px-3 text-[13px] text-zinc-100 placeholder:text-zinc-600 transition hover:border-white/[0.13] focus:border-[#5b8cff]/60"
            />
          </div>

          <div>
            <span className="mb-2 block text-[11px] font-medium text-zinc-400">
              Mulai dari
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {PROJECT_TEMPLATES.map((template) => {
                const active = templateId === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setTemplateId(template.id)}
                    aria-pressed={active}
                    className={cn(
                      "focus-ring relative overflow-hidden rounded-xl border p-3 text-left transition",
                      active
                        ? "border-[#5b8cff]/60 bg-[#5b8cff]/[0.07]"
                        : "border-white/[0.08] bg-white/[0.015] hover:border-white/[0.15] hover:bg-white/[0.03]",
                    )}
                  >
                    <div
                      className={cn(
                        "relative mb-2.5 h-16 overflow-hidden rounded-md border p-2",
                        template.id === "landing"
                          ? "border-white/10 bg-[#11120f]"
                          : "border-black/[0.06] bg-[#f8f7f4]",
                      )}
                    >
                      {template.id === "landing" ? (
                        <>
                          <span className="block h-1 w-6 rounded-full bg-[#caff5e]/80" />
                          <span className="mt-2 block h-1.5 w-3/4 rounded-full bg-white/60" />
                          <span className="mt-1 block h-1.5 w-1/2 rounded-full bg-white/25" />
                          <span className="mt-2 block h-3 w-10 rounded-full bg-[#caff5e]/80" />
                          <span className="absolute -right-2 -bottom-3 size-12 rounded-full bg-[#caff5e]/20" />
                        </>
                      ) : (
                        <>
                          <span className="block h-1 w-5 rounded-full bg-blue-500/60" />
                          <span className="mt-2 block h-1.5 w-4/5 rounded-full bg-zinc-800/60" />
                          <span className="mt-1 block h-1.5 w-1/2 rounded-full bg-zinc-400/40" />
                          <span className="mt-2 block h-3 w-9 rounded bg-zinc-900" />
                          <span className="absolute -right-3 -top-3 size-10 rounded-full bg-blue-200/70 blur-sm" />
                        </>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="block text-[11px] font-semibold text-zinc-200">
                          {template.name}
                        </span>
                        <span className="mt-0.5 block text-[9px] leading-3.5 text-zinc-500">
                          {template.description}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition",
                          active
                            ? "border-[#5b8cff] bg-[#5b8cff] text-white"
                            : "border-white/15 text-transparent",
                        )}
                      >
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-3 text-xs">
              <div className="flex items-center gap-2 text-blue-300">
                <LayoutTemplate className="size-4 shrink-0 text-blue-400" />
                <span className="text-[11px]">Ingin website lengkap multi-halaman?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  setMainTab("templates");
                }}
                className="text-[11px] font-semibold text-blue-400 transition hover:text-blue-300 hover:underline"
              >
                Pustaka Template &rarr;
              </button>
            </div>
          </div>

          {formError ? (
            <p className="rounded-lg border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-[11px] text-red-300">
              {formError}
            </p>
          ) : null}
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus project?"
        description="Tindakan ini tidak bisa dibatalkan."
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="focus-ring h-9 rounded-lg px-3 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-red-500 px-4 text-xs font-semibold text-white transition hover:bg-red-400"
            >
              <Trash2 className="size-3.5" />
              Hapus project
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-xl border border-red-500/15 bg-red-500/[0.05] p-3.5">
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-400">
            <Trash2 className="size-4" />
          </span>
          <div>
            <p className="text-xs font-medium text-zinc-200">
              &ldquo;{deleteTarget?.name}&rdquo;
            </p>
            <p className="mt-1 text-[11px] leading-5 text-zinc-500">
              Project beserta semua file di dalamnya akan dihapus dari browser ini.
            </p>
          </div>
        </div>
      </Modal>

      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
