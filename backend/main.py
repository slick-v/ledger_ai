from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from config import settings
from db import test_connection, get_db
from models import User
from schemas import UserCreate, UserOut, Token
from security import hash_password, verify_password, create_access_token, get_current_user

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello from the expense tracker backend", "env": settings.ENVIRONMENT}

@app.get("/db-check")
def db_check():
    return {"db_result": test_connection()}

@app.post("/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/login", response_model=Token)
def login(payload: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user_id=user.id)
    return Token(access_token=token)

@app.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user