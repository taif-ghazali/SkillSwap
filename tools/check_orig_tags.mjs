import fs from 'node:fs';

const origBky = fs.readFileSync('D:/Skill_dev/Project/work/extracted_orig/src/appinventor/ai_25mcce36/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

console.log('Orig BKY length:', origBky.length);
console.log('Count of "html:":', (origBky.match(/html:/g) || []).length);
console.log('Count of "<mutation":', (origBky.match(/<mutation/g) || []).length);
console.log('Count of "</mutation>":', (origBky.match(/<\/mutation>/g) || []).length);
console.log('Count of "<arg":', (origBky.match(/<arg/g) || []).length);
console.log('Count of "<eventparam":', (origBky.match(/<eventparam/g) || []).length);
console.log('Count of "<localname":', (origBky.match(/<localname/g) || []).length);

