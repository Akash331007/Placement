from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Dict, Any

from app.database import get_db
from app import models, schemas, auth
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    # First user or matching ADMIN email gets admin rights
    is_admin = False
    count = db.query(models.User).count()
    if count == 0 or user_in.email == settings.INITIAL_ADMIN_EMAIL:
        is_admin = True

    hashed_pw = auth.get_password_hash(user_in.password)
    new_user = models.User(
        email=user_in.email,
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        is_active=True,
        is_verified=True,  # Auto verify for convenience in dev
        is_admin=is_admin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_admin": user.is_admin,
            "is_verified": user.is_verified
        }
    }

@router.post("/google", response_model=schemas.Token)
def google_signin(payload: Dict[str, Any], db: Session = Depends(get_db)):
    email = payload.get("email")
    name = payload.get("name")
    
    if not email:
        raise HTTPException(status_code=400, detail="Google authentication payload is missing an email")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        # Create Google User
        hashed_pw = auth.get_password_hash("GoogleAuthDummyPass123!")
        is_admin = (email == settings.INITIAL_ADMIN_EMAIL)
        user = models.User(
            email=email,
            hashed_password=hashed_pw,
            full_name=name,
            is_active=True,
            is_verified=True,
            is_admin=is_admin
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_admin": user.is_admin,
            "is_verified": user.is_verified
        }
    }

@router.post("/forgot-password")
def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    
    # In production, send email. For development, we return a mock reset token
    return {"message": "Password reset instructions sent", "reset_token": "mock-reset-token-123"}

@router.post("/reset-password")
def reset_password(req: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if req.token != "mock-reset-token-123":
        raise HTTPException(status_code=400, detail="Invalid reset token")
        
    user.hashed_password = auth.get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password reset successfully"}

@router.post("/verify-email")
def verify_email(req: schemas.VerifyEmailRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_verified = True
    db.commit()
    return {"message": "Email verified successfully"}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
