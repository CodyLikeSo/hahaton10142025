import pandas as pd
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pathlib import Path
from database import async_get_db
from categories.models import Category

router = APIRouter()


@router.get("/hello/")
def hello_world():
    return {"message": "Hello, World!"}



router = APIRouter()

EXCEL_FILE_NAME = "data.xlsx"

COLUMN_MAPPING = {
    "Основная категория": "main_category",
    "Подкатегория": "sub_category",
    "Пример вопроса": "example",
    "Приоритет": "priority",
    "Целевая аудитория": "audience",
    "Шаблонный ответ": "reference_answer",
}


@router.post("/upload-categories/")
async def upload_categories(db: AsyncSession = Depends(async_get_db)):
    file_path = Path(EXCEL_FILE_NAME)

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Файл {EXCEL_FILE_NAME} не найден в директории проекта",
        )

    try:
        df = pd.read_excel(file_path)

        expected_excel_columns = set(COLUMN_MAPPING.keys())
        if not expected_excel_columns.issubset(df.columns):
            missing = expected_excel_columns - set(df.columns)
            raise HTTPException(
                status_code=400, detail=f"В файле отсутствуют столбцы: {missing}"
            )

        df_renamed = df.rename(columns=COLUMN_MAPPING)

        required_db_columns = {
            "main_category",
            "sub_category",
            "priority",
            "audience",
            "reference_answer",
        }
        if not required_db_columns.issubset(df_renamed.columns):
            missing = required_db_columns - set(df_renamed.columns)
            raise HTTPException(
                status_code=500, detail=f"Ошибка маппинга колонок: {missing}"
            )

        records = df_renamed.to_dict(orient="records")

        categories = [
            Category(
                main_category=row["main_category"],
                sub_category=row["sub_category"],
                example=row["example"],
                priority=row["priority"],
                audience=row["audience"],
                reference_answer=row["reference_answer"],
            )
            for row in records
        ]

        db.add_all(categories)
        await db.commit()

        return {
            "message": f"Успешно загружено {len(categories)} записей из файла {EXCEL_FILE_NAME}"
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Ошибка при обработке файла: {str(e)}"
        )
