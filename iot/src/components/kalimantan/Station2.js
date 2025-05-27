import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';

import TemperatureGauge from './status/TemperaturGauge';
import HumidityGauge from './status/HumidityGauge';
import TrendChart from './chart2';

// Helper: parse timestamp dan validasi
const parseTimestamp = (ts) => {
  if (!ts || typeof ts !== 'string') return 'alat rusak';
  const [date, time] = ts.split(' ');
  if (!date || !time) return 'alat rusak';
  const [day, month, year] = date.split('-');
  const fullYear = year && year.length === 2 ? '20' + year : year;
  const iso = `${fullYear}-${month}-${day}T${time}`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'alat rusak';
  return iso;
};

const API_URL = process.env.REACT_APP_API_KALIMANTAN_TABLE_TOPIC2;

const Station2 = () => {
  const [data, setData] = useState([]);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const json = await response.json();
        // Data backend: { result: [...] }
        const mapped = Array.isArray(json.result)
          ? json.result.map(item => {
              const ts = item.timestamp;
              const parsedTs = parseTimestamp(ts);
              return {
                timestamp: parsedTs === 'alat rusak' ? 'alat rusak' : parsedTs,
                rawTimestamp: ts,
                humidity: item.humidity ?? 'alat rusak',
                temperature: item.temperature ?? 'alat rusak',
              };
            })
          : [];
        setData(mapped);
      } catch (error) {
        setData([]);
      }
    };
    fetchData();
  }, []);

  // Ambil data terbaru (last item)
  const latest = data.length > 0 ? data[data.length - 1] : null;

  // Data valid untuk chart (timestamp harus ISO string, bukan 'alat rusak')
  const chartData = data.filter(
    d => d.timestamp !== 'alat rusak' &&
         d.humidity !== 'alat rusak' &&
         d.temperature !== 'alat rusak'
  );

  // Hanya ambil field humidity dan temperature untuk chart
  const chartDataForTrend = chartData.map(d => ({
    timestamp: d.timestamp,
    humidity: d.humidity,
    temperature: d.temperature,
  }));

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
            <p className="text-center">Data collected from Station 2 (Kalimantan)</p>
          </Col>
        </Row>
        <Row className="g-4">
          <Col md={6} className="text-center">
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0,0,0,0.1)' }}>
              <HumidityGauge humidity={latest && latest.humidity !== 'alat rusak' ? latest.humidity : 0} />
              <h5>Humidity</h5>
              <p>
                {latest
                  ? latest.humidity === 'alat rusak'
                    ? 'alat rusak'
                    : `${latest.humidity}%`
                  : 'N/A'}
              </p>
            </div>
          </Col>
          <Col md={6} className="text-center">
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0,0,0,0.1)' }}>
              <TemperatureGauge temperature={latest && latest.temperature !== 'alat rusak' ? latest.temperature : 0} />
              <h5>Temperature</h5>
              <p>
                {latest
                  ? latest.temperature === 'alat rusak'
                    ? 'alat rusak'
                    : `${latest.temperature}°C`
                  : 'N/A'}
              </p>
            </div>
          </Col>
        </Row>

        {/* Chart Section */}
        <Row className="mt-5">
          <Col>
            <h2 className="text-center" style={{ color: '#007bff' }}>Chart Status</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 0 15px rgba(0,0,0,0.1)',
              marginBottom: '30px'
            }}>
              <TrendChart data={chartDataForTrend} metrics={['humidity', 'temperature']} />
            </div>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col>
            <h2 className="text-center" style={{ color: '#007bff' }}>Table Status</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 0 15px rgba(0,0,0,0.1)',
              overflowX: 'auto'
            }}>
              {data.length > 0 ? (
                <Table striped bordered hover variant="light" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Humidity (%)</th>
                      <th>Temperature (°C)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          {parseTimestamp(item.rawTimestamp) === 'alat rusak'
                            ? 'alat rusak'
                            : item.rawTimestamp}
                        </td>
                        <td>
                          {item.humidity === 'alat rusak'
                            ? 'alat rusak'
                            : item.humidity}
                        </td>
                        <td>
                          {item.temperature === 'alat rusak'
                            ? 'alat rusak'
                            : item.temperature}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center" style={{ color: '#007bff' }}>
                  No data available
                </p>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Station2;