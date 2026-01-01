from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select

from app.api.deps import SessionDep, get_current_user
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models import Note, User, Vault
from app.schemas import LoginRequest, RegisterRequest, TokenResponse, UserRead

router = APIRouter()
MAX_BCRYPT_BYTES = 72
DEFAULT_VAULT_NAME_KEY = "i18n:defaultVault.name"
DEFAULT_NOTE_WELCOME_TITLE_KEY = "i18n:defaultNotes.welcome.title"
DEFAULT_NOTE_WELCOME_CONTENT_KEY = "i18n:defaultNotes.welcome.content"
DEFAULT_NOTE_QUICKSTART_TITLE_KEY = "i18n:defaultNotes.quickstart.title"
DEFAULT_NOTE_QUICKSTART_CONTENT_KEY = "i18n:defaultNotes.quickstart.content"


def _to_user_read(user: User) -> UserRead:
    return UserRead.model_validate(user)


def _ensure_password_len(password: str) -> None:
    """Valida límite de bcrypt para evitar 500 por contraseñas largas."""
    if len(password.encode("utf-8")) > MAX_BCRYPT_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"La contraseña no puede exceder {MAX_BCRYPT_BYTES} bytes (bcrypt). "
                "Usa una más corta."
            ),
        )


async def _ensure_default_vault(session: SessionDep, user: User) -> None:
    result = await session.execute(select(Vault.id).where(Vault.owner_id == user.id).limit(1))
    if result.scalar_one_or_none():
        return

    vault = Vault(name=DEFAULT_VAULT_NAME_KEY, theme="violet", owner_id=user.id)
    session.add(vault)
    await session.commit()
    await session.refresh(vault)

    welcome_note = Note(
        title=DEFAULT_NOTE_WELCOME_TITLE_KEY,
        content=DEFAULT_NOTE_WELCOME_CONTENT_KEY,
        vault_id=vault.id,
        links=[],
    )
    quickstart_note = Note(
        title=DEFAULT_NOTE_QUICKSTART_TITLE_KEY,
        content=DEFAULT_NOTE_QUICKSTART_CONTENT_KEY,
        vault_id=vault.id,
        links=[],
    )
    welcome_note.links = [str(quickstart_note.id)]
    quickstart_note.links = [str(welcome_note.id)]
    session.add(welcome_note)
    session.add(quickstart_note)
    await session.commit()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, session: SessionDep) -> TokenResponse:
    _ensure_password_len(payload.password)

    existing = await session.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="El correo ya está registrado"
        )

    user = User(
        email=payload.email,
        display_name=payload.display_name,
        hashed_password=get_password_hash(payload.password),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    await _ensure_default_vault(session, user)
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, token_type="bearer", user=_to_user_read(user))


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: SessionDep) -> TokenResponse:
    _ensure_password_len(payload.password)

    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    await _ensure_default_vault(session, user)
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, token_type="bearer", user=_to_user_read(user))


@router.get("/me", response_model=UserRead)
async def read_me(current_user: User = Depends(get_current_user)) -> UserRead:
    return _to_user_read(current_user)
