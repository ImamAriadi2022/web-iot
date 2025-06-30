import { useEffect, useState } from 'react';
import { Col, Container, Row, Table } from 'react-bootstrap';

import TrendChart from './chart2';
import HumidityGauge from './status/HumidityGauge';
import TemperatureGauge from './status/TemperaturGauge';

// Helper: parse timestamp dan validasi
const parseTimestamp = (ts) => {
  if (!ts || typeof ts !== 'string') return 'alat rusak';
  
  console.log('Parsing timestamp:', ts);
  
  // Coba berbagai format timestamp
  try {
    // Format 1: DD-MM-YY HH:mm:ss
    if (ts.includes('-') && ts.includes(' ')) {
      const [date, time] = ts.split(' ');
      if (date && time) {
        const [day, month, year] = date.split('-');
        if (day && month && year) {
          const fullYear = year.length === 2 ? '20' + year : year;
          const iso = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}`;
          const d = new Date(iso);
          if (!isNaN(d.getTime())) {
            console.log('Successfully parsed timestamp:', iso);
            return iso;
          }
        }
      }
    }
    
    // Format 2: ISO format langsung
    const directDate = new Date(ts);
    if (!isNaN(directDate.getTime())) {
      console.log('Successfully parsed as ISO:', ts);
      return ts;
    }
    
    console.log('Failed to parse timestamp:', ts);
    return 'alat rusak';
  } catch (error) {
    console.log('Error parsing timestamp:', ts, error);
    return 'alat rusak';
  }
};

// Fungsi untuk format timestamp yang user-friendly
const formatUserFriendlyTimestamp = (timestamp) => {
  if (!timestamp || timestamp === 'alat rusak') {
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

const API_URL = process.env.REACT_APP_API_KALIMANTAN_TABLE_TOPIC2;

const Station2 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Station2: Fetching data from:', API_URL);
        
        if (!API_URL) {
          throw new Error('API_URL is not defined. Check environment variables.');
        }
        
        const response = await fetch(API_URL);
        
        console.log('Station2: Response status:', response.status);
        console.log('Station2: Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Station2: API Error:', errorText.substring(0, 200));
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const json = await response.json();
        console.log('Station2: Raw API response:', json);
        
        // Data backend: { result: [...] }
        const mapped = Array.isArray(json.result)
          ? json.result.map((item, index) => {
              console.log(`Station2: Processing item ${index}:`, item);
              
              const ts = item.timestamp;
              const parsedTs = parseTimestamp(ts);
              
              // Coba berbagai kemungkinan field names untuk humidity
              let humidity = 'alat rusak';
              if (item.humidity !== undefined && item.humidity !== null && !isNaN(item.humidity)) {
                humidity = parseFloat(item.humidity);
              } else if (item.hum_dht22 !== undefined && item.hum_dht22 !== null && !isNaN(item.hum_dht22)) {
                humidity = parseFloat(item.hum_dht22);
              } else if (item.kelembapan !== undefined && item.kelembapan !== null && !isNaN(item.kelembapan)) {
                humidity = parseFloat(item.kelembapan);
              }
              
              // Coba berbagai kemungkinan field names untuk temperature
              let temperature = 'alat rusak';
              if (item.temperature !== undefined && item.temperature !== null && !isNaN(item.temperature)) {
                temperature = parseFloat(item.temperature);
              } else if (item.temp_dht22 !== undefined && item.temp_dht22 !== null && !isNaN(item.temp_dht22)) {
                temperature = parseFloat(item.temp_dht22);
              } else if (item.suhu !== undefined && item.suhu !== null && !isNaN(item.suhu)) {
                temperature = parseFloat(item.suhu);
              }
              
              const mappedItem = {
                timestamp: parsedTs === 'alat rusak' ? 'alat rusak' : parsedTs,
                rawTimestamp: ts,
                humidity: humidity,
                temperature: temperature,
              };
              
              console.log(`Station2: Mapped item ${index}:`, mappedItem);
              return mappedItem;
            })
          : [];
          
        console.log('Station2: Final mapped data:', mapped.length, 'items');
        console.log('Station2: Sample mapped data:', mapped.slice(0, 3));
        
        // Sort data by timestamp (latest first) untuk memastikan urutan yang benar
        mapped.sort((a, b) => {
          if (a.timestamp === 'alat rusak' || b.timestamp === 'alat rusak') {
            return a.timestamp === 'alat rusak' ? 1 : -1; // Put 'alat rusak' at the end
          }
          const timeA = new Date(a.timestamp);
          const timeB = new Date(b.timestamp);
          return timeB - timeA; // Latest first (descending order)
        });
        
        console.log('Station2: Data after sorting (latest first):', mapped.slice(0, 3));
        
        setData(mapped);
      } catch (error) {
        console.error('Station2: Fetch error:', error);
        setError(error.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Ambil data terbaru (first item after sorting by latest first)
  const latest = data.length > 0 ? data[0] : null;
  
  // Debug: log untuk memverifikasi data latest
  useEffect(() => {
    if (latest) {
      console.log('Station2: LATEST data (should be 30 June):', latest);
      console.log('Station2: Latest timestamp:', latest.rawTimestamp);
      console.log('Station2: Latest parsed timestamp:', latest.timestamp);
    }
  }, [latest]);
  
  // Fungsi untuk mencari data terakhir yang valid (tidak "alat rusak")
  const getLastValidData = () => {
    if (data.length === 0) return null;
    
    // Cari dari data terbaru (index 0) ke data terlama
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const hasValidHumidity = item.humidity !== 'alat rusak' && !isNaN(item.humidity);
      const hasValidTemperature = item.temperature !== 'alat rusak' && !isNaN(item.temperature);
      const hasValidTimestamp = item.timestamp !== 'alat rusak';
      
      // Return data jika minimal ada satu nilai yang valid
      if (hasValidTimestamp && (hasValidHumidity || hasValidTemperature)) {
        console.log('Station2: Found last valid data at index', i, ':', item);
        return item;
      }
    }
    
    console.log('Station2: No valid data found');
    return null;
  };
  
  // Ambil data valid terakhir
  const lastValidData = getLastValidData();
  
  // Fungsi untuk mendapatkan nilai humidity yang akan ditampilkan
  const getDisplayHumidity = () => {
    // Prioritas: latest data jika valid, jika tidak cari data valid terakhir
    if (latest && latest.humidity !== 'alat rusak' && !isNaN(latest.humidity)) {
      return {
        value: parseFloat(latest.humidity),
        isLatest: true,
        status: 'current'
      };
    } else if (lastValidData && lastValidData.humidity !== 'alat rusak' && !isNaN(lastValidData.humidity)) {
      return {
        value: parseFloat(lastValidData.humidity),
        isLatest: false,
        status: 'last_valid',
        timestamp: lastValidData.rawTimestamp
      };
    } else {
      return {
        value: 0,
        isLatest: false,
        status: 'no_data'
      };
    }
  };
  
  // Fungsi untuk mendapatkan nilai temperature yang akan ditampilkan
  const getDisplayTemperature = () => {
    // Prioritas: latest data jika valid, jika tidak cari data valid terakhir
    if (latest && latest.temperature !== 'alat rusak' && !isNaN(latest.temperature)) {
      return {
        value: parseFloat(latest.temperature),
        isLatest: true,
        status: 'current'
      };
    } else if (lastValidData && lastValidData.temperature !== 'alat rusak' && !isNaN(lastValidData.temperature)) {
      return {
        value: parseFloat(lastValidData.temperature),
        isLatest: false,
        status: 'last_valid',
        timestamp: lastValidData.rawTimestamp
      };
    } else {
      return {
        value: 0,
        isLatest: false,
        status: 'no_data'
      };
    }
  };
  
  const displayHumidity = getDisplayHumidity();
  const displayTemperature = getDisplayTemperature();
  
  // Debug: log latest data
  useEffect(() => {
    if (latest) {
      console.log('Station2: Latest data:', latest);
      console.log('Station2: Latest humidity:', latest.humidity, typeof latest.humidity);
      console.log('Station2: Latest temperature:', latest.temperature, typeof latest.temperature);
    }
    if (lastValidData) {
      console.log('Station2: Last valid data:', lastValidData);
    }
  }, [latest, lastValidData]);

  // Data valid untuk chart (timestamp harus ISO string, bukan 'alat rusak')
  const chartData = data.filter(
    d => d.timestamp !== 'alat rusak' &&
         d.humidity !== 'alat rusak' && !isNaN(d.humidity) &&
         d.temperature !== 'alat rusak' && !isNaN(d.temperature)
  );

  // Hanya ambil field humidity dan temperature untuk chart (sort for chronological display)
  const chartDataForTrend = chartData
    .map(d => ({
      timestamp: d.timestamp,
      humidity: parseFloat(d.humidity),
      temperature: parseFloat(d.temperature),
    }))
    .sort((a, b) => {
      // Sort chronologically for chart (oldest first)
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
            <p className="text-center">Data collected from Station 2 (Kalimantan)</p>
            
            {/* Status indicators */}
            {loading && (
              <div className="text-center">
                <div className="spinner-border text-primary me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span className="text-muted">Mengambil data dari server...</span>
              </div>
            )}
            
            {error && (
              <div className="alert alert-danger text-center" role="alert">
                <strong>Error:</strong> {error}
                <br />
                <small>API URL: {API_URL || 'undefined'}</small>
              </div>
            )}
            
            {!loading && !error && data.length === 0 && (
              <div className="alert alert-warning text-center" role="alert">
                Tidak ada data tersedia dari server
              </div>
            )}
            
            {!loading && !error && data.length > 0 && (
              <div className="alert alert-success text-center" role="alert">
                Data berhasil dimuat: {data.length} records
                <br />
                <small className="text-muted">
                  Latest data - Humidity: {latest?.humidity} | Temperature: {latest?.temperature} | Timestamp: {latest?.rawTimestamp ? formatUserFriendlyTimestamp(parseTimestamp(latest.rawTimestamp)) : 'N/A'}
                  <br />
                  {!displayHumidity.isLatest && displayHumidity.status === 'last_valid' && (
                    <>Display using last valid humidity from: {displayHumidity.timestamp ? formatUserFriendlyTimestamp(parseTimestamp(displayHumidity.timestamp)) : 'N/A'}<br /></>
                  )}
                  {!displayTemperature.isLatest && displayTemperature.status === 'last_valid' && (
                    <>Display using last valid temperature from: {displayTemperature.timestamp ? formatUserFriendlyTimestamp(parseTimestamp(displayTemperature.timestamp)) : 'N/A'}<br /></>
                  )}
                </small>
              </div>
            )}
          </Col>
        </Row>
        <Row className="g-4">
          <Col md={6} className="text-center">
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0,0,0,0.1)' }}>
              <HumidityGauge humidity={displayHumidity.value} />
              <h5>Humidity</h5>
              <p>
                {displayHumidity.status === 'current' ? (
                  `${displayHumidity.value.toFixed(1)}%`
                ) : displayHumidity.status === 'last_valid' ? (
                  <>
                    <span className="text-warning">{displayHumidity.value.toFixed(1)}%</span>
                    <br />
                    <small className="text-muted">(Data terakhir yang valid)</small>
                  </>
                ) : displayHumidity.status === 'no_data' ? (
                  <span className="text-danger">No valid data</span>
                ) : (
                  <span className="text-muted">N/A</span>
                )}
              </p>
            </div>
          </Col>
          <Col md={6} className="text-center">
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0,0,0,0.1)' }}>
              <TemperatureGauge temperature={displayTemperature.value} />
              <h5>Temperature</h5>
              <p>
                {displayTemperature.status === 'current' ? (
                  `${displayTemperature.value.toFixed(1)}°C`
                ) : displayTemperature.status === 'last_valid' ? (
                  <>
                    <span className="text-warning">{displayTemperature.value.toFixed(1)}°C</span>
                    <br />
                    <small className="text-muted">(Data terakhir yang valid)</small>
                  </>
                ) : displayTemperature.status === 'no_data' ? (
                  <span className="text-danger">No valid data</span>
                ) : (
                  <span className="text-muted">N/A</span>
                )}
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
            <div className="text-center mb-3">
              <small className="text-muted">
                <strong>Legend:</strong> 
                <span className="badge bg-primary ms-2">Latest</span> Data terbaru | 
                <span className="badge bg-warning ms-2">Used in Gauge</span> Data yang ditampilkan di gauge (jika data terbaru rusak)
              </small>
            </div>
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
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Memuat data...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <strong>Error loading data:</strong> {error}
                </div>
              ) : data.length > 0 ? (
                <Table striped bordered hover variant="light" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Timestamp</th>
                      <th>Humidity (%)</th>
                      <th>Temperature (°C)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, idx) => {
                      const isCurrentDisplay = idx === 0; // latest data (first item after sorting)
                      const isValidForHumidity = lastValidData && item.rawTimestamp === lastValidData.rawTimestamp && 
                                                  lastValidData.humidity !== 'alat rusak' && !isNaN(lastValidData.humidity);
                      const isValidForTemperature = lastValidData && item.rawTimestamp === lastValidData.rawTimestamp && 
                                                     lastValidData.temperature !== 'alat rusak' && !isNaN(lastValidData.temperature);
                      
                      return (
                        <tr key={idx} className={isCurrentDisplay ? 'table-info' : (isValidForHumidity || isValidForTemperature) ? 'table-warning' : ''}>
                          <td>
                            {idx + 1}
                            {isCurrentDisplay && <span className="badge bg-primary ms-2">Latest</span>}
                            {(isValidForHumidity || isValidForTemperature) && !isCurrentDisplay && 
                              <span className="badge bg-warning ms-2">Used in Gauge</span>}
                          </td>
                          <td>
                            {parseTimestamp(item.rawTimestamp) === 'alat rusak'
                              ? <span className="text-danger">alat rusak</span>
                              : formatUserFriendlyTimestamp(parseTimestamp(item.rawTimestamp))}
                          </td>
                          <td>
                            {item.humidity === 'alat rusak' || isNaN(item.humidity)
                              ? <span className="text-danger">alat rusak</span>
                              : parseFloat(item.humidity).toFixed(1)}
                          </td>
                          <td>
                            {item.temperature === 'alat rusak' || isNaN(item.temperature)
                              ? <span className="text-danger">alat rusak</span>
                              : parseFloat(item.temperature).toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center" style={{ color: '#007bff' }}>
                  No data available from server
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