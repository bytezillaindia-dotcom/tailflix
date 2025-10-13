import asyncio
import sys
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

# Placeholder base64 image (1x1 transparent PNG)
PLACEHOLDER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

async def insert_sample_pets():
    # Connect to MongoDB
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.tailflix_db
    
    print("🐾 Creating sample pets for testing...")
    
    # Create 3 fake users first
    fake_users = []
    for i, name in enumerate(['Owner_Bruno', 'Owner_Daisy', 'Owner_Rocky'], 1):
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "method": "phone",
            "value": f"555000{i}",
            "display_name": name,
            "city": "Test City",
            "is_verified_human": True,  # Verified so they show in feed
            "moderation_status": "approved",
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow()
        }
        await db.users.insert_one(user)
        fake_users.append(user_id)
        print(f"✅ Created user: {name} (ID: {user_id})")
    
    # Create 3 sample pets
    pets_data = [
        {
            "id": str(uuid.uuid4()),
            "user_id": fake_users[0],
            "pet_name": "Bruno",
            "breed": "Labrador",
            "sex": "Male",
            "birth_year": 2020,
            "temperaments": ["Friendly", "Loyal", "Energetic"],
            "photos": [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE],
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": fake_users[1],
            "pet_name": "Daisy",
            "breed": "Beagle",
            "sex": "Female",
            "birth_year": 2019,
            "temperaments": ["Playful", "Curious", "Friendly"],
            "photos": [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE],
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": fake_users[2],
            "pet_name": "Rocky",
            "breed": "German Shepherd",
            "sex": "Male",
            "birth_year": 2021,
            "temperaments": ["Protective", "Intelligent", "Confident"],
            "photos": [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE],
            "created_at": datetime.utcnow()
        }
    ]
    
    for pet in pets_data:
        await db.pets.insert_one(pet)
        print(f"✅ Created pet: {pet['pet_name']} ({pet['breed']}, {pet['sex']}, born {pet['birth_year']})")
        print(f"   Pet ID: {pet['id']}")
        print(f"   Owner ID: {pet['user_id']}")
    
    # Print summary
    print("\n📊 Summary:")
    total_users = await db.users.count_documents({})
    total_pets = await db.pets.count_documents({})
    print(f"   Total users: {total_users}")
    print(f"   Total pets: {total_pets}")
    print(f"   Verified users: {await db.users.count_documents({'is_verified_human': True})}")
    
    client.close()
    print("\n✅ Sample pets inserted successfully!")

if __name__ == "__main__":
    asyncio.run(insert_sample_pets())
