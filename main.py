import asyncio
import sys
from pathlib import Path

from lib.orchestrator import run_pipeline


def _read_prompt() -> str:
    if len(sys.argv) > 1:
        return " ".join(sys.argv[1:])

    if not sys.stdin.isatty():
        return sys.stdin.read().strip()

    print("PyCodingAgent")
    print("─" * 40)
    print("Describe the Python project you want to build:")
    print()
    lines: list[str] = []
    try:
        while True:
            line = input()
            lines.append(line)
    except EOFError:
        pass

    return "\n".join(lines).strip()


async def _main() -> None:
    prompt = _read_prompt()
    if not prompt:
        print("Error: no prompt provided.", file=sys.stderr)
        sys.exit(1)

    print()
    print(f"Prompt: {prompt[:120]}{'...' if len(prompt) > 120 else ''}")
    print()

    try:
        project_dir: Path = await run_pipeline(prompt)
        print()
        print("=" * 40)
        print(f"Project ready at: {project_dir.resolve()}")
        print()
        print("Next steps:")
        print(f"  cd {project_dir}")
        print("  uv sync")
        print("  uv run python main.py")
    except Exception as exc:
        print(f"\nError: {exc}", file=sys.stderr)
        sys.exit(1)


def main() -> None:
    asyncio.run(_main())


if __name__ == "__main__":
    main()
