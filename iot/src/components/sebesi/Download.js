import { saveAs } from 'file-saver';
import { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { resampleTimeSeries } from '../../utils/timeSeriesResampler';

// API Sebesi
const API_SEBESI = process.env.REACT_APP_API_SEBESI_DAILY;

// Helper parsing timestamp
const parseTimestamp = (ts) => {
  if (!ts) return ts;
  if (typeof ts === 'string' && ts.includes('T')) return ts;
  if (typeof ts !== 'string') return ts;
  const [date, time] = ts.split(' ');
  if (!date || !time) return ts;
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return ts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}`;
};

const formatUserFriendlyDate = (timestamp) => {
  if (!timestamp) return 'Invalid Date';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
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

const mapSebesi = (item) => {
  if (!item) return {};
  const ts = item.timestamp || item.TS || item.created_at;
  const parsedTs = parseTimestamp(ts);
  return {
    timestamp: parsedTs,
    userFriendlyDate: formatUserFriendlyDate(parsedTs),
    humidity: item.Humidity ?? 0,
    temperature: item.Temperature ?? 0,
    airPressure: item.AirPressure ?? 0,
    irradiation: item.SolarRadiation ?? 0,
    oxygen: item.Suhu_Air_Atas ?? 0,
    rainfall: item.Rainfall ?? 0,
    windspeed: item.AnemometerSpeed ?? 0,
    windDirection: item.Angle ?? '',
    waterTemperature: item.Suhu_Air_Bawah ?? 0,
    invalid: !parsedTs || parsedTs === 'Invalid Date' || parsedTs === 'alat rusak'
  };
};

const formatDataForCSV = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  return data.map((item, index) => ({
    'No': index + 1,
    'Tanggal & Waktu': formatUserFriendlyDate(item.timestamp),
    'Status': item.invalid ? 'Invalid' : 'Aktual',
    'Kelembapan (%)': parseFloat(item.humidity || 0).toFixed(1),
    'Suhu (°C)': parseFloat(item.temperature || 0).toFixed(1),
    'Tekanan Udara (hPa)': parseFloat(item.airPressure || 0).toFixed(2),
    'Radiasi Matahari (W/m²)': parseFloat(item.irradiation || 0).toFixed(0),
    'Oksigen (mg/L)': parseFloat(item.oxygen || 0).toFixed(2),
    'Curah Hujan (mm)': parseFloat(item.rainfall || 0).toFixed(1),
    'Kecepatan Angin (m/s)': parseFloat(item.windspeed || 0).toFixed(1),
    'Arah Angin': item.windDirection || '',
    'Suhu Air (°C)': parseFloat(item.waterTemperature || 0).toFixed(1),
  }));
};

const createFormattedCSV = (data) => {
  if (!data || data.length === 0) return '';
  const csvData = formatDataForCSV(data);
  const headers = Object.keys(csvData[0]);
  const headerRow = headers.map(header => `"${header}"`).join(',');
  const dataRows = csvData.map(row =>
    headers.map(header => `"${row[header]}"`).join(',')
  );
  const metadata = [
    `"=== DATA MONITORING STATION SEBESI ==="`,
    `"Diekspor pada: ${formatUserFriendlyDate(new Date().toISOString())}"`,
    `"Total Records: ${data.length}"`,
    `"Status: Aktual = Data asli dari sensor, Invalid = Data tidak valid"`,
    '""',
    headerRow
  ];
  return [...metadata, ...dataRows].join('\n');
};

function resampleTimeSeriesWithMeanFill(data, intervalMinutes, fields) {
  if (!Array.isArray(data) || data.length === 0) return [];
  data = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const start = new Date(data[0].timestamp);
  const end = new Date(data[data.length - 1].timestamp);
  let result = [];
  let current = new Date(start);
  while (current <= end) {
    let next = new Date(current);
    next.setMinutes(next.getMinutes() + intervalMinutes);
    let slotData = data.filter(item => {
      let t = new Date(item.timestamp);
      return t >= current && t < next;
    });
    let resampled = { timestamp: current.toISOString(), userFriendlyDate: formatUserFriendlyDate(current.toISOString()) };
    fields.forEach(field => {
      if (slotData.length === 0) {
        const mean = data.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0) / data.length;
        resampled[field] = isNaN(mean) ? null : mean;
      } else {
        const mean = slotData.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0) / slotData.length;
        resampled[field] = isNaN(mean) ? null : mean;
      }
    });
    result.push(resampled);
    current = next;
  }
  return result;
}

const Download = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fileFormat, setFileFormat] = useState('json');
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dataSebesi, setDataSebesi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  // Resampling
  const [enableResampling, setEnableResampling] = useState(false);
  const [resampleInterval, setResampleInterval] = useState(15);
  const [resampleMethod] = useState('mean'); // hanya mean

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setDataReady(false);
        const res = await fetch(API_SEBESI);
        const json = res.ok ? await res.json() : { result: [] };
        const rawData = Array.isArray(json) ? json : (json.result || []);
        const mapped = rawData.map(mapSebesi);
        setDataSebesi(mapped);
        setDataReady(true);
      } catch (error) {
        setDataSebesi([]);
        setDataReady(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    let data = filterDataByDate(dataSebesi);

    const hasInvalid = data.some(
      (item) =>
        item.invalid ||
        item.timestamp === 'Invalid date' ||
        item.timestamp === 'alat rusak'
    );
    if (hasInvalid) {
      alert('Data tidak bisa di-download karena respon dari server tertulis alat rusak atau Invalid date.');
      return;
    }
    if (data.length === 0) {
      alert('No data available for the selected date range.');
      return;
    }

    if (enableResampling) {
      try {
        let fields = [
          'humidity', 'temperature', 'airPressure', 'irradiation',
          'oxygen', 'rainfall', 'windspeed', 'windDirection', 'waterTemperature'
        ];
        let validData = data.filter(item => item.timestamp && item.timestamp !== 'Invalid date' && item.timestamp !== 'alat rusak');
        data = resampleTimeSeriesWithMeanFill(validData, resampleInterval, fields);
        if (data.length === 0) {
          alert('No data available after resampling.');
          return;
        }
      } catch (error) {
        alert('Error during resampling: ' + error.message);
        return;
      }
    }

    let filename = `Sebesi_${startDate}_to_${endDate}`;
    if (enableResampling) {
      filename += `_resample${resampleInterval}m`;
    }

    if (fileFormat === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveAs(blob, `${filename}.json`);
    } else if (fileFormat === 'csv') {
      const csv = createFormattedCSV(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `${filename}.csv`);
    }
  };

  const handleLoginSubmit = () => {
    if (username === 'admin' && password === 'admin123') {
      setShowLogin(false);
      processDownload();
    } else {
      alert('Invalid credentials!');
    }
  };

  const filterDataByDate = (data) => {
    if (!startDate || !endDate) return [];
    return data.filter((item) => {
      if (!item.timestamp) return false;
      const itemYMD = new Date(item.timestamp).toISOString().slice(0, 10);
      return itemYMD >= startDate && itemYMD <= endDate;
    });
  };

  return (
    <Container style={{ marginTop: '20px' }}>
      <Row>
        <Col>
          <h3 className="text-center fw-bold text-primary">Download Data</h3>
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
        <Row className="mt-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-bold">Select timeframe</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  label="1menit"
                  name="timeframe"
                  value={1}
                  checked={resampleInterval === 1}
                  onChange={() => setResampleInterval(1)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="15menit"
                  name="timeframe"
                  value={15}
                  checked={resampleInterval === 15}
                  onChange={() => setResampleInterval(15)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="30menit"
                  name="timeframe"
                  value={30}
                  checked={resampleInterval === 30}
                  onChange={() => setResampleInterval(30)}
                  className="mb-2"
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
      )}

      <Row className="mt-4">
        <Col className="text-center">
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
                Sebesi: {dataSebesi.length} records
                <br />
                {enableResampling && (
                  <><strong>Resampling:</strong> {resampleInterval} menit (mean)<br /></>
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