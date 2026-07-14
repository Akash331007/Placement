# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/analysis", tags=["Analysis"])

@router.get("/latest", response_model=schemas.ResumeAnalysisResponse)
def get_latest_analysis(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(models.ResumeAnalysis).filter(models.ResumeAnalysis.user_id == current_user.id).order_by(models.ResumeAnalysis.created_at.desc()).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="No resume analysis found. Please upload a resume first.")
    return analysis

@router.get("/resume/{resume_id}", response_model=schemas.ResumeAnalysisResponse)
def get_analysis_by_resume(
    resume_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    analysis = db.query(models.ResumeAnalysis).filter(models.ResumeAnalysis.resume_id == resume_id).order_by(models.ResumeAnalysis.created_at.desc()).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found for this resume")
    return analysis

@router.get("/history/{resume_id}", response_model=List[schemas.ATSScoreResponse])
def get_ats_history(
    resume_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    scores = db.query(models.ATSScore).filter(models.ATSScore.resume_id == resume_id).order_by(models.ATSScore.created_at.asc()).all()
    return scores

@router.get("/all", response_model=List[schemas.ResumeAnalysisResponse])
def get_all_analyses(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.ResumeAnalysis).filter(models.ResumeAnalysis.user_id == current_user.id).order_by(models.ResumeAnalysis.created_at.desc()).all()

@router.get("/dashboard-stats", response_model=schemas.DashboardStatsResponse)
def get_dashboard_stats(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    latest_analysis = db.query(models.ResumeAnalysis).filter(models.ResumeAnalysis.user_id == current_user.id).order_by(models.ResumeAnalysis.created_at.desc()).first()
    if not latest_analysis:
        return {
            "has_resume": False,
            "resume_id": None,
            "ats_score": 0,
            "structure_score": 0,
            "keyword_score": 0,
            "formatting_score": 0,
            "readability_score": 0,
            "weak_sections": [],
            "skills_count": 0,
            "jobs_matched": 0,
            "history": []
        }
        
    resume = db.query(models.Resume).filter(models.Resume.id == latest_analysis.resume_id, models.Resume.user_id == current_user.id).first()
    skills_count = len(resume.parsed_json.get("skills", [])) if resume and resume.parsed_json else 0
    
    # Get score history for the current resume and user
    history_records = db.query(models.ATSScore).filter(
        models.ATSScore.user_id == current_user.id,
        models.ATSScore.resume_id == latest_analysis.resume_id
    ).order_by(models.ATSScore.created_at.desc()).limit(10).all()
    history = [{"date": h.created_at.strftime("%b %d"), "score": h.score} for h in history_records[::-1]]
    
    recs = db.query(models.Recommendation).filter(models.Recommendation.analysis_id == latest_analysis.id).first()
    jobs_matched = len(recs.recommended_roles) if recs and recs.recommended_roles else 0
    readability = history_records[0].readability_score if history_records else latest_analysis.formatting_score

    return {
        "has_resume": True,
        "resume_id": latest_analysis.resume_id,
        "ats_score": latest_analysis.ats_score,
        "structure_score": latest_analysis.structure_score,
        "keyword_score": latest_analysis.keyword_score,
        "formatting_score": latest_analysis.formatting_score,
        "readability_score": readability,
        "weak_sections": latest_analysis.weak_sections or [],
        "skills_count": skills_count,
        "jobs_matched": jobs_matched,
        "history": history
    }
