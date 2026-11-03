import fs from 'node:fs';

const sdBky = fs.readFileSync('D:/Skill_dev/Project/work/extracted_sd/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

console.log('SD BKY length:', sdBky.length);
console.log('Count of "html:":', (sdBky.match(/html:/g) || []).length);
console.log('Count of "<mutation":', (sdBky.match(/<mutation/g) || []).length);
console.log('Count of "</mutation>":', (sdBky.match(/<\/mutation>/g) || []).length);
console.log('Count of "<block":', (sdBky.match(/<block/g) || []).length);
console.log('Starts with <?xml:', sdBky.startsWith('<?xml'));
console.log('Contains newline:', sdBky.includes('\n'));
console.log('Ends with </xml>:', sdBky.endsWith('</xml>'));

// Check apiUrl and apiKey in SD
const apiUrlMatch = sdBky.match(/<field name="NAME">apiUrl<\/field>(?:<comment[^>]*>.*?<\/comment>)?<value name="VALUE"><block type="text"[^>]*><field name="TEXT">([^<]*)<\/field>/);
const apiKeyMatch = sdBky.match(/<field name="NAME">apiKey<\/field>(?:<comment[^>]*>.*?<\/comment>)?<value name="VALUE"><block type="text"[^>]*><field name="TEXT">([^<]*)<\/field>/);

console.log('apiUrl in SD:', apiUrlMatch ? apiUrlMatch[1] : 'not found');
console.log('apiKey in SD:', apiKeyMatch ? apiKeyMatch[1] : 'not found');
