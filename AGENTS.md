# AGENTS.md

# Multi-Agent Coding Assistant

An AI-powered Python code assistant that converts natural language prompts into complete, production-ready Python projects using multiple specialized AI agents.

---

# Project Goal

The system behaves like a small AI software engineering team.

Example:

User Prompt:

```txt
Build a CLI tool that converts CSV files to JSON.
```

The system automatically:
- Understands requirements
- Plans the application
- Designs architecture
- Creates project files
- Generates production-ready code
- Returns a runnable project

---

# Tech Stack

## Generated Project Stack
- Python 3.12+
- FastAPI / Flask / Django (API projects)
- Pydantic v2 (data models & validation)
- httpx (async HTTP)
- typer / argparse (CLI projects)
- pytest (testing)
- ruff (linting + formatting)
- mypy (type checking)

## AI Stack
- OpenAI Agents SDK (Python)
- Gemini API (via OpenAI-compatible endpoint)
- OpenAI API (tracing only)

## Package Manager
- uv

---

# System Architecture

```txt
User Prompt
     ↓
Planner Agent
     ↓
Architect Agent
     ↓
Coder Agent
     ↓
Generated Project Files
```

---

# Agent Responsibilities

# 1. Planner Agent

## Purpose
Analyzes the user's request and creates a structured software plan.

## Responsibilities
- Understand user intent
- Extract features
- Identify project type
- Create implementation strategy
- Define requirements

## Input
Natural language prompt.

## Output
Structured JSON plan.

## Example Output

```json
{
  "projectType": "web-app",
  "framework": "nextjs",
  "features": [
    "addition",
    "subtraction",
    "multiplication",
    "division"
  ],
  "pages": ["Home"],
  "components": ["Calculator"],
  "stateManagement": "useState"
}
```

## Planner Rules
- Keep architecture simple
- Ask for clarification if requirements are ambiguous
- Prefer scalable patterns
- Return deterministic JSON
- Avoid unnecessary complexity

---

# 2. Architect Agent

## Purpose
Converts the project plan into engineering tasks and file structures.

## Responsibilities
- Define folder structure
- Decide file responsibilities
- Generate implementation order
- Organize components
- Create engineering roadmap

## Input
Planner output JSON.

## Output
Project architecture JSON.

## Example Output

```json
{
  "files": [
    {
      "path": "app/page.tsx",
      "purpose": "Main page"
    },
    {
      "path": "components/calculator.tsx",
      "purpose": "Calculator UI"
    }
  ]
}
```

## Architect Rules
- Use modular architecture
- Keep folders clean
- Separate UI and logic
- Avoid deep nesting
- Prefer reusable components
- Ensure imports remain manageable

---

# 3. Coder Agent

## Purpose
Generates complete production-ready source code.

## Responsibilities
- Create files
- Write code
- Generate imports
- Handle TypeScript types
- Create responsive UI
- Ensure syntax correctness

## Input
Architecture JSON.

## Output
Generated source code files.

## Coder Rules
- Generate complete files only
- Never leave TODO placeholders
- Use strict TypeScript
- Follow ESLint rules
- Avoid unused imports
- Use async/await
- Prefer functional components
- Add accessibility support
- Ensure responsive UI
- Use proper error handling

---

# Optional Future Agents

## Reviewer Agent
Reviews generated code quality.

## Debugger Agent
Fixes build/runtime issues automatically.

## Test Generator Agent
Creates unit and integration tests.

## DevOps Agent
Creates Docker, CI/CD, deployment configs.

---

# Recommended Folder Structure

```txt
project-root/
│
├── app/
│   ├── api/
│   ├── globals.css
│   └── page.tsx
│
├── components/
│
├── agents/
│   ├── planner-agent.ts
│   ├── architect-agent.ts
│   └── coder-agent.ts
│
├── lib/
│   ├── groq.ts
│   ├── orchestrator.ts
│   └── utils.ts
│
├── types/
│
├── utils/
│
├── generated-projects/
│
├── public/
│
├── styles/
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

# Backend Architecture

## API Route Flow

```txt
POST /api/generate
        ↓
Orchestrator
        ↓
Planner Agent
        ↓
Architect Agent
        ↓
Coder Agent
        ↓
Generated Files
```

---

# Orchestrator Responsibilities

The orchestrator coordinates all agents.

## Responsibilities
- Execute agents sequentially
- Pass outputs between agents
- Handle retries
- Validate responses
- Handle failures
- Stream progress updates

## Example Flow

```ts
const plan = await plannerAgent(prompt);

