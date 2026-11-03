import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Run powershell to validate zip structure and blocks XML
const psScript = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$target = '${path.join(ROOT, 'output', 'android', 'SkillSwap_MiniProject_Team_Reviewed.aia').replace(/\\/g, '\\\\')}'
$endpoint = (Get-Content '${path.join(ROOT, '.live-endpoint.local').replace(/\\/g, '\\\\')}' -Raw | ConvertFrom-Json).endpoint
$codeGs = Get-Content '${path.join(ROOT, 'backend', 'Code.gs').replace(/\\/g, '\\\\')}' -Raw
$key = [regex]::Match($codeGs, "const KEY = '([^']+)';").Groups[1].Value

$zip = [System.IO.Compression.ZipFile]::OpenRead($target)
$names = @($zip.Entries | ForEach-Object { $_.FullName })

# Check required files
$required = @('assets/SkillSwapLogo.png', 'youngandroidproject/project.properties')
foreach ($r in $required) {
    if ($names -notcontains $r) { throw "Missing entry: $r" }
}

$bkyEntry = $zip.Entries | Where-Object { $_.FullName -like '*.bky' }
$scmEntry = $zip.Entries | Where-Object { $_.FullName -like '*.scm' }
if (-not $bkyEntry -or -not $scmEntry) { throw "Missing bky or scm" }

$stream = $bkyEntry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$bkyContent = $reader.ReadToEnd()
$zip.Dispose()

[xml]$xml = $bkyContent
$nsmgr = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$nsmgr.AddNamespace("b", "https://developers.google.com/blockly/xml")

# Check apiUrl
$apiUrlNode = $xml.SelectSingleNode("//b:block[@type='global_declaration' and b:field[@name='NAME' and text()='apiUrl']]//b:block[@type='text']/b:field[@name='TEXT']", $nsmgr)
if ($apiUrlNode.InnerText -ne $endpoint) {
    throw "apiUrl mismatch: expected '$endpoint', got '$($apiUrlNode.InnerText)'"
}

# Check apiKey
$apiKeyNode = $xml.SelectSingleNode("//b:block[@type='global_declaration' and b:field[@name='NAME' and text()='apiKey']]//b:block[@type='text']/b:field[@name='TEXT']", $nsmgr)
if ($apiKeyNode.InnerText -ne $key) {
    throw "apiKey mismatch: expected '$key', got '$($apiKeyNode.InnerText)'"
}

# Check procedures
$procs = @($xml.SelectNodes("//b:block[@type='procedures_defnoreturn' or @type='procedures_defreturn']/b:field[@name='NAME']", $nsmgr) | ForEach-Object { $_.InnerText })
$expectedProcs = @('callApi', 'handleReply', 'showPage', 'slotLine', 'sessionLine', 'updateWallet', 'clearSessionSelection', 'setBusy')
foreach ($p in $expectedProcs) {
    if ($procs -notcontains $p) { throw "Missing procedure: $p" }
}

Write-Output "PASS: Verified AIA structure, forward-slash entries, procedures, and live configuration (apiUrl and apiKey)."
`;

try {
    const out = execSync('powershell -NoProfile -Command -', {
        input: psScript,
        encoding: 'utf8'
    });
    console.log(out.trim());
} catch (err) {
    console.error(err.stdout || err.message);
    process.exit(1);
}

