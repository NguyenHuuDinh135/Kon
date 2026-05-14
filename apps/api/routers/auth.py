import os
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address

from db_core import get_db
from db_core.models import User
from auth import (
    create_access_token,
    get_current_user,
    require_admin,
    get_password_hash,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from shared import UserCreate, User as SharedUser, Token

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False

    if not verify_password(password, user.hashed_password):
        return False

    # On successful login: reset failed attempts
    user.failed_attempts = 0
    user.locked_until = None
    db.commit()
    return user


@router.post("/register", response_model=SharedUser)
@limiter.limit("5/minute")
def register_user(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_pwd = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pwd,
        role="client",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
@limiter.limit(os.environ.get("LOGIN_RATE_LIMIT", "100/minute"))
async def login_for_access_token(
    request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=SharedUser)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
