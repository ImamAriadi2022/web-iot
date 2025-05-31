import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Table, ButtonGroup, Button } from 'react-bootstrap';

import TrendChart from "./chart";

// Import needed components
import TemperatureGauge from './status/TemperaturGauge';
import HumidityGauge from './status/HumidityGauge';
import AirPressureGauge from './status/AirPressure';
import WindSpeedGauge from './status/WindSpeed';
import IrradiationGauge from './status/Irradiation';
import OxygenGauge from './status/Oxygen';
import RainfallGauge from './status/Rainfall';
import WindDirectionGauge from './status/WindDirection';
import WaterTemperatureGauge from './status/WaterTemperature';

// Hanya gunakan endpoint daily
const API_DAILY = process.env.REACT_APP_API_SEBESI_DAILY;
const LOCAL_STORAGE_KEY = 'station1_backup_data';

// Helper untuk validasi dan konversi tanggal
const getValidTimestamp = (item) => {
  let ts = item.TS || item.timestamp || item.created_at;
  if (!ts) return null;
  if (typeof ts === 'number') {
    try {
      ts = new Date(ts).toISOString();
    } catch {
      return null;
    }
  }
  if (typeof ts === 'string' && isNaN(Date.parse(ts))) {
    try {
      const parsed = new Date(Number(ts));
      if (!isNaN(parsed.getTime())) {
        ts = parsed.toISOString();
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }
  return ts;
};

// Mapping function: hanya field yang null/error yang diisi 'server sedang eror'/'alat rusak'
const mapApiData = (item) => {
  const ts = getValidTimestamp(item);
  return {
    timestamp: ts || 'alat rusak',
    humidity: item.Humidity == null ? 'server sedang eror' : item.Humidity,
    temperature: item.Temperature == null ? 'server sedang eror' : item.Temperature,
    airPressure: item.AirPressure == null ? 'server sedang eror' : item.AirPressure,
    windspeed: item.AnemometerSpeed == null ? 'server sedang eror' : item.AnemometerSpeed,
    irradiation: item.SolarRadiation == null ? 'server sedang eror' : item.SolarRadiation,
    oxygen: item.Suhu_Air_Atas == null ? 'server sedang eror' : item.Suhu_Air_Atas,
    rainfall: item.Rainfall == null ? 'server sedang eror' : item.Rainfall,
    windDirection: item.Angle == null ? 'server sedang eror' : item.Angle,
    waterTemperature: item.Suhu_Air_Bawah == null ? 'server sedang eror' : item.Suhu_Air_Bawah,
  };
};

const filterDataByInterval = (data, intervalMinutes = 15) => {
  if (!Array.isArray(data)) return [];
  const filtered = [];
  let lastTimestamp = null;
  data.forEach(item => {
    const tsRaw = getValidTimestamp(item);
    if (!tsRaw) return;
    const ts = new Date(tsRaw).getTime();
    if (!lastTimestamp || ts - lastTimestamp >= intervalMinutes * 60 * 1000) {
      filtered.push({ ...item, TS: tsRaw });
      lastTimestamp = ts;
    }
  });
  return filtered;
};

const filterDataByDays = (data, days) => {
  if (!Array.isArray(data)) return [];
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  // Data harus diurutkan dari paling lama ke paling baru
  return data.filter(item => {
    const ts = new Date(item.timestamp);
    return ts >= start && ts <= now;
  });
};

// ...existing code...
const Station1 = () => {
  const [filter, setFilter] = useState('1d');
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [serverError, setServerError] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  // Ambil data dari localStorage saat komponen mount, sebelum fetch API
  useEffect(() => {
    const backup = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        setAllData(parsed);
        setServerError(false);
      } catch {
        // ignore
      }
    }
  }, []);

  // Fetch hanya dari endpoint daily
  const fetchData = async (isAuto = false) => {
    setLoading(true);
    const url = API_DAILY;
    if (!url) {
      setAllData([]);
      setServerError(true);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(url);
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        setAllData([]);
        setServerError(true);
        setLoading(false);
        return;
      }
      const data = await response.json();

      let rawData = [];
      if (Array.isArray(data)) {
        rawData = data;
      } else if (data && Array.isArray(data.result)) {
        rawData = data.result;
      } else if (data) {
        rawData = [data];
      }

      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      const last30DaysRaw = rawData.filter(item => {
        const ts = getValidTimestamp(item);
        if (!ts) return false;
        const d = new Date(ts);
        return d >= start && d <= now;
      });

      last30DaysRaw.sort((a, b) => {
        const ta = new Date(getValidTimestamp(a)).getTime();
        const tb = new Date(getValidTimestamp(b)).getTime();
        return ta - tb;
      });

      const filtered = filterDataByInterval(last30DaysRaw, 15);
      const mappedData = filtered.map(mapApiData);

      if (mappedData.length > 0) {
        setAllData(mappedData);
        setServerError(false);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mappedData));
      } else {
        setAllData([]);
        setServerError(true);
      }
      setLoading(false);
    } catch (error) {
      // Jika gagal fetch, tetap gunakan data localStorage yang sudah di-load di useEffect pertama
      setLoading(false);
      setServerError(true);
    }
  };

  // Fetch pertama kali dan set interval auto-fetch 10 detik
  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(() => {
      fetchData(true);
    }, 10000);
    return () => {
      clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, []);

  // ...existing code...

  useEffect(() => {
    if (loading) {
      console.log('Masih loading data dari API...');
    }
  }, [loading]);

  useEffect(() => {
    if (serverError) {
      setFilteredData([]);
      return;
    }
    let filtered = [];
    if (filter === '1d') {
      const now = new Date();
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      filtered = allData.filter(item => {
        const ts = new Date(item.timestamp);
        return ts >= start && ts <= now;
      });
      console.log('Data setelah filter 1 hari:', filtered);
    } else if (filter === '7d') {
      filtered = filterDataByDays(allData, 7);
      console.log('Data setelah filter 7 hari:', filtered);
    } else if (filter === '1m') {
      filtered = filterDataByDays(allData, 30);
      console.log('Data setelah filter 1 bulan:', filtered);
    } else {
      filtered = allData;
      console.log('Data tanpa filter:', allData);
    }
    // Urutkan data dari paling lama ke paling baru agar chart dan tabel benar
    filtered.sort((a, b) => {
      const ta = new Date(a.timestamp).getTime();
      const tb = new Date(b.timestamp).getTime();
      return ta - tb;
    });
    setFilteredData(filtered);
  }, [allData, filter, serverError]);

  const latest = serverError
    ? {}
    : filteredData.length > 0
    ? filteredData[filteredData.length - 1]
    : {};

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
            <p className="text-center">Data collected from Station 1 (Sebesi)</p>
          </Col>
        </Row>

        {loading && (
          <Row>
            <Col>
              <div className="text-center mb-4" style={{ color: '#007bff', fontWeight: 'bold' }}>
                Loading data dari API...
              </div>
            </Col>
          </Row>
        )}

        <Row className="g-4">
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <HumidityGauge humidity={latest.humidity !== undefined && latest.humidity !== 'server sedang eror' ? latest.humidity : 0} />
              <h5>Humidity</h5>
              <p>{latest.humidity === 'server sedang eror' ? 'server sedang eror' : latest.humidity !== undefined ? latest.humidity : '-'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <TemperatureGauge temperature={latest.temperature !== undefined && latest.temperature !== 'server sedang eror' ? latest.temperature : 0} />
              <h5>Temperature</h5>
              <p>{latest.temperature === 'server sedang eror' ? 'server sedang eror' : latest.temperature !== undefined ? latest.temperature : '-'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <AirPressureGauge airPressure={latest.airPressure !== undefined && latest.airPressure !== 'server sedang eror' ? latest.airPressure : 0} />
              <h5>Air Pressure</h5>
              <p>{latest.airPressure === 'server sedang eror' ? 'server sedang eror' : latest.airPressure !== undefined ? latest.airPressure : '-'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <WindSpeedGauge windspeed={latest.windspeed !== undefined && latest.windspeed !== 'server sedang eror' ? latest.windspeed : 0} />
              <h5>Wind Speed</h5>
              <p>{latest.windspeed === 'server sedang eror' ? 'server sedang eror' : latest.windspeed !== undefined ? latest.windspeed : '-'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <IrradiationGauge irradiation={latest.irradiation !== undefined && latest.irradiation !== 'server sedang eror' ? latest.irradiation : 0} />
              <h5>Irradiation</h5>
              <p>{latest.irradiation === 'server sedang eror' ? 'server sedang eror' : latest.irradiation !== undefined ? latest.irradiation : '-'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <OxygenGauge oxygen={latest.oxygen !== undefined && latest.oxygen !== 'server sedang eror' ? latest.oxygen : 0} />
              <h5>Upper Water Temp</h5>
              <p>{latest.oxygen === 'server sedang eror' ? 'server sedang eror' : latest.oxygen !== undefined ? latest.oxygen : '-'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <RainfallGauge rainfall={latest.rainfall !== undefined && latest.rainfall !== 'server sedang eror' ? latest.rainfall : 0} />
              <h5>Rainfall</h5>
              <p>{latest.rainfall === 'server sedang eror' ? 'server sedang eror' : latest.rainfall !== undefined ? latest.rainfall : '-'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)'}}>
              <WindDirectionGauge windDirection={latest.windDirection !== undefined && latest.windDirection !== 'server sedang eror' ? latest.windDirection : 0} />
              <h5>Wind Direction</h5>
              <p>{latest.windDirection === 'server sedang eror' ? 'server sedang eror' : latest.windDirection !== undefined ? latest.windDirection : '-'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <WaterTemperatureGauge waterTemperature={latest.waterTemperature !== undefined && latest.waterTemperature !== 'server sedang eror' ? latest.waterTemperature : 0} />
              <h5>Water Temperature (Lower)</h5>
              <p>{latest.waterTemperature === 'server sedang eror' ? 'server sedang eror' : latest.waterTemperature !== undefined ? latest.waterTemperature : '-'}</p>
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
              onClick={() => setFilter('1d')}
            >
              1 Day
            </Button>
            <Button
              variant={filter === '7d' ? 'primary' : 'outline-primary'}
              onClick={() => setFilter('7d')}
            >
              7 Days
            </Button>
            <Button
              variant={filter === '1m' ? 'primary' : 'outline-primary'}
              onClick={() => setFilter('1m')}
            >
              1 Month
            </Button>
          </ButtonGroup>
          <Col md={12}>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              {serverError ? (
                <div className="text-center" style={{ color: 'red', fontWeight: 'bold', fontSize: '1.2em' }}>
                  Server sedang eror
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center" style={{ color: '#007bff' }}>
                  Tidak ada data untuk filter ini
                </div>
              ) : (
                <TrendChart data={filteredData} />
              )}
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
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)', overflowX: 'auto' }}>
              {serverError ? (
                <div className="text-center" style={{ color: 'red', fontWeight: 'bold', fontSize: '1.2em' }}>
                  Server sedang eror
                </div>
              ) : filteredData.length > 0 ? (
                <Table striped bordered hover variant="light" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Humidity</th>
                      <th>Temperature</th>
                      <th>Air Pressure</th>
                      <th>Irradiation</th>
                      <th>Upper Water Temp</th>
                      <th>Rainfall</th>
                      <th>Windspeed</th>
                      <th>Wind Direction</th>
                      <th>Water Temperature (Lower)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.timestamp}</td>
                        <td>{item.humidity === 'server sedang eror' ? 'server sedang eror' : item.humidity}</td>
                        <td>{item.temperature === 'server sedang eror' ? 'server sedang eror' : item.temperature}</td>
                        <td>{item.airPressure === 'server sedang eror' ? 'server sedang eror' : item.airPressure}</td>
                        <td>{item.irradiation === 'server sedang eror' ? 'server sedang eror' : item.irradiation}</td>
                        <td>{item.oxygen === 'server sedang eror' ? 'server sedang eror' : item.oxygen}</td>
                        <td>{item.rainfall === 'server sedang eror' ? 'server sedang eror' : item.rainfall}</td>
                        <td>{item.windspeed === 'server sedang eror' ? 'server sedang eror' : item.windspeed}</td>
                        <td>{item.windDirection === 'server sedang eror' ? 'server sedang eror' : item.windDirection}</td>
                        <td>{item.waterTemperature === 'server sedang eror' ? 'server sedang eror' : item.waterTemperature}</td>
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