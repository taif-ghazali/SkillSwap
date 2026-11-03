import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { updateScmProperties } from './apply_figma_theme.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const origAia = path.join(ROOT, 'SkillSwap_MiniProject_Team.aia');
const targetAia = path.join(ROOT, 'output', 'android', 'SkillSwap_MiniProject_Team_Reviewed.aia');
const endpoint = JSON.parse(fs.readFileSync(path.join(ROOT, '.live-endpoint.local'), 'utf8')).endpoint;
const key = fs.readFileSync(path.join(ROOT, 'backend', 'Code.gs'), 'utf8').match(/const KEY = '([^']+)';/)[1];

console.log('=== Building Repaired SkillSwap AIA ===');
console.log('Source base AIA:', origAia);
console.log('Target AIA:', targetAia);
console.log('Live Endpoint:', endpoint);
console.log('Live Key:', key);

const tempDir = path.join(ROOT, 'temp_repaired_build');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

// 1. Extract from origAia
console.log('\n[1/5] Extracting original clean AIA...');
const extractPs = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory('${origAia.replace(/\\/g, '\\\\')}', '${tempDir.replace(/\\/g, '\\\\')}')
`;
execSync('powershell -NoProfile -Command -', { input: extractPs });

// 2. Locate Screen1.scm, Screen1.bky, project.properties
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

if (!scmPath || !bkyPath || !propPath) {
  throw new Error('Missing essential files in extracted AIA');
}

// Update assets with new SkillSwap logo if available
const newLogo = path.join(ROOT, 'public', 'SkillSwapLogo.png');
const targetLogo = path.join(tempDir, 'assets', 'SkillSwapLogo.png');
if (fs.existsSync(newLogo) && fs.existsSync(path.dirname(targetLogo))) {
  fs.copyFileSync(newLogo, targetLogo);
  console.log('  Updated assets/SkillSwapLogo.png with polished brand design.');
}

// 3. Update Screen1.scm with Figma Theme
console.log('\n[2/5] Applying Figma Visual Design System to Screen1.scm...');
const rawScm = fs.readFileSync(scmPath, 'utf8');
const scmHeader = rawScm.split('$JSON\n')[0] + '$JSON\n';
const scmFooter = '\n|#\n';
const jsonStr = rawScm.split('$JSON\n')[1].split('\n|#')[0];
const scmData = JSON.parse(jsonStr);

updateScmProperties(scmData);
// Output compact single-line JSON exactly as native App Inventor does
fs.writeFileSync(scmPath, scmHeader + JSON.stringify(scmData) + scmFooter, 'utf8');
console.log('  Applied Forest Green (#1B4332), Cream (#F8F9F5), Amber (#D97706), Slate (#2D3748) and Card White.');

// 4. Update Screen1.bky cleanly WITHOUT any XML parser or serializer
console.log('\n[3/5] Updating Screen1.bky with live endpoint & key (exact string replacement)...');
let bkyContent = fs.readFileSync(bkyPath, 'utf8');

// Verify initial state
const initialHtmlCount = (bkyContent.match(/html:/g) || []).length;
console.log(`  Initial "html:" prefix count: ${initialHtmlCount}`);
if (initialHtmlCount > 0) {
  throw new Error('Source BKY unexpectedly contains html: prefixes!');
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

// Ensure no html: prefixes exist
const finalHtmlCount = (bkyContent.match(/html:/g) || []).length;
console.log(`  Final "html:" prefix count: ${finalHtmlCount}`);
if (finalHtmlCount !== 0) {
  throw new Error('FATAL: "html:" prefixes introduced into BKY!');
}

fs.writeFileSync(bkyPath, bkyContent, 'utf8');
console.log('  Screen1.bky written successfully (single-line, native XML, 0 html prefixes).');

// 5. Update project.properties with Figma colors
console.log('\n[4/5] Updating project.properties with Figma theme colors...');
let propContent = fs.readFileSync(propPath, 'utf8');
propContent = propContent
  .replace(/color\.primary=[^\r\n]*/, 'color.primary=&HFF1B4332')
  .replace(/color\.primary\.dark=[^\r\n]*/, 'color.primary.dark=&HFF143728')
  .replace(/color\.accent=[^\r\n]*/, 'color.accent=&HFFD97706');
fs.writeFileSync(propPath, propContent, 'utf8');
console.log('  project.properties updated with Figma color tokens.');

// 6. Repack into targetAia using repack_aia.ps1
console.log('\n[5/5] Repacking into AIA archive with forward slashes...');
const repackScript = path.join(ROOT, 'tools', 'repack_aia.ps1');
execSync(`powershell -ExecutionPolicy Bypass -File "${repackScript}" -tempDir "${tempDir}" -targetAia "${targetAia}"`, {
  stdio: 'inherit'
});

// Clean temp directory
fs.rmSync(tempDir, { recursive: true, force: true });
console.log('\nRepaired AIA build complete: ' + targetAia);

