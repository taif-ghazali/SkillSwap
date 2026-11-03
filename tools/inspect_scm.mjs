import fs from 'node:fs';

const raw = fs.readFileSync('work/android/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.scm', 'utf8');
const jsonStr = raw.split('$JSON\n')[1].split('\n|#')[0];
const data = JSON.parse(jsonStr);

console.log('App Title:', data.Properties.Title);
console.log('Top Components:', data.Properties.$Components.map(c => c.$Name + ' (' + c.$Type + ')'));

for (const c of data.Properties.$Components) {
  if (c.$Components) {
    console.log(`\n--- ${c.$Name} (${c.$Components.length} subcomponents) ---`);
    for (const sub of c.$Components) {
      console.log(`  ${sub.$Name} [${sub.$Type}]: text="${sub.Text || ''}", bg="${sub.BackgroundColor || 'default'}", fg="${sub.TextColor || 'default'}"`);
    }
  }
}

