from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

user = "postgres"
password = "123"
host = "localhost"
port = 5432
database = "db"

url = f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{database}"

engine = create_async_engine(
    url=url,
    echo=True,
)

SessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def async_get_db():
    async with SessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()
