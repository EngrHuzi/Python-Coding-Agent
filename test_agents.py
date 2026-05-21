import asyncio
import json
from dotenv import load_dotenv
load_dotenv()

from agents import Runner
from lib.llm_client import configure_sdk, get_model
from pipeline.planner_agent import create_planner_agent
from pipeline.architect_agent import create_architect_agent, format_plan_for_architect
from pipeline.coder_agent import create_coder_agent, format_input_for_coder


async def test(prompt: str):
    configure_sdk()

    print("=" * 60)
    print(f"PROMPT: {prompt}")
    print("=" * 60)

    # ── Planner ───────────────────────────────────────────────────
    print("\n[1] PLANNER AGENT")
    print("-" * 40)
    result = await Runner.run(create_planner_agent(), prompt)
    plan = result.final_output
    print(json.dumps(plan.model_dump(), indent=2))

    # ── Architect ─────────────────────────────────────────────────
    print("\n[2] ARCHITECT AGENT")
    print("-" * 40)
    result = await Runner.run(
        create_architect_agent(),
        format_plan_for_architect(plan.model_dump())
    )
    arch = result.final_output
    print(json.dumps(arch.model_dump(), indent=2))

    # ── Coder ─────────────────────────────────────────────────────
    print("\n[3] CODER AGENT")
    print("-" * 40)
    result = await Runner.run(
        create_coder_agent(),
        format_input_for_coder(plan.model_dump(), arch.model_dump())
    )
    code = result.final_output
    for f in code.files:
        print(f"\n--- {f.path} ---")
        print(f.content[:300] + ("..." if len(f.content) > 300 else ""))

    print("\n" + "=" * 60)
    print(f"DONE — {len(code.files)} files generated")
    print("=" * 60)


asyncio.run(test("print hello world"))
