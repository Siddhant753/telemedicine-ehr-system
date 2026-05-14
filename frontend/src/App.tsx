import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/Authcontext';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import DashboardLayout from './pages/Layout';
import VerifyEmailPage from './pages/VerifyEmail';
import PatientDashboard from './pages/PatientDashboard';

function RequireAuth({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) {
        return <div>Loading...</div>;
    }

    return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireRole({ children, role }: { children: React.ReactNode; role: string | string[] }) {
    const { user } = useAuth();
    const allowed = Array.isArray(role) ? role.includes(user?.role ?? '') : user?.role === role;
    return allowed ? <>{children}</> : <Navigate to="/" replace />;
}

function RootRedirect() {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/login" replace />;

    switch (user.role) {
        case 'doctor':
            return <Navigate to="/doctor/dashboard" replace />;

        case 'admin':
            return <Navigate to="/admin/dashboard" replace />;

        default:
            return <Navigate to="/patient/dashboard" replace />;
    }
}

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login"    element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                <Route path="/" element={<RootRedirect />} />

                <Route path="/patient" element={
                    <RequireAuth><RequireRole role="patient">
                        <DashboardLayout />
                    </RequireRole></RequireAuth>
                }>
                    <Route path="dashboard"     element={<PatientDashboard />} />
            {/* 
            <Route path="book"          element={<BookAppointmentPage />} />
            <Route path="appointments"  element={<MyAppointmentsPage />} />
            <Route path="ehr"           element={<MyEHRPage />} />
            <Route path="prescriptions" element={<MyPrescriptionsPage />} /> */}
                </Route>

                <Route path="/doctor" element={
                    <RequireAuth><RequireRole role="doctor">
                        <DashboardLayout />
                    </RequireRole></RequireAuth>
                }>
            {/* <Route path="dashboard"          element={<DoctorDashboard />} />
            <Route path="appointments"       element={<DoctorAppointmentsPage />} />
            <Route path="patients"           element={<PatientRecordsPage />} />
            <Route path="ehr/create"         element={<CreateEHRPage />} />
            <Route path="prescriptions/new"  element={<IssuePrescriptionPage />} /> */}
                </Route>

                <Route path="/admin" element={
                    <RequireAuth><RequireRole role="admin">
                        <DashboardLayout />
                    </RequireRole></RequireAuth>
                }>
            {/* <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users"     element={<AdminUsersPage />} /> */}
                </Route>

                {/* <Route path="/room/:roomId" element={
                    <RequireAuth><VideoRoomPage /></RequireAuth>
                } /> */}

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}