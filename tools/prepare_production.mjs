import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(root, '.production.local');
const spreadsheetId = '190vT9WqEuo-JC7qY1ojLSlKZsNnsjs9zoJ8dfEG8afY';
mkdirSync(destination, { recursive: true });
const credentialPath = path.join(destination, 'credential.json');
const credential = existsSync(credentialPath)
  ? JSON.parse(readFileSync(credentialPath, 'utf8'))
  : { key: randomBytes(32).toString('hex') };
writeFileSync(credentialPath, JSON.stringify(credential), { mode: 0o600 });
const original = readFileSync(path.join(root, 'backend', 'Code.gs'), 'utf8');
if (!original.includes("const KEY = 'team-secret-123';")) throw new Error('Expected backend key declaration not found');
const production = original.replace("const KEY = 'team-secret-123';", `const KEY = '${credential.key}';`)
  .replaceAll('SpreadsheetApp.getActiveSpreadsheet()', `SpreadsheetApp.openById('${spreadsheetId}')`);
writeFileSync(path.join(destination, 'Code.gs'), production);
writeFileSync(path.join(destination, 'PrepareDeployment.gs'),
  readFileSync(path.join(root, 'backend', 'PrepareDeployment.gs'), 'utf8')
    .replaceAll('SpreadsheetApp.getActiveSpreadsheet()', `SpreadsheetApp.openById('${spreadsheetId}')`));
writeFileSync(path.join(destination, 'appsscript.json'), readFileSync(path.join(root, 'backend', 'appsscript.json')));
writeFileSync(path.join(destination, '.claspignore'), '**/**\n!Code.gs\n!PrepareDeployment.gs\n!appsscript.json\n');
console.log('Production source prepared in .production.local; credential retained privately and not printed. No Google resources changed.');
