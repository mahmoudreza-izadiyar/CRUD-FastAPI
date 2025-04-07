import os
import psycopg2
from dotenv import load_dotenv
from sqlalchemy import create_engine
from app.database.database import Base

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
DB_NAME = DATABASE_URL.split("/")[-1]
DB_USER = DATABASE_URL.split("://")[1].split(":")[0]
DB_PASSWORD = DATABASE_URL.split(":")[2].split("@")[0]
DB_HOST = DATABASE_URL.split("@")[1].split(":")[0]
DB_PORT = DATABASE_URL.split(":")[3].split("/")[0]


def create_database():
    """Create the PostgreSQL database if it doesn't exist."""
    # Connect to the PostgreSQL server without specifying a database
    conn = psycopg2.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        database="postgres"  # Connect to default postgres database
    )
    conn.autocommit = True  # Autocommit to create database

    cursor = conn.cursor()

    # Check if database exists
    cursor.execute(
        f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
    exists = cursor.fetchone()

    if not exists:
        print(f"Creating database {DB_NAME}...")
        cursor.execute(f"CREATE DATABASE {DB_NAME}")
        print(f"Database {DB_NAME} created successfully!")
    else:
        print(f"Database {DB_NAME} already exists.")

    cursor.close()
    conn.close()


def create_tables():
    """Create the database tables using SQLAlchemy models."""
    from app.models import item
    from app.database.database import engine

    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")


if __name__ == "__main__":
    create_database()
    create_tables()
    print("Database initialization completed!")
