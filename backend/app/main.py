from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router
from app.core.exceptions import global_exception_handler


import logging
import time
from fastapi import Request

app = FastAPI(title="AI Expense Tracker API", version="1.0.0")
app.add_exception_handler(Exception, global_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://ledger-ai-rose.vercel.app",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root():
    return {"message": "AI Expense Tracker API", "env": settings.ENVIRONMENT}