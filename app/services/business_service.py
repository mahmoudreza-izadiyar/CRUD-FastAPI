from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
from app.models.business import BusinessCreate, BusinessUpdate
from app.models.db_models import Business, Rating, User
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import datetime


def get_businesses(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    name: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    sort_by_rating: Optional[str] = None
) -> List[Business]:
    """
    Get all businesses with optional filtering and sorting
    """
    query = db.query(
        Business,
        func.coalesce(func.avg(Rating.rating), 0).label("average_rating"),
        func.count(Rating.id).label("total_ratings")
    ).outerjoin(Rating)

    # Apply filters
    if name:
        query = query.filter(Business.name.ilike(f"%{name}%"))

    # Group by business id to aggregate ratings
    query = query.group_by(Business.id)

    # Apply rating filters after grouping
    if min_rating is not None:
        query = query.having(func.coalesce(
            func.avg(Rating.rating), 0) >= min_rating)

    if max_rating is not None:
        query = query.having(func.coalesce(
            func.avg(Rating.rating), 0) <= max_rating)

    # Apply sorting
    if sort_by_rating:
        if sort_by_rating.lower() == "asc":
            query = query.order_by(
                asc(func.coalesce(func.avg(Rating.rating), 0)))
        elif sort_by_rating.lower() == "desc":
            query = query.order_by(
                desc(func.coalesce(func.avg(Rating.rating), 0)))
    else:
        # Default sorting by id
        query = query.order_by(Business.id)

    # Apply pagination
    result = query.offset(skip).limit(limit).all()

    # Convert to result objects
    businesses = []
    for business, avg_rating, total_ratings in result:
        business_dict = business.__dict__.copy()
        business_dict["average_rating"] = float(
            avg_rating) if avg_rating else 0
        business_dict["total_ratings"] = int(
            total_ratings) if total_ratings else 0
        businesses.append(business_dict)

    return businesses


def get_business(db: Session, business_id: int) -> Optional[Business]:
    """
    Get a specific business by ID with rating information
    """
    result = db.query(
        Business,
        func.coalesce(func.avg(Rating.rating), 0).label("average_rating"),
        func.count(Rating.id).label("total_ratings")
    ).outerjoin(Rating).filter(Business.id == business_id).group_by(Business.id).first()

    if not result:
        return None

    business, avg_rating, total_ratings = result
    business_dict = business.__dict__.copy()
    business_dict["average_rating"] = float(avg_rating) if avg_rating else 0
    business_dict["total_ratings"] = int(total_ratings) if total_ratings else 0

    return business_dict


def create_business(db: Session, business: BusinessCreate, owner_id: int) -> Business:
    """
    Create a new business
    """
    now = datetime.utcnow()
    db_business = Business(
        **business.dict(),
        owner_id=owner_id,
        created_at=now,
        updated_at=now
    )
    db.add(db_business)
    db.commit()
    db.refresh(db_business)

    # Add rating information
    business_dict = db_business.__dict__.copy()
    business_dict["average_rating"] = 0
    business_dict["total_ratings"] = 0

    return business_dict


def update_business(db: Session, business_id: int, business: BusinessUpdate) -> Business:
    """
    Update a business
    """
    db_business = db.query(Business).filter(Business.id == business_id).first()

    business_data = business.dict(exclude_unset=True)
    for key, value in business_data.items():
        setattr(db_business, key, value)

    db_business.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_business)

    # Get updated business with rating information
    return get_business(db, business_id)


def delete_business(db: Session, business_id: int) -> None:
    """
    Delete a business
    """
    db_business = db.query(Business).filter(Business.id == business_id).first()
    db.delete(db_business)
    db.commit()


# Ratings functions
def get_business_ratings(
    db: Session,
    business_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[Rating]:
    """
    Get all ratings for a business
    """
    ratings_with_users = (
        db.query(Rating, User.username)
        .join(User, Rating.user_id == User.id)
        .filter(Rating.business_id == business_id)
        .order_by(desc(Rating.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for rating, username in ratings_with_users:
        rating_dict = rating.__dict__.copy()
        rating_dict["user_username"] = username
        result.append(rating_dict)

    return result


def create_or_update_rating(
    db: Session,
    business_id: int,
    rating: BusinessCreate,
    user_id: int
) -> Rating:
    """
    Create or update a rating for a business
    """
    # Check if user already has a rating for this business
    existing_rating = (
        db.query(Rating)
        .filter(Rating.business_id == business_id, Rating.user_id == user_id)
        .first()
    )

    now = datetime.utcnow()

    if existing_rating:
        # Update existing rating
        existing_rating.rating = rating.rating
        existing_rating.comment = rating.comment
        existing_rating.updated_at = now
        db_rating = existing_rating
    else:
        # Create new rating
        db_rating = Rating(
            business_id=business_id,
            user_id=user_id,
            rating=rating.rating,
            comment=rating.comment,
            created_at=now,
            updated_at=now
        )
        db.add(db_rating)

    db.commit()
    db.refresh(db_rating)

    # Get username for the response
    username = db.query(User.username).filter(User.id == user_id).scalar()

    rating_dict = db_rating.__dict__.copy()
    rating_dict["user_username"] = username

    return rating_dict


def delete_user_rating(db: Session, business_id: int, user_id: int) -> None:
    """
    Delete a user's rating for a business
    """
    db_rating = (
        db.query(Rating)
        .filter(Rating.business_id == business_id, Rating.user_id == user_id)
        .first()
    )

    if db_rating:
        db.delete(db_rating)
        db.commit()
