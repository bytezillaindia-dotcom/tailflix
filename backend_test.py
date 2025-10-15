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
