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

$len = [Math]::Min($origBky.Length, $workBky.Length)
for ($i = 0; $i -lt $len; $i++) {
    if ($origBky[$i] -ne $workBky[$i]) {
        Write-Output "Diverge at char index $i"
        Write-Output "Orig context: $($origBky.Substring([Math]::Max(0, $i - 20), [Math]::Min(80, $origBky.Length - $i)))"
        Write-Output "Work context: $($workBky.Substring([Math]::Max(0, $i - 20), [Math]::Min(80, $workBky.Length - $i)))"
        break
    }
}
`;

const out = execSync('powershell -NoProfile -Command -', { input: script, encoding: 'utf8' });
console.log(out);

