# Architecture

Text Inspector is a dependency-free, local-first single-page application.

- `src/index.template.html`: complete editable application source.
- `build-standalone.ps1`: replaces version/build placeholders and creates the readable release.
- `scripts/build-self-extract.ps1`: gzip-compresses the readable release and embeds it once as Base64 in a tiny loader.
- `dist/index.html`: readable one-file release.
- `dist/index.self-extract.html`: smaller gzip self-extracting one-file release.

All analysis runs synchronously in the browser after a short debounce. Expensive analysis is limited to the first 200,000 code units for very large inputs, while headline counts use the full text. No runtime network access exists.
