# FastAPI CRUD with PostgreSQL

A simple RESTful API with CRUD operations using FastAPI and PostgreSQL.

## Prerequisites

- Python 3.8+
- PostgreSQL

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd fastapi-crud
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure your database:

Edit the `.env` file and update the `DATABASE_URL` with your PostgreSQL credentials.

5. Start PostgreSQL and create a database:
```bash
createdb fastapi_crud
```

## Running the application

Run the server with:
```bash
python run.py
```

The API will be available at http://localhost:8000

## API Documentation

Once the application is running, you can access:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /items | Get all items |
| GET | /items/{item_id} | Get a specific item |
| POST | /items | Create a new item |
| PUT | /items/{item_id} | Update an existing item |
| DELETE | /items/{item_id} | Delete an item |

## Running Tests

The project includes a comprehensive test suite that covers models, schemas, database operations, and API endpoints.

Run the tests with:
```bash
pytest
```

Run with coverage report:
```bash
pytest --cov=app tests/
```

Run specific test categories:
```bash
# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration

# Run only database tests
pytest -m database
```

The tests use SQLite as a database backend for faster execution and to avoid affecting your production PostgreSQL database. 