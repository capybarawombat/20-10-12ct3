/** Verify the deployed application matches this build before making printable QR assets. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

try {
    const input = process.argv[2];
    assert(input, 'Usage: npm run finalize:production -- https://OWNER.github.io/20-10-12ct3/');
    const url = new URL(input);
    assert(url.protocol === 'https:' && !url.username && !url.password, 'Supply a public HTTPS URL');
    assert(url.pathname.endsWith('/') && !url.search && !url.hash, 'Supply the canonical URL ending with /');
    const localHTML = await readFile('dist/index.html', 'utf8');
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15000) });
    assert(response.ok, `Production returned HTTP ${response.status}`);
    const html = await response.text();
    assert.match(html, /<title>The Blooming Wishes/);
    const localScript = localHTML.match(/<script[^>]+src="([^"]+)"/)?.[1];
    const liveScript = html.match(/<script[^>]+src="([^"]+)"/)?.[1];
    assert(localScript && liveScript, 'Missing application entry module');
    assert.equal(liveScript, localScript, 'The deployed application differs from the current build; deploy first');
    const moduleURL = new URL(liveScript, url);
    assert.equal(moduleURL.origin, url.origin, 'Unexpected external application module');
    assert(moduleURL.pathname.startsWith(url.pathname), 'Application module escapes the repository path');
    const assetResponse = await fetch(moduleURL, { redirect: 'error', signal: AbortSignal.timeout(15000) });
    assert(assetResponse.ok, `Application module returned HTTP ${assetResponse.status}`);
    const relative = moduleURL.pathname.slice(url.pathname.length);
    const localPath = resolve('dist', relative);
    assert(localPath.startsWith(resolve('dist') + '/'), 'Unexpected module path');
    const digest = bytes => createHash('sha256').update(bytes).digest('hex');
    assert.equal(digest(Buffer.from(await assetResponse.arrayBuffer())), digest(await readFile(localPath)),
        'Live JavaScript does not match the local build');
    console.log(`Verified production HTML and matching application bundle: ${url.href}`);
    const result = spawnSync('python3', ['scripts/generate_qr.py', url.href], { stdio: 'inherit' });
    if (result.error) throw result.error;
    assert.equal(result.status, 0, 'QR generation failed');
    console.log('Next: npm run build; git add index.html public; git commit; git push');
} catch (error) {
    console.error(`Production finalization blocked: ${error.message}`);
    if (error.cause) console.error(`Cause: ${error.cause.message}`);
    process.exitCode = 1;
}
