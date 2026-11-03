import fs from 'node:fs';
import { execSync } from 'node:child_process';

const script = `
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead('SkillSwap_MiniProject_Team.aia')
foreach ($e in $zip.Entries) {
    Write-Output "Entry: $($e.FullName) size: $($e.Length)"
}

$bky = ($zip.Entries | Where-Object { $_.FullName -like '*.bky' })
$s = $bky.Open()
$r = New-Object System.IO.StreamReader($s)
$bkyTxt = $r.ReadToEnd()

# Check apiUrl and apiKey in original
[xml]$xml = $bkyTxt
$apiUrl = $xml.SelectSingleNode('//*[local-name()="block" and @type="global_declaration" and *[local-name()="field" and text()="apiUrl"]]//*[local-name()="field" and @name="TEXT"]')
$apiKey = $xml.SelectSingleNode('//*[local-name()="block" and @type="global_declaration" and *[local-name()="field" and text()="apiKey"]]//*[local-name()="field" and @name="TEXT"]')
Write-Output "Original apiUrl: '$($apiUrl.InnerText)'"
Write-Output "Original apiKey: '$($apiKey.InnerText)'"

$zip.Dispose()
`;

const out = execSync('powershell -NoProfile -Command -', { input: script, encoding: 'utf8' });
console.log(out);

