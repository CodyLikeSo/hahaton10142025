from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
import openai
import json

embed = openai.Client(base_url='https://llm.t1v.scibox.tech/v1', api_key='sk-iXC2N_CPmS97ROX9ZXLDTw')
qdrant = QdrantClient(url="http://localhost:5433")
model = "bge-m3"
collection_name = "somebody_once_told_me"

def _hash(x:str) -> int:
    return x.__hash__() & ((1<<64)-1)

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
            collection_name=collection_name,
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

def upsert(text: str):
    p = PointStruct(
        id=_hash(text), # todo: fix id
        vector=get_embedding(text),
        payload={"txt":text}
    )
    qdrant.upsert(collection_name, [p])

def upsert_batch(text: list[str]):
    p = [
        PointStruct(
            id=_hash(t), # todo: fix id
            vector=e,
            payload={"txt":t}
        ) for t,e in get_embedding_batch(text)
    ]
    qdrant.upsert(collection_name, p)

def insert_batch(text: list[str]):
    # existent = [y.id for y in qdrant.retrieve(collection_name=collection_name, ids=[_hash(x) for x in text])]
    # # retain items not present in qdrant
    # text = [x for x in text if not _hash(x) not in existent]

    if text.__len__() == 0: print("no items to insert"); return

    p = [
        PointStruct(
            id=_hash(t), # todo: fix id
            vector=e,
            payload={"txt":t}
        ) for t,e in get_embedding_batch(text)
    ]
    qdrant.upsert(collection_name, p)

def create_collection():
    # if not qdrant.collection_exists(collection_name):
    qdrant.recreate_collection(collection_name, vectors_config=VectorParams(
            distance=Distance.COSINE,
            size=1024,
        ),
    )

create_collection()
insert_batch([
    "how to drop database",
    "help me connecting to bank",
    "i downloaded ios app and it not working. hellp me please i am loosing money!",
    "the world is gonna roll me",
    "POSTGRES POSTGRES POSTGRES POSTGRES",
    "hmm"
])
print("inserted")
print(search("rm -rf /*", 10))
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