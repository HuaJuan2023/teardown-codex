$ErrorActionPreference = "Stop"
# Build from this examples/ant folder using the skill packaged in this repo.
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$SkillDir = Join-Path $RepoRoot "skill\teardown"
if (-not (Test-Path (Join-Path $SkillDir "sims\build.mjs"))) {
  throw "Skill build.mjs not found at $SkillDir\sims\build.mjs"
}
Set-Location $PSScriptRoot
node (Join-Path $SkillDir "sims\build.mjs") "./ant-live"
if ($LASTEXITCODE -ne 0) { throw "Build failed" }
