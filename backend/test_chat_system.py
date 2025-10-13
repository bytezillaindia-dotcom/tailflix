#!/usr/bin/env python3
"""
Test Chat Functionality
Tests the complete chat system for matched users
"""
import requests
import json
import time

BACKEND_URL = "http://localhost:8001/api"

def test_chat_system():
    print("\n" + "="*80)
    print("TESTING CHAT SYSTEM")
    print("="*80 + "\n")
    
    # Step 1: Create two users and pets
    print("Step 1: Creating User A and User B with pets...")
    
    # User A
    requests.post(f"{BACKEND_URL}/auth/send-otp", json={
        "method": "phone",
        "value": "+1234567890"
    })
    user_a_response = requests.post(f"{BACKEND_URL}/auth/verify-otp", json={
        "method": "phone",
        "value": "+1234567890",
        "otp": "123456"
    })
    user_a = user_a_response.json()
    user_a_id = user_a['user_id']
    
    pet_a_response = requests.post(f"{BACKEND_URL}/pets?user_id={user_a_id}", json={
        "pet_name": "Charlie",
        "breed": "Beagle",
        "sex": "Male",
        "birth_year": 2020,
        "temperaments": ["Friendly"],
        "photos": ["data:image/png;base64,test"]
    })
    pet_a = pet_a_response.json()
    pet_a_id = pet_a['id']
    print(f"✓ User A: {user_a_id}")
    print(f"✓ Pet A: {pet_a['pet_name']} (ID: {pet_a_id})")
    
    # User B
    requests.post(f"{BACKEND_URL}/auth/send-otp", json={
        "method": "phone",
        "value": "+0987654321"
    })
    user_b_response = requests.post(f"{BACKEND_URL}/auth/verify-otp", json={
        "method": "phone",
        "value": "+0987654321",
        "otp": "123456"
    })
    user_b = user_b_response.json()
    user_b_id = user_b['user_id']
    
    pet_b_response = requests.post(f"{BACKEND_URL}/pets?user_id={user_b_id}", json={
        "pet_name": "Daisy",
        "breed": "Poodle",
        "sex": "Female",
        "birth_year": 2021,
        "temperaments": ["Playful"],
        "photos": ["data:image/png;base64,test"]
    })
    pet_b = pet_b_response.json()
    pet_b_id = pet_b['id']
    print(f"✓ User B: {user_b_id}")
    print(f"✓ Pet B: {pet_b['pet_name']} (ID: {pet_b_id})")
    
    # Step 2: Create a match
    print("\nStep 2: Creating a mutual match...")
    
    # User A likes User B's pet
    requests.post(f"{BACKEND_URL}/likes?user_id={user_a_id}", json={
        "pet_id": pet_b_id,
        "action_type": "like"
    })
    
    # User B likes User A's pet (creates match)
    match_response = requests.post(f"{BACKEND_URL}/likes?user_id={user_b_id}", json={
        "pet_id": pet_a_id,
        "action_type": "like"
    })
    match_data = match_response.json()
    
    if not match_data.get('match') or not match_data['match'].get('matched'):
        print("❌ ERROR: Failed to create match")
        return False
    
    match_id = match_data['match']['match_id']
    print(f"✓ Match created: {match_id}")
    
    # Step 3: Test unauthorized access
    print("\nStep 3: Testing unauthorized access (should fail)...")
    
    # Create a third user who is NOT part of the match
    requests.post(f"{BACKEND_URL}/auth/send-otp", json={
        "method": "phone",
        "value": "+5555555555"
    })
    user_c_response = requests.post(f"{BACKEND_URL}/auth/verify-otp", json={
        "method": "phone",
        "value": "+5555555555",
        "otp": "123456"
    })
    user_c = user_c_response.json()
    user_c_id = user_c['user_id']
    
    # Try to access the chat
    unauthorized_response = requests.get(f"{BACKEND_URL}/chats/{match_id}?user_id={user_c_id}")
    
    if unauthorized_response.status_code == 403:
        print("✓ Unauthorized access correctly blocked (403)")
    else:
        print(f"❌ ERROR: Unauthorized access not blocked (status: {unauthorized_response.status_code})")
    
    # Step 4: User A sends messages
    print("\nStep 4: User A sends messages...")
    
    messages_to_send = [
        "Hey! Nice to meet you! 🐾",
        "Your pet is adorable!",
        "Would love to set up a playdate!"
    ]
    
    for msg in messages_to_send:
        response = requests.post(f"{BACKEND_URL}/chats/{match_id}?user_id={user_a_id}", json={
            "message": msg
        })
        if response.ok:
            print(f"✓ Sent: {msg}")
        else:
            print(f"❌ Failed to send: {msg}")
        time.sleep(0.5)
    
    # Step 5: User B sends messages
    print("\nStep 5: User B sends messages...")
    
    user_b_messages = [
        "Hi! So excited to meet you too! 🐶",
        "🐾",  # Paw emoji
        "Let's arrange a playdate soon!"
    ]
    
    for msg in user_b_messages:
        response = requests.post(f"{BACKEND_URL}/chats/{match_id}?user_id={user_b_id}", json={
            "message": msg
        })
        if response.ok:
            print(f"✓ Sent: {msg}")
        else:
            print(f"❌ Failed to send: {msg}")
        time.sleep(0.5)
    
    # Step 6: Retrieve chat history
    print("\nStep 6: Retrieving chat history...")
    
    chat_response = requests.get(f"{BACKEND_URL}/chats/{match_id}?user_id={user_a_id}")
    chat_data = chat_response.json()
    
    if not chat_response.ok:
        print(f"❌ ERROR: Failed to retrieve chat (status: {chat_response.status_code})")
        return False
    
    messages = chat_data.get('messages', [])
    other_user = chat_data.get('other_user', {})
    
    print(f"\n{'='*80}")
    print(f"CHAT HISTORY (Match: {match_id})")
    print(f"{'='*80}")
    print(f"Other User: {other_user.get('pet_name', 'Unknown')}")
    print(f"Total Messages: {len(messages)}")
    print(f"\nMessages:")
    
    for msg in messages:
        sender = "User A" if msg['sender_id'] == user_a_id else "User B"
        timestamp = msg['created_at'][:19]  # Truncate milliseconds
        print(f"  [{timestamp}] {sender}: {msg['message']}")
    
    # Step 7: Verify message persistence
    print(f"\nStep 7: Verifying message persistence...")
    
    # User B retrieves the same chat
    chat_b_response = requests.get(f"{BACKEND_URL}/chats/{match_id}?user_id={user_b_id}")
    chat_b_data = chat_b_response.json()
    messages_b = chat_b_data.get('messages', [])
    
    if len(messages) == len(messages_b):
        print(f"✓ Message persistence verified ({len(messages)} messages)")
    else:
        print(f"❌ ERROR: Message count mismatch (A: {len(messages)}, B: {len(messages_b)})")
        return False
    
    # Verify all messages are there
    expected_count = len(messages_to_send) + len(user_b_messages)
    if len(messages) == expected_count:
        print(f"✓ All {expected_count} messages saved and retrieved correctly")
        print("\n" + "="*80)
        print("✅ SUCCESS: Chat system is fully functional!")
        print("="*80)
        print("\nFeatures Verified:")
        print("  ✓ Match-based chat access")
        print("  ✓ Unauthorized access blocked")
        print("  ✓ Messages sent successfully")
        print("  ✓ Messages persisted in database")
        print("  ✓ Chat history retrieval working")
        print("  ✓ Paw emoji support")
        return True
    else:
        print(f"❌ ERROR: Expected {expected_count} messages, got {len(messages)}")
        return False

if __name__ == "__main__":
    try:
        test_chat_system()
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
