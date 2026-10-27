# Shared UI 1.0.0

The fixed dependency-free component is embedded by `build-standalone.ps1`; its lock records canonical hashes. There is no runtime request. Input autosave remains synchronous localStorage under its original key. A failed write keeps the draft and persistent error visible; Copy and Save text provide an escape. Only confirmed writes advance the displayed time.

Save text includes the entire unmodified UTF-8 input, including invisible characters, with an editable filename. Download started means the browser received the download request. Clear input and Sample keep the existing confirmation and bounded Undo history. Confirmation text updates while open and cancel receives initial focus; keyboard focus pauses toast expiry.

Language priority is URL, shared preference, legacy JSON settings language, browser language, English. Startup reads never migrate settings. Explicit switches write only the shared language key and preserve input, selection and history. Existing text/settings formats and analysis remain compatible.

Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/check-repository.ps1`. Native keyboard, download delivery, narrow layouts and touch hit areas still require human browser acceptance. Frequency choices, tabs and navigation retain their selection appearance; executable toolbar and history actions use shared states.
