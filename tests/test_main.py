import pytest
from fastapi import status
from app.main import app


def test_root_endpoint(client):
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
    assert "message" in response.json()
    assert "Welcome to FastAPI CRUD API" in response.json()["message"]


def test_docs_availability(client):
    """Test that API documentation is available"""
    response = client.get("/docs")
    assert response.status_code == status.HTTP_200_OK

    response = client.get("/redoc")
    assert response.status_code == status.HTTP_200_OK

    response = client.get("/openapi.json")
    assert response.status_code == status.HTTP_200_OK
    assert "openapi" in response.json()
    assert "paths" in response.json()
    assert "/items/" in response.json()["paths"]
    assert "/items/{item_id}" in response.json()["paths"]


def test_app_title_and_version():
    """Test application metadata"""
    assert app.title == "FastAPI CRUD with PostgreSQL"
    assert "CRUD operations" in app.description
    assert app.version == "0.1.0"


def test_404_handling(client):
    """Test handling of 404 errors for non-existent routes"""
    response = client.get("/non-existent-route")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_method_not_allowed(client):
    """Test handling of method not allowed errors"""
    # Root endpoint only accepts GET
    response = client.post("/")
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
