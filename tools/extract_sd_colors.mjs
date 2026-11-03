import fs from 'node:fs';

const scmRaw = fs.readFileSync('D:/Skill_dev/Project/work/extracted_sd/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.scm', 'utf8');
const scmJson = JSON.parse(scmRaw.split('$JSON\n')[1].split('\n|#')[0]);

const colorMap = new Map(); // hex -> list of component.property

function scan(comp) {
  for (const [key, val] of Object.entries(comp)) {
    if (typeof val === 'string' && val.startsWith('&H')) {
      const hex = val.replace('&HFF', '#').replace('&H', '#');
      if (!colorMap.has(hex)) colorMap.set(hex, []);
      colorMap.get(hex).push(`${comp.$Name}.${key}`);
    }
  }
  if (comp.$Components) {
    for (const child of comp.$Components) scan(child);
  }
}

scan(scmJson.Properties);

console.log('=== All Colors in Team SD Project ===');
for (const [hex, uses] of colorMap) {
  console.log(`\nColor: ${hex} (${uses.length} uses)`);
  console.log('  ' + uses.slice(0, 5).join(', ') + (uses.length > 5 ? ` ... +${uses.length - 5} more` : ''));
}
