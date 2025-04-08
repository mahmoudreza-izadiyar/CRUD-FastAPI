from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class RatingBase(BaseModel):
    rating: int = Field(..., ge=1, le=5,
                        description="Rating value between 1 and 5")
    comment: Optional[str] = Field(None, description="Optional review comment")


class RatingCreate(RatingBase):
    pass


class RatingUpdate(RatingBase):
    rating: Optional[int] = Field(
        None, ge=1, le=5, description="Rating value between 1 and 5")


class Rating(RatingBase):
    id: int
    user_id: int
    business_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RatingWithUser(Rating):
    user_username: str

    class Config:
        from_attributes = True
