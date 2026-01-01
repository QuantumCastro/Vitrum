from __future__ import annotations

from collections.abc import Iterable
from typing import Any, cast
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.api.deps import SessionDep, get_current_user
from app.models import Note, User, Vault
from app.schemas import (
    NoteCreate,
    NoteRead,
    NoteUpdate,
    VaultCreate,
    VaultUpdate,
    VaultWithNotes,
)

router = APIRouter()


def _clean_links(
    raw_links: Iterable[str], allowed_ids: set[str], current_note_id: UUID | None
) -> list[str]:
    cleaned: list[str] = []
    seen: set[str] = set()
    for link in raw_links:
        link_id = str(link)
        if current_note_id and link_id == str(current_note_id):
            continue
        if link_id in allowed_ids and link_id not in seen:
            cleaned.append(link_id)
            seen.add(link_id)
    return cleaned


def _to_note_read(note: Note) -> NoteRead:
    return NoteRead.model_validate(note)


def _serialize_vault(vault: Vault) -> VaultWithNotes:
    sorted_notes = sorted(vault.notes, key=lambda n: n.updated_at, reverse=True)
    serialized_notes = [_to_note_read(note) for note in sorted_notes]
    return VaultWithNotes(
        id=vault.id,
        name=vault.name,
        theme=vault.theme,
        created_at=vault.created_at,
        updated_at=vault.updated_at,
        notes=serialized_notes,
    )


async def _get_vault_or_404(
    session: SessionDep, vault_id: UUID, user: User, with_notes: bool = False
) -> Vault:
    query = select(Vault).where(Vault.id == vault_id, Vault.owner_id == user.id)
    if with_notes:
        query = query.options(selectinload(cast(Any, Vault.notes)))

    result = await session.execute(query)
    vault = cast(Vault | None, result.scalar_one_or_none())
    if vault is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bóveda no encontrada")
    return vault


async def _get_note_or_404(session: SessionDep, vault_id: UUID, note_id: UUID, user: User) -> Note:
    await _get_vault_or_404(session, vault_id, user, with_notes=False)
    result = await session.execute(
        select(Note).where(Note.id == note_id, Note.vault_id == vault_id)
    )
    note = cast(Note | None, result.scalar_one_or_none())
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nota no encontrada")
    return note


@router.get("", response_model=list[VaultWithNotes])
async def list_vaults(
    session: SessionDep, current_user: User = Depends(get_current_user)
) -> list[VaultWithNotes]:
    result = await session.execute(
        select(Vault)
        .where(Vault.owner_id == current_user.id)
        .options(selectinload(cast(Any, Vault.notes)))
    )
    vaults = cast(list[Vault], result.scalars().unique().all())
    return [_serialize_vault(vault) for vault in vaults]


@router.post("", response_model=VaultWithNotes, status_code=status.HTTP_201_CREATED)
async def create_vault(
    payload: VaultCreate, session: SessionDep, current_user: User = Depends(get_current_user)
) -> VaultWithNotes:
    vault = Vault(
        name=payload.name,
        theme=payload.theme or "violet",
        owner_id=current_user.id,
    )
    session.add(vault)
    await session.commit()
    await session.refresh(vault)

    welcome_note = Note(
        title="Inicio",
        content="Bienvenido a tu nueva bóveda.",
        vault_id=vault.id,
        links=[],
    )
    session.add(welcome_note)
    await session.commit()

    vault_with_notes = await _get_vault_or_404(session, vault.id, current_user, with_notes=True)
    return _serialize_vault(vault_with_notes)


@router.get("/{vault_id}", response_model=VaultWithNotes)
async def read_vault(
    vault_id: UUID, session: SessionDep, current_user: User = Depends(get_current_user)
) -> VaultWithNotes:
    vault = await _get_vault_or_404(session, vault_id, current_user, with_notes=True)
    return _serialize_vault(vault)


@router.patch("/{vault_id}", response_model=VaultWithNotes)
async def update_vault(
    vault_id: UUID,
    payload: VaultUpdate,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
) -> VaultWithNotes:
    vault = await _get_vault_or_404(session, vault_id, current_user, with_notes=True)

    if payload.name is not None:
        vault.name = payload.name
    if payload.theme is not None:
        vault.theme = payload.theme

    session.add(vault)
    await session.commit()
    await session.refresh(vault)
    return _serialize_vault(vault)


@router.get("/{vault_id}/notes", response_model=list[NoteRead])
async def list_notes(
    vault_id: UUID, session: SessionDep, current_user: User = Depends(get_current_user)
) -> list[NoteRead]:
    await _get_vault_or_404(session, vault_id, current_user)
    result = await session.execute(
        select(Note)
        .where(Note.vault_id == vault_id)
        .order_by(cast(Any, Note.updated_at).desc(), cast(Any, Note.created_at).desc())
    )
    notes = cast(list[Note], result.scalars().all())
    return [_to_note_read(note) for note in notes]


@router.post("/{vault_id}/notes", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
async def create_note(
    vault_id: UUID,
    payload: NoteCreate,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
) -> NoteRead:
    await _get_vault_or_404(session, vault_id, current_user)
    note = Note(
        title=payload.title or "",
        content=payload.content or "",
        links=[],
        vault_id=vault_id,
    )
    session.add(note)
    await session.commit()
    await session.refresh(note)

    if payload.links:
        result = await session.execute(select(Note.id).where(Note.vault_id == vault_id))
        allowed_ids = {str(row[0]) for row in result.all()}
        note.links = _clean_links(payload.links, allowed_ids, note.id)
        session.add(note)
        await session.commit()
        await session.refresh(note)

    return _to_note_read(note)


@router.patch("/{vault_id}/notes/{note_id}", response_model=NoteRead)
async def update_note(
    vault_id: UUID,
    note_id: UUID,
    payload: NoteUpdate,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
) -> NoteRead:
    note = await _get_note_or_404(session, vault_id, note_id, current_user)

    if payload.title is not None:
        note.title = payload.title
    if payload.content is not None:
        note.content = payload.content

    if payload.links is not None:
        result = await session.execute(select(Note.id).where(Note.vault_id == vault_id))
        allowed_ids = {str(row[0]) for row in result.all()}
        note.links = _clean_links(payload.links, allowed_ids, note_id)

    session.add(note)
    await session.commit()
    await session.refresh(note)
    return _to_note_read(note)


@router.delete("/{vault_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    vault_id: UUID,
    note_id: UUID,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
) -> None:
    note = await _get_note_or_404(session, vault_id, note_id, current_user)
    await session.delete(note)
    await session.commit()
