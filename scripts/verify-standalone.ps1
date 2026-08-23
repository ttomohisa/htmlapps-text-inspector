param([Parameter(Mandatory=$true)][string]$HtmlPath)
$ErrorActionPreference = 'Stop'
$html = Get-Content -LiteralPath $HtmlPath -Raw -Encoding UTF8
$required = @('Text Inspector', "connect-src 'none'", 'APP:BEGIN', 'APP:END', 'APP:HELP:BEGIN', 'APP:HELP:END', 'Intl.Segmenter')
foreach ($item in $required) { if (-not $html.Contains($item)) { throw "Required content missing: $item" } }
if ($html.Contains('{{VERSION}}') -or $html.Contains('{{BUILD_TIMESTAMP}}')) { throw 'Unresolved placeholder found.' }
$externalPatterns = @('<script[^>]+src=', '<link[^>]+rel=["'']stylesheet["''][^>]+href=', '<iframe', '(?:src|href)=["'']https?://')
foreach ($pattern in $externalPatterns) {
  if ([regex]::IsMatch($html, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)) { throw "Unexpected external/runtime reference matched: $pattern" }
}
Write-Host 'verify-standalone: OK'
