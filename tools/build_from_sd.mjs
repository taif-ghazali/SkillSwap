import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const sdAia = 'C:/Users/Taif Al Ghazali/.gemini/antigravity/brain/3ab9bfe5-678f-4a01-84e5-751ddf8da42c/.user_uploaded/media_1793722415080_2808c652.aia';
const targetAia = path.join(ROOT, 'output', 'android', 'SkillSwap_MiniProject_Team_Reviewed.aia');
const endpoint = JSON.parse(fs.readFileSync(path.join(ROOT, '.live-endpoint.local'), 'utf8')).endpoint;
const key = fs.readFileSync(path.join(ROOT, 'backend', 'Code.gs'), 'utf8').match(/const KEY = '([^']+)';/)[1];

console.log('=== Building Android AIA from Team SD Reference ===');
console.log('Source SD AIA:', sdAia);
console.log('Target AIA:', targetAia);
console.log('Live Endpoint:', endpoint);
console.log('Live Key:', key);

const tempDir = path.join(ROOT, 'temp_sd_build');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

// 1. Extract from sdAia
const extractPs = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory('${sdAia.replace(/\\/g, '\\\\')}', '${tempDir.replace(/\\/g, '\\\\')}')
`;
execSync('powershell -NoProfile -Command -', { input: extractPs });

// 2. Locate files
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

console.log('Found SCM:', scmPath);
console.log('Found BKY:', bkyPath);
console.log('Found Properties:', propPath);

// 3. Keep SCM untouched - it has the exact team visual design (#1F5240, #F6F7F3, #E4ECE5)!
console.log('Preserving authentic Team SCM design.');

// 4. Update Screen1.bky with live endpoint & key via exact string replacement
let bkyContent = fs.readFileSync(bkyPath, 'utf8');

const initialHtmlCount = (bkyContent.match(/html:/g) || []).length;
console.log(`Initial "html:" count in SD BKY: ${initialHtmlCount}`);
if (initialHtmlCount > 0) {
  throw new Error('Source SD BKY contains html: prefixes!');
}

// Update apiUrl
const apiUrlPattern = /(<field name="NAME">apiUrl<\/field>(?:<comment[^>]*>.*?<\/comment>)?<value name="VALUE"><block type="text"[^>]*><field name="TEXT">)[^<]*(<\/field>)/;
if (!apiUrlPattern.test(bkyContent)) {
  throw new Error('Could not find apiUrl block in BKY');
}
bkyContent = bkyContent.replace(apiUrlPattern, `$1${endpoint}$2`);

// Update apiKey
const apiKeyPattern = /(<field name="NAME">apiKey<\/field>(?:<comment[^>]*>.*?<\/comment>)?<value name="VALUE"><block type="text"[^>]*><field name="TEXT">)[^<]*(<\/field>)/;
if (!apiKeyPattern.test(bkyContent)) {
  throw new Error('Could not find apiKey block in BKY');
}
bkyContent = bkyContent.replace(apiKeyPattern, `$1${key}$2`);

const finalHtmlCount = (bkyContent.match(/html:/g) || []).length;
console.log(`Final "html:" count in patched BKY: ${finalHtmlCount}`);
if (finalHtmlCount !== 0) {
  throw new Error('html: prefixes introduced!');
}

fs.writeFileSync(bkyPath, bkyContent, 'utf8');
console.log('Successfully patched BKY with live endpoint and key.');

// 5. Update Status in project.properties to valid if needed
let propContent = fs.readFileSync(propPath, 'utf8');
propContent = propContent.replace(/Status=[^\r\n]*/, 'Status=valid');
fs.writeFileSync(propPath, propContent, 'utf8');

// 6. Repack into targetAia
const repackScript = path.join(ROOT, 'tools', 'repack_aia.ps1');
execSync(`powershell -ExecutionPolicy Bypass -File "${repackScript}" -tempDir "${tempDir}" -targetAia "${targetAia}"`, {
  stdio: 'inherit'
});

fs.rmSync(tempDir, { recursive: true, force: true });
console.log('Repacked successfully from Team SD reference: ' + targetAia);
