from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.users import UserRead


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    display_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class TokenPayload(BaseModel):
    sub: str | None = None
    exp: datetime | None = None

    model_config = ConfigDict(extra="ignore")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
