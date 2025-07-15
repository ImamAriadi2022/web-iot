import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Col, Container, Row, Table } from 'react-bootstrap';

import TrendChart from "./chart";

// Import komponen yang dibutuhkan
import HumidityGauge from './status/HumidityGauge';
import IrradiationGauge from './status/Irradiation';
import RainfallGauge from './status/Rainfall';
import TemperatureGauge from './status/TemperaturGauge';
import WindDirectionGauge from './status/WindDirection';
import WindspeedGauge from './status/WindSpeed';

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

// Mapping function untuk menyesuaikan field backend ke frontend Petengoran
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
  '1d': process.env.REACT_APP_API_PETENGORAN + 'data/oneday',
  '7d': process.env.REACT_APP_API_PETENGORAN + 'data/sevendays',
  '1m': process.env.REACT_APP_API_PETENGORAN + 'data/onemonth',
};

const Station1 = () => {
  const [filter, setFilter] = useState('1d');
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
  // New state variables for better status tracking and gauge data
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
    console.log('[Petengoran Station1] determineGaugeData called with data length:', data.length);
    
    if (!data || data.length === 0) {
      console.log('[Petengoran Station1] No data available');
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

    console.log('[Petengoran Station1] Sorted data (latest first):', sortedData.slice(0, 3));

    // Find the latest valid data for gauges
    let validData = null;
    let latestEntryIndex = -1;
    
    for (let i = 0; i < sortedData.length; i++) {
      const item = sortedData[i];
      
      // Check if timestamp is valid
      if (!item.timestamp || 
          item.timestamp === 'error' || 
          item.timestamp === 'alat rusak' ||
          isNaN(new Date(item.timestamp).getTime())) {
        console.log(`[Petengoran Station1] Invalid timestamp at index ${i}:`, item.timestamp);
        continue;
      }

      // Check if essential data fields are valid (numeric values)
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
        console.log(`[Petengoran Station1] Found valid data at index ${i}:`, item);
        break;
      } else {
        console.log(`[Petengoran Station1] Invalid data at index ${i}:`, item);
      }
    }

    if (!validData) {
      console.log('[Petengoran Station1] No valid data found');
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
    const latestTimestamp = new Date(validData.timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - latestTimestamp) / (1000 * 60));
    
    let statusMessage = '';
    if (latestEntryIndex === 0) {
      statusMessage = `Latest data (${diffMinutes} minutes ago)`;
    } else {
      statusMessage = `Using valid data from ${latestEntryIndex + 1} entries ago (${diffMinutes} minutes ago)`;
    }
    
    setDataStatus(statusMessage);
    
    return {
      humidity: validData.humidity ?? 0,
      temperature: validData.temperature ?? 0,
      rainfall: validData.rainfall ?? 0,
      windspeed: validData.windspeed ?? 0,
      irradiation: validData.irradiation ?? 0,
      windDirection: validData.windDirection ?? '',
      angle: validData.angle ?? 0
    };
  };

  // Fetch data with proper error handling
  const fetchData = async (selectedFilter) => {
    setLoading(true);
    setError(null);
    
    const apiUrl = API_MAP[selectedFilter];
    
    if (!apiUrl) {
      console.error('[Petengoran Station1] API URL not found for filter:', selectedFilter);
      setError('API configuration error');
      setLoading(false);
      return;
    }

    console.log(`[Petengoran Station1] Fetching data from: ${apiUrl}`);

    try {
      const response = await fetch(apiUrl);
      console.log(`[Petengoran Station1] Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      console.log('[Petengoran Station1] Raw API response:', jsonData);

      // Handle different response structures
      let rawData = [];
      if (Array.isArray(jsonData)) {
        rawData = jsonData;
      } else if (jsonData.result && Array.isArray(jsonData.result)) {
        rawData = jsonData.result;
      } else if (jsonData.data && Array.isArray(jsonData.data)) {
        rawData = jsonData.data;
      } else {
        console.error('[Petengoran Station1] Unexpected response structure:', jsonData);
        throw new Error('Unexpected API response structure');
      }

      console.log(`[Petengoran Station1] Processing ${rawData.length} records`);

      // Map the data
      const mappedData = rawData.map(mapApiData);
      console.log('[Petengoran Station1] Mapped data sample:', mappedData.slice(0, 3));

      // Sort by timestamp (latest first)
      const sortedData = mappedData.sort((a, b) => {
        const timeA = new Date(a.timestamp);
        const timeB = new Date(b.timestamp);
        return timeB - timeA;
      });

      setAllData(sortedData);

      // Determine which data to display based on filter
      let filteredResults = sortedData;
      if (selectedFilter === '1d') {
        // Show all data for 1 day
        filteredResults = sortedData;
      } else {
        // For 7 days and 1 month, show one data point per day
        filteredResults = getOneDataPerDay(sortedData);
      }

      setFilteredData(filteredResults);
      setTableData(filteredResults.slice(0, 10)); // Show top 10 in table

      // Set gauge data from latest valid entry
      const newGaugeData = determineGaugeData(sortedData);
      setGaugeData(newGaugeData);

      console.log('[Petengoran Station1] Data processing completed:', {
        total: sortedData.length,
        filtered: filteredResults.length,
        tableEntries: Math.min(filteredResults.length, 10),
        gaugeData: newGaugeData
      });

    } catch (error) {
      console.error('[Petengoran Station1] Error fetching data:', error);
      setError(`Failed to fetch data: ${error.message}`);
      setAllData([]);
      setFilteredData([]);
      setTableData([]);
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

  // useEffect to fetch data on component mount and filter change
  useEffect(() => {
    fetchData(filter);
  }, [filter]);

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    console.log('[Petengoran Station1] Filter changed to:', newFilter);
    setFilter(newFilter);
  };

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <h2 className="text-center mb-4 fw-bold text-primary">
            Petengoran - Station 1
          </h2>
        </Col>
      </Row>

      {/* Status and Filter Row */}
      <Row className="mb-4">
        <Col md={6}>
          <div className="d-flex align-items-center">
            <span className="me-3 fw-bold">Status:</span>
            <span className={`badge ${loading ? 'bg-warning' : error ? 'bg-danger' : 'bg-success'}`}>
              {loading ? 'Loading...' : error ? 'Error' : 'Connected'}
            </span>
            {dataStatus && (
              <span className="ms-3 text-muted small">
                {dataStatus}
              </span>
            )}
          </div>
        </Col>
        <Col md={6} className="text-end">
          <ButtonGroup aria-label="Data filter">
            <Button
              variant={filter === '1d' ? 'primary' : 'outline-primary'}
              onClick={() => handleFilterChange('1d')}
              disabled={loading}
            >
              1 Day
            </Button>
            <Button
              variant={filter === '7d' ? 'primary' : 'outline-primary'}
              onClick={() => handleFilterChange('7d')}
              disabled={loading}
            >
              7 Days
            </Button>
            <Button
              variant={filter === '1m' ? 'primary' : 'outline-primary'}
              onClick={() => handleFilterChange('1m')}
              disabled={loading}
            >
              1 Month
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      {/* Error Display */}
      {error && (
        <Row className="mb-4">
          <Col>
            <div className="alert alert-danger" role="alert">
              <strong>Error:</strong> {error}
            </div>
          </Col>
        </Row>
      )}

      {/* Gauges Row */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <HumidityGauge humidity={typeof gaugeData.humidity === 'number' ? gaugeData.humidity : 0} />
        </Col>
        <Col md={4} className="mb-3">
          <TemperatureGauge temperature={typeof gaugeData.temperature === 'number' ? gaugeData.temperature : 0} />
        </Col>
        <Col md={4} className="mb-3">
          <RainfallGauge rainfall={typeof gaugeData.rainfall === 'number' ? gaugeData.rainfall : 0} />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <WindspeedGauge windspeed={typeof gaugeData.windspeed === 'number' ? gaugeData.windspeed : 0} />
        </Col>
        <Col md={4} className="mb-3">
          <IrradiationGauge irradiation={typeof gaugeData.irradiation === 'number' ? gaugeData.irradiation : 0} />
        </Col>
        <Col md={4} className="mb-3">
          <WindDirectionGauge direction={gaugeData.windDirection || ''} angle={typeof gaugeData.angle === 'number' ? gaugeData.angle : 0} />
        </Col>
      </Row>

      {/* Chart Section */}
      <Row className="mb-4">
        <Col>
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Data Trends</h5>
            </div>
            <div className="card-body">
              {filteredData.length > 0 ? (
                <TrendChart data={filteredData} />
              ) : (
                <div className="text-center py-4">
                  <span className="text-muted">
                    {loading ? 'Loading chart data...' : 'No data available for chart'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Data Table */}
      <Row>
        <Col>
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Data (Latest 10 entries)</h5>
              <small>Total records: {allData.length}</small>
            </div>
            <div className="card-body p-0">
              <Table striped hover responsive className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Timestamp</th>
                    <th>Humidity (%)</th>
                    <th>Temperature (°C)</th>
                    <th>Rainfall (mm)</th>
                    <th>Wind Speed (m/s)</th>
                    <th>Irradiation (W/m²)</th>
                    <th>Wind Direction</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : tableData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    tableData.map((item, index) => (
                      <tr key={index}>
                        <td>{formatUserFriendlyTimestamp(item.timestamp)}</td>
                        <td>{typeof item.humidity === 'number' ? item.humidity.toFixed(1) : item.humidity}</td>
                        <td>{typeof item.temperature === 'number' ? item.temperature.toFixed(1) : item.temperature}</td>
                        <td>{typeof item.rainfall === 'number' ? item.rainfall.toFixed(1) : item.rainfall}</td>
                        <td>{typeof item.windspeed === 'number' ? item.windspeed.toFixed(1) : item.windspeed}</td>
                        <td>{typeof item.irradiation === 'number' ? Math.round(item.irradiation) : item.irradiation}</td>
                        <td>{item.windDirection || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Station1;
