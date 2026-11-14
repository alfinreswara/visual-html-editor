import { describe, it, expect } from "vitest";
import {
  buildPreviewDocument,
  cleanEditorArtifacts,
  deleteElement,
  duplicateElement,
  getExportHtml,
  moveElement,
  moveElementTo,
  updateElementStyle,
  updateElementText,
} from "@/lib/html";
import { parseBridgeMessage, PREVIEW_CHANNEL } from "@/lib/editor-messages";
import { hydrateProject, cleanProjectName } from "@/lib/projects";
import { makeTextFile } from "@/lib/project-files";

describe("Phase 0 Baseline Tests", () => {
  const sampleHtml = `<!DOCTYPE html>
<html>
<head><title>Test Page</title></head>
<body>
  <div class="container">
    <h1 class="title">Halo Dunia</h1>
    <p class="desc">Deskripsi konten.</p>
  </div>
</body>
</html>`;

  it("buildPreviewDocument assigns data-ve-id to body elements and injects bridge", () => {
    const preview = buildPreviewDocument(sampleHtml);
    expect(preview).toContain("data-ve-id=");
    expect(preview).toContain("__ve_bridge__");
    expect(preview).toContain("kanvas-preview-v1");
  });

  it("cleanEditorArtifacts removes data-ve-id and editor scripts", () => {
    const preview = buildPreviewDocument(sampleHtml);
    const cleaned = cleanEditorArtifacts(preview);
    expect(cleaned).not.toContain("data-ve-id=");
    expect(cleaned).not.toContain("__ve_bridge__");
    expect(cleaned).toContain("Halo Dunia");
  });

  it("updateElementText updates text content without touching other nodes", () => {
    const preview = buildPreviewDocument(sampleHtml);
    // Find ID of h1
    const match = preview.match(/<h1[^>]*data-ve-id="([^"]+)"[^>]*>Halo Dunia<\/h1>/);
    expect(match).toBeTruthy();
    const id = match![1];

    const updated = updateElementText(sampleHtml, id, "Judul Baru!");
    expect(updated).toBeTruthy();
    expect(updated).toContain("Judul Baru!");
    expect(updated).not.toContain("Halo Dunia");
    expect(updated).toContain("Deskripsi konten.");
  });

  it("updateElementStyle updates inline styles", () => {
    const preview = buildPreviewDocument(sampleHtml);
    const match = preview.match(/<h1[^>]*data-ve-id="([^"]+)"/);
    const id = match![1];

    const updated = updateElementStyle(sampleHtml, id, { color: "#ff0000", fontSize: "32px" });
    expect(updated).toBeTruthy();
    expect(updated).toContain("color: #ff0000");
    expect(updated).toContain("font-size: 32px");
  });

  it("duplicateElement duplicates target element right after it", () => {
    const preview = buildPreviewDocument(sampleHtml);
    const match = preview.match(/<p[^>]*data-ve-id="([^"]+)"/);
    const id = match![1];

    const result = duplicateElement(sampleHtml, id);
    expect(result).toBeTruthy();
    const occurrences = (result!.html.match(/Deskripsi konten\./g) || []).length;
    expect(occurrences).toBe(2);
  });

  it("deleteElement removes target element", () => {
    const preview = buildPreviewDocument(sampleHtml);
    const match = preview.match(/<p[^>]*data-ve-id="([^"]+)"/);
    const id = match![1];

    const next = deleteElement(sampleHtml, id);
    expect(next).toBeTruthy();
    expect(next).not.toContain("Deskripsi konten.");
  });

  it("moveElement can move siblings up and down", () => {
    const preview = buildPreviewDocument(sampleHtml);
    const matchP = preview.match(/<p[^>]*data-ve-id="([^"]+)"/);
    const idP = matchP![1];

    const movedUp = moveElement(sampleHtml, idP, "up");
    expect(movedUp).toBeTruthy();
    // In movedUp, p should come before h1
    const pIndex = movedUp!.html.indexOf("<p");
    const h1Index = movedUp!.html.indexOf("<h1");
    expect(pIndex).toBeLessThan(h1Index);
  });

  it("moveElementTo moves source relative to target (before, after, inside)", () => {
    const preview = buildPreviewDocument(sampleHtml);
    const matchH1 = preview.match(/<h1[^>]*data-ve-id="([^"]+)"/);
    const matchP = preview.match(/<p[^>]*data-ve-id="([^"]+)"/);
    const idH1 = matchH1![1];
    const idP = matchP![1];

    // Move h1 after p
    const movedAfter = moveElementTo(sampleHtml, idH1, idP, "after");
    expect(movedAfter).toBeTruthy();
    const pIdx = movedAfter!.html.indexOf("Deskripsi konten.");
    const h1Idx = movedAfter!.html.indexOf("Halo Dunia");
    expect(pIdx).toBeLessThan(h1Idx);
  });

  it("parseBridgeMessage safely validates channel messages", () => {
    const validSelect = {
      channel: PREVIEW_CHANNEL,
      type: "select",
      payload: {
        id: "ve-1",
        tag: "div",
        className: "container",
        text: "test",
        href: "",
        src: "",
        hasChildren: true,
        style: {
          color: "",
          backgroundColor: "",
          fontSize: "",
          fontWeight: "",
          padding: "",
          margin: "",
          borderRadius: "",
          display: "",
          flexDirection: "",
          flexWrap: "",
          alignItems: "",
          justifyContent: "",
          gap: "",
          gridTemplateColumns: "",
          width: "",
          height: "",
        },
      },
    };
    expect(parseBridgeMessage(validSelect)).toEqual(validSelect);

    const invalid = { channel: "other-channel", type: "select" };
    expect(parseBridgeMessage(invalid)).toBeNull();
  });

  it("hydrateProject correctly migrates legacy single html into file map", () => {
    const legacy = {
      id: "test-1",
      name: "Legacy Project",
      html: sampleHtml,
      createdAt: 1000,
      updatedAt: 1000,
    };
    const hydrated = hydrateProject(legacy);
    expect(hydrated.files).toBeDefined();
    expect(hydrated.files!["index.html"]).toBeDefined();
    expect(hydrated.entry).toBe("index.html");
  });
});
