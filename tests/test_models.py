import pytest
from datetime import datetime
from sqlalchemy import inspect
from app.models.item import Item


def test_item_model_attributes(test_db):
    """Test Item model attributes and columns"""
    # Get model inspector
    inspector = inspect(Item)
    columns = inspector.columns

    # Check column existence
    assert "id" in columns
    assert "name" in columns
    assert "description" in columns
    assert "price" in columns
    assert "is_active" in columns
    assert "created_at" in columns
    assert "updated_at" in columns

    # Check column properties
    assert columns["id"].primary_key is True
    assert columns["id"].autoincrement is True
    assert columns["name"].nullable is False
    assert columns["description"].nullable is True
    assert columns["price"].nullable is False
    assert columns["is_active"].default.arg is True


def test_item_model_defaults(test_db):
    """Test Item model default values"""
    # Create with minimal fields
    item = Item(name="Default Test", price=1000)
    test_db.add(item)
    test_db.commit()
    test_db.refresh(item)

    # Check defaults
    assert item.id is not None
    assert item.name == "Default Test"
    assert item.description is None  # Default None
    assert item.price == 1000
    assert item.is_active is True  # Default True
    assert item.created_at is not None  # Default server timestamp
    assert item.updated_at is None  # Default None until update


def test_item_model_timestamps(test_db):
    """Test Item model timestamp behavior"""
    # Create initial item
    item = Item(name="Timestamp Test", price=1000)
    test_db.add(item)
    test_db.commit()
    test_db.refresh(item)

    # Capture created timestamp
    created_at = item.created_at
    assert created_at is not None
    assert isinstance(created_at, datetime)
    assert item.updated_at is None

    # Update item and check that updated_at gets set
    item.name = "Updated Timestamp Test"
    test_db.commit()
    test_db.refresh(item)

    assert item.created_at == created_at  # Created timestamp shouldn't change
    assert item.updated_at is not None  # Updated timestamp should be set
    assert isinstance(item.updated_at, datetime)
    assert item.updated_at > item.created_at  # Updated should be later


def test_item_model_relationships(test_db):
    """Test Item model table relationships and constraints"""
    # This is a basic test since we don't have relationships in this simple model
    # If you extend the model with relationships, add more tests here

    # Create multiple items
    items = [
        Item(name="Item 1", price=1000),
        Item(name="Item 2", price=2000),
        Item(name="Item 3", price=3000)
    ]
    test_db.add_all(items)
    test_db.commit()

    # Verify items were created with unique IDs
    all_items = test_db.query(Item).all()
    assert len(all_items) == 3

    ids = [item.id for item in all_items]
    # Check that all IDs are unique
    assert len(ids) == len(set(ids))
