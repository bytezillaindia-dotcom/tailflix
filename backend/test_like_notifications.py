#!/usr/bin/env python3
"""
Test Like Notifications System
Tests the complete like notification flow
"""
import requests
import json

BACKEND_URL = "http://localhost:8001/api"

def test_like_notifications():
    print("\n" + "="*80)
    print("TESTING LIKE NOTIFICATIONS SYSTEM")
    print("="*80 + "\n")
    
    # Create User A
    print("Step 1: Creating User A...")
    requests.post(f"{BACKEND_URL}/auth/send-otp", json={
        "method": "phone",
        "value": "+1111111111"
    })
    user_a_response = requests.post(f"{BACKEND_URL}/auth/verify-otp", json={
        "method": "phone",
        "value": "+1111111111",
        "otp": "123456"
    })
    user_a = user_a_response.json()
    user_a_id = user_a['user_id']
    print(f"✓ User A created: {user_a_id}")
    
    # Create Pet for User A
    pet_a_response = requests.post(f"{BACKEND_URL}/pets?user_id={user_a_id}", json={
        "pet_name": "Buddy",
        "breed": "Golden Retriever",
        "sex": "Male",
        "birth_year": 2020,
        "temperaments": ["Friendly"],
        "photos": ["data:image/png;base64,test"]
    })
    pet_a = pet_a_response.json()
    pet_a_id = pet_a['id']
    print(f"✓ Pet A created: {pet_a['pet_name']} (ID: {pet_a_id})")
    
    # Create User B
    print("\nStep 2: Creating User B...")
    requests.post(f"{BACKEND_URL}/auth/send-otp", json={
        "method": "phone",
        "value": "+2222222222"
    })
    user_b_response = requests.post(f"{BACKEND_URL}/auth/verify-otp", json={
        "method": "phone",
        "value": "+2222222222",
        "otp": "123456"
    })
    user_b = user_b_response.json()
    user_b_id = user_b['user_id']
    print(f"✓ User B created: {user_b_id}")
    
    # Create Pet for User B
    pet_b_response = requests.post(f"{BACKEND_URL}/pets?user_id={user_b_id}", json={
        "pet_name": "Luna",
        "breed": "Husky",
        "sex": "Female",
        "birth_year": 2019,
        "temperaments": ["Playful"],
        "photos": ["data:image/png;base64,test"]
    })
    pet_b = pet_b_response.json()
    pet_b_id = pet_b['id']
    print(f"✓ Pet B created: {pet_b['pet_name']} (ID: {pet_b_id})")
    
    # User A likes User B's pet (regular like)
    print("\nStep 3: User A sends a regular like to User B's pet...")
    requests.post(f"{BACKEND_URL}/likes?user_id={user_a_id}", json={
        "pet_id": pet_b_id,
        "action_type": "like"
    })
    print("✓ Like sent")
    
    # User A sends Super Like to User B's pet
    print("\nStep 4: User A sends a Super Like to User B's pet...")
    requests.post(f"{BACKEND_URL}/likes?user_id={user_a_id}", json={
        "pet_id": pet_b_id,
        "action_type": "super_like"
    })
    print("✓ Super Like sent")
    
    # Check User B's received likes
    print("\nStep 5: Checking User B's received likes...")
    likes_response = requests.get(f"{BACKEND_URL}/likes/received?user_id={user_b_id}")
    likes_data = likes_response.json()
    
    print("\n" + "="*80)
    print("USER B's RECEIVED LIKES")
    print("="*80)
    print(f"Regular Likes: {likes_data['unread_count']}")
    print(f"Super Likes/Golden Bones: {likes_data['super_like_count']}")
    print(f"\nLikes Details:")
    print(json.dumps(likes_data['likes'], indent=2))
    print(f"\nSuper Likes Details:")
    print(json.dumps(likes_data['super_likes'], indent=2))
    
    if likes_data['unread_count'] > 0 or likes_data['super_like_count'] > 0:
        print("\n✅ SUCCESS: Like notifications are working!")
        print("✅ User B would see badges on the Likes button")
        if likes_data['super_like_count'] > 0:
            print("✅ User B would see gold ⭐ badge for Super Likes")
        return True
    else:
        print("\n❌ ERROR: No likes detected")
        return False

if __name__ == "__main__":
    try:
        test_like_notifications()
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
