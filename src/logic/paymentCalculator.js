import { addMonths, differenceInMonths, startOfDay, isBefore, addDays } from 'date-fns';

const MONTHLY_FEE = 15;
const DAILY_RATE = MONTHLY_FEE / 30;

/**
 * Calculates the total pending amount for a member.
 * Includes both monthly fees since "Paid Until" AND any legacy debt (negative balance).
 * @param {Date | string} paidUntil - The date up to which the member has paid.
 * @param {number} currentBalance - Current wallet balance (negative means debt).
 * @returns {number} The pending amount in AED.
 */
export function calculatePendingAmount(paidUntil, currentBalance = 0) {
    const today = startOfDay(new Date());
    const paidUntilDate = startOfDay(new Date(paidUntil));

    let pending = 0;

    // 1. Calculate fees for time passed
    if (isBefore(paidUntilDate, today)) {
        const monthsPending = differenceInMonths(today, paidUntilDate);
        pending = Math.max(0, monthsPending * MONTHLY_FEE);
    }

    // 2. Add Legacy Debt (if balance is negative, it adds to pending)
    if (currentBalance < 0) {
        pending += Math.abs(currentBalance);
    }

    // Note: Positive balance doesn't reduce pending technically in this view, 
    // it just means they have credit to pay it off. 
    // But usually we want to show "Net Pending".
    // For simplicity based on requirements: 
    // If they have credit, it subtracts from what they owe.
    if (currentBalance > 0) {
        pending = Math.max(0, pending - currentBalance);
    }

    return pending;
}

/**
 * Processes a payment using the wallet system.
 * Handles negative balances (debt) first.
 * @param {Date | string} currentPaidUntil - Current paid until date.
 * @param {number} amountPaid - Amount being paid now.
 * @param {number} currentBalance - Existing wallet balance.
 * @returns {Object} { newPaidUntil: Date, newBalance: number }
 */
export function processPayment(currentPaidUntil, amountPaid, currentBalance = 0) {
    // 1. Add payment to balance (Paying off debt if negative)
    let totalAvailable = currentBalance + amountPaid;

    // 2. If after payment, balance is still negative or zero, 
    // it means they only paid off debt (or part of it). Date doesn't move.
    if (totalAvailable < MONTHLY_FEE && totalAvailable < 0) {
        return {
            newPaidUntil: new Date(currentPaidUntil),
            newBalance: totalAvailable
        };
    }

    // 3. If positive (or enough to cover months), calculate months/days to add
    // We only use the POSITIVE portion for date advancement
    // Logic: "Keep date moving"

    // BUT: "Paid Until" is the anchor. 
    // If totalAvailable is positive, we treat it as money to buy time.

    // Edge Case: If they were in debt (-50) and paid 100. Total = 50.
    // They effectively bought 3.33 months starting from their CURRENT PaidUntil date.

    // However, we need to ensure we don't double count. 
    // The 'PaidUntil' date was set to 'Today' (or whenever) when they joined with debt.
    // So yes, using the surplus to advance that date is correct.

    // Using Precise Calculation (Days) for remainders as per previous feature
    const monthsToAdd = Math.floor(totalAvailable / MONTHLY_FEE);
    const remainder = totalAvailable % MONTHLY_FEE;

    // Convert remainder to days
    // If remainder is negative (e.g. paying off debt creates 0 balance, handled above)
    // If totalAvailable is positive but < 15, monthsToAdd is 0, remainder is totalAvailable.

    let newPaidUntil = new Date(currentPaidUntil);

    if (monthsToAdd > 0) {
        newPaidUntil = addMonths(newPaidUntil, monthsToAdd);
    }

    if (remainder > 0) {
        const daysToAdd = Math.floor(remainder / DAILY_RATE);
        if (daysToAdd > 0) {
            newPaidUntil = addDays(newPaidUntil, daysToAdd);
        }
        // Note: We used the remainder for days, so balance technically becomes 0?
        // OR do we store it as credit?
        // User chose "Wallet Balance" previously unless we switched everything to "Precise Dates".
        // Let's stick to: Remainder IS Balance (Wallet), NOT Days.
        // Wait, earlier (Step 229) we implemented "Precise Date", THEN (Step 264) switched to "Wallet".
        // So Remainder should be BALANCE, not Days.
    }

    // Re-evaluating based on "Wallet System" decision in Step 264:
    // "10 AED in Wallet".

    // CORRECT LOGIC FOR WALLET SYSTEM:
    const finalMonthsToAdd = Math.floor(totalAvailable / MONTHLY_FEE);
    const finalBalance = totalAvailable % MONTHLY_FEE;

    let finalDate = new Date(currentPaidUntil);
    if (finalMonthsToAdd > 0) {
        finalDate = addMonths(finalDate, finalMonthsToAdd);
    }

    return { newPaidUntil: finalDate, newBalance: finalBalance };
}
