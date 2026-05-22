import asyncio
import json
from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from api.job_store import Job, create_job, get_job
from api.schemas import GenerateRequest, GenerateResponse
from lib.orchestrator import run_pipeline

router = APIRouter()


async def _run_pipeline_job(job: Job) -> None:
    job.status = "running"

    async def on_event(event: str, data: dict[str, Any] | None = None) -> None:
        await job.queue.put({"event": event, "data": data or {}})

    try:
        project_dir = await run_pipeline(job.prompt, on_event=on_event)
        job.project_name = project_dir.name
        job.status = "done"
    except Exception as exc:
        job.status = "error"
        job.error = str(exc)
        await job.queue.put({"event": "error", "data": {"message": str(exc)}})
    finally:
        await job.queue.put(None)


@router.post("/generate", response_model=GenerateResponse)
async def start_generate(request: GenerateRequest) -> GenerateResponse:
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    job = create_job(request.prompt)
    asyncio.create_task(_run_pipeline_job(job))
    return GenerateResponse(jobId=job.id)


@router.get("/generate/{job_id}/stream")
async def stream_generate(job_id: str) -> StreamingResponse:
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator():
        try:
            while True:
                try:
                    item = await asyncio.wait_for(job.queue.get(), timeout=180.0)
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
                    continue

                if item is None:
                    break

                event_name = item["event"]
                data = json.dumps(item.get("data") or {})
                yield f"event: {event_name}\ndata: {data}\n\n"

                if event_name in ("done", "error"):
                    break
        except asyncio.CancelledError:
            pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
