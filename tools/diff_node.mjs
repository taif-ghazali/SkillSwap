import fs from 'node:fs';
import zlib from 'node:zlib';

// Read from zip in node using yauzl or reading uncompressed entry or child_process
import { execSync } from 'node:child_process';

const origBky = execSync(`powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; $z = [System.IO.Compression.ZipFile]::OpenRead('SkillSwap_MiniProject_Team.aia'); $s = ($z.Entries | Where-Object { $_.FullName -like '*.bky' }).Open(); (New-Object System.IO.StreamReader($s)).ReadToEnd(); $z.Dispose()"`, { encoding: 'utf8' });
const workBky = fs.readFileSync('work/android/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

console.log('Orig length:', origBky.length, 'Work length:', workBky.length);

let diffIndex = -1;
for (let i = 0; i < Math.min(origBky.length, workBky.length); i++) {
  if (origBky[i] !== workBky[i]) {
    diffIndex = i;
    break;
  }
}

if (diffIndex !== -1) {
  console.log('First diff at char:', diffIndex);
  console.log('Orig:', origBky.substring(Math.max(0, diffIndex - 30), diffIndex + 50));
  console.log('Work:', workBky.substring(Math.max(0, diffIndex - 30), diffIndex + 50));
} else {
  console.log('One is prefix of other');
}

