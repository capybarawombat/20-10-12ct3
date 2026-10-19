# The Blooming Wishes — Cây Điều Ước 12CT3

An illustrated, mobile-first Vietnamese Women's Day garden. All artwork is original SVG; all audio is original browser synthesis. No external assets, accounts, APIs, tracking, or backend are needed.

## Run

Requires Node 22.18+ (or Node 24/26) and npm.

```sh
npm ci
npm run dev
```

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The end-to-end suite loads the built `dist/` through Playwright request interception, so a separate server is unnecessary. Always build first. Tests run under `/20-10-12ct3/`, matching the production build; `VITE_BASE_PATH` overrides both build and test paths. Set `CHROMIUM_PATH` only if using an existing Chromium executable. `npm run preview` serves the production build normally.

## Experience

- Sealed animated envelope, general letter, and backdrop/Escape dismissal.
- Custom organic flowering tree, landscape, blossoms, flower beds, atmospheric particles, and 20 ornaments in 10 illustrated designs.
- Twenty editable wishes, ten themed particle variants, animated cards, and falling ornaments.
- State guards prevent duplicate collection and simultaneous cards. Progress is saved only after the falling animation completes. Private-browsing/storage failure falls back to memory.
- At 20/20 a glowing magical axe unlocks. Three valid trunk taps transform the tree and open the final greeting, fireworks, original celebratory melody, restart and sharing.
- Optional sound starts only with an explicit sound-toggle gesture. The sound is synthesized and requires no licensed audio files.
- Large touch controls, keyboard focus containment/restoration, accessible dialogs, safe-area padding, reduced-motion handling, capped canvas resolution and particle counts, and hidden-tab rendering pauses.

Edit content and deterministic anchor positions in `src/data/wishes.ts`. Progress/state guards live in `src/hooks/useWishProgress.ts`; artwork lives in `src/components/Artwork.tsx`.

### Offline implementation choice

The requested Motion and Tailwind packages could not be downloaded in the authoring sandbox. This version uses React + TypeScript + Vite, handcrafted CSS, and a small native Web Animations helper in `src/lib/animation.tsx`. It has no mock packages or runtime CDN dependency. Lint uses the TypeScript AST to check source syntax, explicit `any`, and leftover debug logging; type checking is a separate strict TypeScript check.

## GitHub Pages

The project itself is a Git repository in this directory. The outer workspace has a read-only empty `.git` directory, so keep this project as the repository root.

1. Authenticate GitHub CLI: `gh auth login`.
2. Create/push the repository:

   ```sh
   gh repo create 20-10-12ct3 --public --source=. --remote=origin --push
   ```

3. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**. Run the **Deploy the wishing garden** workflow if the first run happened before Pages was enabled.
4. The official configure/upload/deploy Pages actions determine the actual Pages URL and repository subpath. Vite uses `VITE_BASE_PATH` from `configure-pages` instead of assuming `/`.
5. Confirm the deployed workflow URL responds, open the entire experience on a phone, and print the generated poster only after confirming its exact URL.

The workflow runs lint, strict type checking, state tests, QR generation, build, Chromium end-to-end tests, and official Pages deployment. It generates PNG social preview metadata with an absolute URL. For manual builds, `VITE_BASE_PATH=/REPOSITORY/ npm run build` works; the default is `/20-10-12ct3/`. The build verifies that every application, stylesheet, and favicon reference resolves inside the configured mount point.

## Print-ready QR code

No placeholder QR is checked in. Generate only once the exact production URL is established:

```sh
# Ubuntu prerequisites (CI installs these automatically):
sudo apt-get install qrencode python3-pil fonts-dejavu
npm run qr -- https://YOUR-ACTUAL-USERNAME.github.io/YOUR-ACTUAL-REPOSITORY/
npm run build
```

The generator rejects placeholder hosts and requires HTTPS with a trailing slash. It creates:

- `public/qr-code.png`: high-contrast QR with H error correction and four-module quiet zone.
- `public/qr-code.svg`: scalable print master.
- `public/qr-poster.png`: 1800 × 2400 decorative poster, 300 DPI, with untouched white QR background.
- `public/qr-destination.json`: exact encoded URL for verification.
- `public/social-preview.png`: social sharing image; `index.html` gets its absolute production URL.

CI publishes these under the live URL (for example `.../qr-poster.png`) in the Pages artifact; it does not commit generated files back to the source. Scan from a second device before printing a batch.

## Verification in the authoring environment

- Strict TypeScript, production build (including repository-path asset checks), targeted lint and six state-machine unit cases passed.
- Eight Playwright cases are included: full collection/finale/persistence/restart, six requested viewport sizes with non-overlapping 44px touch targets, regular-motion card fit and keyboard handling.
- Browser execution was blocked before test assertions: the sandbox denies Chromium's OS socket calls (`setsockopt: Operation not permitted`). The static-server escalation was also rejected by automatic approval policy. The follow-up headless-shell attempt also failed before page assertions (`shutdown: Operation not permitted`). Browser layout, runtime console and E2E behavior are therefore **not verified here**.
- The QR generator was exercised in a temporary test directory; both the standalone PNG and the printable poster decoded to the exact supplied test URL with `zbarimg`. No test QR was copied into the project.
- GitHub CLI reported an invalid authentication token; API requests also fail to connect. The intended origin is `https://github.com/capybarawombat/20-10-12ct3.git`, inferred from the configured GitHub account and requested repository name; its existence/access cannot be verified from this sandbox. No public repository or live deployment has been verified. Production QR files are intentionally pending the final URL.

## License

Original artwork, wishes, animations, and synthesized sound may be used and adapted for this class celebration. Third-party dependencies retain their own licenses.

## Finish publishing after restoring access

The current environment cannot resolve GitHub hosts or launch Chromium because of sandbox restrictions. `gh auth status` also reports the configured token as invalid; that must be rechecked with working network access before concluding whether the token itself needs replacement.

In a network-enabled terminal, from this project directory:

```sh
gh auth status
# If authentication still fails:
gh auth login --hostname github.com
gh auth setup-git
# Confirm the intended repository exists and this account can write it:
gh repo view capybarawombat/20-10-12ct3
git push -u origin main
```

Select GitHub Actions in repository Settings → Pages. Alternatively, if Pages does not exist yet and the account has repository administration permission:

```sh
gh api --method POST repos/capybarawombat/20-10-12ct3/pages -f build_type=workflow
# For an existing Pages configuration, use --method PUT instead of POST.
gh workflow run deploy.yml
gh run list --workflow deploy.yml
```

After the deployment succeeds, obtain its actual URL from the deployment job or `gh api repos/capybarawombat/20-10-12ct3/pages --jq .html_url`. Then:

```sh
npm run build
npm run finalize:production -- https://capybarawombat.github.io/20-10-12ct3/
# This checks HTTP success, the expected title, module location and an exact
# SHA-256 match to the local JavaScript before generating QR assets.
npm run build
git add index.html public/qr-code.png public/qr-code.svg public/qr-poster.png public/qr-destination.json public/social-preview.png
git commit -m "Add verified production QR code and printable poster"
git push
```

The URL in that example is an **unverified candidate**, not a claim of deployment. Use the actual Pages API result if it differs. Final poster location: `public/qr-poster.png`; after the final deployment it is also available at `<verified-site-url>qr-poster.png`. No production QR/poster has been generated yet because the live URL has not been verified.
