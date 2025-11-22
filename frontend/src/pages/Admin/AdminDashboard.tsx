import React, { useState } from 'react';
import AdminHeader from '../../component/AdminDashboard/AdminHeader';
import Sidebar from '../../component/Sidebar/Sidebar';

const AdminDashboard: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="admin-dashboard-page">
            <AdminHeader onHamburgerClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
    );
};

export default AdminDashboard;
