from pydantic import BaseModel


class GenerateRequest(BaseModel):
    prompt: str


class GenerateResponse(BaseModel):
    jobId: str


class FileNode(BaseModel):
    path: str
    purpose: str = ""


class ProjectManifest(BaseModel):
    projectName: str
    projectType: str
    pythonVersion: str
    features: list[str]
    filesGenerated: list[str]


class ProjectSummary(BaseModel):
    name: str
    manifest: ProjectManifest | None = None


class ProjectDetail(BaseModel):
    name: str
    manifest: ProjectManifest
    files: list[FileNode]


class FileContent(BaseModel):
    path: str
    content: str
