# PyCodingAgent

An AI-powered assistant that converts natural language prompts into complete, production-ready Python projects using a pipeline of specialized agents.

---

## How It Works

```
User Prompt
     ↓
InputGuardrail        ← blocks non-Python, vague, or dangerous prompts
     ↓
Planner Agent         ← understands requirements → structured JSON plan
     ↓
Architect Agent       ← designs file structure + implementation order
     ↓
Coder Agent           ← generates complete Python source code
     ↓
OutputGuardrail       ← rejects dangerous patterns + validates pyproject.toml
     ↓
generated-projects/<name>/
```

---

## Example

**Prompt:**
```
Build a FastAPI REST API for a todo list with add, complete, and delete endpoints
```

**Output:** A complete Python project in `generated-projects/todo_api/` with:
- `pyproject.toml` — with ruff, mypy, pytest, hatchling config
- `main.py` — FastAPI app entry point
- `src/todo_api/routes/todos.py` — typed route handlers
- `src/todo_api/models.py` — Pydantic models
- `src/todo_api/services.py` — business logic
- `tests/test_todos.py` — pytest test cases
- `README.md` — with `uv sync` + `uv run` instructions

---

## Supported Project Types

| Type | Description |
|---|---|
| `script` | Single-file Python script |
| `fastapi` | Async REST API with FastAPI + Pydantic |
| `flask` | Lightweight web API or app |
| `django` | Full-stack web application |
| `cli` | Command-line tool with typer or argparse |
| `library` | Reusable Python package |
| `data-pipeline` | ETL or data processing pipeline |
| `scraper` | Web scraper with httpx / BeautifulSoup |

---

## Tech Stack

### AI Pipeline
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-python) — agent orchestration
- [Gemini API](https://ai.google.dev/) — LLM via OpenAI-compatible endpoint
- [OpenAI API](https://platform.openai.com/) — tracing only

### Generated Project Stack
- Python 3.12+
- [Pydantic v2](https://docs.pydantic.dev/) — data models & validation
- [FastAPI](https://fastapi.tiangolo.com/) / [Flask](https://flask.palletsprojects.com/) / [Django](https://www.djangoproject.com/)
- [httpx](https://www.python-httpx.org/) — async HTTP
- [pytest](https://pytest.org/) — testing
- [ruff](https://docs.astral.sh/ruff/) — linting + formatting
- [mypy](https://mypy.readthedocs.io/) — type checking
- [uv](https://docs.astral.sh/uv/) — package manager

---

## Project Structure

```
coding-assistant/
│
├── pipeline/
│   ├── planner_agent.py       # Analyzes prompt → structured plan
│   ├── architect_agent.py     # Plan → file structure
│   ├── coder_agent.py         # Architecture → source code
│   └── guardrails.py          # Input + output safety checks
│
├── lib/
│   ├── llm_client.py          # Gemini client configuration
│   └── orchestrator.py        # Chains agents, writes files
│
├── models/
│   └── models.py              # Pydantic models (PlannerOutput, etc.)
│
├── generated-projects/        # All generated projects land here
│
├── main.py                    # CLI entry point
├── test_agents.py             # Agent output testing (no file writes)
├── pyproject.toml
└── .env                       # API keys (not committed)
```

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd pycodingagent
uv sync
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
MODEL_NAME=gemini-2.0-flash-lite
OPENAI_API_KEY=your_openai_api_key_here   # for tracing only
```

Get your Gemini API key at [aistudio.google.com](https://aistudio.google.com/apikey).

### 3. Run

```bash
uv run python main.py "Build a CLI tool that converts CSV files to JSON"
```

Or using the installed CLI command:

```bash
pycodingagent "Build a CLI tool that converts CSV files to JSON"
```

Or interactively:

```bash
uv run python main.py
# Type your prompt and press Ctrl+D (or Ctrl+Z on Windows)
```

---

## Guardrails

### Input Guardrail (on Planner)
Runs before the pipeline starts. Blocks:
- Non-Python requests (`"build a React app"` → rejected)
- Vague prompts (`"make something cool"` → rejected)
- Dangerous/malicious requests (malware, exploits → rejected)

### Output Guardrail (on Coder)
Runs after code is generated. Rejects if any file contains:
- `eval()`, `exec()`, `os.system()`, `subprocess` with `shell=True`
- Missing `[tool.hatch.build.targets.wheel]` in `pyproject.toml`
- Missing `[tool.ruff]` or `[tool.mypy]` in `pyproject.toml`

---

## Generated Code Standards

Every generated project follows the [python-code-style](https://github.com/openai/openai-agents-python) standard:

- **Type annotations** on every function and method
- **Google-style docstrings** on all public APIs
- **120 character** line length
- **Absolute imports** only (`from my_project.utils import X`)
- **SCREAMING_SNAKE_CASE** constants, **PascalCase** classes, **snake_case** functions
- **ruff** for linting + formatting (replaces flake8, black, isort)
- **mypy strict** mode enabled
- **pytest** with at least 2–3 test cases per module

---

## Development

```bash
# Test agents without writing files
uv run python test_agents.py

# Run the full pipeline
uv run python main.py "your prompt here"

# Lint
uv run ruff check .

# Type check
uv run mypy .

# Tests
uv run pytest
```

---

## Tracing

Agent runs are traced via OpenAI's tracing platform. View spans, token usage, and timing at:

**[platform.openai.com/traces](https://platform.openai.com/traces)**

Requires `OPENAI_API_KEY` in your `.env`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Gemini API key for all agents |
| `MODEL_NAME` | No | Model name (default: `gemini-3.1-flash-lite`) |
| `OPENAI_API_KEY` | No | OpenAI key for tracing only |

---

## License

MIT
