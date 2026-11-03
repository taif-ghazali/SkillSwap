import fs from 'node:fs';
import { execSync } from 'node:child_process';

const script = `
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead('SkillSwap_MiniProject_Team.aia')
$bky = ($zip.Entries | Where-Object { $_.FullName -like '*.bky' })
$s = $bky.Open()
$r = New-Object System.IO.StreamReader($s)
$origBky = $r.ReadToEnd()
$zip.Dispose()

$workBky = Get-Content 'work/android/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.bky' -Raw

Write-Output "Orig BKY length: $($origBky.Length)"
Write-Output "Work BKY length: $($workBky.Length)"
Write-Output "Are they identical except package/user? $(if ($origBky -eq $workBky) { 'YES' } else { 'NO' })"

if ($origBky -ne $workBky) {
    # Find differences
    Write-Output "Difference length: $([Math]::Abs($origBky.Length - $workBky.Length))"
}
`;

const out = execSync('powershell -NoProfile -Command -', { input: script, encoding: 'utf8' });
console.log(out);

