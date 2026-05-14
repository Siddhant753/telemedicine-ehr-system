import { useQuery } from '@tanstack/react-query';
import { Calendar, FileText, Pill, Video, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
// import { ehrApi, prescriptionApi } from '@/services/api';
import { getAppointments } from '../services/api';
import { useAuth } from '../context/Authcontext';
import { StatCard, Card, Badge, StatusBadge, PageHeader, EmptyState, Spinner } from '../components/UIComponents';
import { format } from 'date-fns';
import type { Appointment } from '../types/appointment.types';
// import type { EHRRecord, Prescription } from '@/types';

export default function PatientDashboard() {
    const { user } = useAuth();

    const { data: apptData, isLoading: apptLoading } = useQuery({
        queryKey: ['appointments'],
        queryFn: () => getAppointments(),
    });

    // const { data: ehrData } = useQuery({
    //     queryKey: ['ehr', user?._id],
    //     queryFn: () => ehrApi.getPatient(user!._id, { limit: 3 }),
    //     enabled: !!user?._id,
    // });

    // const { data: rxData } = useQuery({
    //     queryKey: ['prescriptions', user?._id],
    //     queryFn: () => prescriptionApi.getPatient(user!._id),
    //     enabled: !!user?._id,
    // });

    const appointments: Appointment[] = apptData?.data?.data?.appointments ?? [];
    // const ehrRecords:   EHRRecord[]   = ehrData?.data?.data?.records ?? [];
    // const rxList:       Prescription[]= rxData?.data?.data?.prescriptions ?? [];

    const nextAppt = appointments.find(a => a.status === 'confirmed' && new Date(a.scheduledAt) > new Date());

    return (
        <div>
            <PageHeader
                title={`Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${user?.fname}`}
                subtitle="Here's your health summary"
                action={
                    <Link to="/patient/book">
                        <button className="btn-primary bg-teal-400 hover:bg-teal-200 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all">
                            <Video size={15} /> Book Consultation
                        </button>
                    </Link>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Appointments" value={appointments.length} icon={<Calendar size={16} />} color="teal" />
                {/* <StatCard label="EHR Records"  value={ehrRecords.length}   icon={<FileText size={16} />} color="navy" />
                <StatCard label="Prescriptions" value={rxList.length}      icon={<Pill size={16} />}     color="amber" /> */}
                <StatCard label="Upcoming"
                    value={appointments.filter(a => a.status === 'confirmed').length}
                    icon={<Clock size={16} />} color="red" />
            </div>

            {nextAppt && (
                <Card className="mb-6 p-5 border-teal-400/20 bg-gradient-to-r from-teal-400/5 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-teal-400/15 flex items-center justify-center">
                                <Video size={18} className="text-teal-400" />
                            </div>
                            <div>
                                <p className="text-xs text-teal-400 font-medium uppercase tracking-wide mb-0.5">Next appointment</p>
                                <p className="text-white font-medium">
                                    Dr. {(nextAppt.doctorId as any).firstName} {(nextAppt.doctorId as any).lastName}
                                </p>
                                <p className="text-slate-400 text-sm">
                                    {format(new Date(nextAppt.scheduledAt), 'PPp')}
                                </p>
                            </div>
                        </div>
                        <Link to="/patient/appointments">
                            <button className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300 text-sm transition-colors">
                                Join Room <ArrowRight size={14} />
                            </button>
                        </Link>
                    </div>
                </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-white">Recent Appointments</h3>
                        <Link to="/patient/appointments" className="text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1">
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>
                    {apptLoading ? (
                        <div className="flex justify-center py-8"><Spinner /></div>
                    ) : appointments.length === 0 ? (
                        <EmptyState icon={<Calendar size={32} />} title="No appointments yet" subtitle="Book your first consultation" />
                    ) : (
                        <div className="space-y-2">
                            {appointments.slice(0, 4).map(a => (
                                <div key={a._id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                                    <div>
                                        <p className="text-sm text-white font-medium">
                                            Dr. {(a.doctorId as any).firstName ?? '—'} {(a.doctorId as any).lastName ?? ''}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">{format(new Date(a.scheduledAt), 'PPp')}</p>
                                    </div>
                                    <StatusBadge status={a.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-white">Health Records</h3>
                        <Link to="/patient/ehr" className="text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1">
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>
                    {/* {ehrRecords.length === 0 ? (
                        <EmptyState icon={<FileText size={32} />} title="No records yet" />
                    ) : (
                        <div className="space-y-2">
                            {ehrRecords.map(r => (
                                <div key={r._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                                    <div className="w-8 h-8 rounded-lg bg-navy-600/20 flex items-center justify-center shrink-0">
                                        <FileText size={14} className="text-blue-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm text-white font-medium truncate">{r.recordNumber}</p>
                                        <p className="text-xs text-slate-500">{r.recordType} · {format(new Date(r.date), 'PP')}</p>
                                    </div>
                                    <Badge variant="navy" >{r.recordType}</Badge>
                                </div>
                            ))}
                        </div>
                    )} */}
                </Card>
            </div>
        </div>
    );
}