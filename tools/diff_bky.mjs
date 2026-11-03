import fs from 'node:fs';

const origBky = fs.readFileSync('D:/Skill_dev/Project/work/extracted_orig/src/appinventor/ai_25mcce36/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');
const revBky = fs.readFileSync('D:/Skill_dev/Project/work/extracted_rev/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

console.log('Orig length:', origBky.length);
console.log('Rev length:', revBky.length);

// Normalize revBky by removing whitespace/newlines and replacing html:
let cleanRev = revBky
  .replace(/<\?xml[^>]*\?>\s*/, '')
  .replace(/\sxmlns:html="http:\/\/www\.w3\.org\/1999\/xhtml"/g, '')
  .replace(/\sxmlns:ns2="https:\/\/appinventor\.mit\.edu\/ns\/project\/"/g, '')
  .replace(/<(\/?)html:([a-zA-Z0-9_-]+)/g, '<$1$2');

console.log('Cleaned Rev html count:', (cleanRev.match(/html:/g) || []).length);
console.log('Cleaned Rev mutation count:', (cleanRev.match(/<mutation/g) || []).length);
console.log('Orig mutation count:', (origBky.match(/<mutation/g) || []).length);

