import pytest
from pydantic import ValidationError
from datetime import datetime
from app.schemas.item import ItemBase, ItemCreate, ItemUpdate, Item


def test_item_base_schema():
    """Test ItemBase schema validation"""
    # Valid data
    item_data = {
        "name": "Test Item",
        "description": "This is a test item",
        "price": 1000,
        "is_active": True
    }
    item = ItemBase(**item_data)
    assert item.name == "Test Item"
    assert item.description == "This is a test item"
    assert item.price == 1000
    assert item.is_active is True

    # Test default values
    item_data = {
        "name": "Minimal Item",
        "price": 500
    }
    item = ItemBase(**item_data)
    assert item.name == "Minimal Item"
    assert item.description is None  # Default value
    assert item.price == 500
    assert item.is_active is True  # Default value

    # Test invalid data - missing required field (name)
    with pytest.raises(ValidationError):
        ItemBase(price=1000)

    # Test invalid data - missing required field (price)
    with pytest.raises(ValidationError):
        ItemBase(name="Invalid Item")

    # Test invalid data type
    with pytest.raises(ValidationError):
        ItemBase(name="Invalid Item", price="not a number")

    # Test invalid boolean
    with pytest.raises(ValidationError):
        ItemBase(name="Invalid Item", price=1000, is_active="not a boolean")


def test_item_create_schema():
    """Test ItemCreate schema validation"""
    item_data = {
        "name": "New Item",
        "description": "Brand new item",
        "price": 1500,
        "is_active": True
    }
    item = ItemCreate(**item_data)
    assert item.name == "New Item"
    assert item.description == "Brand new item"
    assert item.price == 1500
    assert item.is_active is True

    # Since ItemCreate inherits from ItemBase, same validations apply
    with pytest.raises(ValidationError):
        ItemCreate(description="Missing required fields")


def test_item_update_schema():
    """Test ItemUpdate schema validation"""
    # All fields are optional in update
    item = ItemUpdate(name="Updated Name")
    assert item.name == "Updated Name"
    assert item.description is None
    assert item.price is None
    assert item.is_active is None

    # Empty update is allowed
    item = ItemUpdate()
    assert item.name is None
    assert item.description is None
    assert item.price is None
    assert item.is_active is None

    # Type validation still applies
    with pytest.raises(ValidationError):
        ItemUpdate(price="not a number")


def test_item_response_schema():
    """Test Item response schema validation"""
    now = datetime.now()
    item_data = {
        "id": 1,
        "name": "Response Item",
        "description": "Response schema test",
        "price": 2000,
        "is_active": True,
        "created_at": now,
        "updated_at": None
    }
    item = Item(**item_data)
    assert item.id == 1
    assert item.name == "Response Item"
    assert item.description == "Response schema test"
    assert item.price == 2000
    assert item.is_active is True
    assert item.created_at == now
    assert item.updated_at is None

    # Required fields
    with pytest.raises(ValidationError):
        # Missing id and created_at
        Item(name="Missing Fields", price=1000, is_active=True)
