import { processPayment } from './src/logic/paymentCalculator.js';
import { addMonths, subMonths, format, addDays } from 'date-fns';

console.log("Starting Payment Logic Verification (Wallet Mode)...");

const today = new Date();
const twoMonthsAgo = subMonths(today, 2);

// Test 1: Standard Payment (30 AED) -> 0 Balance
console.log("\n--- Test 1: Standard Payment (30 AED) ---");
const res1 = processPayment(twoMonthsAgo, 30, 0);
console.log(`Paid 30 AED. New Balance: ${res1.newBalance} AED (Expected 0)`);
if (res1.newBalance === 0) console.log("✅ Balance Correct");


// Test 2: Remainder Payment (100 AED)
console.log("\n--- Test 2: Remainder Payment (100 AED) ---");
// 100 / 15 = 6 months remainder 10.
const res2 = processPayment(twoMonthsAgo, 100, 0);
const expectedDate2 = addMonths(twoMonthsAgo, 6);

console.log(`Paid 100 AED.`);
console.log(`New Balance: ${res2.newBalance} AED (Expected 10)`);
console.log(`New Date: ${format(res2.newPaidUntil, 'yyyy-MM-dd')} (Expected ${format(expectedDate2, 'yyyy-MM-dd')})`);

if (res2.newBalance === 10) console.log("✅ Balance Correct");
else console.error("❌ Balance Incorrect");

// Test 3: Using Balance (Pay 20 AED + 10 Balance)
console.log("\n--- Test 3: Using Balance (Pay 20 AED + 10 Balance) ---");
const res3 = processPayment(res2.newPaidUntil, 20, 10);
// Total = 30. Adds 2 months. 0 Balance.
const expectedDate3 = addMonths(res2.newPaidUntil, 2);

console.log(`Paid 20 AED (+10 Balance).`);
console.log(`New Balance: ${res3.newBalance} AED (Expected 0)`);
console.log(`New Date: ${format(res3.newPaidUntil, 'yyyy-MM-dd')} (Expected ${format(expectedDate3, 'yyyy-MM-dd')})`);

if (res3.newBalance === 0 && format(res3.newPaidUntil, 'yyyy-MM-dd') === format(expectedDate3, 'yyyy-MM-dd')) {
    console.log("✅ SUCCESS: Wallet usage verified.");
} else {
    console.error("❌ FAILED: Wallet usage logic failed.");
}

console.log("\nDone.");
