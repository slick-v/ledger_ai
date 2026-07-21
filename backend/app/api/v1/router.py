from fastapi import APIRouter

from app.api.v1.endpoints import auth, expense, income, dashboard

api_router = APIRouter()
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(expense.router, prefix="/expenses", tags=["expenses"])
api_router.include_router(income.router, prefix="/income", tags=["income"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])