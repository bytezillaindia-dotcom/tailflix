#!/usr/bin/env python3
"""
TailFlix Backend Testing Suite - Journey-Based Testing
Tests complete user journeys as specified in the review request
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
        self.journey_results = []
        self.users = {}
        self.pets = {}
        self.verifications = {}
        
    def log_step(self, step: str, success: bool, message: str, details: dict = None):
        """Log journey step result"""
        status = "✅" if success else "❌" if not success else "⚠️"
        result = {
            "step": step,
            "success": success,
            "message": message,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        self.journey_results.append(result)
        print(f"{status} {step}: {message}")
        if details:
            for key, value in details.items():
                print(f"   {key}: {value}")
        print()
        
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
    
    def test_onboarding_flow(self):
        """Test complete onboarding flow: OTP → Profile → Pet → Verification"""
        print("\n🚀 TESTING ONBOARDING FLOW")
        print("-" * 40)
        
        # Test 1: Phone OTP Send
        phone_data = {"method": "phone", "value": "+1234567890"}
        result, error = self.make_request('POST', '/auth/send-otp', phone_data)
        if error:
            self.log_result('broken', f"Phone OTP Send failed: {error}")
        elif result.get('success') and result.get('mock_otp') == '123456':
            self.log_result('working', "Phone OTP Send working correctly")
        else:
            self.log_result('broken', f"Phone OTP Send unexpected response: {result}")
        
        # Test 2: Email OTP Send
        email_data = {"method": "email", "value": "sarah.johnson@example.com"}
        result, error = self.make_request('POST', '/auth/send-otp', email_data)
        if error:
            self.log_result('broken', f"Email OTP Send failed: {error}")
        elif result.get('success') and result.get('mock_otp') == '123456':
            self.log_result('working', "Email OTP Send working correctly")
        else:
            self.log_result('broken', f"Email OTP Send unexpected response: {result}")
        
        # Test 3: Phone OTP Verify
        verify_data = {"method": "phone", "value": "+1234567890", "otp": "123456"}
        result, error = self.make_request('POST', '/auth/verify-otp', verify_data)
        if error:
            self.log_result('broken', f"Phone OTP Verify failed: {error}")
        elif result.get('success') and result.get('user_id'):
            self.test_users['phone_user'] = result.get('user_id')
            self.log_result('working', "Phone OTP Verify working correctly")
        else:
            self.log_result('broken', f"Phone OTP Verify unexpected response: {result}")
        
        # Test 4: Email OTP Verify
        verify_data = {"method": "email", "value": "sarah.johnson@example.com", "otp": "123456"}
        result, error = self.make_request('POST', '/auth/verify-otp', verify_data)
        if error:
            self.log_result('broken', f"Email OTP Verify failed: {error}")
        elif result.get('success') and result.get('user_id'):
            self.test_users['email_user'] = result.get('user_id')
            self.log_result('working', "Email OTP Verify working correctly")
        else:
            self.log_result('broken', f"Email OTP Verify unexpected response: {result}")
        
        # Test 5: Check users table creation
        result, error = self.make_request('GET', '/users')
        if error:
            self.log_result('broken', f"Users table check failed: {error}")
        elif isinstance(result, list) and len(result) >= 2:
            # Check if users have correct fields
            user = result[-1]  # Get latest user
            required_fields = ['id', 'method', 'value', 'created_at', 'is_verified_human', 'is_premium']
            missing_fields = [field for field in required_fields if field not in user]
            if missing_fields:
                self.log_result('broken', f"Users table missing fields: {missing_fields}")
            else:
                self.log_result('working', "Users table created with correct fields")
        else:
            self.log_result('broken', f"Users table check unexpected response: {result}")
        
        # Test 6: CreateProfile flow (check if endpoint exists)
        result, error = self.make_request('GET', '/profiles', expected_status=404)
        if error and "404" in error:
            self.log_result('missing', "CreateProfile endpoint not implemented (/api/profiles)")
        else:
            self.log_result('notes', "CreateProfile endpoint may exist but not documented")
        
        # Test 7: AddPet flow
        pet_data = {
            "pet_name": "Bella",
            "breed": "Golden Retriever",
            "sex": "Female",
            "birth_year": 2020,
            "temperaments": ["Friendly", "Energetic", "Loyal"],
            "photos": ["base64_photo_1", "base64_photo_2", "base64_photo_3"]
        }
        result, error = self.make_request('POST', '/pets', pet_data)
        if error:
            self.log_result('broken', f"AddPet flow failed: {error}")
        elif result.get('id') and result.get('user_id'):
            self.test_pets['bella'] = result.get('id')
            self.log_result('working', "AddPet flow working - pet created with user_id")
        else:
            self.log_result('broken', f"AddPet flow unexpected response: {result}")
        
        # Test 8: Verify screen - create verification
        verification_data = {
            "selfie_url": "https://example.com/selfie.jpg",
            "pet_pose_url": "https://example.com/pet_pose.jpg",
            "doc_url": "https://example.com/document.jpg"
        }
        result, error = self.make_request('POST', '/verifications', verification_data)
        if error:
            self.log_result('broken', f"Verify screen flow failed: {error}")
        elif result.get('id') and result.get('status') == 'pending':
            self.test_verifications['pending'] = result.get('id')
            self.log_result('working', "Verify screen working - verification created with status=pending")
        else:
            self.log_result('broken', f"Verify screen unexpected response: {result}")
    
    def test_verification_guard(self):
        """Test if unverified users are blocked from accessing PetFeed and Chat"""
        print("\n🛡️ TESTING VERIFICATION GUARD")
        print("-" * 40)
        
        # Test 1: Unverified user accessing PetFeed
        result, error = self.make_request('GET', '/pets/feed')
        if error:
            self.log_result('broken', f"PetFeed access test failed: {error}")
        elif isinstance(result, list):
            # If it returns pets without checking verification, guard is missing
            self.log_result('missing', "Verification guard missing - unverified users can access PetFeed")
        else:
            self.log_result('working', "Verification guard working for PetFeed")
        
        # Test 2: Check if Chat endpoints exist
        result, error = self.make_request('GET', '/chat', expected_status=404)
        if error and "404" in error:
            self.log_result('missing', "Chat endpoints not implemented")
        else:
            self.log_result('notes', "Chat endpoints may exist - need to test verification guard")
    
    def test_admin_flow(self):
        """Test admin verification and premium management"""
        print("\n👑 TESTING ADMIN FLOW")
        print("-" * 40)
        
        # Test 1: GET pending verifications
        result, error = self.make_request('GET', '/admin/verifications/pending')
        if error:
            self.log_result('broken', f"Admin pending verifications failed: {error}")
        elif isinstance(result, list):
            self.log_result('working', f"Admin pending verifications working - found {len(result)} pending")
        else:
            self.log_result('broken', f"Admin pending verifications unexpected response: {result}")
        
        # Test 2: Approve verification
        if self.test_verifications.get('pending') and self.test_users.get('email_user'):
            approval_data = {"user_id": self.test_users['email_user']}
            result, error = self.make_request('POST', f'/admin/verifications/{self.test_verifications["pending"]}/approve', approval_data)
            if error:
                self.log_result('broken', f"Admin approve verification failed: {error}")
            elif result.get('success'):
                self.log_result('working', "Admin approve verification working")
                
                # Check if user.is_verified_human was updated
                users_result, users_error = self.make_request('GET', '/users')
                if not users_error and isinstance(users_result, list):
                    user = next((u for u in users_result if u['id'] == self.test_users['email_user']), None)
                    if user and user.get('is_verified_human'):
                        self.log_result('working', "User is_verified_human updated correctly")
                    else:
                        self.log_result('broken', "User is_verified_human not updated after approval")
            else:
                self.log_result('broken', f"Admin approve verification unexpected response: {result}")
        
        # Test 3: Reject verification (create new one first)
        verification_data = {
            "selfie_url": "https://example.com/reject_selfie.jpg",
            "pet_pose_url": "https://example.com/reject_pet.jpg"
        }
        result, error = self.make_request('POST', '/verifications', verification_data)
        if not error and result.get('id'):
            reject_id = result.get('id')
            result, error = self.make_request('POST', f'/admin/verifications/{reject_id}/reject')
            if error:
                self.log_result('broken', f"Admin reject verification failed: {error}")
            elif result.get('success'):
                self.log_result('working', "Admin reject verification working")
            else:
                self.log_result('broken', f"Admin reject verification unexpected response: {result}")
        
        # Test 4: Toggle premium status
        if self.test_users.get('phone_user'):
            premium_data = {"is_premium": True}
            result, error = self.make_request('PUT', f'/admin/users/{self.test_users["phone_user"]}/premium', premium_data)
            if error:
                self.log_result('broken', f"Admin toggle premium failed: {error}")
            elif result.get('success'):
                self.log_result('working', "Admin toggle premium working")
                
                # Verify premium status was updated
                users_result, users_error = self.make_request('GET', '/users')
                if not users_error and isinstance(users_result, list):
                    user = next((u for u in users_result if u['id'] == self.test_users['phone_user']), None)
                    if user and user.get('is_premium'):
                        self.log_result('working', "Premium status updated correctly")
                    else:
                        self.log_result('broken', "Premium status not updated")
            else:
                self.log_result('broken', f"Admin toggle premium unexpected response: {result}")
    
    def test_petfeed_flow(self):
        """Test PetFeed functionality including likes, limits, and matches"""
        print("\n🐕 TESTING PETFEED FLOW")
        print("-" * 40)
        
        # Create additional test pets for comprehensive testing
        self.create_test_pets()
        
        # Test 1: GET /api/pets/feed
        result, error = self.make_request('GET', '/pets/feed')
        if error:
            self.log_result('broken', f"PetFeed GET failed: {error}")
        elif isinstance(result, list):
            if len(result) > 0:
                pet = result[0]
                required_fields = ['id', 'pet_name', 'age', 'distance_km', 'owner_verified']
                missing_fields = [field for field in required_fields if field not in pet]
                if missing_fields:
                    self.log_result('broken', f"PetFeed missing enriched fields: {missing_fields}")
                else:
                    self.log_result('working', "PetFeed returns enriched pet data correctly")
                    self.test_pets['feed_pet'] = pet['id']
            else:
                self.log_result('notes', "PetFeed empty - may be due to no verified users or all pets already interacted")
        else:
            self.log_result('broken', f"PetFeed unexpected response: {result}")
        
        # Test 2: POST /api/likes with action_type='like'
        if self.test_pets.get('feed_pet'):
            like_data = {"pet_id": self.test_pets['feed_pet'], "action_type": "like"}
            result, error = self.make_request('POST', '/likes', like_data)
            if error:
                self.log_result('broken', f"Like action failed: {error}")
            elif result.get('action_type') == 'like':
                self.log_result('working', "Like action working correctly")
            else:
                self.log_result('broken', f"Like action unexpected response: {result}")
        
        # Test 3: POST /api/likes with action_type='skip'
        if self.test_pets.get('feed_pet'):
            skip_data = {"pet_id": self.test_pets['feed_pet'], "action_type": "skip"}
            result, error = self.make_request('POST', '/likes', skip_data)
            if error:
                self.log_result('broken', f"Skip action failed: {error}")
            elif result.get('action_type') == 'skip':
                self.log_result('working', "Skip action working correctly")
            else:
                self.log_result('broken', f"Skip action unexpected response: {result}")
        
        # Test 4: GET /api/likes/daily-count
        result, error = self.make_request('GET', '/likes/daily-count')
        if error:
            self.log_result('broken', f"Daily count check failed: {error}")
        elif 'daily_likes_count' in result and 'limit' in result:
            self.log_result('working', f"Daily count working - {result['daily_likes_count']}/{result['limit']}")
            
            # Test 5: Check if skip doesn't count toward limit
            initial_count = result['daily_likes_count']
            
            # Perform multiple skips
            for i in range(3):
                skip_data = {"pet_id": self.test_pets.get('feed_pet', 'dummy_pet'), "action_type": "skip"}
                self.make_request('POST', '/likes', skip_data)
            
            # Check count again
            result2, error2 = self.make_request('GET', '/likes/daily-count')
            if not error2 and result2['daily_likes_count'] == initial_count:
                self.log_result('working', "Skip actions don't count toward daily limit")
            else:
                self.log_result('broken', "Skip actions incorrectly count toward daily limit")
        else:
            self.log_result('broken', f"Daily count unexpected response: {result}")
        
        # Test 6: Test super_like premium requirement
        super_like_data = {"pet_id": self.test_pets.get('feed_pet', 'dummy_pet'), "action_type": "super_like"}
        result, error = self.make_request('GET', '/likes/daily-count')
        if not error and not result.get('is_premium'):
            # User is not premium, super_like should be blocked
            result, error = self.make_request('POST', '/likes', super_like_data)
            if error:
                self.log_result('missing', "Super_like premium check not implemented - should redirect to paywall")
            else:
                self.log_result('broken', "Free user can use super_like - should be premium only")
        
        # Test 7: Test golden_bone premium requirement and monthly limit
        golden_bone_data = {"pet_id": self.test_pets.get('feed_pet', 'dummy_pet'), "action_type": "golden_bone"}
        result, error = self.make_request('POST', '/likes', golden_bone_data)
        if error:
            self.log_result('missing', "Golden_bone premium check not implemented")
        else:
            self.log_result('notes', "Golden_bone action processed - need to verify premium checks")
        
        # Test 8: Test daily limit enforcement (try to hit 10 limit)
        self.test_daily_limits()
        
        # Test 9: Test mutual match detection
        self.test_mutual_matches()
    
    def create_test_pets(self):
        """Create additional test pets for comprehensive testing"""
        pets_data = [
            {
                "pet_name": "Max",
                "breed": "German Shepherd",
                "sex": "Male",
                "birth_year": 2019,
                "temperaments": ["Protective", "Intelligent"],
                "photos": ["base64_photo_max"]
            },
            {
                "pet_name": "Luna",
                "breed": "Border Collie",
                "sex": "Female", 
                "birth_year": 2021,
                "temperaments": ["Smart", "Active"],
                "photos": ["base64_photo_luna"]
            }
        ]
        
        for pet_data in pets_data:
            result, error = self.make_request('POST', '/pets', pet_data)
            if not error and result.get('id'):
                self.test_pets[pet_data['pet_name'].lower()] = result.get('id')
    
    def test_daily_limits(self):
        """Test daily limit enforcement"""
        print("\n📊 Testing Daily Limits")
        
        # Get current count
        result, error = self.make_request('GET', '/likes/daily-count')
        if error:
            return
        
        current_count = result.get('daily_likes_count', 0)
        limit = result.get('limit', 10)
        remaining = limit - current_count
        
        # Try to perform actions up to limit
        test_pet_id = self.test_pets.get('feed_pet', 'dummy_pet')
        actions_performed = 0
        
        for i in range(remaining + 2):  # Try to exceed limit
            like_data = {"pet_id": f"{test_pet_id}_{i}", "action_type": "like"}
            result, error = self.make_request('POST', '/likes', like_data)
            if not error:
                actions_performed += 1
            else:
                break
        
        # Check final count
        result, error = self.make_request('GET', '/likes/daily-count')
        if not error:
            final_count = result.get('daily_likes_count', 0)
            if final_count >= limit:
                self.log_result('working', f"Daily limit enforced at {final_count}/{limit}")
            else:
                self.log_result('notes', f"Daily limit testing: {final_count}/{limit} actions performed")
    
    def test_mutual_matches(self):
        """Test mutual match detection"""
        print("\n💕 Testing Mutual Matches")
        
        # This would require creating two users and having them like each other's pets
        # For now, just check if matches table/endpoint exists
        result, error = self.make_request('GET', '/matches', expected_status=404)
        if error and "404" in error:
            self.log_result('missing', "Matches endpoint not implemented (/api/matches)")
        else:
            self.log_result('notes', "Matches functionality may exist but needs comprehensive testing")
    
    def test_paywall(self):
        """Test paywall functionality"""
        print("\n💰 TESTING PAYWALL")
        print("-" * 40)
        
        # Check if paywall endpoints exist
        result, error = self.make_request('GET', '/paywall', expected_status=404)
        if error and "404" in error:
            self.log_result('missing', "Paywall endpoints not implemented")
        else:
            self.log_result('notes', "Paywall endpoints may exist")
        
        # Check if premium plans endpoint exists
        result, error = self.make_request('GET', '/premium/plans', expected_status=404)
        if error and "404" in error:
            self.log_result('missing', "Premium plans endpoint not implemented")
        else:
            self.log_result('notes', "Premium plans endpoint may exist")
    
    def test_premium_features(self):
        """Test premium user features and limits"""
        print("\n⭐ TESTING PREMIUM FEATURES")
        print("-" * 40)
        
        # Get current user status
        result, error = self.make_request('GET', '/likes/daily-count')
        if error:
            self.log_result('broken', f"Cannot check premium status: {error}")
            return
        
        is_premium = result.get('is_premium', False)
        golden_bones_limit = result.get('golden_bones_limit', 0)
        golden_bones_remaining = result.get('golden_bones_remaining', 0)
        
        if is_premium:
            self.log_result('working', f"Premium user detected - Golden Bones: {golden_bones_remaining}/{golden_bones_limit}")
            
            # Test golden_bone usage
            if golden_bones_remaining > 0:
                golden_bone_data = {"pet_id": self.test_pets.get('feed_pet', 'dummy_pet'), "action_type": "golden_bone"}
                result, error = self.make_request('POST', '/likes', golden_bone_data)
                if error:
                    self.log_result('broken', f"Premium golden_bone usage failed: {error}")
                else:
                    self.log_result('working', "Premium golden_bone usage working")
        else:
            self.log_result('notes', f"Free user detected - Golden Bones limit: {golden_bones_limit}")
            
            # Test that free user can't use golden_bone
            golden_bone_data = {"pet_id": self.test_pets.get('feed_pet', 'dummy_pet'), "action_type": "golden_bone"}
            result, error = self.make_request('POST', '/likes', golden_bone_data)
            if not error:
                self.log_result('broken', "Free user can use golden_bone - should be premium only")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🧪 TailFlix Backend Comprehensive Test Suite")
        print("=" * 80)
        
        try:
            self.test_onboarding_flow()
            self.test_verification_guard()
            self.test_admin_flow()
            self.test_petfeed_flow()
            self.test_paywall()
            self.test_premium_features()
            
        except Exception as e:
            self.log_result('broken', f"Test suite crashed: {str(e)}")
        
        self.print_summary()
    
    def print_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("📋 TAILFLIX BACKEND TEST SUMMARY")
        print("=" * 80)
        
        # Print broken items first (most important)
        if self.test_results['broken']:
            print("\n❌ BROKEN FLOWS:")
            for item in self.test_results['broken']:
                print(f"   • {item}")
        
        if self.test_results['missing']:
            print("\n⚠️ MISSING FEATURES:")
            for item in self.test_results['missing']:
                print(f"   • {item}")
        
        if self.test_results['working']:
            print("\n✅ WORKING FLOWS:")
            for item in self.test_results['working']:
                print(f"   • {item}")
        
        if self.test_results['notes']:
            print("\n📝 NOTES:")
            for item in self.test_results['notes']:
                print(f"   • {item}")
        
        # Summary counts
        working_count = len(self.test_results['working'])
        broken_count = len(self.test_results['broken'])
        missing_count = len(self.test_results['missing'])
        total_tests = working_count + broken_count + missing_count
        
        print(f"\n📊 SUMMARY: {working_count} Working | {broken_count} Broken | {missing_count} Missing | {total_tests} Total")
        print("=" * 80)

if __name__ == "__main__":
    tester = TailFlixTester()
    tester.run_all_tests()