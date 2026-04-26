from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings
from mongomock_motor import AsyncMongoMockClient

settings = get_settings()

class Database:
    client = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    try:
        db_instance.client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        # Check connection
        await db_instance.client.admin.command('ping')
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        print(f"Connected to MongoDB: {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"Failed to connect to MongoDB, using ASYNC MOCK: {e}")
        # Use mongomock-motor for async testing if local mongo is down
        mock_client = AsyncMongoMockClient()
        db_instance.db = mock_client[settings.DATABASE_NAME]

async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
    print("Closed MongoDB connection")

def get_database():
    return db_instance.db
