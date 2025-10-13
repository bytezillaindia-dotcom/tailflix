// Mock vendor initialization for testing
// Run this manually via: node init_mock_vendor.js
// Or integrate into AuthContext on first launch

const mockVendor = {
  userId: 'mock-vendor-123',
  phone: '9999999999',
  role: 'vendor',
  status: 'approved',
  vendorId: 'VENDOR1697123456789',
  name: 'Test Vendor',
  category: 'Grooming',
  city: 'Bengaluru',
  price: 999,
};

console.log('Mock Vendor Data:');
console.log(JSON.stringify(mockVendor, null, 2));
console.log('\nTo test as vendor:');
console.log('1. Login with phone: 9999999999 and OTP: 123456');
console.log('2. After login, manually call: ');
console.log(`   login('mock-vendor-123', 'mock-token', 'vendor', 'approved', 'VENDOR1697123456789')`);
console.log('3. You should see Vendor Dashboard card on home screen');
