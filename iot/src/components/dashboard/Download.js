import React, { useState } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Download = () => {
  const [selectedStation, setSelectedStation] = useState('Station 1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fileFormat, setFileFormat] = useState('excel');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State untuk autentikasi
  const [showLoginPopup, setShowLoginPopup] = useState(false); // State untuk menampilkan pop-up login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      setShowLoginPopup(false); // Tutup pop-up setelah login berhasil
    } else {
      setError('Invalid username or password');
    }
  };

  const handleDownloadClick = () => {
    if (!isAuthenticated) {
      setShowLoginPopup(true); // Tampilkan pop-up login jika belum login
    } else {
      handleDownload(); // Lanjutkan ke proses download jika sudah login
    }
  };

  const handleDownload = () => {
    if (!startDate || !endDate) {
      alert('Please select both start date and end date.');
      return;
    }

    const data = filterDataByDate(getStationData());

    if (data.length === 0) {
      alert('No data available for the selected date range.');
      return;
    }

    if (fileFormat === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `${selectedStation}_data.xlsx`);
    } else if (fileFormat === 'pdf') {
      const doc = new jsPDF();
      doc.text(`${selectedStation} Data`, 10, 10);
      doc.autoTable({
        head: [Object.keys(data[0])],
        body: data.map((item) => Object.values(item)),
      });
      doc.save(`${selectedStation}_data.pdf`);
    }
  };

  const getStationData = () => {
    return selectedStation === 'Station 1' ? station1Data : station2Data;
  };

  const filterDataByDate = (data) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return data.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= start && itemDate <= end;
    });
  };

  // Data untuk Station 1 dan Station 2
  const station1Data = [
    { timestamp: '2025-03-01', humidity: 65, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 21, rainfall: 10, windspeed: 15, windDirection: 0 },
    { timestamp: '2025-03-02', humidity: 70, temperature: 30, airPressure: 1010, irradiation: 520, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 12 },
    { timestamp: '2025-03-03', humidity: 60, temperature: 27, airPressure: 1015, irradiation: 480, oxygen: 20.9, rainfall: 8, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-03-04', humidity: 75, temperature: 29, airPressure: 1011, irradiation: 510, oxygen: 20.7, rainfall: 12, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-03-05', humidity: 68, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-03-06', humidity: 72, temperature: 31, airPressure: 1010, irradiation: 530, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-03-07', humidity: 66, temperature: 28, airPressure: 1014, irradiation: 495, oxygen: 20.9, rainfall: 9, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-03-08', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 505, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-03-09', humidity: 63, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 11, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-03-10', humidity: 74, temperature: 30, airPressure: 1011, irradiation: 520, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-03-11', humidity: 67, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 8, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-03-12', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 7, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-03-13', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-03-14', humidity: 68, temperature: 29, airPressure: 1012, irradiation: 510, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-03-15', humidity: 62, temperature: 27, airPressure: 1016, irradiation: 480, oxygen: 21, rainfall: 12, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-03-16', humidity: 73, temperature: 30, airPressure: 1011, irradiation: 525, oxygen: 20.7, rainfall: 14, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-03-17', humidity: 66, temperature: 26, airPressure: 1013, irradiation: 495, oxygen: 21, rainfall: 9, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-03-18', humidity: 70, temperature: 31, airPressure: 1010, irradiation: 535, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-03-19', humidity: 65, temperature: 28, airPressure: 1014, irradiation: 505, oxygen: 20.9, rainfall: 11, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-03-20', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 515, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-03-21', humidity: 61, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 8, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-03-22', humidity: 72, temperature: 30, airPressure: 1011, irradiation: 530, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-03-23', humidity: 67, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-03-24', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-03-25', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-03-26', humidity: 68, temperature: 29, airPressure: 1012, irradiation: 510, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-03-27', humidity: 62, temperature: 27, airPressure: 1016, irradiation: 480, oxygen: 21, rainfall: 12, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-03-28', humidity: 73, temperature: 30, airPressure: 1011, irradiation: 525, oxygen: 20.7, rainfall: 14, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-03-29', humidity: 66, temperature: 26, airPressure: 1013, irradiation: 495, oxygen: 21, rainfall: 9, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-03-30', humidity: 70, temperature: 31, airPressure: 1010, irradiation: 535, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-03-31', humidity: 65, temperature: 28, airPressure: 1014, irradiation: 505, oxygen: 20.9, rainfall: 11, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-04-01', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 515, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-04-02', humidity: 61, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 8, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-04-03', humidity: 72, temperature: 30, airPressure: 1011, irradiation: 530, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-04-04', humidity: 67, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-04-05', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-04-06', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-04-07', humidity: 68, temperature: 29, airPressure: 1012, irradiation: 510, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-04-08', humidity: 62, temperature: 27, airPressure: 1016, irradiation: 480, oxygen: 21, rainfall: 12, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-04-09', humidity: 73, temperature: 30, airPressure: 1011, irradiation: 525, oxygen: 18, rainfall: 14, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-04-10', humidity: 66, temperature: 26, airPressure: 1013, irradiation: 495, oxygen: 21, rainfall: 9, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-04-11', humidity: 70, temperature: 31, airPressure: 1010, irradiation: 535, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-04-12', humidity: 65, temperature: 28, airPressure: 1014, irradiation: 505, oxygen: 20.9, rainfall: 11, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-04-13', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 515, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-04-14', humidity: 61, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 8, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-04-15', humidity: 72, temperature: 30, airPressure: 1011, irradiation: 530, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-04-16', humidity: 67, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-04-17', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-04-18', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-04-19', humidity: 68, temperature: 29, airPressure: 1012, irradiation: 510, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-04-20', humidity: 62, temperature: 27, airPressure: 1016, irradiation: 480, oxygen: 21, rainfall: 12, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-04-21', humidity: 73, temperature: 30, airPressure: 1011, irradiation: 525, oxygen: 20.7, rainfall: 14, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-04-22', humidity: 66, temperature: 26, airPressure: 1013, irradiation: 495, oxygen: 21, rainfall: 9, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-04-23', humidity: 70, temperature: 31, airPressure: 1010, irradiation: 535, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-04-24', humidity: 65, temperature: 28, airPressure: 1014, irradiation: 505, oxygen: 20.9, rainfall: 11, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-04-25', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 515, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-04-26', humidity: 61, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 8, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-04-27', humidity: 72, temperature: 30, airPressure: 1011, irradiation: 530, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-04-28', humidity: 67, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-04-29', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-04-30', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-05-01', humidity: 68, temperature: 29, airPressure: 1012, irradiation: 510, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-05-02', humidity: 62, temperature: 27, airPressure: 1016, irradiation: 480, oxygen: 21, rainfall: 12, windspeed: 12, windDirection: 90 },
  ];
  
  const station2Data = [
    { timestamp: '2025-03-01', humidity: 65, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 21, rainfall: 10, windspeed: 15, windDirection: 0 },
    { timestamp: '2025-03-02', humidity: 70, temperature: 30, airPressure: 1010, irradiation: 520, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 12 },
    { timestamp: '2025-03-03', humidity: 60, temperature: 27, airPressure: 1015, irradiation: 480, oxygen: 20.9, rainfall: 8, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-03-04', humidity: 75, temperature: 29, airPressure: 1011, irradiation: 510, oxygen: 20.7, rainfall: 12, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-03-05', humidity: 68, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-03-06', humidity: 72, temperature: 31, airPressure: 1010, irradiation: 530, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-03-07', humidity: 66, temperature: 28, airPressure: 1014, irradiation: 495, oxygen: 20.9, rainfall: 9, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-03-08', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 505, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-03-09', humidity: 63, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 11, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-03-10', humidity: 74, temperature: 30, airPressure: 1011, irradiation: 520, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-03-11', humidity: 67, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 8, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-03-12', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 7, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-03-13', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-03-14', humidity: 68, temperature: 29, airPressure: 1012, irradiation: 510, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-03-15', humidity: 62, temperature: 27, airPressure: 1016, irradiation: 480, oxygen: 21, rainfall: 12, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-03-16', humidity: 73, temperature: 30, airPressure: 1011, irradiation: 525, oxygen: 20.7, rainfall: 14, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-03-17', humidity: 66, temperature: 26, airPressure: 1013, irradiation: 495, oxygen: 21, rainfall: 9, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-03-18', humidity: 70, temperature: 31, airPressure: 1010, irradiation: 535, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-03-19', humidity: 65, temperature: 28, airPressure: 1014, irradiation: 505, oxygen: 20.9, rainfall: 11, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-03-20', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 515, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-03-21', humidity: 61, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 8, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-03-22', humidity: 72, temperature: 30, airPressure: 1011, irradiation: 530, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-03-23', humidity: 67, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-03-24', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-03-25', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-03-26', humidity: 68, temperature: 29, airPressure: 1012, irradiation: 510, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-03-27', humidity: 62, temperature: 27, airPressure: 1016, irradiation: 480, oxygen: 21, rainfall: 12, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-03-28', humidity: 73, temperature: 30, airPressure: 1011, irradiation: 525, oxygen: 20.7, rainfall: 14, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-03-29', humidity: 66, temperature: 26, airPressure: 1013, irradiation: 495, oxygen: 21, rainfall: 9, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-03-30', humidity: 70, temperature: 31, airPressure: 1010, irradiation: 535, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-03-31', humidity: 65, temperature: 28, airPressure: 1014, irradiation: 505, oxygen: 20.9, rainfall: 11, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-04-01', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 515, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-04-02', humidity: 61, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 8, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-04-03', humidity: 72, temperature: 30, airPressure: 1011, irradiation: 530, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-04-04', humidity: 67, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-04-05', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-04-06', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-04-07', humidity: 68, temperature: 29, airPressure: 1012, irradiation: 510, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-04-08', humidity: 62, temperature: 27, airPressure: 1016, irradiation: 480, oxygen: 21, rainfall: 12, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-04-09', humidity: 73, temperature: 30, airPressure: 1011, irradiation: 525, oxygen: 18, rainfall: 14, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-04-10', humidity: 66, temperature: 26, airPressure: 1013, irradiation: 495, oxygen: 21, rainfall: 9, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-04-11', humidity: 70, temperature: 31, airPressure: 1010, irradiation: 535, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-04-12', humidity: 65, temperature: 28, airPressure: 1014, irradiation: 505, oxygen: 20.9, rainfall: 11, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-04-13', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 515, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-04-14', humidity: 61, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 8, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-04-15', humidity: 72, temperature: 30, airPressure: 1011, irradiation: 530, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-04-16', humidity: 67, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-04-17', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-04-18', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-04-19', humidity: 68, temperature: 29, airPressure: 1012, irradiation: 510, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-04-20', humidity: 62, temperature: 27, airPressure: 1016, irradiation: 480, oxygen: 21, rainfall: 12, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-04-21', humidity: 73, temperature: 30, airPressure: 1011, irradiation: 525, oxygen: 20.7, rainfall: 14, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-04-22', humidity: 66, temperature: 26, airPressure: 1013, irradiation: 495, oxygen: 21, rainfall: 9, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-04-23', humidity: 70, temperature: 31, airPressure: 1010, irradiation: 535, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-04-24', humidity: 65, temperature: 28, airPressure: 1014, irradiation: 505, oxygen: 20.9, rainfall: 11, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-04-25', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 515, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-04-26', humidity: 61, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 8, windspeed: 12, windDirection: 90 },
    { timestamp: '2025-04-27', humidity: 72, temperature: 30, airPressure: 1011, irradiation: 530, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 180 },
    { timestamp: '2025-04-28', humidity: 67, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 270 },
    { timestamp: '2025-04-29', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 315 },
    { timestamp: '2025-04-30', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 0 },
    { timestamp: '2025-05-01', humidity: 68, temperature: 29, airPressure: 1012, irradiation: 510, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 45 },
    { timestamp: '2025-05-02', humidity: 62, temperature: 27, airPressure: 1016, irradiation: 480, oxygen: 21, rainfall: 12, windspeed: 12, windDirection: 90 },
  ];
  

  return (
    <Container style={{ marginTop: '20px' }}>
      {/* Pop-up Login */}
      {showLoginPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
              width: '300px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ marginBottom: '20px', color: '#007bff' }}>Login</h3>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
            {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Row>
        <Col>
          <h3 className="text-center fw-bold text-primary">Download Data</h3>
        </Col>
      </Row>

      <Row className="mt-4 d-flex justify-content-center">
        <Col md={6} className="text-center">
          <Button
            variant={selectedStation === 'Station 1' ? 'primary' : 'outline-primary'}
            onClick={() => setSelectedStation('Station 1')}
            className={`me-3 px-4 py-2 fw-bold shadow-sm ${selectedStation === 'Station 1' ? 'active-btn' : ''}`}
          >
            Station 1
          </Button>
          <Button
            variant={selectedStation === 'Station 2' ? 'primary' : 'outline-primary'}
            onClick={() => setSelectedStation('Station 2')}
            className={`px-4 py-2 fw-bold shadow-sm ${selectedStation === 'Station 2' ? 'active-btn' : ''}`}
          >
            Station 2
          </Button>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Form.Group controlId="startDate">
            <Form.Label className="fw-bold">Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-control-custom shadow-sm"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="endDate">
            <Form.Label className="fw-bold">End Date</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-control-custom shadow-sm"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Form.Group controlId="fileFormat">
            <Form.Label className="fw-bold">Select File Format</Form.Label>
            <Form.Check
              type="radio"
              label="Excel"
              name="fileFormat"
              value="excel"
              checked={fileFormat === 'excel'}
              onChange={(e) => setFileFormat(e.target.value)}
              className="fw-semibold"
            />
            <Form.Check
              type="radio"
              label="PDF"
              name="fileFormat"
              value="pdf"
              checked={fileFormat === 'pdf'}
              onChange={(e) => setFileFormat(e.target.value)}
              className="fw-semibold"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col className="text-center">
          <Button
            variant="success"
            onClick={handleDownloadClick} // Gunakan handleDownloadClick untuk memeriksa autentikasi
            className="px-5 py-2 fw-bold shadow-lg download-btn"
          >
            Download Data
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Download;