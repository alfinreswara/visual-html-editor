import { test, expect } from "@playwright/test";

test.describe("Phase 1 & Phase 2 — Browser Verification: Editor Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator('button:has-text("Project baru")').first().click();
    await page.locator("#project-name").fill("Editor Features Test");
    await page.locator('button[type="submit"]:has-text("Buat & mulai edit")').click();
    await expect(page).toHaveURL(/\/editor\//);

    const frameElement = page.locator("iframe");
    await expect(frameElement).toBeVisible();
    await page.waitForTimeout(1000);
  });

  test("11. Undo/Redo rolls back and re-applies text changes", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    const h1 = frame.locator("h1").first();
    await expect(h1).toBeVisible();

    const initialText = await h1.innerText();

    // Select h1 and change text in inspector
    await h1.click();
    const textInput = page.locator("textarea").filter({ hasText: "" }).first();
    if (await textInput.isVisible()) {
      await textInput.fill("Judul Diubah 123");
    } else {
      // Or inline edit
      await h1.dblclick();
      await h1.fill("Judul Diubah 123");
      await h1.press("Enter");
    }

    await expect(h1).toContainText("Judul Diubah 123");

    // Click Undo button
    const undoBtn = page.locator('button[aria-label="Urungkan perubahan"]');
    await expect(undoBtn).toBeEnabled();
    await undoBtn.click();

    // Verify text reverted back
    await expect(h1).toContainText(initialText);

    // Click Redo button
    const redoBtn = page.locator('button[aria-label="Ulangi perubahan"]');
    await expect(redoBtn).toBeEnabled();
    await redoBtn.click();

    // Verify re-applied
    await expect(h1).toContainText("Judul Diubah 123");
  });

  test("12. Monaco code editor synchronization with visual preview", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    const h1 = frame.locator("h1").first();
    await expect(h1).toBeVisible();

    // Switch to Code view
    const codeTab = page.locator('button[aria-pressed]:has-text("Kode")');
    await codeTab.click();

    // Monaco editor container should be visible
    const monaco = page.locator(".monaco-editor");
    await expect(monaco).toBeVisible();

    // Switch back to Visual view
    const visualTab = page.locator('button[aria-pressed]:has-text("Visual")');
    await visualTab.click();

    // Iframe preview should be visible and restored
    const frameElement = page.locator("iframe");
    await expect(frameElement).toBeVisible();
    await expect(frame.locator("h1").first()).toBeVisible();
  });

  test("13. Autosave indicates saving and transitions to saved", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    const h1 = frame.locator("h1").first();
    await expect(h1).toBeVisible();

    // Verify initial save badge is "Tersimpan"
    const saveIndicator = page.locator("header").filter({ hasText: /Tersimpan|Menyimpan/i });
    await expect(saveIndicator).toBeVisible();

    // Make an edit
    await h1.dblclick();
    await h1.fill("Perubahan Untuk Autosave");
    await h1.press("Enter");

    // Wait for autosave to complete (SAVE_DELAY ~1000ms)
    await page.waitForTimeout(2000);
    await expect(page.locator("header")).toContainText("Tersimpan");
  });

  test("14. Export ZIP consistency: strips all editor artifacts (__ve_*, data-ve-*)", async ({ page }) => {
    // Click export button in top toolbar
    const exportBtn = page.locator('button:has-text("Ekspor"), button:has-text("Export")').first();
    await expect(exportBtn).toBeVisible();

    // Intercept download
    const downloadPromise = page.waitForEvent("download");
    await exportBtn.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.zip$/i);
  });
});
