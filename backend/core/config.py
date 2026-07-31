import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ALLOWED_ORIGINS: list = ["*"]

settings = Settings()
