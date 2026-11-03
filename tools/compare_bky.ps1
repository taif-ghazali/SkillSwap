Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-BkyContent($zipPath) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    $bky = $zip.Entries | Where-Object { $_.FullName -like '*.bky' }
    $s = $bky.Open()
    $r = New-Object System.IO.StreamReader($s)
    $txt = $r.ReadToEnd()
    $zip.Dispose()
    return $txt
}

$orig = Get-BkyContent('SkillSwap_MiniProject_Team.aia')
$backup = Get-BkyContent('output/android/SkillSwap_MiniProject_Team_Reviewed.backup.aia')
$reviewed = Get-BkyContent('output/android/SkillSwap_MiniProject_Team_Reviewed.aia')

Write-Output "Orig length: $($orig.Length)"
Write-Output "Backup length: $($backup.Length)"
Write-Output "Reviewed length: $($reviewed.Length)"

# Check first 500 chars of each
Write-Output "--- Orig start ---"
Write-Output $orig.Substring(0, [Math]::Min(300, $orig.Length))
Write-Output "--- Backup start ---"
Write-Output $backup.Substring(0, [Math]::Min(300, $backup.Length))
Write-Output "--- Reviewed start ---"
Write-Output $reviewed.Substring(0, [Math]::Min(300, $reviewed.Length))