const architecture = await architectAgent(plan);

const code = await coderAgent(architecture);
```

---

# LLM Configuration

## Model
Use Qwen 3 via Groq Cloud.

## Recommended Settings

### Planner Agent
```txt
temperature: 0.2
```

### Architect Agent
```txt
temperature: 0.2
```

### Coder Agent
```txt
temperature: 0.1
```

---

# Prompt Engineering Rules

## Always Include
- Clear role definition
- File context
- Coding standards
- Output format instructions

## Never
- Allow vague outputs
- Generate incomplete files
- Generate placeholder code

---

# Frontend Rules

## UI Standards
- Modern clean design
- Mobile responsive
- Accessible components
- Consistent spacing
- Proper typography

## Component Standards
- Single responsibility
- Small reusable components
- Typed props
- Avoid prop drilling

## Styling
- TailwindCSS only
- Avoid inline styles
- Use utility-first styling

---

# Backend Rules

## API Standards
- Validate input
- Return typed responses
- Handle errors gracefully
- Use proper HTTP status codes

## Security Rules
- Never expose API keys
- Sanitize generated paths
- Prevent path traversal
- Restrict file writing
- Validate filenames

---

# File Generation Rules

## Required Behaviors
- Create directories recursively
- Ensure imports resolve
- Avoid duplicate files
- Validate generated syntax

## Forbidden Behaviors
- Overwrite system files
- Execute arbitrary shell commands
- Access restricted directories

---

# Error Handling

## Must Handle
- Invalid JSON from LLMs
- API timeouts
- Missing environment variables
- Syntax errors
- File write failures

## Retry Strategy
- Retry transient failures
- Limit retries to avoid loops
- Log all failures

---

# Logging Rules

## Log
- User prompts
- Agent execution time
- Errors
- Generated files

## Never Log
- API keys
- Secrets
- Sensitive user data

---

# Testing Instructions

# Unit Tests

Test:
- Utility functions
- JSON validation
- File generators
- Agent outputs

## Integration Tests

Test:
- Agent orchestration
- API routes
- Multi-file generation

## E2E Tests

Test:
- Full project generation
- Download flow
- Generated app execution

---

# Required Commands

## Install Dependencies

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Lint

```bash
pnpm lint
```

## Type Check

```bash
pnpm type-check
```

## Test

```bash
pnpm test
```

---

# CI/CD Rules

Before merging:
- Build must pass
- Lint must pass
- Tests must pass
- Type checking must pass

---

# PR Instructions

## Branch Naming

```txt
feature/<feature-name>
fix/<bug-name>
```

## PR Title Format

```txt
[multi-agent-coding-assistant] <Title>
```

## Before Opening PR
- Run lint
- Run tests
- Run build
- Remove debug logs
- Validate generated projects

---

# Performance Guidelines

## Optimization Goals
- Reduce LLM calls
- Cache repeated prompts
- Stream long responses
- Parallelize independent tasks

## Future Scaling
- Redis caching
- Queue workers
- S3 project storage
- PostgreSQL database

---

# Deployment Guidelines

## Recommended Hosting
- Vercel

## Alternatives
- Railway
- Render
- AWS
- Fly.io
- DigitalOcean

---

# Environment Variables

```env
GEMINI_API_KEY=
MODEL_NAME=gemini-2.0-flash-lite
OPENAI_API_KEY=        # for tracing only (platform.openai.com/traces)
```

---

# Docker Support

## Dockerfile Example

```Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install -g pnpm

RUN pnpm install

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

---

# Future Improvements

## Planned Features
- Live code preview
- GitHub repository export
- Docker project generation
- AI code review
- Real-time collaboration
- Voice prompts
- Multi-language generation
- Streaming generation UI

---

# Engineering Principles

## Priorities
1. Simplicity
2. Readability
3. Maintainability
4. Scalability
5. Deterministic outputs

---

# Definition of Done

A generated project is complete when:

- Dependencies install successfully
- Project builds successfully
- Project runs locally
- No TypeScript errors exist
- No ESLint errors exist
- Core requested features work
- File structure is clean
- Imports resolve correctly
- UI is responsive

---

# Final Notes

This project should behave like a real AI engineering team:
- Planner thinks
- Architect designs
- Coder implements

The system should prioritize:
- Reliability
- Deterministic outputs
- Clean architecture
- Production-ready code
- Developer experience