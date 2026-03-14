$scriptPath = Join-Path $PSScriptRoot "build-agent-pack.mjs"
Get-Content $scriptPath -Raw | node --input-type=module -
