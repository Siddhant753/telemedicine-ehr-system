import { forwardRef, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

// Button
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    loading?: boolean;
    icon?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}
export const Button = forwardRef<HTMLButtonElement, BtnProps>(
    ({ variant = 'primary', loading, icon, size = 'md', children, className, disabled, ...rest }, ref) => {
        const base = 'inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
        const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
        const variants = {
            primary:   'bg-teal-400 hover:bg-teal-200 text-slate-950',
            secondary: 'bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white',
            danger:    'bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 text-red-400',
            ghost:     'hover:bg-white/[0.06] text-slate-400 hover:text-white',
        };
        return (
            <button ref={ref} className={clsx(base, sizes[size], variants[variant], className)} disabled={disabled || loading} {...rest}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, leftIcon, className, ...rest }, ref) => (
        <div className="w-full">
            {label && <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">{label}</label>}
            <div className="relative">
                {leftIcon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{leftIcon}</span>
                )}
                <input
                    ref={ref}
                    className={clsx(
                        'w-full bg-white/[0.04] border rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm',
                        'focus:outline-none focus:ring-1 transition-all duration-150',
                        leftIcon && 'pl-10',
                        error
                            ? 'border-red-500/50 focus:border-red-500/80 focus:ring-red-500/20'
                            : 'border-white/[0.1] focus:border-teal-400/60 focus:ring-teal-400/10',
                        className
                    )}
                    {...rest}
                />
            </div>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    )
);
Input.displayName = 'Input';

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Array<{ value: string; label: string }>;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className, ...rest }, ref) => (
        <div className="w-full">
            {label && <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">{label}</label>}
            <select
                ref={ref}
                className={clsx(
                    'w-full bg-white/[0.04] border rounded-xl px-4 py-2.5 text-white text-sm',
                    'focus:outline-none focus:ring-1 transition-all duration-150',
                    '[&>option]:bg-slate-900',
                    error ? 'border-red-500/50' : 'border-white/[0.1] focus:border-teal-400/60 focus:ring-teal-400/10',
                    className
                )}
                {...rest}
            >
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    )
);
Select.displayName = 'Select';

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className, ...rest }, ref) => (
        <div className="w-full">
            {label && <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">{label}</label>}
            <textarea
                ref={ref}
                className={clsx(
                   'w-full bg-white/[0.04] border rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm resize-none',
                    'focus:outline-none focus:ring-1 transition-all duration-150',
                    error ? 'border-red-500/50' : 'border-white/[0.1] focus:border-teal-400/60 focus:ring-teal-400/10',
                    className
                )}
                {...rest}
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    )
);
Textarea.displayName = 'Textarea';

// Card
export function Card({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={clsx('bg-[#111827] border border-white/[0.07] rounded-2xl', className)}>
            {children}
        </div>
    );
}

// Badge
type BadgeVariant = 'teal' | 'navy' | 'amber' | 'red' | 'slate' | 'purple';
const badgeMap: Record<BadgeVariant, string> = {
    teal:   'text-teal-300 bg-teal-400/10 border-teal-400/20',
    navy:   'text-blue-300 bg-blue-500/10 border-blue-400/20',
    amber:  'text-amber-300 bg-amber-400/10 border-amber-400/20',
    red:    'text-red-300 bg-red-400/10 border-red-400/20',
    slate:  'text-slate-300 bg-white/[0.05] border-white/[0.1]',
    purple: 'text-purple-300 bg-purple-400/10 border-purple-400/20',
};
export function Badge({ children, variant = 'slate' }: { children: ReactNode; variant?: BadgeVariant }) {
    return (
        <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', badgeMap[variant])}>
            {children}
        </span>
    );
}

// Spinner
export function Spinner({ size = 20 }: { size?: number }) {
    return <Loader2 size={size} className="animate-spin text-teal-400" />;
}

// Page header
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
    return (
        <div className="flex items-start justify-between mb-6 gap-4">
            <div>
                <h1 className="font-display text-2xl text-white">{title}</h1>
                {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}

// Stat card
export function StatCard({ label, value, icon, color = 'teal' }:
    { label: string; value: string | number; icon: ReactNode; color?: 'teal' | 'navy' | 'amber' | 'red'; }
) {
    const colors = {
        teal:  'text-teal-400 bg-teal-400/10',
        navy:  'text-blue-400 bg-blue-400/10',
        amber: 'text-amber-400 bg-amber-400/10',
        red:   'text-red-400 bg-red-400/10',
    };
    return (
        <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</span>
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', colors[color])}>{icon}</div>
            </div>
            <p className="font-display text-3xl text-white">{value}</p>
        </Card>
    );
}

// Empty state
export function EmptyState({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-slate-600 mb-3">{icon}</div>
            <p className="text-slate-300 font-medium">{title}</p>
            {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>
    );
}

// Status badge for appointments
const statusMap: Record<string, BadgeVariant> = {
    pending: 'amber', confirmed: 'teal', completed: 'navy',
    cancelled: 'red', no_show: 'slate',
};
export function StatusBadge({ status }: { status: string }) {
    return <Badge variant={statusMap[status] ?? 'slate'}>{status.replace('_', ' ')}</Badge>;
}
