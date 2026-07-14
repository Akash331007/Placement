from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.logging_config import setup_logging
import logging
from app.database import engine, Base, SessionLocal
from app import models
from app.config import settings
from app.routes import auth, resumes, analysis, jobs, notifications, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize logging for the application
    setup_logging()
    logger = logging.getLogger(__name__)
    # Create DB tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Seed initial Admin account
    db = SessionLocal()
    try:
        admin_email = settings.INITIAL_ADMIN_EMAIL
        admin_user = db.query(models.User).filter(models.User.email == admin_email).first()
        if not admin_user:
            from app.auth import get_password_hash
            hashed_password = get_password_hash(settings.INITIAL_ADMIN_PASSWORD)
            new_admin = models.User(
                email=admin_email,
                hashed_password=hashed_password,
                full_name="System Administrator",
                is_active=True,
                is_verified=True,
                is_admin=True
            )
            db.add(new_admin)
            db.commit()
            logger.info("Seeded system administrator: %s", admin_email)
    except Exception as e:
        logger.exception("Database startup seeding failed: %s", e)
    finally:
        db.close()
    yield

app = FastAPI(
    title="AI Resume Analyzer & ATS Score Checker API",
    description="Backend API powering resume parsers, ATS analyses, job matches, and custom roadmaps.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend clients (React/Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify front-end domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Resume Analyzer & ATS Score Checker API",
        "version": "1.0.0",
        "documentation": "/docs"
    }
