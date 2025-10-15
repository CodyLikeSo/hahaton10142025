import uuid

from sqlalchemy import Column, Integer, String

from database import Base


class Category(Base):
    __tablename__ = "categories"

    uuid = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    main_category = Column(String, nullable=False)
    sub_category = Column(String, nullable=False)
    example = Column(String, nullable=False)

    priority = Column(String, nullable=False)
    audience = Column(String, nullable=False)

    reference_answer = Column(String, nullable=False)
