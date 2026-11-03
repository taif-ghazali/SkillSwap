import fs from 'node:fs';
import { execSync } from 'node:child_process';

const script = `
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-Txt($zipPath, $pattern) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    $e = $zip.Entries | Where-Object { $_.FullName -like $pattern }
    $s = $e.Open()
    $r = New-Object System.IO.StreamReader($s)
    $txt = $r.ReadToEnd()
    $zip.Dispose()
    return $txt
}

$origBky = Get-Txt 'SkillSwap_MiniProject_Team.aia' '*.bky'
$revBky = Get-Txt 'output/android/SkillSwap_MiniProject_Team_Reviewed.aia' '*.bky'

Write-Output "=== BKY Namespaces & Prefixes ==="
Write-Output "Orig html: count: $([regex]::Matches($origBky, 'html:').Count)"
Write-Output "Rev  html: count: $([regex]::Matches($revBky, 'html:').Count)"
Write-Output "Orig mutation count: $([regex]::Matches($origBky, '<mutation').Count)"
Write-Output "Rev  mutation count: $([regex]::Matches($revBky, '<html:mutation|<mutation').Count)"
Write-Output "Rev  <html:mutation count: $([regex]::Matches($revBky, '<html:mutation').Count)"
Write-Output "Rev  <html:arg count: $([regex]::Matches($revBky, '<html:arg').Count)"

Write-Output "=== Package Name in project.properties ==="
$origProp = Get-Txt 'SkillSwap_MiniProject_Team.aia' 'youngandroidproject/project.properties'
$revProp = Get-Txt 'output/android/SkillSwap_MiniProject_Team_Reviewed.aia' 'youngandroidproject/project.properties'

Write-Output "Orig main: $(($origProp -split '\r?\n' | Where-Object { $_ -like 'main=*' }))"
Write-Output "Rev  main: $(($revProp -split '\r?\n' | Where-Object { $_ -like 'main=*' }))"

Write-Output "=== Path of .bky and .scm ==="
$zip1 = [System.IO.Compression.ZipFile]::OpenRead('SkillSwap_MiniProject_Team.aia')
Write-Output "Orig BKY path: $(($zip1.Entries | Where-Object { $_.FullName -like '*.bky' }).FullName)"
Write-Output "Orig SCM path: $(($zip1.Entries | Where-Object { $_.FullName -like '*.scm' }).FullName)"
$zip1.Dispose()

$zip2 = [System.IO.Compression.ZipFile]::OpenRead('output/android/SkillSwap_MiniProject_Team_Reviewed.aia')
Write-Output "Rev  BKY path: $(($zip2.Entries | Where-Object { $_.FullName -like '*.bky' }).FullName)"
Write-Output "Rev  SCM path: $(($zip2.Entries | Where-Object { $_.FullName -like '*.scm' }).FullName)"
$zip2.Dispose()
`;

const out = execSync('powershell -NoProfile -Command -', { input: script, encoding: 'utf8' });
console.log(out);

