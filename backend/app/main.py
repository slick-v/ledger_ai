from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import settings
from app.api.v1.router import api_router
from app.core.exceptions import global_exception_handler
from app.db.session import engine

import logging
import time
from fastapi import Request

import sentry_sdk

router = APIRouter()


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)


if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=0.1,
        send_default_pii=False,
    )


app = FastAPI(title="AI Expense Tracker API", version="1.0.0")
app.add_exception_handler(Exception, global_exception_handler)



app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root():
    return {"message": "AI Expense Tracker API", "env": settings.ENVIRONMENT}



@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000)
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({duration}ms)")
    return response