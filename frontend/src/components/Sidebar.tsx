import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import {
  LayoutDashboard, Calendar, FileText, Pill, Users,
  Stethoscope, UserCog, X, ShieldCheck, ClipboardList,
} from 'lucide-react';
import clsx from 'clsx';

interface Props { open: boolean; onClose: () => void; }

const patientNav = [
    { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patient/book', icon: Calendar, label: 'Book Appointment' },
    { to: '/patient/appointments', icon: ClipboardList, label: 'My Appointments' },
    { to: '/patient/ehr', icon: FileText, label: 'Health Records' },
    { to: '/patient/prescriptions', icon: Pill, label: 'Prescriptions' },
];

const doctorNav = [
    { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/doctor/patients', icon: Users, label: 'Patient Records' },
    { to: '/doctor/ehr/create', icon: FileText, label: 'Create EHR' },
    { to: '/doctor/prescriptions/new', icon: Pill, label: 'Issue Prescription' },
];

const adminNav = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: UserCog, label: 'User Management' },
];

export default function Sidebar({ open, onClose }: Props) {
    const { user } = useAuth();
    const navItems = user?.role === 'doctor' ? doctorNav : user?.role === 'admin' ? adminNav : patientNav;

    return (
        <aside className={clsx(
            'fixed lg:relative inset-y-0 left-0 z-30',
            'w-64 flex flex-col bg-[#0d1117] border-r border-white/[0.06]',
            'transition-transform duration-300 ease-in-out',
            open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-navy-600 flex items-center justify-center">
                        <Stethoscope size={16} className="text-white" />
                    </div>
                    <span className="font-display text-lg text-white tracking-tight">EHR-System</span>
                </div>
                <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="px-5 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={12} className="text-teal-400" />
                    <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest">
                        {user?.role ?? 'guest'} portal
                    </span>
                </div>
                <p className="text-sm text-white font-medium mt-1 truncate">
                    {user?.role === 'doctor' ? `Dr. ${user.fname} ${user.lname}` : `${user?.fname} ${user?.lname}`}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={onClose}
                        className={({ isActive }) => clsx(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                            isActive
                                ? 'text-teal-300 bg-teal-400/10 border border-teal-400/15'
                                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <Icon size={16} className={isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'} />
                                {label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="px-4 py-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 bg-teal-400/5 border border-teal-400/10 rounded-lg px-3 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-teal-500">AES-256 • TLS 1.3</span>
                </div>
            </div>
        </aside>
    );
}