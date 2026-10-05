$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$configPath = Join-Path $root 'app.config.json'
$sourcePath = Join-Path $root 'src\index.template.html'
$distDir = Join-Path $root 'dist'
$outPath = Join-Path $distDir 'index.html'

$config = Get-Content -LiteralPath $configPath -Raw -Encoding UTF8 | ConvertFrom-Json
$html = Get-Content -LiteralPath $sourcePath -Raw -Encoding UTF8
$timestamp = [DateTime]::UtcNow.ToString('yyyy-MM-dd HH:mm UTC')
$html = $html.Replace('{{VERSION}}', [string]$config.version).Replace('{{BUILD_TIMESTAMP}}', $timestamp)

if ($html.Contains('{{VERSION}}') -or $html.Contains('{{BUILD_TIMESTAMP}}')) {
  throw 'Unresolved build placeholder remains.'
}

New-Item -ItemType Directory -Force -Path $distDir | Out-Null
[System.IO.File]::WriteAllText((Join-Path $distDir '.nojekyll'), '', (New-Object System.Text.UTF8Encoding($false)))
[System.IO.File]::WriteAllText($outPath, $html, (New-Object System.Text.UTF8Encoding($false)))
[System.IO.File]::WriteAllText((Join-Path $root 'text-inspector.html'), $html, (New-Object System.Text.UTF8Encoding($false)))

& (Join-Path $root 'scripts\build-self-extract.ps1') -InputPath $outPath -OutputPath (Join-Path $distDir 'index.self-extract.html')
& (Join-Path $root 'scripts\verify-standalone.ps1') -HtmlPath $outPath
& (Join-Path $root 'scripts\verify-self-extract.ps1') -ReadablePath $outPath -SelfExtractPath (Join-Path $distDir 'index.self-extract.html')

$readableBytes = (Get-Item -LiteralPath $outPath).Length
$selfBytes = (Get-Item -LiteralPath (Join-Path $distDir 'index.self-extract.html')).Length
$report = [ordered]@{
  generatedAt = $timestamp
  version = [string]$config.version
  readableBytes = $readableBytes
  selfExtractBytes = $selfBytes
}
$report | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $distDir 'build-size-report.json') -Encoding UTF8

Write-Host ('Readable:     {0:N0} bytes' -f $readableBytes)
Write-Host ('Self-extract: {0:N0} bytes' -f $selfBytes)
