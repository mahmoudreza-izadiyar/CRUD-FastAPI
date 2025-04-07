import pytest
from sqlalchemy.exc import SQLAlchemyError
from app.models.item import Item
from app.database.database import get_db


def test_get_db():
    """Test the get_db dependency function"""
    db_generator = get_db()
    db = next(db_generator)
    try:
        # Test that the session is usable
        db.query(Item).first()
    except SQLAlchemyError as e:
        pytest.fail(f"Database session is not usable: {e}")
    finally:
        try:
            # Call next again to trigger the finally block in get_db
            next(db_generator, None)
        except StopIteration:
            pass


def test_database_crud_operations(test_db):
    """Test basic CRUD operations with the database"""
    # Create
    item = Item(
        name="DB Test Item",
        description="Testing database operations",
        price=1500,
        is_active=True
    )
    test_db.add(item)
    test_db.commit()
    test_db.refresh(item)

    assert item.id is not None
    assert item.created_at is not None

    # Read
    db_item = test_db.query(Item).filter(Item.id == item.id).first()
    assert db_item is not None
    assert db_item.name == "DB Test Item"
    assert db_item.price == 1500

    # Update
    db_item.name = "Updated DB Item"
    db_item.price = 2000
    test_db.commit()
    test_db.refresh(db_item)

    updated_item = test_db.query(Item).filter(Item.id == item.id).first()
    assert updated_item.name == "Updated DB Item"
    assert updated_item.price == 2000
    assert updated_item.description == "Testing database operations"  # Unchanged

    # Delete
    test_db.delete(db_item)
    test_db.commit()

    deleted_item = test_db.query(Item).filter(Item.id == item.id).first()
    assert deleted_item is None


def test_database_constraints(test_db):
    """Test database constraints and validations"""
    # Create a test item
    item1 = Item(name="Constraint Test", price=1000)
    test_db.add(item1)
    test_db.commit()

    # Test querying with filters
    result = test_db.query(Item).filter(Item.price > 500).all()
    assert len(result) == 1
    assert result[0].name == "Constraint Test"

    result = test_db.query(Item).filter(Item.price < 500).all()
    assert len(result) == 0

    # Test boolean filter
    result = test_db.query(Item).filter(Item.is_active == True).all()
    assert len(result) == 1

    # Update to inactive
    item1.is_active = False
    test_db.commit()

    result = test_db.query(Item).filter(Item.is_active == True).all()
    assert len(result) == 0

    result = test_db.query(Item).filter(Item.is_active == False).all()
    assert len(result) == 1
