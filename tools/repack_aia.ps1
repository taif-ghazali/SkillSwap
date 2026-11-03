param(
    [string]$tempDir,
    [string]$targetAia
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path $targetAia) {
    Remove-Item $targetAia -Force
}

$archive = [System.IO.Compression.ZipFile]::Open($targetAia, [System.IO.Compression.ZipArchiveMode]::Create)
$resolvedTemp = (Resolve-Path $tempDir).Path
$files = Get-ChildItem -Path $tempDir -Recurse -File
foreach ($file in $files) {
    $full = (Resolve-Path $file.FullName).Path
    $rel = $full.Substring($resolvedTemp.Length).TrimStart('\', '/').Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
}
$archive.Dispose()
Write-Output "Successfully repacked $targetAia ($((Get-Item $targetAia).Length) bytes)"

