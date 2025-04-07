from fastapi import FastAPI
from app.routes import item
from app.database.database import engine
from app.models import item as item_model

# Create the database tables
item_model.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FastAPI CRUD with PostgreSQL",
    description="A simple API with CRUD operations using FastAPI and PostgreSQL",
    version="0.1.0",
)

# Include routers
app.include_router(item.router)


@app.get("/")
def root():
    return {"message": "Welcome to FastAPI CRUD API"}
