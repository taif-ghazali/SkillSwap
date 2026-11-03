import fs from 'node:fs';

const origScm = fs.readFileSync('D:/Skill_dev/Project/work/extracted_orig/src/appinventor/ai_25mcce36/SkillSwap_MiniProject_Team/Screen1.scm', 'utf8');
const revScm = fs.readFileSync('D:/Skill_dev/Project/work/extracted_rev/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.scm', 'utf8');

console.log('Orig SCM length:', origScm.length);
console.log('Rev SCM length:', revScm.length);

const origJson = JSON.parse(origScm.split('$JSON\n')[1].split('\n|#')[0]);
const revJson = JSON.parse(revScm.split('$JSON\n')[1].split('\n|#')[0]);

function collectNames(obj, list = []) {
  if (obj['$Name']) list.push({ name: obj['$Name'], type: obj['$Type'] });
  if (obj['$Components']) {
    for (const c of obj['$Components']) collectNames(c, list);
  }
  return list;
}

const origComps = collectNames(origJson.Properties);
const revComps = collectNames(revJson.Properties);

console.log('Orig component count:', origComps.length);
console.log('Rev component count:', revComps.length);

const origNames = new Set(origComps.map(c => c.name));
const revNames = new Set(revComps.map(c => c.name));

const missingInRev = origComps.filter(c => !revNames.has(c.name));
const addedInRev = revComps.filter(c => !origNames.has(c.name));

console.log('Missing in Rev:', missingInRev);
console.log('Added in Rev:', addedInRev);

