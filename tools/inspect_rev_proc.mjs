import fs from 'node:fs';

const bkyContent = fs.readFileSync('D:/Skill_dev/Project/work/extracted_rev/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

const procIdx = bkyContent.indexOf('procedures_defnoreturn');
console.log('procedures_defnoreturn snippet:');
console.log(bkyContent.substring(procIdx, procIdx + 400));

