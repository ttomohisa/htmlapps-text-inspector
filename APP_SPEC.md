# APP_SPEC.md

## 1. Product identity

- **Name:** Text Inspector
- **Purpose:** Count text and reveal lightweight structural signals that help users review writing.
- **Primary users:** People drafting Japanese or English text on desktop or smartphone.
- **Release artifacts:** `dist/index.html`, its identical root download `text-inspector.html`, and `dist/index.self-extract.html`.

## 2. Core user flow

1. Open the page locally or on GitHub Pages.
2. Type or paste text.
3. See character, word, sentence, paragraph, reading-time, and speech-time metrics update immediately.
4. Inspect character composition and frequent words.
5. Select a frequent word to highlight it in Text X-Ray; long sentences over 80 characters are underlined.
6. Review lightweight writing checks. Actionable findings jump directly to the first matching X-Ray occurrence and emphasize it.
7. Optionally set a target character count and inspect a selected range. On smartphones, the template-style fixed bottom bar keeps a compact character meter visible and provides persistent Input / Analysis navigation plus Undo / Redo.

## 3. Functional requirements

- Unicode-aware character count.
- Word segmentation via `Intl.Segmenter` when available, with regex fallback.
- Sentence segmentation via `Intl.Segmenter` when available, with regex fallback.
- Character mix: Kanji, Hiragana, Katakana, Latin/digits, symbols/other.
- Frequent-word ranking with a small built-in stop-word list.
- Text X-Ray for long sentences and a selected frequent word.
- Lightweight checks for long sentences, repeated adjacent words, repeated spaces, and repeated punctuation.
- Actionable writing-check cards for long sentences, repeated words, repeated spaces, and repeated punctuation; activating one opens X-Ray, highlights the matching range, and scrolls it into view.
- Invisible-character checks for ZWSP (U+200B), NBSP (U+00A0), narrow NBSP (U+202F), word joiner (U+2060), and BOM / zero-width no-break space (U+FEFF), grouped by type, Unicode code point, and count. Whitespace-only inputs are checked too.
- Each invisible-character check jumps to its first occurrence with a readable X-Ray marker. Previous / Next traverse the selected type in original UTF-16 order with a current / total position and disabled end buttons (no wrap); original input, autosave, and Copy are unchanged. ZWJ / ZWNJ are excluded because they are used in emoji and writing systems. Explain that the detected characters can also be intentional.
- Invisible navigation is transient and resets immediately on input edits, confirmed Sample/Clear, Undo/Redo, or selecting a frequent word or another kind of check. Changing language preserves its type and position; choosing another invisible check starts at its first occurrence. Cancelled replacement leaves navigation unchanged.
- Inspection actions must match the current editor text. Activating an outdated check or frequency item during the analysis debounce refreshes the view without applying obsolete offsets or rendering old text.
- Lightweight Japanese style signal for `です・ます` / `だ・である` endings.
- Optional target character count presets plus custom target.
- Selected-range character and word count.
- Smartphone-only fixed bottom bar adapted from the template component. Its compact meter shows current character count, target remaining/over state, and target progress (or word count with no target); tapping the meter opens the full summary. The action row provides Input / Analysis navigation plus Undo / Redo.
- Copy and Sample/Clear actions. Sample and Clear require an in-app confirmation dialog before replacement.
- Persistent Undo / Redo controls with a bounded text-history (up to 50 snapshots and approximately 4 million UTF-16 code units), plus Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, and Ctrl+Y shortcuts.
- Clear/Sample completion also exposes Undo in the status toast.
- Japanese/English UI in the same HTML.
- Light-only interface; no dark-mode switch.
- Input autosave and UI setting persistence in localStorage.

## 4. Data and privacy

- No runtime network request.
- No analytics, telemetry, login, or server-side storage.
- Text remains in browser memory and localStorage on the device.
- No third-party runtime dependencies.

## 5. Performance

- Main counts target smooth interaction around 100,000 characters on typical current browsers.
- For input above 200,000 UTF-16 code units, expensive frequency/X-Ray/check analysis is limited to the first 200,000 while headline counts continue to use the full text.
- Invisible-character counts cover that same analyzed prefix. Store and render at most 1,000 invisible-character markers; reserve a marker for a selected occurrence beyond that cap and show the display limit visibly. Counts are not capped at 1,000.
- Keystroke analysis is debounced briefly. Occurrence navigation searches the analyzed prefix on demand and does not store another unbounded occurrence array.

## 6. Limitations

- Japanese word segmentation is browser-provided and is not full dictionary-backed morphological analysis.
- Reading and speech times are estimates.
- Writing checks are mechanical hints, not writing-quality judgments.
- Japanese style classification intentionally uses only explicit sentence-ending patterns.

## 7. Browser target

Current stable Chromium, Firefox, and Safari on desktop and mobile. Direct `file://` opening of the readable release is required.

## 8. Acceptance criteria

- No external script, stylesheet, font, API, or network dependency.
- CSP includes `connect-src 'none'`.
- Japanese and English both fit at narrow smartphone width.
- Clear and Sample require confirmation and provide Undo after execution.
- Undo / Redo buttons enable only when their respective history direction is available, and keyboard shortcuts mirror them.
- Frequency item selection opens X-Ray and highlights the chosen term.
- Actionable writing checks open X-Ray and scroll the first matching occurrence into view with an additional focus highlight.
- On smartphone widths the fixed bottom bar remains visible without covering page content or the status toast, and Undo / Redo disabled states stay synchronized with the desktop history controls.
- The analysis tab row stays in normal flow on smartphones and must not create a blank offset inside the analysis card.
- Target count reports remaining, exact, or over-target state.
- Help accurately documents privacy, limitations, and localStorage risk.
- Smartphone Help starts near the top with safe-area-aware margins within the dynamic viewport. Only its body scrolls; the title and Close button remain visible, and each open starts at the first instructions.
- Invisible-character jumps work with mouse, Enter, and Space and move keyboard focus into X-Ray. Markers can overlap existing sentence/word highlights without treating source text as HTML.
- Previous / Next are native buttons with Japanese/English accessible names and a polite position status. Navigation preserves original Copy, selection, history and storage.
- Regression tests cover full-app input debounce, stale check/frequency actions, occurrence endpoints/type changes, language/history transitions, Unicode offsets, whitespace-only inputs, marker/analysis limits, safe rendering, unchanged copy, cancellation and history. Repository verification runs them with Node.js 20 or later after rebuilding the releases.

- Brand icon backgrounds use #16624f and a corner radius of exactly 25% of each background axis; the asset, embedded favicon, and responsive header remain consistent.
- The header embeds the complete canonical `assets/favicon.svg` artwork and scales it uniformly. The local-processing badge uses the shared shield/check artwork from PDF Fill & Sign.
