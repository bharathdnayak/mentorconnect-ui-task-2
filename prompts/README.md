# MentorConnect — Prompt History & Evaluation Documentation

## Overview
This directory maintains a complete, persistent, and verifiable chronological record of every development prompt and specification provided to the AI coding assistant (Antigravity) during the conception, architecture, design, implementation, testing, and deployment of the **MentorConnect** system.

This documentation serves as proof of academic authenticity and engineering rigor for university evaluation, code review, and project inspection.

---

## Why Prompt History Is Maintained
1. **Academic Integrity & Transparency**: College evaluators and project guides can inspect the exact engineering instructions, architectural decisions, and requirement iterations.
2. **Traceability**: Every feature, schema design, security constraint, and API endpoint can be traced directly to its originating prompt and specification.
3. **Reproducibility**: Clear prompt logs allow other developers to understand the prompt engineering, problem decomposition, and evolution of the application.

---

## Directory Structure
```
prompts/
├── README.md               # This documentation and usage guide
├── prompt-history.md       # Chronological master index of all prompts
└── entries/                # Complete verbatim Markdown files for each prompt
    └── 001-project-master-prompt.md
```

---

## How Prompts Are Recorded
Each prompt entry follows a strict Markdown format:
- **Prompt ID**: Sequential 3-digit identifier (`001`, `002`, etc.)
- **Timestamp**: Date and time when the prompt was submitted.
- **Short Title**: Concise description of the milestone or request.
- **Objective**: Goal of the prompt.
- **Related Files / Modules**: Code files and directories impacted.
- **Status**: Completed / In Progress.
- **Exact Prompt Content**: Verbatim capture of the user request.

---

## How to Record Future Prompts
A helper script is provided in the repository root to automate the recording of subsequent prompts:

```bash
# Using npm script:
npm run prompt:record -- ./path/to/prompt-text.txt

# Or directly using Node.js:
node scripts/record-prompt.js ./path/to/prompt-text.txt "Title of the prompt" "Objective description"
```

The script:
1. Detects the latest sequential ID in `prompts/entries/`.
2. Generates the next entry file (e.g., `002-...md`).
3. Saves the full, unaltered prompt content.
4. Appends a new entry to `prompts/prompt-history.md`.
5. Validates inputs and prevents overwriting existing entries.

---

## How Evaluators Can Review the Development Process
1. Start with [`prompt-history.md`](./prompt-history.md) to view the chronological progression of development stages.
2. Click through to individual entries in `prompts/entries/` to see the full technical specifications given for each stage.
3. Compare the prompt criteria against the implemented codebase, test suite, and architectural documentation.
