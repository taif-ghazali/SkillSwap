import fs from 'node:fs';

const origBky = fs.readFileSync('D:/Skill_dev/Project/work/extracted_orig/src/appinventor/ai_25mcce36/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

// List all top-level blocks in origBky
const blockMatches = origBky.match(/<block type="([^"]+)" id="([^"]+)"/g) || [];
console.log('Total block tags in orig:', blockMatches.length);

// Check all procedures
const procRegex = /<block type="procedures_def(?:return|noreturn)"[^>]*>.*?<field name="NAME">([^<]+)<\/field>/g;
let m;
console.log('\n--- Procedures in orig: ---');
while ((m = procRegex.exec(origBky)) !== null) {
  console.log('  Procedure:', m[1]);
}

// Check all component events
const eventRegex = /<block type="component_event"[^>]*><mutation[^>]*instance_name="([^"]+)"[^>]*event_name="([^"]+)"/g;
console.log('\n--- Component Events in orig: ---');
while ((m = eventRegex.exec(origBky)) !== null) {
  console.log('  Event:', `${m[1]}.${m[2]}`);
}

// Check all globals
const globalRegex = /<block type="global_declaration"[^>]*><field name="NAME">([^<]+)<\/field>/g;
console.log('\n--- Globals in orig: ---');
while ((m = globalRegex.exec(origBky)) !== null) {
  console.log('  Global:', m[1]);
}

