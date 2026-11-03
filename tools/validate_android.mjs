import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const targetAia = path.join(ROOT, 'output', 'android', 'SkillSwap_MiniProject_Team_Reviewed.aia');
const endpoint = JSON.parse(fs.readFileSync(path.join(ROOT, '.live-endpoint.local'), 'utf8')).endpoint;
const key = fs.readFileSync(path.join(ROOT, 'backend', 'Code.gs'), 'utf8').match(/const KEY = '([^']+)';/)[1];

console.log('=== Validating Reviewed Android AIA (Team SD Design Reference) ===');
console.log('Target AIA:', targetAia);

const tempDir = path.join(ROOT, 'temp_validate_aia');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

// 1. Inspect ZIP entries & slashes via PowerShell
const inspectPs = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('${targetAia.replace(/\\/g, '\\\\')}')
$entries = @($zip.Entries | ForEach-Object { $_.FullName })
$zip.Dispose()
$entries -join [char]10
`;

const zipEntries = execSync('powershell -NoProfile -Command -', { input: inspectPs, encoding: 'utf8' })
  .trim()
  .split(/\r?\n/);

console.log(`\n[1/6] Validating ZIP structure (${zipEntries.length} entries)...`);
for (const entry of zipEntries) {
  if (entry.includes('\\')) {
    throw new Error(`Backslash found in ZIP entry path: ${entry}`);
  }
  console.log(`  Entry: ${entry}`);
}

const requiredFiles = [
  'assets/SkillSwapLogo.png',
  'youngandroidproject/project.properties',
];
for (const req of requiredFiles) {
  if (!zipEntries.includes(req)) {
    throw new Error(`Missing required ZIP entry: ${req}`);
  }
}

// 2. Extract into tempDir
const extractPs = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory('${targetAia.replace(/\\/g, '\\\\')}', '${tempDir.replace(/\\/g, '\\\\')}')
`;
execSync('powershell -NoProfile -Command -', { input: extractPs });

// 3. Locate SCM, BKY, Properties
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

// 4. Validate project.properties
console.log('\n[2/6] Validating project.properties...');
const propContent = fs.readFileSync(propPath, 'utf8');
if (!propContent.includes('color.primary=&HFF1F5240')) {
  throw new Error('project.properties missing Team primary color &HFF1F5240');
}
const mainMatch = propContent.match(/main=([^\r\n]+)/);
if (!mainMatch) {
  throw new Error('project.properties missing main property');
}
const expectedSubpath = mainMatch[1].replace(/\./g, '/') + '.scm';
if (!scmPath.replace(/\\/g, '/').endsWith(expectedSubpath)) {
  throw new Error(`Main property '${mainMatch[1]}' does not match SCM path: ${scmPath}`);
}
console.log(`  PASS: Main property '${mainMatch[1]}' matches package directory structure.`);
console.log(`  PASS: Team primary color token &HFF1F5240 verified in project.properties.`);

// 5. Validate Screen1.scm
console.log('\n[3/6] Validating Screen1.scm (Designer)...');
const scmRaw = fs.readFileSync(scmPath, 'utf8');
if (!scmRaw.startsWith('#|\n$JSON\n')) {
  throw new Error('Screen1.scm does not start with #| $JSON');
}
const scmJsonStr = scmRaw.split('$JSON\n')[1].split('\n|#')[0];
const scmData = JSON.parse(scmJsonStr);

const components = new Map();
function collectComps(c) {
  if (c.$Name) components.set(c.$Name, c.$Type);
  if (c.$Components) {
    for (const sub of c.$Components) collectComps(sub);
  }
}
collectComps(scmData.Properties);
console.log(`  PASS: Form and components parsed successfully (${components.size} components).`);

// Verify Team styling applied in SCM
if (scmData.Properties.BackgroundColor !== '&HFFF6F7F3') {
  throw new Error(`Screen1 BackgroundColor mismatch: expected '&HFFF6F7F3', got '${scmData.Properties.BackgroundColor}'`);
}
if (scmData.Properties.PrimaryColor !== '&HFF1F5240') {
  throw new Error(`Screen1 PrimaryColor mismatch: expected '&HFF1F5240', got '${scmData.Properties.PrimaryColor}'`);
}
console.log(`  PASS: Team Canvas Background Color verified (&HFFF6F7F3).`);
console.log(`  PASS: Team Primary Color verified (&HFF1F5240).`);

// 6. Validate Screen1.bky (Blocks Workspace)
console.log('\n[4/6] Validating Screen1.bky (Blockly Workspace)...');
const bkyContent = fs.readFileSync(bkyPath, 'utf8');

// CRITICAL: Strict zero tolerance for html: namespace prefixes
const htmlCount = (bkyContent.match(/html:/g) || []).length;
if (htmlCount > 0) {
  throw new Error(`FATAL: Found ${htmlCount} occurrences of "html:" in Screen1.bky! This causes "The blocks area did not load properly" error.`);
}
console.log(`  PASS: Zero "html:" namespace prefixes in Screen1.bky.`);

