from datetime import datetime
from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=60)
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator('username', 'full_name')
    @classmethod
    def no_espacios_vacios(cls, value: str) -> str:
        if not value.strip():
            raise ValueError('El campo no puede estar vacío')
        return value.strip()


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
