import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { updateScmProperties } from './apply_figma_theme.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const targetAia = path.join(ROOT, 'output', 'android', 'SkillSwap_MiniProject_Team_Reviewed.aia');
const backupAia = path.join(ROOT, 'output', 'android', 'SkillSwap_MiniProject_Team_Reviewed.backup.aia');
const endpoint = JSON.parse(fs.readFileSync(path.join(ROOT, '.live-endpoint.local'), 'utf8')).endpoint;
const key = fs.readFileSync(path.join(ROOT, 'backend', 'Code.gs'), 'utf8').match(/const KEY = '([^']+)';/)[1];

console.log('Building Figma-Polished Android AIA...');
console.log('Target AIA:', targetAia);
console.log('Endpoint:', endpoint);
console.log('Key:', key);

const tempDir = path.join(ROOT, 'temp_figma_build');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

// 1. Extract from backupAia (or targetAia)
const sourceAia = fs.existsSync(backupAia) ? backupAia : targetAia;
const extractPs = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory('${sourceAia.replace(/\\/g, '\\\\')}', '${tempDir.replace(/\\/g, '\\\\')}')
`;
execSync('powershell -NoProfile -Command -', { input: extractPs });

// 2. Locate Screen1.scm and Screen1.bky
let scmPath, bkyPath, propPath;
function findFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findFiles(full);
    } else if (entry.name.endsWith('.scm')) {
      scmPath = full;
    } else if (entry.name.endsWith('.bky')) {
      bkyPath = full;
    } else if (entry.name === 'project.properties') {
      propPath = full;
    }
  }
}
findFiles(tempDir);

if (!scmPath || !bkyPath || !propPath) {
  throw new Error('Missing essential AIA files in tempDir');
}

// 3. Update Screen1.scm
const rawScm = fs.readFileSync(scmPath, 'utf8');
const scmHeader = rawScm.split('$JSON\n')[0] + '$JSON\n';
const scmFooter = '\n|#\n';
const jsonStr = rawScm.split('$JSON\n')[1].split('\n|#')[0];
const scmData = JSON.parse(jsonStr);

updateScmProperties(scmData);
fs.writeFileSync(scmPath, scmHeader + JSON.stringify(scmData, null, 2) + scmFooter, 'utf8');
console.log('Updated Screen1.scm with Figma design tokens.');

// 4. Update Screen1.bky with live endpoint & key
const patchBkyPs = `
$bkyPath = '${bkyPath.replace(/\\/g, '\\\\')}'
[xml]$xml = Get-Content $bkyPath -Raw
$nsmgr = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$nsmgr.AddNamespace("b", "https://developers.google.com/blockly/xml")

$apiUrlField = $xml.SelectSingleNode("//b:block[@type='global_declaration' and b:field[@name='NAME' and text()='apiUrl']]//b:block[@type='text']/b:field[@name='TEXT']", $nsmgr)
if ($apiUrlField) { $apiUrlField.InnerText = '${endpoint}' }

$apiKeyField = $xml.SelectSingleNode("//b:block[@type='global_declaration' and b:field[@name='NAME' and text()='apiKey']]//b:block[@type='text']/b:field[@name='TEXT']", $nsmgr)
if ($apiKeyField) { $apiKeyField.InnerText = '${key}' }

$xml.Save($bkyPath)
`;
execSync('powershell -NoProfile -Command -', { input: patchBkyPs });
console.log('Updated Screen1.bky with live endpoint and key.');

// 5. Update project.properties
let propContent = fs.readFileSync(propPath, 'utf8');
propContent = propContent
  .replace(/color\.primary=[^\r\n]*/, 'color.primary=&HFF1B4332')
  .replace(/color\.primary\.dark=[^\r\n]*/, 'color.primary.dark=&HFF143728')
  .replace(/color\.accent=[^\r\n]*/, 'color.accent=&HFFD97706');
fs.writeFileSync(propPath, propContent, 'utf8');
console.log('Updated project.properties with Figma color tokens.');

// 6. Repack into targetAia using tools/repack_aia.ps1
const repackScript = path.join(ROOT, 'tools', 'repack_aia.ps1');
execSync(`powershell -ExecutionPolicy Bypass -File "${repackScript}" -tempDir "${tempDir}" -targetAia "${targetAia}"`, {
  stdio: 'inherit'
});

fs.rmSync(tempDir, { recursive: true, force: true });
console.log('Cleaned temp directory. Build complete.');
