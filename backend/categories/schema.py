from pydantic import BaseModel

class Category(BaseModel):
    id: int
    main_category: str
    sub_category: str
    example: str
    priority: str
    audience: str
    reference_answer: str