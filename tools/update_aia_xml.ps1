Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = $PSScriptRoot | Split-Path -Parent
$targetAia = Join-Path $root 'output\android\SkillSwap_MiniProject_Team_Reviewed.aia'

# 1. Get live endpoint and key
$endpointJson = Get-Content (Join-Path $root '.live-endpoint.local') -Raw | ConvertFrom-Json
$endpoint = $endpointJson.endpoint
$codeGs = Get-Content (Join-Path $root 'backend\Code.gs') -Raw
$keyMatch = [regex]::Match($codeGs, "const KEY = '([^']+)';")
$key = $keyMatch.Groups[1].Value

# 2. Extract backup into temp in Project dir to avoid short path issues
$backupAia = Join-Path $root 'output\android\SkillSwap_MiniProject_Team_Reviewed.backup.aia'
$tempDir = Join-Path $root 'temp_aia_patch'
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
[System.IO.Compression.ZipFile]::ExtractToDirectory($backupAia, $tempDir)
$resolvedTemp = (Resolve-Path $tempDir).Path

# 3. Patch Screen1.bky using XML DOM
$bkyFile = Get-ChildItem -Path $tempDir -Recurse -Filter 'Screen1.bky' | Select-Object -First 1
[xml]$xml = Get-Content $bkyFile.FullName -Raw

$nsmgr = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$nsmgr.AddNamespace("b", "https://developers.google.com/blockly/xml")

$apiUrlField = $xml.SelectSingleNode("//b:block[@type='global_declaration' and b:field[@name='NAME' and text()='apiUrl']]//b:block[@type='text']/b:field[@name='TEXT']", $nsmgr)
if ($apiUrlField -ne $null) {
    $apiUrlField.InnerText = $endpoint
    Write-Output "apiUrl field set to: $($apiUrlField.InnerText)"
} else {
    Write-Error "Could not find apiUrl field!"
}

$apiKeyField = $xml.SelectSingleNode("//b:block[@type='global_declaration' and b:field[@name='NAME' and text()='apiKey']]//b:block[@type='text']/b:field[@name='TEXT']", $nsmgr)
if ($apiKeyField -ne $null) {
    $apiKeyField.InnerText = $key
    Write-Output "apiKey field set to: $($apiKeyField.InnerText)"
} else {
    Write-Error "Could not find apiKey field!"
}

$xml.Save($bkyFile.FullName)

# 4. Repack zip with forward slashes and exact relative root
if (Test-Path $targetAia) {
    Remove-Item $targetAia -Force
}

$archive = [System.IO.Compression.ZipFile]::Open($targetAia, [System.IO.Compression.ZipArchiveMode]::Create)
$files = Get-ChildItem -Path $tempDir -Recurse -File
foreach ($file in $files) {
    $full = (Resolve-Path $file.FullName).Path
    $relativePath = $full.Substring($resolvedTemp.Length).TrimStart('\', '/').Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $relativePath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
}
$archive.Dispose()
Remove-Item -Path $tempDir -Recurse -Force

Write-Output "Successfully updated $targetAia with forward slashes in entries"
