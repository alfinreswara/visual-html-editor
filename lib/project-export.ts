import JSZip from "jszip";
import { getExportHtml } from "@/lib/html";
import { isHtmlPath, type ProjectFiles } from "@/lib/project-files";
import { cleanProjectName, slugify, type Project, type ProjectSource } from "@/lib/projects";

export interface ProjectZipResult {
  blob: Blob;
  filename: string;
  entries: string[];
}

/**
 * Builds a standalone ZIP with the original project paths. A project that was
 * created from a single template keeps the old slug-based export name; ZIP and
 * HTML uploads keep their original file paths.
 */
export async function createProjectZip(
  projectName: string,
  files: ProjectFiles,
  source: ProjectSource | undefined,
): Promise<ProjectZipResult> {
  const paths = Object.keys(files).sort((a, b) => a.localeCompare(b));
  if (paths.length === 0) throw new Error("Project tidak memiliki file.");

  const singleFile = paths.length === 1;
  const singleTemplate =
    singleFile &&
    (source === "template" || source === undefined) &&
    isHtmlPath(paths[0]);

  const filename = slugify(cleanProjectName(projectName));
  // Using statically imported JSZip
  const zip = new JSZip();
  const entries: string[] = [];

  for (const path of paths) {
    const file = files[path];
    const exportPath = singleTemplate ? `${filename}.html` : path;
    entries.push(exportPath);

    if (file.kind === "binary") {
      zip.file(exportPath, file.content, { base64: true });
      continue;
    }

    const content = isHtmlPath(path) ? getExportHtml(file.content) : file.content;
    zip.file(exportPath, content);
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return { blob, filename: `${filename}.zip`, entries };
}

export async function createProjectBackupZip(
  project: Project,
  files: ProjectFiles,
): Promise<ProjectZipResult> {
  const paths = Object.keys(files).sort((a, b) => a.localeCompare(b));
  if (paths.length === 0) throw new Error("Project tidak memiliki file.");

  const filename = `${slugify(cleanProjectName(project.name))}-cadangan`;
  // Using statically imported JSZip
  const zip = new JSZip();
  const entries: string[] = [];

  for (const path of paths) {
    const file = files[path];
    entries.push(path);
    if (file.kind === "binary") {
      zip.file(path, file.content, { base64: true });
    } else {
      zip.file(path, file.content);
    }
  }

  // Attach Kanvas Editor Backup Metadata
  const metadata = {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: Date.now(),
    entry: project.entry,
    activePath: project.activePath,
    versions: project.versions || [],
    pageOrder: project.pageOrder || [],
    globalTheme: project.globalTheme,
    savedSections: project.savedSections || [],
  };
  zip.file(".kanvas/project.json", JSON.stringify(metadata, null, 2));
  entries.push(".kanvas/project.json");

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return { blob, filename: `${filename}.zip`, entries };
}
