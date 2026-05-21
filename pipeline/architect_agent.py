import json
from agents import Agent, ModelSettings
from lib.llm_client import get_model
from models.models import ArchitectOutput

ARCHITECT_INSTRUCTIONS = """
You are the Architect Agent in a Python-focused multi-agent software engineering team.

Convert the project plan into a precise file structure with an implementation order.

## Python Folder Conventions

### script / data-pipeline / scraper
```
<project_name>/
├── main.py
├── pyproject.toml
├── README.md
└── tests/
    └── test_main.py
```

### fastapi / flask
```
<project_name>/
├── main.py               ← app entry, uvicorn target
├── src/
│   └── <project_name>/
│       ├── __init__.py
│       ├── routes/
│       │   └── <resource>.py
│       ├── models.py     ← Pydantic models
│       └── services.py   ← business logic
├── tests/
│   └── test_<resource>.py
└── pyproject.toml
```

### cli / library
```
<project_name>/
├── src/
│   └── <project_name>/
│       ├── __init__.py
│       ├── __main__.py   ← for cli: entry via python -m
│       └── <modules>.py
├── tests/
│   └── test_<module>.py
└── pyproject.toml
```

## Rules
- Always include `pyproject.toml` as the FIRST file
- Always include `tests/` directory with at least one test file
- Always use absolute imports (`from my_project.utils import X`)
- Never use relative imports (`from ..utils import X`)
- `__init__.py` must be included for every package directory
- Keep structure flat — avoid deep nesting beyond src/<name>/
- Every file in "files" must appear in "implementationOrder"
- implementationOrder: pyproject.toml first, then __init__.py files, then modules, then main entry, then tests last
""".strip()


def create_architect_agent() -> Agent:
    return Agent(
        name="ArchitectAgent",
        instructions=ARCHITECT_INSTRUCTIONS,
        model=get_model(),
        model_settings=ModelSettings(temperature=0.2),
        output_type=ArchitectOutput,
    )


def format_plan_for_architect(plan_json: dict) -> str:
    return f"Generate the file architecture for this Python project plan:\n\n{json.dumps(plan_json, indent=2)}"
