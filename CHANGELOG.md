# Changelog

## 1.0.4 - 2026-10-10

- Localized the remaining editor, target-count, analysis-region/tab-list and toast-dismiss accessible labels in Japanese and English.
- Added local UTF-8 `.txt` downloads of the full current input, including empty text, without adding a BOM/newline or altering invisible characters. Download cleanup and failure feedback are covered by regression tests.

- Positioned smartphone Help near the top with safe-area-aware visible margins and dynamic viewport bounds, keeping its title and Close button outside the scrolling body.
- Reset Help to the first instructions on every open, including after reading to the end and changing language.
- Reused the complete canonical `assets/favicon.svg` artwork in the responsive header; the embedded favicon already matched the asset.
- Replaced the local-processing lock with the shield/check artwork used by PDF Fill & Sign.
- Added help lifecycle, icon-parity and native-browser viewport regressions, and rebuilt both one-file releases and the root download.

## 1.0.3 - 2026-10-09

- Normalized the app icon, embedded favicon, and responsive header background corners to exactly 25%, preserving the artwork and canonical #16624f color.
- Added brand-asset and runtime parity regression checks.

## 1.0.2 - 2026-10-09

- Added a genuine English screenshot from the v1.0.2 PR preview using the built-in sample.
- Added explicit standalone-output and existing network-blocking metadata for catalog health checks.
- Kept application behavior, entrypoints, and network permissions unchanged.

## 1.0.1 - 2026-10-06

- Standardized the Japanese privacy badge to `完全ローカル処理`, retaining the accurate English wording.
- Added meaningful language-target accessible names and tooltips for the existing `EN` / `JA` header control.
- Updated the canonical patch version once and added repeated header-language regression coverage.

- Added Previous / Next navigation for each invisible-character type, with bilingual controls, current / total position, disabled endpoints, and on-demand searching within the existing analysis limit. Navigation is transient and leaves original text, Copy, history and storage unchanged.
- Fixed stale writing-check offsets and stale frequent-word previews when activated during the input debounce. An obsolete action now refreshes the current analysis without applying its old result.
- Guarded deferred marker focus after edits and synchronized the root HTML download with the official readable build.
- Added full-app event/debounce regression coverage and source/readable/self-extract parity checks. Browser keyboard, selection and visual validation remain a separate manual/browser check.

- Added five invisible-character checks with Unicode names, counts, and keyboard-accessible X-Ray jumps.
- Added readable X-Ray-only markers, with a 1,000-marker display cap and full counts within the existing first-200,000-UTF-16-unit analysis limit. Original text and Copy stay unchanged; ZWJ / ZWNJ remain excluded.
- Added bilingual explanations, regression tests, and exact self-extract restoration verification.

## 1.0.0 - 2026-08-23

- Initial public release of Text Inspector.
- Added real-time character, word, sentence, paragraph, line, reading-time, and read-aloud metrics.
- Added character composition, frequent-word ranking, Text X-Ray, long-sentence visualization, and lightweight writing checks.
- Added direct jumps from actionable writing checks to matching X-Ray occurrences.
- Added character targets, selected-range counts, local autosave, Japanese / English UI, and offline single-HTML releases.
- Added confirmation dialogs before Sample / Clear plus bounded Undo / Redo history and keyboard shortcuts.
- Added the template-style smartphone fixed bottom bar with character mini meter, Input / Analysis navigation, Undo / Redo, target progress, and safe-area spacing.
- Fixed smartphone analysis-tab spacing and aligned the mobile workflow with the shared template conventions.
