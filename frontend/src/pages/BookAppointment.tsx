import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { getDoctors, bookAppointment, getSlots } from '../services/api';
import { PageHeader, Card, Button, Textarea, Spinner, Badge } from '../components/UIComponents';
import toast from 'react-hot-toast';
import type { TimeSlot } from '../types/appointment.types';

export default function BookAppointmentPage() {
    const navigate = useNavigate();
    const qc = useQueryClient();

    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [selectedSlot, setSelectedSlot] = useState<string>('');
    const [reason, setReason] = useState('');
    const [step, setStep] = useState<1|2|3>(1);

    const { data: doctorsData, isLoading: docLoading } = useQuery({
        queryKey: ['doctors'],
        queryFn:  () => getDoctors(),
    });

    const { data: slotsData, isLoading: slotsLoading } = useQuery({
        queryKey: ['slots', selectedDoctor, format(selectedDate, 'yyyy-MM-dd')],
        queryFn:  () => getSlots(selectedDoctor, format(selectedDate, 'yyyy-MM-dd')),
        enabled:  !!selectedDoctor,
    });

    const bookMutation = useMutation({
        mutationFn: () => bookAppointment({
            doctorId: selectedDoctor,
            scheduledAt: selectedSlot,
            reason,
            type: 'video',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
        onSuccess: () => {
            toast.success('Appointment booked!');
            qc.invalidateQueries({ queryKey: ['appointments'] });
            navigate('/patient/appointments');
        },
    });

    const doctors = doctorsData ?? [];
    const slots: TimeSlot[] = slotsData?.data?.data?.slots ?? [];
    const selDoc = doctors.find((d: any) => d._id === selectedDoctor);

    return (
        <div className="max-w-2xl">
            <PageHeader title="Book Appointment" subtitle="Schedule a secure video consultation" />
            <div className="flex items-center gap-3 mb-8">
                {[['1', 'Choose Doctor'], ['2', 'Pick Time'], ['3', 'Confirm']].map(([n, label], i) => (
                    <div key={n} className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 ${i + 1 <= step ? 'text-teal-400' : 'text-slate-600'}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                                i + 1 < step  ? 'bg-teal-400 border-teal-400 text-slate-950' :
                                i + 1 === step ? 'border-teal-400 text-teal-400' : 'border-slate-700 text-slate-600'
                            }`}>{n}</div>
                            <span className="text-sm font-medium hidden sm:block">{label}</span>
                        </div>
                        {i < 2 && <div className={`flex-1 h-px w-8 ${i + 1 < step ? 'bg-teal-400' : 'bg-slate-800'}`} />}
                    </div>
                ))}
            </div>
            {step === 1 && (
                <Card className="p-6">
                    <h3 className="font-medium text-white mb-4">Select a doctor</h3>
                    {docLoading ? <div className="flex justify-center py-8"><Spinner /></div> : (
                        <div className="space-y-2">
                            {doctors.map((doc: any) => (
                                <button
                                    key={doc._id}
                                    onClick={() => setSelectedDoctor(doc._id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                                        selectedDoctor === doc._id
                                        ? 'border-teal-400/50 bg-teal-400/8'
                                        : 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05]'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400/20 to-navy-600/20 flex items-center justify-center shrink-0">
                                        <User size={18} className="text-teal-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-medium">Dr. {doc.fname} {doc.lname}</p>
                                        <p className="text-slate-400 text-xs">{doc.profile?.specialization ?? 'General Physician'}</p>
                                        {doc.profile?.consultationFee > 0 && (
                                            <p className="text-teal-400 text-xs mt-0.5">₹{doc.profile.consultationFee} / session</p>
                                        )}
                                    </div>
                                    {doc.profile?.rating > 0 && (
                                        <Badge variant="amber">{doc.profile.rating.toFixed(1)}</Badge>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-end mt-6">
                        <Button onClick={() => setStep(2)} disabled={!selectedDoctor}>Next →</Button>
                    </div>
                </Card>
            )}

            {step === 2 && (
                <Card className="p-6">
                    <h3 className="font-medium text-white mb-4">Choose date & time</h3>
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setSelectedDate(d => addDays(d, -1))}
                            disabled={selectedDate <= startOfToday()}
                            className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="text-center">
                            <p className="text-white font-medium">{format(selectedDate, 'EEEE')}</p>
                            <p className="text-slate-400 text-sm">{format(selectedDate, 'dd MMMM yyyy')}</p>
                        </div>
                        <button
                            onClick={() => setSelectedDate(d => addDays(d, 1))}
                            className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
            
                    {slotsLoading ? <div className="flex justify-center py-6"><Spinner /></div> : (
                        <div className="grid grid-cols-4 gap-2">
                            {slots.map((slot) => {
                                const timeLabel = format(new Date(slot.time), 'HH:mm');
                                return (
                                    <button
                                        key={slot.time}
                                        disabled={!slot.available}
                                        onClick={() => setSelectedSlot(slot.time)}
                                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                                            !slot.available     ? 'text-slate-600 bg-white/[0.02] cursor-not-allowed' :
                                            selectedSlot === slot.time ? 'bg-teal-400 text-slate-950' :
                                                                'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]'
                                        }`}
                                    >
                                        {timeLabel}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    <div className="flex justify-between mt-6">
                        <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                        <Button onClick={() => setStep(3)} disabled={!selectedSlot}>Next →</Button>
                    </div>
                </Card>
            )}

            {step === 3 && (
                <Card className="p-6">
                    <h3 className="font-medium text-white mb-4">Confirm booking</h3>
                    <div className="space-y-3 mb-5 p-4 bg-white/[0.03] rounded-xl border border-white/[0.07]">
                        <div className="flex items-center gap-3">
                            <User size={16} className="text-teal-400 shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500">Doctor</p>
                                <p className="text-white text-sm font-medium">
                                    Dr. {selDoc?.firstName} {selDoc?.lastName}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-teal-400 shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500">Date & Time</p>
                                <p className="text-white text-sm font-medium">
                                    {selectedSlot ? format(new Date(selectedSlot), 'PPp') : '—'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock size={16} className="text-teal-400 shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500">Duration</p>
                                <p className="text-white text-sm font-medium">30 minutes • Video consultation</p>
                            </div>
                        </div>
                    </div>
                    <Textarea
                        label="Reason for visit"
                        placeholder="Describe your symptoms or reason for the appointment..."
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={3}
                    />

                    <div className="flex justify-between mt-6">
                        <Button variant="ghost" onClick={() => setStep(2)}>← Back</Button>
                        <Button
                            onClick={() => bookMutation.mutate()}
                            loading={bookMutation.isPending}
                            disabled={!reason.trim()}
                        >
                            Confirm Booking
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
