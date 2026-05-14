import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, CheckCircle, Clock, Video, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { StatCard, Card, Button, StatusBadge, EmptyState, Spinner, PageHeader } from "../components/UIComponents";
import toast from 'react-hot-toast';
import type { Appointment } from '../types/appointment.types';
import { useAuth } from '../context/Authcontext';
import { getAppointments, getRoomToken, updateAppointmentStatus } from '../services/api';

export default function DoctorDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['appointments'],
        queryFn:  () => getAppointments(),
    });

    const confirmMutation = useMutation({
        mutationFn: (id: string) => updateAppointmentStatus(id, { status: 'confirmed' }),
        onSuccess: () => { toast.success('Appointment confirmed'); qc.invalidateQueries({ queryKey: ['appointments'] }); },
    });

    const getRoomMutation = useMutation({
        mutationFn: (id: string) => getRoomToken(id),
        onSuccess: (res) => navigate(`/room/${res.data.data.roomId}`),
    });

    const appointments: Appointment[] = data?.data?.data?.appointments ?? [];
    const pending   = appointments.filter(a => a.status === 'pending');
    const confirmed = appointments.filter(a => a.status === 'confirmed');
    const today     = appointments.filter(a => {
        const d = new Date(a.scheduledAt);
        const n = new Date();
        return d.toDateString() === n.toDateString();
    });

    return (
        <div>
            <PageHeader
                title={`Welcome, Dr. ${user?.fname}`}
                subtitle="Your consultation schedule"
                action={
                    <Button onClick={() => navigate('/doctor/appointments')} variant="secondary" icon={<Calendar size={14} />}>
                        Full Schedule
                    </Button>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total"     value={appointments.length} icon={<Calendar size={16} />} color="teal" />
                <StatCard label="Pending"   value={pending.length}      icon={<Clock size={16} />}    color="amber" />
                <StatCard label="Confirmed" value={confirmed.length}    icon={<Video size={16} />}    color="navy" />
                <StatCard label="Today"     value={today.length}        icon={<CheckCircle size={16} />} color="red" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending Approval
                    </h3>
                    <span className="text-xs text-slate-500">{pending.length} requests</span>
                </div>
                {isLoading ? 
                    <div className="flex justify-center py-8"><Spinner /></div>
                    : pending.length === 0 ? <EmptyState icon={<CheckCircle size={28} />} title="No pending requests" />
                    : (
                        <div className="space-y-2">
                            {pending.slice(0, 5).map(a => {
                                const pat = a.patientId as any;
                                return (
                                    <div key={a._id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                                        <div>
                                            <p className="text-white text-sm font-medium">{pat?.firstName} {pat?.lastName}</p>
                                            <p className="text-slate-500 text-xs">{format(new Date(a.scheduledAt), 'PPp')}</p>
                                            <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[180px]">{a.reason}</p>
                                        </div>
                                        <Button size="sm" loading={confirmMutation.isPending}
                                            onClick={() => confirmMutation.mutate(a._id)}>
                                            Confirm
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>

                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" /> Today's Consultations
                        </h3>
                        <Button size="sm" variant="ghost" icon={<ArrowRight size={13} />}
                            onClick={() => navigate('/doctor/appointments')}>All</Button>
                    </div>
                    {today.length === 0 ? <EmptyState icon={<Calendar size={28} />} title="No consultations today" />
                    : (
                        <div className="space-y-2">
                            {today.map(a => {
                                const pat = a.patientId as any;
                                return (
                                    <div key={a._id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                                        <div>
                                            <p className="text-white text-sm font-medium">{pat?.firstName} {pat?.lastName}</p>
                                            <p className="text-slate-500 text-xs">{format(new Date(a.scheduledAt), 'p')}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={a.status} />
                                            {a.status === 'confirmed' && (
                                                <Button size="sm" icon={<Video size={12} />}
                                                    loading={getRoomMutation.isPending}
                                                    onClick={() => getRoomMutation.mutate(a._id)}>
                                                    Join
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
