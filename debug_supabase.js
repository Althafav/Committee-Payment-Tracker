import { createClient } from '@supabase/supabase-js';

// Hardcoded for debugging purposes based on previous file read
const supabaseUrl = 'https://lqtpnhcsufaqgfbegvlx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdHBuaGNzdWZhcWdmYmVndmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNDk1OTIsImV4cCI6MjA4MDYyNTU5Mn0.TuBukjqWse_JpZLA52LkXjHAEbu_prvam-rfMa8wyV4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log("Testing Supabase Connection...");

    // 1. Try to fetch members
    console.log("1. Fetching members...");
    const { data: fetchDat, error: fetchErr } = await supabase.from('members').select('*').limit(1);
    if (fetchErr) {
        console.error("❌ Fetch Failed:", fetchErr.message);
        console.error("Details:", fetchErr);
    } else {
        console.log("✅ Fetch Success. Count:", fetchDat.length);
    }

    // 2. Try to insert a member
    console.log("\n2. Inserting debug member...");
    const newMember = {
        name: "Debug User " + Date.now(),
        paid_until: new Date().toISOString(),
        balance: 0
    };

    const { data: insertDat, error: insertErr } = await supabase.from('members').insert([newMember]).select();

    if (insertErr) {
        console.error("❌ Insert Failed:", insertErr.message);
        // Common RLS error code is 42501
        if (insertErr.code === '42501') {
            console.error("⚠️  HINT: This looks like a Row Level Security (RLS) policy violation. Did you run the SQL to disable RLS?");
        }
    } else {
        console.log("✅ Insert Success:", insertDat);

        // Cleanup
        if (insertDat && insertDat[0]) {
            await supabase.from('members').delete().eq('id', insertDat[0].id);
            console.log("   (Cleaned up debug user)");
        }
    }
}

testConnection();
