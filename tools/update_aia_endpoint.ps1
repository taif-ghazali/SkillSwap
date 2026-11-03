Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = $PSScriptRoot | Split-Path -Parent
$targetAia = Join-Path $root 'output\android\SkillSwap_MiniProject_Team_Reviewed.aia'
$backupAia = Join-Path $root 'output\android\SkillSwap_MiniProject_Team_Reviewed.backup.aia'

# 1. Ensure backup
if (-not (Test-Path $backupAia)) {
    Copy-Item $targetAia $backupAia
    Write-Output "Created backup at $backupAia"
}

# 2. Get live endpoint and key
$endpointJson = Get-Content (Join-Path $root '.live-endpoint.local') -Raw | ConvertFrom-Json
$endpoint = $endpointJson.endpoint
$codeGs = Get-Content (Join-Path $root 'backend\Code.gs') -Raw
$keyMatch = [regex]::Match($codeGs, "const KEY = '([^']+)';")
$key = $keyMatch.Groups[1].Value

Write-Output "Configuring AIA with:"
Write-Output "  apiUrl: $endpoint"
Write-Output "  apiKey: $key"

# 3. Read target AIA into temp directory
$tempDir = Join-Path $env:TEMP ("aia_patch_" + [Guid]::NewGuid().ToString('N'))
[System.IO.Compression.ZipFile]::ExtractToDirectory($targetAia, $tempDir)

# 4. Patch Screen1.bky
$bkyFile = Get-ChildItem -Path $tempDir -Recurse -Filter 'Screen1.bky' | Select-Object -First 1
$content = Get-Content $bkyFile.FullName -Raw

# Replace apiUrl text block
# Pattern: <block type="global_declaration"[^>]*><field name="NAME">apiUrl</field>.*?<value name="VALUE"><block type="text"[^>]*><field name="TEXT">.*?</field></block></value>
$patchedContent = [regex]::Replace($content, 
    '(<block type="global_declaration"[^>]*><field name="NAME">apiUrl</field>[\s\S]*?<value name="VALUE"><block type="text"[^>]*><field name="TEXT">)(.*?)(</field></block></value>)',
    "`$1$endpoint`$3")

# Replace apiKey text block
$patchedContent = [regex]::Replace($patchedContent,
    '(<block type="global_declaration"[^>]*><field name="NAME">apiKey</field>[\s\S]*?<value name="VALUE"><block type="text"[^>]*><field name="TEXT">)(.*?)(</field></block></value>)',
    "`$1$key`$3")

Set-Content -Path $bkyFile.FullName -Value $patchedContent -NoNewline

# 5. Repack zip
if (Test-Path $targetAia) {
    Remove-Item $targetAia -Force
}
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $targetAia, [System.IO.Compression.CompressionLevel]::Optimal, $false)

# Clean up temp
Remove-Item -Path $tempDir -Recurse -Force

Write-Output "Successfully updated $targetAia"

