import pytest
from fastapi import status
import asyncio
from app.models.item import Item

# Mark all tests in this module as asyncio tests
pytestmark = pytest.mark.asyncio

# ============== Test GET routes async ==============


async def test_async_read_items(async_client, test_item):
    """Test getting all items asynchronously"""
    response = await async_client.get("/items/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Test Item"


async def test_async_read_item(async_client, test_item):
    """Test getting a specific item by ID asynchronously"""
    response = await async_client.get(f"/items/{test_item.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Test Item"
    assert response.json()["price"] == 1000


async def test_async_read_item_not_found(async_client):
    """Test getting a non-existent item asynchronously"""
    response = await async_client.get("/items/9999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "not found" in response.json()["detail"]

# ============== Test POST routes async ==============


async def test_async_create_item(async_client):
    """Test creating a new item asynchronously"""
    item_data = {
        "name": "New Async Item",
        "description": "Created with async test",
        "price": 1500,
        "is_active": True
    }
    response = await async_client.post("/items/", json=item_data)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["name"] == "New Async Item"
    assert response.json()["description"] == "Created with async test"
    assert response.json()["price"] == 1500
    assert "id" in response.json()
    assert "created_at" in response.json()

# ============== Test PUT routes async ==============


async def test_async_update_item(async_client, test_item):
    """Test updating an item asynchronously"""
    update_data = {
        "name": "Async Updated Item",
        "price": 3000
    }
    response = await async_client.put(f"/items/{test_item.id}", json=update_data)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Async Updated Item"
    assert response.json()["price"] == 3000

# ============== Test DELETE routes async ==============


async def test_async_delete_item(async_client, test_item):
    """Test deleting an item asynchronously"""
    response = await async_client.delete(f"/items/{test_item.id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify it's gone
    response = await async_client.get(f"/items/{test_item.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND

# ============== Test error handling ==============


async def test_server_error_handling(async_client, test_db, monkeypatch):
    """Test server error handling by simulating a database error"""

    # Create a test item
    item = Item(name="Error Test Item", price=1000)
    test_db.add(item)
    test_db.commit()
    test_db.refresh(item)

    # Patch the commit method to raise an exception
    def mock_commit_error():
        raise Exception("Simulated database error")

    # Monkeypatch the session's commit method
    monkeypatch.setattr(test_db, "commit", mock_commit_error)

    # Test updating an item - should trigger a 500 error
    update_data = {"name": "This update will fail"}
    response = await async_client.put(f"/items/{item.id}", json=update_data)
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert "error occurred" in response.json()["detail"]

    # Test deleting an item - should also trigger a 500 error
    response = await async_client.delete(f"/items/{item.id}")
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
