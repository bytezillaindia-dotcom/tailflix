"""
Insert 3 sample pets for testing PetFeed:
1. Bruno (Labrador, 2020, Friendly)
2. Daisy (Beagle, 2019, Playful)
3. Rocky (German Shepherd, 2021, Protective)

Each pet has a fake verified user as owner.
"""

import asyncio
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


async def insert_sample_pets():
    print("=" * 80)
    print("INSERTING SAMPLE PETS FOR TESTING")
    print("=" * 80)
    
    # Sample pet data
    pets_data = [
        {
            "name": "Bruno",
            "breed": "Labrador",
            "birth_year": 2020,
            "temperament": "Friendly",
            "user_suffix": "1",
            "description": "Loves playing fetch and meeting new furry friends!"
        },
        {
            "name": "Daisy",
            "breed": "Beagle",
            "birth_year": 2019,
            "temperament": "Playful",
            "user_suffix": "2",
            "description": "Always up for an adventure and belly rubs!"
        },
        {
            "name": "Rocky",
            "breed": "German Shepherd",
            "birth_year": 2021,
            "temperament": "Protective",
            "user_suffix": "3",
            "description": "Loyal companion who loves long walks and training sessions!"
        }
    ]
    
    # Placeholder base64 dog image (simple 1x1 pixel)
    placeholder_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    created_pets = []
    
    for pet_data in pets_data:
        print(f"\n{'='*80}")
        print(f"Creating: {pet_data['name']} the {pet_data['breed']}")
        print(f"{'='*80}")
        
        # Create fake user
        user_id = f"fake_user_{pet_data['user_suffix']}"
        user_email = f"fake_user_{pet_data['user_suffix']}@example.com"
        
        # Check if user already exists
        existing_user = await db.users.find_one({"id": user_id})
        
        if existing_user:
            print(f"✓ User {user_id} already exists")
        else:
            user_doc = {
                "id": user_id,
                "method": "email",
                "value": user_email,
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow(),
                "is_verified_human": True,  # Mark as verified
                "is_premium": False,
                "golden_bones_used_this_month": 0,
                "golden_bones_reset_date": datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            }
            
            await db.users.insert_one(user_doc)
            print(f"✓ Created user: {user_id} (verified)")
        
        # Create pet
        pet_id = str(uuid.uuid4())
        pet_doc = {
            "id": pet_id,
            "user_id": user_id,  # Link to fake user
            "pet_name": pet_data["name"],
            "pet_type": "dog",
            "breed": pet_data["breed"],
            "birth_year": pet_data["birth_year"],
            "temperament": [pet_data["temperament"]],
            "bio": pet_data["description"],
            "photos": [placeholder_image],
            "created_at": datetime.utcnow()
        }
        
        # Check if pet already exists
        existing_pet = await db.pets.find_one({"pet_name": pet_data["name"], "user_id": user_id})
        
        if existing_pet:
            print(f"✓ Pet {pet_data['name']} already exists")
            created_pets.append(existing_pet)
        else:
            await db.pets.insert_one(pet_doc)
            print(f"✓ Created pet: {pet_data['name']}")
            print(f"  - Breed: {pet_data['breed']}")
            print(f"  - Birth Year: {pet_data['birth_year']}")
            print(f"  - Temperament: {pet_data['temperament']}")
            print(f"  - Owner: {user_id}")
            created_pets.append(pet_doc)
    
    # Verify pets are in database
    print(f"\n{'='*80}")
    print("VERIFICATION")
    print(f"{'='*80}")
    
    total_pets = await db.pets.count_documents({})
    verified_users = await db.users.count_documents({"is_verified_human": True})
    
    print(f"✓ Total pets in database: {total_pets}")
    print(f"✓ Total verified users: {verified_users}")
    
    # Test: Get pet feed for a real user
    print(f"\n{'='*80}")
    print("TESTING: PetFeed Query")
    print(f"{'='*80}")
    
    # Get a real user (not one of the fake users)
    real_user = await db.users.find_one({
        "id": {"$nin": ["fake_user_1", "fake_user_2", "fake_user_3"]},
        "is_verified_human": True
    })
    
    if real_user:
        current_user_id = real_user['id']
        print(f"✓ Testing with real user: {current_user_id}")
        
        # Get all pet IDs that the user has already interacted with
        user_interactions = await db.likes.find({"user_id": current_user_id}).to_list(10000)
        interacted_pet_ids = [like['pet_id'] for like in user_interactions]
        
        # Find verified users only
        verified_users_docs = await db.users.find({"is_verified_human": True}).to_list(10000)
        verified_user_ids = [user['id'] for user in verified_users_docs]
        
        # Build query to get eligible pets (same as PetFeed API)
        query = {
            "user_id": {"$ne": current_user_id, "$in": verified_user_ids},
            "id": {"$nin": interacted_pet_ids}
        }
        
        eligible_pets = await db.pets.find(query).limit(10).to_list(10)
        
        print(f"✓ Eligible pets for feed: {len(eligible_pets)}")
        
        # Check if our sample pets are in the feed
        sample_pet_names = ["Bruno", "Daisy", "Rocky"]
        for pet in eligible_pets:
            if pet['pet_name'] in sample_pet_names:
                print(f"  ✅ {pet['pet_name']} the {pet['breed']} - IN FEED")
        
        # Count how many of our sample pets are in the feed
        sample_in_feed = sum(1 for pet in eligible_pets if pet['pet_name'] in sample_pet_names)
        if sample_in_feed > 0:
            print(f"\n✅ SUCCESS: {sample_in_feed}/3 sample pets visible in feed")
        else:
            print(f"\n⚠️  WARNING: No sample pets in feed (may have been interacted with)")
    else:
        print("⚠️  No real verified user found for testing")
    
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print("✅ Created 3 fake verified users (fake_user_1, fake_user_2, fake_user_3)")
    print("✅ Created 3 sample pets (Bruno, Daisy, Rocky)")
    print("✅ All fake users marked as verified (is_verified_human=true)")
    print("✅ Pets have placeholder images")
    print("✅ Pets will appear in PetFeed for real users")
    print(f"{'='*80}")
    
    return True


if __name__ == "__main__":
    success = asyncio.run(insert_sample_pets())
    print("\n✨ Done! Sample pets are ready for testing.")
