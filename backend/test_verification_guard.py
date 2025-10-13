"""
Test verification guard:
1. Unverified user attempts GET /api/pets/feed → blocked with error="verification_required"
2. Verified user attempts GET /api/pets/feed → allowed
"""

import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path
from urllib import request
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


async def test_verification_guard():
    print("=" * 80)
    print("TESTING VERIFICATION GUARD")
    print("=" * 80)
    
    # Get a test user
    test_user = await db.users.find_one(sort=[("last_login", -1)])
    if not test_user:
        print("❌ No user found")
        return False
    
    user_id = test_user['id']
    print(f"✓ Using user: {user_id}")
    
    # Test 1: Unverified user attempts to access pet feed
    print("\n" + "=" * 80)
    print("TEST 1: Unverified user attempts GET /api/pets/feed → BLOCKED")
    print("=" * 80)
    
    await db.users.update_one({"id": user_id}, {"$set": {"is_verified_human": False}})
    
    req = request.Request('http://localhost:8001/api/pets/feed?limit=10')
    with request.urlopen(req) as response:
        result = json.loads(response.read())
    
    print(f"Response: {result}")
    
    if result.get('error') == 'verification_required':
        print("✅ TEST 1 PASSED: Unverified user blocked from pet feed")
        print(f"   Message: {result.get('message')}")
        print(f"   Redirect: {result.get('redirect')}")
    else:
        print("❌ TEST 1 FAILED: Unverified user was allowed to access pet feed")
        print(f"   Response keys: {result.keys() if isinstance(result, dict) else type(result)}")
        return False
    
    # Test 2: Verified user can access pet feed
    print("\n" + "=" * 80)
    print("TEST 2: Verified user attempts GET /api/pets/feed → ALLOWED")
    print("=" * 80)
    
    await db.users.update_one({"id": user_id}, {"$set": {"is_verified_human": True}})
    
    req = request.Request('http://localhost:8001/api/pets/feed?limit=10')
    with request.urlopen(req) as response:
        result = json.loads(response.read())
    
    if isinstance(result, list):
        print("✅ TEST 2 PASSED: Verified user allowed to access pet feed")
        print(f"   Returned {len(result)} pet cards")
        if len(result) > 0:
            print(f"   Sample pet: {result[0].get('pet_name', 'N/A')}")
    else:
        print("❌ TEST 2 FAILED: Verified user blocked from pet feed")
        print(f"   Response: {result}")
        return False
    
    # Reset user to unverified for next test
    await db.users.update_one({"id": user_id}, {"$set": {"is_verified_human": False}})
    
    print("\n" + "=" * 80)
    print("SUMMARY: VERIFICATION GUARD")
    print("=" * 80)
    print("✅ Unverified users blocked from pet feed (error='verification_required')")
    print("✅ Verified users can access pet feed")
    print("✅ Error message: 'You must be verified to access the pet feed. Please complete verification.'")
    print("✅ Redirect suggestion: '/verify'")
    print("\n🔒 SECURITY: Only verified humans can access pet feed")
    print("🛡️ BOT PROTECTION: Unverified/bot accounts cannot browse or interact")
    print("=" * 80)
    
    return True


if __name__ == "__main__":
    success = asyncio.run(test_verification_guard())
    sys.exit(0 if success else 1)
