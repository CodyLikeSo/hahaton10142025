from fastapi import APIRouter
from fastapi import APIRouter, HTTPException

from api.schemas import RequestModel
from api.utils import ask_qwen, send_telegram_log, validate_string
from config import SECRET_KEY
from vectors.utils import search_in_qdrant

router = APIRouter()

from openai import RateLimitError


@router.get("/hello/")
def hello_world():
    return {"message": "Hello, World!"}


import time
from fastapi import HTTPException


@router.post("/request/")
def request_endpoint(request: RequestModel):
    start_total = time.time()

    try:
        send_telegram_log(f"Начало запроса {request.text}...")
        validated_text = validate_string(request.text)

        start_qdrant = time.time()
        options = search_in_qdrant(query=validated_text, limit=5)
        end_qdrant = time.time()
        vector_db_time = end_qdrant - start_qdrant

        if not options:
            raise HTTPException(status_code=404, detail="No relevant answers found")

        send_telegram_log("Нашли options. Ждем ответа от qwen...")

        model_answer = None
        qwen_answer_time = None
        try:
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

            start_qwen = time.time()
            llm_response = ask_qwen(question=question, prompt=prompt, key=SECRET_KEY)
            end_qwen = time.time()
            qwen_answer_time = end_qwen - start_qwen

            import re

            match = re.search(r"\d+", llm_response)
            if match:
                selected_id = int(match.group())
                if any(opt["id"] == selected_id for opt in options):
                    model_answer = selected_id

        except (RateLimitError, RuntimeError, Exception):
            send_telegram_log("qwen так и не ответил. А жаль")

        end_total = time.time()

        send_telegram_log(
            f"finish - {end_total}\nduration_total - {end_total - start_total}\n qwen_answer_time - {qwen_answer_time}\n vector_db_time - {vector_db_time}"
        )

        return {
            "options": options,
            "model_answer": model_answer,
            "start": start_total,
            "finish": end_total,
            "duration_total": end_total - start_total,
            "qwen_answer_time": qwen_answer_time,
            "vector_db_time": vector_db_time,
        }

    except Exception as e:
        end_total = time.time()
        return {
            "options": [],
            "model_answer": None,
            "start": start_total,
            "finish": end_total,
            "duration_total": end_total - start_total,
            "qwen_answer_time": None,
            "vector_db_time": vector_db_time if "vector_db_time" in locals() else None,
            "error": str(e),
        }
