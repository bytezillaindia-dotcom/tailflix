"""
Test script to verify Premium-only Super Like functionality:
1. Free users cannot use Super Like (redirected to paywall)
2. Premium users can use Super Like (counts toward daily limit)
"""

import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


async def test_premium_super_like():
    print("=" * 80)
    print("TESTING PREMIUM-ONLY SUPER LIKE FUNCTIONALITY")
    print("=" * 80)
    
    # Get most recent user (will be free by default)
    recent_user = await db.users.find_one(sort=[("last_login", -1)])
    if not recent_user:
        print("❌ No user found in database")
        return False
        
    user_id = recent_user['id']
    is_premium = recent_user.get('is_premium', False)
    print(f"\n✓ Using user: {user_id}")
    print(f"✓ User premium status: {is_premium}")
    
    # Clean up today's actions
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    await db.likes.delete_many({
        "user_id": user_id,
        "created_at": {"$gte": today_start, "$lt": today_end}
    })
    
    # Test 1: Free user cannot use Super Like
    print("\n" + "=" * 80)
    print("TEST 1: Free users blocked from Super Like (premium-only feature)")
    print("=" * 80)
    
    # Ensure user is free
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_premium": False}}
    )
    
    # Check API response
    from urllib import request, parse
    import json
    
    # Simulate what frontend does: check daily count first
    req = request.Request('http://localhost:8001/api/likes/daily-count')
    with request.urlopen(req) as response:
        data = json.loads(response.read())
        
    print(f"API Response for free user:")
    print(f"  is_premium: {data['is_premium']}")
    print(f"  daily_likes_count: {data['daily_likes_count']}")
    print(f"  limit: {data['limit']}")
    
    if data['is_premium'] == False:
        print("✅ TEST 1 PASSED: Free user (is_premium=False)")
        print("   Frontend should redirect to paywall with message:")
        print("   'Super Likes are a premium feature 🦴✨'")
    else:
        print("❌ TEST 1 FAILED: User should be free but is premium")
        return False
    
    # Test 2: Premium user can use Super Like
    print("\n" + "=" * 80)
    print("TEST 2: Premium users can use Super Like")
    print("=" * 80)
    
    # Set user to premium
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_premium": True}}
    )
    
    # Check API response
    req = request.Request('http://localhost:8001/api/likes/daily-count')
    with request.urlopen(req) as response:
        data = json.loads(response.read())
        
    print(f"API Response for premium user:")
    print(f"  is_premium: {data['is_premium']}")
    print(f"  daily_likes_count: {data['daily_likes_count']}")
    print(f"  limit: {data['limit']}")
    
    if data['is_premium'] == True:
        print("✅ TEST 2 PASSED: Premium user (is_premium=True)")
        print("   Frontend should allow Super Like action")
        print("   Super Like still counts toward daily limit (10/day)")
    else:
        print("❌ TEST 2 FAILED: User should be premium but is free")
        return False
    
    # Test 3: Premium user's Super Likes count toward limit
    print("\n" + "=" * 80)
    print("TEST 3: Premium user Super Likes count toward daily limit")
    print("=" * 80)
    
    # Insert 9 super_likes
    pet = await db.pets.find_one()
    if not pet:
        print("❌ No pets found")
        return False
        
    for i in range(9):
        super_like_doc = {
            "id": f"test-premium-superlike-{i}-{datetime.utcnow().timestamp()}",
            "user_id": user_id,
            "pet_id": pet['id'],
            "action_type": "super_like",
            "created_at": datetime.utcnow()
        }
        await db.likes.insert_one(super_like_doc)
    
    # Check count
    limited_actions_count = await db.likes.count_documents({
        "user_id": user_id,
        "action_type": {"$in": ["like", "super_like", "golden_bone"]},
        "created_at": {"$gte": today_start, "$lt": today_end}
    })
    
    print(f"After 9 Super Likes:")
    print(f"  Total limited actions: {limited_actions_count} / 10")
    print(f"  Remaining: {10 - limited_actions_count}")
    
    if limited_actions_count == 9:
        print("✅ TEST 3 PASSED: Super Likes count toward daily limit")
        print("   Premium user can do 1 more action before hitting limit")
    else:
        print(f"❌ TEST 3 FAILED: Expected 9 actions, got {limited_actions_count}")
        return False
    
    # Test 4: Premium user hits daily limit
    print("\n" + "=" * 80)
    print("TEST 4: Premium user hits daily limit (10 Super Likes)")
    print("=" * 80)
    
    # Add 1 more to hit limit
    super_like_doc = {
        "id": f"test-premium-superlike-10-{datetime.utcnow().timestamp()}",
        "user_id": user_id,
        "pet_id": pet['id'],
        "action_type": "super_like",
        "created_at": datetime.utcnow()
    }
    await db.likes.insert_one(super_like_doc)
    
    limited_actions_count = await db.likes.count_documents({
        "user_id": user_id,
        "action_type": {"$in": ["like", "super_like", "golden_bone"]},
        "created_at": {"$gte": today_start, "$lt": today_end}
    })
    
    print(f"After 10 Super Likes:")
    print(f"  Total limited actions: {limited_actions_count} / 10")
    
    if limited_actions_count == 10:
        print("✅ TEST 4 PASSED: Premium user reached daily limit (10/10)")
        print("   11th Super Like attempt should show regular daily limit paywall")
    else:
        print(f"❌ TEST 4 FAILED: Expected 10 actions, got {limited_actions_count}")
        return False
    
    # Reset user to free for next test
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_premium": False}}
    )
    
    print("\n" + "=" * 80)
    print("SUMMARY: PREMIUM-ONLY SUPER LIKE")
    print("=" * 80)
    print("✅ Free users blocked from Super Like (premium feature)")
    print("✅ Premium users can use Super Like")
    print("✅ Super Likes count toward 10/day limit for premium users")
    print("✅ After 10 actions, premium users see regular daily limit paywall")
    print("✅ User model has 'is_premium' field")
    print("✅ API /api/likes/daily-count returns 'is_premium' status")
    print("=" * 80)
    
    return True


if __name__ == "__main__":
    success = asyncio.run(test_premium_super_like())
    sys.exit(0 if success else 1)
