import asyncio

from app.core.config import settings
from app.db.session import engine, init_db


async def main() -> None:
    print(f"Using DATABASE_URL={settings.database_url}")
    await init_db()
    await engine.dispose()
    print("SQLite schema ready")


if __name__ == "__main__":
    asyncio.run(main())
