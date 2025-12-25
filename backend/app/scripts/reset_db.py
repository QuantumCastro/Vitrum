"""Dev helper to drop and recreate all SQLModel tables.

This is destructive. Use for local/prototyping workflows where data can be lost.
Honors the current `DATABASE_URL` via app settings. Optional seed hook stubbed.
"""

import argparse
import asyncio
import logging

from sqlalchemy.ext.asyncio import AsyncEngine
from sqlmodel import SQLModel

import app.models  # noqa: F401  # Ensure models are imported so metadata is registered
from app.db.session import engine

logger = logging.getLogger(__name__)


async def seed_data(engine: AsyncEngine) -> None:
    """Placeholder for future seed logic."""
    _ = engine  # To silence unused warning until seeds are implemented
    logger.info("Seed step skipped (not implemented).")


async def reset_db(seed: bool = False) -> None:
    logger.warning("Dropping and recreating all tables (database_url=%s)", engine.url)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)
    if seed:
        await seed_data(engine)
    logger.info("Database reset complete%s", " with seed data" if seed else "")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Drop and recreate all SQLModel tables using the configured DATABASE_URL."
    )
    parser.add_argument(
        "--seed",
        action="store_true",
        help="Run seed_data after recreating tables (stubbed for now).",
    )
    return parser.parse_args()


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    args = parse_args()
    asyncio.run(reset_db(seed=args.seed))


if __name__ == "__main__":
    main()
