# Apply pending Payload migrations to Neon. Uses .env.neon.local (POSTGRES_URL).
#
#   powershell -File scripts/run-neon-migrate.ps1

$ErrorActionPreference = "Stop"
$neonEnv = if (Test-Path ".env.neon.local") { ".env.neon.local" } elseif (Test-Path ".env.neoon.local") { ".env.neoon.local" } else { $null }
$bak = ".env.local.cms-import-bak"
$envLocal = ".env.local"
$moved = $false

if (-not $neonEnv) {
  Write-Error "Missing .env.neon.local with POSTGRES_URL."
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
    if ($val.StartsWith('"') -and $val.EndsWith('"')) { $val = $val.Substring(1, $val.Length - 2) }
    if ($val -and $val -ne '...') { Set-Item -Path ('env:' + $key) -Value $val }
  }
}

function Restore-EnvLocal {
  if ($moved -and (Test-Path $bak)) { Move-Item -Path $bak -Destination $envLocal -Force }
}

if (Test-Path $envLocal) {
  Move-Item -Path $envLocal -Destination $bak -Force
  $moved = $true
}

Load-DotEnv $neonEnv
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
if (-not $env:PAYLOAD_SECRET) {
  if (Test-Path $bak) { Load-DotEnv $bak @('PAYLOAD_SECRET') }
}
$env:PAYLOAD_PUSH = 'false'

if (-not $env:POSTGRES_URL) {
  Restore-EnvLocal
  Write-Error "POSTGRES_URL is empty in $neonEnv"
}

try {
  echo y | npx payload migrate
  exit $LASTEXITCODE
} finally {
  Restore-EnvLocal
}
