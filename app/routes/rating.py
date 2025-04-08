from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from typing import List, Optional

from app.database.database import get_db
from app.services import rating_service
from app.schemas.rating import Rating, RatingCreate, RatingUpdate, RatingWithUser
from app.models.user import User
from app.security.auth import get_current_active_user
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/businesses",
    tags=["ratings"],
)


@router.post("/{business_id}/ratings", response_model=Rating, status_code=status.HTTP_201_CREATED)
async def create_or_update_rating(
    business_id: int = Path(..., gt=0,
                            description="The ID of the business to rate"),
    rating: RatingCreate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create or update a rating for a business.

    If the user has already rated this business, the existing rating will be updated.
    """
    try:
        db_rating = rating_service.create_or_update_rating(
            db=db,
            business_id=business_id,
            user_id=current_user.id,
            rating_data=rating
        )
        return db_rating
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error creating/updating rating: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Rating could not be created/updated due to constraint violation."
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error creating/updating rating: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected database error occurred."
        )


@router.get("/{business_id}/ratings", response_model=List[RatingWithUser])
async def read_ratings(
    business_id: int = Path(..., gt=0,
                            description="The ID of the business to get ratings for"),
    skip: int = Query(0, ge=0, description="Number of ratings to skip"),
    limit: int = Query(
        20, ge=1, le=100, description="Maximum number of ratings to return"),
    db: Session = Depends(get_db)
):
    """
    Get all ratings for a specific business.
    """
    try:
        ratings = rating_service.get_ratings_for_business(
            db, business_id, skip, limit)
        return ratings
    except SQLAlchemyError as e:
        logger.error(f"Database error retrieving ratings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving ratings."
        )


@router.get("/{business_id}/ratings/me", response_model=Rating)
async def read_my_rating(
    business_id: int = Path(..., gt=0,
                            description="The ID of the business to get your rating for"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the current user's rating for a business.
    """
    try:
        rating = rating_service.get_rating_by_user_business(
            db, current_user.id, business_id)
        if not rating:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="You have not rated this business yet."
            )
        return rating
    except SQLAlchemyError as e:
        logger.error(f"Database error retrieving rating: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving your rating."
        )


@router.delete("/{business_id}/ratings/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_rating(
    business_id: int = Path(..., gt=0,
                            description="The ID of the business to delete your rating for"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete the current user's rating for a business.
    """
    try:
        rating_service.delete_rating(db, current_user.id, business_id)
        return None
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error deleting rating: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting your rating."
        )
