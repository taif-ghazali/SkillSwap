import fs from 'node:fs';

const origBky = fs.readFileSync('D:/Skill_dev/Project/work/extracted_orig/src/appinventor/ai_25mcce36/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

function printBlock(startStr, len = 1000) {
  const idx = origBky.indexOf(startStr);
  if (idx !== -1) {
    console.log(`=== Block starting with: ${startStr} ===`);
    console.log(origBky.substring(idx, idx + len));
  } else {
    console.log(`=== NOT FOUND: ${startStr} ===`);
  }
}

printBlock('<field name="NAME">callApi</field>');
printBlock('<field name="COMPONENT_SELECTOR">webApi</field>');
printBlock('<field name="NAME">handleReply</field>');

