
import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Col, Container, Row, Table } from 'react-bootstrap';
import TrendChart from "./chart";
import HumidityGauge from './status/HumidityGauge';
import IrradiationGauge from './status/Irradiation';
import RainfallGauge from './status/Rainfall';
import TemperatureGauge from './status/TemperaturGauge';
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
    'Timur Tenggara': 'East-Southeast',
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

// Fungsi untuk format timestamp yang user-friendly
const formatUserFriendlyTimestamp = (timestamp) => {
  if (!timestamp || timestamp === 'error' || timestamp === 'alat rusak') {
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
    humidity: item.humidity ?? 'alat rusak',
    temperature: item.temperature ?? 'alat rusak',
    rainfall: item.rainfall ?? 'alat rusak',
    windspeed: item.windspeed ?? item.windspeed ?? item.wind_speed ?? 'alat rusak',
    irradiation: item.irradiation ?? 'alat rusak',
    windDirection: windDirectionToEnglish(item.direction ?? ''),
    angle: item.angle ?? 'alat rusak',
  };
};


console.log('ENV DAILY:', process.env.REACT_APP_API_PETENGORAN_DAILY_STATION1);
console.log('ENV 1M:', process.env.REACT_APP_API_PETENGORAN_RESAMPLE15M_STATION1);
const API_MAP = {
  '1d': process.env.REACT_APP_API_PETENGORAN_DAILY_STATION1,
  '7d': process.env.REACT_APP_API_PETENGORAN_DAILY_STATION1, // fallback ke daily
  '1m': process.env.REACT_APP_API_PETENGORAN_RESAMPLE15M_STATION1,
};
console.log('API_MAP PETENGORAN:', API_MAP);


