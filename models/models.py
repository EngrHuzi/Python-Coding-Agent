from pydantic import BaseModel, Field
from typing import Literal


class PlannerOutput(BaseModel):
    projectType: Literal["script", "fastapi", "flask", "django", "cli", "library", "data-pipeline", "scraper"]
    projectName: str = Field(description="snake_case project name, e.g. my_project")
    pythonVersion: str = Field(default="3.12", description="Minimum Python version, e.g. 3.12")
    description: str
    features: list[str]
    modules: list[str] = Field(description="Python module names to create inside the package")
    entrypoint: str = Field(description="Main entry file, e.g. main.py or src/my_project/__main__.py")
    dependencies: list[str] = Field(description="pip package names required at runtime")
    devDependencies: list[str] = Field(description="pip packages for development: pytest, ruff, mypy, etc.")


class FileSpec(BaseModel):
    path: str = Field(description="Relative file path from project root, e.g. src/my_project/main.py")
    purpose: str = Field(description="One-sentence description of what this file does")
    dependencies: list[str] = Field(
        default_factory=list,
        description="Other project files this file imports from",
    )


class ArchitectOutput(BaseModel):
    projectName: str
    implementationOrder: list[str] = Field(
        description="File paths in the order they should be generated, foundational first"
    )
    files: list[FileSpec]


class GeneratedFile(BaseModel):
    path: str
    content: str


class CoderOutput(BaseModel):
    files: list[GeneratedFile]
