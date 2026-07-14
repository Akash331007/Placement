from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas, auth
from app.services import parser_service, ai_service

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload", response_model=schemas.ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    filename = file.filename
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ["pdf", "docx"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    # Read file bytes
    try:
        content = await file.read()
        raw_text = parser_service.extract_text(content, ext)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read or extract file text: {str(e)}")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Document text extraction yielded no content. Ensure the file contains text instead of scanned images.")

    # Parse resume details via AI (Gemini or Mock regex fallback)
    parsed_json = ai_service.parse_resume(raw_text)

    # Save resume record to database
    db_resume = models.Resume(
        user_id=current_user.id,
        filename=filename,
        file_type=ext,
        raw_text=raw_text,
        parsed_json=parsed_json
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    # Perform immediate analysis, ATS scoring, and recommendations for top-tier UX
    analysis_results = ai_service.analyze_resume(parsed_json, raw_text)
    
    db_analysis = models.ResumeAnalysis(
        resume_id=db_resume.id,
        user_id=current_user.id,
        ats_score=analysis_results["ats_score"],
        structure_score=analysis_results["structure_score"],
        keyword_score=analysis_results["keyword_score"],
        formatting_score=analysis_results["formatting_score"],
        missing_skills=analysis_results["missing_skills"],
        weak_sections=analysis_results["weak_sections"],
        repeated_words=analysis_results["repeated_words"],
        grammar_issues=analysis_results["grammar_issues"],
        missing_keywords=analysis_results["missing_keywords"],
        suggestions=analysis_results["suggestions"]
    )
    db.add(db_analysis)
    # Ensure the analysis gets a primary key before referencing it in related records
    db.flush()
    
    # Track ATS Score historical record
    db_score = models.ATSScore(
        resume_id=db_resume.id,
        user_id=current_user.id,
        score=analysis_results["ats_score"],
        structure_score=analysis_results["structure_score"],
        keyword_score=analysis_results["keyword_score"],
        formatting_score=analysis_results["formatting_score"],
        readability_score=analysis_results["readability_score"]
    )
    db.add(db_score)
    
    # Pre-generate job recommendations and learning roadmaps
    rec_results = ai_service.generate_recommendations_and_roadmap(parsed_json)
    db_rec = models.Recommendation(
        analysis_id=db_analysis.id,
        recommended_roles=rec_results["recommended_roles"],
        learning_roadmap=rec_results["learning_roadmap"]
    )
    db.add(db_rec)
    
    # Push immediate push-style notification
    notification = models.Notification(
        user_id=current_user.id,
        message=f"Resume '{filename}' analysis complete! ATS score: {analysis_results['ats_score']}/100",
        is_read=False,
        type="score_update"
    )
    db.add(notification)
    
    db.commit()

    return db_resume

@router.get("", response_model=List[schemas.ResumeResponse])
def get_resumes(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.created_at.desc()).all()

@router.get("/{resume_id}", response_model=schemas.ResumeResponse)
def get_resume(
    resume_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}
