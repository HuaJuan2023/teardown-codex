$ErrorActionPreference = 'Stop'
$FrogRuntime = (Resolve-Path (Join-Path $PSScriptRoot '../../skill/teardown')).Path
Push-Location -LiteralPath $PSScriptRoot
try {
  & node (Join-Path $FrogRuntime 'sims/build.mjs') './mecha-frog-live' './mecha-frog-film'
  if ($LASTEXITCODE -ne 0) { throw 'Mechanical frog build failed' }
} finally { Pop-Location }
