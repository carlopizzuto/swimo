import os
import sys
import argparse
import logging
from pathlib import Path
from datetime import datetime
from sqlalchemy import text
from sqlmodel import SQLModel

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the parent directory to sys.path to allow imports from app
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.db import engine, prod_engine, Session
from app.models import User, Movie, Swipe


def drop_all_tables(db_engine):
    """Drop all existing tables."""
    logger.info("Dropping all existing tables...")
    
    with Session(db_engine) as session:
        # Drop tables in reverse dependency order to avoid foreign key constraints
        tables_to_drop = ['swipes', 'movies', 'users']
        
        for table in tables_to_drop:
            try:
                session.exec(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
                logger.info(f"Dropped table: {table}")
            except Exception as e:
                logger.warning(f"Could not drop table {table}: {e}")
        
        session.commit()
    
    logger.info("Finished dropping tables")


def create_all_tables(db_engine):
    """Create all tables from SQLModel definitions."""
    logger.info("Creating all tables...")
    
    try:
        # This will create all tables defined in the models
        SQLModel.metadata.create_all(db_engine)
        logger.info("Successfully created all tables")
        
        # Verify tables were created
        with Session(db_engine) as session:
            tables = ['users', 'movies', 'swipes']
            for table in tables:
                try:
                    result = session.exec(text(f"SELECT 1 FROM {table} LIMIT 1"))
                    logger.info(f"✓ Table '{table}' created successfully")
                except Exception as e:
                    logger.error(f"✗ Table '{table}' verification failed: {e}")
                    
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        raise


def rebuild_database(db_engine, drop_existing: bool = True):
    """Rebuild the database by dropping and recreating all tables."""
    logger.info("Starting database rebuild...")
    
    if drop_existing:
        drop_all_tables(db_engine)
    
    create_all_tables(db_engine)
    
    logger.info("Database rebuild completed successfully")


def check_database_connection(db_engine):
    """Test database connection."""
    logger.info("Testing database connection...")
    
    try:
        with Session(db_engine) as session:
            session.exec(text("SELECT 1"))
        logger.info("✓ Database connection successful")
        return True
    except Exception as e:
        logger.error(f"✗ Database connection failed: {e}")
        return False


def main():
    """Main function with command-line argument parsing."""
    parser = argparse.ArgumentParser(description='Rebuild database tables')
    parser.add_argument(
        '--production_db', '-P',
        action='store_true',
        help='Use production database instead of development database'
    )
    parser.add_argument(
        '--no-drop', '-n',
        action='store_true',
        help='Create tables without dropping existing ones first'
    )
    parser.add_argument(
        '--check-connection', '-c',
        action='store_true',
        help='Only test database connection without rebuilding'
    )
    parser.add_argument(
        '--force', '-f',
        action='store_true',
        help='Force rebuild without confirmation prompt'
    )
    
    args = parser.parse_args()
    
    # Determine which database engine to use
    db_engine = prod_engine if args.production_db else engine
    db_type = "production" if args.production_db else "development"
    
    logger.info(f"Starting database operations at {datetime.now()}")
    logger.info(f"Database: {db_type}")
    
    # Check database connection
    if not check_database_connection(db_engine):
        logger.error("Cannot proceed without database connection")
        sys.exit(1)
    
    # If only checking connection, exit here
    if args.check_connection:
        logger.info("Connection check completed")
        return
    
    # Confirmation prompt for destructive operations
    if not args.no_drop and not args.force:
        if args.production_db:
            response = input(f"⚠️  WARNING: This will DROP ALL TABLES in the PRODUCTION database! Type 'yes' to continue: ")
        else:
            response = input(f"This will drop and recreate all tables in the {db_type} database. Continue? (y/N): ")
        
        if args.production_db and response != 'yes':
            logger.info("Operation cancelled")
            return
        elif not args.production_db and response.lower() not in ['y', 'yes']:
            logger.info("Operation cancelled")
            return
    
    # Perform database rebuild
    try:
        rebuild_database(db_engine, drop_existing=not args.no_drop)
        logger.info(f"Database rebuild completed successfully at {datetime.now()}")
        
        if not args.no_drop:
            logger.info("💡 Tip: You may want to run the seed script to populate the database with sample data")
            
    except Exception as e:
        logger.error(f"Database rebuild failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 