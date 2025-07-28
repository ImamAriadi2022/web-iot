import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Col, Container, Row, Table } from 'react-bootstrap';
import TrendChart from "./chart";
import HumidityGauge from './status/HumidityGauge';
import IrradiationGauge from './status/Irradiation';
import RainfallGauge from './status/Rainfall';
import TemperatureGauge from './status/TemperaturGauge';
import WindDirectionGauge from './status/WindDirection';
import WindSpeedGauge from './status/WindSpeed';
import AirPressureGauge from './status/AirPressure';
import WaterTemperatureGauge from './status/WaterTemperature';
import { resampleTimeSeriesWithMeanFill } from './chart';

// Helper
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
    'Utara Barat Laut': 'North-Northwest',
    'Utara Timur Laut': 'North-Northeast',
  };
  return map[dir] || dir;
};

const formatUserFriendlyTimestamp = (timestamp) => {
  if (!timestamp || timestamp === 'error' || timestamp === 'alat rusak') {
    return timestamp;
  }
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return timestamp;
    }
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
    return timestamp;
  }
};

const isValidValue = (val) =>
  val !== null && val !== undefined && val !== 'error' && val !== 'alat rusak' && !isNaN(Number(val));


const parseCustomTimestamp = (ts) => {
  // Format: "28-07-25 06:30:00" => "2025-07-28T06:30:00"
  if (!ts || typeof ts !== 'string') return ts;
  const match = ts.match(/^(\d{2})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return ts;
  const [_, dd, mm, yy, h, m, s] = match;
  // Asumsi tahun 20xx
  return `20${yy}-${mm}-${dd}T${h}:${m}:${s}`;
};


// Fungsi mapping data dari API
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
      bmptemperature: 'error',
      airpressure: 'error',
      suhuair: 'error',
    };
  }
  let ts = item.timestamp;
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
      bmptemperature: 'alat rusak',
      airpressure: 'alat rusak',
      suhuair: 'alat rusak',
    };
  }
  ts = parseCustomTimestamp(ts); // <-- parsing timestamp agar valid untuk JS Date
  return {
    timestamp: ts,
    humidity: isValidValue(item.humidity) ? Number(item.humidity) : 'alat rusak',
    temperature: isValidValue(item.temperature) ? Number(item.temperature) : 'alat rusak',
    rainfall: isValidValue(item.rainfall) ? Number(item.rainfall) : 'alat rusak',
    windspeed: isValidValue(item.windSpeed ?? item.windspeed) ? Number(item.windSpeed ?? item.windspeed) : 'alat rusak',
    irradiation: isValidValue(item.irradiation) ? Number(item.irradiation) : 'alat rusak',
    windDirection: windDirectionToEnglish(item.direction ?? ''),
    angle: isValidValue(item.angle) ? Number(item.angle) : 'alat rusak',
    bmptemperature: isValidValue(item.bmpTemperature ?? item.bmptemperature) ? Number(item.bmpTemperature ?? item.bmptemperature) : 'alat rusak',
    airpressure: isValidValue(item.AirPressure ?? item.airpressure) ? Number(item.AirPressure ?? item.airpressure) : 'alat rusak',
    suhuair: isValidValue(item.suhuAir ?? item.suhuair) ? Number(item.suhuAir ?? item.suhuair) : 'alat rusak',
  };
};



