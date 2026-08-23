# AGENTS.md — Text Inspector

This repository follows the `ttomohisa/htmlapps-template` single-HTML app contract.

## Read order

1. Read this file.
2. Read `APP_SPEC.md`.
3. Inspect `src/index.template.html` before editing.
4. Implement, build, verify, and update docs in the same task.

## Product constraints

- Edit `src/index.template.html`; do not hand-edit generated files under `dist/`.
- Keep both `dist/index.html` and `dist/index.self-extract.html` as one-file releases.
- No runtime CDN, external font, analytics, telemetry, API request, or hidden network dependency.
- Keep CSP restrictive with `connect-src 'none'`.
- Keep the UI light-only, responsive, keyboard-accessible, and usable from 320px upward.
- Keep Japanese and English in the same HTML.
- Use inline SVG rather than emoji for primary interface icons.
- Preserve `APP:BEGIN` / `APP:END` and `APP:HELP:BEGIN` / `APP:HELP:END` markers.
- Keep input text local to the browser. If persistence changes, update the privacy wording in the app and README.
- Prefer native browser APIs and avoid dependencies unless they materially reduce risk.

## Verification

On Windows run:

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

Also verify both generated HTML files directly with the network disabled, on smartphone and desktop widths, in Japanese and English.
