Add-Type -AssemblyName System.IO.Compression.FileSystem

$bakPath = "D:\Skill_dev\Project\output\android\SkillSwap_MiniProject_Team_Reviewed.backup.aia"
$bakDir = "D:\Skill_dev\Project\work\extracted_bak"

if (Test-Path $bakDir) { Remove-Item -Recurse -Force $bakDir }
[System.IO.Compression.ZipFile]::ExtractToDirectory($bakPath, $bakDir)

$bky = Get-ChildItem -Path $bakDir -Filter "*.bky" -Recurse
Write-Output ("Backup BKY: " + $bky.FullName)
$content = Get-Content $bky.FullName -Raw
Write-Output ("Length: " + $content.Length)
Write-Output ("Contains html: " + $content.Contains("html:"))
Write-Output ("Contains xmlns: " + $content.Contains("xmlns"))

