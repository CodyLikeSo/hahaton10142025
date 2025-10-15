from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
import openai
import json

embed = openai.Client(
    base_url="https://llm.t1v.scibox.tech/v1", api_key="sk-iXC2N_CPmS97ROX9ZXLDTw"
)
qdrant = QdrantClient(url="http://localhost:52068")
model = "bge-m3"
COLLECTION_NAME = "somebody_once_told_me"
CSV_PATH = "./data.csv"
import csv  # <-- добавили импорт


def _hash(x: str) -> int:
    return x.__hash__() & ((1 << 64) - 1)


def get_embedding(text: str) -> list[float]:
    response = embed.embeddings.create(model=model, input=text)
    return response.data[0].embedding


def get_embedding_batch(text: list[str]) -> list[tuple[str, list[float]]]:
    response = embed.embeddings.create(model=model, input=text)
    return zip(text, [x.embedding for x in response.data])


def search(text: str, take: int) -> list[dict]:
    query_vector = get_embedding(text)
    try:
        search_result = qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            limit=take,
        )
        results = []
        for p in search_result:
            result = {
                "id": p.id,
                "score": p.score,
                "payload": p.payload,
            }
            results.append(result)
        return results
    except Exception as e:
        return json.dumps({"error": str(e)})


def search_in_qdrant(query: str, limit: int = 5) -> list[dict]:
    """
    {
    "answer":
        [
            {
            "id": 12355308822681901000,
            "score": 0.5829244,
            "payload":
                {
                    "Основная категория": "Продукты - Карты",
                    "Подкатегория": "Карты рассрочки - ЧЕРЕПАХА",
                    "Пример вопроса": "Как погашать долг по ЧЕРЕПАХЕ?",
                    "Приоритет": "высокий",
                    "Целевая аудитория": "новые клиенты",
                    "Шаблонный ответ": "Погашение можно осуществлять через интернет-банк/мобильное приложение, банкоматы, отделения банка, ЕРИП и переводами с других карт."
                }
            },
        ]
    }

    """
    vector = get_embedding(query)
    try:
        hits = qdrant.search(
            collection_name=COLLECTION_NAME, query_vector=vector, limit=limit
        )
        return [
            {"id": hit.id, "score": hit.score, "payload": hit.payload} for hit in hits
        ]
    except Exception as e:
        return [{"error": str(e)}]


def upsert(text: str):
    p = PointStruct(id=_hash(text), vector=get_embedding(text), payload={"txt": text})
    qdrant.upsert(COLLECTION_NAME, [p])


def upsert_batch(text: list[str]):
    p = [
        PointStruct(id=_hash(t), vector=e, payload={"txt": t})
        for t, e in get_embedding_batch(text)
    ]
    qdrant.upsert(COLLECTION_NAME, p)


def insert_batch_from_csv():
    questions = []
    payloads = []
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            question = row.get("Пример вопроса", "").strip()
            if not question:
                continue
            questions.append(question)
            # Сохраняем ВЕСЬ ряд как payload
            payloads.append(row)

    if not questions:
        print("no items to insert")
        return

    # Получаем эмбеддинги
    embeddings = [e for _, e in get_embedding_batch(questions)]

    # Формируем точки с полным payload
    points = [
        PointStruct(id=_hash(q), vector=emb, payload=payload)
        for q, emb, payload in zip(questions, embeddings, payloads)
    ]
    qdrant.upsert(COLLECTION_NAME, points)


def create_collection():
    qdrant.recreate_collection(
        COLLECTION_NAME,
        vectors_config=VectorParams(
            distance=Distance.COSINE,
            size=1024,
        ),
    )


# === Запуск ===
def init_qdrant():
    print("🔄 Инициализация Qdrant...")

    qdrant.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
    )

    questions = []
    payloads = []
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            question = row.get("Пример вопроса", "").strip()
            if question:
                questions.append(question)
                payloads.append(row)

    if not questions:
        print("⚠️  Нет данных для загрузки")
        return

    embeddings = [e for _, e in get_embedding_batch(questions)]
    points = [
        PointStruct(id=_hash(q), vector=emb, payload=payload)
        for q, emb, payload in zip(questions, embeddings, payloads)
    ]
    qdrant.upsert(collection_name=COLLECTION_NAME, points=points)
    print(f"✅ Загружено {len(points)} записей в Qdrant")


# print("inserted")
# print(search("rm -rf /*", 3))
# print(search("drop db", 10))

# qdrant = QdrantClient(url="http://localhost:5433", api_key="drop-database")
# qdrant.create_collection(
#     collection_name="somebody_once_told_me"
# )

# SUPPORTED_EMBEDDING_MODELS = {'bge-m3'}
# qdrant.set_model("bge-m3", providers=embed)
# result = embed.embeddings.create([
#     "how to drop database",
#     "help me connecting to bank",
#     "i downloaded ios app and it not working. hellp me please i am loosing money!",
#     "the world is gonna roll me",
#     "POSTGRES POSTGRES POSTGRES POSTGRES",
#     "hmm"
# ], model="bge-m3");
# points = [
#     PointStruct(
#         id=7,
#         vector=data.embedding,
#         payload={"text": text},
#     )
#     for idx, (data, text) in enumerate(zip(result.data, texts))
# ]
# qdrant.upsert("somebody_once_told_me", )
# qdrant.add(
#     "somebody_once_told_me",
#     [
#         "how to drop database",
#         "help me connecting to bank",
#         "i downloaded ios app and it not working. hellp me please i am loosing money!",
#         "the world is gonna roll me",
#         "POSTGRES POSTGRES POSTGRES POSTGRES",
#         "hmm"
#     ]
# )

# x = qdrant.search("somebody_once_told_me", embed.embeddings.create("rm -rf /*").data[0].embedding)
# print(x)

# # curl -X POST \
# #      -H "Authorization: Bearer <YOUR_TOKEN>" \
# #      -H "Content-Type: application/json" \
# #      https://llm.t1v.scibox.tech/v1/embeddings \
# #      -d '{
# #            "model": "bge-m3",
# #            "input": "Напиши короткое стихотворение про осень"
# #          }'
