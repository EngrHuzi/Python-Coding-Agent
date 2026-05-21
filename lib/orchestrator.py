import asyncio
import json
import time
from pathlib import Path

import aiofiles
from agents import Runner

from agents import InputGuardrailTripwireTriggered, OutputGuardrailTripwireTriggered
from pipeline.planner_agent import create_planner_agent
from pipeline.architect_agent import create_architect_agent, format_plan_for_architect
from pipeline.coder_agent import create_coder_agent, format_input_for_coder
from models.models import PlannerOutput, ArchitectOutput, CoderOutput
from lib.llm_client import configure_sdk

OUTPUT_DIR = Path("generated-projects")
MAX_RETRIES = 2


def _log(step: str, message: str) -> None:
    print(f"[{step}] {message}")


async def _run_agent_with_retry(agent, prompt: str, step: str, retries: int = MAX_RETRIES):
    last_error: Exception | None = None
    for attempt in range(1, retries + 2):
        try:
            t0 = time.perf_counter()
            result = await Runner.run(agent, prompt)
            elapsed = time.perf_counter() - t0
            _log(step, f"Completed in {elapsed:.1f}s")
            return result.final_output
        except InputGuardrailTripwireTriggered as exc:
            reason = exc.guardrail_result.output.output_info.reason
            raise ValueError(f"Input blocked by guardrail: {reason}") from exc
        except OutputGuardrailTripwireTriggered as exc:
            reason = exc.guardrail_result.output.output_info.reason
            raise ValueError(f"Output blocked by guardrail: {reason}") from exc
        except Exception as exc:
            last_error = exc
            _log(step, f"Attempt {attempt} failed: {exc}")
            if attempt <= retries:
                await asyncio.sleep(2 ** attempt)
    raise RuntimeError(f"{step} failed after {retries + 1} attempts") from last_error


async def _write_files(project_dir: Path, coder_output: CoderOutput) -> list[str]:
    written: list[str] = []
    for file_spec in coder_output.files:
        target = (project_dir / file_spec.path).resolve()
        if not str(target).startswith(str(project_dir.resolve())):
            _log("Writer", f"Skipping unsafe path: {file_spec.path}")
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        async with aiofiles.open(target, "w", encoding="utf-8") as fh:
            await fh.write(file_spec.content)
        written.append(file_spec.path)
        _log("Writer", f"  wrote {file_spec.path}")
    return written


async def run_pipeline(user_prompt: str) -> Path:
    configure_sdk()

    # ── Planner ───────────────────────────────────────────────────────────────
    _log("Planner", "Analyzing requirements...")
    plan: PlannerOutput = await _run_agent_with_retry(
        create_planner_agent(), user_prompt, "Planner"
    )
    _log("Planner", f"Project: {plan.projectName} ({plan.projectType}, Python {plan.pythonVersion})")
    _log("Planner", f"Features: {', '.join(plan.features)}")

    # ── Architect ─────────────────────────────────────────────────────────────
    _log("Architect", "Designing file structure...")
    architecture: ArchitectOutput = await _run_agent_with_retry(
        create_architect_agent(),
        format_plan_for_architect(plan.model_dump()),
        "Architect",
    )
    _log("Architect", f"Files to generate: {len(architecture.files)}")
    for f in architecture.files:
        _log("Architect", f"  {f.path} — {f.purpose}")

    # ── Coder ─────────────────────────────────────────────────────────────────
    _log("Coder", "Generating source code...")
    code: CoderOutput = await _run_agent_with_retry(
        create_coder_agent(),
        format_input_for_coder(plan.model_dump(), architecture.model_dump()),
        "Coder",
    )
    _log("Coder", f"Generated {len(code.files)} files")

    # ── Write to disk ─────────────────────────────────────────────────────────
    project_dir = OUTPUT_DIR / plan.projectName
    project_dir.mkdir(parents=True, exist_ok=True)
    written = await _write_files(project_dir, code)

    _log("Done", f"Project written to: {project_dir}")
    _log("Done", f"  {len(written)} files created")

    manifest = {
        "projectName": plan.projectName,
        "projectType": plan.projectType,
        "pythonVersion": plan.pythonVersion,
        "features": plan.features,
        "filesGenerated": written,
    }
    async with aiofiles.open(project_dir / ".manifest.json", "w") as fh:
        await fh.write(json.dumps(manifest, indent=2))

    return project_dir
