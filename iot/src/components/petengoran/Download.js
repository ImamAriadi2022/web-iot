import { saveAs } from 'file-saver';
import { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import { fillDataGaps, generateConsistentIntervalData, smoothData } from '../../utils/dataInterpolation';
import { resampleTimeSeries } from '../../utils/timeSeriesResampler';

// API endpoint untuk Petengoran Station 1
const API_PETENGORAN_ONEMONTH = process.env.REACT_APP_API_PETENGORAN + 'data/onemonth';

// Fungsi parsing timestamp agar bisa dibandingkan dengan filter tanggal
const parseTimestamp = (ts) => {
  if (!ts) return ts;
  
  // Jika sudah dalam format ISO (contoh: 2025-06-30T10:10:00), return as is
  if (typeof ts === 'string' && ts.includes('T')) {
    return ts;
  }
  
  // Format backend: '28-05-25 11:49:00' (DD-MM-YY HH:mm:ss)
  if (typeof ts !== 'string') return ts;
  const [date, time] = ts.split(' ');
  if (!date || !time) return ts;
  const [day, month, year] = date.split('-');
  if (!day || !month || !year) return ts;
  const fullYear = year.length === 2 ? '20' + year : year;
  // Format ISO agar bisa diparse oleh new Date()
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}`;
};

// Fungsi untuk format tanggal yang user-friendly
const formatUserFriendlyDate = (timestamp) => {
  if (!timestamp) return 'Invalid Date';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    // Format: "30 Juni 2025, 14:30:45"
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
  } catch {
    return 'Invalid Date';
  }
};

// Fungsi untuk format data menjadi tabel CSV yang rapi
const formatDataForCSV = (data, stationType) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  
  return data.map((item, index) => {
    const formattedData = {
      'No': index + 1,
      'Tanggal & Waktu': formatUserFriendlyDate(item.timestamp),
      'Status': item.interpolated ? 'Estimasi' : 'Aktual',
      'Kelembapan (%)': parseFloat(item.humidity || 0).toFixed(1),
      'Suhu (°C)': parseFloat(item.temperature || 0).toFixed(1),
    };
    
    // Tambahkan kolom khusus untuk Station 1
    if (stationType === 'Station 1') {
      formattedData['Curah Hujan (mm)'] = parseFloat(item.rainfall || 0).toFixed(1);
      formattedData['Kecepatan Angin (m/s)'] = parseFloat(item.windspeed || 0).toFixed(1);
      formattedData['Radiasi Matahari (W/m²)'] = parseFloat(item.irradiation || 0).toFixed(0);
      formattedData['Arah Angin'] = item.windDirection || '';
      formattedData['Sudut Angin (°)'] = parseFloat(item.angle || 0).toFixed(0);
    }
    
    return formattedData;
  });
};

// Fungsi untuk membuat CSV yang terformat dengan baik
const createFormattedCSV = (data, stationType) => {
  if (!data || data.length === 0) return '';
  
  const csvData = formatDataForCSV(data, stationType);
  
  // Header dengan spasi yang rapi
  const headers = Object.keys(csvData[0]);
  const headerRow = headers.map(header => `"${header}"`).join(',');
  
  // Data rows dengan formatting yang konsisten
  const dataRows = csvData.map(row => 
    headers.map(header => {
      const value = row[header];
      // Wrap dalam quotes untuk konsistensi dan handle comma
      return `"${value}"`;
    }).join(',')
  );
  
  // Tambahkan metadata di awal file
  const metadata = [
    `"=== DATA MONITORING STATION ${stationType.toUpperCase()} ==="`,
    `"Diekspor pada: ${formatUserFriendlyDate(new Date().toISOString())}"`,
    `"Total Records: ${data.length}"`,
    `"Status: Aktual = Data asli dari sensor, Estimasi = Data hasil interpolasi"`,
    '""', // Empty line
    headerRow
  ];
  
  return [...metadata, ...dataRows].join('\n');
};

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

const mapStation1 = (item) => {
  if (!item) return {};
  // Jika timestamp invalid atau alat rusak, return flag khusus
  if (
    !item.timestamp ||
    item.timestamp === 'Invalid date' ||
    item.timestamp === 'alat rusak'
  ) {
    return { ...item, invalid: true };
  }
  
  const ts = item.timestamp;
  const parsedTs = parseTimestamp(ts);
  
  return {
    timestamp: parsedTs,
    userFriendlyDate: formatUserFriendlyDate(parsedTs),
    humidity: item.humidity ?? item.hum_dht22 ?? 0,
    temperature: item.temperature ?? item.temp_dht22 ?? 0,
    rainfall: item.rainfall ?? 0,
    windspeed: item.wind_speed ?? 0,
    irradiation: item.irradiation ?? 0,
    windDirection: windDirectionToEnglish(item.direction ?? ''),
    angle: item.angle ?? 0,
    invalid: false,
  };
};

const Download = () => {
  const [selectedStation, setSelectedStation] = useState('Station 1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fileFormat, setFileFormat] = useState('json');
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [station1Data, setStation1Data] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  
  // Opsi resampling
  const [enableResampling, setEnableResampling] = useState(false);
  const [resampleInterval, setResampleInterval] = useState(15);
  const [resampleMethod, setResampleMethod] = useState('mean');
  
  // Opsi interpolasi data
  const [enableInterpolation, setEnableInterpolation] = useState(true);
  const [interpolationInterval, setInterpolationInterval] = useState(5);
  const [enableSmoothing, setEnableSmoothing] = useState(false);

  // Fetch data dari API saat komponen mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setDataReady(false);
        console.log("Starting data fetch...");
        
        // Fetch Petengoran Station 1 data
        const res1 = await fetch(API_PETENGORAN_ONEMONTH);
        
        console.log("Response status:", { 
          petengoran_station1: res1.status, 
          petengoran_station1_ok: res1.ok
        });
        
        if (!res1.ok) {
          const text1 = await res1.text();
          console.error("Petengoran Station 1 API error:", text1.substring(0, 200));
        }
        
        const json1 = res1.ok ? await res1.json() : { result: [] };
        
        console.log("Petengoran Station 1 API response:", json1);
        
        const station1Data = Array.isArray(json1.result) ? json1.result.map(mapStation1) : [];
        
        console.log("Mapped Petengoran Station 1 data:", station1Data.length, station1Data.slice(0, 3));
        
        setStation1Data(station1Data);
        setDataReady(true);
        
        console.log("All data fetched and ready!");
      } catch (error) {
        console.error("Error fetching data:", error);
        setStation1Data([]);
        setDataReady(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Debug effect untuk memonitor perubahan data
  useEffect(() => {
    console.log("Petengoran Station 1 Data updated:", station1Data.length);
    console.log("Data ready:", dataReady);
  }, [station1Data, dataReady]);

  const handleDownload = () => {
    setShowLogin(true);
  };

  const processDownload = () => {
    if (!dataReady) {
      alert('Data is still loading. Please wait...');
      return;
    }
    
    if (!startDate || !endDate) {
      alert('Please select both start date and end date.');
      return;
    }
    
    console.log('=== DOWNLOAD PROCESS START ===');
    console.log('Selected station:', selectedStation);
    console.log('Date range:', { startDate, endDate });
    console.log('Data ready status:', dataReady);
    
    const rawData = getStationData();
    console.log('Raw station data count:', rawData.length);
    console.log('Sample raw data:', rawData.slice(0, 3));
    
    let data = filterDataByDate(rawData);
    console.log('Data after date filtering:', data.length);
    
    // Cek jika ada data invalid
    const hasInvalid = data.some(
      (item) =>
        item.invalid ||
        item.timestamp === 'Invalid date' ||
        item.timestamp === 'alat rusak'
    );
    
    console.log('Has invalid data:', hasInvalid);
    
    if (hasInvalid) {
      alert('Data tidak bisa di-download karena respon dari server tertulis alat rusak atau Invalid date.');
      return;
    }
    if (data.length === 0) {
      console.log('=== NO DATA AVAILABLE ===');
      console.log('Raw data sample timestamps:', rawData.slice(0, 5).map(item => item.timestamp));
      alert('No data available for the selected date range.');
      return;
    }

    // Apply interpolasi data jika diaktifkan
    if (enableInterpolation && data.length > 1) {
      console.log('Applying data interpolation...');
      try {
        const startTime = new Date(`${startDate}T00:00:00`);
        const endTime = new Date(`${endDate}T23:59:59`);
        
        // Fill gaps dalam data
        data = fillDataGaps(data, 120, interpolationInterval); // Max gap 2 jam, interval sesuai setting
        console.log('Data after gap filling:', data.length);
        
        // Generate data dengan interval konsisten
        data = generateConsistentIntervalData(data, interpolationInterval, startTime, endTime);
        console.log('Data after consistent interval generation:', data.length);
        
        // Apply smoothing jika diaktifkan
        if (enableSmoothing) {
          data = smoothData(data, 3);
          console.log('Data after smoothing:', data.length);
        }
      } catch (error) {
        console.error('Interpolation error:', error);
        alert('Error during data interpolation: ' + error.message);
        return;
      }
    }

    // Apply resampling jika diaktifkan (setelah interpolasi)
    if (enableResampling) {
      console.log('Applying resampling:', { resampleInterval, resampleMethod });
      try {
        // Station 1 fields untuk resampling
        let fields = ['humidity', 'temperature', 'rainfall', 'windspeed', 'irradiation', 'windDirection', 'angle'];
        
        data = resampleTimeSeries(data, resampleInterval, resampleMethod, fields);
        console.log('Data after resampling:', data.length);
        
        if (data.length === 0) {
          alert('No data available after resampling.');
          return;
        }
      } catch (error) {
        console.error('Resampling error:', error);
        alert('Error during resampling: ' + error.message);
        return;
      }
    }

    // Generate filename dengan info lengkap
    const interpolationSuffix = enableInterpolation ? `_interpolated_${interpolationInterval}min` : '';
    const smoothingSuffix = enableSmoothing ? '_smoothed' : '';
    const resampleSuffix = enableResampling ? `_resampled_${resampleInterval}min_${resampleMethod}` : '';
    const baseFilename = `Petengoran_Station_1_data${interpolationSuffix}${smoothingSuffix}${resampleSuffix}`;
    
    console.log('Downloading file:', baseFilename);
    
    if (fileFormat === 'json') {
      // Untuk JSON, buat format yang lebih readable
      const actualDataCount = data.filter(item => !item.interpolated).length;
      const interpolatedCount = data.filter(item => item.interpolated).length;
      
      const jsonData = {
        metadata: {
          station: selectedStation,
          dateRange: `${startDate} to ${endDate}`,
          exportTime: formatUserFriendlyDate(new Date().toISOString()),
          totalRecords: data.length,
          actualRecords: actualDataCount,
          interpolatedRecords: interpolatedCount,
          processing: {
            interpolation: enableInterpolation ? {
              enabled: true,
              interval: `${interpolationInterval} minutes`,
              smoothing: enableSmoothing
            } : { enabled: false },
            resampling: enableResampling ? {
              enabled: true,
              interval: `${resampleInterval} minutes`,
              method: resampleMethod
            } : { enabled: false }
          }
        },
        data: data.map((item, index) => ({
          no: index + 1,
          tanggalWaktu: item.userFriendlyDate,
          timestamp: item.timestamp,
          status: item.interpolated ? 'Estimasi' : 'Aktual',
          kelembapan: `${parseFloat(item.humidity || 0).toFixed(1)}%`,
          suhu: `${parseFloat(item.temperature || 0).toFixed(1)}°C`,
          curahHujan: `${parseFloat(item.rainfall || 0).toFixed(1)}mm`,
          kecepatanAngin: `${parseFloat(item.windspeed || 0).toFixed(1)}m/s`,
          radiasiMatahari: `${parseFloat(item.irradiation || 0).toFixed(0)}W/m²`,
          arahAngin: item.windDirection || '',
          sudutAngin: `${parseFloat(item.angle || 0).toFixed(0)}°`
        }))
      };
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { 
        type: 'application/json;charset=utf-8;' 
      });
      saveAs(blob, `${baseFilename}.json`);
    } else if (fileFormat === 'csv') {
      // Untuk CSV, gunakan format yang lebih rapi
      const csvContent = createFormattedCSV(data, 'Station 1');
      const blob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      saveAs(blob, `${baseFilename}.csv`);
    }
    
    console.log('=== DOWNLOAD PROCESS END ===');
  };

  const handleLoginSubmit = () => {
    if (username === 'admin' && password === 'admin123') {
      setShowLogin(false);
      processDownload();
    } else {
      alert('Invalid credentials!');
    }
  };

  const getStationData = () => {
    return station1Data;
  };

  const filterDataByDate = (data) => {
    // Pastikan tanggal diubah ke format yang bisa dibandingkan
    if (!startDate || !endDate) {
      console.log('No start or end date selected');
      return [];
    }
    
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);
    
    console.log('Filter criteria:', {
      startDate,
      endDate,
      start: start.toISOString(),
      end: end.toISOString()
    });
    
    console.log('Total data to filter:', data.length);
    console.log('Sample data timestamps:', data.slice(0, 3).map(item => ({
      original: item.timestamp,
      parsed: new Date(item.timestamp).toISOString(),
      valid: !isNaN(new Date(item.timestamp).getTime())
    })));
    
    const filtered = data.filter((item) => {
      if (!item.timestamp) {
        console.log('Item has no timestamp:', item);
        return false;
      }
      
      const itemDate = new Date(item.timestamp);
      
      if (isNaN(itemDate.getTime())) {
        console.log('Invalid timestamp:', item.timestamp);
        return false;
      }
      
      const isInRange = itemDate >= start && itemDate <= end;
      
      if (!isInRange) {
        console.log('Item out of range:', {
          timestamp: item.timestamp,
          itemDate: itemDate.toISOString(),
          start: start.toISOString(),
          end: end.toISOString(),
          isAfterStart: itemDate >= start,
          isBeforeEnd: itemDate <= end
        });
      }
      
      return isInRange;
    });
    
    console.log('Filtered data count:', filtered.length);
    
    return filtered;
  };

  return (
    <Container style={{ marginTop: '20px' }}>
      <Row>
        <Col>
          <h3 className="text-center fw-bold text-primary">Download Data</h3>
        </Col>
      </Row>

      <Row className="mt-4 d-flex justify-content-center">
        <Col md={6} className="text-center">
          <Button
            variant="primary"
            className="px-4 py-2 fw-bold shadow-sm"
            disabled
          >
            Station 1
          </Button>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Form.Group controlId="startDate">
            <Form.Label className="fw-bold">Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="shadow-sm"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="endDate">
            <Form.Label className="fw-bold">End Date</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="shadow-sm"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Form.Group controlId="fileFormat">
            <Form.Label className="fw-bold">Select File Format</Form.Label>
            <Form.Check
              type="radio"
              label="JSON"
              name="fileFormat"
              value="json"
              checked={fileFormat === 'json'}
              onChange={(e) => setFileFormat(e.target.value)}
              className="fw-semibold"
            />
            <Form.Check
              type="radio"
              label="CSV"
              name="fileFormat"
              value="csv"
              checked={fileFormat === 'csv'}
              onChange={(e) => setFileFormat(e.target.value)}
              className="fw-semibold"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Data Enhancement Options */}
      <Row className="mt-4">
        <Col>
          <Form.Group>
            <Form.Check
              type="checkbox"
              label="Enable Data Interpolation (Mengisi Gap Data)"
              checked={enableInterpolation}
              onChange={(e) => setEnableInterpolation(e.target.checked)}
              className="fw-bold"
            />
            <Form.Text className="text-muted">
              Mengisi celah data yang hilang dengan estimasi interpolasi untuk data yang lebih lengkap
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {enableInterpolation && (
        <>
          <Row className="mt-3">
            <Col md={6}>
              <Form.Group controlId="interpolationInterval">
                <Form.Label className="fw-bold">Interval Interpolasi (minutes)</Form.Label>
                <Form.Select
                  value={interpolationInterval}
                  onChange={(e) => setInterpolationInterval(parseInt(e.target.value))}
                  className="shadow-sm"
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  label="Enable Data Smoothing"
                  checked={enableSmoothing}
                  onChange={(e) => setEnableSmoothing(e.target.checked)}
                  className="fw-bold"
                />
                <Form.Text className="text-muted">
                  Menghaluskan data untuk mengurangi noise
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </>
      )}

      {/* Resampling Options */}
      <Row className="mt-4">
        <Col>
          <Form.Group>
            <Form.Check
              type="checkbox"
              label="Enable Data Resampling (Agregasi Data)"
              checked={enableResampling}
              onChange={(e) => setEnableResampling(e.target.checked)}
              className="fw-bold"
            />
            <Form.Text className="text-muted">
              Menggabungkan data ke interval waktu yang lebih besar untuk analisis trend
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

 

      {enableResampling && (
        <>
          <Row className="mt-3">
            <Col md={6}>
              <Form.Group controlId="resampleInterval">
                <Form.Label className="fw-bold">Interval (minutes)</Form.Label>
                <Form.Select
                  value={resampleInterval}
                  onChange={(e) => setResampleInterval(parseInt(e.target.value))}
                  className="shadow-sm"
                >
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={360}>6 hours</option>
                  <option value={720}>12 hours</option>
                  <option value={1440}>1 day</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="resampleMethod">
                <Form.Label className="fw-bold">Aggregation Method</Form.Label>
                <Form.Select
                  value={resampleMethod}
                  onChange={(e) => setResampleMethod(e.target.value)}
                  className="shadow-sm"
                >
                  <option value="mean">Average (Mean)</option>
                  <option value="first">First Value</option>
                  <option value="last">Last Value</option>
                  <option value="max">Maximum</option>
                  <option value="min">Minimum</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </>
      )}

      <Row className="mt-4">
        <Col className="text-center">
          {/* Status indicator */}
          {loading && (
            <div className="mb-3">
              <div className="spinner-border text-primary me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="text-muted">Mengambil data dari server...</span>
            </div>
          )}
          {!loading && !dataReady && (
            <div className="mb-3">
              <span className="text-warning">⏳ Mempersiapkan data...</span>
            </div>
          )}
          {!loading && dataReady && (
            <div className="mb-3">
              <span className="text-success">✅ Data siap untuk diunduh!</span>
              <br />
              <small className="text-muted">
                Petengoran Station 1: {station1Data.length} records
                <br />
                {enableInterpolation && (
                  <><strong>Interpolasi:</strong> Interval {interpolationInterval} menit{enableSmoothing && ' + Smoothing'}<br /></>
                )}
                {enableResampling && (
                  <><strong>Resampling:</strong> {resampleInterval} menit ({resampleMethod})<br /></>
                )}
              </small>
            </div>
          )}
          
          <Button
            variant="success"
            onClick={handleDownload}
            className="px-5 py-2 fw-bold shadow-lg"
            disabled={loading || !dataReady}
          >
            {loading ? 'Loading Data...' : !dataReady ? 'Preparing Data...' : 'Download Data'}
          </Button>
        </Col>
      </Row>

      {/* Modal Login */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formUsername" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" onClick={handleLoginSubmit}>
              Login
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Download;