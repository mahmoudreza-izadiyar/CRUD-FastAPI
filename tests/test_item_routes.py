import pytest
from fastapi import status
from app.models.item import Item

# ============== Test GET routes ==============


def test_read_items(client, test_item):
    """Test getting all items"""
    response = client.get("/items/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Test Item"


def test_read_items_with_filters(client, test_db):
    """Test getting items with filters"""
    # Add multiple items to test filtering
    items = [
        Item(name="Cheap Item", description="A cheap item",
             price=500, is_active=True),
        Item(name="Expensive Item", description="An expensive item",
             price=5000, is_active=True),
        Item(name="Inactive Item", description="An inactive item",
             price=1000, is_active=False),
    ]
    test_db.add_all(items)
    test_db.commit()

    # Test name filter
    response = client.get("/items/?name=cheap")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Cheap Item"

    # Test price range filter
    response = client.get("/items/?min_price=1000&max_price=2000")
    assert response.status_code == status.HTTP_200_OK
    filtered_items = response.json()
    assert len(filtered_items) == 1
    assert filtered_items[0]["name"] in ["Test Item"]

    # Test active status filter
    response = client.get("/items/?is_active=false")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Inactive Item"

    # Test combined filters
    response = client.get("/items/?max_price=600&is_active=true")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Cheap Item"


def test_read_item(client, test_item):
    """Test getting a specific item by ID"""
    response = client.get(f"/items/{test_item.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Test Item"
    assert response.json()["price"] == 1000


def test_read_item_not_found(client):
    """Test getting a non-existent item"""
    response = client.get("/items/9999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "not found" in response.json()["detail"]

# ============== Test POST routes ==============


def test_create_item(client):
    """Test creating a new item"""
    item_data = {
        "name": "New Item",
        "description": "A brand new item",
        "price": 1500,
        "is_active": True
    }
    response = client.post("/items/", json=item_data)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["name"] == "New Item"
    assert response.json()["description"] == "A brand new item"
    assert response.json()["price"] == 1500
    assert "id" in response.json()
    assert "created_at" in response.json()


def test_create_item_invalid_data(client):
    """Test creating an item with invalid data"""
    # Missing required field
    item_data = {
        "description": "Missing required name field",
        "price": 1500
    }
    response = client.post("/items/", json=item_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Negative price
    item_data = {
        "name": "Invalid Price Item",
        "price": -100
    }
    response = client.post("/items/", json=item_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

# ============== Test PUT routes ==============


def test_update_item(client, test_item):
    """Test updating an item"""
    update_data = {
        "name": "Updated Item",
        "price": 2000
    }
    response = client.put(f"/items/{test_item.id}", json=update_data)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Updated Item"
    assert response.json()["price"] == 2000
    assert response.json()["description"] == "This is a test item"  # Unchanged


def test_update_item_not_found(client):
    """Test updating a non-existent item"""
    update_data = {"name": "Item doesn't exist"}
    response = client.put("/items/9999", json=update_data)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_item_no_data(client, test_item):
    """Test updating with no data"""
    response = client.put(f"/items/{test_item.id}", json={})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "No valid fields" in response.json()["detail"]

# ============== Test DELETE routes ==============


def test_delete_item(client, test_item):
    """Test deleting an item"""
    response = client.delete(f"/items/{test_item.id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify it's gone
    response = client.get(f"/items/{test_item.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_item_not_found(client):
    """Test deleting a non-existent item"""
    response = client.delete("/items/9999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
