import { test, expect } from "@playwright/test";

test.describe("Phase 1 & Phase 2 — Browser Verification: Rich Text & Advanced Styles", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator('button:has-text("Project baru")').first().click();
    await page.locator("#project-name").fill("Rich Text & Styles Test");
    await page.locator('button[type="submit"]:has-text("Buat & mulai edit")').click();
    await expect(page).toHaveURL(/\/editor\//);

    const frameElement = page.locator("iframe");
    await expect(frameElement).toBeVisible();
    await page.waitForTimeout(1000);
  });

  test("6 & 7. Rich text toolbar appears on text selection & preserves nested HTML", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    const h1 = frame.locator("h1").first();
    await expect(h1).toBeVisible();

    // Select text within h1
    await frame.locator("body").evaluate(() => {
      const h1El = document.querySelector("h1");
      if (!h1El) return;
      const range = document.createRange();
      range.selectNodeContents(h1El);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.dispatchEvent(new Event("selectionchange"));
    });

    const richToolbar = frame.locator("#__ve_rich_text_toolbar");
    await expect(richToolbar).toBeVisible();

    // Click bold button
    const boldBtn = richToolbar.locator('button[data-cmd="bold"]');
    await expect(boldBtn).toBeVisible();
    await boldBtn.click();

    // Verify <strong> tag was created inside h1
    const strong = h1.locator("strong");
    await expect(strong).toBeVisible();

    // Now click italic button
    const italicBtn = richToolbar.locator('button[data-cmd="italic"]');
    await expect(italicBtn).toBeVisible();
    await italicBtn.click();

    // Verify nested formatting (strong and em)
    const em = h1.locator("em, i");
    await expect(em).toBeVisible();
  });

  test("8. Toolbar interaction with native color picker & font size", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    const h1 = frame.locator("h1").first();
    await expect(h1).toBeVisible();

    // Select text inside h1
    await frame.locator("body").evaluate(() => {
      const h1El = document.querySelector("h1");
      if (!h1El) return;
      const range = document.createRange();
      range.selectNodeContents(h1El);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.dispatchEvent(new Event("selectionchange"));
    });

    const richToolbar = frame.locator("#__ve_rich_text_toolbar");
    await expect(richToolbar).toBeVisible();

    // Change font size select
    const fontSelect = richToolbar.locator('select[data-cmd="font-size"]');
    await fontSelect.selectOption("28px");

    // Check that a span with font-size 28px was injected
    const styledSpan = h1.locator("span");
    await expect(styledSpan.first()).toBeVisible();

    // Trigger native color input in toolbar
    const colorInput = richToolbar.locator('input[data-cmd="text-color"]');
    await expect(colorInput).toBeVisible();
    await colorInput.fill("#3b82f6");
    await colorInput.dispatchEvent("input");

    // Span should have color applied
    await expect(h1.locator("span[style*='color']").first()).toBeVisible();
  });

  test("9. Advanced Style Panel updates layout, typography, and background", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    const h1 = frame.locator("h1").first();
    await h1.click();

    // Verify Inspector is open
    await expect(page.locator("aside").filter({ hasText: "Inspector" })).toBeVisible();

    // Ensure typography section is open
    const typographyBtn = page.locator('button:has-text("Tipografi (Typography)")');
    if ((await typographyBtn.getAttribute("aria-expanded")) !== "true") {
      await typographyBtn.click();
    }
    const colorLabel = page.locator('label:has-text("Warna Teks")');
    await colorLabel.scrollIntoViewIfNeeded();
    await expect(colorLabel).toBeVisible();

    // Change text color via property panel ColorField text input
    const textColorInput = page.locator('label:has-text("Warna Teks")').locator("..").locator("..").locator('input[type="text"]');
    await expect(textColorInput).toBeVisible();
    await textColorInput.fill("#e11d48");
    await textColorInput.press("Enter");

    // Verify style reflects in the canvas element (browser normalizes to rgb or hex)
    await expect(h1).toHaveAttribute("style", /#e11d48|225,\s*29,\s*72/i);
  });

  test("10. Responsive Desktop / Tablet / Mobile device switcher & scale preview", async ({ page }) => {
    const frame = page.locator("iframe");

    // Initial desktop width
    await expect(frame).toHaveCSS("width", "1280px");

    // Switch to Tablet
    const tabletBtn = page.locator('button[aria-label="Ukuran Tablet"]');
    await tabletBtn.click();
    await expect(frame).toHaveCSS("width", "768px");

    // Switch to Mobile (standard 390px)
    const mobileBtn = page.locator('button[aria-label="Ukuran Mobile"]');
    await mobileBtn.click();
    await expect(frame).toHaveCSS("width", "390px");

    // Switch back to Desktop
    const desktopBtn = page.locator('button[aria-label="Ukuran Desktop"]');
    await desktopBtn.click();
    await expect(frame).toHaveCSS("width", "1280px");
  });

  test("XSS & URL validation: rejecting javascript: hyperlinks", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    const a = frame.locator("a").first();
    await expect(a).toBeVisible();
    await a.click();

    // In PropertiesPanel, find Href input
    const hrefInput = page.locator('input[placeholder*="#bagian atau https://"]');
    await expect(hrefInput).toBeVisible();

    // Try injecting javascript:alert(1)
    await hrefInput.fill("javascript:alert(document.cookie)");

    // The element in iframe should NOT receive javascript:
    await page.waitForTimeout(500);
    const hrefAttr = await a.getAttribute("href");
    expect(hrefAttr || "").not.toContain("javascript:");
  });
});