const Station1 = () => {
  const [filter, setFilter] = useState('1d');
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gaugeData, setGaugeData] = useState({
    humidity: 0,
    temperature: 0,
    rainfall: 0,
    windspeed: 0,
    irradiation: 0,
    windDirection: '',
    angle: 0
  });
  const [dataStatus, setDataStatus] = useState('');

  // Function to determine which data to use for gauges (latest valid data)
  const determineGaugeData = (data) => {
    if (!data || data.length === 0) {
      setDataStatus('No data available');
      return {
        humidity: 0,
        temperature: 0,
        rainfall: 0,
        windspeed: 0,
        irradiation: 0,
        windDirection: '',
        angle: 0
      };
    }
    // Sort data by timestamp (latest first)
    const sortedData = [...data].sort((a, b) => {
      const timeA = new Date(a.timestamp);
      const timeB = new Date(b.timestamp);
      return timeB - timeA;
    });
    // Find the latest valid data for gauges
    let validData = null;
    let latestEntryIndex = -1;
    for (let i = 0; i < sortedData.length; i++) {
      const item = sortedData[i];
      if (!item.timestamp || item.timestamp === 'error' || item.timestamp === 'alat rusak' || isNaN(new Date(item.timestamp).getTime())) {
        continue;
      }
      // Accept both number and string (for 'alat rusak')
      const isValidData = (
        typeof item.humidity === 'number' && !isNaN(item.humidity) &&
        typeof item.temperature === 'number' && !isNaN(item.temperature) &&
        typeof item.rainfall === 'number' && !isNaN(item.rainfall) &&
        typeof item.windspeed === 'number' && !isNaN(item.windspeed) &&
        typeof item.irradiation === 'number' && !isNaN(item.irradiation) &&
        typeof item.angle === 'number' && !isNaN(item.angle)
      );
      if (isValidData) {
        validData = item;
        latestEntryIndex = i;
        break;
      }
    }
    if (!validData) {
      setDataStatus('No valid data available');
      return {
        humidity: 0,
        temperature: 0,
        rainfall: 0,
        windspeed: 0,
        irradiation: 0,
        windDirection: '',
        angle: 0
      };
    }
    // Set status message
    if (latestEntryIndex === 0) {
      setDataStatus('Using latest data for gauges');
    } else {
      setDataStatus(`Using data from ${latestEntryIndex + 1} entries ago (${formatUserFriendlyTimestamp(validData.timestamp)})`);
    }
    return {
      humidity: validData.humidity,
      temperature: validData.temperature,
      rainfall: validData.rainfall,
      windspeed: validData.windspeed,
      irradiation: validData.irradiation,
      windDirection: validData.windDirection,
      angle: validData.angle
    };
  };

  // Fetch data dari API sesuai filter
  const fetchData = async (filterType) => {
    setLoading(true);
    setError(null);
    try {
      const url = API_MAP[filterType];
      if (!url) throw new Error(`No API URL configured for filter: ${filterType}`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      // Perbaikan: akses data.data.result sesuai struktur response
      const mapped = Array.isArray(data.data?.result) ? data.data.result.map(mapApiData) : [];
      mapped.sort((a, b) => {
        if (a.timestamp === 'error' || a.timestamp === 'alat rusak' || b.timestamp === 'error' || b.timestamp === 'alat rusak') {
          return (a.timestamp === 'error' || a.timestamp === 'alat rusak') ? 1 : -1;
        }
        const timeA = new Date(a.timestamp);
        const timeB = new Date(b.timestamp);
        return timeB - timeA;
      });
      setAllData(mapped);
      const newGaugeData = determineGaugeData(mapped);
      setGaugeData(newGaugeData);
    } catch (error) {
      setError(`Failed to fetch data: ${error.message}`);
      setAllData([]);
      setGaugeData({
        humidity: 0,
        temperature: 0,
        rainfall: 0,
        windspeed: 0,
        irradiation: 0,
        windDirection: '',
        angle: 0
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
    setFilteredData(allData);
    if (filter === '7d' || filter === '1m') {
      setTableData(getOneDataPerDay(allData));
    } else {
      setTableData(allData);
    }
    if (allData.length > 0) {
      const newGaugeData = determineGaugeData(allData);
      setGaugeData(newGaugeData);
    }
  }, [allData, filter]);

  // Prepare chart data (sort chronologically for better chart visualization)
  const chartData = [...filteredData].sort((a, b) => {
    if (a.timestamp === 'error' || a.timestamp === 'alat rusak' || b.timestamp === 'error' || b.timestamp === 'alat rusak') {
      return 0;
    }
    const timeA = new Date(a.timestamp);
    const timeB = new Date(b.timestamp);
    return timeA - timeB;
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
            <p className="text-center">Data collected from Station 1 (Petengoran)</p>
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
              <HumidityGauge humidity={typeof gaugeData.humidity === 'number' ? gaugeData.humidity : 0} />
              <h5>Humidity</h5>
              <p>{typeof gaugeData.humidity === 'number' ? `${gaugeData.humidity}%` : gaugeData.humidity}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <TemperatureGauge temperature={typeof gaugeData.temperature === 'number' ? gaugeData.temperature : 0} />
              <h5>Temperature</h5>
              <p>{typeof gaugeData.temperature === 'number' ? `${gaugeData.temperature}°C` : gaugeData.temperature}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <RainfallGauge rainfall={typeof gaugeData.rainfall === 'number' ? gaugeData.rainfall : 0} />
              <h5>Rainfall</h5>
              <p>{typeof gaugeData.rainfall === 'number' ? `${gaugeData.rainfall} mm` : gaugeData.rainfall}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <WindSpeedGauge windspeed={typeof gaugeData.windspeed === 'number' ? gaugeData.windspeed : 0} />
              <h5>Wind Speed</h5>
              <p>{typeof gaugeData.windspeed === 'number' ? `${gaugeData.windspeed} km/h` : gaugeData.windspeed}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <IrradiationGauge irradiation={typeof gaugeData.irradiation === 'number' ? gaugeData.irradiation : 0} />
              <h5>Irradiation</h5>
              <p>{typeof gaugeData.irradiation === 'number' ? `${gaugeData.irradiation} W/m²` : gaugeData.irradiation}</p>
            </div>
          </Col>
          <Col md={4} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)'}}>
              <WindDirectionGauge windDirection={gaugeData.angle} />
              <h5>Wind Direction</h5>
              <p>
                {gaugeData.windDirection 
                  ? `${gaugeData.windDirection} (${gaugeData.angle}°)`
                  : gaugeData.angle}
              </p>
            </div>
          </Col>
        </Row>
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
                    { key: 'rainfall', label: 'Rainfall (mm)' },
                    { key: 'windspeed', label: 'Wind Speed (km/h)' },
                    { key: 'irradiation', label: 'Irradiation (W/m²)' },
                    { key: 'angle', label: 'Wind Direction (°)' }
                  ]}
                />
            </div>
          </Col>
        </Row>
        <Row className="mt-5">
          <Col>
            <h2 className="text-center" style={{ color: '#007bff' }}>Table Status</h2>
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
                      <th>Rainfall (mm)</th>
                      <th>Wind Speed (km/h)</th>
                      <th>Irradiation (W/m²)</th>
                      <th>Wind Direction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((item, index) => {
                      const isLatest = index === 0;
                      const isUsedInGauge = (
                        item.humidity === gaugeData.humidity &&
                        item.temperature === gaugeData.temperature &&
                        item.rainfall === gaugeData.rainfall &&
                        item.windspeed === gaugeData.windspeed &&
                        item.irradiation === gaugeData.irradiation &&
                        item.angle === gaugeData.angle
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
                          <td>{item.rainfall}</td>
                          <td>{item.windspeed}</td>
                          <td>{item.irradiation}</td>
                          <td>{item.windDirection}</td>
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
