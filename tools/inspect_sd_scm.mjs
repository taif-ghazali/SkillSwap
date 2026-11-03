import fs from 'node:fs';

const scmRaw = fs.readFileSync('D:/Skill_dev/Project/work/extracted_sd/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.scm', 'utf8');

console.log('SD SCM length:', scmRaw.length);
console.log('Delimiters check:');
console.log('Starts with #| $JSON:', scmRaw.startsWith('#|\n$JSON\n'));
console.log('Ends with |#:', scmRaw.endsWith('\n|#\n'));

const scmJson = JSON.parse(scmRaw.split('$JSON\n')[1].split('\n|#')[0]);

console.log('\n--- Form Properties ---');
console.log('BackgroundColor:', scmJson.Properties.BackgroundColor);
console.log('Title:', scmJson.Properties.Title);
console.log('Theme:', scmJson.Properties.Theme);
console.log('PrimaryColor:', scmJson.Properties.PrimaryColor);

function dumpComponents(comp, indent = 0) {
  const pad = ' '.repeat(indent);
  const props = Object.keys(comp)
    .filter(k => !k.startsWith('$'))
    .map(k => `${k}=${JSON.stringify(comp[k])}`)
    .join(', ');
  console.log(`${pad}${comp.$Name} (${comp.$Type}): ${props}`);
  if (comp.$Components) {
    for (const child of comp.$Components) {
      dumpComponents(child, indent + 2);
    }
  }
}

console.log('\n--- Component Hierarchy & Properties ---');
dumpComponents(scmJson.Properties);
