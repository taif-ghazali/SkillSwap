import fs from 'node:fs';

const origScm = fs.readFileSync('D:/Skill_dev/Project/work/extracted_orig/src/appinventor/ai_25mcce36/SkillSwap_MiniProject_Team/Screen1.scm', 'utf8');
const revScm = fs.readFileSync('D:/Skill_dev/Project/work/extracted_rev/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.scm', 'utf8');

console.log('--- ORIG SCM START ---');
console.log(origScm.substring(0, 100));
console.log('--- ORIG SCM END ---');
console.log(origScm.substring(origScm.length - 100));

console.log('--- REV SCM START ---');
console.log(revScm.substring(0, 100));
console.log('--- REV SCM END ---');
console.log(revScm.substring(revScm.length - 100));

