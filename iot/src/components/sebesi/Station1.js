import { useEffect, useState } from 'react';
import { Col, Container, Row, Table } from 'react-bootstrap';

import TrendChart from "./chart";
import AirPressureGauge from './status/AirPressure';
import HumidityGauge from './status/HumidityGauge';
import IrradiationGauge from './status/Irradiation';
import OxygenGauge from './status/Oxygen';
import RainfallGauge from './status/Rainfall';
import TemperatureGauge from './status/TemperaturGauge';
import WaterTemperatureGauge from './status/WaterTemperature';
import WindDirectionGauge from './status/WindDirection';
import WindSpeedGauge from './status/WindSpeed';

// Helper
const formatUserFriendlyTimestamp = (timestamp) => {
  if (!timestamp || timestamp === 'alat rusak' || timestamp === 'server sedang eror') {
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
  val !== null && val !== undefined && val !== 'alat rusak' && !isNaN(Number(val));

const mapApiData = (item) => {
  if (!item) {
    return {
      timestamp: 'alat rusak',
      humidity: 'alat rusak',
      temperature: 'alat rusak',
      airPressure: 'alat rusak',
      windspeed: 'alat rusak',
      irradiation: 'alat rusak',
      oxygen: 'alat rusak',
      rainfall: 'alat rusak',
      windDirection: 'alat rusak',
      waterTemperature: 'alat rusak',
    };
  }
  const ts = item.TS || item.timestamp || item.createdAt;
  return {
    timestamp: ts,
    humidity: isValidValue(item.Humidity) ? Number(item.Humidity) : 'alat rusak',
    temperature: isValidValue(item.Temperature) ? Number(item.Temperature) : 'alat rusak',
    airPressure: isValidValue(item.AirPressure) ? Number(item.AirPressure) : 'alat rusak',
    windspeed: isValidValue(item.AnemometerSpeed) ? Number(item.AnemometerSpeed) : 'alat rusak',
    irradiation: isValidValue(item.SolarRadiation) ? Number(item.SolarRadiation) : 'alat rusak',
    oxygen: isValidValue(item.Suhu_Air_Atas) ? Number(item.Suhu_Air_Atas) : 'alat rusak',
    rainfall: isValidValue(item.Rainfall) ? Number(item.Rainfall) : 'alat rusak',
    windDirection: item.Direction || 'alat rusak',
    waterTemperature: isValidValue(item.Suhu_Air_Bawah) ? Number(item.Suhu_Air_Bawah) : 'alat rusak',
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

const API_SEBESI_MONTHLY = process.env.REACT_APP_API_SEBESI_MONTHLY;

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
    airPressure: 0,
    windspeed: 0,
    irradiation: 0,
    oxygen: 0,
    rainfall: 0,
    windDirection: '',
    waterTemperature: 0,
  });
  const [dataStatus, setDataStatus] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = API_SEBESI_MONTHLY;
      if (!url) throw new Error(`No API URL configured`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      let rawData = [];
      if (Array.isArray(data)) {
        rawData = data;
      } else if (data && Array.isArray(data.result)) {
        rawData = data.result;
      } else if (data) {
        rawData = [data];
      }
      const mapped = rawData.map(mapApiData);
      mapped.sort((a, b) => {
        if (a.timestamp === 'alat rusak' || b.timestamp === 'alat rusak') {
          return a.timestamp === 'alat rusak' ? 1 : -1;
        }
        const timeA = new Date(a.timestamp);
        const timeB = new Date(b.timestamp);
        return timeB - timeA;
      });
      setAllData(mapped);
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

    setTableData([...filtered].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));

    const latest = filtered.find(
      item => item.timestamp && item.timestamp !== 'alat rusak' && !isNaN(new Date(item.timestamp).getTime())
    );
    if (latest) {
      setGaugeData({
        humidity: typeof latest.humidity === 'number' ? latest.humidity : null,
        temperature: typeof latest.temperature === 'number' ? latest.temperature : null,
        airPressure: typeof latest.airPressure === 'number' ? latest.airPressure : null,
        windspeed: typeof latest.windspeed === 'number' ? latest.windspeed : null,
        irradiation: typeof latest.irradiation === 'number' ? latest.irradiation : null,
        oxygen: typeof latest.oxygen === 'number' ? latest.oxygen : null,
        rainfall: typeof latest.rainfall === 'number' ? latest.rainfall : null,
        windDirection: typeof latest.windDirection === 'string' ? latest.windDirection : null,
        waterTemperature: typeof latest.waterTemperature === 'number' ? latest.waterTemperature : null,
      });
      setDataStatus('Using latest data for gauges');
    } else {
      setGaugeData({
        humidity: 0,
        temperature: 0,
        airPressure: 0,
        windspeed: 0,
        irradiation: 0,
        oxygen: 0,
        rainfall: 0,
        windDirection: '',
        waterTemperature: 0,
      });
      setDataStatus('No valid data available');
    }
  }, [allData, filter]);

  const chartData = [...filteredData].sort((a, b) => {
    if (a.timestamp === 'alat rusak' || b.timestamp === 'alat rusak') {
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
            <p className="text-center">Data collected from Station 1 (Sebesi)</p>
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
              <AirPressureGauge airPressure={typeof gaugeData.airPressure === 'number' ? gaugeData.airPressure : 0} />
              <h5>Air Pressure</h5>
              <p>{typeof gaugeData.airPressure === 'number' ? `${gaugeData.airPressure} mbar` : gaugeData.airPressure}</p>
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
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <OxygenGauge oxygen={typeof gaugeData.oxygen === 'number' ? gaugeData.oxygen : 0} />
              <h5>Upper Water Temp</h5>
              <p>{typeof gaugeData.oxygen === 'number' ? `${gaugeData.oxygen}°C` : gaugeData.oxygen}</p>
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
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)'}}>
              <WindDirectionGauge windDirection={gaugeData.windDirection} />
              <h5>Wind Direction</h5>
              <p>{gaugeData.windDirection ? `${gaugeData.windDirection}` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <WaterTemperatureGauge waterTemperature={typeof gaugeData.waterTemperature === 'number' ? gaugeData.waterTemperature : 0} />
              <h5>Water Temperature (Lower)</h5>
              <p>{typeof gaugeData.waterTemperature === 'number' ? `${gaugeData.waterTemperature}°C` : gaugeData.waterTemperature}</p>
            </div>
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
                  data={filteredData}
                  fields={[
                    { key: 'humidity', label: 'Humidity (%)' },
                    { key: 'temperature', label: 'Temperature (°C)' },
                    { key: 'airPressure', label: 'Air Pressure (mbar)' },
                    { key: 'windspeed', label: 'Wind Speed (km/h)' },
                    { key: 'irradiation', label: 'Irradiation (W/m²)' },
                    { key: 'oxygen', label: 'Upper Water Temp (°C)' },
                    { key: 'rainfall', label: 'Rainfall (mm)' },
                    { key: 'windDirection', label: 'Wind Direction' },
                    { key: 'waterTemperature', label: 'Water Temperature Lower (°C)' },
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
                      <th>Air Pressure (mbar)</th>
                      <th>Wind Speed (km/h)</th>
                      <th>Irradiation (W/m²)</th>
                      <th>Upper Water Temp (°C)</th>
                      <th>Rainfall (mm)</th>
                      <th>Wind Direction</th>
                      <th>Water Temperature Lower (°C)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.slice(0, 10).map((item, index) => {
                      const isLatest = index === 0;
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