import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const basePath = process.env.VITE_BASE_PATH || '/20-10-12ct3/';
test.beforeEach(async ({ page }) => {
    // Serve only the real Pages mount point. Root-absolute asset mistakes must fail.
    await page.route('http://garden.local/**', async (route) => {
        const pathname = new URL(route.request().url()).pathname;
        if (!pathname.startsWith(basePath)) {
            await route.fulfill({ status: 404, body: 'Outside the repository mount point' });
            return;
        }
        const relativePath = decodeURIComponent(pathname.slice(basePath.length)) || 'index.html';
        const directory = resolve('dist');
        const file = resolve(directory, relativePath);
        if (!file.startsWith(directory + '/')) {
            await route.fulfill({ status: 403, body: 'Forbidden' });
            return;
        }
        try {
            const body = await readFile(file);
            const contentType = file.endsWith('.js') ? 'application/javascript'
                : file.endsWith('.css') ? 'text/css'
                    : file.endsWith('.svg') ? 'image/svg+xml'
                        : file.endsWith('.png') ? 'image/png' : 'text/html';
            await route.fulfill({ body, contentType });
        }
        catch {
            await route.fulfill({ status: 404, body: 'Missing built asset' });
        }
    });
});
const KEY = '12ct3-blooming-v1';
test('complete story, persistence, guarded collection and finale', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400)
        errors.push(`${r.status()}: ${r.url()}`); });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    await expect(page.getByTestId('intro-envelope')).toBeVisible();
    await page.getByTestId('intro-envelope').click();
    await expect(page.getByRole('dialog')).toContainText('Gửi những cô gái');
    await page.locator('.modal-backdrop').click({ position: { x: 3, y: 3 } });
    await expect(page.locator('main')).toHaveAttribute('data-phase', 'TREE');
    await expect(page.locator('.ornament')).toHaveCount(20);
    await page.getByTestId('ornament-1').click();
    await expect(page.locator('main')).toHaveAttribute('data-phase', 'WISH_OPEN');
    await expect(page.getByRole('dialog')).toContainText('Chúc bạn luôn xinh đẹp');
    await expect(page.locator('.counter strong')).toContainText('0');
    await page.getByRole('button', { name: 'Đóng lời chúc' }).click();
    await expect(page.getByTestId('ornament-1')).toHaveCount(0);
    await expect(page.locator('.counter strong')).toContainText('1');
    await page.reload();
    await expect(page.getByTestId('ornament-1')).toHaveCount(0);
    await expect(page.locator('.ornament')).toHaveCount(19);
    for (let i = 2; i <= 20; i++) {
        await page.getByTestId(`ornament-${i}`).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByTestId(`ornament-${i}`)).toHaveCount(0);
    }
    await expect(page.locator('main')).toHaveAttribute('data-phase', 'ALL_COLLECTED');
    await expect(page.locator('.counter strong')).toContainText('20');
    for (let i = 0; i < 3; i++) {
        await page.getByRole('button', { name: `Chạm thân cây, ${i} trên 3 lần` }).click();
        if (i < 2)
            await expect(page.locator('main')).toHaveAttribute('data-phase', 'CHOPPING');
        await page.waitForTimeout(150);
    }
    await expect(page.locator('main')).toHaveAttribute('data-phase', 'FINALE');
    await expect(page.locator('.finale h1')).toHaveText('CHÚC CÁC BẠN NỮ LỚP 12CT3 20/10 VUI VẺ! 💖🌸');
    await page.reload();
    await expect(page.locator('.finale')).toBeVisible();
    await page.getByRole('button', { name: '🌷 Trải nghiệm lại từ đầu' }).click();
    await expect(page.getByTestId('intro-envelope')).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('intro-envelope')).toBeVisible();
    expect(errors).toEqual([]);
});
for (const [width, height] of [[360, 800], [375, 812], [390, 844], [430, 932], [768, 1024], [1440, 900]]) {
    test(`reachable, nonoverlapping ornaments at ${width}×${height}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.addInitScript(({ key }) => localStorage.setItem(key, JSON.stringify({ collected: [] })), { key: KEY });
        await page.goto('./');
        await expect(page.locator('.ornament')).toHaveCount(20);
        const rects = await page.locator('.ornament').evaluateAll(elements => elements.map(element => {
            const r = element.getBoundingClientRect();
            return { id: element.getAttribute('data-testid'), x: r.x, y: r.y, width: r.width, height: r.height };
        }));
        await testInfo.attach('ornament-hit-areas', { body: JSON.stringify(rects, null, 2), contentType: 'application/json' });
        for (const rect of rects) {
            expect(rect.width, `${rect.id}: touch width`).toBeGreaterThanOrEqual(44);
            expect(rect.height, `${rect.id}: touch height`).toBeGreaterThanOrEqual(44);
            expect(rect.x, `${rect.id}: left edge`).toBeGreaterThanOrEqual(0);
            expect(rect.x + rect.width, `${rect.id}: right edge`).toBeLessThanOrEqual(width);
        }
        const overlaps = [];
        for (let i = 0; i < rects.length; i++) {
            for (let j = i + 1; j < rects.length; j++) {
                const a = rects[i], b = rects[j];
                if (a.x + a.width > b.x && b.x + b.width > a.x && a.y + a.height > b.y && b.y + b.height > a.y) {
                    overlaps.push({ first: a, second: b });
                }
            }
        }
        expect(overlaps, `Overlapping touch targets at ${width}×${height}`).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
        await page.screenshot({ path: `test-results/garden-${width}.png`, fullPage: true });
        // Exercise the formerly failing viewport as well as measuring its geometry.
        if (width === 360) {
            for (let id = 1; id <= 20; id++) {
                await page.getByTestId(`ornament-${id}`).click();
                await expect(page.getByRole('dialog', { name: `Lời chúc số ${id}`, exact: true })).toBeVisible();
                await page.keyboard.press('Escape');
                await expect(page.getByTestId(`ornament-${id}`)).toHaveCount(0);
            }
            await expect(page.locator('.counter strong')).toContainText('20');
        }
    });
}
test('regular motion, keyboard focus and card fit', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('./');
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await test.step('Click the floating envelope through its stable touch target', async () => {
        await expect(page.getByTestId('intro-envelope')).toHaveCSS('animation-name', 'none');
        await expect(page.locator('.envelope-visual')).toHaveCSS('animation-name', 'float');
        await page.getByTestId('intro-envelope').click();
        await expect(page.locator('main')).toHaveAttribute('data-phase', 'INTRO_LETTER_OPEN');
    });
    await test.step('Dialog receives focus and fits after its entrance animation', async () => {
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeFocused();
        // Measure the resting card, not its intentionally offset/rotated entrance pose.
        await expect.poll(() => dialog.evaluate(element => element.getAnimations().every(animation => animation.playState === 'finished'))).toBe(true);
        const box = await dialog.boundingBox();
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.y + box!.height).toBeLessThanOrEqual(800);
    });
    await test.step('Escape closes the letter and enables the tree', async () => {
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(page.locator('main')).toHaveAttribute('data-phase', 'TREE');
    });
    await test.step('Click swaying ornament 10 without forcing the interaction', async () => {
        await expect(page.getByTestId('ornament-10')).toHaveCSS('animation-name', 'none');
        await expect(page.getByTestId('ornament-10').locator('.ornament-visual')).toHaveCSS('animation-name', 'swing');
        await page.getByTestId('ornament-10').click();
        await expect(page.getByRole('dialog', { name: 'Lời chúc số 10', exact: true })).toBeFocused();
        await expect(page.locator('main')).toHaveAttribute('data-phase', 'WISH_OPEN');
        await expect(page.locator('.counter strong')).toContainText('0');
    });
    await test.step('Close the wish, await its fall, and update the counter', async () => {
        await page.getByRole('button', { name: 'Cất lời chúc vào tim ♡' }).click();
        await expect(page.getByTestId('ornament-10')).toHaveCount(0);
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(page.locator('.counter strong')).toContainText('1');
        await expect(page.locator('main')).toHaveAttribute('data-phase', 'TREE');
        await expect(page.locator('[data-focus-fallback]')).toBeFocused();
    });
    expect(errors).toEqual([]);
});
