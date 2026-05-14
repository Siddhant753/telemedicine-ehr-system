import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useState } from 'react';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}