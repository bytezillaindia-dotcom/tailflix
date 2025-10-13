#!/usr/bin/env python3
"""
Test Mutual Match Flow
Tests the complete mutual match logic from both users' perspectives
"""
import requests
import json

BACKEND_URL = "http://localhost:8001/api"

def test_mutual_match():
    print("\n" + "="*80)
    print("TESTING MUTUAL MATCH FLOW")
    print("="*80 + "\n")
    
    # Step 1: Create two test users
    print("Step 1: Creating two test users...")
    
    # User A
    response_a = requests.post(f"{BACKEND_URL}/auth/send-otp", json={
        "method": "phone",
        "value": "+1234567890"
    })
    user_a_data = response_a.json()
    print(f"✓ User A created: {user_a_data}")
    
    # Verify User A
    response_a_verify = requests.post(f"{BACKEND_URL}/auth/verify-otp", json={
        "method": "phone",
        "value": "+1234567890",
        "otp": "123456"
    })
    user_a = response_a_verify.json()
    user_a_id = user_a['user_id']
    print(f"✓ User A logged in: {user_a_id}")
    
    # User B
    response_b = requests.post(f"{BACKEND_URL}/auth/send-otp", json={
        "method": "phone",
        "value": "+0987654321"
    })
    user_b_data = response_b.json()
    print(f"✓ User B created: {user_b_data}")
    
    # Verify User B
    response_b_verify = requests.post(f"{BACKEND_URL}/auth/verify-otp", json={
        "method": "phone",
        "value": "+0987654321",
        "otp": "123456"
    })
    user_b = response_b_verify.json()
    user_b_id = user_b['user_id']
    print(f"✓ User B logged in: {user_b_id}\n")
    
    # Step 2: Create pets for both users
    print("Step 2: Creating pets for both users...")
    
    # Pet for User A
    pet_a_response = requests.post(f"{BACKEND_URL}/pets?user_id={user_a_id}", json={
        "pet_name": "Max",
        "breed": "Golden Retriever",
        "sex": "Male",
        "birth_year": 2020,
        "temperaments": ["Friendly", "Playful"],
        "photos": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="]
    })
    pet_a = pet_a_response.json()
    pet_a_id = pet_a['id']
    print(f"✓ Created pet for User A: {pet_a['pet_name']} (ID: {pet_a_id})")
    
    # Pet for User B
    pet_b_response = requests.post(f"{BACKEND_URL}/pets?user_id={user_b_id}", json={
        "pet_name": "Bella",
        "breed": "Labrador",
        "sex": "Female",
        "birth_year": 2019,
        "temperaments": ["Sweet", "Energetic"],
        "photos": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="]
    })
    pet_b = pet_b_response.json()
    pet_b_id = pet_b['id']
    print(f"✓ Created pet for User B: {pet_b['pet_name']} (ID: {pet_b_id})\n")
    
    # Step 3: User A likes User B's pet (First like - no match yet)
    print("Step 3: User A likes User B's pet...")
    like_a_response = requests.post(f"{BACKEND_URL}/likes?user_id={user_a_id}", json={
        "pet_id": pet_b_id,
        "action_type": "like"
    })
    like_a_result = like_a_response.json()
    print(f"✓ User A liked User B's pet")
    print(f"  Response: {json.dumps(like_a_result, indent=2)}")
    
    if like_a_result.get('match'):
        print("  ❌ ERROR: Match detected on first like (should be NO match yet)")
    else:
        print("  ✅ CORRECT: No match yet (as expected)\n")
    
    # Step 4: User B likes User A's pet (Second like - MATCH!)
    print("Step 4: User B likes User A's pet...")
    like_b_response = requests.post(f"{BACKEND_URL}/likes?user_id={user_b_id}", json={
        "pet_id": pet_a_id,
        "action_type": "like"
    })
    like_b_result = like_b_response.json()
    print(f"✓ User B liked User A's pet")
    print(f"  Response: {json.dumps(like_b_result, indent=2)}")
    
    if like_b_result.get('match') and like_b_result['match'].get('matched'):
        print("\n" + "="*80)
        print("🎉 SUCCESS! IT'S A MATCH!")
        print("="*80)
        match_data = like_b_result['match']
        print(f"Match ID: {match_data.get('match_id')}")
        print(f"Match Type: {match_data.get('match_type')}")
        print(f"My Pet: {match_data.get('my_pet', {}).get('name')}")
        print(f"Their Pet: {match_data.get('their_pet', {}).get('name')}")
        print("\n✅ Mutual match logic is working correctly!")
        print("✅ Frontend should now show 'It's a Match!' screen with animations")
        return True
    else:
        print("\n❌ ERROR: No match detected on mutual like!")
        print("This should have triggered a match.")
        return False

if __name__ == "__main__":
    try:
        success = test_mutual_match()
        if success:
            print("\n" + "="*80)
            print("TEST PASSED: Mutual match flow is working! 🎉")
            print("="*80)
        else:
            print("\n" + "="*80)
            print("TEST FAILED: Mutual match logic needs debugging")
            print("="*80)
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
