import React, { useState } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const Download = () => {
  const [selectedStation, setSelectedStation] = useState('Station 1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fileFormat, setFileFormat] = useState('json');

  const handleDownload = () => {
    if (!startDate || !endDate) {
      alert('Please select both start date and end date.');
      return;
    }

    const data = filterDataByDate(getStationData());

    if (data.length === 0) {
      alert('No data available for the selected date range.');
      return;
    }

    if (fileFormat === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveAs(blob, `${selectedStation}_data.json`);
    } else if (fileFormat === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: 'text/csv' });
      saveAs(blob, `${selectedStation}_data.csv`);
    }
  };

  const getStationData = () => {
    return selectedStation === 'Station 1' ? station1Data : station2Data;
  };

  const filterDataByDate = (data) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return data.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= start && itemDate <= end;
    });
  };


  
  // Data untuk Station 1
  const station1Data = [
    { timestamp: '2025-04-01T08:00:00', humidity: 65, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 21, rainfall: 10, windspeed: 15, windDirection: 90 },
    { timestamp: '2025-04-01T09:00:00', humidity: 67, temperature: 29, airPressure: 1013, irradiation: 520, oxygen: 20.8, rainfall: 8, windspeed: 12, windDirection: 180 },
    { timestamp: '2025-04-01T10:00:00', humidity: 70, temperature: 30, airPressure: 1011, irradiation: 530, oxygen: 20.7, rainfall: 5, windspeed: 10, windDirection: 270 },
    { timestamp: '2025-04-01T11:00:00', humidity: 68, temperature: 31, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 7, windspeed: 14, windDirection: 360 },
    // Tambahkan data lainnya...
  ];
  
  // Data untuk Station 2
  const station2Data = [
    { timestamp: '2025-04-01T08:00:00', humidity: 60, temperature: 27, airPressure: 1015, irradiation: 480, oxygen: 20.9, rainfall: 12, windspeed: 13, windDirection: 45 },
    { timestamp: '2025-04-01T09:00:00', humidity: 62, temperature: 28, airPressure: 1014, irradiation: 490, oxygen: 21, rainfall: 10, windspeed: 11, windDirection: 135 },
    { timestamp: '2025-04-01T10:00:00', humidity: 64, temperature: 29, airPressure: 1013, irradiation: 500, oxygen: 20.8, rainfall: 9, windspeed: 12, windDirection: 225 },
    { timestamp: '2025-04-01T11:00:00', humidity: 66, temperature: 30, airPressure: 1012, irradiation: 510, oxygen: 20.7, rainfall: 6, windspeed: 14, windDirection: 315 },
    // Tambahkan data lainnya...
  ];
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
            className={`me-3 px-4 py-2 fw-bold shadow-sm ${selectedStation === 'Station 1' ? 'active-btn' : ''}`}
          >
            Station 1
          </Button>
          <Button
            variant={selectedStation === 'Station 2' ? 'primary' : 'outline-primary'}
            onClick={() => setSelectedStation('Station 2')}
            className={`px-4 py-2 fw-bold shadow-sm ${selectedStation === 'Station 2' ? 'active-btn' : ''}`}
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
              className="form-control-custom shadow-sm"
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
              className="form-control-custom shadow-sm"
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
            className="px-5 py-2 fw-bold shadow-lg download-btn"
          >
            Download Data
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Download;