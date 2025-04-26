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

// ini buat data 24 jam
const allData = [];
const startTime = new Date('2025-04-26T00:00:00');

for (let i = 0; i < 1440; i++) {
  const currentTime = new Date(startTime.getTime() + i * 60000); // setiap 1 menit

  allData.push({
    timestamp: currentTime.toISOString().slice(0, 19),
    humidity: Math.floor(Math.random() * (70 - 60 + 1)) + 60, // 60-70
    temperature: Math.floor(Math.random() * (32 - 26 + 1)) + 26, // 26-32
    airPressure: Math.floor(Math.random() * (1015 - 1010 + 1)) + 1010, // 1010-1015
    irradiation: Math.floor(Math.random() * (550 - 480 + 1)) + 480, // 480-550
    oxygen: parseFloat((20.6 + Math.random() * 0.5).toFixed(1)), // 20.6 - 21.1
    rainfall: Math.floor(Math.random() * 11), // 0-10
    windspeed: Math.floor(Math.random() * (16 - 10 + 1)) + 10, // 10-16
    windDirection: Math.floor(Math.random() * 360), // 0-359
    waterTemperature: parseFloat((24.5 + Math.random() * 2).toFixed(1)) // 24.5 - 26.5
  });
}

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
            <p className="text-center">Data collected from the station 2</p>
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