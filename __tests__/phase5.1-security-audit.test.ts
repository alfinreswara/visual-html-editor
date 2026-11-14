import { describe, it, expect } from "vitest";
import { parseBridgeMessage, PREVIEW_CHANNEL } from "@/lib/editor-messages";
import { checkResponsiveLayout } from "@/lib/quality/responsive-checker";
import { checkAccessibility } from "@/lib/quality/a11y-checker";
import { runProjectAudit } from "@/lib/quality/audit-engine";
import { makeTextFile } from "@/lib/project-files";

describe("Phase 5.1 Security & Audit Accuracy Hardening", () => {
  describe("Task 1 & 2: postMessage Protocol & Session Token Security", () => {
    const validToken = "session-sec-token-12345";

    it("accepts valid envelope with matching session token", () => {
      const msg = {
        channel: PREVIEW_CHANNEL,
        sessionToken: validToken,
        type: "ready",
      };

      const parsed = parseBridgeMessage(msg, validToken);
      expect(parsed).not.toBeNull();
      expect(parsed?.type).toBe("ready");
      expect(parsed?.sessionToken).toBe(validToken);
    });

    it("rejects envelope with mismatched session token", () => {
      const msg = {
        channel: PREVIEW_CHANNEL,
        sessionToken: "stale-old-token-99999",
        type: "ready",
      };

      const parsed = parseBridgeMessage(msg, validToken);
      expect(parsed).toBeNull();
    });

    it("rejects envelope when session token is missing but expected", () => {
      const msg = {
        channel: PREVIEW_CHANNEL,
        type: "ready",
      };

      const parsed = parseBridgeMessage(msg, validToken);
      expect(parsed).toBeNull();
    });

    it("rejects envelope with invalid channel or unexpected command", () => {
      const invalidChannelMsg = {
        channel: "malicious-channel",
        sessionToken: validToken,
        type: "ready",
      };
      expect(parseBridgeMessage(invalidChannelMsg, validToken)).toBeNull();

      const unknownTypeMsg = {
        channel: PREVIEW_CHANNEL,
        sessionToken: validToken,
        type: "eval-arbitrary-code",
        payload: { code: "alert(1)" },
      };
      expect(parseBridgeMessage(unknownTypeMsg, validToken)).toBeNull();

      const unknownCommandNameMsg = {
        channel: PREVIEW_CHANNEL,
        sessionToken: validToken,
        type: "command",
        payload: { name: "malicious-cmd" },
      };
      expect(parseBridgeMessage(unknownCommandNameMsg, validToken)).toBeNull();
    });

    it("rejects non-object or null payloads", () => {
      expect(parseBridgeMessage(null, validToken)).toBeNull();
      expect(parseBridgeMessage("string-message", validToken)).toBeNull();
      expect(parseBridgeMessage(12345, validToken)).toBeNull();
      expect(parseBridgeMessage({}, validToken)).toBeNull();
    });
  });

  describe("Task 4: Responsive Audit Static Heuristics", () => {
    it("flags fixed-width tables that exceed viewport width as [Heuristik Statis]", () => {
      const htmlTable = `
        <!DOCTYPE html>
        <html>
        <head><title>Table Test</title></head>
        <body>
          <table style="width: 750px;">
            <tr><td>Cell 1</td><td>Cell 2</td></tr>
          </table>
        </body>
        </html>
      `;
      const res = checkResponsiveLayout(htmlTable, {
        viewportWidth: 390,
        viewportHeight: 844,
        deviceLabel: "Mobile (390px)",
      });

      const tableIssue = res.issues.find((i) => i.id.includes("table-overflow"));
      expect(tableIssue).toBeDefined();
      expect(tableIssue?.severity).toBe("error");
      expect(tableIssue?.title).toContain("[Heuristik Statis]");
      expect(tableIssue?.title).toContain("750px");
      expect(tableIssue?.description).toContain("[Heuristik Statis]");
    });

    it("flags fixed flex-basis that exceeds viewport width", () => {
      const htmlFlex = `
        <!DOCTYPE html>
        <html>
        <head><title>Flex Test</title></head>
        <body>
          <div style="display: flex;">
            <div style="flex-basis: 600px;">Flex child</div>
          </div>
        </body>
        </html>
      `;
      const res = checkResponsiveLayout(htmlFlex, {
        viewportWidth: 390,
        viewportHeight: 844,
        deviceLabel: "Mobile (390px)",
      });

      const flexIssue = res.issues.find((i) => i.id.includes("flex-basis"));
      expect(flexIssue).toBeDefined();
      expect(flexIssue?.title).toContain("[Heuristik Statis]");
      expect(flexIssue?.title).toContain("600px");
    });

    it("flags fixed-width media (video, canvas, iframe) exceeding viewport", () => {
      const htmlMedia = `
        <!DOCTYPE html>
        <html>
        <head><title>Media Test</title></head>
        <body>
          <video width="640" height="360"></video>
          <iframe style="width: 720px;"></iframe>
          <canvas width="500"></canvas>
        </body>
        </html>
      `;
      const res = checkResponsiveLayout(htmlMedia, {
        viewportWidth: 390,
        viewportHeight: 844,
        deviceLabel: "Mobile (390px)",
      });

      const mediaIssues = res.issues.filter((i) => i.id.includes("resp-media"));
      expect(mediaIssues.length).toBe(3);
      expect(mediaIssues.every((i) => i.title.includes("[Heuristik Statis]"))).toBe(true);
    });
  });

  describe("Task 5: Accessibility Audit Accuracy Hardening", () => {
    it("does not report missing alt for decorative images (role=presentation/none or aria-hidden=true)", () => {
      const htmlDecorative = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>Decorative Img</title></head>
        <body>
          <main>
            <img src="bg-shape.svg" role="presentation">
            <img src="divider.png" role="none">
            <img src="watermark.svg" aria-hidden="true">
          </main>
        </body>
        </html>
      `;
      const { issues, passedChecks } = checkAccessibility(htmlDecorative, "index.html");
      const altIssues = issues.filter((i) => i.id.includes("a11y-img-no-alt"));
      expect(altIssues.length).toBe(0);

      const passed = passedChecks.find((p) => p.id.includes("a11y-images-have-alt"));
      expect(passed).toBeDefined();
      expect(passed?.title).toContain("Dinyatakan Dekoratif");
    });

    it("distinguishes dynamic/gradient backgrounds as [Heuristik Visual] info note rather than low contrast error", () => {
      const htmlGradient = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>Gradient Test</title></head>
        <body>
          <main>
            <div style="color: #ffffff; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              Gradient Hero
            </div>
            <div style="color: #ffffff; background-image: url('hero.jpg');">
              Image Hero
            </div>
          </main>
        </body>
        </html>
      `;
      const { issues } = checkAccessibility(htmlGradient, "index.html");
      const lowContrast = issues.filter((i) => i.id.includes("a11y-low-contrast"));
      const dynamicBg = issues.filter((i) => i.id.includes("a11y-dynamic-bg"));

      expect(lowContrast.length).toBe(0);
      expect(dynamicBg.length).toBe(2);
      expect(dynamicBg[0].severity).toBe("info");
      expect(dynamicBg[0].title).toContain("[Heuristik Visual]");
    });

    it("records passed check when static contrast is measurable and meets WCAG AA (>= 4.5:1)", () => {
      const htmlGoodContrast = `
        <!DOCTYPE html>
        <html lang="id">
        <head><title>Contrast Test</title></head>
        <body>
          <main>
            <p style="color: #000000; background-color: #ffffff;">High contrast black on white</p>
          </main>
        </body>
        </html>
      `;
      const { issues, passedChecks } = checkAccessibility(htmlGoodContrast, "index.html");
      const lowContrast = issues.filter((i) => i.id.includes("a11y-low-contrast"));
      expect(lowContrast.length).toBe(0);

      const contrastPassed = passedChecks.find((p) => p.id.includes("a11y-contrast-passed"));
      expect(contrastPassed).toBeDefined();
      expect(contrastPassed?.title).toContain("Standar WCAG AA");
    });

    it("clarifies WCAG ~30-40% static coverage disclaimer in audit report", () => {
      const files = {
        "index.html": makeTextFile("<!DOCTYPE html><html lang='id'><head><title>Test</title></head><body><main><h1>Hello</h1></main></body></html>", "index.html"),
      };
      const report = runProjectAudit(files, { activePath: "index.html" });
      expect(report.disclaimer).toContain("30-40%");
      expect(report.disclaimer).toContain("screen reader");
      expect(report.disclaimer).toContain("navigasi keyboard");
    });
  });
});
