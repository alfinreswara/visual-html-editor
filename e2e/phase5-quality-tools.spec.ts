import { test, expect } from "@playwright/test";

test.describe("Phase 5: Preview & Website Quality Tools", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home and create a fresh project
    await page.goto("/");
    await page.locator('button:has-text("Project baru")').first().click();
    await page.locator("#project-name").fill("Quality Tools E2E Project");
    await page.locator('button[type="submit"]:has-text("Buat & mulai edit")').click();
    await expect(page).toHaveURL(/\/editor\//);

    // Wait for the preview iframe to load
    const frameElement = page.locator("iframe");
    await expect(frameElement).toBeVisible();
    await page.waitForTimeout(1000);
  });

  test("1. Open Quality Dashboard (Audit Modal), verify metric chips, category filters, and close", async ({
    page,
  }) => {
    // Topbar audit button should be visible with badge
    const auditBtn = page.locator('[data-testid="open-audit-btn"]');
    await expect(auditBtn).toBeVisible();

    // Click to open the audit modal
    await auditBtn.click();

    // Verify modal elements
    const modal = page.locator('[data-testid="audit-modal"]');
    await expect(modal).toBeVisible();

    // Verify counter chips
    await expect(page.locator('[data-testid="audit-error-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-warning-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-info-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-passed-count"]')).toBeVisible();

    // Verify category filter buttons
    await expect(page.locator('[data-testid="audit-category-all"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-category-html"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-category-seo"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-category-a11y"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-category-assets"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-category-responsive"]')).toBeVisible();

    // Verify Passed tab and return to Issues tab
    const passedTab = page.locator('[data-testid="tab-audit-passed"]');
    await expect(passedTab).toBeVisible();
    await passedTab.click();

    // Passed tab should list passing checks
    await expect(page.getByText("Pemeriksaan Berhasil")).toBeVisible();

    // Return to Issues tab
    const issuesTab = page.locator('[data-testid="tab-audit-issues"]');
    await issuesTab.click();

    // Close the modal
    const closeBtn = page.locator('[data-testid="audit-close-btn"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(modal).toBeHidden();
  });

  test("2. HTML Validation: detects duplicate IDs, empty links, and empty buttons", async ({
    page,
  }) => {
    // Switch to code view to inject test HTML
    await page.locator('button[aria-pressed]:has-text("Kode")').click();
    await expect(page.locator(".monaco-editor")).toBeVisible();

    const testHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>HTML Validation Test</title>
</head>
<body>
  <main>
    <h1 id="heading-test">Judul Valid</h1>
    <div id="duplicate-target">Box Satu</div>
    <div id="duplicate-target">Box Dua</div>
    <a id="empty-link-el" href="#"></a>
    <button id="empty-btn-el" type="button"></button>
  </main>
</body>
</html>`;

    await page.evaluate((code) => {
      (window as any).__kanvasEditor?.setValue(code);
    }, testHtml);

    // Switch back to Visual mode
    await page.locator('button[aria-pressed]:has-text("Visual")').click();
    await page.waitForTimeout(600);

    // Open Audit Modal
    await page.locator('[data-testid="open-audit-btn"]').click();
    await expect(page.locator('[data-testid="audit-modal"]')).toBeVisible();

    // Filter to HTML category
    await page.locator('[data-testid="audit-category-html"]').click();

    // Verify duplicate ID issue
    await expect(
      page.locator('article[data-testid^="audit-issue-card-"]').filter({
        hasText: "ID HTML duplikat terdeteksi",
      }),
    ).toBeVisible();

    // Verify empty link issue
    await expect(
      page.locator('article[data-testid^="audit-issue-card-"]').filter({
        hasText: "Elemen tautan <a> kosong",
      }),
    ).toBeVisible();

    // Verify empty button issue
    await expect(
      page.locator('article[data-testid^="audit-issue-card-"]').filter({
        hasText: "Tombol <button> kosong tanpa label",
      }),
    ).toBeVisible();
  });

  test("3. SEO Analyzer: detects missing meta description and Open Graph tags", async ({
    page,
  }) => {
    // Switch to code view
    await page.locator('button[aria-pressed]:has-text("Kode")').click();
    await expect(page.locator(".monaco-editor")).toBeVisible();

    const seoTestHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>SEO Test Page</title>
</head>
<body>
  <main>
    <h1>SEO Heading Test</h1>
    <p>Testing missing meta tags and open graph configuration.</p>
    <a href="https://example.com">Klik di sini</a>
  </main>
</body>
</html>`;

    await page.evaluate((code) => {
      (window as any).__kanvasEditor?.setValue(code);
    }, seoTestHtml);

    await page.locator('button[aria-pressed]:has-text("Visual")').click();
    await page.waitForTimeout(600);

    // Open audit modal
    await page.locator('[data-testid="open-audit-btn"]').click();

    // Filter to SEO category
    await page.locator('[data-testid="audit-category-seo"]').click();

    // Verify Meta Description warning
    await expect(
      page.locator('article[data-testid^="audit-issue-card-"]').filter({
        hasText: "Meta Description tidak ditemukan",
      }),
    ).toBeVisible();

    // Verify Open Graph tags warning
    await expect(
      page.locator('article[data-testid^="audit-issue-card-"]').filter({
        hasText: "Tag Open Graph belum lengkap",
      }),
    ).toBeVisible();

    // Verify generic anchor text warning ("Klik di sini")
    await expect(
      page.locator('article[data-testid^="audit-issue-card-"]').filter({
        hasText: 'Teks tautan kurang deskriptif: "Klik di sini"',
      }),
    ).toBeVisible();
  });

  test("4. Accessibility Checker: detects images missing alt attributes", async ({
    page,
  }) => {
    // Switch to code view
    await page.locator('button[aria-pressed]:has-text("Kode")').click();
    await expect(page.locator(".monaco-editor")).toBeVisible();

    const a11yTestHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>A11y Test</title>
</head>
<body>
  <main>
    <h1>A11y Test Heading</h1>
    <img id="unlabelled-pic" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'></svg>" />
    <input id="unlabelled-input" type="text" />
  </main>
</body>
</html>`;

    await page.evaluate((code) => {
      (window as any).__kanvasEditor?.setValue(code);
    }, a11yTestHtml);

    await page.locator('button[aria-pressed]:has-text("Visual")').click();
    await page.waitForTimeout(600);

    // Open audit modal
    await page.locator('[data-testid="open-audit-btn"]').click();

    // Filter to A11Y category
    await page.locator('[data-testid="audit-category-a11y"]').click();

    // Verify missing alt issue
    await expect(
      page.locator('article[data-testid^="audit-issue-card-"]').filter({
        hasText: "Gambar tanpa atribut alt",
      }),
    ).toBeVisible();

    // Verify unlabelled form input issue
    await expect(
      page.locator('article[data-testid^="audit-issue-card-"]').filter({
        hasText: "Elemen form <input> tanpa label",
      }),
    ).toBeVisible();
  });

  test("5. Broken Asset Detector: detects missing local image and missing local stylesheet", async ({
    page,
  }) => {
    await page.locator('button[aria-pressed]:has-text("Kode")').click();
    await expect(page.locator(".monaco-editor")).toBeVisible();

    const brokenAssetHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Broken Asset Test</title>
  <link rel="stylesheet" href="css/nonexistent-style.css">
</head>
<body>
  <main>
    <h1>Broken Asset Page</h1>
    <img id="missing-local-img" src="images/does-not-exist.png" alt="Missing Photo" />
  </main>
</body>
</html>`;

    await page.evaluate((code) => {
      (window as any).__kanvasEditor?.setValue(code);
    }, brokenAssetHtml);

    await page.locator('button[aria-pressed]:has-text("Visual")').click();
    await page.waitForTimeout(600);

    // Open audit modal
    await page.locator('[data-testid="open-audit-btn"]').click();

    // Filter to Assets category
    await page.locator('[data-testid="audit-category-assets"]').click();

    // Verify missing local image issue
    await expect(
      page.locator('article[data-testid^="audit-issue-card-"]').filter({
        hasText: 'Berkas gambar lokal tidak ditemukan: "images/does-not-exist.png"',
      }),
    ).toBeVisible();

    // Verify missing local stylesheet issue
    await expect(
      page.locator('article[data-testid^="audit-issue-card-"]').filter({
        hasText: 'Berkas stylesheet CSS tidak ditemukan: "css/nonexistent-style.css"',
      }),
    ).toBeVisible();
  });

  test("6. Broken Internal Links: detects missing target pages and invalid #hash anchors", async ({
    page,
  }) => {
    await page.locator('button[aria-pressed]:has-text("Kode")').click();
    await expect(page.locator(".monaco-editor")).toBeVisible();

    const brokenLinksHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Broken Links Test</title>
</head>
<body>
  <main id="main-content">
    <h1>Broken Links Page</h1>
    <a id="bad-page-link" href="nonexistent-page.html">Halaman Tidak Ada</a>
    <a id="bad-hash-link" href="#missing-anchor-id">Anchor Tidak Ada</a>
  </main>
</body>
</html>`;

    await page.evaluate((code) => {
      (window as any).__kanvasEditor?.setValue(code);
    }, brokenLinksHtml);

    await page.locator('button[aria-pressed]:has-text("Visual")').click();
    await page.waitForTimeout(600);

    // Open audit modal
    await page.locator('[data-testid="open-audit-btn"]').click();

    // Filter to Links category
    await page.locator('[data-testid="audit-category-links"]').click();

    // Verify missing target page
    await expect(
      page.locator('article[data-testid^="audit-issue-card-"]').filter({
        hasText: 'Tautan ke halaman internal rusak: "nonexistent-page.html"',
      }),
    ).toBeVisible();

    // Verify broken local hash anchor
    await expect(
      page.locator('article[data-testid^="audit-issue-card-"]').filter({
        hasText: "Target tautan internal tidak ditemukan: #missing-anchor-id",
      }),
    ).toBeVisible();
  });

  test("7. Responsive Layout Checker: detects fixed widths exceeding mobile viewport (390px)", async ({
    page,
  }) => {
    await page.locator('button[aria-pressed]:has-text("Kode")').click();
    await expect(page.locator(".monaco-editor")).toBeVisible();

    const responsiveTestHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Test</title>
</head>
<body>
  <main>
    <h1>Responsive Test Page</h1>
    <div id="oversized-card" style="width: 580px; background: #eee;">
      Wide card with fixed 580px width
    </div>
  </main>
</body>
</html>`;

    await page.evaluate((code) => {
      (window as any).__kanvasEditor?.setValue(code);
    }, responsiveTestHtml);

    await page.locator('button[aria-pressed]:has-text("Visual")').click();
    await page.waitForTimeout(600);

    // Open audit modal
    await page.locator('[data-testid="open-audit-btn"]').click();

    // Filter to Responsive category
    await page.locator('[data-testid="audit-category-responsive"]').click();

    // Verify mobile overflow issue
    await expect(
      page.locator('article[data-testid^="audit-issue-card-"]').filter({
        hasText: "lebar tetap (580px) melebihi viewport (390px)",
      }),
    ).toBeVisible();
  });

  test("8. Navigate from audit finding to Canvas: click 'Pilih di Canvas' selects the element", async ({
    page,
  }) => {
    await page.locator('button[aria-pressed]:has-text("Kode")').click();
    await expect(page.locator(".monaco-editor")).toBeVisible();

    const canvasSelectHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Canvas Select Test</title>
</head>
<body>
  <main>
    <h1>Canvas Select Target</h1>
    <a id="bad-link-btn" href="#"></a>
  </main>
</body>
</html>`;

    await page.evaluate((code) => {
      (window as any).__kanvasEditor?.setValue(code);
    }, canvasSelectHtml);

    await page.locator('button[aria-pressed]:has-text("Visual")').click();
    await page.waitForTimeout(600);

    // Open audit modal
    await page.locator('[data-testid="open-audit-btn"]').click();

    // Filter to HTML category
    await page.locator('[data-testid="audit-category-html"]').click();

    // Find the empty link card
    const emptyLinkCard = page.locator('article[data-testid^="audit-issue-card-"]').filter({
      hasText: "Elemen tautan <a> kosong",
    });
    await expect(emptyLinkCard).toBeVisible();

    // Click "Pilih di Canvas"
    const selectCanvasBtn = emptyLinkCard.locator('button:has-text("Pilih di Canvas")');
    await expect(selectCanvasBtn).toBeVisible();
    await selectCanvasBtn.click();

    // Verify audit modal closed
    await expect(page.locator('[data-testid="audit-modal"]')).toBeHidden();

    // Verify element is selected in the preview iframe
    const frame = page.frameLocator("iframe");
    const targetLink = frame.locator("#bad-link-btn");
    await expect(targetLink).toHaveAttribute("data-ve-selected", "");
  });

  test("9. Multi-Page Project Audit: scope dropdown audits all project pages", async ({
    page,
  }) => {
    // Create a second HTML page
    const pagesBtn = page.locator('button[title="Daftar halaman HTML di project"]');
    await pagesBtn.click();
    await page.locator('button:has-text("Kelola Halaman...")').click();

    // Add kontak.html
    await page.locator('button:has-text("Tambah Halaman Baru")').click();
    const input = page.locator('input[placeholder*="tentang.html"]');
    await input.fill("kontak.html");
    await page.locator('button:has-text("Buat Halaman")').click();
    await page.waitForTimeout(400);

    const closeBtn = page.locator('button:has-text("Selesai")');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
    await page.locator('div[role="dialog"]').waitFor({ state: "hidden" });

    // Open audit modal
    await page.locator('[data-testid="open-audit-btn"]').click();
    await expect(page.locator('[data-testid="audit-modal"]')).toBeVisible();

    // Verify scope selector is visible since project now has 2 pages
    const scopeSelect = page.locator('[data-testid="audit-page-select"]');
    await expect(scopeSelect).toBeVisible();

    // Switch scope to "Semua Halaman"
    await scopeSelect.selectOption("all");
    await page.waitForTimeout(300);

    // Verify file path badges show multiple files (kontak.html and index.html)
    const fileBadges = page.locator('[data-testid^="audit-issue-card-"] span:has-text(".html")');
    const count = await fileBadges.count();
    expect(count).toBeGreaterThan(0);
  });

  test("10. Advanced Preview Tools: custom viewport dimensions, zoom controls, and refresh", async ({
    page,
  }) => {
    // 1. Custom Viewport Toggle
    const customViewportToggle = page.locator('[data-testid="toggle-custom-viewport-btn"]');
    await expect(customViewportToggle).toBeVisible();
    await customViewportToggle.click();

    // Custom width and height inputs should appear
    const widthInput = page.locator('[data-testid="custom-viewport-width"]');
    const heightInput = page.locator('[data-testid="custom-viewport-height"]');
    await expect(widthInput).toBeVisible();
    await expect(heightInput).toBeVisible();

    // Change custom viewport width to 500px
    await widthInput.fill("500");
    await widthInput.press("Enter");

    // Change custom viewport height to 700px
    await heightInput.fill("700");
    await heightInput.press("Enter");

    // Verify preview canvas card has max-width of 500px
    const previewCanvasCard = page.locator('[data-testid="preview-canvas-card"]');
    await expect(previewCanvasCard).toHaveCSS("max-width", "500px");

    // Verify iframe has width of 500px
    const frameElement = page.locator("iframe");
    await expect(frameElement).toHaveCSS("width", "500px");

    // 2. Zoom Controls
    const zoomInBtn = page.locator('[data-testid="preview-zoom-in-btn"]');
    const zoomOutBtn = page.locator('[data-testid="preview-zoom-out-btn"]');
    const zoomFitBtn = page.locator('[data-testid="preview-zoom-fit-btn"]');
    const zoomSelect = page.locator('[data-testid="preview-zoom-select"]');

    await expect(zoomInBtn).toBeVisible();
    await expect(zoomOutBtn).toBeVisible();
    await expect(zoomFitBtn).toBeVisible();
    await expect(zoomSelect).toBeVisible();

    // Change zoom to 75%
    await zoomSelect.selectOption("75");
    await page.waitForTimeout(200);

    // Click Zoom In -> advances to next preset (100%)
    await zoomInBtn.click();
    await page.waitForTimeout(200);

    // Click Fit -> resets to auto
    await zoomFitBtn.click();
    await page.waitForTimeout(200);
    await expect(zoomSelect).toHaveValue("auto");

    // 3. Preview Refresh
    const refreshBtn = page.locator('[data-testid="preview-refresh-btn"]');
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();

    // Preview iframe remains visible and active
    await expect(frameElement).toBeVisible();
  });
});
