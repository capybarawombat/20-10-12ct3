import { defineConfig } from 'vite';

// The repository is a project Pages site, not an account root site.
// configure-pages can override this for a custom domain or another repository.
export default defineConfig({
    base: process.env.VITE_BASE_PATH || '/20-10-12ct3/',
});
