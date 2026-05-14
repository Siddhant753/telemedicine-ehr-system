import { Menu, LogOut, Bell } from 'lucide-react';
import { logoutUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/Authcontext';

interface Props { onMenuClick: () => void; }

export default function Navbar({ onMenuClick }: Props) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try { await logoutUser(); } catch { /* ignore */ }
        toast.success('Logged out');
        navigate('/login');
    };

    return (
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/[0.06] bg-[#0d1117]/80 backdrop-blur-sm shrink-0">
            <button
                onClick={onMenuClick}
                className="lg:hidden text-slate-400 hover:text-white transition-colors p-1"
            >
                <Menu size={20} />
            </button>

            <div className="hidden lg:block text-sm text-slate-500 font-mono">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            <div className="flex items-center gap-2 ml-auto">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all relative">
                    <Bell size={16} />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-teal-400" />
                </button>

                <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-navy-600 flex items-center justify-center text-xs font-bold text-white">
                        {user?.fname?.[0]}{user?.lname?.[0]}
                    </div>
                    <span className="hidden md:block text-sm text-slate-300">
                        {user?.fname} {user?.lname}
                    </span>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-400/5"
                >
                    <LogOut size={14} />
                    <span className="hidden md:block">Logout</span>
                </button>
            </div>
        </header>
    );
}