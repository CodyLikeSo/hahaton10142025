import functools

from httpx import AsyncClient, ASGITransport
import pytest_asyncio
from database import Base, async_get_db
from main import app
from tests.db import test_engine, override_get_db
from tests.db import SessionLocal


@pytest_asyncio.fixture(scope="function")
async def test_client():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    app.dependency_overrides[async_get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client

    app.dependency_overrides.clear()


def session_decorator(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        async with SessionLocal() as session:
            kwargs["session"] = session
            return await func(*args, **kwargs)

    return wrapper


@pytest_asyncio.fixture
async def session():
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()