# FastAPI CRUD with PostgreSQL

A comprehensive full-stack application featuring a RESTful API with CRUD operations using FastAPI backend and a React frontend, with PostgreSQL as the database.

## Prerequisites

- Python 3.8+ (Tested with Python 3.12)
- PostgreSQL 13+ (Running on port 5432)
- Node.js 14+ and npm (Tested with Node.js 22.3.0)
- Git

## Environment Setup

### Database Setup

1. Make sure PostgreSQL is running on your system:
   ```bash
   # Check if PostgreSQL is running
   pg_isready -h localhost -p 5432
   ```

2. If you're using Docker for PostgreSQL:
   ```bash
   # Start PostgreSQL with Docker
   docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
   ```

### Backend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fastapi-crud
   ```

2. Create and activate a virtual environment:
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # On macOS/Linux:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your database:
   - Edit the `.env` file and update the `DATABASE_URL` with your PostgreSQL credentials.
   - Default configuration:
     ```
     DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fastapi_crud
     SECRET_KEY=your_secret_key_here
     ```

5. Initialize the database:
   ```bash
   python init_db.py
   ```
   This will:
   - Create the database if it doesn't exist
   - Create required tables
   - Set up initial schema

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Return to the project root:
   ```bash
   cd ..
   ```

## Running the Application

### Method 1: Running Backend and Frontend Separately (Recommended)

1. Start the backend server:
   ```bash
   # From the project root directory
   python run.py
   ```
   The API will be available at http://localhost:8000

2. In a new terminal window, start the frontend development server:
   ```bash
   # From the project root directory
   cd frontend
   npm start
   ```
   The frontend will be available at http://localhost:3000

### Method 2: Running Both Together

For convenience, you can run both the backend and frontend with a single command:
```bash
# From the project root directory
chmod +x run_dev.sh  # Make the script executable (only needed once)
./run_dev.sh
```

## Troubleshooting Common Issues

### Port Conflicts

- **Backend (Port 8000)**: If you get an error like `Address already in use`, another process is using port 8000.
  ```bash
  # Find processes using port 8000
  lsof -i :8000
  
  # Kill the processes
  kill <PID>
  ```

- **Frontend (Port 3000)**: If prompted that something is already running on port 3000, either:
  - Choose 'Y' to use a different port
  - Or terminate the existing process and restart:
    ```bash
    # Find processes using port 3000
    lsof -i :3000
    
    # Kill the processes
    kill <PID>
    ```

### Database Connectivity Issues

- Ensure PostgreSQL is running
- Check database credentials in `.env` file
- Verify the database exists:
  ```bash
  psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='fastapi_crud';"
  ```

### Node.js Errors

- If you encounter npm errors, try:
  ```bash
  # Clean npm cache
  npm cache clean --force
  
  # Reinstall dependencies
  cd frontend
  rm -rf node_modules
  npm install
  ```

## API Documentation

Once the backend is running, you can access:

- Interactive API documentation with Swagger UI: http://localhost:8000/docs
- Alternative API documentation with ReDoc: http://localhost:8000/redoc

## API Endpoints

| Method | URL | Description | Query Parameters |
|--------|-----|-------------|-----------------|
| GET | /items/ | Get all items | `name`, `min_price`, `max_price`, `is_active`, `skip`, `limit` |
| GET | /items/{item_id} | Get a specific item | - |
| POST | /items/ | Create a new item | - |
| PUT | /items/{item_id} | Update an existing item | - |
| DELETE | /items/{item_id} | Delete an item | - |

### Example API Requests

#### Create an Item
```bash
curl -X POST "http://localhost:8000/items/" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Product","description":"This is a great product","price":1999,"is_active":true}'
```

#### Get All Items
```bash
curl -X GET "http://localhost:8000/items/"
```

#### Filter Items
```bash
curl -X GET "http://localhost:8000/items/?name=New&min_price=1000&max_price=5000&is_active=true"
```

## Frontend Features

The React frontend provides a user-friendly interface for managing items:

- View all items in a responsive card grid layout
- Search items by name
- Filter items by price range and active status
- Add new items with form validation
- Edit existing items
- Delete items with confirmation
- Toast notifications for actions
- Responsive design for all devices

## Project Structure
```
fastapi-crud/
├── app/                  # Backend application
│   ├── database/         # Database configuration
│   ├── models/           # SQLAlchemy models
│   ├── routes/           # API routes and handlers
│   ├── schemas/          # Pydantic schemas
│   └── main.py           # FastAPI application
├── alembic/              # Database migrations
├── frontend/             # React frontend
│   ├── public/           # Static files
│   └── src/              # React source code
│       ├── api/          # API client
│       └── components/   # React components
├── tests/                # Test suite
├── .env                  # Environment variables
├── init_db.py            # Database initialization script
├── requirements.txt      # Python dependencies
├── run.py                # Backend server script
└── run_dev.sh            # Development script (backend + frontend)
```

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