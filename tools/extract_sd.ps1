Add-Type -AssemblyName System.IO.Compression.FileSystem

$sdPath = "C:\Users\Taif Al Ghazali\.gemini\antigravity\brain\3ab9bfe5-678f-4a01-84e5-751ddf8da42c\.user_uploaded\media_1793722415080_2808c652.aia"
$outDir = "D:\Skill_dev\Project\work\extracted_sd"

if (Test-Path $outDir) { Remove-Item -Recurse -Force $outDir }
[System.IO.Compression.ZipFile]::ExtractToDirectory($sdPath, $outDir)

Write-Output "Extracted entries:"
Get-ChildItem -Path $outDir -Recurse | Select-Object FullName, Length | Format-Table -AutoSize
