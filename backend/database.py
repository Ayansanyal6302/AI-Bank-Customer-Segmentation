import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DB = os.getenv("MYSQL_DB", "customer_segmentation")

use_mysql = False
try:
    import pymysql
    conn = pymysql.connect(host=MYSQL_HOST, port=int(MYSQL_PORT), user=MYSQL_USER, password=MYSQL_PASSWORD)
    cursor = conn.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DB}")
    cursor.close()
    conn.close()
    use_mysql = True
except Exception as e:
    print(f"Warning: Could not create/check MySQL database. {e}")

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"

if use_mysql:
    try:
        from sqlalchemy.pool import NullPool
        engine = create_engine(SQLALCHEMY_DATABASE_URL, poolclass=NullPool)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    except Exception as e:
        print(f"Warning: Could not connect to MySQL database '{MYSQL_DB}'. {e}")
        use_mysql = False

if not use_mysql:
    print("MySQL is not available. Falling back to SQLite database: fallback.db")
    # Fallback to sqlite for smooth development if mysql is not ready
    engine = create_engine("sqlite:///./fallback.db", connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
