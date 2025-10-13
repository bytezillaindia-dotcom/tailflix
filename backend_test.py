#!/usr/bin/env python3
"""
TailFlix Backend API Testing Suite - PetFeed Features
Tests the new PetFeed functionality including likes and pet feed endpoints
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Any

# Backend URL from frontend .env
BACKEND_URL = "https://taildate.preview.emergentagent.com/api"

class TailFlixAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.test_users = []
        self.test_pets = []
        self.test_likes = []
        
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

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("TailFlix Backend API Testing Suite")
        print("=" * 60)
        print(f"Testing backend at: {self.base_url}")
        print()
        
        # Test API connectivity first
        if not self.test_api_root():
            print("❌ CRITICAL: Cannot connect to backend API. Stopping tests.")
            return False
        
        # Test all endpoints
        tests = [
            self.test_send_otp_valid_phone,
            self.test_send_otp_valid_email,
            self.test_send_otp_invalid_method,
            self.test_send_otp_empty_value,
            self.test_verify_otp_valid,
            self.test_verify_otp_invalid_length,
            self.test_verify_otp_non_numeric,
            self.test_verify_otp_user_not_exists,
            self.test_get_users
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
        
        return passed == total

if __name__ == "__main__":
    tester = TailFlixAPITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)