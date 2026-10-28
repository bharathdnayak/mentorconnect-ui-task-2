import { describe, it, expect, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Prompt Recording Workflow & Helper Script', () => {
  const tempPromptFile = path.resolve(__dirname, 'temp-test-prompt.txt');

  afterAll(() => {
    if (fs.existsSync(tempPromptFile)) {
      fs.unlinkSync(tempPromptFile);
    }
  });

  it('rejects recording when no prompt file argument is provided', () => {
    expect(() => {
      execSync('node scripts/record-prompt.js', { stdio: 'pipe' });
    }).toThrow();
  });

  it('rejects recording when prompt file does not exist', () => {
    expect(() => {
      execSync('node scripts/record-prompt.js ./non-existent-file.md', { stdio: 'pipe' });
    }).toThrow();
  });

  it('rejects recording when prompt file is empty', () => {
    fs.writeFileSync(tempPromptFile, '   ', 'utf-8');
    expect(() => {
      execSync(`node scripts/record-prompt.js "${tempPromptFile}"`, { stdio: 'pipe' });
    }).toThrow();
  });

  it('preserves existing prompt entries and verifies entry 001 exists', () => {
    const entry001Path = path.resolve(__dirname, '../prompts/entries/001-project-master-prompt.md');
    expect(fs.existsSync(entry001Path)).toBe(true);
    const content = fs.readFileSync(entry001Path, 'utf-8');
    expect(content).toContain('Prompt Entry #001');
    expect(content).toContain('MentorConnect');
  });

  it('verifies prompt-history.md contains index entry #001', () => {
    const historyPath = path.resolve(__dirname, '../prompts/prompt-history.md');
    expect(fs.existsSync(historyPath)).toBe(true);
    const content = fs.readFileSync(historyPath, 'utf-8');
    expect(content).toContain('#001');
    expect(content).toContain('001-project-master-prompt.md');
  });
});
