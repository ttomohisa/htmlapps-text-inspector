param(
  [Parameter(Mandatory=$true)][string]$InputPath,
  [Parameter(Mandatory=$true)][string]$OutputPath
)
$ErrorActionPreference = 'Stop'
$bytes = [System.IO.File]::ReadAllBytes($InputPath)
$memory = New-Object System.IO.MemoryStream
$gzip = New-Object System.IO.Compression.GZipStream($memory, [System.IO.Compression.CompressionMode]::Compress, $true)
$gzip.Write($bytes, 0, $bytes.Length)
$gzip.Dispose()
$compressed = $memory.ToArray()
$memory.Dispose()
$b64 = [Convert]::ToBase64String($compressed)
$loader = @'
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Text Inspector</title></head><body><noscript>JavaScript is required.</noscript><script>"use strict";(async()=>{try{if(typeof DecompressionStream!=="function")throw new Error("DecompressionStream is not supported by this browser.");const b=atob("__PAYLOAD__"),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);const s=new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"));const h=await new Response(s).text();document.open();document.write(h);document.close()}catch(e){document.body.textContent="Unable to open Text Inspector: "+e.message}})();</script></body></html>
'@
$loader = $loader.Replace('__PAYLOAD__', $b64)
if (($loader.ToCharArray() | Where-Object { [int]$_ -gt 127 }).Count -gt 0) { throw 'Self-extract loader must be ASCII-only.' }
[System.IO.File]::WriteAllText($OutputPath, $loader, (New-Object System.Text.UTF8Encoding($false)))
