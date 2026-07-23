from fastapi import APIRouter

from app.api.v1.endpoints import auth, expense, income, dashboard,admin,health,budget,ai

api_router = APIRouter()
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(expense.router, prefix="/expenses", tags=["expenses"])
api_router.include_router(income.router, prefix="/income", tags=["income"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(budget.router, prefix="/budgets", tags=["budgets"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(health.router, tags=["health"])