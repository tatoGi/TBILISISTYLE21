# One-time CMS import to Neon.
# 1. Copy .env.neon.local.example to .env.neon.local
# 2. Paste POSTGRES_URL and BLOB_READ_WRITE_TOKEN from Vercel dashboard
#    (PAYLOAD_SECRET is optional - taken from .env.local if omitted)
# 3. Run:  powershell -File scripts/run-cms-import.ps1 -Dry
#         powershell -File scripts/run-cms-import.ps1 -Confirm
param(
  [switch]$Dry,
  [switch]$Confirm,
  [string]$Only = ""
)

$ErrorActionPreference = "Stop"
$bak = ".env.local.cms-import-bak"
$envLocal = ".env.local"
$moved = $false

$neonEnv = if (Test-Path ".env.neon.local") {
  ".env.neon.local"
} elseif (Test-Path ".env.neoon.local") {
  ".env.neoon.local"
} else {
  $null
}

if (-not $neonEnv) {
  Write-Error "Missing .env.neon.local - copy .env.neon.local.example and paste POSTGRES_URL + BLOB token."
}
if (-not $Dry -and -not $Confirm) {
  Write-Error "Pass -Dry to preview or -Confirm to write to production."
}

function Load-DotEnv([string]$path, [string[]]$onlyKeys = @()) {
  Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $eq = $line.IndexOf('=')
    if ($eq -lt 1) { return }
    $key = $line.Substring(0, $eq).Trim() -replace '^\uFEFF', ''
    if ($onlyKeys.Count -gt 0 -and $onlyKeys -notcontains $key) { return }
    $val = $line.Substring($eq + 1).Trim()
    if ($val.StartsWith('"') -and $val.EndsWith('"')) {
      $val = $val.Substring(1, $val.Length - 2)
    }
    if ($val -and $val -ne '...') {
      Set-Item -Path ('env:' + $key) -Value $val
    }
  }
}

function Restore-EnvLocal {
  if ($moved -and (Test-Path $bak)) {
    Move-Item -Path $bak -Destination $envLocal -Force
  }
}

function Ensure-PayloadSecret {
  if ($env:PAYLOAD_SECRET) { return }
  if (Test-Path $bak) {
    Load-DotEnv $bak @('PAYLOAD_SECRET')
  }
  if (-not $env:PAYLOAD_SECRET -and (Test-Path $envLocal)) {
    Load-DotEnv $envLocal @('PAYLOAD_SECRET')
  }
  if (-not $env:PAYLOAD_SECRET) {
    Write-Error "PAYLOAD_SECRET not found. Add it to .env.local (same value as Vercel) or to $neonEnv."
  }
}

# Never let local DATABASE_URL override Neon during import.
if (Test-Path $envLocal) {
  Move-Item -Path $envLocal -Destination $bak -Force
  $moved = $true
}

Load-DotEnv $neonEnv
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
Ensure-PayloadSecret

if (-not $env:POSTGRES_URL) {
  Restore-EnvLocal
  Write-Error "POSTGRES_URL is empty in $neonEnv"
}

# No drizzle push prompts against production; enable Blob uploads during import.
$env:PAYLOAD_PUSH = 'false'
$env:VERCEL = '1'

$onlyFlag = if ($Only) { " --only=$Only" } else { "" }

try {
  if ($Dry) {
    Invoke-Expression "npx payload run scripts/push-cms-content.ts -- import --dry$onlyFlag"
  } else {
    Invoke-Expression "npx payload run scripts/push-cms-content.ts -- import --confirm$onlyFlag"
  }
  exit $LASTEXITCODE
} finally {
  Restore-EnvLocal
}
