import uvicorn
from fastapi import FastAPI
from contextlib import asynccontextmanager

from database import engine, Base
from categories.views import router as basic_router
from api.views import router as main_router
from vectors.utils import init_qdrant


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    init_qdrant()
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(basic_router)
app.include_router(main_router)


if __name__ == "__main__":
    try:
        uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
    except Exception as e:
        print(e)
