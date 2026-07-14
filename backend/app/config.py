import os
from pathlib import Path
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

# Load the local .env file
env_path = Path(__file__).resolve().parent.parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()  # Fallback to current working directory

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./resume_analyzer.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "9a7c81d830bfe12e6c518b5b63c76f62b8a7c29e71e4d0d3c01c05d762eef62a")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    INITIAL_ADMIN_EMAIL: str = os.getenv("INITIAL_ADMIN_EMAIL", "admin@resumeai.com")
    INITIAL_ADMIN_PASSWORD: str = os.getenv("INITIAL_ADMIN_PASSWORD", "AdminSecurePass123!")

settings = Settings()
