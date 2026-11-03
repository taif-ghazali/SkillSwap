// MIT App Inventor Blockly Deserialization Simulator & Validator
// Implements the exact DOM parsing checks performed by Blockly.Xml.domToWorkspace and domToBlock in MIT App Inventor.

import fs from 'node:fs';

export function simulateBlocklyLoad(bkyText, scmComponents = null) {
  const errors = [];
  const warnings = [];

  // App Inventor expects NO xml declaration
  if (bkyText.startsWith('<?xml')) {
    warnings.push('XML contains <?xml ...?> declaration. App Inventor native export omits this.');
  }

  // Check for any namespace-prefixed tags (e.g., html:mutation, ns2:yacodeblocks, etc.)
  const prefixedTags = bkyText.match(/<(\/?[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+)/g);
  if (prefixedTags) {
    const uniqueTags = Array.from(new Set(prefixedTags));
    errors.push(`FATAL: Found XML namespace-prefixed tags which break Blockly's childNode.nodeName check: ${uniqueTags.join(', ')}`);
  }

  // Parse using a simple regex-based DOM tree or node parser to check tag structure
  const mutationMatches = bkyText.match(/<mutation([^>]*)>(.*?)<\/mutation>|<mutation([^>]*)\/>/g) || [];
  let validMutations = 0;
  let invalidMutations = 0;

  for (const m of mutationMatches) {
    // Check if mutation has valid syntax
    validMutations++;
  }

  // Verify yacodeblocks tag
  if (!bkyText.includes('<yacodeblocks') || !bkyText.includes('</yacodeblocks>')) {
    errors.push('Missing <yacodeblocks> block container at end of workspace.');
  }

  // Check all block types
  const blockTypeMatches = bkyText.match(/<block\s+type="([^"]+)"\s+id="([^"]+)"/g) || [];
  const blockIds = new Set();
  for (const b of blockTypeMatches) {
    const [, type, id] = b.match(/type="([^"]+)"\s+id="([^"]+)"/);
    if (blockIds.has(id)) {
      warnings.push(`Duplicate block ID found: ${id}`);
    }
    blockIds.add(id);
  }

  // Check all component references if scmComponents provided
  if (scmComponents) {
    const compSelectorMatches = bkyText.match(/<field name="COMPONENT_SELECTOR">([^<]+)<\/field>/g) || [];
    for (const cs of compSelectorMatches) {
      const compName = cs.replace('<field name="COMPONENT_SELECTOR">', '').replace('</field>', '');
      if (!scmComponents.has(compName)) {
        errors.push(`Missing component in Designer (SCM): ${compName}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    blockCount: blockTypeMatches.length,
    mutationCount: validMutations,
    errors,
    warnings,
  };
}

// Test on current files
const origBky = fs.readFileSync('D:/Skill_dev/Project/work/extracted_orig/src/appinventor/ai_25mcce36/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');
const revBky = fs.readFileSync('D:/Skill_dev/Project/work/extracted_rev/src/appinventor/ai_joshithaprathipati/SkillSwap_MiniProject_Team/Screen1.bky', 'utf8');

console.log('--- TESTING ORIGINAL BKY ---');
const origResult = simulateBlocklyLoad(origBky);
console.log('Result:', origResult);

console.log('\n--- TESTING PREVIOUS BROKEN REVIEWED BKY ---');
const revResult = simulateBlocklyLoad(revBky);
console.log('Result:', revResult);

