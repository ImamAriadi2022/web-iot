import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, ButtonGroup, Button } from 'react-bootstrap';
import { FaThermometerHalf, FaTint, FaTachometerAlt, FaSun } from 'react-icons/fa';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

import TrendChart from "./chart";

// memasukan komponen yang dibutuhkan
import TemperatureGauge from './status/TemperaturGauge';
import HumidityGauge from './status/HumidityGauge';
import AirPressureGauge from './status/AirPressure';
import WindSpeedGauge from './status/WindSpeed';
import IrradiationGauge from './status/Irradiation';
import OxygenGauge from './status/Oxygen';
import RainfallGauge from './status/Rainfall';
import WindDirectionGauge from './status/WindDirection';
import WaterTemperatureGauge from './status/WaterTemperature'


const allData = [
  { timestamp: '2025-04-25T16:00:00', humidity: 65, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 21, rainfall: 10, windspeed: 15, windDirection: 4, waterTemperature: 25 },
  { timestamp: '2025-04-25T16:01:00', humidity: 66, temperature: 27, airPressure: 1013, irradiation: 510, oxygen: 20.9, rainfall: 8, windspeed: 12, windDirection: 45, waterTemperature: 24.5 },
  { timestamp: '2025-04-25T16:02:00', humidity: 64, temperature: 29, airPressure: 1011, irradiation: 495, oxygen: 21.1, rainfall: 9, windspeed: 14, windDirection: 90, waterTemperature: 25.2 },
  { timestamp: '2025-04-25T16:03:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.8 },
  { timestamp: '2025-04-25T16:04:00', humidity: 67, temperature: 30, airPressure: 1010, irradiation: 520, oxygen: 20.7, rainfall: 6, windspeed: 11, windDirection: 180, waterTemperature: 25.5 },
  { timestamp: '2025-04-25T16:05:00', humidity: 68, temperature: 31, airPressure: 1014, irradiation: 530, oxygen: 20.6, rainfall: 5, windspeed: 13, windDirection: 225, waterTemperature: 26 },
  { timestamp: '2025-04-25T16:06:00', humidity: 65, temperature: 28, airPressure: 1013, irradiation: 500, oxygen: 21, rainfall: 10, windspeed: 15, windDirection: 270, waterTemperature: 25.3 },
  { timestamp: '2025-04-25T16:07:00', humidity: 66, temperature: 27, airPressure: 1012, irradiation: 505, oxygen: 20.9, rainfall: 8, windspeed: 12, windDirection: 315, waterTemperature: 24.7 },
  { timestamp: '2025-04-25T16:08:00', humidity: 64, temperature: 29, airPressure: 1011, irradiation: 495, oxygen: 21.1, rainfall: 9, windspeed: 14, windDirection: 0, waterTemperature: 25.1 },
  { timestamp: '2025-04-25T16:09:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 45, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:10:00', humidity: 67, temperature: 30, airPressure: 1010, irradiation: 520, oxygen: 20.7, rainfall: 6, windspeed: 11, windDirection: 90, waterTemperature: 25.4 },
  { timestamp: '2025-04-25T16:11:00', humidity: 68, temperature: 31, airPressure: 1014, irradiation: 530, oxygen: 20.6, rainfall: 5, windspeed: 13, windDirection: 135, waterTemperature: 26.1 },
  { timestamp: '2025-04-25T16:12:00', humidity: 65, temperature: 28, airPressure: 1013, irradiation: 500, oxygen: 21, rainfall: 10, windspeed: 15, windDirection: 180, waterTemperature: 25.6 },
  { timestamp: '2025-04-25T16:13:00', humidity: 66, temperature: 27, airPressure: 1012, irradiation: 505, oxygen: 20.9, rainfall: 8, windspeed: 12, windDirection: 225, waterTemperature: 24.8 },
  { timestamp: '2025-04-25T16:14:00', humidity: 64, temperature: 29, airPressure: 1011, irradiation: 495, oxygen: 21.1, rainfall: 9, windspeed: 14, windDirection: 270, waterTemperature: 25.2 },
  { timestamp: '2025-04-25T16:15:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 315, waterTemperature: 24.7 },
  { timestamp: '2025-04-25T16:16:00', humidity: 67, temperature: 30, airPressure: 1010, irradiation: 520, oxygen: 20.7, rainfall: 6, windspeed: 11, windDirection: 6, waterTemperature: 25.5 },
  { timestamp: '2025-04-25T16:17:00', humidity: 68, temperature: 31, airPressure: 1014, irradiation: 530, oxygen: 20.6, rainfall: 5, windspeed: 13, windDirection: 45, waterTemperature: 26 },
  { timestamp: '2025-04-25T16:18:00', humidity: 65, temperature: 28, airPressure: 1013, irradiation: 500, oxygen: 21, rainfall: 10, windspeed: 15, windDirection: 90, waterTemperature: 25.3 },
  { timestamp: '2025-04-25T16:19:00', humidity: 66, temperature: 27, airPressure: 1012, irradiation: 505, oxygen: 20.9, rainfall: 8, windspeed: 12, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:20:00', humidity: 64, temperature: 29, airPressure: 1011, irradiation: 495, oxygen: 21.1, rainfall: 9, windspeed: 14, windDirection: 180, waterTemperature: 25.1 },
  { timestamp: '2025-04-25T16:21:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 225, waterTemperature: 24.8 },
  { timestamp: '2025-04-25T16:22:00', humidity: 67, temperature: 30, airPressure: 1010, irradiation: 520, oxygen: 20.7, rainfall: 6, windspeed: 11, windDirection: 270, waterTemperature: 25.4 },
  { timestamp: '2025-04-25T16:23:00', humidity: 68, temperature: 31, airPressure: 1014, irradiation: 530, oxygen: 20.6, rainfall: 5, windspeed: 13, windDirection: 315, waterTemperature: 26.1 },
  { timestamp: '2025-04-25T16:24:00', humidity: 65, temperature: 28, airPressure: 1013, irradiation: 500, oxygen: 21, rainfall: 10, windspeed: 15, windDirection: 4, waterTemperature: 25.6 },
  { timestamp: '2025-04-25T16:25:00', humidity: 66, temperature: 27, airPressure: 1012, irradiation: 505, oxygen: 20.9, rainfall: 8, windspeed: 12, windDirection: 45, waterTemperature: 24.7 },
  { timestamp: '2025-04-25T16:26:00', humidity: 64, temperature: 29, airPressure: 1011, irradiation: 495, oxygen: 21.1, rainfall: 9, windspeed: 14, windDirection: 90, waterTemperature: 25.2 },
  { timestamp: '2025-04-25T16:27:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:28:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:29:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:30:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:31:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:32:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:33:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:34:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:35:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:36:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:37:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:38:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:39:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:40:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:41:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:42:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:43:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:44:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:45:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:46:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:47:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:48:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:49:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:50:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:51:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:52:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:53:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:54:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:55:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:56:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:57:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:58:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:59:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T16:60:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T17:00:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T17:01:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T17:02:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T17:03:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T17:04:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T17:05:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  { timestamp: '2025-04-25T17:06:00', humidity: 63, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 20.8, rainfall: 7, windspeed: 10, windDirection: 135, waterTemperature: 24.9 },
  // Tambahkan data lainnya hingga 25 Mei
];

const Station2 = () => {
  const [filter, setFilter] = useState('1d');
  // const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [chartData, setChartData] = useState([]);


    // Fungsi untuk mengambil data dari API
    // const fetchData = async () => {
    //   try {
    //     const response = await fetch('https://example.com/api/environment-data'); // Ganti dengan URL API Anda
    //     const data = await response.json();
    //     setAllData(data); // Simpan data dari API ke state
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //   }
    // };
  // Fungsi untuk memfilter data berdasarkan waktu
    const handleFilterChange = (filterType) => {
      setFilter(filterType);
    
      const now = new Date();
      let filtered;
    
      if (filterType === '1d') {
        // Filter data untuk 1 hari terakhir (hingga menit saat ini)
        filtered = allData.filter((item) => {
          const itemDate = new Date(item.timestamp);
          return (
            itemDate.getFullYear() === now.getFullYear() &&
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getDate() === now.getDate() &&
            itemDate <= now // Pastikan data tidak melebihi waktu saat ini
          );
        });
      } else if (filterType === '7d') {
        // Filter data untuk 7 hari terakhir (hingga menit saat ini)
        filtered = allData.filter((item) => {
          const itemDate = new Date(item.timestamp);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return itemDate >= sevenDaysAgo && itemDate <= now;
        });
      } else if (filterType === '1m') {
        // Filter data untuk 1 bulan terakhir (hingga menit saat ini)
        filtered = allData.filter((item) => {
          const itemDate = new Date(item.timestamp);
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(now.getMonth() - 1);
          return itemDate >= oneMonthAgo && itemDate <= now;
        });
      }
    
      // Urutkan data berdasarkan waktu (timestamp) secara ascending
      filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
      setFilteredData(filtered);
    };

  // Perbarui data untuk chart berdasarkan data yang difilter
  useEffect(() => {
    if (filteredData.length > 0) {
      const avgHumidity = filteredData.reduce((sum, item) => sum + item.humidity, 0) / filteredData.length;
      const avgTemperature = filteredData.reduce((sum, item) => sum + item.temperature, 0) / filteredData.length;
      const avgAirPressure = filteredData.reduce((sum, item) => sum + item.airPressure, 0) / filteredData.length;
      const avgIrradiation = filteredData.reduce((sum, item) => sum + item.irradiation, 0) / filteredData.length;
      const avgOxygen = filteredData.reduce((sum, item) => sum + item.oxygen, 0) / filteredData.length;
      const avgRainfall = filteredData.reduce((sum, item) => sum + item.rainfall, 0) / filteredData.length;
      const avgWindspeed = filteredData.reduce((sum, item) => sum + item.windspeed, 0) / filteredData.length;
  

      setChartData([
        { name: 'Humidity', value: avgHumidity, fill: '#8884d8' },
        { name: 'Temperature', value: avgTemperature, fill: '#83a6ed' },
        { name: 'Windspeed', value: avgWindspeed, fill: '#8dd1e1' },
        { name: 'Air Pressure', value: avgAirPressure, fill: '#82ca9d' },
        { name: 'Irradiation', value: avgIrradiation, fill: '#ffc658' },
        { name: 'Oxygen', value: avgOxygen, fill: '#ff7300' },
        { name: 'Rainfall', value: avgRainfall, fill: '#ff0000' },
      ]);
    } else {
      setChartData([]);
    }
  }, [filteredData]);

  // Jalankan filter default (1 hari terakhir) saat komponen pertama kali dimuat
  useEffect(() => {
    handleFilterChange(filter);
  }, []);

  return (
    <section
      style={{
        backgroundColor: '#f8f9fa',
        color: '#212529',
        minHeight: '100vh',
        padding: '20px 0',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <Container>
        <Row className="mb-5">
          <Col>
            <h2 className="text-center" style={{ color: '#007bff' }}>Environment Status</h2>
            <p className="text-center">Data collected from the station 1</p>
          </Col>
        </Row>
        
        <Row className="g-4">
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <HumidityGauge humidity={filteredData.length > 0 ? filteredData[filteredData.length - 1].humidity : 0} />
              <h5>Humidity</h5>
              <p>{filteredData.length > 0 ? `${filteredData[filteredData.length - 1].humidity}%` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <TemperatureGauge temperature={filteredData.length > 0 ? filteredData[filteredData.length - 1].temperature : 0} />
              <h5>Temperature</h5>
              <p>{filteredData.length > 0 ? `${filteredData[filteredData.length - 1].temperature}°C` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <AirPressureGauge airPressure={filteredData.length > 0 ? filteredData[filteredData.length - 1].airPressure : 0} />
              <h5>Air Pressure</h5>
              <p>{filteredData.length > 0 ? `${filteredData[filteredData.length - 1].airPressure} hPa` : 'N/A'}</p>
            </div>
          </Col>
        <Col md={4} className="text-center">
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <WindSpeedGauge windspeed={filteredData.length > 0 ? filteredData[filteredData.length - 1].windspeed : 0} />
              <h5>Wind Speed</h5>
              <p>{filteredData.length > 0 ? `${filteredData[filteredData.length - 1].windspeed} km/h` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <IrradiationGauge irradiation={filteredData.length > 0 ? filteredData[filteredData.length - 1].irradiation : 0} />
              <h5>Irradiation</h5>
              <p>{filteredData.length > 0 ? `${filteredData[filteredData.length - 1].irradiation} W/m²` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <OxygenGauge oxygen={filteredData.length > 0 ? filteredData[filteredData.length - 1].oxygen : 0} />
              <h5>Oxygen</h5>
              <p>{filteredData.length > 0 ? `${filteredData[filteredData.length - 1].oxygen}%` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <RainfallGauge rainfall={filteredData.length > 0 ? filteredData[filteredData.length - 1].rainfall : 0} />
              <h5>Rainfall</h5>
              <p>{filteredData.length > 0 ? `${filteredData[filteredData.length - 1].rainfall} mm` : 'N/A'}</p>
            </div>
           </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)'}}>
              <WindDirectionGauge windDirection={filteredData.length > 0 ? filteredData[filteredData.length - 1].windDirection : 0} />
              <h5>Wind Direction</h5>
              <p>{filteredData.length > 0 ? `${filteredData[filteredData.length - 1].windDirection}°` : 'N/A'}</p>
              </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
            <WaterTemperatureGauge waterTemperature={filteredData.length > 0 ? filteredData[filteredData.length - 1].waterTemperature : 0} />
            <h5>Water Temperature</h5>
              <p>{filteredData.length > 0 ? `${filteredData[filteredData.length - 1].waterTemperature}°C` : 'N/A'}</p>
            </div>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col>
            <h2 className="text-center" style={{ color: '#007bff' }}>Chart Status</h2>
          </Col>
        </Row>

        <Row>
        <ButtonGroup className="mb-3 d-flex justify-content-center">
              <Button
                variant={filter === '1d' ? 'primary' : 'outline-primary'}
                onClick={() => handleFilterChange('1d')}
              >
                1 Day
              </Button>
              <Button
                variant={filter === '7d' ? 'primary' : 'outline-primary'}
                onClick={() => handleFilterChange('7d')}
              >
                7 Days
              </Button>
              <Button
                variant={filter === '1m' ? 'primary' : 'outline-primary'}
                onClick={() => handleFilterChange('1m')}
              >
                1 Month
              </Button>
            </ButtonGroup>
            <Col md={12}>
              <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
                <TrendChart data={filteredData} />
              </div>
          </Col>

          {/* ini buat maps */}
          <Col md={12}>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <h4 style={{ color: '#007bff' }}>Location</h4>
              <iframe src="https://www.google.com/maps/embed?pb=!4v1742927582633!6m8!1m7!1semWwMLjxPNBvkFSf0-d_fQ!2m2!1d-5.570831564383814!2d105.240617222604!3f101.32!4f28.680000000000007!5f0.42518105702959824" style={{ width: '100%', height: '300px', border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </Col>
          {/* ini buat maps */}
        </Row>

        <Row className="mt-5">
          <Col>
            <h2 className="text-center" style={{ color: '#007bff' }}>Table Status</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)', overflowX: 'auto' }}>
              {filteredData.length > 0 ? (
                <Table striped bordered hover variant="light" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Humidity</th>
                      <th>Temperature</th>
                      <th>Air Pressure</th>
                      <th>Irradiation</th>
                      <th>Oxygen</th>
                      <th>Rainfall</th>
                      <th>Windspeed</th>
                      <th>Wind Direction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.timestamp}</td>
                        <td>{item.humidity}%</td>
                        <td>{item.temperature}°C</td>
                        <td>{item.airPressure} hPa</td>
                        <td>{item.irradiation} W/m²</td>
                        <td>{item.oxygen}%</td>
                        <td>{item.rainfall} mm</td>
                        <td>{item.windspeed} km/h</td>
                        <td>{item.windDirection}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center" style={{ color: '#007bff' }}>No data available for the selected filter</p>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Station2;