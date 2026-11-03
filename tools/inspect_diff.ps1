Add-Type -AssemblyName System.IO.Compression.FileSystem

$origPath = "D:\Skill_dev\Project\SkillSwap_MiniProject_Team.aia"
$revPath = "D:\Skill_dev\Project\output\android\SkillSwap_MiniProject_Team_Reviewed.aia"

$orig = [System.IO.Compression.ZipFile]::OpenRead($origPath)
Write-Output "=== ORIGINAL AIA ==="
foreach ($e in $orig.Entries) {
    Write-Output ($e.FullName + " (" + $e.Length + " bytes)")
}
$orig.Dispose()

$rev = [System.IO.Compression.ZipFile]::OpenRead($revPath)
Write-Output "`n=== REVIEWED AIA ==="
foreach ($e in $rev.Entries) {
    Write-Output ($e.FullName + " (" + $e.Length + " bytes)")
}
$rev.Dispose()

