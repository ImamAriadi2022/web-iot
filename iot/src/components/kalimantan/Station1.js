import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, ButtonGroup, Button } from 'react-bootstrap';

import TrendChart from "./chart";

// Import komponen yang dibutuhkan
import TemperatureGauge from './status/TemperaturGauge';
import HumidityGauge from './status/HumidityGauge';
import RainfallGauge from './status/Rainfall';
import WindSpeedGauge from './status/WindSpeed';
import IrradiationGauge from './status/Irradiation';
import WindDirectionGauge from './status/WindDirection';

const getOneDataPerDay = (data) => {
  const map = {};
  data.forEach(item => {
    const date = item.timestamp ? item.timestamp.slice(0,10) : '';
    if (date) map[date] = item;
  });
  return Object.values(map).sort((a,b) => a.timestamp.localeCompare(b.timestamp));
};

// Fungsi mapping arah angin Indonesia ke Inggris
const windDirectionToEnglish = (dir) => {
  if (!dir) return '';
  const map = {
    'Utara': 'North',
    'Timur Laut': 'Northeast',
    'Timur': 'East',
    'Timur Timur Laut': 'East-Northeast',
    'Barat Laut': 'Northwest',
    'Barat': 'West',
    'Barat Daya': 'Southwest',
    'Selatan': 'South',
    'Tenggara': 'Southeast',
    'Timur Selatan': 'East-Southeast',
    'Barat Barat Laut': 'West-Northwest',
    'Barat Barat Daya': 'West-Southwest',
    'Selatan Barat Daya': 'South-Southwest',
    'Selatan Tenggara': 'South-Southeast',
    'Timur Timur Selatan': 'East-Southeast',
    'Timur Tenggara': 'East-Southeast', // Tambahan mapping yang benar
    'North': 'North',
    'South': 'South',
    'East': 'East',
    'West': 'West',
    'Northeast': 'Northeast',
    'Northwest': 'Northwest',
    'Southeast': 'Southeast',
    'Southwest': 'Southwest',
    'East-Northeast': 'East-Northeast',
    'East-Southeast': 'East-Southeast',
    'West-Northwest': 'West-Northwest',
    'West-Southwest': 'West-Southwest',
    'South-Southwest': 'South-Southwest',
    'South-Southeast': 'South-Southeast',
  };
  return map[dir] || dir;
};

// Fungsi untuk parsing timestamp dari backend ke format ISO (agar bisa dipakai new Date())
const parseTimestamp = (ts) => {
  if (!ts || typeof ts !== 'string') return ts;
  const [date, time] = ts.split(' ');
  if (!date || !time) return ts;
  const [day, month, year] = date.split('-');
  const fullYear = year.length === 2 ? '20' + year : year;
  return `${fullYear}-${month}-${day}T${time}`;
};

// Mapping function untuk menyesuaikan field backend ke frontend
const mapApiData = (item) => {
  if (!item) {
    return {
      timestamp: 'error',
      humidity: 'error',
      temperature: 'error',
      rainfall: 'error',
      windspeed: 'error',
      irradiation: 'error',
      windDirection: 'error',
      angle: 'error',
    };
  }
  const ts = item.timestamp;
  if (ts === undefined || ts === null || ts === '') {
    return {
      timestamp: 'alat rusak',
      humidity: 'alat rusak',
      temperature: 'alat rusak',
      rainfall: 'alat rusak',
      windspeed: 'alat rusak',
      irradiation: 'alat rusak',
      windDirection: 'alat rusak',
      angle: 'alat rusak',
    };
  }
  return {
    timestamp: parseTimestamp(ts),
    humidity: item.humidity ?? 0,
    temperature: item.temperature ?? 0,
    rainfall: item.rainfall ?? 0,
    windspeed: item.wind_speed ?? 0,
    irradiation: item.irradiation ?? 0,
    windDirection: windDirectionToEnglish(item.direction ?? ''),
    angle: item.angle ?? 0,
  };
};

const API_MAP = {
  '1d': process.env.REACT_APP_API_KALIMANTAN_ONEDAY_TOPIC1,
  '7d': process.env.REACT_APP_API_KALIMANTAN_SEVENDAYS_TOPIC1,
  '1m': process.env.REACT_APP_API_KALIMANTAN_ONEMONTH_TOPIC1,
};

