import { test, expect } from "@playwright/test";
import JSZip from "jszip";

test.describe("Phase 4: Professional Template Library", () => {
  test("1. Template Gallery discovery, search, category filtering & featured toggle", async ({
    page,
  }) => {
    await page.goto("/");

    // Click tab to open embedded template library
    const templatesTab = page.locator('[data-testid="tab-templates"]');
    await expect(templatesTab).toBeVisible();
    await templatesTab.click();

    // Verify search input is visible
    const searchInput = page.locator('[data-testid="search-template-input"]');
    await expect(searchInput).toBeVisible();

    // Verify at least 8 template cards are rendered
    const cards = page.locator('article[data-testid^="template-card-"]');
    await expect(cards).toHaveCount(8);

    // Test Category Filtering
    // Filter: SaaS
    await page.locator('[data-testid="category-filter-saas"]').click();
    await expect(page.locator('[data-testid="template-card-saas-cloudscale"]')).toBeVisible();
    await expect(page.locator('[data-testid="template-card-portfolio-minimal"]')).toBeHidden();

    // Filter: Portfolio
    await page.locator('[data-testid="category-filter-portfolio"]').click();
    await expect(page.locator('[data-testid="template-card-portfolio-minimal"]')).toBeVisible();
    await expect(page.locator('[data-testid="template-card-saas-cloudscale"]')).toBeHidden();

    // Filter: E-commerce
    await page.locator('[data-testid="category-filter-e-commerce"]').click();
    await expect(page.locator('[data-testid="template-card-ecommerce-lumina"]')).toBeVisible();

    // Reset filter to Semua
    await page.locator('[data-testid="category-filter-semua"]').click();
    await expect(cards).toHaveCount(8);

    // Test Search Filtering
    await searchInput.fill("CloudScale");
    await expect(page.locator('[data-testid="template-card-saas-cloudscale"]')).toBeVisible();
    await expect(page.locator('[data-testid="template-card-business-apex"]')).toBeHidden();

    await searchInput.fill("Atelier");
    await expect(page.locator('[data-testid="template-card-creative-atelier"]')).toBeVisible();
    await expect(page.locator('[data-testid="template-card-saas-cloudscale"]')).toBeHidden();

    // Clear search
    await searchInput.fill("");
    await expect(cards).toHaveCount(8);

    // Test Featured Toggle
    const featuredToggle = page.locator('[data-testid="toggle-featured-btn"]');
    await featuredToggle.click();
    // Only featured templates should be shown
    const featuredCount = await cards.count();
    expect(featuredCount).toBeGreaterThan(0);
    expect(featuredCount).toBeLessThanOrEqual(8);

    // Unset featured toggle
    await featuredToggle.click();
    await expect(cards).toHaveCount(8);
  });

  test("2. Template Preview Modal with device switcher & multi-page preview", async ({
    page,
  }) => {
    // Navigate directly to /templates route
    await page.goto("/templates");

    const saasCard = page.locator('[data-testid="template-card-saas-cloudscale"]');
    await expect(saasCard).toBeVisible();

    // Click on thumbnail area to open preview modal
    await saasCard.locator(".aspect-\\[16\\/10\\]").click();

    // Verify Preview Modal opened
    await expect(page.locator('h2:has-text("CloudScale — Modern SaaS Platform")')).toBeVisible();
    const previewIframe = page.locator('[data-testid="template-preview-iframe"]');
    await expect(previewIframe).toBeVisible();

    // Verify Device Switcher buttons
    const desktopBtn = page.locator('[data-testid="preview-device-desktop"]');
    const tabletBtn = page.locator('[data-testid="preview-device-tablet"]');
    const mobileBtn = page.locator('[data-testid="preview-device-mobile"]');
    await expect(desktopBtn).toBeVisible();
    await expect(tabletBtn).toBeVisible();
    await expect(mobileBtn).toBeVisible();

    // Switch to Tablet
    await tabletBtn.click();
    await page.waitForTimeout(300);

    // Switch to Mobile
    await mobileBtn.click();
    await page.waitForTimeout(300);

    // Switch back to Desktop
    await desktopBtn.click();

    // Verify Multi-Page Preview Switcher inside modal
    const pricingPageBtn = page.locator('[data-testid="preview-page-pricing.html"]');
    await expect(pricingPageBtn).toBeVisible();
    await pricingPageBtn.click();

    // Allow srcdoc update
    await page.waitForTimeout(500);

    // Close preview modal via close button
    const closeBtn = page.locator('button[aria-label="Tutup preview template"]');
    await closeBtn.click();
    await expect(previewIframe).toBeHidden();
  });

  test("3. Create project from template, visual editing in canvas & isolation verification", async ({
    page,
  }) => {
    await page.goto("/templates");

    // Click "Gunakan Template" directly on saas-cloudscale card
    const useBtn = page.locator('[data-testid="use-template-btn-saas-cloudscale"]');
    await expect(useBtn).toBeVisible();
    await useBtn.click();

    // Verify navigation to editor with newly created project
    await expect(page).toHaveURL(/\/editor\//);

    // Wait for canvas iframe
    const frame = page.frameLocator("iframe");
    const heroHeading = frame.locator("h1");
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText("Skalakan Aplikasi Cloud Anda");

    // Verify multi-page files are present
    const openPagesBtn = page.locator('button[aria-label="Manajemen Halaman"]');
    if (await openPagesBtn.isVisible()) {
      await openPagesBtn.click();
      await expect(page.getByText("pricing.html").first()).toBeVisible();
      // Close page manager modal
      await page.keyboard.press("Escape");
    }

    // Direct Canvas Selection & Inline Editing
    await heroHeading.click();
    await expect(heroHeading).toHaveAttribute("data-ve-selected", "");

    // Double click to enter inline edit
    await heroHeading.dblclick();
    await expect(heroHeading).toHaveAttribute("data-ve-editing-text", "");

    // Edit text
    await heroHeading.fill("CloudScale E2E Visual Editing");
    await heroHeading.blur();

    // Verify canvas content changed
    await expect(heroHeading).toContainText("CloudScale E2E Visual Editing");

    // Verify Isolation: Navigating back to templates gallery retains pristine template
    await page.goto("/templates");
    const saasCard = page.locator('[data-testid="template-card-saas-cloudscale"]');
    await saasCard.locator(".aspect-\\[16\\/10\\]").click();

    // In modal preview, template still has original heading
    const previewFrame = page.frameLocator('[data-testid="template-preview-iframe"]');
    await expect(previewFrame.locator("h1")).toContainText("Skalakan Aplikasi Cloud Anda");
  });

  test("4. Save project as template & user template library management", async ({
    page,
  }) => {
    // Create a new project from Blank Canvas first
    await page.goto("/");
    await page.locator('button:has-text("Project baru")').first().click();
    await page.locator("#project-name").fill("Custom Startup Website");
    await page.locator('button[type="submit"]:has-text("Buat & mulai edit")').click();
    await expect(page).toHaveURL(/\/editor\//);

    // Wait for iframe
    const frame = page.frameLocator("iframe");
    await expect(frame.locator("body")).toBeVisible();

    // Open Export dropdown
    const exportDropdown = page.locator('[data-testid="export-dropdown-toggle"]');
    await expect(exportDropdown).toBeVisible();
    await exportDropdown.click();

    // Click "Simpan sebagai Template"
    const saveAsTemplateBtn = page.locator('[data-testid="save-as-template-menu-item"]');
    await expect(saveAsTemplateBtn).toBeVisible();
    await saveAsTemplateBtn.click();

    // Modal opens
    await expect(page.getByText("Simpan Proyek sebagai Template")).toBeVisible();

    // Fill metadata
    const nameInput = page.locator('[data-testid="save-template-name-input"]');
    await nameInput.fill("Neon SaaS Master Template");

    const categorySelect = page.locator('[data-testid="save-template-category-select"]');
    await categorySelect.selectOption("SaaS");

    const descInput = page.locator('[data-testid="save-template-description-input"]');
    await descInput.fill("Template kustom khusus dengan styling neon dan navigasi lengkap.");

    // Submit save
    const confirmBtn = page.locator('[data-testid="confirm-save-template-btn"]');
    await confirmBtn.click();

    // Verify toast or modal closing
    await expect(page.getByText("berhasil disimpan sebagai template").first()).toBeVisible();

    // Navigate to /templates
    await page.goto("/templates");

    // Switch to "Template Saya"
    const customTab = page.locator('[data-testid="category-filter-custom"]');
    await expect(customTab).toBeVisible();
    await customTab.click();

    // Verify saved template appears in "Template Saya"
    await expect(page.locator('h3:has-text("Neon SaaS Master Template")')).toBeVisible();
    await expect(page.getByText("Template kustom khusus dengan styling neon")).toBeVisible();
  });
});
