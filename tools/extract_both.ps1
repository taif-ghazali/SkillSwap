Add-Type -AssemblyName System.IO.Compression.FileSystem

$origPath = "D:\Skill_dev\Project\SkillSwap_MiniProject_Team.aia"
$revPath = "D:\Skill_dev\Project\output\android\SkillSwap_MiniProject_Team_Reviewed.aia"

$origDir = "D:\Skill_dev\Project\work\extracted_orig"
$revDir = "D:\Skill_dev\Project\work\extracted_rev"

if (Test-Path $origDir) { Remove-Item -Recurse -Force $origDir }
if (Test-Path $revDir) { Remove-Item -Recurse -Force $revDir }

[System.IO.Compression.ZipFile]::ExtractToDirectory($origPath, $origDir)
[System.IO.Compression.ZipFile]::ExtractToDirectory($revPath, $revDir)

Write-Output "Extraction complete."

