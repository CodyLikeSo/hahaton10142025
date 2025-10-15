from fastapi import APIRouter
import pandas as pd
from fastapi import APIRouter, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import async_get_db
from api.schemas import RequestModel
from api.utils import ask_qwen, validate_string
from config import SECRET_KEY
from vectors.utils import search_in_qdrant

router = APIRouter()

from openai import RateLimitError


@router.get("/hello/")
def hello_world():
    return {"message": "Hello, World!"}


@router.post("/request/")
def request_endpoint(request: RequestModel):
    try:
        # 1. Валидация
        validated_text = validate_string(request.text)

        # 2. Поиск в Qdrant
        options = search_in_qdrant(query=validated_text, limit=5)
        if not options:
            raise HTTPException(status_code=404, detail="No relevant answers found")

        # 3. Попытка запроса к LLM
        model_answer = None
        try:
            candidates_text = "\n".join(
                f"- id: {opt['id']}, вопрос: \"{opt['payload']['Пример вопроса']}\""
                for opt in options
            )

            prompt = (
                "Ты — эксперт банка. Твоя задача — выбрать ОДИН самый релевантный вопрос из списка, "
                "который точно соответствует теме и сущности вопроса пользователя. "
                "Обращай внимание на: тип продукта (карта, вклад и т.д.), название продукта (например, 'ЧЕРЕПАХА'), и смысл запроса. "
                "Ответ должен содержать ТОЛЬКО числовой ID — ничего больше."
            )
            question = (
                f'Вопрос пользователя: "{validated_text}"\n\n'
                "Контекст: пользователь спрашивает о банковском продукте. "
                "Варианты ниже содержат полную информацию о категории и подкатегории.\n\n"
                "Варианты:\n"
                + "\n".join(
                    f"- id: {opt['id']}, "
                    f"категория: \"{opt['payload']['Основная категория']} / {opt['payload']['Подкатегория']}\", "
                    f"вопрос: \"{opt['payload']['Пример вопроса']}\""
                    for opt in options
                )
                + "\n\nКакой id наиболее точно соответствует вопросу пользователя?"
            )

            llm_response = ask_qwen(question=question, prompt=prompt, key=SECRET_KEY)

            # Извлекаем ID
            import re

            match = re.search(r"\d+", llm_response)
            if match:
                selected_id = int(match.group())
                # Проверяем, что ID есть в options
                if any(opt["id"] == selected_id for opt in options):
                    model_answer = selected_id

        except (RateLimitError, RuntimeError, Exception):
            # Любая ошибка LLM → model_answer остаётся None
            pass

        # 4. Ответ: всегда возвращаем options + ID от модели (если есть)
        return {
            "options": options,
            "model_answer": model_answer,  # может быть int или None
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
