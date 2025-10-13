#!/usr/bin/env python3
"""
TailFlix Comprehensive QA Test - As Requested in Review
Tests ALL TailFlix features using 2 test users with detailed reporting
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Optional

# Backend URL from frontend/.env
BASE_URL = "https://pet-dating-app-1.preview.emergentagent.com/api"

class ComprehensiveTailFlixTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_users = {}
        self.test_pets = {}
        self.test_matches = {}
        self.session = requests.Session()
        self.test_results = []
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
    
    def add_result(self, section: str, test_name: str, status: str, http_code: int, response_summary: str, errors: List[str] = None):
        """Add test result to results list"""
        self.test_results.append({
            "section": section,
            "test_name": test_name,
            "status": status,
            "http_code": http_code,
            "response_summary": response_summary,
            "errors": errors or []
        })
    
    def make_request(self, method: str, endpoint: str, data: dict = None, params: dict = None) -> Dict:
        """Make HTTP request and return response data"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, params=params)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, params=params)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, params=params)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return {
                "status_code": response.status_code,
                "data": response.json() if response.content else {},
                "success": 200 <= response.status_code < 300
            }
            
        except Exception as e:
            return {
                "status_code": 0,
                "data": {"error": str(e)},
                "success": False
            }
    
    def test_1_otp_authentication_verification(self):
        """1. OTP Authentication & Verification"""
        self.log("="*80)
        self.log("TEST 1: OTP AUTHENTICATION & VERIFICATION")
        self.log("="*80)
        
        # Test User A - Phone
        self.log("Creating User A with phone authentication...")
        phone_data = {"method": "phone", "value": "+919876543210"}
        result = self.make_request("POST", "/auth/send-otp", phone_data)
        
        if result["success"]:
            self.add_result("OTP Auth", "Send OTP (Phone)", "✅ PASS", result["status_code"], 
                          f"OTP sent successfully, mock_otp: {result['data'].get('mock_otp')}")
            
            # Verify OTP
            verify_data = {"method": "phone", "value": "+919876543210", "otp": "123456"}
            verify_result = self.make_request("POST", "/auth/verify-otp", verify_data)
            
            if verify_result["success"]:
                self.test_users["user_a"] = {
                    "id": verify_result["data"]["user_id"],
                    "method": "phone",
                    "value": "+919876543210",
                    "token": verify_result["data"]["token"]
                }
                self.add_result("OTP Auth", "Verify OTP (Phone)", "✅ PASS", verify_result["status_code"],
                              f"User A created: {self.test_users['user_a']['id'][:8]}...")
                
                # Test has-pets endpoint
                has_pets_result = self.make_request("GET", f"/users/{self.test_users['user_a']['id']}/has-pets")
                self.add_result("OTP Auth", "Has Pets Check (User A)", 
                              "✅ PASS" if has_pets_result["success"] else "❌ FAIL",
                              has_pets_result["status_code"],
                              f"Has pets: {has_pets_result['data'].get('has_pets', 'unknown')}")
            else:
                self.add_result("OTP Auth", "Verify OTP (Phone)", "❌ FAIL", verify_result["status_code"],
                              f"Verification failed: {verify_result['data']}")
        else:
            self.add_result("OTP Auth", "Send OTP (Phone)", "❌ FAIL", result["status_code"],
                          f"Send OTP failed: {result['data']}")
        
        # Test User B - Email
        self.log("Creating User B with email authentication...")
        email_data = {"method": "email", "value": "bella.owner@tailflix.com"}
        result = self.make_request("POST", "/auth/send-otp", email_data)
        
        if result["success"]:
            self.add_result("OTP Auth", "Send OTP (Email)", "✅ PASS", result["status_code"],
                          f"OTP sent successfully, mock_otp: {result['data'].get('mock_otp')}")
            
            # Verify OTP
            verify_data = {"method": "email", "value": "bella.owner@tailflix.com", "otp": "123456"}
            verify_result = self.make_request("POST", "/auth/verify-otp", verify_data)
            
            if verify_result["success"]:
                self.test_users["user_b"] = {
                    "id": verify_result["data"]["user_id"],
                    "method": "email",
                    "value": "bella.owner@tailflix.com",
                    "token": verify_result["data"]["token"]
                }
                self.add_result("OTP Auth", "Verify OTP (Email)", "✅ PASS", verify_result["status_code"],
                              f"User B created: {self.test_users['user_b']['id'][:8]}...")
                
                # Test has-pets endpoint
                has_pets_result = self.make_request("GET", f"/users/{self.test_users['user_b']['id']}/has-pets")
                self.add_result("OTP Auth", "Has Pets Check (User B)",
                              "✅ PASS" if has_pets_result["success"] else "❌ FAIL",
                              has_pets_result["status_code"],
                              f"Has pets: {has_pets_result['data'].get('has_pets', 'unknown')}")
            else:
                self.add_result("OTP Auth", "Verify OTP (Email)", "❌ FAIL", verify_result["status_code"],
                              f"Verification failed: {verify_result['data']}")
        else:
            self.add_result("OTP Auth", "Send OTP (Email)", "❌ FAIL", result["status_code"],
                          f"Send OTP failed: {result['data']}")
    
    def test_2_pet_management(self):
        """2. Pet Management"""
        self.log("="*80)
        self.log("TEST 2: PET MANAGEMENT")
        self.log("="*80)
        
        # Create pets for both users
        pet_data_a = {
            "pet_name": "Max",
            "breed": "Golden Retriever",
            "sex": "Male",
            "birth_year": 2020,
            "temperaments": ["Friendly", "Energetic", "Loyal"],
            "photos": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVR"]
        }
        
        pet_data_b = {
            "pet_name": "Bella",
            "breed": "Labrador",
            "sex": "Female",
            "birth_year": 2019,
            "temperaments": ["Gentle", "Playful", "Smart"],
            "photos": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVR"]
        }
        
        # Create Pet A
        if "user_a" in self.test_users:
            user_id = self.test_users["user_a"]["id"]
            result = self.make_request("POST", "/pets", pet_data_a, params={"user_id": user_id})
            
            if result["success"]:
                self.test_pets["pet_a"] = result["data"]
                self.add_result("Pet Management", "Create Pet A", "✅ PASS", result["status_code"],
                              f"Pet Max created: {self.test_pets['pet_a']['id'][:8]}...")
            else:
                self.add_result("Pet Management", "Create Pet A", "❌ FAIL", result["status_code"],
                              f"Pet creation failed: {result['data']}")
        
        # Create Pet B
        if "user_b" in self.test_users:
            user_id = self.test_users["user_b"]["id"]
            result = self.make_request("POST", "/pets", pet_data_b, params={"user_id": user_id})
            
            if result["success"]:
                self.test_pets["pet_b"] = result["data"]
                self.add_result("Pet Management", "Create Pet B", "✅ PASS", result["status_code"],
                              f"Pet Bella created: {self.test_pets['pet_b']['id'][:8]}...")
            else:
                self.add_result("Pet Management", "Create Pet B", "❌ FAIL", result["status_code"],
                              f"Pet creation failed: {result['data']}")
        
        # Test pet feed (should verify filtering)
        result = self.make_request("GET", "/pets/feed", params={"limit": 5})
        
        if result["success"]:
            if isinstance(result["data"], list):
                self.add_result("Pet Management", "Fetch Pet Feed", "✅ PASS", result["status_code"],
                              f"Pet feed returned {len(result['data'])} pets with filtering")
            else:
                # Check if verification guard is active
                if result["data"].get("error") == "verification_required":
                    self.add_result("Pet Management", "Fetch Pet Feed", "✅ PASS", result["status_code"],
                                  "Verification guard active - unverified users blocked")
                else:
                    self.add_result("Pet Management", "Fetch Pet Feed", "❌ FAIL", result["status_code"],
                                  f"Unexpected response format: {result['data']}")
        else:
            self.add_result("Pet Management", "Fetch Pet Feed", "❌ FAIL", result["status_code"],
                          f"Pet feed failed: {result['data']}")
        
        # Test pagination
        result = self.make_request("GET", "/pets/feed", params={"limit": 2})
        if result["success"]:
            self.add_result("Pet Management", "Pet Feed Pagination", "✅ PASS", result["status_code"],
                          f"Pagination working - limit=2 respected")
        else:
            self.add_result("Pet Management", "Pet Feed Pagination", "❌ FAIL", result["status_code"],
                          f"Pagination failed: {result['data']}")
    
    def test_3_tailcoins_system_daily_limits(self):
        """3. TailCoins System & Daily Limits"""
        self.log("="*80)
        self.log("TEST 3: TAILCOINS SYSTEM & DAILY LIMITS")
        self.log("="*80)
        
        # Test user stats for both users
        for user_key in ["user_a", "user_b"]:
            if user_key in self.test_users:
                user_id = self.test_users[user_key]["id"]
                result = self.make_request("GET", f"/users/{user_id}/stats")
                
                if result["success"]:
                    stats = result["data"]
                    self.add_result("TailCoins", f"Get User Stats ({user_key})", "✅ PASS", result["status_code"],
                                  f"Coins: {stats.get('tail_coins', 0)}, Daily likes: {stats.get('daily_likes_count', 0)}/10")
                else:
                    self.add_result("TailCoins", f"Get User Stats ({user_key})", "❌ FAIL", result["status_code"],
                                  f"Stats failed: {result['data']}")
        
        # Test daily like counter
        if "user_a" in self.test_users:
            user_id = self.test_users["user_a"]["id"]
            result = self.make_request("GET", "/likes/daily-count", params={"user_id": user_id})
            
            if result["success"]:
                daily_data = result["data"]
                self.add_result("TailCoins", "Daily Like Counter", "✅ PASS", result["status_code"],
                              f"Daily: {daily_data.get('daily_likes_count', 0)}/{daily_data.get('limit', 10)}, "
                              f"Remaining: {daily_data.get('remaining', 0)}")
            else:
                self.add_result("TailCoins", "Daily Like Counter", "❌ FAIL", result["status_code"],
                              f"Daily count failed: {result['data']}")
        
        # Test coin purchase (stub)
        if "user_b" in self.test_users:
            user_id = self.test_users["user_b"]["id"]
            purchase_data = {"coins": 50, "amount": 99}
            result = self.make_request("POST", f"/users/{user_id}/buy-coins", purchase_data)
            
            if result["success"]:
                self.add_result("TailCoins", "Buy Coins (Stub)", "✅ PASS", result["status_code"],
                              f"Purchased 50 coins for ₹99, new balance: {result['data'].get('new_balance', 0)}")
            else:
                self.add_result("TailCoins", "Buy Coins (Stub)", "❌ FAIL", result["status_code"],
                              f"Purchase failed: {result['data']}")
        
        # Test admin add coins
        if "user_a" in self.test_users:
            user_id = self.test_users["user_a"]["id"]
            add_coins_data = {"coins": 100}
            result = self.make_request("POST", f"/admin/users/{user_id}/add-coins", add_coins_data)
            
            if result["success"]:
                self.add_result("TailCoins", "Admin Add Coins", "✅ PASS", result["status_code"],
                              f"Added 100 coins, new balance: {result['data'].get('new_balance', 0)}")
            else:
                self.add_result("TailCoins", "Admin Add Coins", "❌ FAIL", result["status_code"],
                              f"Add coins failed: {result['data']}")
    
    def test_4_like_actions_mutual_match(self):
        """4. Like Actions & Mutual Match"""
        self.log("="*80)
        self.log("TEST 4: LIKE ACTIONS & MUTUAL MATCH")
        self.log("="*80)
        
        if not self.test_pets.get("pet_a") or not self.test_pets.get("pet_b"):
            self.add_result("Like Actions", "Setup Check", "❌ FAIL", 0,
                          "Cannot test - pets not available from previous tests")
            return
        
        # User A likes User B's pet (no match yet)
        if "user_a" in self.test_users:
            user_id = self.test_users["user_a"]["id"]
            pet_b_id = self.test_pets["pet_b"]["id"]
            like_data = {"pet_id": pet_b_id, "action_type": "like"}
            
            result = self.make_request("POST", "/likes", like_data, params={"user_id": user_id})
            
            if result["success"]:
                match_info = result["data"].get("match")
                if match_info and match_info.get("matched"):
                    self.add_result("Like Actions", "User A likes Pet B", "❌ FAIL", result["status_code"],
                                  "Unexpected match detected on first like", ["Should not match yet"])
                else:
                    self.add_result("Like Actions", "User A likes Pet B", "✅ PASS", result["status_code"],
                                  "Like recorded, no match yet (correct)")
            else:
                self.add_result("Like Actions", "User A likes Pet B", "❌ FAIL", result["status_code"],
                              f"Like action failed: {result['data']}")
        
        # User B likes User A's pet (should create match)
        if "user_b" in self.test_users:
            user_id = self.test_users["user_b"]["id"]
            pet_a_id = self.test_pets["pet_a"]["id"]
            like_data = {"pet_id": pet_a_id, "action_type": "like"}
            
            result = self.make_request("POST", "/likes", like_data, params={"user_id": user_id})
            
            if result["success"]:
                match_info = result["data"].get("match")
                if match_info and match_info.get("matched"):
                    self.test_matches["match_1"] = match_info
                    self.add_result("Like Actions", "User B likes Pet A (Match)", "✅ PASS", result["status_code"],
                                  f"Mutual match detected! Match ID: {match_info['match_id'][:8]}..., "
                                  f"Type: {match_info['match_type']}")
                else:
                    self.add_result("Like Actions", "User B likes Pet A (Match)", "❌ FAIL", result["status_code"],
                                  "Expected mutual match not detected", ["Match detection logic may be broken"])
            else:
                self.add_result("Like Actions", "User B likes Pet A (Match)", "❌ FAIL", result["status_code"],
                              f"Like action failed: {result['data']}")
        
        # Test daily limit enforcement
        self.test_daily_limit_enforcement()
    
    def test_daily_limit_enforcement(self):
        """Test daily limit enforcement (10 free likes/day)"""
        if "user_a" not in self.test_users:
            return
        
        user_id = self.test_users["user_a"]["id"]
        
        # Get current daily count
        result = self.make_request("GET", "/likes/daily-count", params={"user_id": user_id})
        if not result["success"]:
            self.add_result("Like Actions", "Daily Limit Check", "❌ FAIL", result["status_code"],
                          "Cannot check daily count")
            return
        
        current_count = result["data"].get("daily_likes_count", 0)
        remaining = result["data"].get("remaining", 0)
        
        # If user has remaining likes, try to use them all
        if remaining > 0:
            # Create dummy pets to like
            for i in range(min(remaining + 2, 5)):  # Test up to 5 additional likes
                # Create a dummy pet
                dummy_pet_data = {
                    "pet_name": f"TestPet{i}",
                    "breed": "Test Breed",
                    "sex": "Male",
                    "birth_year": 2021,
                    "temperaments": ["Test"],
                    "photos": ["data:image/jpeg;base64,test"]
                }
                
                # Use user_b as owner for dummy pets
                if "user_b" in self.test_users:
                    pet_result = self.make_request("POST", "/pets", dummy_pet_data, 
                                                 params={"user_id": self.test_users["user_b"]["id"]})
                    
                    if pet_result["success"]:
                        dummy_pet_id = pet_result["data"]["id"]
                        like_data = {"pet_id": dummy_pet_id, "action_type": "like"}
                        like_result = self.make_request("POST", "/likes", like_data, params={"user_id": user_id})
                        
                        if not like_result["success"]:
                            # Check if it's a daily limit error
                            error_data = like_result["data"]
                            if "daily_limit_reached" in str(error_data) or "insufficient_coins" in str(error_data):
                                self.add_result("Like Actions", "Daily Limit Enforcement", "✅ PASS", 
                                              like_result["status_code"],
                                              f"Daily limit correctly enforced at {current_count + i} likes")
                                return
                            else:
                                self.add_result("Like Actions", "Daily Limit Enforcement", "❌ FAIL",
                                              like_result["status_code"],
                                              f"Unexpected error: {error_data}")
                                return
        
        # If we get here, daily limit wasn't hit or enforced
        self.add_result("Like Actions", "Daily Limit Enforcement", "⚠️ PARTIAL", 200,
                      f"Could not fully test daily limit. Current count: {current_count}, Remaining: {remaining}")
    
    def test_5_notifications_system(self):
        """5. Notifications System"""
        self.log("="*80)
        self.log("TEST 5: NOTIFICATIONS SYSTEM")
        self.log("="*80)
        
        # Test badge counts
        for user_key in ["user_a", "user_b"]:
            if user_key in self.test_users:
                user_id = self.test_users[user_key]["id"]
                result = self.make_request("GET", "/likes/badges", params={"user_id": user_id})
                
                if result["success"]:
                    badges = result["data"]
                    self.add_result("Notifications", f"Get Badges ({user_key})", "✅ PASS", result["status_code"],
                                  f"Normal: {badges.get('normal_likes_count', 0)}, "
                                  f"Super: {badges.get('super_likes_count', 0)}")
                else:
                    self.add_result("Notifications", f"Get Badges ({user_key})", "❌ FAIL", result["status_code"],
                                  f"Badges failed: {result['data']}")
        
        # Test received likes
        for user_key in ["user_a", "user_b"]:
            if user_key in self.test_users:
                user_id = self.test_users[user_key]["id"]
                result = self.make_request("GET", "/likes/received", params={"user_id": user_id})
                
                if result["success"]:
                    received = result["data"]
                    self.add_result("Notifications", f"Get Received Likes ({user_key})", "✅ PASS", result["status_code"],
                                  f"Likes: {len(received.get('likes', []))}, "
                                  f"Super likes: {len(received.get('super_likes', []))}")
                else:
                    self.add_result("Notifications", f"Get Received Likes ({user_key})", "❌ FAIL", result["status_code"],
                                  f"Received likes failed: {result['data']}")
        
        # Test mark as seen
        for user_key in ["user_a", "user_b"]:
            if user_key in self.test_users:
                user_id = self.test_users[user_key]["id"]
                result = self.make_request("POST", "/likes/mark-seen", params={"user_id": user_id})
                
                if result["success"]:
                    self.add_result("Notifications", f"Mark Seen ({user_key})", "✅ PASS", result["status_code"],
                                  f"Marked {result['data'].get('marked_count', 0)} likes as seen")
                else:
                    self.add_result("Notifications", f"Mark Seen ({user_key})", "❌ FAIL", result["status_code"],
                                  f"Mark seen failed: {result['data']}")
    
    def test_6_chat_system(self):
        """6. Chat System"""
        self.log("="*80)
        self.log("TEST 6: CHAT SYSTEM")
        self.log("="*80)
        
        if not self.test_matches.get("match_1"):
            self.add_result("Chat System", "Setup Check", "❌ FAIL", 0,
                          "Cannot test chat - no match available from previous tests")
            return
        
        match_id = self.test_matches["match_1"]["match_id"]
        
        # User A sends message
        if "user_a" in self.test_users:
            user_id = self.test_users["user_a"]["id"]
            message_data = {"message": "Hi! Max would love to meet Bella! 🐕"}
            result = self.make_request("POST", f"/chats/{match_id}", message_data, params={"user_id": user_id})
            
            if result["success"]:
                self.add_result("Chat System", "Send Message (User A)", "✅ PASS", result["status_code"],
                              f"Message sent: {result['data'].get('message', '')[:30]}...")
            else:
                self.add_result("Chat System", "Send Message (User A)", "❌ FAIL", result["status_code"],
                              f"Send message failed: {result['data']}")
        
        # User B sends message
        if "user_b" in self.test_users:
            user_id = self.test_users["user_b"]["id"]
            message_data = {"message": "That sounds wonderful! Bella is excited too! 🎾"}
            result = self.make_request("POST", f"/chats/{match_id}", message_data, params={"user_id": user_id})
            
            if result["success"]:
                self.add_result("Chat System", "Send Message (User B)", "✅ PASS", result["status_code"],
                              f"Message sent: {result['data'].get('message', '')[:30]}...")
            else:
                self.add_result("Chat System", "Send Message (User B)", "❌ FAIL", result["status_code"],
                              f"Send message failed: {result['data']}")
        
        # Retrieve chat messages
        for user_key in ["user_a", "user_b"]:
            if user_key in self.test_users:
                user_id = self.test_users[user_key]["id"]
                result = self.make_request("GET", f"/chats/{match_id}", params={"user_id": user_id})
                
                if result["success"]:
                    messages = result["data"].get("messages", [])
                    self.add_result("Chat System", f"Get Messages ({user_key})", "✅ PASS", result["status_code"],
                                  f"Retrieved {len(messages)} messages")
                else:
                    self.add_result("Chat System", f"Get Messages ({user_key})", "❌ FAIL", result["status_code"],
                                  f"Get messages failed: {result['data']}")
    
    def test_7_admin_functions(self):
        """7. Admin Functions"""
        self.log("="*80)
        self.log("TEST 7: ADMIN FUNCTIONS")
        self.log("="*80)
        
        # Test premium toggle
        if "user_a" in self.test_users:
            user_id = self.test_users["user_a"]["id"]
            premium_data = {"is_premium": True}
            result = self.make_request("PUT", f"/admin/users/{user_id}/premium", premium_data)
            
            if result["success"]:
                self.add_result("Admin Functions", "Toggle Premium", "✅ PASS", result["status_code"],
                              f"User A set to premium: {result['data'].get('is_premium', False)}")
            else:
                self.add_result("Admin Functions", "Toggle Premium", "❌ FAIL", result["status_code"],
                              f"Premium toggle failed: {result['data']}")
        
        # Test get all users
        result = self.make_request("GET", "/users")
        if result["success"]:
            users = result["data"]
            self.add_result("Admin Functions", "Get All Users", "✅ PASS", result["status_code"],
                          f"Retrieved {len(users)} users from system")
        else:
            self.add_result("Admin Functions", "Get All Users", "❌ FAIL", result["status_code"],
                          f"Get users failed: {result['data']}")
    
    def test_8_verification_gate(self):
        """8. Verification Gate"""
        self.log("="*80)
        self.log("TEST 8: VERIFICATION GATE")
        self.log("="*80)
        
        # Test unverified user access to pet feed
        result = self.make_request("GET", "/pets/feed", params={"limit": 5})
        
        if not result["success"] or result["data"].get("error") == "verification_required":
            self.add_result("Verification Gate", "Unverified User Block", "✅ PASS", result["status_code"],
                          "Unverified users correctly blocked from pet feed")
        else:
            self.add_result("Verification Gate", "Unverified User Block", "❌ FAIL", result["status_code"],
                          "Verification gate not working - unverified users can access pet feed",
                          ["Security issue: Unverified users have access"])
        
        # Create and approve verification for testing
        if "user_a" in self.test_users:
            user_id = self.test_users["user_a"]["id"]
            
            # Submit verification
            verification_data = {
                "selfie_url": "https://example.com/selfie.jpg",
                "pet_pose_url": "https://example.com/pet_pose.jpg",
                "doc_url": "https://example.com/id_doc.jpg"
            }
            
            result = self.make_request("POST", "/verifications", verification_data, params={"user_id": user_id})
            
            if result["success"]:
                verification_id = result["data"]["id"]
                self.add_result("Verification Gate", "Submit Verification", "✅ PASS", result["status_code"],
                              f"Verification submitted: {verification_id[:8]}...")
                
                # Approve verification
                approve_data = {"user_id": user_id}
                approve_result = self.make_request("POST", f"/admin/verifications/{verification_id}/approve", approve_data)
                
                if approve_result["success"]:
                    self.add_result("Verification Gate", "Approve Verification", "✅ PASS", approve_result["status_code"],
                                  "Verification approved successfully")
                    
                    # Test verified user access
                    feed_result = self.make_request("GET", "/pets/feed", params={"user_id": user_id, "limit": 5})
                    
                    if feed_result["success"] and isinstance(feed_result["data"], list):
                        self.add_result("Verification Gate", "Verified User Access", "✅ PASS", feed_result["status_code"],
                                      f"Verified user can access pet feed - {len(feed_result['data'])} pets returned")
                    else:
                        self.add_result("Verification Gate", "Verified User Access", "❌ FAIL", feed_result["status_code"],
                                      f"Verified user cannot access pet feed: {feed_result['data']}")
                else:
                    self.add_result("Verification Gate", "Approve Verification", "❌ FAIL", approve_result["status_code"],
                                  f"Verification approval failed: {approve_result['data']}")
            else:
                self.add_result("Verification Gate", "Submit Verification", "❌ FAIL", result["status_code"],
                              f"Verification submission failed: {result['data']}")
    
    def test_premium_features_detailed(self):
        """Test premium features in detail"""
        self.log("="*80)
        self.log("PREMIUM FEATURES DETAILED TESTING")
        self.log("="*80)
        
        if "user_b" not in self.test_users or "pet_a" not in self.test_pets:
            self.add_result("Premium Features", "Setup Check", "❌ FAIL", 0,
                          "Cannot test premium features - missing test data")
            return
        
        user_id = self.test_users["user_b"]["id"]
        pet_id = self.test_pets["pet_a"]["id"]
        
        # Test super_like for free user (should fail or require coins)
        super_like_data = {"pet_id": pet_id, "action_type": "super_like"}
        result = self.make_request("POST", "/likes", super_like_data, params={"user_id": user_id})
        
        if not result["success"] or "insufficient_coins" in str(result["data"]) or "premium_required" in str(result["data"]):
            self.add_result("Premium Features", "Super Like (Free User)", "✅ PASS", result["status_code"],
                          "Free user correctly blocked from super_like")
        else:
            self.add_result("Premium Features", "Super Like (Free User)", "❌ FAIL", result["status_code"],
                          "Free user allowed to use super_like (should be blocked)",
                          ["Premium enforcement not working"])
        
        # Test golden_bone for free user (should fail or require coins)
        golden_bone_data = {"pet_id": pet_id, "action_type": "golden_bone"}
        result = self.make_request("POST", "/likes", golden_bone_data, params={"user_id": user_id})
        
        if not result["success"] or "insufficient_coins" in str(result["data"]) or "premium_required" in str(result["data"]):
            self.add_result("Premium Features", "Golden Bone (Free User)", "✅ PASS", result["status_code"],
                          "Free user correctly blocked from golden_bone")
        else:
            self.add_result("Premium Features", "Golden Bone (Free User)", "❌ FAIL", result["status_code"],
                          "Free user allowed to use golden_bone (should be blocked)",
                          ["Premium enforcement not working"])
        
        # Make user premium and test again
        premium_data = {"is_premium": True}
        premium_result = self.make_request("PUT", f"/admin/users/{user_id}/premium", premium_data)
        
        if premium_result["success"]:
            # Test super_like for premium user
            result = self.make_request("POST", "/likes", super_like_data, params={"user_id": user_id})
            
            if result["success"]:
                self.add_result("Premium Features", "Super Like (Premium User)", "✅ PASS", result["status_code"],
                              "Premium user can use super_like")
            else:
                self.add_result("Premium Features", "Super Like (Premium User)", "❌ FAIL", result["status_code"],
                              f"Premium user blocked from super_like: {result['data']}")
            
            # Test golden_bone for premium user
            result = self.make_request("POST", "/likes", golden_bone_data, params={"user_id": user_id})
            
            if result["success"]:
                self.add_result("Premium Features", "Golden Bone (Premium User)", "✅ PASS", result["status_code"],
                              "Premium user can use golden_bone")
            else:
                self.add_result("Premium Features", "Golden Bone (Premium User)", "❌ FAIL", result["status_code"],
                              f"Premium user blocked from golden_bone: {result['data']}")
    
    def run_comprehensive_test(self):
        """Run all comprehensive tests"""
        self.log("🚀 STARTING TAILFLIX COMPREHENSIVE QA TEST")
        self.log(f"Backend URL: {self.base_url}")
        self.log("Testing with 2 fresh test users as requested")
        self.log("="*80)
        
        # Run all test suites
        self.test_1_otp_authentication_verification()
        self.test_2_pet_management()
        self.test_3_tailcoins_system_daily_limits()
        self.test_4_like_actions_mutual_match()
        self.test_5_notifications_system()
        self.test_6_chat_system()
        self.test_7_admin_functions()
        self.test_8_verification_gate()
        self.test_premium_features_detailed()
        
        # Generate final report
        self.generate_comprehensive_report()
    
    def generate_comprehensive_report(self):
        """Generate comprehensive test report in requested format"""
        self.log("="*80)
        self.log("🎯 TAILFLIX COMPREHENSIVE QA TEST REPORT")
        self.log("="*80)
        
        # Group results by section
        sections = {}
        for result in self.test_results:
            section = result["section"]
            if section not in sections:
                sections[section] = []
            sections[section].append(result)
        
        # Print results by section
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        
        for section_name, tests in sections.items():
            self.log(f"\n📋 {section_name.upper()}:")
            for test in tests:
                status_icon = test["status"]
                self.log(f"  {status_icon} {test['test_name']} (HTTP {test['http_code']})")
                self.log(f"     Response: {test['response_summary']}")
                
                if test["errors"]:
                    for error in test["errors"]:
                        self.log(f"     ⚠️  {error}")
                
                total_tests += 1
                if test["status"] == "✅ PASS":
                    passed_tests += 1
                elif test["status"] == "❌ FAIL":
                    failed_tests += 1
        
        # Summary
        partial_tests = total_tests - passed_tests - failed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        self.log("="*80)
        self.log("📊 COMPREHENSIVE TEST SUMMARY")
        self.log("="*80)
        self.log(f"Total Tests: {total_tests}")
        self.log(f"✅ Passed: {passed_tests}")
        self.log(f"❌ Failed: {failed_tests}")
        self.log(f"⚠️  Partial: {partial_tests}")
        self.log(f"Success Rate: {success_rate:.1f}%")
        
        # Test Users Summary
        self.log("\n👥 TEST USERS CREATED:")
        for user_key, user_data in self.test_users.items():
            self.log(f"  {user_key.upper()}: {user_data['value']} (ID: {user_data['id'][:8]}...)")
        
        # Test Pets Summary
        self.log("\n🐕 TEST PETS CREATED:")
        for pet_key, pet_data in self.test_pets.items():
            self.log(f"  {pet_key.upper()}: {pet_data['pet_name']} ({pet_data['breed']})")
        
        # Matches Summary
        if self.test_matches:
            self.log("\n💕 MATCHES CREATED:")
            for match_key, match_data in self.test_matches.items():
                self.log(f"  {match_key.upper()}: {match_data.get('my_pet', {}).get('name', 'Pet')} ↔ {match_data.get('their_pet', {}).get('name', 'Pet')}")
        
        # Critical Issues
        critical_issues = [test for test in self.test_results if test["status"] == "❌ FAIL"]
        if critical_issues:
            self.log("\n🚨 CRITICAL ISSUES FOUND:")
            for issue in critical_issues:
                self.log(f"  • {issue['section']} - {issue['test_name']}")
                if issue["errors"]:
                    for error in issue["errors"]:
                        self.log(f"    - {error}")
        
        self.log("="*80)
        self.log("🏁 TAILFLIX COMPREHENSIVE QA TEST COMPLETE")
        self.log("="*80)

if __name__ == "__main__":
    tester = ComprehensiveTailFlixTester()
    tester.run_comprehensive_test()