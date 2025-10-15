from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
import openai
import json

from config import KEYWORDS_SET, format_input


embed = openai.Client(
    base_url="https://llm.t1v.scibox.tech/v1", api_key="sk-iXC2N_CPmS97ROX9ZXLDTw"
)
qdrant = QdrantClient(url="http://hahaton_qdrant:6333")
model = "bge-m3"
COLLECTION_NAME = "somebody_once_told_me"
CSV_PATH = "./data.csv"
import csv


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
    query_lower = format_input(query)

    vector = get_embedding(query)
    try:
        hits = qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=vector,
            limit=limit * 2,
        )
    except Exception as e:
        return [{"error": str(e)}]

    results = []
    for hit in hits:
        payload = hit.payload

        doc_text = " ".join(
            [
                payload.get("Пример вопроса", ""),
                payload.get("Шаблонный ответ", ""),
                payload.get("Основная категория", ""),
                payload.get("Подкатегория", ""),
            ]
        ).lower()

        query_keywords = {kw for kw in KEYWORDS_SET if kw in query_lower}
        doc_keywords = {kw for kw in KEYWORDS_SET if kw in doc_text}

        overlap = query_keywords & doc_keywords

        if query_keywords:
            keyword_score = len(overlap) / len(query_keywords)
        else:
            keyword_score = 0.0

        vector_score = hit.score
        final_score = 0.88 * vector_score + 0.12 * keyword_score

        results.append(
            {
                "id": hit.id,
                "vector_score": vector_score,
                "keyword_score": keyword_score,
                "final_score": final_score,
                "payload": payload,
            }
        )

    results.sort(key=lambda x: x["final_score"], reverse=True)

    return [
        {
            "id": r["id"],
            "score": r["final_score"],
            "payload": r["payload"],
        }
        for r in results[:limit]
    ]


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
            payloads.append(row)

    if not questions:
        print("no items to insert")
        return

    embeddings = [e for _, e in get_embedding_batch(questions)]

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