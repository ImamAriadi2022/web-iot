import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Col, Container, Row, Table } from 'react-bootstrap';

import TrendChart from "./chart";

// Import needed components
import AirPressureGauge from './status/AirPressure';
import HumidityGauge from './status/HumidityGauge';
import IrradiationGauge from './status/Irradiation';
import OxygenGauge from './status/Oxygen';
import RainfallGauge from './status/Rainfall';
import TemperatureGauge from './status/TemperaturGauge';
import WaterTemperatureGauge from './status/WaterTemperature';
import WindDirectionGauge from './status/WindDirection';
import WindSpeedGauge from './status/WindSpeed';

const getOneDataPerDay = (data) => {
  const map = {};
  data.forEach(item => {
    const date = item.timestamp ? item.timestamp.slice(0,10) : '';
    if (date) {
      // Keep the latest entry for each day (since data is sorted latest first)
      if (!map[date]) {
        map[date] = item;
      }
    }
  });
  // Sort by date, latest first
  return Object.values(map).sort((a,b) => {
    const timeA = new Date(a.timestamp);
    const timeB = new Date(b.timestamp);
    return timeB - timeA;
  });
};

// API Sebesi endpoints untuk berbagai periode
const API_MAP = {
  '1d': process.env.REACT_APP_API_SEBESI_DAILY,
  '7d': process.env.REACT_APP_API_SEBESI_DAILY, // Gunakan yang sama untuk sementara
  '1m': process.env.REACT_APP_API_SEBESI_DAILY, // Gunakan yang sama untuk sementara
};

// Helper untuk validasi dan konversi tanggal
const parseTimestamp = (ts) => {
  if (!ts) return 'alat rusak';
  
  // Coba berbagai format timestamp
  try {
    // Jika sudah dalam format ISO, return as is
    if (typeof ts === 'string' && ts.includes('T')) {
      const date = new Date(ts);
      if (!isNaN(date.getTime())) {
        return ts;
      }
    }
    
    // Jika timestamp berupa number (epoch)
    if (typeof ts === 'number') {
      const date = new Date(ts);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    
    // Jika string number (epoch)
    if (typeof ts === 'string' && !isNaN(Number(ts))) {
      const date = new Date(Number(ts));
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    
    // Fallback: coba parse langsung
    const date = new Date(ts);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
    
    return 'alat rusak';
  } catch (error) {
    console.log('Error parsing timestamp:', ts, error);
    return 'alat rusak';
  }
};

// Fungsi untuk format timestamp yang user-friendly
const formatUserFriendlyTimestamp = (timestamp) => {
  if (!timestamp || timestamp === 'alat rusak' || timestamp === 'server sedang eror') {
    return timestamp;
  }
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return timestamp;
    }
    
    // Format: "30 Juni 2025, 14:30:45" (konsisten dengan Download.js)
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta'
    };
    
    return date.toLocaleDateString('id-ID', options);
  } catch (error) {
    console.log('Error formatting timestamp:', timestamp, error);
    return timestamp;
  }
};

// Mapping function untuk menyesuaikan field backend ke frontend Sebesi
const mapApiData = (item) => {
  if (!item) {
    return {
      timestamp: 'alat rusak',
      humidity: 'server sedang eror',
      temperature: 'server sedang eror',
      airPressure: 'server sedang eror',
      windspeed: 'server sedang eror',
      irradiation: 'server sedang eror',
      oxygen: 'server sedang eror',
      rainfall: 'server sedang eror',
      windDirection: 'server sedang eror',
      waterTemperature: 'server sedang eror',
    };
  }
  
  // Parse timestamp dari berbagai kemungkinan field
  const ts = item.TS || item.timestamp || item.created_at;
  const parsedTs = parseTimestamp(ts);
  
  return {
    timestamp: parsedTs,
    humidity: item.Humidity != null && !isNaN(item.Humidity) ? parseFloat(item.Humidity) : 'server sedang eror',
    temperature: item.Temperature != null && !isNaN(item.Temperature) ? parseFloat(item.Temperature) : 'server sedang eror',
    airPressure: item.AirPressure != null && !isNaN(item.AirPressure) ? parseFloat(item.AirPressure) : 'server sedang eror',
    windspeed: item.AnemometerSpeed != null && !isNaN(item.AnemometerSpeed) ? parseFloat(item.AnemometerSpeed) : 'server sedang eror',
    irradiation: item.SolarRadiation != null && !isNaN(item.SolarRadiation) ? parseFloat(item.SolarRadiation) : 'server sedang eror',
    oxygen: item.Suhu_Air_Atas != null && !isNaN(item.Suhu_Air_Atas) ? parseFloat(item.Suhu_Air_Atas) : 'server sedang eror',
    rainfall: item.Rainfall != null && !isNaN(item.Rainfall) ? parseFloat(item.Rainfall) : 'server sedang eror',
    windDirection: item.Angle != null && !isNaN(item.Angle) ? parseFloat(item.Angle) : 'server sedang eror',
    waterTemperature: item.Suhu_Air_Bawah != null && !isNaN(item.Suhu_Air_Bawah) ? parseFloat(item.Suhu_Air_Bawah) : 'server sedang eror',
  };
};