function filterByRange(data, filter) {
  if (!Array.isArray(data) || data.length === 0) return [];
  const timestamps = data
    .map(d => new Date(d.timestamp))
    .filter(d => !isNaN(d.getTime()));
  if (timestamps.length === 0) return [];
  const maxDate = new Date(Math.max(...timestamps));
  let minDate;
  if (filter === '1d') minDate = new Date(maxDate.getTime() - 24 * 60 * 60 * 1000);
  else if (filter === '7d') minDate = new Date(maxDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  else if (filter === '1m') minDate = new Date(maxDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  else minDate = null;

  return minDate
    ? data.filter(d => {
        const t = new Date(d.timestamp);
        return t >= minDate && t <= maxDate;
      })
    : data;
}

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
    angle: 0,
    bmptemperature: 0,
    airpressure: 0,
    suhuair: 0,
  });
  const [dataStatus, setDataStatus] = useState('');

  const API_URL = process.env.REACT_APP_API_PETENGORAN_RESAMPLE15M_STATION1;


  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = API_URL;
      if (!url) throw new Error(`No API URL configured`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      // Urutkan data dari yang terbaru
      let result = Array.isArray(data.data?.result) ? data.data.result : [];
      result = result
        .map(mapApiData)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // terbaru di atas
      result = result.slice(0, 10); // ambil 10 data terbaru
      setAllData(result);
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
      setAllData([]);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

    useEffect(() => {
      const filtered = filterByRange(allData, filter);
      setFilteredData(filtered);
  
      // Resample data per 1 menit
      const fields = [
        'humidity', 'temperature', 'rainfall', 'windspeed', 'irradiation',
        'angle', 'airpressure', 'bmptemperature', 'suhuair'
      ];
      const resampled = resampleTimeSeriesWithMeanFill(filtered, 1, fields);
  
      // Ambil 10 data terakhir (paling baru) dari hasil resampling
      const sorted = [...resampled].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const last10 = sorted.slice(0, 10);
  
      setTableData(last10);
  
      const latestResampled = last10[0];
      if (latestResampled) {
        setGaugeData({
          humidity: latestResampled.humidity,
          temperature: latestResampled.temperature,
          rainfall: latestResampled.rainfall,
          windspeed: latestResampled.windspeed,
          irradiation: latestResampled.irradiation,
          windDirection: latestResampled.windDirection,
          angle: latestResampled.angle,
          bmptemperature: latestResampled.bmptemperature,
          airpressure: latestResampled.airpressure,
          suhuair: latestResampled.suhuair,
        });
        setDataStatus('Using latest resampled data for gauges');
      } else {
        setGaugeData({
          humidity: 0,
          temperature: 0,
          rainfall: 0,
          windspeed: 0,
          irradiation: 0,
          windDirection: '',
          angle: 0,
          bmptemperature: 0,
          airpressure: 0,
          suhuair: 0,
        });
        setDataStatus('No valid data available');
      }
    }, [allData, filter]);


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
          <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <HumidityGauge humidity={typeof gaugeData.humidity === 'number' ? gaugeData.humidity : 0} />
              <h5>Humidity</h5>
              <p>{typeof gaugeData.humidity === 'number' ? `${gaugeData.humidity}%` : gaugeData.humidity}</p>
            </div>
          </Col>
          <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <TemperatureGauge temperature={typeof gaugeData.temperature === 'number' ? gaugeData.temperature : 0} />
              <h5>Temperature</h5>
              <p>{typeof gaugeData.temperature === 'number' ? `${gaugeData.temperature}°C` : gaugeData.temperature}</p>
            </div>
          </Col>
          <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <RainfallGauge rainfall={typeof gaugeData.rainfall === 'number' ? gaugeData.rainfall : 0} />
              <h5>Rainfall</h5>
              <p>{typeof gaugeData.rainfall === 'number' ? `${gaugeData.rainfall} mm` : gaugeData.rainfall}</p>
            </div>
          </Col>
          <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <WindSpeedGauge windspeed={typeof gaugeData.windspeed === 'number' ? gaugeData.windspeed : 0} />
              <h5>Wind Speed</h5>
              <p>{typeof gaugeData.windspeed === 'number' ? `${gaugeData.windspeed} km/h` : gaugeData.windspeed}</p>
            </div>
          </Col>
          <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <IrradiationGauge irradiation={typeof gaugeData.irradiation === 'number' ? gaugeData.irradiation : 0} />
              <h5>Irradiation</h5>
              <p>{typeof gaugeData.irradiation === 'number' ? `${gaugeData.irradiation} W/m²` : gaugeData.irradiation}</p>
            </div>
          </Col>
          <Col md={3} className="text-center">
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
          <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <AirPressureGauge airPressure={typeof gaugeData.airpressure === 'number' ? gaugeData.airpressure : 0} />
              <h5>Air Pressure</h5>
              <p>{typeof gaugeData.airpressure === 'number' ? `${gaugeData.airpressure} hPa` : gaugeData.airpressure}</p>
            </div>
          </Col>
          <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <TemperatureGauge temperature={typeof gaugeData.bmptemperature === 'number' ? gaugeData.bmptemperature : 0} />
              <h5>BMP Temperature</h5>
              <p>{typeof gaugeData.bmptemperature === 'number' ? `${gaugeData.bmptemperature}°C` : gaugeData.bmptemperature}</p>
            </div>
          </Col>
          <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <WaterTemperatureGauge waterTemperature={typeof gaugeData.suhuair === 'number' ? gaugeData.suhuair : 0} />
              <h5>Water Temperature</h5>
              <p>{typeof gaugeData.suhuair === 'number' ? `${gaugeData.suhuair}°C` : gaugeData.suhuair}</p>
            </div>
          </Col>
        </Row>
        <Row className="mt-5 mb-3">
          <Col className="text-center">
            {/* <ButtonGroup>
              <Button
                variant={filter === '1d' ? 'primary' : 'outline-primary'}
                onClick={() => setFilter('1d')}
              >
                1 Hari Terakhir
              </Button>
              <Button
                variant={filter === '7d' ? 'primary' : 'outline-primary'}
                onClick={() => setFilter('7d')}
              >
                7 Hari Terakhir
              </Button>
              <Button
                variant={filter === '1m' ? 'primary' : 'outline-primary'}
                onClick={() => setFilter('1m')}
              >
                1 Bulan Terakhir
              </Button>
            </ButtonGroup> */}
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
                  data={allData}
                  fields={[
                    { key: 'humidity', label: 'Humidity (%)' },
                    { key: 'temperature', label: 'Temperature (°C)' },
                    { key: 'rainfall', label: 'Rainfall (mm)' },
                    { key: 'windspeed', label: 'Wind Speed (km/h)' },
                    { key: 'irradiation', label: 'Irradiation (W/m²)' },
                    { key: 'angle', label: 'Wind Direction (°)' },
                    { key: 'airpressure', label: 'Air Pressure (hPa)' },
                    { key: 'bmptemperature', label: 'BMP Temperature (°C)' },
                    { key: 'suhuair', label: 'Water Temperature (°C)' },
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
                      <th>Air Pressure (hPa)</th>
                      <th>BMP Temperature (°C)</th>
                      <th>Water Temperature (°C)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.slice(0, 10).map((item, index) => {
                      const isLatest = index === 0;
                      const isUsedInGauge = (
                        item.humidity === gaugeData.humidity &&
                        item.temperature === gaugeData.temperature &&
                        item.rainfall === gaugeData.rainfall &&
                        item.windspeed === gaugeData.windspeed &&
                        item.irradiation === gaugeData.irradiation &&
                        item.angle === gaugeData.angle &&
                        item.airpressure === gaugeData.airpressure &&
                        item.bmptemperature === gaugeData.bmptemperature &&
                        item.suhuair === gaugeData.suhuair
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
                          <td>{item.airpressure}</td>
                          <td>{item.bmptemperature}</td>
                          <td>{item.suhuair}</td>
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