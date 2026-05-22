import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from api.schemas import FileContent, FileNode, ProjectDetail, ProjectManifest, ProjectSummary

router = APIRouter()

PROJECT_ROOT = Path(__file__).parent.parent.parent
OUTPUT_DIR = PROJECT_ROOT / "generated-projects"


def _read_manifest(project_dir: Path) -> ProjectManifest | None:
    manifest_path = project_dir / ".manifest.json"
    if not manifest_path.exists():
        return None
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        return ProjectManifest(**data)
    except Exception:
        return None


@router.get("/projects", response_model=list[ProjectSummary])
async def list_projects() -> list[ProjectSummary]:
    if not OUTPUT_DIR.exists():
        return []

    projects: list[ProjectSummary] = []
    for entry in sorted(OUTPUT_DIR.iterdir()):
        if entry.is_dir():
            projects.append(ProjectSummary(name=entry.name, manifest=_read_manifest(entry)))

    return projects


@router.get("/projects/{name}", response_model=ProjectDetail)
async def get_project(name: str) -> ProjectDetail:
    project_dir = (OUTPUT_DIR / name).resolve()
    if not str(project_dir).startswith(str(OUTPUT_DIR.resolve())):
        raise HTTPException(status_code=400, detail="Invalid project name")
    if not project_dir.exists():
        raise HTTPException(status_code=404, detail="Project not found")

    manifest = _read_manifest(project_dir)
    if not manifest:
        raise HTTPException(status_code=404, detail="Project manifest not found")

    files = [
        FileNode(path=p, purpose="")
        for p in manifest.filesGenerated
    ]

    return ProjectDetail(name=name, manifest=manifest, files=files)


@router.get("/projects/{name}/files/{file_path:path}", response_model=FileContent)
async def get_file(name: str, file_path: str) -> FileContent:
    project_dir = (OUTPUT_DIR / name).resolve()
    if not str(project_dir).startswith(str(OUTPUT_DIR.resolve())):
        raise HTTPException(status_code=400, detail="Invalid project name")

    target = (project_dir / file_path).resolve()
    if not str(target).startswith(str(project_dir)):
        raise HTTPException(status_code=400, detail="Invalid file path")
    if not target.exists():
        raise HTTPException(status_code=404, detail="File not found")

    content = target.read_text(encoding="utf-8")
    return FileContent(path=file_path, content=content)