const Station1 = () => {
  const [filter, setFilter] = useState('1d');
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Fetch data dari API sesuai filter
  const fetchData = async (filterType) => {
    try {
      const url = API_MAP[filterType];
      const response = await fetch(url);
      const data = await response.json();
      const mapped = Array.isArray(data.result) ? data.result.map(mapApiData) : [];
      setAllData(mapped);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAllData([]);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterType) => {
    setFilter(filterType);
    fetchData(filterType);
  };

  useEffect(() => {
    fetchData(filter);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setFilteredData(allData);
    if (filter === '7d' || filter === '1m') {
      setTableData(getOneDataPerDay(allData));
    } else {
      setTableData(allData);
    }
  }, [allData, filter]);

    console.log("filteredData:", filteredData);

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
            <p className="text-center">Data collected from Station 1 (Kalimantan)</p>
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
              <RainfallGauge rainfall={filteredData.length > 0 ? filteredData[filteredData.length - 1].rainfall : 0} />
              <h5>Rainfall</h5>
              <p>{filteredData.length > 0 ? `${filteredData[filteredData.length - 1].rainfall} mm` : 'N/A'}</p>
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
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)'}}>
              <WindDirectionGauge windDirection={filteredData.length > 0 ? filteredData[filteredData.length - 1].angle : 0} />
              <h5>Wind Direction</h5>
              <p>
                {filteredData.length > 0
                  ? `${filteredData[filteredData.length - 1].windDirection} (${filteredData[filteredData.length - 1].angle}°)`
                  : 'N/A'}
              </p>
            </div>
          </Col>
        </Row>

        {/* Tombol filter */}
        <Row className="mt-5 mb-3">
          <Col className="text-center">
            <ButtonGroup>
              <Button
                variant={filter === '1d' ? 'primary' : 'outline-primary'}
                onClick={() => handleFilterChange('1d')}
              >
                1 Hari Terakhir
              </Button>
              <Button
                variant={filter === '7d' ? 'primary' : 'outline-primary'}
                onClick={() => handleFilterChange('7d')}
              >
                7 Hari Terakhir
              </Button>
              <Button
                variant={filter === '1m' ? 'primary' : 'outline-primary'}
                onClick={() => handleFilterChange('1m')}
              >
                1 Bulan Terakhir
              </Button>
            </ButtonGroup>
          </Col>
        </Row>


{/* chart 6 data utama */}
         <Row>
          <Col>
            <h2 className="text-center" style={{ color: '#007bff' }}>Chart Status</h2>
          </Col>
        </Row>

            <Row>
          <Col>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
                <TrendChart
                  data={filteredData}
                  fields={[
                    { key: 'humidity', label: 'Humidity (%)' },
                    { key: 'temperature', label: 'Temperature (°C)' },
                    { key: 'rainfall', label: 'Rainfall (mm)' },
                    { key: 'windspeed', label: 'Wind Speed (km/h)' },
                    { key: 'irradiation', label: 'Irradiation (W/m²)' },
                    { key: 'angle', label: 'Wind Direction (°)' }
                  ]}
                />
            </div>
          </Col>
        </Row>



        {/* ini buat tabel nya */}

        <Row className="mt-5">
          <Col>
            <h2 className="text-center" style={{ color: '#007bff' }}>Table Status</h2>
          </Col>
        </Row>
    <Row>
          <Col>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)', overflowX: 'auto' }}>
              {tableData.length > 0 ? (
                <Table striped bordered hover variant="light" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Humidity (%)</th>
                      <th>Temperature (°C)</th>
                      <th>Rainfall (mm)</th>
                      <th>Wind Speed (km/h)</th>
                      <th>Irradiation (W/m²)</th>
                      <th>Wind Direction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.timestamp}</td>
                        <td>{item.humidity}</td>
                        <td>{item.temperature}</td>
                        <td>{item.rainfall}</td>
                        <td>{item.windspeed}</td>
                        <td>{item.irradiation}</td>
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

export default Station1;