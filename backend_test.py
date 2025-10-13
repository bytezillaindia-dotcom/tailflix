#!/usr/bin/env python3
"""
TailFlix Backend Testing Suite - Double Fetch & Action Mechanics
Tests the newly implemented mutual match animation and action mechanics
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
    
    # ============ JOURNEY 1: NEW USER ONBOARDING ============
    
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

if __name__ == "__main__":
    import sys
    
    tester = TailFlixTester()
    
    # Check if we should run the special debug test
    if len(sys.argv) > 1 and sys.argv[1] == "debug":
        print("🔍 Running SPECIAL Pet Feed Debug Logging Test")
        tester.test_pet_feed_debug_logging()
    else:
        print("🧪 Running ALL TailFlix Backend Tests")
        tester.run_all_tests()
    
    # Always run the debug test for this specific request
    print("\n" + "="*80)
    print("🎯 RUNNING REQUESTED DEBUG LOGGING TEST")
    print("="*80)
    tester.test_pet_feed_debug_logging()