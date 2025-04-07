from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import item, auth
from app.database.database import engine
from app.models import item as item_model
from app.models import user as user_model

# Create the database tables
item_model.Base.metadata.create_all(bind=engine)
user_model.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FastAPI CRUD with PostgreSQL",
    description="A simple API with CRUD operations using FastAPI and PostgreSQL",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(item.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "Welcome to FastAPI CRUD API"}
