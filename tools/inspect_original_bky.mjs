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
$origScm = Get-Txt 'SkillSwap_MiniProject_Team.aia' '*.scm'

Write-Output "=== Original SCM Details ==="
$json1 = $origScm.Substring($origScm.IndexOf('$JSON') + 6)
$json1 = $json1.Substring(0, $json1.LastIndexOf('|#'))
$scm1 = $json1 | ConvertFrom-Json
Write-Output "SCM AppName: $($scm1.Properties.AppName)"
Write-Output "Components in original SCM:"
foreach ($c in $scm1.Properties.'$Components') {
    Write-Output "  $($c.'$Name') ($($c.'$Type'))"
}

Write-Output "=== Original BKY Procedures ==="
[xml]$xml = $origBky
$procs = $xml.SelectNodes('//*[local-name()="block" and (@type="procedures_defnoreturn" or @type="procedures_defreturn")]/*[local-name()="field" and @name="NAME"]')
foreach ($p in $procs) {
    Write-Output "  Procedure: $($p.InnerText)"
}

Write-Output "=== Original BKY Events ==="
$events = $xml.SelectNodes('//*[local-name()="block" and @type="component_event"]/*[local-name()="mutation"]')
foreach ($ev in $events) {
    Write-Output "  Event: $($ev.instance_name).$($ev.event_name)"
}
`;

const out = execSync('powershell -NoProfile -Command -', { input: script, encoding: 'utf8' });
console.log(out);

