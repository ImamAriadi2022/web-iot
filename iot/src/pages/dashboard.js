import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardSect from '../components/dashboard/Dashboardsect';
import Station1 from '../components/dashboard/Station1';
import Station2 from '../components/dashboard/Station2';
import Download from '../components/dashboard/Download';

const Dashboard = () => {
  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ marginLeft: '250px', width: '100%' }}>
        <Routes>
          {/* Dashboard Section */}
          <Route path="/" element={<DashboardSect />} />

          {/* Station 1 */}
          <Route path="/station1" element={<Station1 />} />

          {/* Station 2 */}
            <Route path="/station2" element={<Station2 />} />

          {/* Download Data */}
            <Route path="/download" element={<Download />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;