from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    email: Optional[str] = None
    is_admin: bool = False

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: str
    new_password: str

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    token: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}

# Resume Parsed JSON Schema
class ResumeParsedData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    education: List[Dict[str, Any]] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    file_type: str
    parsed_json: Optional[ResumeParsedData] = None
    created_at: datetime

    model_config = {"from_attributes": True}

# Analysis Schemas
class SuggestionsData(BaseModel):
    summary: Optional[str] = ""
    projects: Optional[str] = ""
    skills: Optional[str] = ""
    experience: Optional[str] = ""
    achievements: Optional[str] = ""
    keywords: Optional[str] = ""

class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_id: int
    user_id: int
    ats_score: int
    structure_score: int
    keyword_score: int
    formatting_score: int
    missing_skills: Optional[List[str]] = Field(default_factory=list)
    weak_sections: Optional[List[str]] = Field(default_factory=list)
    repeated_words: Optional[List[str]] = Field(default_factory=list)
    grammar_issues: Optional[List[Any]] = Field(default_factory=list)
    missing_keywords: Optional[List[str]] = Field(default_factory=list)
    suggestions: Optional[SuggestionsData] = None
    created_at: datetime

    model_config = {"from_attributes": True}

# ATS Score history
class ATSScoreResponse(BaseModel):
    id: int
    resume_id: int
    score: int
    structure_score: int
    keyword_score: int
    formatting_score: int
    readability_score: int
    created_at: datetime

    model_config = {"from_attributes": True}

class DashboardStatsResponse(BaseModel):
    has_resume: bool
    resume_id: Optional[int] = None
    ats_score: int
    structure_score: int
    keyword_score: int
    formatting_score: int
    readability_score: int
    weak_sections: List[str] = Field(default_factory=list)
    skills_count: int
    jobs_matched: int
    history: List[Dict[str, Any]] = Field(default_factory=list)

    model_config = {"from_attributes": True}

# Skill Gap Schemas
class SkillGapRequest(BaseModel):
    analysis_id: int
    target_role: str

class SkillGapResponse(BaseModel):
    id: int
    analysis_id: int
    target_role: str
    current_skills: List[str]
    missing_skills: List[str]
    suggested_skills: List[str]
    priority_order: Optional[List[str]] = Field(default_factory=list)
    created_at: datetime

    model_config = {"from_attributes": True}

# Job Recommendation & Learning Roadmap
class JobRecDetail(BaseModel):
    role: str
    confidence: float
    details: str

class LearningRoadmapDetail(BaseModel):
    skills_to_learn: List[str]
    suggested_projects: List[Dict[str, Any]]
    recommended_certs: List[str]
    practice_schedule: List[str]

class RecommendationResponse(BaseModel):
    id: int
    analysis_id: int
    recommended_roles: List[JobRecDetail]
    learning_roadmap: LearningRoadmapDetail
    created_at: datetime

    model_config = {"from_attributes": True}

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    message: str
    is_read: bool
    type: str
    created_at: datetime

    model_config = {"from_attributes": True}

# Job Role Schemas
class JobRoleBase(BaseModel):
    title: str
    description: Optional[str] = None
    required_skills: List[str]

class JobRoleCreate(JobRoleBase):
    pass

class JobRoleResponse(JobRoleBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}

# Admin Dashboard Analytics
class AdminDashboardStats(BaseModel):
    total_users: int
    total_resumes: int
    total_analyses: int
    recent_uploads: List[Dict[str, Any]]
    popular_roles: List[Dict[str, Any]]
