import os
import pytest
import asyncio
from typing import AsyncGenerator, Generator
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from httpx import AsyncClient
from app.database.database import Base, get_db
from app.main import app
from app.models.item import Item

# Use SQLite for testing
TEST_DATABASE_URL = "sqlite:///./test.db"

# Create test database engine
engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def test_db():
    # Create the tables
    Base.metadata.create_all(bind=engine)

    # Create a new session and yield it
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db) -> Generator:
    """
    Create a new FastAPI TestClient that uses the `test_db` fixture
    """
    # Override the get_db dependency to use the test database
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    # Remove the override after the test is complete
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
async def async_client(test_db) -> AsyncGenerator:
    """
    Create a new AsyncClient for testing
    """
    # Override the get_db dependency to use the test database
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    # Remove the override after the test is complete
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_item(test_db):
    """
    Create a test item in the database
    """
    item = Item(
        name="Test Item",
        description="This is a test item",
        price=1000,
        is_active=True
    )
    test_db.add(item)
    test_db.commit()
    test_db.refresh(item)
    return item
