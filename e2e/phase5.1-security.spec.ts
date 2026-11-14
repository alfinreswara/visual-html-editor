import { test, expect } from "@playwright/test";

test.describe("Phase 5.1 — Preview Security & Audit Accuracy Hardening", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator('button:has-text("Project baru")').first().click();
    await page.locator("#project-name").fill("Security Hardening Test");
    await page.locator('button[type="submit"]:has-text("Buat & mulai edit")').click();
    await expect(page).toHaveURL(/\/editor\//);

    const frameElement = page.locator("iframe");
    await expect(frameElement).toBeVisible();
    await page.waitForTimeout(1000);
  });

  test("1. Preview cannot access parent.document (SecurityError due to restricted sandbox)", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    await expect(frame.locator("body")).toBeVisible();

    const parentDocAccessThrows = await frame.locator("body").evaluate(() => {
      try {
        // Attempt cross-origin access to parent document from opaque srcdoc
        const _doc = window.parent.document;
        // If accessed without throwing, return false
        return _doc ? false : true;
      } catch (err: unknown) {
        return (err as Error).name === "SecurityError" || String(err).includes("SecurityError");
      }
    });

    expect(parentDocAccessThrows).toBe(true);
  });

  test("2. Preview cannot remove its sandbox (window.frameElement is null)", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    await expect(frame.locator("body")).toBeVisible();

    const frameElementIsNull = await frame.locator("body").evaluate(() => {
      try {
        return window.frameElement === null;
      } catch {
        return true;
      }
    });

    expect(frameElementIsNull).toBe(true);
  });

  test("3. Preview cannot perform unauthorized top-level navigation", async ({ page }) => {
    const initialUrl = page.url();
    const frame = page.frameLocator("iframe");
    await expect(frame.locator("body")).toBeVisible();

    const topNavBlocked = await frame.locator("body").evaluate(() => {
      try {
        // Attempt top-level navigation without allow-top-navigation sandbox permission
        // @ts-expect-error test navigation attempt
        window.top.location.href = "https://example.com/unauthorized-nav";
        return false;
      } catch (err: unknown) {
        return (err as Error).name === "SecurityError" || String(err).includes("SecurityError");
      }
    });

    expect(topNavBlocked).toBe(true);
    // Editor page URL must remain on the editor route
    expect(page.url()).toBe(initialUrl);
  });

  test("4. Unexpected postMessage source is rejected", async ({ page }) => {
    // Attempt to forge a selection event from the parent window directly (event.source !== frame.contentWindow)
    await page.evaluate(() => {
      window.postMessage(
        {
          channel: "kanvas-preview-bridge",
          type: "select",
          payload: {
            id: "ve-spoofed-source",
            tag: "div",
            className: "spoofed-class",
            text: "Forged Selection",
            href: "",
            src: "",
            hasChildren: false,
            style: {},
          },
        },
        "*",
      );
    });

    await page.waitForTimeout(500);

    // Inspector should not show "ve-spoofed-source" or "Forged Selection"
    const spoofedIndicator = page.locator('text="ve-spoofed-source"');
    await expect(spoofedIndicator).toHaveCount(0);
  });

  test("5. Invalid message channel is rejected", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    await expect(frame.locator("body")).toBeVisible();

    // Send postMessage with invalid channel from frame
    await frame.locator("body").evaluate(() => {
      window.parent.postMessage(
        {
          channel: "malicious-fake-channel",
          type: "command",
          payload: { name: "delete" },
        },
        "*",
      );
    });

    await page.waitForTimeout(500);

    // Document elements must remain intact (not deleted)
    const h1 = frame.locator("h1").first();
    await expect(h1).toBeVisible();
  });

  test("6. Stale preview session messages are rejected", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    await expect(frame.locator("body")).toBeVisible();

    // Send a message from frame with a mismatched/stale sessionToken
    await frame.locator("body").evaluate(() => {
      window.parent.postMessage(
        {
          channel: "kanvas-preview-bridge",
          sessionToken: "outdated-stale-token-12345",
          type: "select",
          payload: {
            id: "ve-stale-element",
            tag: "h2",
            className: "stale-heading",
            text: "Stale Heading",
            href: "",
            src: "",
            hasChildren: false,
            style: {},
          },
        },
        "*",
      );
    });

    await page.waitForTimeout(500);

    // Stale selection should be ignored by the parent editor
    const staleIndicator = page.locator('text="ve-stale-element"');
    await expect(staleIndicator).toHaveCount(0);
  });

  test("7. New-tab preview does not expose window.opener", async ({ page }) => {
    const newTabBtn = page.locator('[data-testid="preview-new-tab-btn"]');
    await expect(newTabBtn).toBeVisible();

    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      newTabBtn.click(),
    ]);

    await popup.waitForLoadState("domcontentloaded");

    const isOpenerNull = await popup.evaluate(() => window.opener === null);
    expect(isOpenerNull).toBe(true);
    await popup.close();
  });

  test("8. New-tab preview cannot access editor application data", async ({ page }) => {
    const newTabBtn = page.locator('[data-testid="preview-new-tab-btn"]');
    await expect(newTabBtn).toBeVisible();

    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      newTabBtn.click(),
    ]);

    await popup.waitForLoadState("domcontentloaded");

    // In isolated CSP sandbox with opaque origin, localStorage is either restricted or inaccessible
    const accessResult = await popup.evaluate(() => {
      try {
        const item = window.localStorage.getItem("kanvas_projects");
        return { hasItem: item !== null, error: null };
      } catch (err: unknown) {
        return { hasItem: false, error: (err as Error).name || String(err) };
      }
    });

    // It should either throw SecurityError/AccessDenied or have 0 editor projects in isolated origin
    expect(accessResult.hasItem).toBe(false);
    await popup.close();
  });
});
