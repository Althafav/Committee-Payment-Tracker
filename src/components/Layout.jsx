import { LayoutDashboard, Users, UserPlus } from 'lucide-react';
import { clsx } from 'clsx';

export default function Layout({ children }) {
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
                    {/* Simple Nav for now could be tabs later */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-indigo-100/80">
                        {/* Placeholders for future nav */}
                    </nav>
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
