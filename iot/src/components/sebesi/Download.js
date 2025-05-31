import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Modal, Alert } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// Helper untuk validasi dan konversi tanggal (sama seperti di Station1.js)
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

// Mapping function agar urutan dan nama field sama dengan tabel Station1
const mapApiData = (item) => {
  const ts = getValidTimestamp(item);
  return {
    timestamp: ts || 'server sedang eror',
    humidity: item.Humidity ?? 0,
    temperature: item.Temperature ?? 0,
    airPressure: item.AirPressure ?? 0,
    irradiation: item.SolarRadiation ?? 0,
    oxygen: item.Suhu_Air_Atas ?? 0,
    rainfall: item.Rainfall ?? 0,
    windspeed: item.AnemometerSpeed ?? 0,
    windDirection: item.Angle ?? 0,
    waterTemperature: item.Suhu_Air_Bawah ?? 0,
  };
};

const API_DAILY = process.env.REACT_APP_API_SEBESI_DAILY;
const LOCAL_STORAGE_KEY = 'station1_backup_data';

const Download = () => {
  const [allData, setAllData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fileFormat, setFileFormat] = useState('json');
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [noBackup, setNoBackup] = useState(false);

  // Ambil data dari localStorage saat komponen mount, sebelum fetch API
  useEffect(() => {
    const backup = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        setAllData(parsed);
        setNoBackup(false);
      } catch {
        setNoBackup(true);
      }
    } else {
      setNoBackup(true);
    }
  }, []);

  // Fetch hanya dari endpoint daily, mirip Station1
  useEffect(() => {
    const fetchData = async () => {
      const url = API_DAILY;
      if (!url) {
        const backup = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (backup) {
          try {
            const parsed = JSON.parse(backup);
            setAllData(parsed);
            setNoBackup(false);
          } catch {
            setAllData([]);
            setNoBackup(true);
          }
        } else {
          setAllData([]);
          setNoBackup(true);
        }
        return;
      }
      try {
        const response = await fetch(url);
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid content type");
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
        // Ambil hanya data 30 hari terakhir
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
        // Urutkan data dari paling lama ke paling baru
        last30DaysRaw.sort((a, b) => {
          const ta = new Date(getValidTimestamp(a)).getTime();
          const tb = new Date(getValidTimestamp(b)).getTime();
          return ta - tb;
        });
        // Filter interval 15 menit dan mapping
        const filtered = [];
        let lastTimestamp = null;
        last30DaysRaw.forEach(item => {
          const tsRaw = getValidTimestamp(item);
          if (!tsRaw) return;
          const ts = new Date(tsRaw).getTime();
          if (!lastTimestamp || ts - lastTimestamp >= 15 * 60 * 1000) {
            filtered.push({ ...item, TS: tsRaw });
            lastTimestamp = ts;
          }
        });
        const mappedData = filtered.map(mapApiData);

        if (mappedData.length > 0) {
          setAllData(mappedData);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mappedData));
          setNoBackup(false);
        } else {
          const backup = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (backup) {
            try {
              const parsed = JSON.parse(backup);
              setAllData(parsed);
              setNoBackup(false);
            } catch {
              setAllData([]);
              setNoBackup(true);
            }
          } else {
            setAllData([]);
            setNoBackup(true);
          }
        }
      } catch (error) {
        const backup = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (backup) {
          try {
            const parsed = JSON.parse(backup);
            setAllData(parsed);
            setNoBackup(false);
          } catch {
            setAllData([]);
            setNoBackup(true);
          }
        } else {
          setAllData([]);
          setNoBackup(true);
        }
      }
    };
    fetchData();
  }, []);

  const handleDownload = () => {
    setShowLogin(true);
  };

  const processDownload = () => {
    if (!startDate || !endDate) {
      alert('Please select both start date and end date.');
      return;
    }

    const data = filterDataByDate(allData);

    if (data.length === 0) {
      alert('No data available for the selected date range.');
      return;
    }

    // Pastikan urutan kolom sama dengan tabel Station1
    const columns = [
      "timestamp",
      "humidity",
      "temperature",
      "airPressure",
      "irradiation",
      "oxygen",
      "rainfall",
      "windspeed",
      "windDirection",
      "waterTemperature"
    ];

    const dataForExport = data.map(item => {
      const obj = {};
      columns.forEach(col => {
        obj[col] = item[col];
      });
      return obj;
    });

    if (fileFormat === 'json') {
      const blob = new Blob([JSON.stringify(dataForExport, null, 2)], { type: 'application/json' });
      saveAs(blob, `Station1_data.json`);
    } else if (fileFormat === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(dataForExport, { header: columns });
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: 'text/csv' });
      saveAs(blob, `Station1_data.csv`);
    }
  };

  const handleLoginSubmit = () => {
    if (username === 'admin' && password === 'admin123') {
      setShowLogin(false);
      processDownload();
    } else {
      alert('Invalid credentials! Please use username: admin and password: admin123');
    }
  };

  // Perbaikan: filter data dengan validasi timestamp dan range tanggal
  const filterDataByDate = (data) => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return data.filter((item) => {
      if (!item.timestamp || item.timestamp === 'server sedang eror' || item.timestamp === 'alat rusak') return false;
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

      {noBackup && (
        <Row className="mt-4">
          <Col>
            <Alert variant="warning" className="text-center">
              Belum ada data backup di local storage dan gagal mengambil data dari server.
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="mt-4 d-flex justify-content-center">
        <Col md={6} className="text-center">
          <Button
            variant="primary"
            className="me-3 px-4 py-2 fw-bold shadow-sm"
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
              disabled={noBackup}
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
              disabled={noBackup}
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
              disabled={noBackup}
            />
            <Form.Check
              type="radio"
              label="CSV"
              name="fileFormat"
              value="csv"
              checked={fileFormat === 'csv'}
              onChange={(e) => setFileFormat(e.target.value)}
              className="fw-semibold"
              disabled={noBackup}
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
            disabled={noBackup}
          >
            Download Data
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