import { test, expect } from "@playwright/test";
import JSZip from "jszip";

test.describe("Phase 3.1: Component System Hardening", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home and create a fresh project
    await page.goto("/");
    await page.locator('button:has-text("Project baru")').first().click();
    await page.locator("#project-name").fill("Hardening E2E Project");
    await page.locator('button[type="submit"]:has-text("Buat & mulai edit")').click();
    await expect(page).toHaveURL(/\/editor\//);

    // Wait for the preview iframe to load
    const frameElement = page.locator("iframe");
    await expect(frameElement).toBeVisible();
    await page.waitForTimeout(1000);
  });

  test("1. Duplicate HTML ID protection & internal reference rewriting", async ({ page }) => {
    // Open Component Library panel
    await page.locator('button[aria-label="Tambah Elemen"]').click();

    // Switch to Sections tab
    await page.locator('[data-testid="tab-sections"]').click();

    // Filter or find FAQ section
    const searchInput = page.locator('[data-testid="search-library"]');
    await searchInput.fill("Tanya Jawab");

    const insertFaqBtn = page.locator('[data-testid="insert-section-faq-section"]');
    await expect(insertFaqBtn).toBeVisible();

    // 1st Insertion of FAQ
    await insertFaqBtn.click();
    await expect(page.getByText("ditambahkan").first()).toBeVisible();

    const frame = page.frameLocator("iframe");
    const firstFaq = frame.locator("section#faq-section");
    await expect(firstFaq).toBeVisible();

    // Verify 1st FAQ internal references
    const firstLink = firstFaq.locator('a[href="#faq-section"]');
    await expect(firstLink).toBeVisible();
    await expect(firstFaq.locator("#faq-title")).toBeVisible();
    await expect(firstFaq.locator("#faq-q1")).toBeVisible();
    await expect(firstFaq.locator('p[aria-labelledby="faq-q1"]')).toBeVisible();

    // 2nd Insertion of FAQ (will trigger ID collision resolution)
    await insertFaqBtn.click();
    await page.waitForTimeout(500);

    // Verify second FAQ instance has deduplicated IDs
    const secondFaq = frame.locator("section#faq-section-1");
    await expect(secondFaq).toBeVisible();

    // Verify second FAQ internal references point to its unique IDs
    const secondLink = secondFaq.locator('a[href="#faq-section-1"]');
    await expect(secondLink).toBeVisible();
    await expect(secondFaq.locator("#faq-title-1")).toBeVisible();
    await expect(secondFaq.locator("#faq-q1-1")).toBeVisible();
    await expect(secondFaq.locator('p[aria-labelledby="faq-q1-1"]')).toBeVisible();

    // Verify first FAQ was not modified
    await expect(frame.locator("section#faq-section")).toBeVisible();
    await expect(firstFaq.locator('a[href="#faq-section"]')).toBeVisible();
  });

  test("2. Multi-page Global Theme & Google Fonts synchronization across 3 pages", async ({ page }) => {
    // Helper to add a new page via PageManagerModal
    const createPage = async (pageName: string) => {
      // Click bottom-left pages floating button
      const pagesBtn = page.locator('button[title="Daftar halaman HTML di project"]');
      await pagesBtn.click();
      await page.locator('button:has-text("Kelola Halaman...")').click();

      // Inside PageManagerModal
      await page.locator('button:has-text("Tambah Halaman Baru")').click();
      const input = page.locator('input[placeholder*="tentang.html"]');
      await input.fill(pageName);
      await page.locator('button:has-text("Buat Halaman")').click();
      await page.waitForTimeout(400);

      // Close page manager modal
      const closeBtn = page.locator('button:has-text("Selesai")');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await page.locator('div[role="dialog"]').waitFor({ state: "hidden" });
    };

    // Add about.html and contact.html
    await createPage("about.html");
    await createPage("contact.html");

    // Open Global Theme modal
    const themeBtn = page.locator('button[aria-label="Tema Global"]');
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();

    // Select preset "Dark Tech"
    const darkTechPreset = page.locator('[data-testid="preset-dark-tech"]');
    await expect(darkTechPreset).toBeVisible();
    await darkTechPreset.click();

    // Apply the theme
    await page.locator('[data-testid="apply-theme-button"]').click();
    await page.locator('div[role="dialog"]').waitFor({ state: "hidden" });
    await page.waitForTimeout(500);

    // Switch to code view
    await page.locator('button:has-text("Kode")').click();
    await page.waitForTimeout(400);

    // Open Files Panel
    await page.locator('button[aria-label="File Proyek"]').click();
    await page.waitForTimeout(300);

    // Verify index.html contains fonts and stylesheet
    const indexBtn = page.locator('button[aria-label="Buka file index.html"]');
    await expect(indexBtn).toBeVisible();
    await indexBtn.click();
    await page.waitForTimeout(600);
    const monaco = page.locator(".monaco-editor");
    await expect(monaco).toBeVisible();
    await expect(monaco).toContainText('rel="stylesheet" data-kanvas-fonts=""');
    await expect(monaco).toContainText('href="styles.css"');

    // Verify about.html contains fonts and stylesheet
    const aboutBtn = page.locator('button[aria-label="Buka file about.html"]');
    await expect(aboutBtn).toBeVisible();
    await aboutBtn.click();
    await page.waitForTimeout(600);
    await expect(monaco).toContainText('rel="stylesheet" data-kanvas-fonts=""');
    await expect(monaco).toContainText('href="styles.css"');

    // Verify contact.html contains fonts and stylesheet
    const contactBtn = page.locator('button[aria-label="Buka file contact.html"]');
    await expect(contactBtn).toBeVisible();
    await contactBtn.click();
    await page.waitForTimeout(600);
    await expect(monaco).toContainText('rel="stylesheet" data-kanvas-fonts=""');
    await expect(monaco).toContainText('href="styles.css"');

    // Verify styles.css has the global theme block and variables
    const stylesBtn = page.locator('button[aria-label="Buka file styles.css"]');
    await expect(stylesBtn).toBeVisible();
    await stylesBtn.click();
    await page.waitForTimeout(600);
    await expect(monaco).toContainText("/* --- KANVAS GLOBAL THEME --- */");
    await expect(monaco).toContainText("--color-primary");
  });

  test("3. Saved Sections IndexedDB persistence and page reload", async ({ page }) => {
    const frame = page.frameLocator("iframe");
    const h1 = frame.locator("h1").first();
    await expect(h1).toBeVisible();

    // Select element
    await h1.click();
    await expect(h1).toHaveAttribute("data-ve-selected", "");

    // Set dialog prompt handler
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("prompt");
      await dialog.accept("Komponen Hero Hardening");
    });

    // Save as reusable section
    const saveBtn = page.locator('[data-testid="save-section-btn"]');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Wait for success toast
    await expect(page.getByText("berhasil disimpan").first()).toBeVisible();

    // Reload browser page to verify IndexedDB persistence
    await page.reload();
    await expect(page.locator("iframe")).toBeVisible();
    await page.waitForTimeout(1000);

    // Open Component Library
    await page.locator('button[aria-label="Tambah Elemen"]').click();
    await page.locator('[data-testid="tab-saved"]').click();

    // Assert that the saved section exists after reload
    const savedCard = page.locator('text="Komponen Hero Hardening"');
    await expect(savedCard).toBeVisible();

    // Insert saved section from storage
    const insertSavedBtn = page.locator('[data-testid^="insert-saved-"]').first();
    await expect(insertSavedBtn).toBeVisible();
    await insertSavedBtn.click();

    // Verify canvas now contains duplicated H1
    await expect(frame.locator("h1")).toHaveCount(2);
  });

  test("4. Project backup ZIP export & metadata verification", async ({ page }) => {
    // Apply a theme so styles.css is generated in project
    const themeBtn = page.locator('button[aria-label="Tema Global"]');
    await themeBtn.click();
    await page.locator('[data-testid="preset-dark-tech"]').click();
    await page.locator('[data-testid="apply-theme-button"]').click();
    await page.locator('div[role="dialog"]').waitFor({ state: "hidden" });

    // Save a section first so backup includes savedSections
    const frame = page.frameLocator("iframe");
    const h1 = frame.locator("h1").first();
    await h1.click();

    page.once("dialog", async (dialog) => {
      await dialog.accept("Backup Test Section");
    });
    await page.locator('[data-testid="save-section-btn"]').click();
    await expect(page.getByText("berhasil disimpan").first()).toBeVisible();

    // Open export options dropdown
    const exportChevron = page.locator('button[title="Pilihan ekspor lainnya"]');
    await expect(exportChevron).toBeVisible();
    await exportChevron.click();

    // Trigger backup zip download
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator('button:has-text("Cadangan Proyek (.zip)")').click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.zip$/);

    // Read download stream
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const zipBuffer = Buffer.concat(chunks);

    // Verify ZIP contents using JSZip
    const zip = await JSZip.loadAsync(zipBuffer);
    expect(zip.file("index.html")).toBeTruthy();
    expect(zip.file("styles.css")).toBeTruthy();
    expect(zip.file(".kanvas/project.json")).toBeTruthy();

    const projectJsonRaw = await zip.file(".kanvas/project.json")!.async("string");
    const projectData = JSON.parse(projectJsonRaw);

    expect(projectData.name).toBeTruthy();
    expect(projectData.entry).toBe("index.html");
    expect(Array.isArray(projectData.savedSections)).toBe(true);
    expect(projectData.savedSections.length).toBeGreaterThan(0);
    expect(projectData.savedSections.some((s: { name: string }) => s.name === "Backup Test Section")).toBe(true);
  });
});
