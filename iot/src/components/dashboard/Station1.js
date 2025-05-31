import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, ButtonGroup, Button } from 'react-bootstrap';

import TrendChart from "./chart";

// Komponen Gauge
import TemperatureGauge from './status/TemperaturGauge';
import HumidityGauge from './status/HumidityGauge';
import AirPressureGauge from './status/AirPressure';
import WindSpeedGauge from './status/WindSpeed';
import IrradiationGauge from './status/Irradiation';
import OxygenGauge from './status/Oxygen';
import RainfallGauge from './status/Rainfall';
import WindDirectionGauge from './status/WindDirection';
import WaterTemperatureGauge from './status/WaterTemperature';

// Daftar field yang ingin ditampilkan (dinamis, urutkan sesuai kebutuhan frontend)
const FIELD_CONFIG = [
  { key: 'humidity', label: 'Humidity', unit: '%', gauge: HumidityGauge },
  { key: 'temperature', label: 'Temperature', unit: '°C', gauge: TemperatureGauge },
  { key: 'airPressure', label: 'Air Pressure', unit: 'hPa', gauge: AirPressureGauge },
  { key: 'windspeed', label: 'Windspeed', unit: 'km/h', gauge: WindSpeedGauge },
  { key: 'irradiation', label: 'Irradiation', unit: 'W/m²', gauge: IrradiationGauge },
  { key: 'oxygen', label: 'Oxygen', unit: '%', gauge: OxygenGauge },
  { key: 'rainfall', label: 'Rainfall', unit: 'mm', gauge: RainfallGauge },
  { key: 'windDirection', label: 'Wind Direction', unit: '°', gauge: WindDirectionGauge },
  { key: 'waterTemperature', label: 'Water Temperature', unit: '°C', gauge: WaterTemperatureGauge },
];

// API endpoint dari .env
const API_URL = process.env.REACT_APP_API_PETENGORAN_GET_TOPIC4;

const Station1 = () => {
  const [filter, setFilter] = useState('1d');
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Fetch data dari API Petengoran Topic 4
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const json = await response.json();
        // Pastikan data berupa array
        const result = Array.isArray(json.result) ? json.result : [];
        setAllData(result);
      } catch (error) {
        setAllData([]);
      }
    };
    fetchData();
  }, []);

  // Fungsi untuk memfilter data berdasarkan waktu
  const handleFilterChange = (filterType) => {
    setFilter(filterType);

    const now = new Date();
    let filtered = [];

    if (filterType === '1d') {
      filtered = allData.filter((item) => {
        const itemDate = new Date(item.timestamp);
        return (
          itemDate.getFullYear() === now.getFullYear() &&
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getDate() === now.getDate() &&
          itemDate <= now
        );
      });
    } else if (filterType === '7d') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      filtered = allData.filter((item) => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= sevenDaysAgo && itemDate <= now;
      });
    } else if (filterType === '1m') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filtered = allData.filter((item) => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= oneMonthAgo && itemDate <= now;
      });
    }

    filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    setFilteredData(filtered);
  };

  // Jalankan filter default (1 hari terakhir) saat komponen pertama kali dimuat atau data berubah
  useEffect(() => {
    handleFilterChange(filter);
    // eslint-disable-next-line
  }, [allData]);

  // Ambil data terbaru (last item)
  const latest = filteredData.length > 0 ? filteredData[filteredData.length - 1] : {};

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
          {FIELD_CONFIG.map((field, idx) => {
            const GaugeComponent = field.gauge;
            return (
              <Col md={4} className="text-center" key={field.key}>
                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
                  <GaugeComponent {...{ [field.key]: latest[field.key] ?? 0 }} />
                  <h5>{field.label}</h5>
                  <p>
                    {latest[field.key] !== undefined && latest[field.key] !== null
                      ? `${latest[field.key]}${field.unit}`
                      : 'N/A'}
                  </p>
                </div>
              </Col>
            );
          })}
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
                      {FIELD_CONFIG.map(field => (
                        <th key={field.key}>{field.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.timestamp}</td>
                        {FIELD_CONFIG.map(field => (
                          <td key={field.key}>
                            {item[field.key] !== undefined && item[field.key] !== null
                              ? `${item[field.key]}${field.unit}`
                              : 'N/A'}
                          </td>
                        ))}
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