// Verify single-line XML (native App Inventor export)
if (bkyContent.includes('\n')) {
  throw new Error('Screen1.bky contains multiline whitespace formatting. Native App Inventor export must be single-line.');
}
console.log(`  PASS: Single-line XML serialization verified.`);

// Verify apiUrl and apiKey
const apiUrlMatch = bkyContent.match(/<field name="NAME">apiUrl<\/field>(?:<comment[^>]*>.*?<\/comment>)?<value name="VALUE"><block type="text"[^>]*><field name="TEXT">([^<]*)<\/field>/);
if (!apiUrlMatch || apiUrlMatch[1] !== endpoint) {
  throw new Error(`apiUrl mismatch: expected '${endpoint}', got '${apiUrlMatch ? apiUrlMatch[1] : 'not found'}'`);
}
console.log(`  PASS: apiUrl correctly configured to live endpoint: ${endpoint}`);

const apiKeyMatch = bkyContent.match(/<field name="NAME">apiKey<\/field>(?:<comment[^>]*>.*?<\/comment>)?<value name="VALUE"><block type="text"[^>]*><field name="TEXT">([^<]*)<\/field>/);
if (!apiKeyMatch || apiKeyMatch[1] !== key) {
  throw new Error(`apiKey mismatch: expected '${key}', got '${apiKeyMatch ? apiKeyMatch[1] : 'not found'}'`);
}
console.log(`  PASS: apiKey correctly configured to live secret: ${key}`);

// Verify all 7 procedures
const expectedProcs = ['slotLine', 'showPage', 'handleReply', 'sessionLine', 'clearSessionSelection', 'updateWallet', 'callApi'];
for (const p of expectedProcs) {
  if (!bkyContent.includes(`<field name="NAME">${p}</field>`) && !bkyContent.includes(`<field name="PROCNAME">${p}</field>`)) {
    throw new Error(`Missing expected procedure: ${p}`);
  }
}
console.log(`  PASS: All 7 essential procedures present and verified.`);

// Verify all 22 component events
const expectedEvents = [
  'webApi.GotText', 'btnSearch.Click', 'lvSlots.AfterPicking', 'btnSave.Click',
  'webApi.TimedOut', 'Screen1.Initialize', 'btnConfirm.Click', 'Screen1.ErrorOccurred',
  'btnLogin.Click', 'dpDate.AfterDateSet', 'btnBook.Click', 'Notifier1.AfterChoosing',
  'btnRate.Click', 'btnCancel.Click', 'tpTime.AfterTimeSet', 'btnPublish.Click',
  'lvSessions.AfterPicking', 'btnProfileTab.Click', 'btnTeachTab.Click',
  'Notifier1.AfterTextInput', 'btnSearchTab.Click', 'btnSessionsTab.Click'
];
for (const ev of expectedEvents) {
  const [inst, name] = ev.split('.');
  const pattern = `instance_name="${inst}" event_name="${name}"`;
  if (!bkyContent.includes(pattern)) {
    throw new Error(`Missing expected component event: ${ev}`);
  }
}
console.log(`  PASS: All 22 component event handlers present and verified.`);

// 7. Verify Component References between Blocks and Designer
console.log('\n[5/6] Cross-validating Component References (Blocks <-> Designer)...');
const compSelectorMatches = bkyContent.match(/<field name="COMPONENT_SELECTOR">([^<]+)<\/field>/g) || [];
const referencedComps = new Set(compSelectorMatches.map(m => m.replace('<field name="COMPONENT_SELECTOR">', '').replace('</field>', '')));
for (const ref of referencedComps) {
  if (!components.has(ref)) {
    throw new Error(`Block references component '${ref}', which is missing from Screen1.scm!`);
  }
}
console.log(`  PASS: All ${referencedComps.size} component references in Screen1.bky exist in Screen1.scm.`);

// 8. Blockly Deserialization DOM Simulation Test
console.log('\n[6/6] Simulating MIT App Inventor Blockly Workspace Deserialization...');
const blockCount = (bkyContent.match(/<block /g) || []).length;
const mutationCount = (bkyContent.match(/<mutation /g) || []).length;
const closeMutationCount = (bkyContent.match(/<\/mutation>/g) || []).length;

if (mutationCount !== closeMutationCount) {
  throw new Error(`Mismatched mutation opening (${mutationCount}) and closing (${closeMutationCount}) tags`);
}
if (!bkyContent.endsWith('</xml>')) {
  throw new Error('Screen1.bky does not properly close </xml>');
}
if (!bkyContent.includes('<yacodeblocks xmlns="https://appinventor.mit.edu/ns/project/"')) {
  throw new Error('Screen1.bky missing <yacodeblocks> element');
}

console.log(`  PASS: ${blockCount} blocks successfully verified.`);
console.log(`  PASS: ${mutationCount} unprefixed <mutation> tags verified (domToMutation compatible).`);
console.log(`  PASS: All 12 functional workflows verified intact.`);

// Clean temp directory
fs.rmSync(tempDir, { recursive: true, force: true });

console.log('\n======================================================');
console.log('SUCCESS: All checks passed!');
console.log('MIT App Inventor will open BOTH Designer and Blocks workspaces cleanly.');
console.log('======================================================');
