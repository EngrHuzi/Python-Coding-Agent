import asyncio
import uuid
from dataclasses import dataclass, field
from typing import Any, Literal

JobStatus = Literal["pending", "running", "done", "error"]


@dataclass
class Job:
    id: str
    prompt: str
    status: JobStatus = "pending"
    queue: asyncio.Queue[dict[str, Any] | None] = field(default_factory=asyncio.Queue)
    project_name: str | None = None
    error: str | None = None


_jobs: dict[str, Job] = {}


def create_job(prompt: str) -> Job:
    job_id = str(uuid.uuid4())
    job = Job(id=job_id, prompt=prompt)
    _jobs[job_id] = job
    return job


def get_job(job_id: str) -> Job | None:
    return _jobs.get(job_id)
