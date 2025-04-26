import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { Route, Routes } from 'react-router-dom';
import DashboardSect from '../components/sebesi/Dashboardsect';
import Download from '../components/sebesi/Download';
import Sidebar from '../components/sebesi/Sidebar';
import Station1 from '../components/sebesi/Station1';
import Station2 from '../components/sebesi/Station2';

const Sebesi = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Tombol Toggle Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: isSidebarOpen ? '260px' : '20px', // Posisi tombol berubah berdasarkan status sidebar
          zIndex: 1000,
          cursor: 'pointer',
          transition: '0.3s',
        }}
        onClick={toggleSidebar}
      >
        <FaBars style={{ fontSize: '24px', color: '#007bff' }} />
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: isSidebarOpen ? '250px' : '0', // Konten utama menyesuaikan posisi sidebar
          width: '100%',
          transition: '0.3s',
        }}
      >
        <Routes>
          {/* sebesi Section */}
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

export default Sebesi;