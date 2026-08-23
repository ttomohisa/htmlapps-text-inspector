param(
  [Parameter(Mandatory=$true)][string]$ReadablePath,
  [Parameter(Mandatory=$true)][string]$SelfExtractPath
)
$ErrorActionPreference = 'Stop'
$self = Get-Content -LiteralPath $SelfExtractPath -Raw -Encoding UTF8
if (-not $self.Contains('DecompressionStream')) { throw 'Self-extract loader is missing DecompressionStream.' }
if (($self.ToCharArray() | Where-Object { [int]$_ -gt 127 }).Count -gt 0) { throw 'Self-extract loader is not ASCII-only.' }
if ((Get-Item -LiteralPath $ReadablePath).Length -le 0 -or (Get-Item -LiteralPath $SelfExtractPath).Length -le 0) { throw 'Generated output is empty.' }
Write-Host 'verify-self-extract: OK'
