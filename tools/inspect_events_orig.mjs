import fs from 'node:fs';
import { execSync } from 'node:child_process';

const script = `
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead('SkillSwap_MiniProject_Team.aia')
$bky = ($zip.Entries | Where-Object { $_.FullName -like '*.bky' })
$s = $bky.Open()
$r = New-Object System.IO.StreamReader($s)
$txt = $r.ReadToEnd()
$zip.Dispose()

[xml]$xml = $txt
$events = $xml.SelectNodes('//*[local-name()="block" and @type="component_event"]')
Write-Output "Found $($events.Count) component_event blocks"
foreach ($ev in $events) {
    Write-Output "--- Event ---"
    Write-Output $ev.OuterXml.Substring(0, [Math]::Min(250, $ev.OuterXml.Length))
}
`;

const out = execSync('powershell -NoProfile -Command -', { input: script, encoding: 'utf8' });
console.log(out);

