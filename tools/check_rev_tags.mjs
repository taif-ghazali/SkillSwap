import fs from 'node:fs';

const revBky = fs.readFileSync('D:/Skill_dev/Project/work/extracted_rev/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

console.log('Rev BKY length:', revBky.length);
console.log('Count of "html:":', (revBky.match(/html:/g) || []).length);
console.log('Count of "<mutation":', (revBky.match(/<mutation/g) || []).length);
console.log('Count of "<html:mutation":', (revBky.match(/<html:mutation/g) || []).length);
console.log('Count of "<html:arg":', (revBky.match(/<html:arg/g) || []).length);
console.log('Count of "<html:eventparam":', (revBky.match(/<html:eventparam/g) || []).length);
console.log('Count of "<html:localname":', (revBky.match(/<html:localname/g) || []).length);

