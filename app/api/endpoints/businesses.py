from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.business import Business, BusinessCreate, BusinessUpdate
from app.models.rating import Rating, RatingCreate, RatingUpdate
from app.services.business_service import (
    get_businesses,
    get_business,
    create_business,
    update_business,
    delete_business,
    get_business_ratings,
    create_or_update_rating,
    delete_user_rating
)
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[Business])
def read_businesses(
    skip: int = 0,
    limit: int = 100,
    name: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    sort_by_rating: Optional[str] = Query(None, regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all businesses with optional filtering and sorting
    """
    businesses = get_businesses(
        db,
        skip=skip,
        limit=limit,
        name=name,
        min_rating=min_rating,
        max_rating=max_rating,
        sort_by_rating=sort_by_rating
    )
    return businesses


@router.post("/", response_model=Business, status_code=201)
def create_new_business(
    business: BusinessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new business
    """
    return create_business(db=db, business=business, owner_id=current_user.id)


@router.get("/{business_id}", response_model=Business)
def read_business(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific business by ID
    """
    db_business = get_business(db, business_id=business_id)
    if db_business is None:
        raise HTTPException(status_code=404, detail="Business not found")
    return db_business


@router.put("/{business_id}", response_model=Business)
def update_business_details(
    business_id: int,
    business: BusinessUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a business
    """
    db_business = get_business(db, business_id=business_id)
    if db_business is None:
        raise HTTPException(status_code=404, detail="Business not found")

    # Check if user owns the business
    if db_business.owner_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this business")

    return update_business(db=db, business_id=business_id, business=business)


@router.delete("/{business_id}", status_code=204)
def delete_business_by_id(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a business
    """
    db_business = get_business(db, business_id=business_id)
    if db_business is None:
        raise HTTPException(status_code=404, detail="Business not found")

    # Check if user owns the business
    if db_business.owner_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this business")

    delete_business(db=db, business_id=business_id)
    return None

# Rating endpoints


@router.get("/{business_id}/ratings", response_model=List[Rating])
def read_business_ratings(
    business_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all ratings for a business
    """
    db_business = get_business(db, business_id=business_id)
    if db_business is None:
        raise HTTPException(status_code=404, detail="Business not found")

    ratings = get_business_ratings(
        db,
        business_id=business_id,
        skip=skip,
        limit=limit
    )
    return ratings


@router.post("/{business_id}/ratings", response_model=Rating)
def create_update_business_rating(
    business_id: int,
    rating: RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create or update a rating for a business
    """
    db_business = get_business(db, business_id=business_id)
    if db_business is None:
        raise HTTPException(status_code=404, detail="Business not found")

    # Don't allow users to rate their own business
    if db_business.owner_id == current_user.id:
        raise HTTPException(
            status_code=400, detail="You cannot rate your own business")

    return create_or_update_rating(
        db=db,
        business_id=business_id,
        rating=rating,
        user_id=current_user.id
    )


@router.delete("/{business_id}/ratings/me", status_code=204)
def delete_own_rating(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete the current user's rating for a business
    """
    db_business = get_business(db, business_id=business_id)
    if db_business is None:
        raise HTTPException(status_code=404, detail="Business not found")

    delete_user_rating(db=db, business_id=business_id, user_id=current_user.id)
    return None
