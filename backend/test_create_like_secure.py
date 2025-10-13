"""
Test createLikeSecure server-side validation:
1. Free user attempts super_like → blocked with error="premium_required"
2. Free user attempts golden_bone → blocked with error="premium_required"  
3. Free user can use like → success
4. Free user can use skip → success
5. Premium user can use super_like → success
6. Premium user can use golden_bone → success
"""

import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path
from urllib import request, parse
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


async def test_create_like_secure():
    print("=" * 80)
    print("TESTING createLikeSecure SERVER-SIDE VALIDATION")
    print("=" * 80)
    
    # Get a test user and pet
    test_user = await db.users.find_one(sort=[("last_login", -1)])
    if not test_user:
        print("❌ No user found")
        return False
    
    user_id = test_user['id']
    
    # Get a pet to like
    pet = await db.pets.find_one({"user_id": {"$ne": user_id}})
    if not pet:
        print("❌ No pets found")
        return False
    
    pet_id = pet['id']
    print(f"✓ Using user: {user_id}")
    print(f"✓ Using pet: {pet_id}")
    
    # Test 1: Free user attempts super_like
    print("\n" + "=" * 80)
    print("TEST 1: Free user attempts super_like → BLOCKED")
    print("=" * 80)
    
    await db.users.update_one({"id": user_id}, {"$set": {"is_premium": False}})
    
    data = json.dumps({"pet_id": pet_id, "action_type": "super_like"}).encode('utf-8')
    req = request.Request(
        'http://localhost:8001/api/likes',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    with request.urlopen(req) as response:
        result = json.loads(response.read())
    
    print(f"Response: {result}")
    
    if result.get('error') == 'premium_required':
        print("✅ TEST 1 PASSED: Free user blocked from super_like")
        print(f"   Message: {result.get('message')}")
    else:
        print("❌ TEST 1 FAILED: Free user was allowed to super_like")
        return False
    
    # Verify no row was inserted
    like_count = await db.likes.count_documents({
        "user_id": user_id,
        "pet_id": pet_id,
        "action_type": "super_like"
    })
    if like_count == 0:
        print("✅ Verified: No super_like row inserted in database")
    else:
        print("❌ Failed: super_like row was inserted despite block")
        return False
    
    # Test 2: Free user attempts golden_bone
    print("\n" + "=" * 80)
    print("TEST 2: Free user attempts golden_bone → BLOCKED")
    print("=" * 80)
    
    data = json.dumps({"pet_id": pet_id, "action_type": "golden_bone"}).encode('utf-8')
    req = request.Request(
        'http://localhost:8001/api/likes',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    with request.urlopen(req) as response:
        result = json.loads(response.read())
    
    print(f"Response: {result}")
    
    if result.get('error') == 'premium_required':
        print("✅ TEST 2 PASSED: Free user blocked from golden_bone")
        print(f"   Message: {result.get('message')}")
    else:
        print("❌ TEST 2 FAILED: Free user was allowed to golden_bone")
        return False
    
    # Test 3: Free user can use like
    print("\n" + "=" * 80)
    print("TEST 3: Free user can use like → ALLOWED")
    print("=" * 80)
    
    data = json.dumps({"pet_id": pet_id, "action_type": "like"}).encode('utf-8')
    req = request.Request(
        'http://localhost:8001/api/likes',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    with request.urlopen(req) as response:
        result = json.loads(response.read())
    
    print(f"Response keys: {result.keys()}")
    
    if 'id' in result and result.get('action_type') == 'like':
        print("✅ TEST 3 PASSED: Free user allowed to like")
        print(f"   Like ID: {result['id']}")
    else:
        print("❌ TEST 3 FAILED: Free user blocked from like")
        return False
    
    # Test 4: Free user can use skip
    print("\n" + "=" * 80)
    print("TEST 4: Free user can use skip → ALLOWED")
    print("=" * 80)
    
    data = json.dumps({"pet_id": pet_id, "action_type": "skip"}).encode('utf-8')
    req = request.Request(
        'http://localhost:8001/api/likes',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    with request.urlopen(req) as response:
        result = json.loads(response.read())
    
    if 'id' in result and result.get('action_type') == 'skip':
        print("✅ TEST 4 PASSED: Free user allowed to skip")
        print(f"   Skip ID: {result['id']}")
    else:
        print("❌ TEST 4 FAILED: Free user blocked from skip")
        return False
    
    # Test 5: Premium user can use super_like
    print("\n" + "=" * 80)
    print("TEST 5: Premium user can use super_like → ALLOWED")
    print("=" * 80)
    
    await db.users.update_one({"id": user_id}, {"$set": {"is_premium": True}})
    
    data = json.dumps({"pet_id": pet_id, "action_type": "super_like"}).encode('utf-8')
    req = request.Request(
        'http://localhost:8001/api/likes',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    with request.urlopen(req) as response:
        result = json.loads(response.read())
    
    if 'id' in result and result.get('action_type') == 'super_like':
        print("✅ TEST 5 PASSED: Premium user allowed to super_like")
        print(f"   Super Like ID: {result['id']}")
    else:
        print("❌ TEST 5 FAILED: Premium user blocked from super_like")
        print(f"   Result: {result}")
        return False
    
    # Test 6: Premium user can use golden_bone
    print("\n" + "=" * 80)
    print("TEST 6: Premium user can use golden_bone → ALLOWED")
    print("=" * 80)
    
    data = json.dumps({"pet_id": pet_id, "action_type": "golden_bone"}).encode('utf-8')
    req = request.Request(
        'http://localhost:8001/api/likes',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    with request.urlopen(req) as response:
        result = json.loads(response.read())
    
    if 'id' in result and result.get('action_type') == 'golden_bone':
        print("✅ TEST 6 PASSED: Premium user allowed to golden_bone")
        print(f"   Golden Bone ID: {result['id']}")
    else:
        print("❌ TEST 6 FAILED: Premium user blocked from golden_bone")
        return False
    
    # Reset user to free
    await db.users.update_one({"id": user_id}, {"$set": {"is_premium": False}})
    
    print("\n" + "=" * 80)
    print("SUMMARY: createLikeSecure SERVER-SIDE VALIDATION")
    print("=" * 80)
    print("✅ Free users blocked from super_like (error='premium_required')")
    print("✅ Free users blocked from golden_bone (error='premium_required')")
    print("✅ Free users allowed to use like")
    print("✅ Free users allowed to use skip")
    print("✅ Premium users allowed to use super_like")
    print("✅ Premium users allowed to use golden_bone")
    print("\n🔒 SECURITY: Premium features now enforced server-side")
    print("💰 REVENUE: Free users must upgrade to use premium features")
    print("=" * 80)
    
    return True


if __name__ == "__main__":
    success = asyncio.run(test_create_like_secure())
    sys.exit(0 if success else 1)
