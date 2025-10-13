// Mock vendor earnings initialization
// This simulates initial earnings for 3 vendor types

const mockVendorEarnings = {
  'VENDOR_SVC_1': { // Service vendor
    total: 2499,
    pending: 999,
    completed: 1500
  },
  'VENDOR_BRD_1': { // Breeder vendor
    total: 799,
    pending: 799,
    completed: 0
  },
  'VENDOR_AD_1': { // Poster vendor
    total: 199,
    pending: 199,
    completed: 0
  }
};

console.log('Mock Vendor Earnings:');
console.log(JSON.stringify(mockVendorEarnings, null, 2));
console.log('\nTo test:');
console.log('1. Save this to AsyncStorage with key "vendor_earnings"');
console.log('2. Login as vendor with matching vendorId');
console.log('3. Navigate to Vendor Dashboard → Earnings tab');
console.log('4. You should see real earnings data');
console.log('5. Request Payout to move pending → completed');

console.log('\nFlow Test:');
console.log('1. Book a TailPro service for ₹999');
console.log('2. Complete payment');
console.log('3. Check vendor dashboard → earnings should increase by ₹999');
console.log('4. Request payout → pending becomes 0, completed increases');
