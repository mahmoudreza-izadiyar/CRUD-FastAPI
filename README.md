# FastAPI CRUD with PostgreSQL

A simple RESTful API with CRUD operations using FastAPI and PostgreSQL.

## Prerequisites

- Python 3.8+
- PostgreSQL
- Node.js 14+ and npm (for frontend)

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

3. Install backend dependencies:
```bash
pip install -r requirements.txt
```

4. Configure your database:

Edit the `.env` file and update the `DATABASE_URL` with your PostgreSQL credentials.

5. Start PostgreSQL and create a database:
```bash
createdb fastapi_crud
```

6. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

## Running the application

### Running backend and frontend separately

1. Start the backend server:
```bash
python run.py
```

The API will be available at http://localhost:8000

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The frontend will be available at http://localhost:3000

### Running both together

For convenience, you can run both the backend and frontend with a single command:

```bash
./run_dev.sh
```

## API Documentation

Once the backend is running, you can access:

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

## Frontend Features

The React frontend provides a user-friendly interface for managing items:

- View all items in a responsive card grid layout
- Search and filter items by name, price range, and status
- Add new items with form validation
- Edit existing items
- Delete items with confirmation
- Toast notifications for actions
- Responsive design for all devices

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