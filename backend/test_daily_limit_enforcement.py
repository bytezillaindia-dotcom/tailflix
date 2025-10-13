"""
Test server-side daily limit enforcement:
1. Free user makes 10 like actions → all succeed
2. Free user makes 11th like action → blocked with error="daily_limit_reached"
3. Premium user makes 15 like actions → all succeed (unlimited)
4. Skip actions don't count toward limit
"""

import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
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


async def test_daily_limit_enforcement():
    print("=" * 80)
    print("TESTING SERVER-SIDE DAILY LIMIT ENFORCEMENT")
    print("=" * 80)
    
    # Get test user and pet
    test_user = await db.users.find_one(sort=[("last_login", -1)])
    if not test_user:
        print("❌ No user found")
        return False
    
    user_id = test_user['id']
    
    pet = await db.pets.find_one({"user_id": {"$ne": user_id}})
    if not pet:
        print("❌ No pets found")
        return False
    
    pet_id = pet['id']
    print(f"✓ Using user: {user_id}")
    print(f"✓ Using pet: {pet_id}")
    
    # Clean up today's actions
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    await db.likes.delete_many({
        "user_id": user_id,
        "created_at": {"$gte": today_start, "$lt": today_end}
    })
    
    # Test 1: Free user makes 10 like actions
    print("\n" + "=" * 80)
    print("TEST 1: Free user makes 10 like actions → ALL SUCCEED")
    print("=" * 80)
    
    await db.users.update_one({"id": user_id}, {"$set": {"is_premium": False}})
    
    for i in range(10):
        data = json.dumps({"pet_id": pet_id, "action_type": "like"}).encode('utf-8')
        req = request.Request(
            'http://localhost:8001/api/likes',
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        with request.urlopen(req) as response:
            result = json.loads(response.read())
        
        if 'id' not in result:
            print(f"❌ TEST 1 FAILED: Action {i+1} was blocked")
            print(f"   Response: {result}")
            return False
    
    print(f"✅ TEST 1 PASSED: All 10 like actions succeeded")
    
    # Verify count
    count = await db.likes.count_documents({
        "user_id": user_id,
        "action_type": {"$in": ["like", "super_like", "golden_bone"]},
        "created_at": {"$gte": today_start, "$lt": today_end}
    })
    print(f"   Database count: {count}/10")
    
    # Test 2: Free user attempts 11th action
    print("\n" + "=" * 80)
    print("TEST 2: Free user attempts 11th like action → BLOCKED")
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
    
    print(f"Response: {result}")
    
    if result.get('error') == 'daily_limit_reached':
        print("✅ TEST 2 PASSED: 11th action blocked by server")
        print(f"   Message: {result.get('message')}")
        print(f"   Daily count: {result.get('daily_count')}")
        print(f"   Limit: {result.get('limit')}")
    else:
        print("❌ TEST 2 FAILED: 11th action was allowed")
        return False
    
    # Verify no 11th row inserted
    count_after = await db.likes.count_documents({
        "user_id": user_id,
        "action_type": {"$in": ["like", "super_like", "golden_bone"]},
        "created_at": {"$gte": today_start, "$lt": today_end}
    })
    if count_after == 10:
        print("✅ Verified: Database still has 10 actions (11th not inserted)")
    else:
        print(f"❌ Failed: Database has {count_after} actions")
        return False
    
    # Test 3: Skip actions don't count
    print("\n" + "=" * 80)
    print("TEST 3: Skip actions unlimited even at limit")
    print("=" * 80)
    
    # Try 5 skip actions
    for i in range(5):
        data = json.dumps({"pet_id": pet_id, "action_type": "skip"}).encode('utf-8')
        req = request.Request(
            'http://localhost:8001/api/likes',
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        with request.urlopen(req) as response:
            result = json.loads(response.read())
        
        if 'id' not in result:
            print(f"❌ TEST 3 FAILED: Skip {i+1} was blocked")
            return False
    
    print("✅ TEST 3 PASSED: All 5 skip actions succeeded (unlimited)")
    
    skip_count = await db.likes.count_documents({
        "user_id": user_id,
        "action_type": "skip",
        "created_at": {"$gte": today_start, "$lt": today_end}
    })
    print(f"   Skip count: {skip_count}")
    
    # Test 4: Premium user unlimited
    print("\n" + "=" * 80)
    print("TEST 4: Premium user makes 15 like actions → ALL SUCCEED")
    print("=" * 80)
    
    await db.users.update_one({"id": user_id}, {"$set": {"is_premium": True}})
    
    # Clear previous actions
    await db.likes.delete_many({
        "user_id": user_id,
        "created_at": {"$gte": today_start, "$lt": today_end}
    })
    
    for i in range(15):
        data = json.dumps({"pet_id": pet_id, "action_type": "like"}).encode('utf-8')
        req = request.Request(
            'http://localhost:8001/api/likes',
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        with request.urlopen(req) as response:
            result = json.loads(response.read())
        
        if 'id' not in result:
            print(f"❌ TEST 4 FAILED: Premium action {i+1} was blocked")
            print(f"   Response: {result}")
            return False
    
    print(f"✅ TEST 4 PASSED: Premium user made 15 actions (unlimited)")
    
    count_premium = await db.likes.count_documents({
        "user_id": user_id,
        "action_type": {"$in": ["like", "super_like", "golden_bone"]},
        "created_at": {"$gte": today_start, "$lt": today_end}
    })
    print(f"   Database count: {count_premium}/unlimited")
    
    # Reset user to free
    await db.users.update_one({"id": user_id}, {"$set": {"is_premium": False}})
    
    print("\n" + "=" * 80)
    print("SUMMARY: SERVER-SIDE DAILY LIMIT ENFORCEMENT")
    print("=" * 80)
    print("✅ Free users: 10 actions/day enforced server-side")
    print("✅ Free users: 11th action blocked (error='daily_limit_reached')")
    print("✅ Skip actions: Unlimited (don't count toward limit)")
    print("✅ Premium users: Unlimited actions (no limit)")
    print("\n🔒 SECURITY: Limits enforced server-side, can't bypass with API calls")
    print("💰 REVENUE: Free users must upgrade for unlimited access")
    print("=" * 80)
    
    return True


if __name__ == "__main__":
    success = asyncio.run(test_daily_limit_enforcement())
    sys.exit(0 if success else 1)
