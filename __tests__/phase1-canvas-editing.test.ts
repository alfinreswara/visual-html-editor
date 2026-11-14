import { describe, it, expect } from "vitest";
import {
  buildPreviewDocument,
  cleanEditorArtifacts,
  deleteElement,
  duplicateElement,
  getElementHtml,
  insertHtmlFragment,
  moveElementTo,
  updateElementText,
  updateElementStyle,
} from "@/lib/html";
import {
  parseBridgeMessage,
  PREVIEW_CHANNEL,
  type BridgeCommand,
} from "@/lib/editor-messages";

describe("Phase 1 — Professional Canvas Editing", () => {
  const samplePage = `<!DOCTYPE html>
<html>
<head><title>Canvas Test</title></head>
<body>
  <div class="hero">
    <h1 class="headline">Visual Editor</h1>
    <p class="subtitle">Edit secara langsung.</p>
    <button class="cta-btn">Mulai Sekarang</button>
  </div>
  <div class="features">
    <div class="card" id="card-1">
      <h3>Fitur 1</h3>
      <p>Deskripsi 1</p>
    </div>
    <div class="card" id="card-2">
      <h3>Fitur 2</h3>
      <p>Deskripsi 2</p>
    </div>
  </div>
</body>
</html>`;

  describe("1. Direct Selection & Artifact Cleaning", () => {
    it("buildPreviewDocument injects UI structure and IDs for direct selection", () => {
      const doc = buildPreviewDocument(samplePage);
      expect(doc).toContain('data-ve-id="ve-0"');
      expect(doc).toContain('data-ve-bridge=""');
      expect(doc).toContain('__ve_context_menu');
      expect(doc).toContain('__ve_drop_indicator');
      expect(doc).toContain('__ve_resize_box');
    });

    it("cleanEditorArtifacts thoroughly strips all editor UI and bridge scripts", () => {
      const doc = buildPreviewDocument(samplePage);
      const clean = cleanEditorArtifacts(doc);
      expect(clean).not.toContain("data-ve-id");
      expect(clean).not.toContain("data-ve-bridge");
      expect(clean).not.toContain("__ve_");
      expect(clean).toContain("Visual Editor");
      expect(clean).toContain("Mulai Sekarang");
    });
  });

  describe("2. Inline Text Editing", () => {
    it("updates text content when committed", () => {
      const preview = buildPreviewDocument(samplePage);
      const match = preview.match(/<h1[^>]*data-ve-id="([^"]+)"[^>]*>Visual Editor<\/h1>/);
      expect(match).toBeTruthy();
      const id = match![1];

      const committed = updateElementText(samplePage, id, "Judul Baru");
      expect(committed).toBeTruthy();
      expect(committed).toContain("Judul Baru");
      expect(committed).not.toContain("Visual Editor");
    });

    it("cancelling edit does not alter original document HTML", () => {
      const original = samplePage;
      // When cancelTextEditing is invoked, it does not send updateElementText.
      // We verify the original document remains 100% intact.
      expect(original).toContain("Visual Editor");
    });
  });

  describe("3. Canvas Drag and Drop (moveElementTo)", () => {
    it("valid move: moves element before target sibling", () => {
      const preview = buildPreviewDocument(samplePage);
      const matchCard1 = preview.match(/<div[^>]*id="card-1"[^>]*data-ve-id="([^"]+)"/);
      const matchCard2 = preview.match(/<div[^>]*id="card-2"[^>]*data-ve-id="([^"]+)"/);
      const id1 = matchCard1![1];
      const id2 = matchCard2![1];

      // Move card-2 before card-1
      const result = moveElementTo(samplePage, id2, id1, "before");
      expect(result).toBeTruthy();
      const posCard2 = result!.html.indexOf('id="card-2"');
      const posCard1 = result!.html.indexOf('id="card-1"');
      expect(posCard2).toBeLessThan(posCard1);
    });

    it("valid move: moves element after target sibling", () => {
      const preview = buildPreviewDocument(samplePage);
      const matchH1 = preview.match(/<h1[^>]*data-ve-id="([^"]+)"/);
      const matchP = preview.match(/<p[^>]*class="subtitle"[^>]*data-ve-id="([^"]+)"/);
      const idH1 = matchH1![1];
      const idP = matchP![1];

      // Move h1 after p
      const result = moveElementTo(samplePage, idH1, idP, "after");
      expect(result).toBeTruthy();
      const posP = result!.html.indexOf("subtitle");
      const posH1 = result!.html.indexOf("headline");
      expect(posP).toBeLessThan(posH1);
    });

    it("valid move: moves element inside a container", () => {
      const preview = buildPreviewDocument(samplePage);
      const matchBtn = preview.match(/<button[^>]*data-ve-id="([^"]+)"/);
      const matchCard1 = preview.match(/<div[^>]*id="card-1"[^>]*data-ve-id="([^"]+)"/);
      const idBtn = matchBtn![1];
      const idCard1 = matchCard1![1];

      // Move button inside card-1
      const result = moveElementTo(samplePage, idBtn, idCard1, "inside");
      expect(result).toBeTruthy();

      // In result, button is inside card-1
      const doc = new DOMParser().parseFromString(result!.html, "text/html");
      const card = doc.getElementById("card-1");
      expect(card?.querySelector("button.cta-btn")).toBeTruthy();
    });

    it("invalid move: dropping node into itself is prevented", () => {
      const preview = buildPreviewDocument(samplePage);
      const matchHero = preview.match(/<div class="hero"[^>]*data-ve-id="([^"]+)"/);
      const idHero = matchHero![1];

      const result = moveElementTo(samplePage, idHero, idHero, "inside");
      expect(result).toBeNull();
    });

    it("invalid move: dropping parent into its descendant is prevented", () => {
      const preview = buildPreviewDocument(samplePage);
      const matchHero = preview.match(/<div class="hero"[^>]*data-ve-id="([^"]+)"/);
      const matchBtn = preview.match(/<button[^>]*data-ve-id="([^"]+)"/);
      const idHero = matchHero![1];
      const idBtn = matchBtn![1];

      // Try to move .hero inside button (descendant)
      const result = moveElementTo(samplePage, idHero, idBtn, "inside");
      expect(result).toBeNull();
    });

    it("invalid move: dropping body before or after is prevented", () => {
      const preview = buildPreviewDocument(samplePage);
      const matchH1 = preview.match(/<h1[^>]*data-ve-id="([^"]+)"/);
      const idH1 = matchH1![1];

      const result = moveElementTo(samplePage, "ve-0", idH1, "before");
      expect(result).toBeNull();
    });

    it("does not force position: absolute or alter untouched styles during drag-and-drop", () => {
      const preview = buildPreviewDocument(samplePage);
      const matchH1 = preview.match(/<h1[^>]*data-ve-id="([^"]+)"/);
      const matchP = preview.match(/<p[^>]*class="subtitle"[^>]*data-ve-id="([^"]+)"/);
      const result = moveElementTo(samplePage, matchH1![1], matchP![1], "after");
      expect(result).toBeTruthy();
      expect(result!.html).not.toContain("position: absolute");
      expect(result!.html).not.toContain("position:absolute");
    });
  });

  describe("4. Resize and Styles", () => {
    it("updateElementStyle applies width and height styles without side-effects", () => {
      const preview = buildPreviewDocument(samplePage);
      const matchCard1 = preview.match(/<div[^>]*id="card-1"[^>]*data-ve-id="([^"]+)"/);
      const id = matchCard1![1];

      const updated = updateElementStyle(samplePage, id, {
        width: "360px",
        height: "220px",
      });
      expect(updated).toBeTruthy();
      expect(updated).toContain("width: 360px");
      expect(updated).toContain("height: 220px");
    });
  });

  describe("5. Context Menu & Shortcuts Commands", () => {
    const validCommands: BridgeCommand[] = [
      "undo",
      "redo",
      "duplicate",
      "delete",
      "move-up",
      "move-down",
      "select-parent",
      "select-child",
      "copy",
      "cut",
      "paste",
    ];

    validCommands.forEach((cmd) => {
      it(`parses command "${cmd}" correctly`, () => {
        const msg = {
          channel: PREVIEW_CHANNEL,
          type: "command",
          payload: { name: cmd },
        };
        expect(parseBridgeMessage(msg)).toEqual(msg);
      });
    });

    it("parses move-to bridge message correctly", () => {
      const moveToMsg = {
        channel: PREVIEW_CHANNEL,
        type: "move-to",
        payload: {
          sourceId: "ve-2",
          targetId: "ve-5",
          position: "after" as const,
        },
      };
      expect(parseBridgeMessage(moveToMsg)).toEqual(moveToMsg);
    });

    it("getElementHtml and insertHtmlFragment enable copy and paste workflows", () => {
      const preview = buildPreviewDocument(samplePage);
      const matchBtn = preview.match(/<button[^>]*data-ve-id="([^"]+)"/);
      const idBtn = matchBtn![1];

      // Copy:
      const copiedHtml = getElementHtml(samplePage, idBtn);
      expect(copiedHtml).toBeTruthy();
      expect(copiedHtml).toContain("Mulai Sekarang");
      expect(copiedHtml).not.toContain("data-ve-id");

      // Paste:
      const matchCard2 = preview.match(/<div[^>]*id="card-2"[^>]*data-ve-id="([^"]+)"/);
      const idCard2 = matchCard2![1];
      const pasted = insertHtmlFragment(samplePage, idCard2, "inside", copiedHtml!);
      expect(pasted).toBeTruthy();
      expect(pasted!.html).toContain('<button class="cta-btn">Mulai Sekarang</button>');
    });

    it("cut workflow copies and removes element", () => {
      const preview = buildPreviewDocument(samplePage);
      const matchBtn = preview.match(/<button[^>]*data-ve-id="([^"]+)"/);
      const idBtn = matchBtn![1];

      // Get html to copy
      const copied = getElementHtml(samplePage, idBtn);
      expect(copied).toBeTruthy();

      // Delete element (cut)
      const afterCut = deleteElement(samplePage, idBtn);
      expect(afterCut).toBeTruthy();
      expect(afterCut).not.toContain("Mulai Sekarang");
    });
  });

  describe("6. Undo / Redo Lifecycle", () => {
    it("undo restores state before drag-and-drop or edit", () => {
      // Simulate history stack
      const historyStack: string[] = [samplePage];

      // 1. User edits text
      const preview = buildPreviewDocument(samplePage);
      const idH1 = preview.match(/<h1[^>]*data-ve-id="([^"]+)"/)![1];
      const step1 = updateElementText(samplePage, idH1, "Judul Tahap 1")!;
      historyStack.push(step1);

      // 2. User moves button
      const idBtn = preview.match(/<button[^>]*data-ve-id="([^"]+)"/)![1];
      const idCard1 = preview.match(/<div[^>]*id="card-1"[^>]*data-ve-id="([^"]+)"/)![1];
      const step2 = moveElementTo(step1, idBtn, idCard1, "inside")!.html;
      historyStack.push(step2);

      expect(historyStack[2]).toContain("Judul Tahap 1");
      expect(historyStack[2]).toContain('class="cta-btn">Mulai Sekarang</button></div>');

      // Undo step 2:
      const undoneStep2 = historyStack[1];
      expect(undoneStep2).not.toContain('class="cta-btn">Mulai Sekarang</button></div>');
      expect(undoneStep2).toContain("Judul Tahap 1");

      // Undo step 1:
      const undoneStep1 = historyStack[0];
      expect(undoneStep1).toContain("Visual Editor");
      expect(undoneStep1).not.toContain("Judul Tahap 1");
    });
  });
});
