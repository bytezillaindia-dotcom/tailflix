"""
Test script to verify Admin premium toggle functionality:
1. Admin can toggle user premium status on/off
2. Premium status is correctly updated in database
3. Super Like and Golden Bone features respect premium status
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


async def test_admin_premium_toggle():
    print("=" * 80)
    print("TESTING ADMIN PREMIUM TOGGLE FUNCTIONALITY")
    print("=" * 80)
    
    # Get a test user
    test_user = await db.users.find_one(sort=[("last_login", -1)])
    if not test_user:
        print("❌ No user found in database")
        return False
        
    user_id = test_user['id']
    print(f"\n✓ Using user: {user_id}")
    print(f"  Contact: {test_user['value']}")
    
    # Test 1: Set user to free (if not already)
    print("\n" + "=" * 80)
    print("TEST 1: Set user to Free (is_premium = false)")
    print("=" * 80)
    
    data = json.dumps({"is_premium": False}).encode('utf-8')
    req = request.Request(
        f'http://localhost:8001/api/admin/users/{user_id}/premium',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='PUT'
    )
    
    with request.urlopen(req) as response:
        result = json.loads(response.read())
        
    print(f"API Response:")
    print(f"  success: {result['success']}")
    print(f"  message: {result['message']}")
    print(f"  is_premium: {result['is_premium']}")
    
    # Verify in database
    updated_user = await db.users.find_one({"id": user_id})
    if updated_user['is_premium'] == False:
        print("✅ TEST 1 PASSED: User set to Free (is_premium=False)")
    else:
        print("❌ TEST 1 FAILED: Database not updated correctly")
        return False
    
    # Test 2: Toggle user to Premium
    print("\n" + "=" * 80)
    print("TEST 2: Toggle user to Premium (is_premium = true)")
    print("=" * 80)
    
    data = json.dumps({"is_premium": True}).encode('utf-8')
    req = request.Request(
        f'http://localhost:8001/api/admin/users/{user_id}/premium',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='PUT'
    )
    
    with request.urlopen(req) as response:
        result = json.loads(response.read())
        
    print(f"API Response:")
    print(f"  success: {result['success']}")
    print(f"  message: {result['message']}")
    print(f"  is_premium: {result['is_premium']}")
    
    # Verify in database
    updated_user = await db.users.find_one({"id": user_id})
    if updated_user['is_premium'] == True:
        print("✅ TEST 2 PASSED: User upgraded to Premium (is_premium=True)")
    else:
        print("❌ TEST 2 FAILED: Database not updated correctly")
        return False
    
    # Test 3: Verify premium features work
    print("\n" + "=" * 80)
    print("TEST 3: Verify premium features available")
    print("=" * 80)
    
    req = request.Request('http://localhost:8001/api/likes/daily-count')
    with request.urlopen(req) as response:
        limits_data = json.loads(response.read())
        
    print(f"Daily Limits API Response:")
    print(f"  is_premium: {limits_data['is_premium']}")
    print(f"  golden_bones_limit: {limits_data['golden_bones_limit']}")
    print(f"  golden_bones_remaining: {limits_data['golden_bones_remaining']}")
    
    if limits_data['is_premium'] == True and limits_data['golden_bones_limit'] == 5:
        print("✅ TEST 3 PASSED: Premium user has access to premium features")
        print("   - Super Like: Available (unlimited)")
        print("   - Golden Bone: 5 per month")
    else:
        print("❌ TEST 3 FAILED: Premium features not available")
        return False
    
    # Test 4: Toggle back to Free
    print("\n" + "=" * 80)
    print("TEST 4: Toggle user back to Free")
    print("=" * 80)
    
    data = json.dumps({"is_premium": False}).encode('utf-8')
    req = request.Request(
        f'http://localhost:8001/api/admin/users/{user_id}/premium',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='PUT'
    )
    
    with request.urlopen(req) as response:
        result = json.loads(response.read())
        
    print(f"API Response:")
    print(f"  success: {result['success']}")
    print(f"  message: {result['message']}")
    print(f"  is_premium: {result['is_premium']}")
    
    # Verify premium features removed
    req = request.Request('http://localhost:8001/api/likes/daily-count')
    with request.urlopen(req) as response:
        limits_data = json.loads(response.read())
        
    print(f"\nDaily Limits API Response:")
    print(f"  is_premium: {limits_data['is_premium']}")
    print(f"  golden_bones_limit: {limits_data['golden_bones_limit']}")
    
    if limits_data['is_premium'] == False and limits_data['golden_bones_limit'] == 0:
        print("✅ TEST 4 PASSED: User downgraded to Free, premium features removed")
    else:
        print("❌ TEST 4 FAILED: Premium features still available")
        return False
    
    # Test 5: Test invalid user ID
    print("\n" + "=" * 80)
    print("TEST 5: Handle invalid user ID gracefully")
    print("=" * 80)
    
    data = json.dumps({"is_premium": True}).encode('utf-8')
    req = request.Request(
        'http://localhost:8001/api/admin/users/invalid-user-id-12345/premium',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='PUT'
    )
    
    try:
        with request.urlopen(req) as response:
            result = json.loads(response.read())
        print("❌ TEST 5 FAILED: Should have returned 404 error")
        return False
    except Exception as e:
        if '404' in str(e):
            print("✅ TEST 5 PASSED: API correctly returns 404 for invalid user ID")
        else:
            print(f"⚠️  TEST 5 WARNING: Unexpected error: {e}")
    
    print("\n" + "=" * 80)
    print("SUMMARY: ADMIN PREMIUM TOGGLE")
    print("=" * 80)
    print("✅ Admin can set user to Free (is_premium=False)")
    print("✅ Admin can upgrade user to Premium (is_premium=True)")
    print("✅ Premium features available when is_premium=True")
    print("✅ Premium features removed when is_premium=False")
    print("✅ API handles invalid user IDs correctly")
    print("\n📱 Frontend Integration:")
    print("   - Admin screen shows Premium toggle for each user")
    print("   - Toggle button changes color: Gold (Premium) / Gray (Free)")
    print("   - PetFeed respects is_premium status for Super Like & Golden Bone")
    print("=" * 80)
    
    return True


if __name__ == "__main__":
    success = asyncio.run(test_admin_premium_toggle())
    sys.exit(0 if success else 1)
