import { X, Calendar, DollarSign, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

export default function MemberHistoryModal({ member, onClose }) {
    const history = member.history ? [...member.history].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">Payment History</h2>
                        <p className="text-indigo-200 text-sm">for {member.name}</p>
                    </div>
                    <button onClick={onClose} className="text-indigo-300 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {history.length > 0 ? (
                        history.map((payment) => (
                            <div key={payment.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:bg-indigo-500/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-lg">{payment.amount} AED</p>
                                        <p className="text-indigo-300/80 text-xs flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(payment.created_at), 'PPP')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-indigo-400 font-mono">
                                        {format(new Date(payment.created_at), 'h:mm a')}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 flex flex-col items-center gap-3 text-indigo-300/50">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <Calendar className="w-8 h-8 opacity-50" />
                            </div>
                            <p>No payment history records found.</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-end shrink-0">
                    <button onClick={onClose} className="btn-secondary px-6">Close</button>
                </div>
            </div>
        </div>
    );
}
