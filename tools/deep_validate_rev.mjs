import fs from 'node:fs';

const scmContent = fs.readFileSync('D:/Skill_dev/Project/work/extracted_rev/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.scm', 'utf8');
const bkyContent = fs.readFileSync('D:/Skill_dev/Project/work/extracted_rev/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

// Parse SCM
const scmJson = JSON.parse(scmContent.split('$JSON\n')[1].split('\n|#')[0]);
const components = new Map(); // name -> type

function walkComponents(comp) {
  if (comp['$Name']) {
    components.set(comp['$Name'], comp['$Type']);
  }
  if (comp['$Components']) {
    for (const child of comp['$Components']) {
      walkComponents(child);
    }
  }
}
walkComponents(scmJson.Properties);

// Check every component reference in BKY
const compRefRegex = /COMPONENT_SELECTOR">([^<]+)<\/field>/g;
let m;
const missingComps = new Set();
const foundComps = new Set();
while ((m = compRefRegex.exec(bkyContent)) !== null) {
  const name = m[1];
  foundComps.add(name);
  if (!components.has(name)) {
    missingComps.add(name);
  }
}

console.log(`Found ${foundComps.size} component references in Screen1.bky.`);
if (missingComps.size > 0) {
  console.error(`ERROR: Missing components in SCM:`, Array.from(missingComps));
} else {
  console.log(`PASS: All referenced components exist in Screen1.scm!`);
}

// Check all procedures called vs defined
const procDefs = new Set();
const procCalls = new Set();
const defRegex = /<block type="procedures_def(?:return|noreturn)"[^>]*>.*?<field name="NAME">([^<]+)<\/field>/g;
while ((m = defRegex.exec(bkyContent)) !== null) {
  procDefs.add(m[1]);
}
const callRegex = /<block type="procedures_call(?:return|noreturn)"[^>]*>.*?<field name="PROCNAME">([^<]+)<\/field>/g;
while ((m = callRegex.exec(bkyContent)) !== null) {
  procCalls.add(m[1]);
}

console.log(`\nDefined procedures:`, Array.from(procDefs));
console.log(`Called procedures:`, Array.from(procCalls));
const missingProcs = Array.from(procCalls).filter(p => !procDefs.has(p));
if (missingProcs.length > 0) {
  console.error(`ERROR: Called undefined procedures:`, missingProcs);
} else {
  console.log(`PASS: All called procedures are defined!`);
}

// Check for html: prefixes
const htmlCount = (bkyContent.match(/html:/g) || []).length;
console.log(`\nCount of "html:": ${htmlCount}`);
if (htmlCount > 0) {
  console.error(`CRITICAL ERROR: "html:" namespace prefix present in BKY!`);
}

