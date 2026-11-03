import fs from 'node:fs';

const origBky = fs.readFileSync('D:/Skill_dev/Project/work/extracted_orig/src/appinventor/ai_25mcce36/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

const idx = origBky.indexOf('apiUrl');
console.log('apiUrl block snippet:');
console.log(origBky.substring(idx - 50, idx + 450));

const idxKey = origBky.indexOf('apiKey');
console.log('\napiKey block snippet:');
console.log(origBky.substring(idxKey - 50, idxKey + 450));

