$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$required = @('APP_SPEC.md','README.md','README.ja.md','app.config.json','src\index.template.html','build-standalone.ps1','build-standalone.bat','.github\workflows\build-standalone.yml','.github\workflows\deploy-pages.yml')
foreach ($rel in $required) { if (-not (Test-Path -LiteralPath (Join-Path $root $rel))) { throw "Missing: $rel" } }
& (Join-Path $root 'build-standalone.ps1')
# Development verification uses Node's built-in runner; the app has no runtime dependency.
$node = Get-Command node -ErrorAction Stop
Push-Location $root
try {
  & $node.Source --test
  if ($LASTEXITCODE -ne 0) { throw 'JavaScript regression tests failed.' }
} finally {
  Pop-Location
}
Write-Host 'check-repository: OK'
