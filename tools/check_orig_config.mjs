import fs from 'node:fs';

const origBky = fs.readFileSync('D:/Skill_dev/Project/work/extracted_orig/src/appinventor/ai_25mcce36/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

const apiUrlMatch = origBky.match(/name="NAME">apiUrl<\/field><value name="VALUE"><block type="text"[^>]*><field name="TEXT">([^<]*)<\/field>/);
const apiKeyMatch = origBky.match(/name="NAME">apiKey<\/field><value name="VALUE"><block type="text"[^>]*><field name="TEXT">([^<]*)<\/field>/);

console.log('Orig apiUrl:', apiUrlMatch ? apiUrlMatch[1] : 'not found');
console.log('Orig apiKey:', apiKeyMatch ? apiKeyMatch[1] : 'not found');

