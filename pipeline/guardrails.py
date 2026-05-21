"""
Input and output guardrails for the Python coding assistant pipeline.

- InputGuardrail  → runs on the Planner's input (before LLM call)
- OutputGuardrail → runs on the Coder's output (after LLM call)
"""

import re
from pydantic import BaseModel
from agents import (
    Agent,
    Runner,
    ModelSettings,
    InputGuardrail,
    OutputGuardrail,
    GuardrailFunctionOutput,
    RunContextWrapper,
)
from agents.run import TResponseInputItem
from lib.llm_client import get_model
from models.models import CoderOutput


# ── Shared result model ───────────────────────────────────────────────────────

class GuardrailResult(BaseModel):
    is_safe: bool
    reason: str


# ── Input Guardrail ───────────────────────────────────────────────────────────

_INPUT_CHECKER_INSTRUCTIONS = """
You are a safety checker for a Python-only code generation assistant.

Evaluate the user's prompt and decide if it is safe and appropriate to process.

Reject (is_safe: false) if the prompt:
- Requests code in a non-Python language (JavaScript, TypeScript, Go, Rust, Java, C++, Ruby, PHP, etc.)
- Requests a frontend/web UI (React, Next.js, Vue, HTML/CSS, mobile app, etc.)
- Is too vague to generate code from (e.g. "make something cool", "do stuff", "help me")
- Requests malicious, harmful, or dangerous code (malware, keyloggers, exploits, scrapers targeting private data, DoS tools)
- Is completely unrelated to software development (essays, recipes, general questions)

Allow (is_safe: true) if the prompt:
- Asks to build any Python project: scripts, APIs, CLIs, libraries, data pipelines, scrapers (for public data), etc.
- Is clear enough to determine what to build
- Does not request dangerous functionality

Return a brief reason explaining your decision.
""".strip()

_input_checker_agent = Agent(
    name="InputChecker",
    instructions=_INPUT_CHECKER_INSTRUCTIONS,
    model=get_model(),
    model_settings=ModelSettings(temperature=0.0),
    output_type=GuardrailResult,
)


async def input_guardrail_fn(
    ctx: RunContextWrapper,
    agent: Agent,
    input: str | list[TResponseInputItem],
) -> GuardrailFunctionOutput:
    prompt = input if isinstance(input, str) else str(input)
    result = await Runner.run(_input_checker_agent, prompt, context=ctx.context)
    check: GuardrailResult = result.final_output
    return GuardrailFunctionOutput(
        output_info=check,
        tripwire_triggered=not check.is_safe,
    )


input_guardrail = InputGuardrail(
    guardrail_function=input_guardrail_fn,
    name="PythonOnlyInputGuardrail",
)


# ── Output Guardrail ──────────────────────────────────────────────────────────

# Dangerous patterns to reject in generated code
_DANGEROUS_PATTERNS: list[tuple[str, str]] = [
    (r"\beval\s*\(", "eval() usage detected"),
    (r"\bexec\s*\(", "exec() usage detected"),
    (r"os\.system\s*\(", "os.system() usage detected"),
    (r"subprocess\.[^\n]*shell\s*=\s*True", "subprocess with shell=True detected"),
    (r"__import__\s*\(", "__import__() usage detected"),
]

_REQUIRED_PYPROJECT_SECTIONS = [
    ("[tool.hatch.build.targets.wheel]", "Missing [tool.hatch.build.targets.wheel] in pyproject.toml"),
    ("[tool.ruff]", "Missing [tool.ruff] in pyproject.toml"),
    ("[tool.mypy]", "Missing [tool.mypy] in pyproject.toml"),
]


async def output_guardrail_fn(
    ctx: RunContextWrapper,
    agent: Agent,
    output: CoderOutput,
) -> GuardrailFunctionOutput:
    violations: list[str] = []

    for generated_file in output.files:
        # Check for dangerous code patterns in .py files
        if generated_file.path.endswith(".py"):
            for pattern, message in _DANGEROUS_PATTERNS:
                if re.search(pattern, generated_file.content):
                    violations.append(f"{generated_file.path}: {message}")

        # Check pyproject.toml has required sections
        if generated_file.path == "pyproject.toml":
            for section, message in _REQUIRED_PYPROJECT_SECTIONS:
                if section not in generated_file.content:
                    violations.append(message)

    is_safe = len(violations) == 0
    reason = "All checks passed." if is_safe else " | ".join(violations)

    return GuardrailFunctionOutput(
        output_info=GuardrailResult(is_safe=is_safe, reason=reason),
        tripwire_triggered=not is_safe,
    )


output_guardrail = OutputGuardrail(
    guardrail_function=output_guardrail_fn,
    name="CodeSafetyOutputGuardrail",
)
