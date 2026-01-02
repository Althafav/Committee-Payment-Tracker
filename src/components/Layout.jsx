import { LayoutDashboard, Users, UserPlus, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="glass-panel sticky top-4 mx-4 mt-4 mb-8 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/30">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                            Commitee Payment Tracker
                        </h1>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-indigo-200 hover:text-white transition-colors text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 pb-12">
                {children}
            </main>

            <footer className="py-6 text-center text-slate-400 text-sm">
                <p>© {new Date().getFullYear()} Commitee Payment Tracker</p>
            </footer>
        </div>
    );
}
