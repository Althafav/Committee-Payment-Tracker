import { useState } from 'react';
import { useMembers } from '../context/MemberContext';
import { calculatePendingAmount, processPayment } from '../logic/paymentCalculator';
import { Plus, Search, Calendar, CreditCard, ChevronRight, User, Wallet, AlertCircle, Building, BadgeCheck, Phone, History } from 'lucide-react';
import { format, startOfMonth, setYear, setMonth } from 'date-fns';
import MemberHistoryModal from './MemberHistoryModal';
import AnalyticsSummary from './AnalyticsSummary';

export default function Dashboard() {
    const { members, addMember, addPayment } = useMembers();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [selectedMemberForPayment, setSelectedMemberForPayment] = useState(null);
    const [selectedMemberForHistory, setSelectedMemberForHistory] = useState(null);

    // Derived state
    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.mobile && m.mobile.includes(searchTerm)) ||
        (m.house_name && m.house_name.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => {
        const pendingA = calculatePendingAmount(a.paidUntil, a.balance || 0);
        const pendingB = calculatePendingAmount(b.paidUntil, b.balance || 0);
        return pendingB - pendingA;
    });

    return (
        <div className="space-y-6">
            {/* Analytics */}
            <AnalyticsSummary members={members} />

            {/* Stats / Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
                    <input
                        type="text"
                        placeholder="Search by name, mobile, or house..."
                        className="glass-input w-full pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsAddMemberOpen(true)}
                    className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Member</span>
                </button>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map(member => {
                    const balance = member.balance || 0;
                    const pending = calculatePendingAmount(member.paidUntil, balance);
                    const isOverdue = pending > 0;
                    const isExecutive = member.is_executive;

                    return (
                        <div key={member.id} className={`glass-panel p-6 flex flex-col gap-4 group hover:bg-white/15 transition-all relative ${isExecutive ? 'border-amber-500/30' : ''}`}>
                            {isExecutive && (
                                <div className="absolute top-4 right-4 text-amber-400" title="Executive Member">
                                    <BadgeCheck className="w-6 h-6" />
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-full ${isOverdue ? 'bg-rose-500/20 text-rose-300' : (isExecutive ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300')}`}>
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-white leading-tight">{member.name}</h3>
                                    <p className="text-xs text-indigo-300/80">
                                        Joined {member.membership_date ? format(new Date(member.membership_date), 'MMM yyyy') : (member.created_at ? format(new Date(member.created_at), 'MMM yyyy') : 'Recently')}
                                    </p>
                                    {member.designation && <p className="text-sm text-indigo-200 mt-1">{member.designation}</p>}
                                    {member.house_name && <p className="text-xs text-indigo-300/80 mt-1 flex items-center gap-1"><Building className="w-3 h-3" /> {member.house_name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/10 border-b">
                                <div>
                                    <p className="text-xs text-indigo-300 mb-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Paid Until
                                    </p>
                                    {/* Display only Month and Year */}
                                    <p className="font-semibold text-white">{format(new Date(member.paidUntil), 'MMM yyyy')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-indigo-300 mb-1">Total Pending</p>
                                    <p className={`font-bold text-xl ${isOverdue ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {pending} AED
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm px-1">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-indigo-200">
                                        <Wallet className="w-4 h-4" />
                                        <span>Wallet Balance:</span>
                                    </div>
                                    <span className={`font-bold ${balance < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                                        {balance} AED
                                    </span>
                                </div>

                                {member.mobile && (
                                    <div className="flex items-center gap-2 text-indigo-300/80">
                                        <Phone className="w-3 h-3" />
                                        <span>{member.mobile}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-auto pt-2">
                                <button
                                    onClick={() => setSelectedMemberForHistory(member)}
                                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                                    title="View Payment History"
                                >
                                    <History className="w-4 h-4" />
                                    <span>History</span>
                                </button>
                                <button
                                    onClick={() => setSelectedMemberForPayment(member)}
                                    className="btn-primary flex-[2] flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    <span>Payment</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredMembers.length === 0 && (
                <div className="text-center py-12 text-indigo-300/50">
                    <p>No members found matching your search.</p>
                </div>
            )}

            {/* Add Member Modal */}
            {isAddMemberOpen && (
                <AddMemberModal
                    onClose={() => setIsAddMemberOpen(false)}
                    onAdd={addMember}
                />
            )}

            {/* Payment Modal */}
            {selectedMemberForPayment && (
                <PaymentModal
                    member={selectedMemberForPayment}
                    onClose={() => setSelectedMemberForPayment(null)}
                    onPayment={addPayment}
                />
            )}

            {/* History Modal */}
            {selectedMemberForHistory && (
                <MemberHistoryModal
                    member={selectedMemberForHistory}
                    onClose={() => setSelectedMemberForHistory(null)}
                />
            )}
        </div>
    );
}

// Reusable Month/Year Picker Component
function MonthYearPicker({ label, date, onChange }) {
    const currentDate = new Date(date);
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Generate years from 2020 to 2030
    const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

    return (
        <div>
            <label className="block text-sm text-indigo-200 mb-1">{label}</label>
            <div className="flex gap-2">
                <select
                    className="glass-input w-2/3 bg-slate-800"
                    value={currentDate.getMonth()}
                    onChange={(e) => {
                        const newDate = setMonth(currentDate, parseInt(e.target.value));
                        onChange(newDate);
                    }}
                >
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select
                    className="glass-input w-1/3 bg-slate-800"
                    value={currentDate.getFullYear()}
                    onChange={(e) => {
                        const newDate = setYear(currentDate, parseInt(e.target.value));
                        onChange(newDate);
                    }}
                >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        </div>
    );
}

function AddMemberModal({ onClose, onAdd }) {
    const [formData, setFormData] = useState({
        name: '',
        fatherName: '',
        houseName: '',
        emirate: 'Dubai',
        mobile: '',
        email: '',
        designation: '',
        isExecutive: false,
        paidUntil: startOfMonth(new Date()).toISOString(), // Default to 1st of current month
        membershipDate: startOfMonth(new Date()).toISOString()
    });

    const emirates = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDateChange = (field, newDate) => {
        setFormData(prev => ({
            ...prev,
            [field]: newDate.toISOString()
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        onAdd({
            ...formData,
            balance: 0 // Always 0 to start, removed outstanding amount
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="glass-panel w-full max-w-2xl p-6 animate-in fade-in zoom-in duration-200 my-8">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold text-white">Add New Member</h2>
                    <button onClick={onClose} className="text-indigo-300 hover:text-white">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider mb-2">Personal Details</h3>
                            <div>
                                <label className="block text-sm text-indigo-200 mb-1">Full Name *</label>
                                <input
                                    autoFocus
                                    required
                                    name="name"
                                    type="text"
                                    className="glass-input w-full"
                                    placeholder="e.g. Althaf"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-indigo-200 mb-1">Father's Name</label>
                                <input
                                    name="fatherName"
                                    type="text"
                                    className="glass-input w-full"
                                    placeholder="Father's Name"
                                    value={formData.fatherName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-indigo-200 mb-1">House Name</label>
                                <input
                                    name="houseName"
                                    type="text"
                                    className="glass-input w-full"
                                    placeholder="House Name"
                                    value={formData.houseName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-indigo-200 mb-1">Emirate</label>
                                <select
                                    name="emirate"
                                    className="glass-input w-full bg-slate-800"
                                    value={formData.emirate}
                                    onChange={handleChange}
                                >
                                    {emirates.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Contact & Status */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider mb-2">Contact & Role</h3>
                            <div>
                                <label className="block text-sm text-indigo-200 mb-1">Mobile Number</label>
                                <input
                                    name="mobile"
                                    type="tel"
                                    className="glass-input w-full"
                                    placeholder="05x xxx xxxx"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-indigo-200 mb-1">Email (Optional)</label>
                                <input
                                    name="email"
                                    type="email"
                                    className="glass-input w-full"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-indigo-200 mb-1">Designation</label>
                                <input
                                    name="designation"
                                    type="text"
                                    className="glass-input w-full"
                                    placeholder="e.g. Member / Secretary"
                                    value={formData.designation}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    id="isExecutive"
                                    name="isExecutive"
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-indigo-400 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                                    checked={formData.isExecutive}
                                    onChange={handleChange}
                                />
                                <label htmlFor="isExecutive" className="text-sm text-white font-medium select-none cursor-pointer">
                                    Is Executive Member?
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Dates Section - No Legacy Debt anymore */}
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-4">
                        <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">Membership Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <MonthYearPicker
                                label="Membership Start Date"
                                date={formData.membershipDate}
                                onChange={(d) => handleDateChange('membershipDate', d)}
                            />

                            <MonthYearPicker
                                label="Fees Paid Until (Start of Month)"
                                date={formData.paidUntil}
                                onChange={(d) => handleDateChange('paidUntil', d)}
                            />
                        </div>
                        <p className="text-xs text-indigo-300/60 italic">
                            * Note: Fees are 10 AED/month until Feb 2025, and 15 AED/month from March 2025 onwards.
                        </p>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg">Cancel</button>
                        <button type="submit" className="btn-primary px-8">Add Member</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PaymentModal({ member, onClose, onPayment }) {
    const [amount, setAmount] = useState('30');
    const balance = member.balance || 0;

    // Calculate preview
    const pending = calculatePendingAmount(member.paidUntil, balance);
    const { newPaidUntil, newBalance } = processPayment(member.paidUntil, parseInt(amount) || 0, balance);
    const totalAvailable = (parseInt(amount) || 0) + balance;

    const handleSubmit = (e) => {
        e.preventDefault();
        const val = parseInt(amount);
        if (!val || val <= 0) return;
        onPayment(member.id, val, newPaidUntil, newBalance);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-white mb-2">Record Payment</h2>
                <p className="text-indigo-200 mb-6">For {member.name}</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-indigo-300">Paid Until:</span>
                            <span className="text-white font-medium">{format(new Date(member.paidUntil), 'MMM yyyy')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-indigo-300">Total Pending:</span>
                            <span className="text-rose-300 font-medium">{pending} AED</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                            <span className="text-indigo-300">Wallet Balance:</span>
                            <span className={`font-medium ${balance < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>{balance} AED</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-indigo-200 mb-1">Payment Amount (AED)</label>
                        <input
                            type="number"
                            className="glass-input w-full text-lg font-bold"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="1"
                        />
                        <p className="text-xs text-indigo-400 mt-2">
                            Total Available with Wallet: <span className="text-white font-bold">{totalAvailable} AED</span>
                        </p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                        <p className="text-sm text-emerald-200 flex items-center gap-2">
                            <ChevronRight className="w-4 h-4" />
                            New Paid Until: <span className="font-bold text-white ml-auto">{format(newPaidUntil, 'MMM yyyy')}</span>
                        </p>
                        <p className="text-sm text-emerald-200 flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            Remaining in Wallet: <span className={`font-bold ml-auto ${newBalance < 0 ? 'text-rose-300' : 'text-white'}`}>{newBalance} AED</span>
                        </p>
                    </div>

                    <div className="flex gap-3 justify-end mt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg">Cancel</button>
                        <button type="submit" className="btn-primary">Confirm Payment</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
