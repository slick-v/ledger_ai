from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DATABASE_URL: str
    JWT_SECRET:str
    ADMIN_EMAILS: str = ""

    # Groq (OpenAI-compatible) — used for natural-language expense parsing.
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    CORS_ORIGINS: str = "http://localhost:5173,https://ledger-ai-rose.vercel.app"

    model_config = SettingsConfigDict(env_file=".env")


    @property
    def admin_email_list(self) -> list[str]:
        return [e.strip() for e in self.ADMIN_EMAILS.split(",") if e.strip()]
    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

settings = Settings()
