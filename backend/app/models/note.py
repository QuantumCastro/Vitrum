from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import JSON, Column, DateTime, String, Text, func
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.vault import Vault


class Note(SQLModel, table=True):
    __tablename__ = "notes"

    id: UUID = Field(default_factory=uuid4, primary_key=True, nullable=False)
    title: str = Field(default="", sa_column=Column(String, nullable=False))
    content: str = Field(default="", sa_column=Column(Text, nullable=False))
    links: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False, server_default="[]"),
        description="IDs de notas conectadas dentro del mismo vault",
    )
    vault_id: UUID = Field(foreign_key="vaults.id", nullable=False)
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

    # Relacion obligatoria al vault (no opcional para evitar problemas de resolucion)
    vault: "Vault" = Relationship(back_populates="notes")
