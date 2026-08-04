import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen w-full flex" style={{ background: '#F8FAFC' }}>
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-screen">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
