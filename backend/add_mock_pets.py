#!/usr/bin/env python3
"""
Add 10 diverse mock pet profiles to TailFlix
Each profile includes: name, breed, age, temperaments, bio, photos, and verified owner
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# Mock base64 image placeholder (1x1 pixel)
MOCK_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

MOCK_PETS = [
    {
        "pet_name": "Max",
        "breed": "Golden Retriever",
        "sex": "Male",
        "birth_year": 2020,
        "temperaments": ["Friendly", "Energetic", "Loyal"],
        "bio": "Hi! I'm Max and I love long walks, playing fetch, and making new friends. My favorite thing is swimming at the beach! 🌊",
        "photos": [MOCK_IMAGE],
    },
    {
        "pet_name": "Luna",
        "breed": "Siberian Husky",
        "sex": "Female",
        "birth_year": 2019,
        "temperaments": ["Playful", "Independent", "Adventurous"],
        "bio": "Luna here! I'm an adventurous spirit who loves hiking and snow. Looking for a buddy to explore the great outdoors with! ⛰️",
        "photos": [MOCK_IMAGE],
    },
    {
        "pet_name": "Charlie",
        "breed": "Labrador Retriever",
        "sex": "Male",
        "birth_year": 2021,
        "temperaments": ["Gentle", "Social", "Intelligent"],
        "bio": "Charlie's my name, and fun is my game! I'm great with kids and other dogs. Let's have a playdate at the park! 🎾",
        "photos": [MOCK_IMAGE],
    },
    {
        "pet_name": "Bella",
        "breed": "French Bulldog",
        "sex": "Female",
        "birth_year": 2022,
        "temperaments": ["Affectionate", "Calm", "Charming"],
        "bio": "Bonjour! I'm Bella, a little lady with a big heart. I enjoy cuddles, short walks, and lots of treats! 💕",
        "photos": [MOCK_IMAGE],
    },
    {
        "pet_name": "Rocky",
        "breed": "German Shepherd",
        "sex": "Male",
        "birth_year": 2018,
        "temperaments": ["Protective", "Confident", "Courageous"],
        "bio": "Rocky reporting for duty! I'm a loyal companion who loves training, running, and protecting my pack. Seek adventure partner! 🦴",
        "photos": [MOCK_IMAGE],
    },
    {
        "pet_name": "Daisy",
        "breed": "Beagle",
        "sex": "Female",
        "birth_year": 2020,
        "temperaments": ["Curious", "Merry", "Friendly"],
        "bio": "Daisy here! I follow my nose everywhere and love sniffing out new adventures. Always up for a good snuggle session too! 🌼",
        "photos": [MOCK_IMAGE],
    },
    {
        "pet_name": "Cooper",
        "breed": "Australian Shepherd",
        "sex": "Male",
        "birth_year": 2021,
        "temperaments": ["Smart", "Active", "Devoted"],
        "bio": "G'day! I'm Cooper, and I'm always ready for action. I love agility, frisbee, and learning new tricks. Let's play! 🥏",
        "photos": [MOCK_IMAGE],
    },
    {
        "pet_name": "Sadie",
        "breed": "Poodle",
        "sex": "Female",
        "birth_year": 2019,
        "temperaments": ["Elegant", "Athletic", "Graceful"],
        "bio": "Hello darling! I'm Sadie, a sophisticated pup who enjoys grooming sessions, gentle walks, and refined company. 💅",
        "photos": [MOCK_IMAGE],
    },
    {
        "pet_name": "Duke",
        "breed": "Rottweiler",
        "sex": "Male",
        "birth_year": 2020,
        "temperaments": ["Confident", "Loyal", "Good-natured"],
        "bio": "Duke's the name! Don't let my size fool you - I'm a gentle giant who loves belly rubs and playing with my favorite toys! 🧸",
        "photos": [MOCK_IMAGE],
    },
    {
        "pet_name": "Ruby",
        "breed": "Corgi",
        "sex": "Female",
        "birth_year": 2022,
        "temperaments": ["Affectionate", "Bold", "Playful"],
        "bio": "Ruby at your service! Short legs, big personality! I love herding things (including my humans) and endless playtime! 👑",
        "photos": [MOCK_IMAGE],
    },
]

async def create_mock_pets():
    """Create 10 verified pets with verified owners"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.tailflix
    
    print("\n" + "="*80)
    print("ADDING 10 MOCK PET PROFILES TO TAILFLIX")
    print("="*80 + "\n")
    
    # Create a verified owner for each pet
    for i, pet_data in enumerate(MOCK_PETS, 1):
        # Create verified owner
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "method": "phone",
            "value": f"+155500{i:05d}",
            "is_verified_human": True,
            "is_premium": i % 3 == 0,  # Every 3rd user is premium
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
        }
        
        await db.users.insert_one(user)
        print(f"✓ Created verified owner: {user['value']}")
        
        # Create pet
        pet = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "pet_name": pet_data["pet_name"],
            "breed": pet_data["breed"],
            "sex": pet_data["sex"],
            "birth_year": pet_data["birth_year"],
            "temperaments": pet_data["temperaments"],
            "bio": pet_data.get("bio", ""),
            "photos": pet_data["photos"],
            "created_at": datetime.utcnow(),
        }
        
        await db.pets.insert_one(pet)
        
        age = 2025 - pet_data["birth_year"]
        premium_status = "PREMIUM" if user["is_premium"] else "FREE"
        print(f"  ✓ Pet: {pet_data['pet_name']} ({pet_data['breed']}, {age}y) - {premium_status}")
        print(f"     Bio: {pet_data['bio'][:60]}...")
        print(f"     Tags: {', '.join(pet_data['temperaments'])}")
        print()
    
    # Print summary
    total_users = await db.users.count_documents({})
    total_pets = await db.pets.count_documents({})
    verified_users = await db.users.count_documents({"is_verified_human": True})
    premium_users = await db.users.count_documents({"is_premium": True})
    
    print("="*80)
    print("SUMMARY")
    print("="*80)
    print(f"Total Users: {total_users}")
    print(f"Verified Users: {verified_users}")
    print(f"Premium Users: {premium_users}")
    print(f"Total Pets: {total_pets}")
    print("\n✅ All 10 mock pet profiles added successfully!")
    print("🐾 These pets are now available in Fetch Yard!")
    print("="*80 + "\n")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_mock_pets())
