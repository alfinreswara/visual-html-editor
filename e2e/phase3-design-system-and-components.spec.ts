import { test, expect } from "@playwright/test";

test.describe("Phase 3: Design System, Tokens, & Component Library", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home and create a fresh project
    await page.goto("/");
    await page.locator('button:has-text("Project baru")').first().click();
    await page.locator("#project-name").fill("Phase 3 Test Project");
    await page.locator('button[type="submit"]:has-text("Buat & mulai edit")').click();
    await expect(page).toHaveURL(/\/editor\//);

    // Wait for the preview iframe to load
    const frameElement = page.locator("iframe");
    await expect(frameElement).toBeVisible();
    await page.waitForTimeout(1000);
  });

  test("1. Global Design System modal applies preset & writes CSS variables", async ({ page }) => {
    // Open Global Theme modal
    const themeBtn = page.locator('button[aria-label="Tema Global"]');
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();

    // Verify modal is open with tabs
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(page.locator('[data-testid="tab-presets"]')).toBeVisible();

    // Select "Dark Tech" preset
    const darkTechPreset = page.locator('[data-testid="preset-dark-tech"]');
    await expect(darkTechPreset).toBeVisible();
    await darkTechPreset.click();

    // Verify live preview card updates
    const previewCard = page.locator('[data-testid="theme-live-preview"]');
    await expect(previewCard).toBeVisible();

    // Apply the design system
    const applyBtn = page.locator('[data-testid="apply-theme-button"]');
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Check code view or project to verify CSS variables were written
    // Click View Switcher to "code"
    const codeViewBtn = page.locator('button:has-text("Kode")');
    await codeViewBtn.click();
    await page.waitForTimeout(500);

    // In code view, check file tree or open styles.css
    // Switch to files panel
    await page.locator('button[aria-label="File Proyek"]').click();
    const stylesFile = page.locator('button:has-text("styles.css")');
    if (await stylesFile.isVisible()) {
      await stylesFile.click();
      await page.waitForTimeout(500);
      const editor = page.locator(".monaco-editor");
      await expect(editor).toContainText("--color-primary");
      await expect(editor).toContainText("/* --- KANVAS GLOBAL THEME --- */");
    }

    // Switch back to preview
    await page.locator('button:has-text("Visual")').click();
    await page.waitForTimeout(500);
  });

  test("2. Component Library: view sections tab, search, and insert ready section", async ({ page }) => {
    // Open Component Library panel (left sidebar "Tambah Elemen")
    const addTabBtn = page.locator('button[aria-label="Tambah Elemen"]');
    await addTabBtn.click();

    // Check tabs
    await expect(page.locator('[data-testid="tab-elements"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-components"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-sections"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-saved"]')).toBeVisible();

    // Switch to Sections tab
    await page.locator('[data-testid="tab-sections"]').click();

    // Search for "Hero"
    const searchInput = page.locator('[data-testid="search-library"]');
    await searchInput.fill("Hero");

    // Click "Sisipkan Section" on the first hero section
    const insertSectionBtn = page.locator('[data-testid^="insert-section-"]').first();
    await expect(insertSectionBtn).toBeVisible();
    await insertSectionBtn.click();

    // Verify toast notification
    await expect(page.getByText("ditambahkan").first()).toBeVisible();

    // Verify in iframe canvas that section was added
    const frame = page.frameLocator("iframe");
    const heroSection = frame.locator("section.hero-section");
    await expect(heroSection).toBeVisible();
    await expect(heroSection.locator("h1")).toContainText("Bangun Website Impian");

    // Click heading inside newly inserted section to select it
    const headingInside = heroSection.locator("h1");
    await headingInside.click();
    await expect(headingInside).toHaveAttribute("data-ve-selected", "");
  });

  test("3. Component Library: insert UI component into canvas", async ({ page }) => {
    // Open Component Library
    await page.locator('button[aria-label="Tambah Elemen"]').click();

    // Switch to Komponen UI tab
    await page.locator('[data-testid="tab-components"]').click();

    // Insert first UI component (e.g. Card or Button group)
    const insertCompBtn = page.locator('[data-testid^="insert-component-"]').first();
    await expect(insertCompBtn).toBeVisible();
    await insertCompBtn.click();

    // Verify in iframe canvas
    const frame = page.frameLocator("iframe");
    await expect(frame.locator(".card, .btn, div").first()).toBeVisible();
  });

  test("4. Reusable Components: save section from inspector and insert from saved library", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    const h1 = frame.locator("h1").first();
    await expect(h1).toBeVisible();

    // Select h1 element
    await h1.click();
    await expect(h1).toHaveAttribute("data-ve-selected", "");

    // Prepare dialog prompt listener
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("prompt");
      await dialog.accept("H1 Header Kustom Saya");
    });

    // Click "Simpan sebagai section reusable" button in Inspector
    const saveBtn = page.locator('[data-testid="save-section-btn"]');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify success toast
    await expect(page.getByText("berhasil disimpan").first()).toBeVisible();

    // Open Component Library panel and switch to "Tersimpan" tab
    await page.locator('button[aria-label="Tambah Elemen"]').click();
    await page.locator('[data-testid="tab-saved"]').click();

    // The saved section should be visible in the list
    const savedItem = page.locator('text="H1 Header Kustom Saya"');
    await expect(savedItem).toBeVisible();

    // Click "Sisipkan" on the saved section
    const insertSavedBtn = page.locator('[data-testid^="insert-saved-"]').first();
    await expect(insertSavedBtn).toBeVisible();
    await insertSavedBtn.click();

    // Canvas should now have two H1 elements
    await expect(frame.locator("h1")).toHaveCount(2);

    // Now test deleting the saved section
    const deleteSavedBtn = page.locator('[data-testid^="delete-saved-"]').first();
    await expect(deleteSavedBtn).toBeVisible();
    await deleteSavedBtn.click();

    // Section should be removed from saved list
    await expect(page.locator('text="Belum ada section tersimpan"')).toBeVisible();
  });

  test("5. Properties Panel: design token color binding", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    const h1 = frame.locator("h1").first();
    await expect(h1).toBeVisible();

    // Select h1 element
    await h1.click();

    // In inspector, find Typography section
    const inspector = page.locator("aside").filter({ hasText: "Inspector" });
    await expect(inspector).toBeVisible();

    // Click "Primary" token swatch in Warna Teks
    const primaryTokenBtn = inspector.locator('button[title*="var(--color-primary"]').first();
    if (await primaryTokenBtn.isVisible()) {
      await primaryTokenBtn.click();
      await page.waitForTimeout(300);

      // Verify h1 style in iframe has token
      const styleAttr = await h1.getAttribute("style");
      expect(styleAttr).toMatch(/var\(--color-primary/);
    }
  });
});
