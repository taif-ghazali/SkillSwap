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

# Check globals in both
[xml]$xml1 = $origBky
[xml]$xml2 = $workBky

$globals1 = @($xml1.SelectNodes('//*[local-name()="block" and @type="global_declaration"]/field[@name="NAME"]') | ForEach-Object { $_.InnerText })
$globals2 = @($xml2.SelectNodes('//*[local-name()="block" and @type="global_declaration"]/field[@name="NAME"]') | ForEach-Object { $_.InnerText })

Write-Output "Orig globals: $($globals1 -join ', ')"
Write-Output "Work globals: $($globals2 -join ', ')"

$apiUrl1 = $xml1.SelectSingleNode('//*[local-name()="block" and @type="global_declaration" and field[@name="NAME" and text()="apiUrl"]]//field[@name="TEXT"]')
$apiUrl2 = $xml2.SelectSingleNode('//*[local-name()="block" and @type="global_declaration" and field[@name="NAME" and text()="apiUrl"]]//field[@name="TEXT"]')

Write-Output "Orig apiUrl: '$($apiUrl1.InnerText)'"
Write-Output "Work apiUrl: '$($apiUrl2.InnerText)'"
`;

const out = execSync('powershell -NoProfile -Command -', { input: script, encoding: 'utf8' });
console.log(out);

