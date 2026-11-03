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

$origLines = $origBky -split '\r?\n'
$workLines = $workBky -split '\r?\n'

Write-Output "Orig lines: $($origLines.Count), Work lines: $($workLines.Count)"

for ($i = 0; $i -lt [Math]::Min($origLines.Count, $workLines.Count); $i++) {
    if ($origLines[$i] -ne $workLines[$i]) {
        Write-Output "First difference at line $($i+1):"
        Write-Output "  Orig: $($origLines[$i].Substring(0, [Math]::Min(100, $origLines[$i].Length)))"
        Write-Output "  Work: $($workLines[$i].Substring(0, [Math]::Min(100, $workLines[$i].Length)))"
        break
    }
}
`;

const out = execSync('powershell -NoProfile -Command -', { input: script, encoding: 'utf8' });
console.log(out);

