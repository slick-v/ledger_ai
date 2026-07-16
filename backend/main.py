from fastapi import FastAPI
from config import settings

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello from the expense tracker backend", "env": settings.ENVIRONMENT}