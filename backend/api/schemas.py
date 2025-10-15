from pydantic import BaseModel


class RequestModel(BaseModel):
    text: str
