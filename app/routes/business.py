from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from typing import List, Optional

from app.database.database import get_db
from app.services import business_service
from app.schemas.business import Business, BusinessCreate, BusinessUpdate, BusinessWithRatings
from app.models.user import User
from app.security.auth import get_current_active_user, get_current_user
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/businesses",
    tags=["businesses"],
)


@router.post("/", response_model=Business, status_code=status.HTTP_201_CREATED)
async def create_business(
    business: BusinessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new business.
    """
    try:
        # Check if the user is a superuser for business creation
        if not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to create a business"
            )

        db_business = business_service.create_business(db, business)
        return db_business
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error creating business: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Business could not be created due to constraint violation."
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error creating business: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected database error occurred."
        )


@router.get("/", response_model=List[Business])
async def read_businesses(
    skip: int = Query(0, ge=0, description="Number of businesses to skip"),
    limit: int = Query(
        20, ge=1, le=100, description="Maximum number of businesses to return"),
    name: Optional[str] = Query(None, description="Filter by name"),
    min_rating: Optional[float] = Query(
        None, ge=0, le=5, description="Minimum rating"),
    max_rating: Optional[float] = Query(
        None, ge=0, le=5, description="Maximum rating"),
    sort_by_rating: Optional[str] = Query(
        None, description="Sort by rating (asc/desc)"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get all businesses with optional filtering and sorting.
    """
    try:
        businesses = business_service.get_businesses(
            db,
            skip=skip,
            limit=limit,
            name=name,
            min_rating=min_rating,
            max_rating=max_rating,
            sort_by_rating=sort_by_rating
        )
        return businesses
    except SQLAlchemyError as e:
        logger.error(f"Database error retrieving businesses: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving businesses."
        )


@router.get("/{business_id}", response_model=BusinessWithRatings)
async def read_business(
    business_id: int = Path(..., gt=0,
                            description="The ID of the business to retrieve"),
    db: Session = Depends(get_db)
):
    """
    Get a specific business by ID, including its ratings.
    """
    try:
        business = business_service.get_business(db, business_id)
        return business
    except SQLAlchemyError as e:
        logger.error(
            f"Database error retrieving business {business_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the business."
        )


@router.put("/{business_id}", response_model=Business)
async def update_business(
    business_id: int = Path(..., gt=0,
                            description="The ID of the business to update"),
    business: BusinessUpdate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing business.
    """
    try:
        # Check if the user is a superuser for business updates
        if not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update a business"
            )

        db_business = business_service.update_business(
            db, business_id, business)
        return db_business
    except IntegrityError as e:
        db.rollback()
        logger.error(
            f"Integrity error updating business {business_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Business update failed due to constraint violation."
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(
            f"Database error updating business {business_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the business."
        )


@router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_business(
    business_id: int = Path(..., gt=0,
                            description="The ID of the business to delete"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a business.
    """
    try:
        # Check if the user is a superuser for business deletion
        if not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to delete a business"
            )

        business_service.delete_business(db, business_id)
        return None
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(
            f"Database error deleting business {business_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the business."
        )
