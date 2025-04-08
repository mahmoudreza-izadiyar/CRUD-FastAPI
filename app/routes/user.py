from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List

from app.database.database import get_db
from app.services import rating_service
from app.schemas.rating import Rating
from app.models.user import User
from app.security.auth import get_current_active_user
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/users",
    tags=["users"],
)


@router.get("/me/ratings", response_model=List[Rating])
async def read_user_ratings(
    skip: int = Query(0, ge=0, description="Number of ratings to skip"),
    limit: int = Query(
        20, ge=1, le=100, description="Maximum number of ratings to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all ratings submitted by the current user.
    """
    try:
        ratings = rating_service.get_ratings_by_user(
            db, current_user.id, skip, limit)
        return ratings
    except SQLAlchemyError as e:
        logger.error(f"Database error retrieving user ratings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving your ratings."
        )
