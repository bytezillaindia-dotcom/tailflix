#!/usr/bin/env python3
"""
Test script for auth restructuring
Tests that user_id parameter works for all updated endpoints
"""
import requests
import json

BACKEND_URL = "http://localhost:8001/api"

def test_check_has_pets():
    """Test the new /api/users/{user_id}/has-pets endpoint"""
    print("\n=== Test: Check if user has pets ===")
    
    # Get a user first
    response = requests.get(f"{BACKEND_URL}/users")
    users = response.json()
    
    if users:
        user_id = users[0]['id']
        response = requests.get(f"{BACKEND_URL}/users/{user_id}/has-pets")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print("No users found in database")

if __name__ == "__main__":
    test_check_has_pets()
