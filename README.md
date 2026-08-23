# Text Inspector

[![GitHub Pages](https://github.com/ttomohisa/htmlapps-text-inspector/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/ttomohisa/htmlapps-text-inspector/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Single HTML](https://img.shields.io/badge/distribution-single%20HTML-0ea5e9)](https://ttomohisa.github.io/htmlapps-text-inspector/)

[日本語版 README](README.ja.md)

A privacy-focused, single-HTML writing inspector that goes beyond character counting to reveal structure, frequent words, long sentences, and lightweight writing signals entirely in your browser.

## 🚀 Live demo

### [Open Text Inspector on GitHub Pages](https://ttomohisa.github.io/htmlapps-text-inspector/)

GitHub Pages delivers the initial HTML. After it loads, counting, composition analysis, frequent-word extraction, X-Ray visualization, and writing checks are processed locally on your device. The text you enter is not uploaded by the app.

[![Text Inspector screenshot](assets/screenshot.png)](https://ttomohisa.github.io/htmlapps-text-inspector/)

Smartphone view: [screenshot-mobile.png](assets/screenshot-mobile.png)

## Features

- **Count what matters at a glance** — Characters, characters without spaces, words, sentences, paragraphs, lines, reading time, read-aloud time, and manuscript-paper equivalents update as you type.
- **See the shape of your writing** — Compare Kanji, Hiragana, Katakana, Latin letters & digits, and other characters with a simple composition view.
- **Find repeated language quickly** — Frequent-word ranking highlights occurrences in X-Ray so you can see where a word is being overused.
- **Jump straight to suspicious passages** — Long sentences, repeated words, consecutive spaces, and repeated punctuation link directly to the matching X-Ray location.
- **Write toward a character target** — Choose a preset or custom target and keep the remaining / exceeded count visible, including in the smartphone mini meter.
- **Edit without fear** — Sample and Clear require confirmation, while Undo / Redo works from buttons, keyboard shortcuts, and the mobile bottom bar.
- **Private single-HTML operation** — No runtime third-party library or CDN is required, and the generated app works as one self-contained HTML file.

## Quick start

### Use the web demo

Just [open the demo](https://ttomohisa.github.io/htmlapps-text-inspector/). No installation or account is required.

### Use the downloaded file

1. Download [`dist/index.html`](dist/index.html).
2. Open it in a current Chromium-based browser, Firefox, or Safari.
3. Type or paste the text you want to inspect.

After you have the HTML file, no local web server or internet connection is required.

### Use the smaller self-extracting build

`dist/index.self-extract.html` contains the same app as a gzip self-extracting single HTML variant. It can be opened directly in a modern browser with `DecompressionStream` support.

## Usage

1. Enter or paste the text you want to inspect.
2. Character, word, sentence, paragraph, line, and time estimates update in real time.
3. Use **Composition** to see the balance of Japanese scripts, Latin characters, digits, and symbols.
4. Open **Frequent words** and select a word to switch to **X-Ray** with every occurrence highlighted.
5. Open **Writing checks** to find long sentences, repeated words, consecutive spaces, and repeated punctuation. Select an actionable check to jump to its first matching location.
6. Set a character target such as 140, 400, 800, or a custom value to see the remaining or exceeded count.
7. Select part of the editor text when you only want counts for that range.

### Smartphone controls

On narrow screens, a fixed bottom bar keeps the most useful information and actions within reach:

- Current character count and target progress
- Jump to **Input**
- Jump to **Analysis**
- **Undo**
- **Redo**

Tapping the mini meter returns to the main summary.

### Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl` / `⌘` + `Z` | Undo |
| `Ctrl` / `⌘` + `Shift` + `Z` | Redo |
| `Ctrl` + `Y` | Redo on Windows |
| `Esc` | Close an open dialog |

## Analysis details

### Counts and estimates

Text Inspector calculates Unicode-aware character counts and approximate word / sentence statistics in the browser. Reading time, read-aloud time, and manuscript-paper equivalents are estimates intended for quick writing feedback rather than formal linguistic measurement.

### Frequent words and X-Ray

Frequent-word analysis prefers the browser-native `Intl.Segmenter` where available. Selecting a frequent word opens X-Ray and highlights its occurrences. X-Ray also visualizes long sentences and locations selected from Writing checks.

### Writing checks

The app intentionally keeps checks lightweight and explainable. It currently looks for:

- Sentences longer than 80 characters
- Immediately repeated words
- Consecutive spaces
- Repeated punctuation / symbols
- A simple Japanese polite-style (`です・ます`) / plain-style (`だ・である`) tendency

These are hints for review, not grammar corrections or AI-generated rewrites.

## Publish with GitHub Pages

The repository includes workflows that build and verify the standalone app and deploy it to GitHub Pages automatically.

1. Push the repository to GitHub as `htmlapps-text-inspector`.
2. Open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
3. Push to `main`, or manually run **Deploy standalone app to GitHub Pages** from the Actions tab.
4. After a successful deployment, the demo is available at `https://ttomohisa.github.io/htmlapps-text-inspector/`.

On pushes to `main`, `.github/workflows/deploy-pages.yml` runs `scripts/check-repository.ps1` before publishing `dist/`. On pull requests, `.github/workflows/build-standalone.yml` runs the same build and verification and stores the generated HTML as an Actions artifact.

If Pages has not been enabled yet, the deployment workflow still completes the build, skips deployment, and writes the one-time setup instructions to the workflow summary.

## Privacy and runtime network protection

The entered text is analyzed entirely in the browser.

- No text is uploaded by the app.
- No account, analytics, telemetry, or server-side storage is used.
- Runtime Content Security Policy includes `connect-src 'none'`.
- The current text is saved to `localStorage` so it can be restored after a reload.
- Clearing browser site data can remove the locally saved text.

The GitHub Pages version requires the initial HTML request, but entered text is not transmitted by the app. For use with the network completely disconnected, open `dist/index.html` locally.

## Offline / single HTML distribution

Text Inspector has no runtime third-party dependency. The build produces two self-contained release files:

| File | Purpose |
| --- | --- |
| `dist/index.html` | Readable standalone build |
| `dist/index.self-extract.html` | Smaller gzip self-extracting standalone build |

Both can be opened directly without a local web server.

## Development and build layout

```text
.
├─ .github/workflows/
│  ├─ build-standalone.yml       # PR / manual standalone validation
│  └─ deploy-pages.yml           # Automatic GitHub Pages deployment from main
├─ src/index.template.html       # Application source template
├─ app.config.json               # App metadata and size budgets
├─ dependencies.json             # Embedded dependency declaration (none currently)
├─ build-standalone.bat          # Windows build entry point
├─ build-standalone.ps1          # Standalone HTML builder
├─ assets/
│  ├─ screenshot.png             # Desktop README screenshot
│  └─ screenshot-mobile.png      # Smartphone screenshot
├─ dist/
│  ├─ index.html                 # Readable release artifact
│  ├─ index.self-extract.html    # Gzip self-extracting artifact
│  ├─ build-size-report.json     # Generated size report
│  └─ .nojekyll                  # GitHub Pages marker
└─ scripts/                      # Build / standalone verification scripts
```

### Build on Windows

Double-click `build-standalone.bat`, or run it from a terminal.

The build generates the release files under `dist/` and verifies the standalone output and self-extract restoration. No runtime package download is required because Text Inspector currently uses only browser-native APIs.

### Repository verification

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

This command rebuilds and verifies the standalone artifacts. GitHub Actions uses the same entry point.

## Supported browsers and devices

Current desktop and mobile versions of Chromium-based browsers, Firefox, and Safari are the primary targets. The interface is designed for both desktop and smartphone layouts, including safe-area-aware fixed controls on mobile.

## Limitations

- Word segmentation is approximate and can differ between browsers or languages.
- Reading time, read-aloud time, and manuscript-paper equivalents are estimates.
- The long-sentence threshold is a mechanical 80-character rule.
- The polite / plain Japanese style signal is heuristic and does not perform full grammatical analysis.
- No morphological-analysis dictionary or AI model is bundled.
- Autosaved text lives in browser `localStorage`; clearing site data removes it.

## Dependencies

Text Inspector currently has **no runtime third-party dependencies**. Analysis and UI behavior are implemented with browser-native JavaScript APIs.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for dependency notices.

## Contributing

Bug reports and feature proposals are welcome through GitHub Issues. See [AGENTS.md](AGENTS.md) and [APP_SPEC.md](APP_SPEC.md) before making implementation changes.

## License

Copyright © 2026 ttomohisa

Licensed under the [MIT License](LICENSE).
