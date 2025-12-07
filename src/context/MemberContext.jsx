import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { startOfDay } from 'date-fns';

const MemberContext = createContext();

export const MemberProvider = ({ children }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMembers = async () => {
        try {
            const { data, error } = await supabase
                .from('members')
                .select('*, payments(*)');

            if (error) throw error;

            // Transform data to match app structure (payments -> history)
            const formattedMembers = data.map(m => ({
                ...m,
                joinDate: m.created_at, // Map Supabase created_at to joinDate
                paidUntil: m.paid_until, // Map snake_case to camelCase
                history: m.payments || []
            }));

            // Sort by most recently added or name
            formattedMembers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setMembers(formattedMembers);
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const addMember = async (memberData) => {
        // memberData expects: { name, paidUntil, balance, fatherName, houseName, emirate, mobile, email, designation, isExecutive }
        try {
            const { error } = await supabase
                .from('members')
                .insert([{
                    name: memberData.name,
                    paid_until: memberData.paidUntil ? new Date(memberData.paidUntil).toISOString() : new Date().toISOString(),
                    balance: memberData.balance || 0,
                    father_name: memberData.fatherName,
                    house_name: memberData.houseName,
                    emirate: memberData.emirate,
                    mobile: memberData.mobile,
                    email: memberData.email,
                    designation: memberData.designation,
                    is_executive: memberData.isExecutive,
                    membership_date: memberData.membershipDate ? new Date(memberData.membershipDate).toISOString() : null
                }]);

            if (error) throw error;
            await fetchMembers();
        } catch (error) {
            console.error("Error adding member:", error);
            alert("Failed to add member");
        }
    };

    const addPayment = async (memberId, amount, newPaidUntil, newBalance) => {
        try {
            // 1. Record Payment
            const { error: paymentError } = await supabase
                .from('payments')
                .insert([{
                    member_id: memberId,
                    amount
                }]);

            if (paymentError) throw paymentError;

            // 2. Update Member Status
            const { error: memberError } = await supabase
                .from('members')
                .update({
                    paid_until: newPaidUntil.toISOString(),
                    balance: newBalance
                })
                .eq('id', memberId);

            if (memberError) throw memberError;

            await fetchMembers();
        } catch (error) {
            console.error("Error adding payment:", error);
            alert("Failed to record payment");
        }
    };

    // Note: Delete function might need RLS update or specific cascading, 
    // but assuming simple delete for now if RLS disabled.
    const deleteMember = async (id) => {
        try {
            const { error } = await supabase
                .from('members')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setMembers(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error("Error deleting member:", error);
        }
    };

    return (
        <MemberContext.Provider value={{ members, addMember, addPayment, deleteMember, loading }}>
            {children}
        </MemberContext.Provider>
    );
};

export const useMembers = () => useContext(MemberContext);
