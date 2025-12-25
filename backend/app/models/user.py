from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, String, func
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.vault import Vault


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True, nullable=False)
    email: str = Field(
        sa_column=Column(String, unique=True, index=True, nullable=False),
        description="Correo unico del usuario",
    )
    hashed_password: str = Field(sa_column=Column(String, nullable=False))
    display_name: str | None = Field(
        default=None, sa_column=Column(String, nullable=True, comment="Nombre visible del usuario")
    )
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        )
    )

    vaults: list["Vault"] = Relationship(back_populates="owner")
