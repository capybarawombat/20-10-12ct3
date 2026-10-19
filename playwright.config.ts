import { defineConfig } from '@playwright/test';

const basePath = process.env.VITE_BASE_PATH || '/20-10-12ct3/';
export default defineConfig({
    testDir: './tests',
    testMatch: '**/experience.spec.ts',
    timeout: 60000,
    workers: 1,
    use: {
        baseURL: new URL(basePath, 'http://garden.local').href,
        headless: true,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        launchOptions: {
            executablePath: process.env.CHROMIUM_PATH || undefined,
            args: ['--no-sandbox', '--disable-dev-shm-usage'],
        },
    },
    reporter: 'list',
});
