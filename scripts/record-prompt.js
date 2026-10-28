/**
 * Prompt Recording Helper Script for MentorConnect
 * 
 * Usage:
 *   node scripts/record-prompt.js <path-to-prompt-file> [optional-title] [optional-objective]
 * Example:
 *   npm run prompt:record -- ./my-prompt.md "Feature X Enhancement" "Add notifications"
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROMPTS_DIR = path.join(ROOT_DIR, 'prompts');
const ENTRIES_DIR = path.join(PROMPTS_DIR, 'entries');
const HISTORY_FILE = path.join(PROMPTS_DIR, 'prompt-history.md');

function run() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Error: Please provide the path to the prompt file.');
    console.error('Usage: node scripts/record-prompt.js <prompt-file-path> [title] [objective]');
    process.exit(1);
  }

  const promptFilePath = path.resolve(process.cwd(), args[0]);
  if (!fs.existsSync(promptFilePath)) {
    console.error(`Error: File not found at path: ${promptFilePath}`);
    process.exit(1);
  }

  const promptContent = fs.readFileSync(promptFilePath, 'utf-8').trim();
  if (!promptContent) {
    console.error('Error: Prompt file is empty.');
    process.exit(1);
  }

  // Ensure directories exist
  if (!fs.existsSync(ENTRIES_DIR)) {
    fs.mkdirSync(ENTRIES_DIR, { recursive: true });
  }

  // Determine next sequential ID
  const existingFiles = fs.readdirSync(ENTRIES_DIR).filter(f => f.endsWith('.md'));
  let maxId = 0;
  for (const file of existingFiles) {
    const match = file.match(/^(\d{3})-/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxId) maxId = num;
    }
  }

  const nextId = maxId + 1;
  const idStr = String(nextId).padStart(3, '0');

  const title = args[1] || `Development Milestone #${idStr}`;
  const objective = args[2] || `Implementation and refinement stage ${idStr}`;

  // Generate safe filename slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `prompt-${idStr}`;

  const targetFilename = `${idStr}-${slug}.md`;
  const targetPath = path.join(ENTRIES_DIR, targetFilename);

  if (fs.existsSync(targetPath)) {
    console.error(`Error: Target file already exists: ${targetFilename}. Aborting to avoid overwrite.`);
    process.exit(1);
  }

  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  // Construct entry file content
  const entryContent = `# Prompt Entry #${idStr}: ${title}

- **Prompt ID**: ${idStr}
- **Timestamp**: ${dateStr}
- **Status**: Completed
- **Objective**: ${objective}

---

## Verbatim Prompt Content

\`\`\`markdown
${promptContent}
\`\`\`
`;

  fs.writeFileSync(targetPath, entryContent, 'utf-8');
  console.log(`[Prompt Recorder] Created prompt entry: prompts/entries/${targetFilename}`);

  // Update prompt-history.md
  if (fs.existsSync(HISTORY_FILE)) {
    let history = fs.readFileSync(HISTORY_FILE, 'utf-8');
    const tableRow = `| **#${idStr}** | ${dateStr} | ${title} | ${objective} | System | Completed | [${targetFilename}](./entries/${targetFilename}) |\n`;
    
    if (history.includes('| Link |')) {
      // Append right after table separator or at end of table
      history = history.replace(/(.*\| Link \|\r?\n\| :---.*\|\r?\n)/, `$1${tableRow}`);
    } else {
      history += `\n${tableRow}`;
    }
    fs.writeFileSync(HISTORY_FILE, history, 'utf-8');
    console.log(`[Prompt Recorder] Updated prompts/prompt-history.md`);
  }

  console.log(`[Prompt Recorder] Successfully recorded prompt #${idStr}!`);
}

run();
