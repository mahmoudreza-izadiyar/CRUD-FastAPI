from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.rating import Rating
from app.models.business import Business
from app.models.user import User
from app.schemas.rating import RatingCreate, RatingUpdate
from fastapi import HTTPException, status
from typing import List, Optional


def get_ratings_for_business(db: Session, business_id: int, skip: int = 0, limit: int = 100) -> List[Rating]:
    """Get all ratings for a specific business."""
    return db.query(Rating).filter(Rating.business_id == business_id).offset(skip).limit(limit).all()


def get_rating_by_user_business(db: Session, user_id: int, business_id: int) -> Optional[Rating]:
    """Get a specific rating by user_id and business_id."""
    return db.query(Rating).filter(Rating.user_id == user_id, Rating.business_id == business_id).first()


def get_ratings_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Rating]:
    """Get all ratings made by a specific user."""
    return db.query(Rating).filter(Rating.user_id == user_id).offset(skip).limit(limit).all()


def create_or_update_rating(db: Session, business_id: int, user_id: int, rating_data: RatingCreate) -> Rating:
    """Create a new rating or update an existing one."""
    # Check if business exists
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID {business_id} not found"
        )

    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )

    # Check if the rating already exists
    existing_rating = get_rating_by_user_business(db, user_id, business_id)

    # Create or update rating
    if existing_rating:
        # Update existing rating
        for key, value in rating_data.dict().items():
            setattr(existing_rating, key, value)
        db.commit()
        db.refresh(existing_rating)
        rating = existing_rating
    else:
        # Create new rating
        db_rating = Rating(
            user_id=user_id,
            business_id=business_id,
            **rating_data.dict()
        )
        db.add(db_rating)
        db.commit()
        db.refresh(db_rating)
        rating = db_rating

    # Update business average rating and total ratings
    update_business_rating_stats(db, business_id)

    return rating


def delete_rating(db: Session, user_id: int, business_id: int) -> bool:
    """Delete a rating by user_id and business_id."""
    rating = get_rating_by_user_business(db, user_id, business_id)
    if not rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rating not found for user {user_id} and business {business_id}"
        )

    db.delete(rating)
    db.commit()

    # Update business average rating and total ratings
    update_business_rating_stats(db, business_id)

    return True


def update_business_rating_stats(db: Session, business_id: int) -> None:
    """Update the average_rating and total_ratings for a business."""
    # Get the business
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID {business_id} not found"
        )

    # Calculate new average and count
    result = db.query(
        func.avg(Rating.rating).label("average"),
        func.count(Rating.id).label("count")
    ).filter(Rating.business_id == business_id).first()

    # Update business fields
    business.total_ratings = result.count or 0
    business.average_rating = float(result.average) if result.average else 0.0

    db.commit()
