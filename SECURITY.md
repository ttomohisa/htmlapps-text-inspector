# Security and privacy

Text Inspector is designed as a local-only browser utility.

- Runtime CSP uses `connect-src 'none'`.
- No analytics, telemetry, account, API, CDN, remote font, or external runtime dependency is used.
- Input text is processed in browser memory and may be persisted in localStorage for recovery.
- Clearing browser site data removes the saved text.
- Clipboard write occurs only after the user presses Copy.

Do not treat localStorage as a secure archive for sensitive or irreplaceable writing.
