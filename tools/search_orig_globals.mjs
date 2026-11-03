import fs from 'node:fs';

const origBky = fs.readFileSync('D:/Skill_dev/Project/work/extracted_orig/src/appinventor/ai_25mcce36/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

const idx = origBky.indexOf('apiUrl');
console.log('apiUrl index:', idx);
if (idx !== -1) {
  console.log('Snippet around apiUrl:', origBky.substring(idx - 100, idx + 200));
}

const idxKey = origBky.indexOf('apiKey');
console.log('apiKey index:', idxKey);
if (idxKey !== -1) {
  console.log('Snippet around apiKey:', origBky.substring(idxKey - 100, idxKey + 200));
}