const Station1 = () => {
  const [filter, setFilter] = useState('1d');
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableData, setTableData] = useState([]);
  
  // State variables untuk status tracking dan gauge data (sama seperti Kalimantan)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gaugeData, setGaugeData] = useState({
    humidity: 0,
    temperature: 0,
    airPressure: 0,
    windspeed: 0,
    irradiation: 0,
    oxygen: 0,
    rainfall: 0,
    windDirection: 0,
    waterTemperature: 0,
  });
  const [dataStatus, setDataStatus] = useState('');

  // Function to determine which data to use for gauges (latest valid data)
  const determineGaugeData = (data) => {
    console.log('[Sebesi Station1] determineGaugeData called with data length:', data.length);
    
    if (!data || data.length === 0) {
      console.log('[Sebesi Station1] No data available');
      setDataStatus('No data available');
      return {
        humidity: 0,
        temperature: 0,
        airPressure: 0,
        windspeed: 0,
        irradiation: 0,
        oxygen: 0,
        rainfall: 0,
        windDirection: 0,
        waterTemperature: 0,
      };
    }

    // Sort data by timestamp (latest first)
    const sortedData = [...data].sort((a, b) => {
      if (a.timestamp === 'alat rusak' || b.timestamp === 'alat rusak') {
        return a.timestamp === 'alat rusak' ? 1 : -1;
      }
      const timeA = new Date(a.timestamp);
      const timeB = new Date(b.timestamp);
      return timeB - timeA;
    });

    console.log('[Sebesi Station1] Sorted data (latest first):', sortedData.slice(0, 3));

    // Find the latest valid data for gauges
    let validData = null;
    let latestEntryIndex = -1;
    
    for (let i = 0; i < sortedData.length; i++) {
      const item = sortedData[i];
      
      // Check if timestamp is valid
      if (!item.timestamp || 
          item.timestamp === 'alat rusak' ||
          isNaN(new Date(item.timestamp).getTime())) {
        console.log(`[Sebesi Station1] Invalid timestamp at index ${i}:`, item.timestamp);
        continue;
      }

      // Check if essential data fields are valid (numeric values)
      const isValidData = (
        typeof item.humidity === 'number' && !isNaN(item.humidity) &&
        typeof item.temperature === 'number' && !isNaN(item.temperature) &&
        typeof item.airPressure === 'number' && !isNaN(item.airPressure) &&
        typeof item.windspeed === 'number' && !isNaN(item.windspeed) &&
        typeof item.irradiation === 'number' && !isNaN(item.irradiation) &&
        typeof item.oxygen === 'number' && !isNaN(item.oxygen) &&
        typeof item.rainfall === 'number' && !isNaN(item.rainfall) &&
        typeof item.windDirection === 'number' && !isNaN(item.windDirection) &&
        typeof item.waterTemperature === 'number' && !isNaN(item.waterTemperature)
      );

      if (isValidData) {
        validData = item;
        latestEntryIndex = i;
        console.log(`[Sebesi Station1] Found valid data at index ${i}:`, item);
        break;
      } else {
        console.log(`[Sebesi Station1] Invalid data at index ${i}:`, item);
      }
    }

    if (!validData) {
      console.log('[Sebesi Station1] No valid data found');
      setDataStatus('No valid data available');
      return {
        humidity: 0,
        temperature: 0,
        airPressure: 0,
        windspeed: 0,
        irradiation: 0,
        oxygen: 0,
        rainfall: 0,
        windDirection: 0,
        waterTemperature: 0,
      };
    }

    // Set status message
    if (latestEntryIndex === 0) {
      setDataStatus('Using latest data for gauges');
    } else {
      const latestTime = new Date(sortedData[0].timestamp);
      const validTime = new Date(validData.timestamp);
      const timeDiff = Math.abs(latestTime - validTime);
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      
      if (hoursDiff < 24) {
        setDataStatus(`Using data from ${hoursDiff} hours ago (${formatUserFriendlyTimestamp(validData.timestamp)})`);
      } else {
        const daysDiff = Math.floor(hoursDiff / 24);
        setDataStatus(`Using data from ${daysDiff} days ago (${formatUserFriendlyTimestamp(validData.timestamp)})`);
      }
    }

    console.log('[Sebesi Station1] Selected gauge data:', validData);
    return {
      humidity: validData.humidity,
      temperature: validData.temperature,
      airPressure: validData.airPressure,
      windspeed: validData.windspeed,
      irradiation: validData.irradiation,
      oxygen: validData.oxygen,
      rainfall: validData.rainfall,
      windDirection: validData.windDirection,
      waterTemperature: validData.waterTemperature,
    };
  };

  // Fetch data dari API sesuai filter
  const fetchData = async (filterType) => {
    setLoading(true);
    setError(null);
    console.log(`[Sebesi Station1] Fetching data for filter: ${filterType}`);
    
    try {
      const url = API_MAP[filterType];
      console.log(`[Sebesi Station1] API URL: ${url}`);
      
      if (!url) {
        throw new Error(`No API URL configured for filter: ${filterType}`);
      }
      
      // Try normal fetch first
      let response;
      try {
        response = await fetch(url);
      } catch (corsError) {
        console.warn('[Sebesi Station1] CORS error, trying with no-cors mode:', corsError);
        // Fallback to no-cors mode (won't work for JSON parsing, but prevents error)
        // In production, the server should be configured to allow CORS
        throw new Error('CORS error: Server needs to allow cross-origin requests');
      }
      
      console.log(`[Sebesi Station1] Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[Sebesi Station1] Raw API response:', data);
      
      // Handle berbagai format response
      let rawData = [];
      if (Array.isArray(data)) {
        rawData = data;
      } else if (data && Array.isArray(data.result)) {
        rawData = data.result;
      } else if (data) {
        rawData = [data];
      }
      
      const mapped = rawData.map(mapApiData);
      console.log('[Sebesi Station1] Mapped data length:', mapped.length);
      
      // Sort data by timestamp (latest first) untuk memastikan urutan yang benar
      mapped.sort((a, b) => {
        if (a.timestamp === 'alat rusak' || b.timestamp === 'alat rusak') {
          return a.timestamp === 'alat rusak' ? 1 : -1;
        }
        const timeA = new Date(a.timestamp);
        const timeB = new Date(b.timestamp);
        return timeB - timeA; // Latest first (descending order)
      });
      
      console.log('[Sebesi Station1] Data after sorting (latest first):', mapped.slice(0, 3));
      
      setAllData(mapped);
      
      // Determine gauge data from the fetched data
      const newGaugeData = determineGaugeData(mapped);
      setGaugeData(newGaugeData);
      
    } catch (error) {
      console.error('[Sebesi Station1] Error fetching data:', error);
      
      // For development, show more helpful error message
      let errorMessage = error.message;
      if (error.message.includes('CORS')) {
        errorMessage = 'CORS Error: Server tidak mengizinkan akses dari localhost. Gunakan production build atau hubungi admin server.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network Error: Tidak dapat terhubung ke server API Sebesi. Periksa koneksi internet atau hubungi admin.';
      }
      
      setError(errorMessage);
      setAllData([]);
      setGaugeData({
        humidity: 0,
        temperature: 0,
        airPressure: 0,
        windspeed: 0,
        irradiation: 0,
        oxygen: 0,
        rainfall: 0,
        windDirection: 0,
        waterTemperature: 0,
      });
      setDataStatus('Error loading data');
    } finally {
      setLoading(false);
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
    // Filter data berdasarkan periode yang dipilih
    let filtered = [];
    
    if (filter === '1d') {
      const now = new Date();
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      filtered = allData.filter(item => {
        if (item.timestamp === 'alat rusak') return false;
        const ts = new Date(item.timestamp);
        return ts >= start && ts <= now;
      });
    } else if (filter === '7d') {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      filtered = allData.filter(item => {
        if (item.timestamp === 'alat rusak') return false;
        const ts = new Date(item.timestamp);
        return ts >= start && ts <= now;
      });
    } else if (filter === '1m') {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      filtered = allData.filter(item => {
        if (item.timestamp === 'alat rusak') return false;
        const ts = new Date(item.timestamp);
        return ts >= start && ts <= now;
      });
    } else {
      filtered = allData;
    }
    
    setFilteredData(filtered);
    
    // Untuk 7d dan 1m, ambil satu data per hari untuk tabel
    if (filter === '7d' || filter === '1m') {
      const onePerDay = getOneDataPerDay(filtered);
      setTableData(onePerDay);
    } else {
      setTableData(filtered);
    }
    
    // Update gauge data whenever allData changes
    if (allData.length > 0) {
      const newGaugeData = determineGaugeData(allData);
      setGaugeData(newGaugeData);
    }
  }, [allData, filter]);

  // Prepare chart data (sort chronologically for better chart visualization)
  const chartData = [...filteredData].sort((a, b) => {
    if (a.timestamp === 'alat rusak' || b.timestamp === 'alat rusak') {
      return 0;
    }
    const timeA = new Date(a.timestamp);
    const timeB = new Date(b.timestamp);
    return timeA - timeB; // Oldest first for chronological chart
  });

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
            
            {/* Status indicator */}
            <div className="text-center mb-3">
              {loading && (
                <div className="alert alert-info" role="alert">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Loading data...
                </div>
              )}
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              {!loading && !error && dataStatus && (
                <div className={`alert ${dataStatus.includes('latest data') ? 'alert-success' : 'alert-warning'}`} role="alert">
                  <strong>Data Status:</strong> {dataStatus}
                </div>
              )}
            </div>
          </Col>
        </Row>

        <Row className="g-4">
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <HumidityGauge humidity={gaugeData.humidity} />
              <h5>Humidity</h5>
              <p>{gaugeData.humidity ? `${gaugeData.humidity}%` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <TemperatureGauge temperature={gaugeData.temperature} />
              <h5>Temperature</h5>
              <p>{gaugeData.temperature ? `${gaugeData.temperature}°C` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <AirPressureGauge airPressure={gaugeData.airPressure} />
              <h5>Air Pressure</h5>
              <p>{gaugeData.airPressure !== undefined ? `${gaugeData.airPressure} mbar` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <WindSpeedGauge windspeed={gaugeData.windspeed} />
              <h5>Wind Speed</h5>
              <p>{gaugeData.windspeed !== undefined ? `${gaugeData.windspeed} km/h` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <IrradiationGauge irradiation={gaugeData.irradiation} />
              <h5>Irradiation</h5>
              <p>{gaugeData.irradiation !== undefined ? `${gaugeData.irradiation} W/m²` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <OxygenGauge oxygen={gaugeData.oxygen} />
              <h5>Upper Water Temp</h5>
              <p>{gaugeData.oxygen !== undefined ? `${gaugeData.oxygen}°C` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <RainfallGauge rainfall={gaugeData.rainfall} />
              <h5>Rainfall</h5>
              <p>{gaugeData.rainfall !== undefined ? `${gaugeData.rainfall} mm` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)'}}>
              <WindDirectionGauge windDirection={gaugeData.windDirection} />
              <h5>Wind Direction</h5>
              <p>{gaugeData.windDirection !== undefined ? `${gaugeData.windDirection}°` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <WaterTemperatureGauge waterTemperature={gaugeData.waterTemperature} />
              <h5>Water Temperature (Lower)</h5>
              <p>{gaugeData.waterTemperature !== undefined ? `${gaugeData.waterTemperature}°C` : 'N/A'}</p>
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

        {/* chart 9 data utama */}
        <Row>
          <Col>
            <h2 className="text-center" style={{ color: '#007bff' }}>Chart Status</h2>
          </Col>
        </Row>

        <Row>
          <Col>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <TrendChart
                data={chartData}
                fields={[
                  { key: 'humidity', label: 'Humidity (%)' },
                  { key: 'temperature', label: 'Temperature (°C)' },
                  { key: 'airPressure', label: 'Air Pressure (mbar)' },
                  { key: 'windspeed', label: 'Wind Speed (km/h)' },
                  { key: 'irradiation', label: 'Irradiation (W/m²)' },
                  { key: 'oxygen', label: 'Upper Water Temp (°C)' },
                  { key: 'rainfall', label: 'Rainfall (mm)' },
                  { key: 'windDirection', label: 'Wind Direction (°)' },
                  { key: 'waterTemperature', label: 'Water Temperature Lower (°C)' }
                ]}
              />
            </div>
          </Col>
        </Row>

        {/* ini buat tabel nya */}
        <Row className="mt-5">
          <Col>
            <h2 className="text-center" style={{ color: '#007bff' }}>Table Status</h2>
            
            {/* Legend for table badges */}
            {tableData.length > 0 && (
              <div className="text-center mb-3">
                <small className="text-muted">
                  <span className="badge bg-primary me-2">Latest</span>
                  Most recent data entry
                  <span className="ms-3">
                    <span className="badge bg-success me-2">Used in Gauge</span>
                    Data currently displayed in gauges above
                  </span>
                </small>
              </div>
            )}
          </Col>
        </Row>
        <Row>
          <Col>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)', overflowX: 'auto' }}>
              {tableData.length > 0 ? (
                <Table striped bordered hover variant="light" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Timestamp</th>
                      <th>Humidity (%)</th>
                      <th>Temperature (°C)</th>
                      <th>Air Pressure (mbar)</th>
                      <th>Wind Speed (km/h)</th>
                      <th>Irradiation (W/m²)</th>
                      <th>Upper Water Temp (°C)</th>
                      <th>Rainfall (mm)</th>
                      <th>Wind Direction (°)</th>
                      <th>Water Temperature Lower (°C)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((item, index) => {
                      // Determine if this is the latest entry
                      const isLatest = index === 0;
                      
                      // Determine if this data is used in gauges
                      const isUsedInGauge = (
                        item.humidity === gaugeData.humidity &&
                        item.temperature === gaugeData.temperature &&
                        item.airPressure === gaugeData.airPressure &&
                        item.windspeed === gaugeData.windspeed &&
                        item.irradiation === gaugeData.irradiation &&
                        item.oxygen === gaugeData.oxygen &&
                        item.rainfall === gaugeData.rainfall &&
                        item.windDirection === gaugeData.windDirection &&
                        item.waterTemperature === gaugeData.waterTemperature
                      );
                      
                      return (
                        <tr key={index}>
                          <td>
                            <div className="d-flex flex-column gap-1">
                              {isLatest && <span className="badge bg-primary">Latest</span>}
                              {isUsedInGauge && <span className="badge bg-success">Used in Gauge</span>}
                            </div>
                          </td>
                          <td>{formatUserFriendlyTimestamp(item.timestamp)}</td>
                          <td>{item.humidity}</td>
                          <td>{item.temperature}</td>
                          <td>{item.airPressure}</td>
                          <td>{item.windspeed}</td>
                          <td>{item.irradiation}</td>
                          <td>{item.oxygen}</td>
                          <td>{item.rainfall}</td>
                          <td>{item.windDirection}</td>
                          <td>{item.waterTemperature}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center" style={{ color: '#007bff' }}>
                  {loading ? 'Loading data...' : 'No data available for the selected filter'}
                </p>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Station1;