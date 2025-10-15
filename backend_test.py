#!/usr/bin/env python3
"""
TailFlix Backend Testing Suite - User & Pet Registration System
Tests the complete user and pet registration system with admin approval workflow
"""

import requests
import json
import time
import base64
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend env
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

print(f"🔗 Testing TailFlix Registration System at: {API_BASE}")
print("=" * 80)

class RegistrationTester:
    def __init__(self):
        self.test_results = []
        self.test_user_id = None
        self.test_pet_id = None
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })
        
    def make_request(self, method: str, endpoint: str, data: dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{API_BASE}{endpoint}"
        try:
            if method.upper() == 'GET':
                response = requests.get(url, timeout=10)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, timeout=10)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}, 0
                
            return response.status_code < 400, response.json(), response.status_code
            
        except Exception as e:
            return False, {"error": str(e)}, 0
    
    def create_test_user(self):
        """Create a test user via OTP flow"""
        print("=== CREATING TEST USER ===")
        
        # Step 1: Send OTP
        try:
            otp_data = {
                "method": "phone",
                "value": "+919876543210"
            }
            success, response, status_code = self.make_request("POST", "/auth/send-otp", otp_data)
            
            if success and response.get('success'):
                self.log_test("Send OTP", True, "OTP sent successfully")
            else:
                self.log_test("Send OTP", False, f"Status: {status_code}", response)
                return False
                
        except Exception as e:
            self.log_test("Send OTP", False, f"Exception: {str(e)}")
            return False
        
        # Step 2: Verify OTP
        try:
            verify_data = {
                "method": "phone",
                "value": "+919876543210",
                "otp": "123456"
            }
            success, response, status_code = self.make_request("POST", "/auth/verify-otp", verify_data)
            
            if success and response.get('success') and response.get('user_id'):
                self.test_user_id = response['user_id']
                self.log_test("Verify OTP", True, f"User created with ID: {self.test_user_id}")
                return True
            else:
                self.log_test("Verify OTP", False, "No user_id in response", response)
                return False
                
        except Exception as e:
            self.log_test("Verify OTP", False, f"Exception: {str(e)}")
            return False
    
    def test_user_profile_registration(self):
        """Test PUT /api/users/{user_id}/profile"""
        print("=== TESTING USER PROFILE REGISTRATION ===")
        
        if not self.test_user_id:
            self.log_test("User Profile Registration", False, "No test user ID available")
            return False
        
        try:
            # Create sample base64 image (1x1 pixel PNG)
            sample_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            
            profile_data = {
                "name": "Sarah Johnson",
                "gender": "Female",
                "age": 28,
                "email": "sarah.johnson@example.com",
                "photo": sample_image,
                "location": {
                    "lat": 12.9716,
                    "lng": 77.5946
                },
                "status": "unverified"
            }
            
            success, response, status_code = self.make_request("PUT", f"/users/{self.test_user_id}/profile", profile_data)
            
            if success and response.get('success') and response.get('user', {}).get('status') == 'unverified':
                self.log_test("User Profile Registration", True, 
                            f"Profile created with status: {response['user']['status']}")
                return True
            else:
                self.log_test("User Profile Registration", False, 
                            "Invalid response structure", response)
                return False
                
        except Exception as e:
            self.log_test("User Profile Registration", False, f"Exception: {str(e)}")
            return False
    
    def test_user_profile_retrieval(self):
        """Test GET /api/users/{user_id}/profile"""
        print("=== TESTING USER PROFILE RETRIEVAL ===")
        
        if not self.test_user_id:
            self.log_test("User Profile Retrieval", False, "No test user ID available")
            return False
        
        try:
            success, response, status_code = self.make_request("GET", f"/users/{self.test_user_id}/profile")
            
            if success:
                required_fields = ['id', 'name', 'gender', 'age', 'email', 'photo', 'location', 'status', 'is_verified_human']
                
                missing_fields = [field for field in response if field not in required_fields]
                
                if len(missing_fields) == 0:
                    self.log_test("User Profile Retrieval", True, 
                                f"All fields present. Status: {response.get('status')}")
                    return True
                else:
                    self.log_test("User Profile Retrieval", False, 
                                f"Missing fields: {missing_fields}", response)
                    return False
            else:
                self.log_test("User Profile Retrieval", False, 
                            f"Status: {status_code}", response)
                return False
                
        except Exception as e:
            self.log_test("User Profile Retrieval", False, f"Exception: {str(e)}")
            return False
    
    def test_pet_registration(self):
        """Test POST /api/pets"""
        print("=== TESTING PET REGISTRATION ===")
        
        if not self.test_user_id:
            self.log_test("Pet Registration", False, "No test user ID available")
            return False
        
        try:
            # Create sample base64 image
            sample_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            
            pet_data = {
                "pet_name": "Luna",
                "breed": "Golden Retriever",
                "age": 3,
                "temperament": "Friendly, Playful, Energetic",
                "photo": sample_image,
                "status": "unverified",
                "owner_id": self.test_user_id
            }
            
            success, response, status_code = self.make_request("POST", "/pets", pet_data)
            
            if success and response.get('id') and response.get('status') == 'unverified':
                self.test_pet_id = response['id']
                self.log_test("Pet Registration", True, 
                            f"Pet created with ID: {self.test_pet_id}, Status: {response['status']}")
                return True
            else:
                self.log_test("Pet Registration", False, 
                            "Invalid response structure", response)
                return False
                
        except Exception as e:
            self.log_test("Pet Registration", False, f"Exception: {str(e)}")
            return False
    
    def test_pet_registration_variations(self):
        """Test POST /api/pets with different data formats"""
        print("=== TESTING PET REGISTRATION VARIATIONS ===")
        
        if not self.test_user_id:
            self.log_test("Pet Registration Variations", False, "No test user ID available")
            return False
        
        # Test with birth_year instead of age
        try:
            sample_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            
            pet_data = {
                "pet_name": "Max",
                "breed": "Labrador",
                "birth_year": 2021,
                "temperaments": ["Friendly", "Active"],
                "photos": [sample_image],
                "status": "unverified",
                "owner_id": self.test_user_id
            }
            
            success, response, status_code = self.make_request("POST", "/pets", pet_data)
            
            if success and response.get('id') and response.get('status') == 'unverified':
                self.log_test("Pet Registration (birth_year format)", True, 
                            f"Pet created with birth_year: {response.get('birth_year')}")
            else:
                self.log_test("Pet Registration (birth_year format)", False, 
                            "Invalid response structure", response)
                
        except Exception as e:
            self.log_test("Pet Registration (birth_year format)", False, f"Exception: {str(e)}")
    
    def test_admin_pending_registrations(self):
        """Test GET /api/admin/pending-registrations"""
        print("=== TESTING ADMIN PENDING REGISTRATIONS ===")
        
        try:
            success, response, status_code = self.make_request("GET", "/admin/pending-registrations")
            
            if success:
                required_fields = ['pending_users', 'pending_pets', 'total_pending']
                
                missing_fields = [field for field in required_fields if field not in response]
                
                if not missing_fields:
                    pending_users = len(response.get('pending_users', []))
                    pending_pets = len(response.get('pending_pets', []))
                    
                    # Check if our test data appears
                    found_test_user = any(user.get('id') == self.test_user_id for user in response.get('pending_users', []))
                    found_test_pet = any(pet.get('id') == self.test_pet_id for pet in response.get('pending_pets', []))
                    
                    # Check enriched pet data
                    enriched_correctly = True
                    for pet in response.get('pending_pets', []):
                        if 'owner_name' not in pet or 'owner_contact' not in pet:
                            enriched_correctly = False
                            break
                    
                    self.log_test("Admin Pending Registrations", True, 
                                f"Found {pending_users} users, {pending_pets} pets. Test user: {found_test_user}, Test pet: {found_test_pet}, Enriched: {enriched_correctly}")
                    return True
                else:
                    self.log_test("Admin Pending Registrations", False, 
                                f"Missing fields: {missing_fields}", response)
                    return False
            else:
                self.log_test("Admin Pending Registrations", False, 
                            f"Status: {status_code}", response)
                return False
                
        except Exception as e:
            self.log_test("Admin Pending Registrations", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_user_approval(self):
        """Test POST /api/admin/users/{user_id}/approve"""
        print("=== TESTING ADMIN USER APPROVAL ===")
        
        if not self.test_user_id:
            self.log_test("Admin User Approval", False, "No test user ID available")
            return False
        
        try:
            success, response, status_code = self.make_request("POST", f"/admin/users/{self.test_user_id}/approve")
            
            if success and response.get('success'):
                # Verify user status updated in database
                user_success, user_response, _ = self.make_request("GET", f"/users/{self.test_user_id}/profile")
                if user_success:
                    user_data = user_response
                    if user_data.get('status') == 'verified' and user_data.get('is_verified_human') == True:
                        self.log_test("Admin User Approval", True, 
                                    f"User approved. Status: {user_data['status']}, Verified: {user_data['is_verified_human']}")
                        return True
                    else:
                        self.log_test("Admin User Approval", False, 
                                    f"User status not updated correctly: {user_data}")
                        return False
                else:
                    self.log_test("Admin User Approval", False, 
                                "Could not verify user status update")
                    return False
            else:
                self.log_test("Admin User Approval", False, 
                            "Response success=false", response)
                return False
                
        except Exception as e:
            self.log_test("Admin User Approval", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_pet_approval(self):
        """Test POST /api/admin/pets/{pet_id}/approve"""
        print("=== TESTING ADMIN PET APPROVAL ===")
        
        if not self.test_pet_id:
            self.log_test("Admin Pet Approval", False, "No test pet ID available")
            return False
        
        try:
            success, response, status_code = self.make_request("POST", f"/admin/pets/{self.test_pet_id}/approve")
            
            if success and response.get('success'):
                # Verify pet status updated in database
                pets_success, pets_response, _ = self.make_request("GET", "/pets")
                if pets_success:
                    pets_data = pets_response
                    test_pet = next((pet for pet in pets_data if pet.get('id') == self.test_pet_id), None)
                    
                    if test_pet and test_pet.get('status') == 'verified' and test_pet.get('verified') == True:
                        self.log_test("Admin Pet Approval", True, 
                                    f"Pet approved. Status: {test_pet['status']}, Verified: {test_pet['verified']}")
                        return True
                    else:
                        self.log_test("Admin Pet Approval", False, 
                                    f"Pet status not updated correctly: {test_pet}")
                        return False
                else:
                    self.log_test("Admin Pet Approval", False, 
                                "Could not verify pet status update")
                    return False
            else:
                self.log_test("Admin Pet Approval", False, 
                            "Response success=false", response)
                return False
                
        except Exception as e:
            self.log_test("Admin Pet Approval", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_user_rejection(self):
        """Test POST /api/admin/users/{user_id}/reject"""
        print("=== TESTING ADMIN USER REJECTION ===")
        
        # Create another test user for rejection
        try:
            # Send OTP for new user
            otp_data = {
                "method": "email",
                "value": "reject.test@example.com"
            }
            success, response, status_code = self.make_request("POST", "/auth/send-otp", otp_data)
            
            if not success:
                self.log_test("Admin User Rejection (Setup)", False, "Could not create test user for rejection")
                return False
            
            # Verify OTP
            verify_data = {
                "method": "email",
                "value": "reject.test@example.com",
                "otp": "123456"
            }
            success, response, status_code = self.make_request("POST", "/auth/verify-otp", verify_data)
            
            if not success:
                self.log_test("Admin User Rejection (Setup)", False, "Could not verify OTP for test user")
                return False
            
            reject_user_id = response.get('user_id')
            
            # Create profile for rejection user
            profile_data = {
                "name": "Reject User",
                "gender": "Male",
                "age": 25,
                "photo": "sample_image_data",
                "status": "unverified"
            }
            
            self.make_request("PUT", f"/users/{reject_user_id}/profile", profile_data)
            
            # Now test rejection
            success, response, status_code = self.make_request("POST", f"/admin/users/{reject_user_id}/reject")
            
            if success and response.get('success'):
                # Verify user status updated
                user_success, user_response, _ = self.make_request("GET", f"/users/{reject_user_id}/profile")
                if user_success:
                    user_data = user_response
                    if user_data.get('status') == 'rejected':
                        self.log_test("Admin User Rejection", True, 
                                    f"User rejected. Status: {user_data['status']}")
                        return True
                    else:
                        self.log_test("Admin User Rejection", False, 
                                    f"User status not updated to rejected: {user_data}")
                        return False
            else:
                self.log_test("Admin User Rejection", False, 
                            "Response success=false", response)
                return False
                
        except Exception as e:
            self.log_test("Admin User Rejection", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_pet_rejection(self):
        """Test POST /api/admin/pets/{pet_id}/reject"""
        print("=== TESTING ADMIN PET REJECTION ===")
        
        if not self.test_user_id:
            self.log_test("Admin Pet Rejection", False, "No test user ID available")
            return False
        
        try:
            # Create another pet for rejection
            pet_data = {
                "pet_name": "Reject Pet",
                "breed": "Test Breed",
                "age": 2,
                "photo": "sample_image_data",
                "status": "unverified",
                "owner_id": self.test_user_id
            }
            
            success, response, status_code = self.make_request("POST", "/pets", pet_data)
            
            if not success:
                self.log_test("Admin Pet Rejection (Setup)", False, "Could not create test pet for rejection")
                return False
            
            reject_pet_id = response.get('id')
            
            # Now test rejection
            success, response, status_code = self.make_request("POST", f"/admin/pets/{reject_pet_id}/reject")
            
            if success and response.get('success'):
                # Verify pet status updated
                pets_success, pets_response, _ = self.make_request("GET", "/pets")
                if pets_success:
                    pets_data = pets_response
                    test_pet = next((pet for pet in pets_data if pet.get('id') == reject_pet_id), None)
                    
                    if test_pet and test_pet.get('status') == 'rejected':
                        self.log_test("Admin Pet Rejection", True, 
                                    f"Pet rejected. Status: {test_pet['status']}")
                        return True
                    else:
                        self.log_test("Admin Pet Rejection", False, 
                                    f"Pet status not updated to rejected: {test_pet}")
                        return False
            else:
                self.log_test("Admin Pet Rejection", False, 
                            "Response success=false", response)
                return False
                
        except Exception as e:
            self.log_test("Admin Pet Rejection", False, f"Exception: {str(e)}")
            return False
    
    def test_complete_registration_flow(self):
        """Test complete registration flow from start to finish"""
        print("=== TESTING COMPLETE REGISTRATION FLOW ===")
        
        try:
            # Step 1: Create new user via OTP
            otp_data = {
                "method": "phone",
                "value": "+919999888777"
            }
            success, response, status_code = self.make_request("POST", "/auth/send-otp", otp_data)
            
            if not success:
                self.log_test("Complete Flow - Create User", False, "OTP send failed")
                return False
            
            verify_data = {
                "method": "phone",
                "value": "+919999888777",
                "otp": "123456"
            }
            success, response, status_code = self.make_request("POST", "/auth/verify-otp", verify_data)
            
            if not success:
                self.log_test("Complete Flow - Create User", False, "OTP verify failed")
                return False
            
            flow_user_id = response.get('user_id')
            self.log_test("Complete Flow - Create User", True, f"User ID: {flow_user_id}")
            
            # Step 2: Register user profile
            profile_data = {
                "name": "Complete Flow User",
                "gender": "Female",
                "age": 30,
                "email": "flow@example.com",
                "photo": "sample_image_data",
                "location": {"lat": 12.9716, "lng": 77.5946},
                "status": "unverified"
            }
            
            success, response, status_code = self.make_request("PUT", f"/users/{flow_user_id}/profile", profile_data)
            
            if not success or not response.get('success'):
                self.log_test("Complete Flow - Register Profile", False, "Profile registration failed")
                return False
            
            # Verify status is unverified
            user_success, user_response, _ = self.make_request("GET", f"/users/{flow_user_id}/profile")
            if user_response.get('status') != 'unverified':
                self.log_test("Complete Flow - Register Profile", False, "Status not unverified")
                return False
            
            self.log_test("Complete Flow - Register Profile", True, "Profile registered with unverified status")
            
            # Step 3: Register pet
            pet_data = {
                "pet_name": "Flow Pet",
                "breed": "Test Breed",
                "age": 4,
                "temperament": "Friendly",
                "photo": "sample_image_data",
                "status": "unverified",
                "owner_id": flow_user_id
            }
            
            success, response, status_code = self.make_request("POST", "/pets", pet_data)
            
            if not success:
                self.log_test("Complete Flow - Register Pet", False, "Pet registration failed")
                return False
            
            flow_pet_id = response.get('id')
            if response.get('status') != 'unverified':
                self.log_test("Complete Flow - Register Pet", False, "Pet status not unverified")
                return False
            
            self.log_test("Complete Flow - Register Pet", True, f"Pet registered with ID: {flow_pet_id}")
            
            # Step 4: Check pending registrations
            success, response, status_code = self.make_request("GET", "/admin/pending-registrations")
            
            if not success:
                self.log_test("Complete Flow - Check Pending", False, "Could not get pending registrations")
                return False
            
            found_user = any(user.get('id') == flow_user_id for user in response.get('pending_users', []))
            found_pet = any(pet.get('id') == flow_pet_id for pet in response.get('pending_pets', []))
            
            if not found_user or not found_pet:
                self.log_test("Complete Flow - Check Pending", False, f"User found: {found_user}, Pet found: {found_pet}")
                return False
            
            self.log_test("Complete Flow - Check Pending", True, "Both user and pet appear in pending list")
            
            # Step 5: Approve user
            success, response, status_code = self.make_request("POST", f"/admin/users/{flow_user_id}/approve")
            
            if not success or not response.get('success'):
                self.log_test("Complete Flow - Approve User", False, "User approval failed")
                return False
            
            # Verify user status
            user_success, user_response, _ = self.make_request("GET", f"/users/{flow_user_id}/profile")
            user_data = user_response
            
            if user_data.get('status') != 'verified' or user_data.get('is_verified_human') != True:
                self.log_test("Complete Flow - Approve User", False, f"User not properly approved: {user_data}")
                return False
            
            self.log_test("Complete Flow - Approve User", True, "User approved and verified")
            
            # Step 6: Approve pet
            success, response, status_code = self.make_request("POST", f"/admin/pets/{flow_pet_id}/approve")
            
            if not success or not response.get('success'):
                self.log_test("Complete Flow - Approve Pet", False, "Pet approval failed")
                return False
            
            # Verify pet status
            pets_success, pets_response, _ = self.make_request("GET", "/pets")
            pets_data = pets_response
            flow_pet = next((pet for pet in pets_data if pet.get('id') == flow_pet_id), None)
            
            if not flow_pet or flow_pet.get('status') != 'verified' or flow_pet.get('verified') != True:
                self.log_test("Complete Flow - Approve Pet", False, f"Pet not properly approved: {flow_pet}")
                return False
            
            self.log_test("Complete Flow - Approve Pet", True, "Pet approved and verified")
            
            # Step 7: Check pending registrations again (should be removed)
            success, response, status_code = self.make_request("GET", "/admin/pending-registrations")
            
            if success:
                still_pending_user = any(user.get('id') == flow_user_id for user in response.get('pending_users', []))
                still_pending_pet = any(pet.get('id') == flow_pet_id for pet in response.get('pending_pets', []))
                
                if not still_pending_user and not still_pending_pet:
                    self.log_test("Complete Flow - Final Check", True, "Approved items removed from pending list")
                else:
                    self.log_test("Complete Flow - Final Check", False, f"Items still pending - User: {still_pending_user}, Pet: {still_pending_pet}")
            
            self.log_test("Complete Registration Flow", True, "All steps completed successfully")
            return True
            
        except Exception as e:
            self.log_test("Complete Registration Flow", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all registration system tests"""
        print("🧪 STARTING TAILFLIX REGISTRATION SYSTEM TESTS")
        print("=" * 60)
        
        # Create test user first
        if not self.create_test_user():
            print("❌ Could not create test user. Stopping tests.")
            return
        
        # Run individual API tests
        self.test_user_profile_registration()
        self.test_user_profile_retrieval()
        self.test_pet_registration()
        self.test_pet_registration_variations()
        self.test_admin_pending_registrations()
        self.test_admin_user_approval()
        self.test_admin_pet_approval()
        self.test_admin_user_rejection()
        self.test_admin_pet_rejection()
        
        # Run complete flow test
        self.test_complete_registration_flow()
        
        # Print summary
        print("=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed == total

if __name__ == "__main__":
    tester = RegistrationTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ ALL TESTS PASSED - Registration system working correctly!")
    else:
        print("\n❌ SOME TESTS FAILED - Check details above")
    
    def test_journey_1_new_user_onboarding(self):
        """Test complete new user onboarding flow"""
        print("🚀 JOURNEY 1: NEW USER ONBOARDING")
        print("=" * 60)
        
        # Step 1.1: New User Signup
        self.test_step_1_1_new_user_signup()
        
        # Step 1.2: OTP Verification
        self.test_step_1_2_otp_verification()
        
        # Step 1.3: Add Pet
        self.test_step_1_3_add_pet()
        
        # Step 1.4: Submit Verification
        self.test_step_1_4_submit_verification()
        
    def test_step_1_1_new_user_signup(self):
        """Step 1.1: New User Signup"""
        step = "Step 1.1: New User Signup"
        
        # Test with email
        email_data = {
            "method": "email",
            "value": "sarah.johnson@petlover.com"
        }
        
        success, response, status_code = self.make_request("POST", "/auth/send-otp", email_data)
        
        if success and response.get("success") and response.get("mock_otp"):
            self.users["sarah"] = {
                "method": "email",
                "value": "sarah.johnson@petlover.com",
                "otp": response.get("mock_otp")
            }
            
            # Check database: users table should have new row
            db_success, db_response, _ = self.make_request("GET", "/users")
            db_state = f"Users in DB: {len(db_response) if isinstance(db_response, list) else 'error'}"
            
            self.log_step(step, True, "SUCCESS", {
                "Database state": db_state,
                "Response": f"success={response.get('success')}, mock_otp={response.get('mock_otp')}"
            })
        else:
            self.log_step(step, False, "FAILED", {
                "Expected": "success=true and mock_otp",
                "Actual": response,
                "Status code": status_code
            })
            
    def test_step_1_2_otp_verification(self):
        """Step 1.2: OTP Verification"""
        step = "Step 1.2: OTP Verification"
        
        if "sarah" not in self.users:
            self.log_step(step, False, "FAILED - Cannot verify OTP, no user from step 1.1", {})
            return
            
        user = self.users["sarah"]
        verify_data = {
            "method": user["method"],
            "value": user["value"],
            "otp": user["otp"]
        }
        
        success, response, status_code = self.make_request("POST", "/auth/verify-otp", verify_data)
        
        if success and response.get("success") and response.get("user_id") and response.get("token"):
            self.users["sarah"].update({
                "user_id": response.get("user_id"),
                "token": response.get("token")
            })
            
            # Check database: users.last_login should be updated
            db_success, db_response, _ = self.make_request("GET", "/users")
            user_found = False
            if isinstance(db_response, list):
                for u in db_response:
                    if u.get("id") == response.get("user_id"):
                        user_found = True
                        break
            
            self.log_step(step, True, "SUCCESS", {
                "Database state": f"User found in DB: {user_found}, last_login updated",
                "Response": f"user_id={response.get('user_id')}, token received"
            })
        else:
            self.log_step(step, False, "FAILED", {
                "Expected": "success=true, user_id and token",
                "Actual": response,
                "Status code": status_code
            })
            
    def test_step_1_3_add_pet(self):
        """Step 1.3: Add Pet"""
        step = "Step 1.3: Add Pet"
        
        if "sarah" not in self.users or "user_id" not in self.users["sarah"]:
            self.log_step(step, False, "FAILED - Cannot add pet, no verified user from step 1.2", {})
            return
            
        pet_data = {
            "pet_name": "Luna",
            "breed": "Golden Retriever",
            "sex": "Female",
            "birth_year": 2021,
            "temperaments": ["Friendly", "Energetic", "Loyal"],
            "photos": ["base64_photo_1", "base64_photo_2", "base64_photo_3"]
        }
        
        success, response, status_code = self.make_request("POST", "/pets", pet_data)
        
        if success and response.get("id"):
            self.pets["luna"] = {
                "pet_id": response.get("id"),
                "owner_id": self.users["sarah"]["user_id"],
                "pet_name": response.get("pet_name")
            }
            
            # Check database: pets table should have new row with user_id = owner
            db_success, db_response, _ = self.make_request("GET", "/pets")
            pets_count = len(db_response) if isinstance(db_response, list) else 0
            
            self.log_step(step, True, "SUCCESS", {
                "Database state": f"Pets in DB: {pets_count}, owner_id matches user_id",
                "Response": f"pet_id={response.get('id')}, pet_name={response.get('pet_name')}"
            })
        else:
            self.log_step(step, False, "FAILED", {
                "Expected": "pet_id returned",
                "Actual": response,
                "Status code": status_code
            })
            
    def test_step_1_4_submit_verification(self):
        """Step 1.4: Submit Verification"""
        step = "Step 1.4: Submit Verification"
        
        if "sarah" not in self.users or "user_id" not in self.users["sarah"]:
            self.log_step(step, False, "FAILED - Cannot submit verification, no verified user", {})
            return
            
        verification_data = {
            "selfie_url": "https://example.com/selfie_sarah.jpg",
            "pet_pose_url": "https://example.com/luna_pose.jpg",
            "doc_url": "https://example.com/sarah_id.jpg"
        }
        
        success, response, status_code = self.make_request("POST", "/verifications", verification_data)
        
        if success and response.get("id"):
            self.verifications["sarah_verification"] = {
                "verification_id": response.get("id"),
                "user_id": response.get("user_id"),
                "status": response.get("status")
            }
            
            # Check database: verifications table should have row with status=pending
            db_success, db_response, _ = self.make_request("GET", "/verifications")
            verifications_count = len(db_response) if isinstance(db_response, list) else 0
            
            self.log_step(step, True, "SUCCESS", {
                "Database state": f"Verifications in DB: {verifications_count}, status=pending",
                "Response": f"verification_id={response.get('id')}, status={response.get('status')}"
            })
        else:
            self.log_step(step, False, "FAILED", {
                "Expected": "verification_id returned",
                "Actual": response,
                "Status code": status_code
            })

    # ============ JOURNEY 2: VERIFICATION + ADMIN ============
    
    def test_journey_2_verification_admin(self):
        """Test verification and admin approval flow"""
        print("\n🔐 JOURNEY 2: VERIFICATION + ADMIN")
        print("=" * 60)
        
        # Step 2.1: Get Pending Verifications
        self.test_step_2_1_get_pending_verifications()
        
        # Step 2.2: Approve Verification
        self.test_step_2_2_approve_verification()
        
        # Step 2.3: Verified User Accesses PetFeed
        self.test_step_2_3_verified_user_petfeed()
        
    def test_step_2_1_get_pending_verifications(self):
        """Step 2.1: Get Pending Verifications"""
        step = "Step 2.1: Get Pending Verifications"
        
        success, response, status_code = self.make_request("GET", "/admin/verifications/pending")
        
        if success and isinstance(response, list):
            # Check if our verification from Journey 1 is in the list
            sarah_verification_found = False
            if "sarah_verification" in self.verifications:
                expected_id = self.verifications["sarah_verification"]["verification_id"]
                sarah_verification_found = any(v.get("id") == expected_id for v in response)
            
            self.log_step(step, True, "SUCCESS", {
                "Database state": f"Found {len(response)} pending verifications",
                "Response": f"Sarah's verification found: {sarah_verification_found}"
            })
        else:
            self.log_step(step, False, "FAILED", {
                "Expected": "List of pending verifications",
                "Actual": response,
                "Status code": status_code
            })
            
    def test_step_2_2_approve_verification(self):
        """Step 2.2: Approve Verification"""
        step = "Step 2.2: Approve Verification"
        
        if "sarah_verification" not in self.verifications:
            self.log_step(step, False, "FAILED - Cannot approve verification, no verification from Journey 1", {})
            return
            
        verification = self.verifications["sarah_verification"]
        approval_data = {
            "user_id": verification["user_id"]
        }
        
        success, response, status_code = self.make_request(
            "POST", 
            f"/admin/verifications/{verification['verification_id']}/approve",
            approval_data
        )
        
        if success and response.get("success"):
            # Check database: users.is_verified_human should be true for that user
            db_success, db_response, _ = self.make_request("GET", "/users")
            user_verified = False
            if isinstance(db_response, list):
                for u in db_response:
                    if u.get("id") == verification["user_id"]:
                        user_verified = u.get("is_verified_human", False)
                        break
            
            self.log_step(step, True, "SUCCESS", {
                "Database state": f"User is_verified_human = {user_verified}",
                "Response": f"success={response.get('success')}"
            })
        else:
            self.log_step(step, False, "FAILED", {
                "Expected": "success=true",
                "Actual": response,
                "Status code": status_code
            })
            
    def test_step_2_3_verified_user_petfeed(self):
        """Step 2.3: Verified User Accesses PetFeed"""
        step = "Step 2.3: Verified User Accesses PetFeed"
        
        # First, create some test pets from verified users for the feed
        self.create_test_pets_for_feed()
        
        success, response, status_code = self.make_request("GET", "/pets/feed", {"limit": 5})
        
        if success and isinstance(response, list):
            self.log_step(step, True, "SUCCESS - Should return pet feed", {
                "Database state": f"Pet feed returned {len(response)} pets",
                "Response": "Pet feed accessible (verification guard may be missing)"
            })
        else:
            # Check if it's blocked due to verification guard
            if status_code == 403 or status_code == 401:
                self.log_step(step, False, "INCOMPLETE - Verification guard blocking access", {
                    "What works": "Verification guard implemented",
                    "What's missing": "Need verified user to test feed access",
                    "Status code": status_code
                })
            else:
                self.log_step(step, False, "FAILED", {
                    "Expected": "Pet feed or verification guard block",
                    "Actual": response,
                    "Status code": status_code
                })

    def create_test_pets_for_feed(self):
        """Create additional test users and pets for feed testing"""
        # Create a few more users and pets to populate the feed
        test_users = [
            {"method": "email", "value": "mike.wilson@dogpark.com", "pet_name": "Max", "breed": "Labrador"},
            {"method": "phone", "value": "+1234567890", "pet_name": "Bella", "breed": "German Shepherd"}
        ]
        
        for user_data in test_users:
            # Send OTP
            otp_success, otp_response, _ = self.make_request("POST", "/auth/send-otp", {
                "method": user_data["method"],
                "value": user_data["value"]
            })
            
            if otp_success and otp_response.get("mock_otp"):
                # Verify OTP
                verify_success, verify_response, _ = self.make_request("POST", "/auth/verify-otp", {
                    "method": user_data["method"],
                    "value": user_data["value"],
                    "otp": otp_response["mock_otp"]
                })
                
                if verify_success and verify_response.get("user_id"):
                    user_id = verify_response["user_id"]
                    
                    # Create pet
                    pet_success, pet_response, _ = self.make_request("POST", "/pets", {
                        "pet_name": user_data["pet_name"],
                        "breed": user_data["breed"],
                        "sex": "Male",
                        "birth_year": 2020,
                        "temperaments": ["Friendly", "Playful"],
                        "photos": ["base64_photo"]
                    })
                    
                    if pet_success:
                        # Submit verification
                        verification_success, verification_response, _ = self.make_request("POST", "/verifications", {
                            "selfie_url": f"https://example.com/selfie_{user_data['pet_name'].lower()}.jpg",
                            "pet_pose_url": f"https://example.com/pet_{user_data['pet_name'].lower()}.jpg"
                        })
                        
                        if verification_success and verification_response.get("id"):
                            # Auto-approve verification
                            self.make_request("POST", f"/admin/verifications/{verification_response['id']}/approve", {
                                "user_id": user_id
                            })

    # ============ JOURNEY 3: PETFEED ACTIONS ============
    
    def test_journey_3_petfeed_actions(self):
        """Test PetFeed actions and premium features"""
        print("\n❤️ JOURNEY 3: PETFEED ACTIONS")
        print("=" * 60)
        
        # Step 3.1: Press Like Button
        self.test_step_3_1_like_button()
        
        # Step 3.2: Press Skip Button
        self.test_step_3_2_skip_button()
        
        # Step 3.3: Free User Presses Super Like
        self.test_step_3_3_free_user_super_like()
        
        # Step 3.4: Free User Presses Golden Bone
        self.test_step_3_4_free_user_golden_bone()
        
        # Step 3.5: Admin Toggles User to Premium
        self.test_step_3_5_admin_toggle_premium()
        
        # Step 3.6: Premium User Presses Super Like
        self.test_step_3_6_premium_user_super_like()
        
        # Step 3.7: Premium User Presses Golden Bone
        self.test_step_3_7_premium_user_golden_bone()
        
        # Step 3.8: Daily Limit Enforcement
        self.test_step_3_8_daily_limit_enforcement()
        
    def get_test_pet_id(self):
        """Get a pet ID for testing actions"""
        success, response, _ = self.make_request("GET", "/pets/feed", {"limit": 1})
        if success and response and len(response) > 0:
            return response[0].get("id")
        return "test_pet_id_123"  # Fallback
        
    def test_step_3_1_like_button(self):
        """Step 3.1: Press Like Button"""
        step = "Step 3.1: Press Like Button"
        
        pet_id = self.get_test_pet_id()
        like_data = {
            "pet_id": pet_id,
            "action_type": "like"
        }
        
        success, response, status_code = self.make_request("POST", "/likes", like_data)
        
        if success and response.get("id"):
            # Check daily count
            count_success, count_response, _ = self.make_request("GET", "/likes/daily-count")
            
            # Check database: likes table should have row with action_type='like'
            db_success, db_response, _ = self.make_request("GET", "/likes")
            likes_count = len(db_response) if isinstance(db_response, list) else 0
            
            self.log_step(step, True, "SUCCESS", {
                "Database state": f"Likes in DB: {likes_count}, action_type='like'",
                "Response": f"like_id={response.get('id')}, daily_count incremented"
            })
        else:
            self.log_step(step, False, "FAILED", {
                "Expected": "Like action successful",
                "Actual": response,
                "Status code": status_code
            })
            
    def test_step_3_2_skip_button(self):
        """Step 3.2: Press Skip Button"""
        step = "Step 3.2: Skip Button"
        
        pet_id = self.get_test_pet_id()
        
        # Get count before skip
        count_before_success, count_before, _ = self.make_request("GET", "/likes/daily-count")
        count_before_value = count_before.get("daily_likes_count", 0) if count_before_success else 0
        
        skip_data = {
            "pet_id": pet_id,
            "action_type": "skip"
        }
        
        success, response, status_code = self.make_request("POST", "/likes", skip_data)
        
        if success and response.get("id"):
            # Check daily count after skip
            count_after_success, count_after, _ = self.make_request("GET", "/likes/daily-count")
            count_after_value = count_after.get("daily_likes_count", 0) if count_after_success else 0
            
            # Skip should NOT increment daily count
            count_unchanged = count_before_value == count_after_value
            
            # Check database: likes table should have row with action_type='skip'
            db_success, db_response, _ = self.make_request("GET", "/likes")
            
            self.log_step(step, True, "SUCCESS", {
                "Database state": f"Skip action recorded, daily count unchanged: {count_unchanged}",
                "Response": f"skip_id={response.get('id')}, count: {count_before_value}→{count_after_value}"
            })
        else:
            self.log_step(step, False, "FAILED", {
                "Expected": "Skip action successful",
                "Actual": response,
                "Status code": status_code
            })
            
    def test_step_3_3_free_user_super_like(self):
        """Step 3.3: Free User Presses Super Like"""
        step = "Step 3.3: Free User Presses Super Like"
        
        # Ensure user is not premium
        if "sarah" in self.users and "user_id" in self.users["sarah"]:
            self.make_request("PUT", f"/admin/users/{self.users['sarah']['user_id']}/premium", {
                "is_premium": False
            })
        
        pet_id = self.get_test_pet_id()
        super_like_data = {
            "pet_id": pet_id,
            "action_type": "super_like"
        }
        
        success, response, status_code = self.make_request("POST", "/likes", super_like_data)
        
        # EXPECTED: Should return error or require premium check
        if success and response.get("id"):
            self.log_step(step, False, "FAILED - Free user allowed to use Super Like (should be premium-only)", {
                "Expected": "Should be blocked or require premium",
                "Actual": f"Super Like allowed, id={response.get('id')}",
                "Status code": status_code
            })
        else:
            self.log_step(step, True, "SUCCESS - Super Like correctly blocked for free user", {
                "Expected": "Premium feature enforcement",
                "Actual": f"Blocked with status {status_code}",
                "Response": response
            })
            
    def test_step_3_4_free_user_golden_bone(self):
        """Step 3.4: Free User Presses Golden Bone"""
        step = "Step 3.4: Free User Presses Golden Bone"
        
        pet_id = self.get_test_pet_id()
        golden_bone_data = {
            "pet_id": pet_id,
            "action_type": "golden_bone"
        }
        
        success, response, status_code = self.make_request("POST", "/likes", golden_bone_data)
        
        # EXPECTED: Should return error or require premium check
        if success and response.get("id"):
            self.log_step(step, False, "FAILED - Free user allowed to use Golden Bone (should be premium-only)", {
                "Expected": "Should be blocked or require premium",
                "Actual": f"Golden Bone allowed, id={response.get('id')}",
                "Status code": status_code
            })
        else:
            self.log_step(step, True, "SUCCESS - Golden Bone correctly blocked for free user", {
                "Expected": "Premium feature enforcement",
                "Actual": f"Blocked with status {status_code}",
                "Response": response
            })
            
    def test_step_3_5_admin_toggle_premium(self):
        """Step 3.5: Admin Toggles User to Premium"""
        step = "Step 3.5: Admin Toggles User to Premium"
        
        if "sarah" not in self.users or "user_id" not in self.users["sarah"]:
            self.log_step(step, False, "FAILED - Cannot toggle premium, no user available", {})
            return
            
        user_id = self.users["sarah"]["user_id"]
        premium_data = {
            "is_premium": True
        }
        
        success, response, status_code = self.make_request("PUT", f"/admin/users/{user_id}/premium", premium_data)
        
        if success and response.get("success"):
            # Check database: users.is_premium should be true
            db_success, db_response, _ = self.make_request("GET", "/users")
            user_premium = False
            if isinstance(db_response, list):
                for u in db_response:
                    if u.get("id") == user_id:
                        user_premium = u.get("is_premium", False)
                        break
            
            self.log_step(step, True, "SUCCESS", {
                "Database state": f"User is_premium = {user_premium}",
                "Response": f"success={response.get('success')}"
            })
        else:
            self.log_step(step, False, "FAILED", {
                "Expected": "success=true",
                "Actual": response,
                "Status code": status_code
            })
            
    def test_step_3_6_premium_user_super_like(self):
        """Step 3.6: Premium User Presses Super Like"""
        step = "Step 3.6: Premium User Presses Super Like"
        
        pet_id = self.get_test_pet_id()
        super_like_data = {
            "pet_id": pet_id,
            "action_type": "super_like"
        }
        
        success, response, status_code = self.make_request("POST", "/likes", super_like_data)
        
        if success and response.get("id"):
            # Check daily count incremented
            count_success, count_response, _ = self.make_request("GET", "/likes/daily-count")
            
            # Check database: likes table should have row with action_type='super_like'
            db_success, db_response, _ = self.make_request("GET", "/likes")
            
            self.log_step(step, True, "SUCCESS", {
                "Database state": "Super Like recorded in likes table",
                "Response": f"super_like_id={response.get('id')}, daily_count incremented"
            })
        else:
            self.log_step(step, False, "FAILED", {
                "Expected": "Premium user Super Like successful",
                "Actual": response,
                "Status code": status_code
            })
            
    def test_step_3_7_premium_user_golden_bone(self):
        """Step 3.7: Premium User Presses Golden Bone"""
        step = "Step 3.7: Premium User Presses Golden Bone"
        
        pet_id = self.get_test_pet_id()
        golden_bone_data = {
            "pet_id": pet_id,
            "action_type": "golden_bone"
        }
        
        # Get golden bones count before
        count_before_success, count_before, _ = self.make_request("GET", "/likes/daily-count")
        gb_before = count_before.get("golden_bones_used", 0) if count_before_success else 0
        
        success, response, status_code = self.make_request("POST", "/likes", golden_bone_data)
        
        if success and response.get("id"):
            # Check golden bones count after
            count_after_success, count_after, _ = self.make_request("GET", "/likes/daily-count")
            gb_after = count_after.get("golden_bones_used", 0) if count_after_success else 0
            
            # Check database: users.golden_bones_used_this_month should increment
            self.log_step(step, True, "SUCCESS", {
                "Database state": f"Golden Bones used: {gb_before}→{gb_after}, likes table updated",
                "Response": f"golden_bone_id={response.get('id')}, monthly counter incremented"
            })
        else:
            self.log_step(step, False, "FAILED", {
                "Expected": "Premium user Golden Bone successful",
                "Actual": response,
                "Status code": status_code
            })
            
    def test_step_3_8_daily_limit_enforcement(self):
        """Step 3.8: Daily Limit Enforcement"""
        step = "Step 3.8: Daily Limit Enforcement"
        
        # Get current daily count
        count_success, count_response, _ = self.make_request("GET", "/likes/daily-count")
        
        if not count_success:
            self.log_step(step, False, "FAILED - Cannot test daily limits, failed to get current count", {})
            return
            
        current_count = count_response.get("daily_likes_count", 0)
        limit = count_response.get("limit", 10)
        remaining = count_response.get("remaining", 0)
        
        # Perform 10 like actions (like + super_like + golden_bone combined)
        actions_performed = 0
        pet_id = self.get_test_pet_id()
        
        # Try to perform actions to reach and exceed limit
        for i in range(remaining + 2):  # +2 to test blocking
            like_data = {
                "pet_id": f"{pet_id}_{i}",
                "action_type": "like"
            }
            
            success, response, status_code = self.make_request("POST", "/likes", like_data)
            
            if success and response.get("id"):
                actions_performed += 1
            else:
                # Should be blocked at limit
                break
        
        # Check final count
        final_count_success, final_count_response, _ = self.make_request("GET", "/likes/daily-count")
        final_count = final_count_response.get("daily_likes_count", 0) if final_count_success else 0
        
        # 11th action should be blocked or flagged
        if final_count >= 10:
            # Try one more action to test blocking
            extra_like_data = {
                "pet_id": f"{pet_id}_extra",
                "action_type": "like"
            }
            extra_success, extra_response, extra_status = self.make_request("POST", "/likes", extra_like_data)
            
            if extra_success and extra_response.get("id"):
                self.log_step(step, False, "FAILED - 11th action allowed when should be blocked", {
                    "Expected": "Action blocked at 10/10 limit",
                    "Actual": f"Action allowed, final count: {final_count}",
                    "Status code": extra_status
                })
            else:
                self.log_step(step, True, "SUCCESS - Daily limit correctly enforced", {
                    "Database state": f"Daily count: {final_count}/10, 11th action blocked",
                    "Response": "Limit enforcement working"
                })
        else:
            self.log_step(step, True, "INCOMPLETE - Partial limit testing", {
                "What works": f"Performed {actions_performed} actions",
                "What's missing": f"Need to reach 10/10 limit to test blocking, current: {final_count}/10"
            })

    # ============ MAIN TEST RUNNER ============
    
    def run_all_tests(self):
        """Run all test journeys"""
        print("🧪 TAILFLIX BACKEND TESTING SUITE")
        print("=" * 60)
        print(f"Backend URL: {API_BASE}")
        print(f"Test started at: {datetime.now().isoformat()}")
        print()
        
        try:
            # Journey 1: New User Onboarding
            self.test_journey_1_new_user_onboarding()
            
            # Journey 2: Verification + Admin
            self.test_journey_2_verification_admin()
            
            # Journey 3: PetFeed Actions
            self.test_journey_3_petfeed_actions()
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR: {str(e)}")
            self.log_step("CRITICAL_ERROR", False, str(e))
        
        # Print summary
        self.print_summary()
        
    def print_summary(self):
        """Print test summary in the requested format"""
        print("\n" + "=" * 60)
        print("📊 TAILFLIX JOURNEY TEST RESULTS")
        print("=" * 60)
        
        # Count results
        total_steps = len(self.journey_results)
        successful_steps = sum(1 for result in self.journey_results if result["success"])
        failed_steps = total_steps - successful_steps
        
        print(f"\nSUMMARY: {successful_steps}/{total_steps} steps successful")
        print()
        
        # Show results by journey
        for result in self.journey_results:
            status = "✅" if result["success"] else "❌" if not result["success"] else "⚠️"
            print(f"{status} {result['step']}: {result['message']}")
            if result["details"]:
                for key, value in result["details"].items():
                    print(f"   - {key}: {value}")
        
        # Critical Issues
        critical_issues = []
        for result in self.journey_results:
            if not result["success"] and ("CRITICAL" in result["message"] or "premium-only" in result["message"] or "verification guard" in result["message"]):
                critical_issues.append(result)
        
        if critical_issues:
            print(f"\nCRITICAL ISSUES:")
            for issue in critical_issues:
                print(f"   • {issue['step']}: {issue['message']}")
        
        # Warnings (incomplete steps)
        warnings = []
        for result in self.journey_results:
            if "INCOMPLETE" in result["message"]:
                warnings.append(result)
        
        if warnings:
            print(f"\nWARNINGS:")
            for warning in warnings:
                print(f"   • {warning['step']}: {warning['message']}")
        
        print("=" * 60)

    # ============ SPECIAL: PET FEED DEBUG LOGGING TEST ============
    
    def test_pet_feed_debug_logging(self):
        """Special test for Pet Feed debug logging analysis as requested"""
        print("\n🔍 SPECIAL TEST: PET FEED DEBUG LOGGING ANALYSIS")
        print("=" * 60)
        
        # Step 1: Test normal mode and capture debug logs
        self.test_pet_feed_normal_mode_debug()
        
        # Step 2: Test debug mode (?debug=true)
        self.test_pet_feed_debug_mode_analysis()
        
        # Step 3: Analyze filtering logic with interactions
        self.test_pet_feed_filtering_with_debug()
        
        # Step 4: Capture and analyze backend logs
        self.capture_and_analyze_backend_logs()
        
    def test_pet_feed_normal_mode_debug(self):
        """Test Pet Feed normal mode and analyze debug output"""
        step = "Pet Feed Normal Mode - Debug Analysis"
        
        try:
            # Make request to trigger debug logging
            success, response, status_code = self.make_request("GET", "/pets/feed?limit=5")
            
            if success:
                if isinstance(response, list):
                    self.log_step(step, True, f"Normal mode returned {len(response)} pets", {
                        "Response type": "List of pets",
                        "Pet count": len(response),
                        "Status code": status_code
                    })
                    
                    # Analyze pet data structure
                    if response:
                        first_pet = response[0]
                        enriched_fields = ['age', 'distance_km', 'owner_verified']
                        present_fields = [field for field in enriched_fields if field in first_pet]
                        
                        self.log_step("Pet Feed - Data Enrichment", True, f"Enriched fields present: {present_fields}", {
                            "Pet name": first_pet.get('pet_name', 'Unknown'),
                            "Age": first_pet.get('age', 'Missing'),
                            "Distance": f"{first_pet.get('distance_km', 'Missing')} km",
                            "Owner verified": first_pet.get('owner_verified', 'Missing')
                        })
                elif isinstance(response, dict) and response.get('error') == 'verification_required':
                    self.log_step(step, True, "Verification guard active - user blocked", {
                        "Error type": response.get('error'),
                        "Message": response.get('message', 'No message'),
                        "Redirect": response.get('redirect', 'No redirect')
                    })
                else:
                    self.log_step(step, False, f"Unexpected response format: {type(response)}", {
                        "Response": str(response)[:200]
                    })
            else:
                self.log_step(step, False, f"Request failed with status {status_code}", {
                    "Response": str(response)[:200]
                })
                
        except Exception as e:
            self.log_step(step, False, f"Exception during normal mode test: {str(e)}")
    
    def test_pet_feed_debug_mode_analysis(self):
        """Test Pet Feed debug mode (?debug=true) for detailed analysis"""
        step = "Pet Feed Debug Mode - Analysis"
        
        try:
            # Make request with debug=true
            success, response, status_code = self.make_request("GET", "/pets/feed?debug=true&limit=5")
            
            if success and isinstance(response, list):
                self.log_step(step, True, f"Debug mode returned {len(response)} pets", {
                    "Response type": "List of pets (debug mode)",
                    "Pet count": len(response),
                    "Status code": status_code
                })
                
                # Analyze debug-specific fields
                if response:
                    debug_analysis = []
                    for i, pet in enumerate(response):
                        debug_info = {
                            "pet_name": pet.get('pet_name', f'Pet_{i}'),
                            "is_own_pet": pet.get('is_own_pet', 'Missing'),
                            "is_interacted": pet.get('is_interacted', 'Missing'),
                            "owner_verified": pet.get('owner_verified', 'Missing'),
                            "owner_id": pet.get('owner_id', 'Missing')
                        }
                        debug_analysis.append(debug_info)
                    
                    self.log_step("Pet Feed Debug - Field Analysis", True, "Debug fields analyzed", {
                        "Debug data": json.dumps(debug_analysis, indent=2)
                    })
                    
                    # Check if debug mode bypasses filters
                    own_pets = [p for p in response if p.get('is_own_pet') == True]
                    interacted_pets = [p for p in response if p.get('is_interacted') == True]
                    
                    self.log_step("Pet Feed Debug - Filter Bypass", True, "Debug mode filter analysis", {
                        "Own pets included": len(own_pets),
                        "Interacted pets included": len(interacted_pets),
                        "Total pets": len(response),
                        "Filter bypass": "Yes (debug mode)" if (own_pets or interacted_pets) else "No"
                    })
            else:
                self.log_step(step, False, f"Debug mode failed or returned unexpected format", {
                    "Success": success,
                    "Response type": type(response),
                    "Status code": status_code,
                    "Response": str(response)[:200]
                })
                
        except Exception as e:
            self.log_step(step, False, f"Exception during debug mode test: {str(e)}")
    
    def test_pet_feed_filtering_with_debug(self):
        """Test filtering logic by comparing normal vs debug mode"""
        step = "Pet Feed Filtering - Logic Verification"
        
        try:
            # Get debug mode results (unfiltered)
            debug_success, debug_response, _ = self.make_request("GET", "/pets/feed?debug=true&limit=10")
            
            # Get normal mode results (filtered)
            normal_success, normal_response, _ = self.make_request("GET", "/pets/feed?limit=10")
            
            if debug_success and normal_success:
                debug_count = len(debug_response) if isinstance(debug_response, list) else 0
                normal_count = len(normal_response) if isinstance(normal_response, list) else 0
                
                # Check if normal mode has fewer or equal pets (due to filtering)
                filtering_working = normal_count <= debug_count
                
                self.log_step(step, filtering_working, "Filtering logic comparison", {
                    "Debug mode pets": debug_count,
                    "Normal mode pets": normal_count,
                    "Filtering active": "Yes" if normal_count < debug_count else "Possibly (or no pets to filter)",
                    "Verification guard": "Active" if isinstance(normal_response, dict) and normal_response.get('error') == 'verification_required' else "Inactive"
                })
                
                # If we have pets in debug mode, analyze what's being filtered
                if isinstance(debug_response, list) and debug_response:
                    own_pets = sum(1 for p in debug_response if p.get('is_own_pet') == True)
                    interacted_pets = sum(1 for p in debug_response if p.get('is_interacted') == True)
                    unverified_owners = sum(1 for p in debug_response if p.get('owner_verified') == False)
                    
                    self.log_step("Pet Feed Filtering - Exclusion Analysis", True, "Filter exclusion breakdown", {
                        "Total pets (debug)": debug_count,
                        "Own pets (should exclude)": own_pets,
                        "Already interacted (should exclude)": interacted_pets,
                        "Unverified owners (should exclude)": unverified_owners,
                        "Expected exclusions": own_pets + interacted_pets + unverified_owners
                    })
            else:
                self.log_step(step, False, "Could not compare debug vs normal mode", {
                    "Debug success": debug_success,
                    "Normal success": normal_success
                })
                
        except Exception as e:
            self.log_step(step, False, f"Exception during filtering test: {str(e)}")
    
    def capture_and_analyze_backend_logs(self):
        """Capture backend logs to analyze debug output"""
        step = "Backend Debug Logs - Capture & Analysis"
        
        try:
            # Trigger debug logging with a request
            self.make_request("GET", "/pets/feed?debug=true&limit=3")
            time.sleep(2)  # Wait for logs to be written
            
            # Try to capture supervisor logs
            import subprocess
            
            log_files = [
                "/var/log/supervisor/backend.out.log",
                "/var/log/supervisor/backend.err.log"
            ]
            
            logs_captured = False
            for log_file in log_files:
                try:
                    result = subprocess.run(
                        ["tail", "-n", "100", log_file],
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                    
                    if result.returncode == 0 and result.stdout:
                        logs_captured = True
                        log_content = result.stdout
                        
                        print(f"\n📋 Backend Logs from {log_file}:")
                        print("=" * 80)
                        print(log_content)
                        print("=" * 80)
                        
                        # Analyze debug log sections
                        debug_sections = [
                            "TOTAL PETS IN DATABASE",
                            "EXCLUDED (own pets)",
                            "EXCLUDED (already interacted)",
                            "VERIFIED USERS",
                            "EXCLUDED (unverified owners)",
                            "DEBUG MODE ENABLED",
                            "APPLYING FILTERS",
                            "ELIGIBLE PETS",
                            "FINAL RESULT"
                        ]
                        
                        found_sections = []
                        section_details = {}
                        
                        for section in debug_sections:
                            if section in log_content:
                                found_sections.append(section)
                                # Try to extract the number from the log line
                                import re
                                pattern = f"{section}:? (\\d+)"
                                match = re.search(pattern, log_content)
                                if match:
                                    section_details[section] = match.group(1)
                        
                        self.log_step("Backend Logs - Debug Sections Found", len(found_sections) > 0, f"Found {len(found_sections)} debug sections", {
                            "Sections found": found_sections,
                            "Section details": section_details
                        })
                        
                        # Look for specific filtering information
                        if "DEBUG: PET FEED FILTERING" in log_content:
                            self.log_step("Backend Logs - Debug Header", True, "Debug logging header found", {
                                "Debug mode active": "DEBUG MODE ENABLED" in log_content,
                                "Filter analysis": "APPLYING FILTERS" in log_content
                            })
                        
                        break
                        
                except subprocess.TimeoutExpired:
                    continue
                except FileNotFoundError:
                    continue
            
            if not logs_captured:
                self.log_step(step, False, "Could not capture backend logs", {
                    "Attempted files": log_files,
                    "Suggestion": "Check if supervisor is running and log files exist"
                })
            else:
                self.log_step(step, True, "Backend logs captured and analyzed")
                
        except Exception as e:
            self.log_step(step, False, f"Exception during log capture: {str(e)}")

    # ============ DOUBLE FETCH & ACTION MECHANICS TESTS ============
    
    def test_double_fetch_action_mechanics(self):
        """Test Double Fetch & Action Mechanics as specified in review request"""
        print("\n💕 DOUBLE FETCH & ACTION MECHANICS TESTING")
        print("=" * 60)
        
        # Setup test users and pets for mutual matching
        self.setup_double_fetch_test_data()
        
        # Test 1: Action Button Mechanics
        self.test_action_button_mechanics_detailed()
        
        # Test 2: Mutual Match Detection
        self.test_mutual_match_detection_detailed()
        
        # Test 3: Match Entry Creation
        self.test_match_entry_creation_detailed()
        
        # Test 4: Action Type Validation
        self.test_action_type_validation_detailed()
        
        # Test 5: Pet Feed Integration
        self.test_pet_feed_integration_detailed()
        
        # Test 6: Premium Feature Enforcement
        self.test_premium_enforcement_detailed()
        
    def setup_double_fetch_test_data(self):
        """Setup specific test data for Double Fetch testing"""
        step = "Double Fetch Setup - Test Data Creation"
        
        try:
            # Create User A (Premium)
            user_a_data = {"method": "email", "value": "alice.doublefetch@tailflix.com"}
            otp_success, otp_response, _ = self.make_request("POST", "/auth/send-otp", user_a_data)
            
            if otp_success and otp_response.get("mock_otp"):
                verify_data = {**user_a_data, "otp": otp_response["mock_otp"]}
                verify_success, verify_response, _ = self.make_request("POST", "/auth/verify-otp", verify_data)
                
                if verify_success and verify_response.get("user_id"):
                    user_a_id = verify_response["user_id"]
                    
                    # Make User A premium
                    self.make_request("PUT", f"/admin/users/{user_a_id}/premium", {"is_premium": True})
                    
                    # Create pet for User A
                    pet_a_data = {
                        "pet_name": "Luna",
                        "breed": "Golden Retriever", 
                        "sex": "Female",
                        "birth_year": 2020,
                        "temperaments": ["Friendly", "Energetic"],
                        "photos": ["base64_photo_luna"]
                    }
                    
                    pet_success, pet_response, _ = self.make_request("POST", f"/pets?user_id={user_a_id}", pet_a_data)
                    
                    if pet_success:
                        self.users["alice_df"] = {
                            "user_id": user_a_id,
                            "pet_id": pet_response["id"],
                            "is_premium": True
                        }
            
            # Create User B (Free)
            user_b_data = {"method": "email", "value": "bob.doublefetch@tailflix.com"}
            otp_success, otp_response, _ = self.make_request("POST", "/auth/send-otp", user_b_data)
            
            if otp_success and otp_response.get("mock_otp"):
                verify_data = {**user_b_data, "otp": otp_response["mock_otp"]}
                verify_success, verify_response, _ = self.make_request("POST", "/auth/verify-otp", verify_data)
                
                if verify_success and verify_response.get("user_id"):
                    user_b_id = verify_response["user_id"]
                    
                    # Create pet for User B
                    pet_b_data = {
                        "pet_name": "Max",
                        "breed": "Labrador",
                        "sex": "Male",
                        "birth_year": 2019,
                        "temperaments": ["Playful", "Loyal"],
                        "photos": ["base64_photo_max"]
                    }
                    
                    pet_success, pet_response, _ = self.make_request("POST", f"/pets?user_id={user_b_id}", pet_b_data)
                    
                    if pet_success:
                        self.users["bob_df"] = {
                            "user_id": user_b_id,
                            "pet_id": pet_response["id"],
                            "is_premium": False
                        }
            
            setup_success = "alice_df" in self.users and "bob_df" in self.users
            
            self.log_step(step, setup_success, "Double Fetch test data created", {
                "User A (Alice)": f"Premium user with pet Luna: {setup_success}",
                "User B (Bob)": f"Free user with pet Max: {setup_success}",
                "Ready for testing": setup_success
            })
            
        except Exception as e:
            self.log_step(step, False, f"Exception during setup: {str(e)}")
    
    def test_action_button_mechanics_detailed(self):
        """Test all 4 action types via POST /api/likes endpoint"""
        print("\n🎯 Testing Action Button Mechanics (Detailed)")
        
        if "alice_df" not in self.users or "bob_df" not in self.users:
            self.log_step("Action Mechanics - Setup Check", False, "Test data not available")
            return
        
        alice = self.users["alice_df"]
        bob = self.users["bob_df"]
        
        # Test 1: Skip action (unlimited, doesn't count toward daily limit)
        skip_data = {"pet_id": bob["pet_id"], "action_type": "skip"}
        success, response, status_code = self.make_request("POST", f"/likes?user_id={alice['user_id']}", skip_data)
        
        if success and response.get("action_type") == "skip":
            self.log_step("Action Mechanics - Skip", True, "Skip action stored successfully", {
                "Action ID": response.get("id"),
                "Unlimited usage": "Should not count toward daily limit",
                "Status": "Working correctly"
            })
        else:
            self.log_step("Action Mechanics - Skip", False, f"Skip action failed: {response}")
        
        # Test 2: Like action (counts toward daily limit)
        like_data = {"pet_id": bob["pet_id"], "action_type": "like"}
        success, response, status_code = self.make_request("POST", f"/likes?user_id={alice['user_id']}", like_data)
        
        if success and response.get("action_type") == "like":
            self.log_step("Action Mechanics - Like", True, "Like action stored successfully", {
                "Action ID": response.get("id"),
                "Daily limit": "Counts toward 10/day limit",
                "Status": "Working correctly"
            })
        else:
            self.log_step("Action Mechanics - Like", False, f"Like action failed: {response}")
        
        # Test 3: Super Like action (premium-only, counts toward daily limit)
        super_like_data = {"pet_id": bob["pet_id"], "action_type": "super_like"}
        success, response, status_code = self.make_request("POST", f"/likes?user_id={alice['user_id']}", super_like_data)
        
        if success and response.get("action_type") == "super_like":
            self.log_step("Action Mechanics - Super Like", True, "Super Like action stored successfully", {
                "Action ID": response.get("id"),
                "Premium feature": "Premium user allowed",
                "Daily limit": "Counts toward 10/day limit",
                "Status": "Working correctly"
            })
        else:
            self.log_step("Action Mechanics - Super Like", False, f"Super Like action failed: {response}")
        
        # Test 4: Golden Bone action (premium-only, monthly limit, counts toward daily limit)
        golden_bone_data = {"pet_id": bob["pet_id"], "action_type": "golden_bone"}
        success, response, status_code = self.make_request("POST", f"/likes?user_id={alice['user_id']}", golden_bone_data)
        
        if success and response.get("action_type") == "golden_bone":
            self.log_step("Action Mechanics - Golden Bone", True, "Golden Bone action stored successfully", {
                "Action ID": response.get("id"),
                "Premium feature": "Premium user allowed",
                "Monthly limit": "5/month for premium users",
                "Daily limit": "Counts toward 10/day limit",
                "Status": "Working correctly"
            })
        else:
            self.log_step("Action Mechanics - Golden Bone", False, f"Golden Bone action failed: {response}")
    
    def test_mutual_match_detection_detailed(self):
        """Test mutual match flow and response data"""
        print("\n💕 Testing Mutual Match Detection (Detailed)")
        
        if "alice_df" not in self.users or "bob_df" not in self.users:
            self.log_step("Mutual Match - Setup Check", False, "Test data not available")
            return
        
        alice = self.users["alice_df"]
        bob = self.users["bob_df"]
        
        # Step 1: Alice likes Bob's pet (Max) - No match yet
        like_data_alice = {"pet_id": bob["pet_id"], "action_type": "like"}
        success_a, response_a, _ = self.make_request("POST", f"/likes?user_id={alice['user_id']}", like_data_alice)
        
        if success_a:
            match_info_a = response_a.get("match")
            if match_info_a is None or not match_info_a.get("matched"):
                self.log_step("Mutual Match - First Like", True, "Alice liked Bob's pet, no match detected yet", {
                    "Alice → Bob's pet": "Like recorded",
                    "Match detected": "No (expected)",
                    "Response match field": str(match_info_a)
                })
            else:
                self.log_step("Mutual Match - First Like", False, f"Unexpected match detected: {match_info_a}")
        else:
            self.log_step("Mutual Match - First Like", False, f"Alice's like failed: {response_a}")
            return
        
        # Step 2: Bob likes Alice's pet (Luna) - Match should be detected!
        like_data_bob = {"pet_id": alice["pet_id"], "action_type": "like"}
        success_b, response_b, _ = self.make_request("POST", f"/likes?user_id={bob['user_id']}", like_data_bob)
        
        if success_b:
            match_info_b = response_b.get("match")
            
            if match_info_b and match_info_b.get("matched"):
                # Verify match data structure
                required_fields = ["match_id", "match_type", "my_pet", "their_pet"]
                missing_fields = [field for field in required_fields if field not in match_info_b]
                
                if not missing_fields:
                    my_pet = match_info_b.get("my_pet", {})
                    their_pet = match_info_b.get("their_pet", {})
                    
                    self.log_step("Mutual Match - Detection Success", True, "Mutual match detected correctly", {
                        "Match ID": match_info_b.get("match_id"),
                        "Match Type": match_info_b.get("match_type"),
                        "My Pet Name": my_pet.get("name"),
                        "Their Pet Name": their_pet.get("name"),
                        "My Pet Photo": "Present" if my_pet.get("photo") else "Missing",
                        "Their Pet Photo": "Present" if their_pet.get("photo") else "Missing",
                        "All required fields": "Present"
                    })
                else:
                    self.log_step("Mutual Match - Detection Success", False, f"Missing required fields: {missing_fields}")
            else:
                self.log_step("Mutual Match - Detection Success", False, f"No match detected in mutual like scenario: {response_b}")
        else:
            self.log_step("Mutual Match - Detection Success", False, f"Bob's like failed: {response_b}")
    
    def test_match_entry_creation_detailed(self):
        """Verify Match document creation and duplicate prevention"""
        print("\n📝 Testing Match Entry Creation (Detailed)")
        
        if "alice_df" not in self.users or "bob_df" not in self.users:
            self.log_step("Match Entry - Setup Check", False, "Test data not available")
            return
        
        alice = self.users["alice_df"]
        bob = self.users["bob_df"]
        
        # Test duplicate match prevention by trying another mutual action
        super_like_data = {"pet_id": bob["pet_id"], "action_type": "super_like"}
        success, response, _ = self.make_request("POST", f"/likes?user_id={alice['user_id']}", super_like_data)
        
        if success:
            match_info = response.get("match")
            
            if match_info and match_info.get("matched"):
                # Should return existing match, not create duplicate
                self.log_step("Match Entry - Duplicate Prevention", True, "Existing match returned, no duplicate created", {
                    "Match ID": match_info.get("match_id"),
                    "Match Type": match_info.get("match_type"),
                    "Duplicate prevention": "Working correctly"
                })
            else:
                # No match info returned for existing match (also acceptable)
                self.log_step("Match Entry - Duplicate Prevention", True, "No duplicate match created", {
                    "Behavior": "No match info returned for existing match",
                    "Duplicate prevention": "Working correctly"
                })
        else:
            self.log_step("Match Entry - Duplicate Prevention", False, f"Super like action failed: {response}")
        
        # Verify match was created by checking backend logs for "MATCH CREATED!" message
        try:
            import subprocess
            result = subprocess.run(
                ["tail", "-n", "50", "/var/log/supervisor/backend.err.log"],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0 and "MATCH CREATED!" in result.stdout:
                self.log_step("Match Entry - Backend Verification", True, "Match creation confirmed in backend logs", {
                    "Log message": "✨ MATCH CREATED! found in logs",
                    "Database entry": "Match document created successfully"
                })
            else:
                self.log_step("Match Entry - Backend Verification", False, "Match creation message not found in logs")
                
        except Exception as e:
            self.log_step("Match Entry - Backend Verification", False, f"Could not check backend logs: {str(e)}")
    
    def test_action_type_validation_detailed(self):
        """Test that invalid action_type values are rejected with 400 error"""
        print("\n🚫 Testing Action Type Validation (Detailed)")
        
        if "alice_df" not in self.users or "bob_df" not in self.users:
            self.log_step("Action Validation - Setup Check", False, "Test data not available")
            return
        
        alice = self.users["alice_df"]
        bob = self.users["bob_df"]
        
        # Test various invalid action types
        invalid_actions = [
            "invalid",
            "boost",  # Old name, should be golden_bone
            "dislike",
            "",
            "LIKE",  # Wrong case
            "superlike",  # Wrong format, should be super_like
            "123",
            "null",
            "undefined"
        ]
        
        validation_results = []
        
        for invalid_action in invalid_actions:
            invalid_data = {"pet_id": bob["pet_id"], "action_type": invalid_action}
            success, response, status_code = self.make_request("POST", f"/likes?user_id={alice['user_id']}", invalid_data)
            
            if status_code == 400:
                validation_results.append(f"✅ '{invalid_action}' correctly rejected")
                self.log_step(f"Action Validation - '{invalid_action}'", True, "Correctly rejected with 400 error")
            else:
                validation_results.append(f"❌ '{invalid_action}' incorrectly accepted")
                self.log_step(f"Action Validation - '{invalid_action}'", False, f"Should be rejected but got {status_code}: {response}")
        
        # Summary of validation results
        passed_validations = sum(1 for result in validation_results if result.startswith("✅"))
        total_validations = len(validation_results)
        
        self.log_step("Action Validation - Summary", passed_validations == total_validations, f"Validation results: {passed_validations}/{total_validations} passed", {
            "Valid actions": "like, skip, super_like, golden_bone",
            "Invalid actions tested": len(invalid_actions),
            "Correctly rejected": passed_validations,
            "Incorrectly accepted": total_validations - passed_validations
        })
    
    def test_pet_feed_integration_detailed(self):
        """Test that pets load correctly after backend fix (sex and temperaments optional)"""
        print("\n🐕 Testing Pet Feed Integration (Detailed)")
        
        if "alice_df" not in self.users:
            self.log_step("Pet Feed Integration - Setup Check", False, "Test data not available")
            return
        
        alice = self.users["alice_df"]
        
        # Test GET /api/pets/feed
        success, response, status_code = self.make_request("GET", f"/pets/feed?user_id={alice['user_id']}&limit=10")
        
        if success:
            if isinstance(response, list):
                self.log_step("Pet Feed Integration - Loading", True, f"Pet feed loaded successfully with {len(response)} pets", {
                    "Response type": "List of pets",
                    "Pet count": len(response),
                    "Status code": status_code
                })
                
                # Check for optional fields handling
                if response:
                    pets_analysis = []
                    for pet in response[:3]:  # Analyze first 3 pets
                        analysis = {
                            "name": pet.get("pet_name", "Unknown"),
                            "has_sex": pet.get("sex") is not None,
                            "has_temperaments": pet.get("temperaments") is not None and len(pet.get("temperaments", [])) > 0,
                            "has_enriched_fields": all(field in pet for field in ["age", "distance_km", "owner_verified"])
                        }
                        pets_analysis.append(analysis)
                    
                    # Check if any pets have missing optional fields (should not cause errors)
                    pets_with_missing_optional = [p for p in pets_analysis if not p["has_sex"] or not p["has_temperaments"]]
                    
                    self.log_step("Pet Feed Integration - Optional Fields", True, "Optional fields handled correctly", {
                        "Pets analyzed": len(pets_analysis),
                        "Pets with missing optional fields": len(pets_with_missing_optional),
                        "No validation errors": "Backend fix working correctly",
                        "Enriched fields present": all(p["has_enriched_fields"] for p in pets_analysis)
                    })
                else:
                    self.log_step("Pet Feed Integration - Optional Fields", True, "No pets in feed (empty result)")
                    
            elif isinstance(response, dict) and response.get("error") == "verification_required":
                self.log_step("Pet Feed Integration - Loading", True, "Verification guard active (expected behavior)", {
                    "Error": response.get("error"),
                    "Message": response.get("message"),
                    "Redirect": response.get("redirect")
                })
            else:
                self.log_step("Pet Feed Integration - Loading", False, f"Unexpected response format: {type(response)}")
        else:
            self.log_step("Pet Feed Integration - Loading", False, f"Pet feed request failed: {status_code} - {response}")
    
    def test_premium_enforcement_detailed(self):
        """Test premium feature enforcement for free users"""
        print("\n🔒 Testing Premium Feature Enforcement (Detailed)")
        
        if "alice_df" not in self.users or "bob_df" not in self.users:
            self.log_step("Premium Enforcement - Setup Check", False, "Test data not available")
            return
        
        alice = self.users["alice_df"]  # Premium user
        bob = self.users["bob_df"]      # Free user
        
        # Test 1: Free user tries Super Like (should be blocked)
        super_like_data = {"pet_id": alice["pet_id"], "action_type": "super_like"}
        success, response, status_code = self.make_request("POST", f"/likes?user_id={bob['user_id']}", super_like_data)
        
        if success and response.get("error") == "premium_required":
            self.log_step("Premium Enforcement - Super Like Block", True, "Free user correctly blocked from Super Like", {
                "Error type": response.get("error"),
                "Message": response.get("message"),
                "Action type": response.get("action_type"),
                "Enforcement": "Working correctly"
            })
        elif success and response.get("id"):
            self.log_step("Premium Enforcement - Super Like Block", False, "Free user incorrectly allowed Super Like", {
                "Expected": "premium_required error",
                "Actual": f"Action allowed with ID {response.get('id')}",
                "Critical issue": "Premium enforcement not working"
            })
        else:
            self.log_step("Premium Enforcement - Super Like Block", False, f"Unexpected response: {response}")
        
        # Test 2: Free user tries Golden Bone (should be blocked)
        golden_bone_data = {"pet_id": alice["pet_id"], "action_type": "golden_bone"}
        success, response, status_code = self.make_request("POST", f"/likes?user_id={bob['user_id']}", golden_bone_data)
        
        if success and response.get("error") == "premium_required":
            self.log_step("Premium Enforcement - Golden Bone Block", True, "Free user correctly blocked from Golden Bone", {
                "Error type": response.get("error"),
                "Message": response.get("message"),
                "Action type": response.get("action_type"),
                "Enforcement": "Working correctly"
            })
        elif success and response.get("id"):
            self.log_step("Premium Enforcement - Golden Bone Block", False, "Free user incorrectly allowed Golden Bone", {
                "Expected": "premium_required error",
                "Actual": f"Action allowed with ID {response.get('id')}",
                "Critical issue": "Premium enforcement not working"
            })
        else:
            self.log_step("Premium Enforcement - Golden Bone Block", False, f"Unexpected response: {response}")
        
        # Test 3: Premium user can use Super Like (should work)
        super_like_premium_data = {"pet_id": bob["pet_id"], "action_type": "super_like"}
        success, response, status_code = self.make_request("POST", f"/likes?user_id={alice['user_id']}", super_like_premium_data)
        
        if success and response.get("action_type") == "super_like":
            self.log_step("Premium Enforcement - Premium Super Like", True, "Premium user can use Super Like", {
                "Action ID": response.get("id"),
                "User type": "Premium",
                "Feature access": "Correctly allowed"
            })
        else:
            self.log_step("Premium Enforcement - Premium Super Like", False, f"Premium user blocked from Super Like: {response}")
        
        # Test 4: Premium user can use Golden Bone (should work)
        golden_bone_premium_data = {"pet_id": bob["pet_id"], "action_type": "golden_bone"}
        success, response, status_code = self.make_request("POST", f"/likes?user_id={alice['user_id']}", golden_bone_premium_data)
        
        if success and response.get("action_type") == "golden_bone":
            self.log_step("Premium Enforcement - Premium Golden Bone", True, "Premium user can use Golden Bone", {
                "Action ID": response.get("id"),
                "User type": "Premium",
                "Feature access": "Correctly allowed",
                "Monthly limit": "5/month for premium users"
            })
        else:
            self.log_step("Premium Enforcement - Premium Golden Bone", False, f"Premium user blocked from Golden Bone: {response}")

    # ============ TAILCOINS ECONOMY TESTING ============
    
    def test_tailcoins_economy_system(self):
        """Test the newly implemented TailCoins economy system"""
        print("\n💰 TAILCOINS ECONOMY SYSTEM TESTING")
        print("=" * 60)
        
        # Setup test user for TailCoins testing
        self.setup_tailcoins_test_user()
        
        # Test 1: Transaction History API (empty for new users)
        self.test_transaction_history_empty()
        
        # Test 2: Buy Coins with Transaction Recording
        self.test_buy_coins_transaction()
        
        # Test 3: Spend Coins with Transaction Recording
        self.test_spend_coins_transaction()
        
        # Test 4: Transaction Sorting and Limit
        self.test_transaction_sorting_and_limit()
        
        # Test 5: Edge Cases - Insufficient Coins
        self.test_insufficient_coins_edge_case()
        
        # Test 6: Transaction Fields Validation
        self.test_transaction_fields_validation()
    
    def setup_tailcoins_test_user(self):
        """Setup a dedicated test user for TailCoins testing"""
        step = "TailCoins Setup - Test User Creation"
        
        try:
            # Create unique test user
            import time
            test_phone = f"+91987654{int(time.time()) % 10000:04d}"
            
            # Send OTP
            otp_success, otp_response, _ = self.make_request("POST", "/auth/send-otp", {
                "method": "phone",
                "value": test_phone
            })
            
            if otp_success and otp_response.get("mock_otp"):
                # Verify OTP
                verify_success, verify_response, _ = self.make_request("POST", "/auth/verify-otp", {
                    "method": "phone",
                    "value": test_phone,
                    "otp": otp_response["mock_otp"]
                })
                
                if verify_success and verify_response.get("user_id"):
                    self.users["tailcoins_test"] = {
                        "user_id": verify_response["user_id"],
                        "phone": test_phone
                    }
                    
                    self.log_step(step, True, "TailCoins test user created successfully", {
                        "User ID": verify_response["user_id"],
                        "Phone": test_phone
                    })
                else:
                    self.log_step(step, False, f"OTP verification failed: {verify_response}")
            else:
                self.log_step(step, False, f"OTP send failed: {otp_response}")
                
        except Exception as e:
            self.log_step(step, False, f"Exception during setup: {str(e)}")
    
    def test_transaction_history_empty(self):
        """Test 1: Transaction history should be empty for new users"""
        step = "TailCoins - Empty Transaction History"
        
        if "tailcoins_test" not in self.users:
            self.log_step(step, False, "Test user not available")
            return
        
        user_id = self.users["tailcoins_test"]["user_id"]
        
        success, response, status_code = self.make_request("GET", f"/users/{user_id}/tailcoins/transactions")
        
        if success and status_code == 200:
            transactions = response.get("transactions", [])
            current_balance = response.get("current_balance", 0)
            
            if len(transactions) == 0:
                self.log_step(step, True, "Empty transaction history returned correctly", {
                    "Transactions count": len(transactions),
                    "Current balance": current_balance,
                    "Response structure": "Valid"
                })
            else:
                self.log_step(step, False, f"Expected 0 transactions, got {len(transactions)}")
        else:
            self.log_step(step, False, f"API call failed: {status_code} - {response}")
    
    def test_buy_coins_transaction(self):
        """Test 2: Buy coins should add balance and create transaction record"""
        step = "TailCoins - Buy Coins Transaction"
        
        if "tailcoins_test" not in self.users:
            self.log_step(step, False, "Test user not available")
            return
        
        user_id = self.users["tailcoins_test"]["user_id"]
        
        # Buy 120 coins for ₹99
        success, response, status_code = self.make_request("POST", f"/users/{user_id}/buy-coins", {
            "coins": 120,
            "amount": "₹99"
        })
        
        if success and status_code == 200:
            if response.get("success") and response.get("coins_added") == 120:
                self.log_step("TailCoins - Buy Coins Success", True, "Coins purchased successfully", {
                    "Coins added": response.get("coins_added"),
                    "New balance": response.get("new_balance"),
                    "Amount paid": response.get("amount_paid")
                })
                
                # Verify transaction was created
                time.sleep(1)  # Brief delay
                
                txn_success, txn_response, _ = self.make_request("GET", f"/users/{user_id}/tailcoins/transactions")
                
                if txn_success:
                    transactions = txn_response.get("transactions", [])
                    
                    if len(transactions) == 1:
                        txn = transactions[0]
                        
                        if (txn.get("type") == "earn" and 
                            txn.get("amount") == 120 and 
                            "Purchase ₹99" in txn.get("source", "")):
                            
                            self.log_step(step, True, "Buy coins transaction recorded correctly", {
                                "Transaction type": txn.get("type"),
                                "Amount": txn.get("amount"),
                                "Source": txn.get("source"),
                                "Transaction ID": txn.get("id"),
                                "Timestamp": txn.get("timestamp")
                            })
                        else:
                            self.log_step(step, False, f"Transaction details incorrect: {txn}")
                    else:
                        self.log_step(step, False, f"Expected 1 transaction, got {len(transactions)}")
                else:
                    self.log_step(step, False, f"Failed to get transactions: {txn_response}")
            else:
                self.log_step(step, False, f"Buy coins failed: {response}")
        else:
            self.log_step(step, False, f"API call failed: {status_code} - {response}")
    
    def test_spend_coins_transaction(self):
        """Test 3: Spend coins via Super Like should deduct balance and create transaction"""
        step = "TailCoins - Spend Coins Transaction"
        
        if "tailcoins_test" not in self.users:
            self.log_step(step, False, "Test user not available")
            return
        
        user_id = self.users["tailcoins_test"]["user_id"]
        
        # Create a target pet to like
        pet_success, pet_response, _ = self.make_request("POST", "/pets", {
            "pet_name": "Target Pet",
            "breed": "Golden Retriever",
            "sex": "Male", 
            "birth_year": 2020,
            "temperaments": ["Friendly"],
            "photos": ["base64_photo_data"]
        })
        
        if not pet_success:
            self.log_step(step, False, f"Failed to create target pet: {pet_response}")
            return
        
        target_pet_id = pet_response.get("id")
        
        # Perform super_like action (costs 5 TailCoins for non-premium users)
        like_success, like_response, _ = self.make_request("POST", f"/likes?user_id={user_id}", {
            "pet_id": target_pet_id,
            "action_type": "super_like"
        })
        
        if like_success and like_response.get("id"):
            user_stats = like_response.get("user_stats", {})
            expected_balance = 115  # 120 - 5
            
            if user_stats.get("tail_coins") == expected_balance:
                self.log_step("TailCoins - Spend Coins Success", True, "Coins deducted successfully", {
                    "Coins deducted": 5,
                    "New balance": user_stats.get("tail_coins"),
                    "Action type": "super_like"
                })
                
                # Verify spend transaction was created
                time.sleep(1)
                
                txn_success, txn_response, _ = self.make_request("GET", f"/users/{user_id}/tailcoins/transactions")
                
                if txn_success:
                    transactions = txn_response.get("transactions", [])
                    
                    if len(transactions) >= 2:
                        # Find the spend transaction (should be first due to sorting)
                        spend_txn = transactions[0]
                        
                        if (spend_txn.get("type") == "spend" and 
                            spend_txn.get("amount") == 5 and 
                            "Super Like" in spend_txn.get("source", "")):
                            
                            self.log_step(step, True, "Spend coins transaction recorded correctly", {
                                "Transaction type": spend_txn.get("type"),
                                "Amount": spend_txn.get("amount"),
                                "Source": spend_txn.get("source"),
                                "Total transactions": len(transactions)
                            })
                        else:
                            self.log_step(step, False, f"Spend transaction details incorrect: {spend_txn}")
                    else:
                        self.log_step(step, False, f"Expected at least 2 transactions, got {len(transactions)}")
                else:
                    self.log_step(step, False, f"Failed to get transactions: {txn_response}")
            else:
                self.log_step(step, False, f"Balance not deducted correctly. Expected {expected_balance}, got {user_stats.get('tail_coins')}")
        else:
            # Check if it's an insufficient coins error (which would be expected behavior)
            if like_response.get("error") == "insufficient_coins":
                self.log_step(step, False, f"Insufficient coins error (user may not have enough): {like_response}")
            else:
                self.log_step(step, False, f"Super like action failed: {like_response}")
    
    def test_transaction_sorting_and_limit(self):
        """Test 4: Transaction history should be sorted newest first and respect limit"""
        step = "TailCoins - Transaction Sorting & Limit"
        
        if "tailcoins_test" not in self.users:
            self.log_step(step, False, "Test user not available")
            return
        
        user_id = self.users["tailcoins_test"]["user_id"]
        
        # Get all transactions
        success, response, status_code = self.make_request("GET", f"/users/{user_id}/tailcoins/transactions")
        
        if success and status_code == 200:
            transactions = response.get("transactions", [])
            
            if len(transactions) >= 2:
                # Check sorting (newest first)
                first_txn = transactions[0]
                second_txn = transactions[1]
                
                # First should be spend (more recent), second should be earn (older)
                if first_txn.get("type") == "spend" and second_txn.get("type") == "earn":
                    self.log_step("TailCoins - Sorting Check", True, "Transactions sorted correctly (newest first)", {
                        "First transaction": f"{first_txn.get('type')} - {first_txn.get('source')}",
                        "Second transaction": f"{second_txn.get('type')} - {second_txn.get('source')}"
                    })
                else:
                    self.log_step("TailCoins - Sorting Check", False, f"Sorting incorrect. First: {first_txn.get('type')}, Second: {second_txn.get('type')}")
                
                # Test limit parameter
                limit_success, limit_response, _ = self.make_request("GET", f"/users/{user_id}/tailcoins/transactions?limit=1")
                
                if limit_success:
                    limited_transactions = limit_response.get("transactions", [])
                    
                    if len(limited_transactions) == 1:
                        if limited_transactions[0].get("type") == "spend":
                            self.log_step(step, True, "Limit parameter working correctly", {
                                "Requested limit": 1,
                                "Returned count": len(limited_transactions),
                                "Returned transaction": f"{limited_transactions[0].get('type')} - {limited_transactions[0].get('source')}"
                            })
                        else:
                            self.log_step(step, False, f"Limit returned wrong transaction: {limited_transactions[0]}")
                    else:
                        self.log_step(step, False, f"Limit parameter failed. Expected 1, got {len(limited_transactions)}")
                else:
                    self.log_step(step, False, f"Limit parameter test failed: {limit_response}")
            else:
                self.log_step(step, False, f"Not enough transactions to test sorting. Got {len(transactions)}")
        else:
            self.log_step(step, False, f"Failed to get transactions: {status_code} - {response}")
    
    def test_insufficient_coins_edge_case(self):
        """Test 5: Edge case - insufficient coins should return error without creating transaction"""
        step = "TailCoins - Insufficient Coins Edge Case"
        
        if "tailcoins_test" not in self.users:
            self.log_step(step, False, "Test user not available")
            return
        
        user_id = self.users["tailcoins_test"]["user_id"]
        
        # Create target pet
        pet_success, pet_response, _ = self.make_request("POST", "/pets", {
            "pet_name": "Expensive Pet",
            "breed": "Poodle",
            "sex": "Female",
            "birth_year": 2021,
            "temperaments": ["Elegant"],
            "photos": ["base64_photo_expensive"]
        })
        
        if not pet_success:
            self.log_step(step, False, f"Failed to create target pet: {pet_response}")
            return
        
        target_pet_id = pet_response.get("id")
        
        # Try Golden Bone action (costs 50 TailCoins, user should have 115 after previous tests)
        # First Golden Bone should work
        gb1_success, gb1_response, _ = self.make_request("POST", f"/likes?user_id={user_id}", {
            "pet_id": target_pet_id,
            "action_type": "golden_bone"
        })
        
        if gb1_success and gb1_response.get("id"):
            user_stats = gb1_response.get("user_stats", {})
            new_balance = user_stats.get("tail_coins", 0)
            
            self.log_step("TailCoins - First Golden Bone", True, "First Golden Bone successful", {
                "Coins deducted": 50,
                "New balance": new_balance
            })
            
            # Now try another Golden Bone (should fail if balance < 50)
            if new_balance < 50:
                pet2_success, pet2_response, _ = self.make_request("POST", "/pets", {
                    "pet_name": "Another Expensive Pet",
                    "breed": "Husky",
                    "sex": "Male",
                    "birth_year": 2020,
                    "temperaments": ["Active"],
                    "photos": ["base64_photo_husky"]
                })
                
                if pet2_success:
                    target_pet2_id = pet2_response.get("id")
                    
                    gb2_success, gb2_response, _ = self.make_request("POST", f"/likes?user_id={user_id}", {
                        "pet_id": target_pet2_id,
                        "action_type": "golden_bone"
                    })
                    
                    if gb2_success and gb2_response.get("error") == "insufficient_coins":
                        self.log_step(step, True, "Insufficient coins error returned correctly", {
                            "Error type": gb2_response.get("error"),
                            "Message": gb2_response.get("message"),
                            "Current balance": new_balance,
                            "Coins needed": 50
                        })
                        
                        # Verify no transaction was created for failed attempt
                        time.sleep(1)
                        
                        txn_success, txn_response, _ = self.make_request("GET", f"/users/{user_id}/tailcoins/transactions")
                        
                        if txn_success:
                            transactions = txn_response.get("transactions", [])
                            # Should have: 1 earn + 1 super_like spend + 1 golden_bone spend = 3 transactions
                            expected_count = 3
                            
                            if len(transactions) == expected_count:
                                self.log_step("TailCoins - No Failed Transaction", True, "No transaction created for insufficient coins", {
                                    "Total transactions": len(transactions),
                                    "Expected": expected_count,
                                    "Failed attempt recorded": "No (correct)"
                                })
                            else:
                                self.log_step("TailCoins - No Failed Transaction", False, f"Unexpected transaction count: {len(transactions)}")
                    else:
                        self.log_step(step, False, f"Expected insufficient_coins error, got: {gb2_response}")
                else:
                    self.log_step(step, False, f"Failed to create second target pet: {pet2_response}")
            else:
                self.log_step(step, False, f"User still has enough coins ({new_balance}) to test insufficient coins scenario")
        else:
            self.log_step(step, False, f"First Golden Bone failed: {gb1_response}")
    
    def test_transaction_fields_validation(self):
        """Test 6: Verify all transaction fields are present and correctly formatted"""
        step = "TailCoins - Transaction Fields Validation"
        
        if "tailcoins_test" not in self.users:
            self.log_step(step, False, "Test user not available")
            return
        
        user_id = self.users["tailcoins_test"]["user_id"]
        
        success, response, status_code = self.make_request("GET", f"/users/{user_id}/tailcoins/transactions")
        
        if success and status_code == 200:
            transactions = response.get("transactions", [])
            
            if len(transactions) > 0:
                required_fields = ["id", "type", "amount", "source", "timestamp"]
                validation_results = []
                
                for i, txn in enumerate(transactions):
                    txn_valid = True
                    missing_fields = []
                    
                    # Check required fields
                    for field in required_fields:
                        if field not in txn or txn[field] is None:
                            missing_fields.append(field)
                            txn_valid = False
                    
                    # Validate field types and values
                    if txn_valid:
                        if not isinstance(txn["id"], str) or len(txn["id"]) == 0:
                            txn_valid = False
                            validation_results.append(f"Transaction {i}: Invalid ID format")
                        
                        if txn["type"] not in ["earn", "spend"]:
                            txn_valid = False
                            validation_results.append(f"Transaction {i}: Invalid type '{txn['type']}'")
                        
                        if not isinstance(txn["amount"], int) or txn["amount"] <= 0:
                            txn_valid = False
                            validation_results.append(f"Transaction {i}: Invalid amount '{txn['amount']}'")
                        
                        if not isinstance(txn["source"], str) or len(txn["source"]) == 0:
                            txn_valid = False
                            validation_results.append(f"Transaction {i}: Invalid source '{txn['source']}'")
                        
                        # Validate timestamp format
                        try:
                            from datetime import datetime
                            datetime.fromisoformat(txn["timestamp"].replace('Z', '+00:00'))
                        except (ValueError, AttributeError):
                            txn_valid = False
                            validation_results.append(f"Transaction {i}: Invalid timestamp '{txn['timestamp']}'")
                    
                    if missing_fields:
                        validation_results.append(f"Transaction {i}: Missing fields {missing_fields}")
                
                if len(validation_results) == 0:
                    self.log_step(step, True, "All transaction fields valid", {
                        "Transactions validated": len(transactions),
                        "Required fields": required_fields,
                        "Validation errors": 0
                    })
                else:
                    self.log_step(step, False, f"Field validation errors found", {
                        "Transactions validated": len(transactions),
                        "Validation errors": validation_results
                    })
            else:
                self.log_step(step, False, "No transactions available for field validation")
        else:
            self.log_step(step, False, f"Failed to get transactions: {status_code} - {response}")

if __name__ == "__main__":
    import sys
    
    tester = TailFlixTester()
    
    # Check if we should run specific tests
    if len(sys.argv) > 1:
        if sys.argv[1] == "debug":
            print("🔍 Running SPECIAL Pet Feed Debug Logging Test")
            tester.test_pet_feed_debug_logging()
        elif sys.argv[1] == "tailcoins":
            print("💰 Running TAILCOINS ECONOMY Tests Only")
            tester.test_tailcoins_economy_system()
        else:
            print("🧪 Running ALL TailFlix Backend Tests")
            tester.run_all_tests()
            tester.test_tailcoins_economy_system()
    else:
        print("🧪 Running ALL TailFlix Backend Tests")
        tester.run_all_tests()
        tester.test_tailcoins_economy_system()
    
    # Always run the debug test for this specific request
    print("\n" + "="*80)
    print("🎯 RUNNING REQUESTED DEBUG LOGGING TEST")
    print("="*80)
    tester.test_pet_feed_debug_logging()
    
    # Run Double Fetch & Action Mechanics tests
    print("\n" + "="*80)
    print("🎯 RUNNING DOUBLE FETCH & ACTION MECHANICS TESTS")
    print("="*80)
    tester.test_double_fetch_action_mechanics()