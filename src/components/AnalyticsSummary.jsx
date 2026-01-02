import { TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { calculatePendingAmount } from '../logic/paymentCalculator';
import { isSameMonth, parseISO } from 'date-fns';

export default function AnalyticsSummary({ members }) {
    // 1. Calculate Total Members
    const totalMembers = members.length;

    // 2. Calculate Total Pending
    const totalPending = members.reduce((sum, member) => {
        return sum + calculatePendingAmount(member.paidUntil, member.balance || 0);
    }, 0);

    // 3. Calculate Collected This Month
    const now = new Date();
    const collectedThisMonth = members.reduce((sum, member) => {
        const memberPayments = member.history || [];
        const monthTotal = memberPayments.reduce((pSum, payment) => {
            const paymentDate = new Date(payment.created_at);
            if (isSameMonth(paymentDate, now)) {
                return pSum + (payment.amount || 0);
            }
            return pSum;
        }, 0);
        return sum + monthTotal;
    }, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Collected This Month */}
            <div className="glass-panel p-4 flex items-center gap-4 border-emerald-500/20 bg-emerald-500/5">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    < p className="text-sm text-emerald-100/70 font-medium">Collected (This Month)</p>
                    <h3 className="text-2xl font-bold text-white">{collectedThisMonth} <span className="text-sm text-emerald-400 font-normal">AED</span></h3>
                </div>
            </div>

            {/* Total Pending */}
            <div className={`glass-panel p-4 flex items-center gap-4 ${totalPending > 0 ? 'border-rose-500/20 bg-rose-500/5' : 'border-indigo-500/20'}`}>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${totalPending > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-slate-300 font-medium">Total Pending Dues</p>
                    <h3 className="text-2xl font-bold text-white">{totalPending} <span className={`text-sm font-normal ${totalPending > 0 ? 'text-rose-400' : 'text-slate-400'}`}>AED</span></h3>
                </div>
            </div>

            {/* Active Members */}
            <div className="glass-panel p-4 flex items-center gap-4 border-indigo-500/20 bg-indigo-500/5">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-indigo-200/70 font-medium">Active Members</p>
                    <h3 className="text-2xl font-bold text-white">{totalMembers}</h3>
                </div>
            </div>
        </div>
    );
}
