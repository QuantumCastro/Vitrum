from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.notes import NoteRead


class VaultCreate(BaseModel):
    name: str
    theme: str | None = None


class VaultUpdate(BaseModel):
    name: str | None = None
    theme: str | None = None


class VaultRead(BaseModel):
    id: UUID
    name: str
    theme: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VaultWithNotes(VaultRead):
    notes: list[NoteRead] = Field(default_factory=list)
