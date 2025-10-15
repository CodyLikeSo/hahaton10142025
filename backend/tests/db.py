import functools
from typing import AsyncGenerator
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import pytest_asyncio
import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker

from async_database import Base, async_get_db
from main import app

user = "postgres"
password = "123"
host = "localhost"
port = 5432
database = "testdb"

url = f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{database}"
simple_url = "postgresql+asyncpg://postgres:123@localhost:5432/testdb"


test_engine = create_async_engine(
    url=url,
    echo=True,
)

SessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
