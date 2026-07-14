import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    analyses = relationship("ResumeAnalysis", back_populates="user", cascade="all, delete-orphan")
    ats_scores = relationship("ATSScore", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    file_type = Column(String, nullable=False)  # "pdf" or "docx"
    raw_text = Column(Text, nullable=True)
    parsed_json = Column(JSON, nullable=True)  # {name, email, phone, education, skills, projects, certifications, experience, languages}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    analyses = relationship("ResumeAnalysis", back_populates="resume", cascade="all, delete-orphan")
    ats_scores = relationship("ATSScore", back_populates="resume", cascade="all, delete-orphan")


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ats_score = Column(Integer, nullable=False)
    structure_score = Column(Integer, nullable=False)
    keyword_score = Column(Integer, nullable=False)
    formatting_score = Column(Integer, nullable=False)
    missing_skills = Column(JSON, nullable=True)       # List of strings
    weak_sections = Column(JSON, nullable=True)        # List of strings
    repeated_words = Column(JSON, nullable=True)       # List of strings
    grammar_issues = Column(JSON, nullable=True)       # List of strings/objects
    missing_keywords = Column(JSON, nullable=True)     # List of strings
    suggestions = Column(JSON, nullable=True)          # {summary: str, projects: str, skills: str, experience: str, achievements: str, keywords: str}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resume = relationship("Resume", back_populates="analyses")
    user = relationship("User", back_populates="analyses")
    skill_gaps = relationship("SkillGap", back_populates="analysis", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="analysis", cascade="all, delete-orphan")


class ATSScore(Base):
    __tablename__ = "ats_scores"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    structure_score = Column(Integer, nullable=False)
    keyword_score = Column(Integer, nullable=False)
    formatting_score = Column(Integer, nullable=False)
    readability_score = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resume = relationship("Resume", back_populates="ats_scores")
    user = relationship("User", back_populates="ats_scores")


class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("resume_analyses.id"), nullable=False)
    target_role = Column(String, nullable=False)
    current_skills = Column(JSON, nullable=False)     # List of strings
    missing_skills = Column(JSON, nullable=False)     # List of strings
    suggested_skills = Column(JSON, nullable=False)   # List of strings
    priority_order = Column(JSON, nullable=True)      # List of strings
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    analysis = relationship("ResumeAnalysis", back_populates="skill_gaps")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("resume_analyses.id"), nullable=False)
    recommended_roles = Column(JSON, nullable=False)   # List of {role, confidence, details}
    learning_roadmap = Column(JSON, nullable=False)    # {skills_to_learn, suggested_projects, recommended_certs, practice_schedule}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    analysis = relationship("ResumeAnalysis", back_populates="recommendations")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    type = Column(String, default="alert")              # "score_update", "recommendation", "alert"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class JobRole(Base):
    __tablename__ = "job_roles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    required_skills = Column(JSON, nullable=False)     # List of strings
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=True)           # e.g., "Frontend", "Backend", "Data Science", "Soft Skill"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
