import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Make sure 'your_password' matches your pgAdmin/PostgreSQL password!
DATABASE_URL = "postgresql://postgres:27062006@localhost:5432/campusos_db"

# 2. Create the connection engine
engine = create_engine(DATABASE_URL)

# 3. Create the session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Modern way to create the Base class in newer SQLAlchemy versions
Base = declarative_base()

# 5. Database session helper for our API routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()