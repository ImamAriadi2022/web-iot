import { useState } from "react";
import { Button, ButtonGroup, Col, Modal, Row } from "react-bootstrap";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const TrendChart = ({ data }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [interval, setInterval] = useState(15); // Default interval: 15 minutes

  // Label untuk setiap metrik (disesuaikan dengan tabel Station1)
  const metricLabels = {
    humidity: "Humidity (%)",
    temperature: "Temperature (°C)",
    airPressure: "Air Pressure (hPa)",
    irradiation: "Irradiation (W/m²)",
    oxygen: "Upper Water Temp (°C)",
    rainfall: "Rainfall (mm)",
    windspeed: "Windspeed (km/h)",
    windDirection: "Wind Direction (°)",
    waterTemperature: "Water Temperature (Lower, °C)",
  };

  // Filter data untuk menampilkan data per hari
  const filterDataPerDay = (data) => {
    const filtered = [];
    const seenDates = new Set();

    data.forEach((item) => {
      const date = new Date(item.timestamp).toISOString().split("T")[0]; // Ambil tanggal saja
      if (!seenDates.has(date)) {
        filtered.push(item);
        seenDates.add(date);
      }
    });

    return filtered;
  };

  // Filter data berdasarkan interval (15 menit atau 30 menit)
  const filterDataByInterval = (data, interval) => {
    const filtered = [];
    let lastTimestamp = null;
  
    data.forEach((item) => {
      const currentTimestamp = new Date(item.timestamp).getTime();
  
      if (!lastTimestamp || currentTimestamp - lastTimestamp >= interval * 60 * 1000) {
        filtered.push(item);
        lastTimestamp = currentTimestamp;
      }
    });
  
    return filtered;
  };

  return (
    <>
      <Row>
        {Object.keys(metricLabels).map((metric) => (
          <Col md={4} className="mb-4" key={metric}>
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
              }}
              onClick={() => {
                setSelectedMetric(metric);
                setShowDetail(true);
              }}
            >
              <h5 style={{ color: "#007bff", textAlign: "center" }}>{metricLabels[metric]}</h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filterDataPerDay(data)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis 
                    domain={['dataMin - 5', 'dataMax + 10']}
                    tickCount={6}
                  />
                  <Tooltip />
                  <Legend />
                  <Line name={metricLabels[metric]} type="monotone" dataKey={metric} stroke="#007bff" activeDot={{ r: 8 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Col>
        ))}
      </Row>

      {/* Modal untuk Detail Chart */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedMetric ? metricLabels[selectedMetric] : "Detail Chart"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ButtonGroup className="mb-3">
            <Button
              variant={interval === 15 ? "primary" : "outline-primary"}
              onClick={() => setInterval(15)}
            >
              15 Minutes
            </Button>
            <Button
              variant={interval === 30 ? "primary" : "outline-primary"}
              onClick={() => setInterval(30)}
            >
              30 Minutes
            </Button>
          </ButtonGroup>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={filterDataByInterval(data, interval)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis 
                domain={['dataMin - 5', 'dataMax + 10']}
                tickCount={8}
              />
              <Tooltip />
              <Legend />
              <Line name={metricLabels[selectedMetric]} type="monotone" dataKey={selectedMetric} stroke="#007bff" activeDot={{ r: 8 }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetail(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TrendChart;