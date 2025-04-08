from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    business_id = Column(Integer, ForeignKey(
        "businesses.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="ratings")
    business = relationship("Business", back_populates="ratings")

    # Ensure a user can only rate a business once
    __table_args__ = (
        UniqueConstraint('user_id', 'business_id',
                         name='uix_user_business_rating'),
    )
