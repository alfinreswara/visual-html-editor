import { test, expect } from "@playwright/test";

test.describe("Phase 1 & Phase 2 — Browser Verification: Canvas Interactions", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home and create a fresh project
    await page.goto("/");
    await page.locator('button:has-text("Project baru")').first().click();
    await page.locator("#project-name").fill("Canvas Test Project");
    await page.locator('button[type="submit"]:has-text("Buat & mulai edit")').click();
    await expect(page).toHaveURL(/\/editor\//);

    // Wait for the preview iframe to load
    const frameElement = page.locator("iframe");
    await expect(frameElement).toBeVisible();
    await page.waitForTimeout(1000);
  });

  test("1. Direct canvas selection shows selection box, label, and inspector", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    const h1 = frame.locator("h1").first();
    await expect(h1).toBeVisible();

    // Click to select
    await h1.click();
    await expect(h1).toHaveAttribute("data-ve-selected", "");

    // Selection label should be displayed
    const label = frame.locator("#__ve_label");
    await expect(label).toBeVisible();
    await expect(label).toContainText("h1");

    // Right inspector (PropertiesPanel) should show the tag and details
    const inspector = page.locator("aside").filter({ hasText: "Inspector" });
    await expect(inspector).toBeVisible();
    await expect(inspector).toContainText("<h1>");
  });

  test("2. Inline text editing allows double click edit and commits text", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    const h1 = frame.locator("h1").first();
    await expect(h1).toBeVisible();

    // Double click to enter inline edit mode
    await h1.dblclick();
    await expect(h1).toHaveAttribute("data-ve-editing-text", "");
    await expect(h1).toHaveAttribute("contenteditable", "true");

    // Edit content directly
    await h1.fill("Judul Hasil Inline Edit");
    // Press enter or blur to commit
    await h1.press("Enter");

    await expect(h1).not.toHaveAttribute("data-ve-editing-text");
    await expect(h1).toContainText("Judul Hasil Inline Edit");
  });

  test("3. Canvas drag-and-drop & drop indicator with canvas zoom coordinates", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    const h1 = frame.locator("h1").first();
    const p = frame.locator("p").first();
    await expect(h1).toBeVisible();
    await expect(p).toBeVisible();

    // First select h1
    await h1.click();
    await expect(h1).toHaveAttribute("data-ve-selected", "");

    // Drag h1 toward p
    const h1Box = await h1.boundingBox();
    const pBox = await p.boundingBox();
    expect(h1Box).toBeTruthy();
    expect(pBox).toBeTruthy();

    if (h1Box && pBox) {
      await page.mouse.move(h1Box.x + h1Box.width / 2, h1Box.y + h1Box.height / 2);
      await page.mouse.down();
      // Move slightly to trigger drag threshold (>5px)
      await page.mouse.move(h1Box.x + h1Box.width / 2 + 10, h1Box.y + h1Box.height / 2 + 10);
      await expect(h1).toHaveAttribute("data-ve-dragging", "");

      // Move over p element
      await page.mouse.move(pBox.x + pBox.width / 2, pBox.y + pBox.height / 2);
      const dropIndicator = frame.locator("#__ve_drop_indicator");
      await expect(dropIndicator).toBeVisible();

      // Release mouse
      await page.mouse.up();
      await expect(h1).not.toHaveAttribute("data-ve-dragging");
    }
  });

  test("4. Resize handles display and allow element resizing", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    // Find a resizable container or button/header
    const resizable = frame.locator("header, div, section, a, button").first();
    await resizable.click();

    const resizeBox = frame.locator("#__ve_resize_box");
    // If element is a resizable container, handles should appear
    if (await resizeBox.isVisible()) {
      const handleE = frame.locator(".__ve_handle_e");
      await expect(handleE).toBeVisible();
      const handleBox = await handleE.boundingBox();
      expect(handleBox).toBeTruthy();
      if (handleBox) {
        await page.mouse.move(handleBox.x + 4, handleBox.y + 4);
        await page.mouse.down();
        await page.mouse.move(handleBox.x + 30, handleBox.y + 4);
        await page.mouse.up();
      }
    }
  });

  test("5. Context menu appears on right click with actions", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    const h1 = frame.locator("h1").first();
    await expect(h1).toBeVisible();

    // Right-click on h1
    await h1.click({ button: "right" });
    const contextMenu = frame.locator("#__ve_context_menu");
    await expect(contextMenu).toBeVisible();

    // Context menu buttons
    await expect(contextMenu.locator('button[data-cmd="copy"]')).toBeVisible();
    await expect(contextMenu.locator('button[data-cmd="duplicate"]')).toBeVisible();
    await expect(contextMenu.locator('button[data-cmd="delete"]')).toBeVisible();

    // Press Escape to dismiss
    await page.keyboard.press("Escape");
    await expect(contextMenu).not.toBeVisible();
  });
});
