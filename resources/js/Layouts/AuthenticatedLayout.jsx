import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function AuthenticatedLayout({ children }) {
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    );
}
