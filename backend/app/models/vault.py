from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, String, func
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.note import Note
    from app.models.user import User


class Vault(SQLModel, table=True):
    __tablename__ = "vaults"

    id: UUID = Field(default_factory=uuid4, primary_key=True, nullable=False)
    name: str = Field(sa_column=Column(String, nullable=False))
    theme: str = Field(default="violet", sa_column=Column(String, nullable=False))
    owner_id: UUID = Field(foreign_key="users.id", nullable=False)
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

    owner: "User" = Relationship(back_populates="vaults")
    notes: list["Note"] = Relationship(
        back_populates="vault", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
