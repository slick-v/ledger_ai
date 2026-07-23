from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    is_admin: bool = False
    email_notifications: bool = False

    class Config:
        from_attributes = True


class UserSettingsUpdate(BaseModel):
    email_notifications: bool


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"