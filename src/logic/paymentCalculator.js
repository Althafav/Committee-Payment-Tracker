import { addMonths, startOfMonth, isAfter } from 'date-fns';

/**
 * Determines the fee rate for a given month.
 * 10 AED for Jan 2025 and Feb 2025 (and earlier).
 * 15 AED from March 2025 onwards.
 */
function getRateForMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed (Jan=0, Feb=1, Mar=2)

    // Before 2025: 10 AED
    if (year < 2025) return 10;

    // In 2025, Jan (0) and Feb (1) are 10 AED.
    if (year === 2025 && month < 2) return 10;

    // March 2025 onwards (including future years) is 15 AED.
    return 15;
}

/**
 * Calculates total pending amount based on dynamic rates.
 * Iterates month-by-month from the month AFTER paidUntil up to the CURRENT month (inclusive).
 * "Paid Until: Jan 2025" means Jan is paid. We start charging from Feb.
 */
export const calculatePendingAmount = (paidUntil, walletBalance = 0) => {
    let current = addMonths(startOfMonth(new Date(paidUntil)), 1);
    const now = startOfMonth(new Date());
    let totalPending = 0;

    // Iterate month by month from (PaidUntil + 1) up to Now (inclusive)
    let safetyCounter = 0;
    while (!isAfter(current, now) && safetyCounter < 1000) {
        totalPending += getRateForMonth(current);
        current = addMonths(current, 1);
        safetyCounter++;
    }

    // Apply wallet balance (credit reduces pending)
    return Math.max(0, totalPending - walletBalance);
};

/**
 * Process a payment and determine the new PaidUntil date and Wallet Balance.
 * "Fills buckets" of months using their specific rates.
 * PaidUntil represents the LAST paid month. We try to pay for the NEXT month.
 */
export const processPayment = (currentPaidUntil, paymentAmount, currentBalance = 0) => {
    let availableFunds = paymentAmount + currentBalance;
    let newPaidUntil = startOfMonth(new Date(currentPaidUntil));

    let safetyCounter = 0;

    // Try to pay for the next month
    while (true && safetyCounter < 1000) {
        const nextMonth = addMonths(newPaidUntil, 1);
        const rate = getRateForMonth(nextMonth);

        if (availableFunds >= rate) {
            availableFunds -= rate;
            newPaidUntil = nextMonth;
        } else {
            // Not enough for the full next month, stop here.
            break;
        }
        safetyCounter++;
    }

    return {
        newPaidUntil: newPaidUntil, // Will be a Date object
        newBalance: availableFunds // Remainder stays in wallet
    };
};
