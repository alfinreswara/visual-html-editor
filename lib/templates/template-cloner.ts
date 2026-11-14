import type { WebsiteTemplate } from "./types";
import {
  cleanProjectName,
  makeProjectFromFiles,
  type Project,
} from "@/lib/projects";
import type { ProjectFiles } from "@/lib/project-files";

/**
 * Creates a brand-new, completely independent Project instance cloned from a WebsiteTemplate.
 * The original template files and state remain completely immutable.
 */
export function cloneTemplateToProject(
  template: WebsiteTemplate,
  projectName: string,
): Project {
  // 1. Deep clone all project files to guarantee zero shared references
  const clonedFiles: ProjectFiles = {};
  for (const [path, file] of Object.entries(template.files)) {
    clonedFiles[path] = {
      content: file.content,
      mime: file.mime,
      kind: file.kind,
    };
  }

  // 2. Determine entry HTML page
  const entryPage = template.pages.find((p) => p.isEntry)?.path || "index.html";
  const validEntry = clonedFiles[entryPage] ? entryPage : "index.html";

  // 3. Instantiate fresh project with new UUID and timestamps
  const project = makeProjectFromFiles(
    cleanProjectName(projectName || template.name),
    clonedFiles,
    validEntry,
    "template",
  );

  // 4. Set project metadata from template
  project.globalTheme = template.globalTheme
    ? JSON.parse(JSON.stringify(template.globalTheme))
    : undefined;
  project.pageOrder = template.pages.map((p) => p.path);

  return project;
}
