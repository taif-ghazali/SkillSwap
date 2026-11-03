import fs from 'node:fs';
import { simulateBlocklyLoad } from './simulate_blockly.mjs';

const sdBky = fs.readFileSync('D:/Skill_dev/Project/work/extracted_sd/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

console.log('SD BKY length:', sdBky.length);
console.log('Count of "html:":', (sdBky.match(/html:/g) || []).length);
console.log('Count of "<mutation":', (sdBky.match(/<mutation/g) || []).length);

const result = simulateBlocklyLoad(sdBky);
console.log('\nSimulation Result for SD BKY:');
console.log(result);
