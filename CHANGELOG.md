# Changelog

## 1.0.2 - 2026-10-09

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
