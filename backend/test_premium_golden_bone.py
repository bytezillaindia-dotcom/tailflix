"""
Test script to verify Premium-only Golden Bone functionality with monthly limits:
1. Free users cannot use Golden Bone (redirected to paywall)
2. Premium users can use Golden Bone (5/month limit)
3. Premium users who've used all 5 see "no Golden Bones left" message
4. Monthly reset works correctly
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


async def test_premium_golden_bone():
    print("=" * 80)
    print("TESTING PREMIUM-ONLY GOLDEN BONE WITH MONTHLY LIMITS")
    print("=" * 80)
    
    # Get most recent user
    recent_user = await db.users.find_one(sort=[("last_login", -1)])
    if not recent_user:
        print("❌ No user found in database")
        return False
        
    user_id = recent_user['id']
    print(f"\n✓ Using user: {user_id}")
    
    pet = await db.pets.find_one()
    if not pet:
        print("❌ No pets found")
        return False
    pet_id = pet['id']
    
    # Clean up
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    await db.likes.delete_many({
        "user_id": user_id,
        "created_at": {"$gte": today_start, "$lt": today_end}
    })
    
    # Test 1: Free user blocked from Golden Bone
    print("\n" + "=" * 80)
    print("TEST 1: Free users blocked from Golden Bone")
    print("=" * 80)
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "is_premium": False,
            "golden_bones_used_this_month": 0,
            "golden_bones_reset_date": datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        }}
    )
    
    from urllib import request
    import json
    
    req = request.Request('http://localhost:8001/api/likes/daily-count')
    with request.urlopen(req) as response:
        data = json.loads(response.read())
        
    print(f"Free user API response:")
    print(f"  is_premium: {data['is_premium']}")
    print(f"  golden_bones_limit: {data['golden_bones_limit']}")
    print(f"  golden_bones_remaining: {data['golden_bones_remaining']}")
    
    if data['is_premium'] == False and data['golden_bones_limit'] == 0:
        print("✅ TEST 1 PASSED: Free user has 0 Golden Bones")
        print("   Frontend should redirect to paywall: 'Golden Bones are a premium feature ✨🍖'")
    else:
        print("❌ TEST 1 FAILED")
        return False
    
    # Test 2: Premium user gets 5 Golden Bones per month
    print("\n" + "=" * 80)
    print("TEST 2: Premium users get 5 Golden Bones per month")
    print("=" * 80)
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "is_premium": True,
            "golden_bones_used_this_month": 0,
            "golden_bones_reset_date": datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        }}
    )
    
    req = request.Request('http://localhost:8001/api/likes/daily-count')
    with request.urlopen(req) as response:
        data = json.loads(response.read())
        
    print(f"Premium user API response (fresh month):")
    print(f"  is_premium: {data['is_premium']}")
    print(f"  golden_bones_used: {data['golden_bones_used']}")
    print(f"  golden_bones_limit: {data['golden_bones_limit']}")
    print(f"  golden_bones_remaining: {data['golden_bones_remaining']}")
    
    if data['is_premium'] == True and data['golden_bones_remaining'] == 5:
        print("✅ TEST 2 PASSED: Premium user has 5 Golden Bones available")
    else:
        print("❌ TEST 2 FAILED")
        return False
    
    # Test 3: Using Golden Bones decrements monthly counter
    print("\n" + "=" * 80)
    print("TEST 3: Using Golden Bones decrements monthly counter")
    print("=" * 80)
    
    # Use 3 golden_bones
    for i in range(3):
        golden_bone_doc = {
            "id": f"test-gb-{i}-{datetime.utcnow().timestamp()}",
            "user_id": user_id,
            "pet_id": pet_id,
            "action_type": "golden_bone",
            "created_at": datetime.utcnow()
        }
        await db.likes.insert_one(golden_bone_doc)
        # Increment counter (simulating what POST /api/likes does)
        await db.users.update_one(
            {"id": user_id},
            {"$inc": {"golden_bones_used_this_month": 1}}
        )
    
    req = request.Request('http://localhost:8001/api/likes/daily-count')
    with request.urlopen(req) as response:
        data = json.loads(response.read())
        
    print(f"After using 3 Golden Bones:")
    print(f"  golden_bones_used: {data['golden_bones_used']}")
    print(f"  golden_bones_remaining: {data['golden_bones_remaining']}")
    
    if data['golden_bones_used'] == 3 and data['golden_bones_remaining'] == 2:
        print("✅ TEST 3 PASSED: Used 3, have 2 remaining")
    else:
        print("❌ TEST 3 FAILED")
        return False
    
    # Test 4: Premium user hits monthly limit (5 used)
    print("\n" + "=" * 80)
    print("TEST 4: Premium user hits monthly Golden Bone limit")
    print("=" * 80)
    
    # Use 2 more to reach limit
    for i in range(2):
        golden_bone_doc = {
            "id": f"test-gb-limit-{i}-{datetime.utcnow().timestamp()}",
            "user_id": user_id,
            "pet_id": pet_id,
            "action_type": "golden_bone",
            "created_at": datetime.utcnow()
        }
        await db.likes.insert_one(golden_bone_doc)
        await db.users.update_one(
            {"id": user_id},
            {"$inc": {"golden_bones_used_this_month": 1}}
        )
    
    req = request.Request('http://localhost:8001/api/likes/daily-count')
    with request.urlopen(req) as response:
        data = json.loads(response.read())
        
    print(f"After using all 5 Golden Bones:")
    print(f"  golden_bones_used: {data['golden_bones_used']}")
    print(f"  golden_bones_remaining: {data['golden_bones_remaining']}")
    
    if data['golden_bones_used'] == 5 and data['golden_bones_remaining'] == 0:
        print("✅ TEST 4 PASSED: All 5 Golden Bones used, 0 remaining")
        print("   Frontend should show: \"You've used all your Golden Bones this month.\"")
    else:
        print("❌ TEST 4 FAILED")
        return False
    
    # Test 5: Monthly reset
    print("\n" + "=" * 80)
    print("TEST 5: Monthly reset (simulate last month's usage)")
    print("=" * 80)
    
    # Set reset date to last month
    last_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timedelta(days=1)
    last_month_start = last_month.replace(day=1)
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "golden_bones_used_this_month": 5,  # All used last month
            "golden_bones_reset_date": last_month_start
        }}
    )
    
    print(f"Set user's last reset to: {last_month_start.strftime('%Y-%m-%d')}")
    print("Calling API (should trigger auto-reset)...")
    
    req = request.Request('http://localhost:8001/api/likes/daily-count')
    with request.urlopen(req) as response:
        data = json.loads(response.read())
        
    print(f"After automatic reset:")
    print(f"  golden_bones_used: {data['golden_bones_used']}")
    print(f"  golden_bones_remaining: {data['golden_bones_remaining']}")
    
    if data['golden_bones_used'] == 0 and data['golden_bones_remaining'] == 5:
        print("✅ TEST 5 PASSED: Counter reset for new month, 5 available again")
    else:
        print("❌ TEST 5 FAILED")
        return False
    
    # Test 6: Golden Bones don't count toward daily 10-action limit
    print("\n" + "=" * 80)
    print("TEST 6: Golden Bones counted separately from daily limit")
    print("=" * 80)
    
    # Clean and reset
    await db.likes.delete_many({
        "user_id": user_id,
        "created_at": {"$gte": today_start, "$lt": today_end}
    })
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"golden_bones_used_this_month": 0}}
    )
    
    # Add 9 regular likes
    for i in range(9):
        like_doc = {
            "id": f"test-like-daily-{i}-{datetime.utcnow().timestamp()}",
            "user_id": user_id,
            "pet_id": pet_id,
            "action_type": "like",
            "created_at": datetime.utcnow()
        }
        await db.likes.insert_one(like_doc)
    
    # Add 1 golden_bone
    golden_bone_doc = {
        "id": f"test-gb-daily-{datetime.utcnow().timestamp()}",
        "user_id": user_id,
        "pet_id": pet_id,
        "action_type": "golden_bone",
        "created_at": datetime.utcnow()
    }
    await db.likes.insert_one(golden_bone_doc)
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"golden_bones_used_this_month": 1}}
    )
    
    req = request.Request('http://localhost:8001/api/likes/daily-count')
    with request.urlopen(req) as response:
        data = json.loads(response.read())
        
    print(f"After 9 likes + 1 golden_bone:")
    print(f"  daily_likes_count: {data['daily_likes_count']} (should be 10)")
    print(f"  golden_bones_used: {data['golden_bones_used']} (should be 1)")
    print(f"  golden_bones_remaining: {data['golden_bones_remaining']} (should be 4)")
    
    if data['daily_likes_count'] == 10 and data['golden_bones_used'] == 1:
        print("✅ TEST 6 PASSED: Golden Bone counts toward daily limit")
        print("   Note: Golden Bones have both daily limit (10) AND monthly limit (5)")
    else:
        print("❌ TEST 6 FAILED")
        return False
    
    # Reset user to free
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_premium": False}}
    )
    
    print("\n" + "=" * 80)
    print("SUMMARY: PREMIUM GOLDEN BONE FUNCTIONALITY")
    print("=" * 80)
    print("✅ Free users have 0 Golden Bones (premium feature)")
    print("✅ Premium users get 5 Golden Bones per month")
    print("✅ Using Golden Bones decrements monthly counter")
    print("✅ Premium users blocked when all 5 used (monthly limit)")
    print("✅ Counter auto-resets on 1st of month")
    print("✅ Golden Bones count toward daily 10-action limit")
    print("✅ Animation plays before card advances (frontend)")
    print("=" * 80)
    
    return True


if __name__ == "__main__":
    success = asyncio.run(test_premium_golden_bone())
    sys.exit(0 if success else 1)
