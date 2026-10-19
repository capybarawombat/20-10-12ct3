import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = process.env.VITE_BASE_PATH || '/20-10-12ct3/';
const html = await readFile('dist/index.html', 'utf8');
const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map(match => match[1]).filter(ref => !/^(?:https?:|data:|#)/.test(ref));
assert(references.some(ref => ref.includes('/assets/') && ref.endsWith('.js')), 'Missing application module');
assert(references.some(ref => ref.includes('/assets/') && ref.endsWith('.css')), 'Missing application stylesheet');
const mount = new URL(base, 'https://build.local/');
for (const reference of references) {
    const url = new URL(reference, mount);
    assert(url.origin === mount.origin && url.pathname.startsWith(mount.pathname),
        `${reference} escapes the configured mount point ${base}`);
    const asset = resolve('dist', url.pathname.slice(mount.pathname.length));
    assert(asset.startsWith(resolve('dist') + '/'), 'Unexpected asset traversal');
    assert((await stat(asset)).isFile(), `Missing asset: ${asset}`);
}
assert.match(html, /<html lang="vi">/);
assert.match(html, /The Blooming Wishes/);
console.log(`Verified ${references.length} built asset references under ${base}`);
