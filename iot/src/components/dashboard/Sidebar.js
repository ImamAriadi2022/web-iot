import React from 'react';
import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaMapMarkerAlt, FaDownload, FaHome } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div
      style={{
        width: '250px',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        position: 'fixed',
        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img
          src="/img/logo.png" // Ganti dengan path logo Anda
          alt="Logo"
          style={{ width: '150px', marginBottom: '10px' }}
        />
        <hr />
      </div>

      {/* Menu Items */}
      <nav>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px' }}>
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FaHome style={{ marginRight: '10px' }} />
              Go Home
            </Link>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <Link
              to="/dashboard/"
              style={{
                textDecoration: 'none',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FaTachometerAlt style={{ marginRight: '10px' }} />
              Dashboard
            </Link>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <Link
              to="/dashboard/station1"
              style={{
                textDecoration: 'none',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FaMapMarkerAlt style={{ marginRight: '10px' }} />
              Station 1
            </Link>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <Link
              to="/dashboard/station2"
              style={{
                textDecoration: 'none',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FaMapMarkerAlt style={{ marginRight: '10px' }} />
              Station 2
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/download"
              style={{
                textDecoration: 'none',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FaDownload style={{ marginRight: '10px' }} />
              Download Data
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;