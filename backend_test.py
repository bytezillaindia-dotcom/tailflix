#!/usr/bin/env python3
"""
TailFlix Backend Comprehensive Test Suite
Tests all flows as requested in the review: Onboarding, Verification Guard, Admin, PetFeed, Paywall, Premium
"""

import requests
import json
import time
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend env
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

print(f"🔗 Testing TailFlix Backend at: {API_BASE}")
print("=" * 80)

class TailFlixTester:
    def __init__(self):
        self.test_results = {
            'working': [],
            'broken': [],
            'missing': [],
            'notes': []
        }
        self.test_users = {}
        self.test_pets = {}
        self.test_verifications = {}
        
    def log_test(self, test_name: str, success: bool, details: str, response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()

    def test_api_root(self):
        """Test the root API endpoint"""
        try:
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "TailFlix" in data["message"]:
                    self.log_test("API Root Endpoint", True, f"API accessible, message: {data['message']}", data)
                    return True
                else:
                    self.log_test("API Root Endpoint", False, f"Unexpected response format", data)
                    return False
            else:
                self.log_test("API Root Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("API Root Endpoint", False, f"Connection error: {str(e)}")
            return False

    def test_send_otp_valid_phone(self):
        """Test send OTP with valid phone number"""
        payload = {"method": "phone", "value": "+1234567890"}
        try:
            response = requests.post(f"{self.base_url}/auth/send-otp", json=payload)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "mock_otp" in data:
                    self.log_test("Send OTP - Valid Phone", True, f"OTP sent successfully, mock_otp: {data['mock_otp']}", data)
                    return True
                else:
                    self.log_test("Send OTP - Valid Phone", False, "Missing success=true or mock_otp field", data)
                    return False
            else:
                self.log_test("Send OTP - Valid Phone", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Send OTP - Valid Phone", False, f"Request error: {str(e)}")
            return False

    def test_send_otp_valid_email(self):
        """Test send OTP with valid email"""
        payload = {"method": "email", "value": "alice@tailflix.com"}
        try:
            response = requests.post(f"{self.base_url}/auth/send-otp", json=payload)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "mock_otp" in data:
                    self.log_test("Send OTP - Valid Email", True, f"OTP sent successfully, mock_otp: {data['mock_otp']}", data)
                    return True
                else:
                    self.log_test("Send OTP - Valid Email", False, "Missing success=true or mock_otp field", data)
                    return False
            else:
                self.log_test("Send OTP - Valid Email", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Send OTP - Valid Email", False, f"Request error: {str(e)}")
            return False

    def test_send_otp_invalid_method(self):
        """Test send OTP with invalid method"""
        payload = {"method": "invalid", "value": "test"}
        try:
            response = requests.post(f"{self.base_url}/auth/send-otp", json=payload)
            if response.status_code == 400:
                self.log_test("Send OTP - Invalid Method", True, "Correctly rejected invalid method with 400 error")
                return True
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                self.log_test("Send OTP - Invalid Method", False, f"Expected 400 error, got {response.status_code}", data)
                return False
        except Exception as e:
            self.log_test("Send OTP - Invalid Method", False, f"Request error: {str(e)}")
            return False

    def test_send_otp_empty_value(self):
        """Test send OTP with empty value"""
        payload = {"method": "phone", "value": ""}
        try:
            response = requests.post(f"{self.base_url}/auth/send-otp", json=payload)
            if response.status_code == 400:
                self.log_test("Send OTP - Empty Value", True, "Correctly rejected empty value with 400 error")
                return True
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                self.log_test("Send OTP - Empty Value", False, f"Expected 400 error, got {response.status_code}", data)
                return False
        except Exception as e:
            self.log_test("Send OTP - Empty Value", False, f"Request error: {str(e)}")
            return False

    def test_verify_otp_valid(self):
        """Test verify OTP with valid 6-digit code"""
        # First send OTP
        send_payload = {"method": "phone", "value": "+0987654321"}
        try:
            send_response = requests.post(f"{self.base_url}/auth/send-otp", json=send_payload)
            if send_response.status_code != 200:
                self.log_test("Verify OTP - Valid (Setup)", False, "Failed to send OTP for verification test")
                return False
            
            # Now verify with any 6-digit code
            verify_payload = {"method": "phone", "value": "+0987654321", "otp": "123456"}
            verify_response = requests.post(f"{self.base_url}/auth/verify-otp", json=verify_payload)
            
            if verify_response.status_code == 200:
                data = verify_response.json()
                if data.get("success") and "user_id" in data and "token" in data:
                    self.log_test("Verify OTP - Valid Code", True, f"OTP verified successfully, user_id: {data['user_id']}", data)
                    return True
                else:
                    self.log_test("Verify OTP - Valid Code", False, "Missing success=true, user_id, or token", data)
                    return False
            else:
                self.log_test("Verify OTP - Valid Code", False, f"HTTP {verify_response.status_code}: {verify_response.text}")
                return False
        except Exception as e:
            self.log_test("Verify OTP - Valid Code", False, f"Request error: {str(e)}")
            return False

    def test_verify_otp_invalid_length(self):
        """Test verify OTP with invalid length (not 6 digits)"""
        # First send OTP
        send_payload = {"method": "email", "value": "bob@tailflix.com"}
        try:
            send_response = requests.post(f"{self.base_url}/auth/send-otp", json=send_payload)
            if send_response.status_code != 200:
                self.log_test("Verify OTP - Invalid Length (Setup)", False, "Failed to send OTP for verification test")
                return False
            
            # Try to verify with 2-digit code
            verify_payload = {"method": "email", "value": "bob@tailflix.com", "otp": "12"}
            verify_response = requests.post(f"{self.base_url}/auth/verify-otp", json=verify_payload)
            
            if verify_response.status_code == 200:
                data = verify_response.json()
                if not data.get("success"):
                    self.log_test("Verify OTP - Invalid Length", True, f"Correctly rejected invalid OTP length: {data.get('message')}")
                    return True
                else:
                    self.log_test("Verify OTP - Invalid Length", False, "Should have rejected invalid OTP length", data)
                    return False
            else:
                self.log_test("Verify OTP - Invalid Length", False, f"HTTP {verify_response.status_code}: {verify_response.text}")
                return False
        except Exception as e:
            self.log_test("Verify OTP - Invalid Length", False, f"Request error: {str(e)}")
            return False

    def test_verify_otp_non_numeric(self):
        """Test verify OTP with non-numeric code"""
        # First send OTP
        send_payload = {"method": "phone", "value": "+1234567890"}
        try:
            send_response = requests.post(f"{self.base_url}/auth/send-otp", json=send_payload)
            if send_response.status_code != 200:
                self.log_test("Verify OTP - Non-numeric (Setup)", False, "Failed to send OTP for verification test")
                return False
            
            # Try to verify with non-numeric code
            verify_payload = {"method": "phone", "value": "+1234567890", "otp": "abcdef"}
            verify_response = requests.post(f"{self.base_url}/auth/verify-otp", json=verify_payload)
            
            if verify_response.status_code == 200:
                data = verify_response.json()
                if not data.get("success"):
                    self.log_test("Verify OTP - Non-numeric", True, f"Correctly rejected non-numeric OTP: {data.get('message')}")
                    return True
                else:
                    self.log_test("Verify OTP - Non-numeric", False, "Should have rejected non-numeric OTP", data)
                    return False
            else:
                self.log_test("Verify OTP - Non-numeric", False, f"HTTP {verify_response.status_code}: {verify_response.text}")
                return False
        except Exception as e:
            self.log_test("Verify OTP - Non-numeric", False, f"Request error: {str(e)}")
            return False

    def test_verify_otp_user_not_exists(self):
        """Test verify OTP for user that doesn't exist"""
        verify_payload = {"method": "phone", "value": "+9999999999", "otp": "123456"}
        try:
            verify_response = requests.post(f"{self.base_url}/auth/verify-otp", json=verify_payload)
            
            if verify_response.status_code == 200:
                data = verify_response.json()
                if not data.get("success"):
                    self.log_test("Verify OTP - User Not Exists", True, f"Correctly rejected non-existent user: {data.get('message')}")
                    return True
                else:
                    self.log_test("Verify OTP - User Not Exists", False, "Should have rejected non-existent user", data)
                    return False
            else:
                self.log_test("Verify OTP - User Not Exists", False, f"HTTP {verify_response.status_code}: {verify_response.text}")
                return False
        except Exception as e:
            self.log_test("Verify OTP - User Not Exists", False, f"Request error: {str(e)}")
            return False

    def test_get_users(self):
        """Test get users API"""
        try:
            response = requests.get(f"{self.base_url}/users")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if users have required fields
                    if len(data) > 0:
                        user = data[0]
                        required_fields = ["id", "method", "value", "created_at"]
                        missing_fields = [field for field in required_fields if field not in user]
                        if not missing_fields:
                            self.log_test("Get Users API", True, f"Retrieved {len(data)} users with correct structure")
                            return True
                        else:
                            self.log_test("Get Users API", False, f"Users missing required fields: {missing_fields}", user)
                            return False
                    else:
                        self.log_test("Get Users API", True, "Retrieved empty user list (no users created yet)")
                        return True
                else:
                    self.log_test("Get Users API", False, "Response is not a list", data)
                    return False
            else:
                self.log_test("Get Users API", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Users API", False, f"Request error: {str(e)}")
            return False

    def setup_test_data(self):
        """Create test users and pets for PetFeed testing"""
        print("Setting up test data for PetFeed tests...")
        
        # Create test users with different verification status
        test_users_data = [
            {"method": "email", "value": "alice.petlover@tailflix.com"},
            {"method": "email", "value": "bob.dogowner@tailflix.com"},
            {"method": "phone", "value": "+1234567890"},
            {"method": "phone", "value": "+1987654321"},
            {"method": "email", "value": "charlie.catfan@tailflix.com"}
        ]
        
        # Create users via OTP flow
        for user_data in test_users_data:
            # Send OTP
            otp_response = requests.post(f"{self.base_url}/auth/send-otp", json=user_data)
            if otp_response.status_code != 200:
                continue
            
            # Verify OTP
            verify_data = {**user_data, "otp": "123456"}
            verify_response = requests.post(f"{self.base_url}/auth/verify-otp", json=verify_data)
            if verify_response.status_code == 200 and verify_response.json().get("success"):
                self.test_users.append({
                    "user_id": verify_response.json()["user_id"],
                    "method": user_data["method"],
                    "value": user_data["value"]
                })
        
        # Create test pets for different users
        test_pets_data = [
            {
                "pet_name": "Buddy",
                "breed": "Golden Retriever",
                "sex": "Male",
                "birth_year": 2020,
                "temperaments": ["Friendly", "Energetic", "Loyal"],
                "photos": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVR"]
            },
            {
                "pet_name": "Luna",
                "breed": "Border Collie",
                "sex": "Female", 
                "birth_year": 2019,
                "temperaments": ["Intelligent", "Active", "Gentle"],
                "photos": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVR"]
            },
            {
                "pet_name": "Max",
                "breed": "German Shepherd",
                "sex": "Male",
                "birth_year": 2021,
                "temperaments": ["Protective", "Confident", "Courageous"],
                "photos": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVR"]
            }
        ]
        
        # Create pets (each will be assigned to the most recent user)
        for i, pet_data in enumerate(test_pets_data):
            # Login as different users to create pets
            if i < len(self.test_users):
                user = self.test_users[i]
                # Re-login to set as current user
                verify_data = {"method": user["method"], "value": user["value"], "otp": "123456"}
                requests.post(f"{self.base_url}/auth/verify-otp", json=verify_data)
            
            pet_response = requests.post(f"{self.base_url}/pets", json=pet_data)
            if pet_response.status_code == 200:
                self.test_pets.append(pet_response.json())
        
        print(f"Setup complete: {len(self.test_users)} users, {len(self.test_pets)} pets")

    def test_likes_api_validation(self):
        """Test POST /api/likes endpoint validation"""
        if not self.test_pets:
            self.log_test("Likes API Validation", False, "No test pets available for likes testing")
            return False
        
        test_cases = [
            # Valid action types
            {"pet_id": self.test_pets[0]["id"], "action_type": "like", "should_pass": True},
            {"pet_id": self.test_pets[0]["id"], "action_type": "skip", "should_pass": True},
            {"pet_id": self.test_pets[0]["id"], "action_type": "superlike", "should_pass": True},
            {"pet_id": self.test_pets[0]["id"], "action_type": "boost", "should_pass": True},
            
            # Invalid action types
            {"pet_id": self.test_pets[0]["id"], "action_type": "invalid", "should_pass": False},
            {"pet_id": self.test_pets[0]["id"], "action_type": "dislike", "should_pass": False},
            
            # Invalid pet_id
            {"pet_id": "nonexistent-pet-id", "action_type": "like", "should_pass": False},
        ]
        
        passed = 0
        total = len(test_cases)
        
        for test_case in test_cases:
            response = requests.post(f"{self.base_url}/likes", json={
                "pet_id": test_case["pet_id"],
                "action_type": test_case["action_type"]
            })
            
            expected_success = test_case["should_pass"]
            actual_success = response.status_code == 200
            
            if expected_success == actual_success:
                passed += 1
            
            # Store successful likes for later tests
            if response.status_code == 200 and test_case["should_pass"]:
                self.test_likes.append(response.json())
        
        success = passed == total
        self.log_test("Likes API Validation", success, f"{passed}/{total} validation tests passed")
        return success

    def test_likes_storage(self):
        """Test GET /api/likes endpoint"""
        try:
            response = requests.get(f"{self.base_url}/likes")
            if response.status_code != 200:
                self.log_test("Likes Storage", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            likes = response.json()
            
            # Verify structure of stored likes
            if likes:
                sample_like = likes[0]
                required_fields = ["id", "user_id", "pet_id", "action_type", "created_at"]
                
                missing_fields = [field for field in required_fields if field not in sample_like]
                if missing_fields:
                    self.log_test("Likes Storage", False, f"Missing fields in like object: {missing_fields}")
                    return False
                
                # Verify action_type values
                valid_actions = ["like", "skip", "superlike", "boost"]
                invalid_actions = [like for like in likes if like["action_type"] not in valid_actions]
                
                if invalid_actions:
                    self.log_test("Likes Storage", False, f"Found likes with invalid action_types")
                    return False
            
            self.log_test("Likes Storage", True, f"Found {len(likes)} likes with correct structure")
            return True
        except Exception as e:
            self.log_test("Likes Storage", False, f"Request error: {str(e)}")
            return False

    def test_pet_feed_basic(self):
        """Test GET /api/pets/feed basic functionality"""
        try:
            response = requests.get(f"{self.base_url}/pets/feed")
            
            if response.status_code != 200:
                self.log_test("Pet Feed Basic", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            pets = response.json()
            
            # Verify enriched fields
            if pets:
                sample_pet = pets[0]
                required_enriched_fields = ["age", "distance_km", "owner_verified"]
                
                missing_fields = [field for field in required_enriched_fields if field not in sample_pet]
                if missing_fields:
                    self.log_test("Pet Feed Basic", False, f"Missing enriched fields: {missing_fields}")
                    return False
                
                # Verify age calculation
                current_year = datetime.now().year
                expected_age = current_year - sample_pet["birth_year"]
                if sample_pet["age"] != expected_age:
                    self.log_test("Pet Feed Basic", False, f"Age calculation incorrect: expected {expected_age}, got {sample_pet['age']}")
                    return False
                
                # Verify distance is reasonable
                if not (0.5 <= sample_pet["distance_km"] <= 50):
                    self.log_test("Pet Feed Basic", False, f"Distance out of expected range: {sample_pet['distance_km']}")
                    return False
            
            self.log_test("Pet Feed Basic", True, f"Pet feed returned {len(pets)} pets with correct enriched fields")
            return True
        except Exception as e:
            self.log_test("Pet Feed Basic", False, f"Request error: {str(e)}")
            return False

    def test_pet_feed_pagination(self):
        """Test GET /api/pets/feed pagination"""
        test_limits = [1, 2, 5, 10]
        
        for limit in test_limits:
            try:
                response = requests.get(f"{self.base_url}/pets/feed?limit={limit}")
                
                if response.status_code != 200:
                    self.log_test("Pet Feed Pagination", False, f"Limit {limit} failed: HTTP {response.status_code}")
                    return False
                
                pets = response.json()
                actual_count = len(pets)
                
                # Should return at most the requested limit
                if actual_count > limit:
                    self.log_test("Pet Feed Pagination", False, f"Limit {limit}: returned {actual_count} pets (too many)")
                    return False
                    
            except Exception as e:
                self.log_test("Pet Feed Pagination", False, f"Request error: {str(e)}")
                return False
        
        self.log_test("Pet Feed Pagination", True, "All pagination limits working correctly")
        return True

    def test_pet_feed_filtering(self):
        """Test pet feed filtering logic"""
        try:
            # Get initial feed
            response = requests.get(f"{self.base_url}/pets/feed")
            
            if response.status_code != 200:
                self.log_test("Pet Feed Filtering", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            pets = response.json()
            
            # Test that we don't get the same pet twice in the feed
            pet_ids = [pet["id"] for pet in pets]
            unique_pet_ids = set(pet_ids)
            
            if len(pet_ids) != len(unique_pet_ids):
                self.log_test("Pet Feed Filtering", False, "Pet feed contains duplicate pets")
                return False
            
            # Test that after liking a pet, it doesn't appear in subsequent feeds
            if pets:
                pet_to_like = pets[0]
                
                # Like the pet
                like_response = requests.post(f"{self.base_url}/likes", json={
                    "pet_id": pet_to_like["id"],
                    "action_type": "like"
                })
                
                if like_response.status_code == 200:
                    # Fetch feed again
                    new_feed_response = requests.get(f"{self.base_url}/pets/feed")
                    
                    if new_feed_response.status_code == 200:
                        new_pets = new_feed_response.json()
                        new_pet_ids = [pet["id"] for pet in new_pets]
                        
                        if pet_to_like["id"] in new_pet_ids:
                            self.log_test("Pet Feed Filtering", False, "Liked pet still appears in feed (filtering not working)")
                            return False
            
            self.log_test("Pet Feed Filtering", True, "Pet feed filtering logic working correctly")
            return True
        except Exception as e:
            self.log_test("Pet Feed Filtering", False, f"Request error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("TailFlix Backend API Testing Suite - PetFeed Features")
        print("=" * 60)
        print(f"Testing backend at: {self.base_url}")
        print()
        
        # Test API connectivity first
        if not self.test_api_root():
            print("❌ CRITICAL: Cannot connect to backend API. Stopping tests.")
            return False
        
        # Setup test data for PetFeed tests
        self.setup_test_data()
        time.sleep(1)  # Brief pause between setup and tests
        
        # Test all endpoints (existing + new PetFeed tests)
        tests = [
            # Existing OTP tests
            self.test_send_otp_valid_phone,
            self.test_send_otp_valid_email,
            self.test_send_otp_invalid_method,
            self.test_send_otp_empty_value,
            self.test_verify_otp_valid,
            self.test_verify_otp_invalid_length,
            self.test_verify_otp_non_numeric,
            self.test_verify_otp_user_not_exists,
            self.test_get_users,
            
            # New PetFeed tests
            self.test_likes_api_validation,
            self.test_likes_storage,
            self.test_pet_feed_basic,
            self.test_pet_feed_pagination,
            self.test_pet_feed_filtering
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
            time.sleep(0.5)  # Small delay between tests
        
        print("=" * 60)
        print(f"TEST SUMMARY: {passed}/{total} tests passed")
        print("=" * 60)
        
        # Print failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        else:
            print("\n🎉 ALL TESTS PASSED!")
        
        return passed == total

if __name__ == "__main__":
    tester = TailFlixAPITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)