from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from app.database import get_db
from app import models, schemas, auth
from app.services import ai_service

router = APIRouter(prefix="/jobs", tags=["Job Roles & AI Assistant"])

# Local schemas for specific AI enhancements
class CoverLetterRequest(BaseModel):
    resume_id: int
    job_description: str

class InterviewQuestionsRequest(BaseModel):
    resume_id: int
    job_title: str

class LinkedInOptimizeRequest(BaseModel):
    resume_id: int

@router.get("/roles", response_model=List[schemas.JobRoleResponse])
def get_supported_roles(db: Session = Depends(get_db)):
    # Fetch roles from the DB
    db_roles = db.query(models.JobRole).all()
    
    # If no roles exist in DB yet, seed the default ones
    if not db_roles:
        defaults = [
            {"title": "Python Developer", "description": "Backend focus using Python, Django, Flask, FastAPI.", "required_skills": ai_service.DEFAULT_JOB_SKILLS["Python Developer"]},
            {"title": "Full Stack Developer", "description": "End-to-end development with React and Node.js.", "required_skills": ai_service.DEFAULT_JOB_SKILLS["Full Stack Developer"]},
            {"title": "Java Developer", "description": "Enterprise application developer focusing on Java and Spring Boot.", "required_skills": ai_service.DEFAULT_JOB_SKILLS["Java Developer"]},
            {"title": "Data Analyst", "description": "Data processing, querying, and visualization expert.", "required_skills": ai_service.DEFAULT_JOB_SKILLS["Data Analyst"]},
            {"title": "AI Engineer", "description": "Machine learning, neural networks, and prompt engineering.", "required_skills": ai_service.DEFAULT_JOB_SKILLS["AI Engineer"]}
        ]
        for item in defaults:
            db_role = models.JobRole(
                title=item["title"],
                description=item["description"],
                required_skills=item["required_skills"]
            )
            db.add(db_role)
        db.commit()
        db_roles = db.query(models.JobRole).all()
        
    return db_roles

@router.post("/skill-gap", response_model=schemas.SkillGapResponse)
def run_skill_gap_analysis(
    req: schemas.SkillGapRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Verify analysis belongs to user
    analysis = db.query(models.ResumeAnalysis).filter(
        models.ResumeAnalysis.id == req.analysis_id,
        models.ResumeAnalysis.user_id == current_user.id
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Resume analysis record not found")
        
    # Get resume
    resume = db.query(models.Resume).filter(models.Resume.id == analysis.resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Associated resume not found")

    # Get target role required skills
    role = db.query(models.JobRole).filter(models.JobRole.title == req.target_role).first()
    required_skills = role.required_skills if role else None
    
    # Run Skill Gap Analysis
    result = ai_service.analyze_skill_gap(
        parsed_json=resume.parsed_json,
        target_role=req.target_role,
        db_required_skills=required_skills
    )
    
    # Save SkillGap record
    db_skill_gap = models.SkillGap(
        analysis_id=analysis.id,
        target_role=req.target_role,
        current_skills=result["current_skills"],
        missing_skills=result["missing_skills"],
        suggested_skills=result["suggested_skills"],
        priority_order=result["priority_order"]
    )
    db.add(db_skill_gap)
    
    # Push notification about recommendations available
    notification = models.Notification(
        user_id=current_user.id,
        message=f"Skill gap analysis completed for target role: '{req.target_role}'",
        is_read=False,
        type="recommendation"
    )
    db.add(notification)
    db.commit()
    db.refresh(db_skill_gap)
    
    return db_skill_gap

@router.get("/recommendations/{analysis_id}", response_model=schemas.RecommendationResponse)
def get_recommendations(
    analysis_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Verify analysis belongs to user
    analysis = db.query(models.ResumeAnalysis).filter(
        models.ResumeAnalysis.id == analysis_id,
        models.ResumeAnalysis.user_id == current_user.id
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Resume analysis record not found")
        
    rec = db.query(models.Recommendation).filter(models.Recommendation.analysis_id == analysis_id).first()
    if not rec:
        # Pre-generate if it doesn't exist (e.g. for legacy migrations)
        resume = db.query(models.Resume).filter(models.Resume.id == analysis.resume_id).first()
        rec_data = ai_service.generate_recommendations_and_roadmap(resume.parsed_json)
        rec = models.Recommendation(
            analysis_id=analysis_id,
            recommended_roles=rec_data["recommended_roles"],
            learning_roadmap=rec_data["learning_roadmap"]
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)
        
    return rec

@router.post("/cover-letter")
def build_cover_letter(
    req: CoverLetterRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(models.Resume).filter(models.Resume.id == req.resume_id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    cover_letter = ai_service.generate_cover_letter(resume.parsed_json, req.job_description)
    return {"cover_letter": cover_letter}

@router.post("/interview-questions")
def build_interview_questions(
    req: InterviewQuestionsRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(models.Resume).filter(models.Resume.id == req.resume_id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    questions = ai_service.generate_interview_questions(resume.parsed_json, req.job_title)
    return {"questions": questions}

@router.post("/linkedin-optimize")
def build_linkedin_optimization(
    req: LinkedInOptimizeRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(models.Resume).filter(models.Resume.id == req.resume_id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    optimization = ai_service.optimize_linkedin(resume.parsed_json)
    return optimization
