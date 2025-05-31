import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Modal } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// API endpoint untuk Station 1 & 2 (ambil dari .env, sama seperti Station1.js & Station2.js)
const API_KALIMANTAN_TOPIC1 = process.env.REACT_APP_API_KALIMANTAN_TABLE_TOPIC1;
const API_KALIMANTAN_TOPIC2 = process.env.REACT_APP_API_KALIMANTAN_TABLE_TOPIC2;

// Fungsi parsing timestamp agar bisa dibandingkan dengan filter tanggal
const parseTimestamp = (ts) => {
  // Format backend: '28-05-25 11:49:00' (DD-MM-YY HH:mm:ss)
  if (!ts || typeof ts !== 'string') return ts;
  const [date, time] = ts.split(' ');
  if (!date || !time) return ts;
  const [day, month, year] = date.split('-');
  if (!day || !month || !year) return ts;
  const fullYear = year.length === 2 ? '20' + year : year;
  // Format ISO agar bisa diparse oleh new Date()
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}`;
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
  return {
    timestamp: parseTimestamp(ts),
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

const mapStation2 = (item) => {
  if (!item) return {};
  if (
    !item.timestamp ||
    item.timestamp === 'Invalid date' ||
    item.timestamp === 'alat rusak'
  ) {
    return { ...item, invalid: true };
  }
  const ts = item.timestamp;
  return {
    timestamp: parseTimestamp(ts),
    humidity: item.humidity ?? item.hum_dht22 ?? 0,
    temperature: item.temperature ?? item.temp_dht22 ?? 0,
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
  const [station2Data, setStation2Data] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data dari API saat komponen mount
  useEffect(() => {
    const fetchStation1 = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_KALIMANTAN_TOPIC1);
        const json = await res.json();
        console.log("respon api kalimatantan download :", json);
        const data = Array.isArray(json.result) ? json.result.map(mapStation1) : [];
        setStation1Data(data);
      } catch {
        setStation1Data([]);
      } finally {
        setLoading(false);
      }
    };
    const fetchStation2 = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_KALIMANTAN_TOPIC2);
        const json = await res.json();
        console.log("respon api kalimatantan download :", json);
        const data = Array.isArray(json.result) ? json.result.map(mapStation2) : [];
        setStation2Data(data);
      } catch {
        setStation2Data([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStation1();
    fetchStation2();
  }, []);

  const handleDownload = () => {
    setShowLogin(true);
  };

  const processDownload = () => {
    if (!startDate || !endDate) {
      alert('Please select both start date and end date.');
      return;
    }
    const data = filterDataByDate(getStationData());
    // Cek jika ada data invalid
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
    if (fileFormat === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveAs(blob, `${selectedStation.replace(' ', '_')}_data.json`);
    } else if (fileFormat === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: 'text/csv' });
      saveAs(blob, `${selectedStation.replace(' ', '_')}_data.csv`);
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

  const getStationData = () => {
    return selectedStation === 'Station 1' ? station1Data : station2Data;
  };

  const filterDataByDate = (data) => {
    // Pastikan tanggal diubah ke format yang bisa dibandingkan
    if (!startDate || !endDate) return [];
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);
    return data.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= start && itemDate <= end;
    });
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
            variant={selectedStation === 'Station 1' ? 'primary' : 'outline-primary'}
            onClick={() => setSelectedStation('Station 1')}
            className="me-3 px-4 py-2 fw-bold shadow-sm"
          >
            Station 1
          </Button>
          <Button
            variant={selectedStation === 'Station 2' ? 'primary' : 'outline-primary'}
            onClick={() => setSelectedStation('Station 2')}
            className="px-4 py-2 fw-bold shadow-sm"
          >
            Station 2
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

      <Row className="mt-4">
        <Col className="text-center">
          <Button
            variant="success"
            onClick={handleDownload}
            className="px-5 py-2 fw-bold shadow-lg"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Download Data'}
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