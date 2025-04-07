from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from typing import List, Optional, Dict, Any
from app.database.database import get_db
from app.models.item import Item as ItemModel
from app.schemas.item import Item, ItemCreate, ItemUpdate
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/items",
    tags=["items"],
)

# Helper function to convert string to boolean


def str_to_bool(value: Optional[str]) -> Optional[bool]:
    if value is None:
        return None
    value = value.lower()
    if value in ('true', 't', 'yes', 'y', '1'):
        return True
    elif value in ('false', 'f', 'no', 'n', '0'):
        return False
    return None


@router.post("/", response_model=Item, status_code=status.HTTP_201_CREATED)
async def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    """
    Create a new item.

    Args:
        item: Item data to create
        db: Database session

    Returns:
        Created item

    Raises:
        HTTPException: If a database error occurs
    """
    try:
        db_item = ItemModel(**item.dict())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        logger.info(f"Item created successfully: {db_item.id}")
        return db_item
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error creating item: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Item could not be created due to constraint violation. The item might already exist."
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error creating item: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected database error occurred."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error creating item: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred."
        )


@router.get("/", response_model=List[Item])
async def read_items(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000,
                       description="Maximum number of items to return"),
    name: Optional[str] = Query(None, description="Filter by name"),
    min_price: Optional[int] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[int] = Query(None, ge=0, description="Maximum price"),
    is_active: Optional[str] = Query(
        None, description="Filter by active status (true/false)"),
    db: Session = Depends(get_db)
):
    """
    Get all items with optional filtering.

    Args:
        skip: Number of items to skip
        limit: Maximum number of items to return
        name: Filter by name (partial match)
        min_price: Filter by minimum price
        max_price: Filter by maximum price
        is_active: Filter by active status (true/false string)
        db: Database session

    Returns:
        List of items

    Raises:
        HTTPException: If a database error occurs
    """
    try:
        query = db.query(ItemModel)

        # Apply filters
        if name:
            query = query.filter(ItemModel.name.ilike(f"%{name}%"))
        if min_price is not None:
            query = query.filter(ItemModel.price >= min_price)
        if max_price is not None:
            query = query.filter(ItemModel.price <= max_price)

        # Convert string 'true'/'false' to boolean
        is_active_bool = str_to_bool(
            is_active) if is_active is not None else None
        if is_active_bool is not None:
            query = query.filter(ItemModel.is_active == is_active_bool)

        items = query.offset(skip).limit(limit).all()
        return items
    except SQLAlchemyError as e:
        logger.error(f"Database error retrieving items: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving items."
        )


@router.get("/{item_id}", response_model=Item)
async def read_item(
    item_id: int = Path(..., gt=0,
                        description="The ID of the item to retrieve"),
    db: Session = Depends(get_db)
):
    """
    Get a specific item by ID.

    Args:
        item_id: ID of the item to retrieve
        db: Database session

    Returns:
        Item if found

    Raises:
        HTTPException: If item not found or database error occurs
    """
    try:
        db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
        if db_item is None:
            logger.warning(f"Item with ID {item_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with ID {item_id} not found"
            )
        return db_item
    except SQLAlchemyError as e:
        logger.error(f"Database error retrieving item {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the item."
        )


@router.put("/{item_id}", response_model=Item)
async def update_item(
    item_id: int = Path(..., gt=0, description="The ID of the item to update"),
    item: ItemUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Update an existing item.

    Args:
        item_id: ID of the item to update
        item: Updated item data
        db: Database session

    Returns:
        Updated item

    Raises:
        HTTPException: If item not found or database error occurs
    """
    try:
        db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
        if db_item is None:
            logger.warning(f"Item with ID {item_id} not found for update")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with ID {item_id} not found"
            )

        # Check if update data is provided
        update_data = item.dict(exclude_unset=True)
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields provided for update"
            )

        # Update fields
        for key, value in update_data.items():
            setattr(db_item, key, value)

        db.commit()
        db.refresh(db_item)
        logger.info(f"Item {item_id} updated successfully")
        return db_item
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error updating item {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Item update failed due to constraint violation."
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error updating item {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the item."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error updating item {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred."
        )


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
async def delete_item(
    item_id: int = Path(..., gt=0, description="The ID of the item to delete"),
    db: Session = Depends(get_db)
):
    """
    Delete an item.

    Args:
        item_id: ID of the item to delete
        db: Database session

    Returns:
        None

    Raises:
        HTTPException: If item not found or database error occurs
    """
    try:
        db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
        if db_item is None:
            logger.warning(f"Item with ID {item_id} not found for deletion")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with ID {item_id} not found"
            )

        db.delete(db_item)
        db.commit()
        logger.info(f"Item {item_id} deleted successfully")
        return None
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error deleting item {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the item."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error deleting item {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred."
        )
