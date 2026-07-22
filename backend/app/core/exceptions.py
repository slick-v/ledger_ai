from fastapi import Request
from fastapi.responses import JSONResponse
import traceback


async def global_exception_handler(request: Request, exc: Exception):
    print(f"[ERROR] {request.method} {request.url}")
    print(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."},
    )