import fs from 'node:fs';

const origBky = fs.readFileSync('D:/Skill_dev/Project/work/extracted_orig/src/appinventor/ai_25mcce36/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

// Find showPage
const showPageIdx = origBky.indexOf('showPage');
console.log('showPage:');
console.log(origBky.substring(showPageIdx - 150, showPageIdx + 200));

// Find slotLine
const slotLineIdx = origBky.indexOf('slotLine');
console.log('\nslotLine:');
console.log(origBky.substring(slotLineIdx - 150, slotLineIdx + 200));

// Find handleReply
const handleReplyIdx = origBky.indexOf('handleReply');
console.log('\nhandleReply:');
console.log(origBky.substring(handleReplyIdx - 150, handleReplyIdx + 200));

