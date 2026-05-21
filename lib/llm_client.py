import os
from openai import AsyncOpenAI
from agents.models.openai_chatcompletions import OpenAIChatCompletionsModel
from dotenv import load_dotenv

load_dotenv()

_client: AsyncOpenAI | None = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise EnvironmentError("GEMINI_API_KEY environment variable is not set.")
        _client = AsyncOpenAI(
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            api_key=api_key,
        )
    return _client


def get_model() -> OpenAIChatCompletionsModel:
    model_name = os.environ.get("MODEL_NAME", "gemini-3.1-flash-lite")
    return OpenAIChatCompletionsModel(
        model=model_name,
        openai_client=get_client(),
    )


def configure_sdk() -> None:
    # Tracing is enabled by default — the SDK uses OPENAI_API_KEY automatically.
    # Traces are visible at: https://platform.openai.com/traces
    pass
