import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Row, Col, Modal, Button, ButtonGroup } from "react-bootstrap";

const TrendChart = ({ data }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [interval, setInterval] = useState(15); // Default: 15 minutes

  const metricLabels = {
    temperature: "Temperature (°C)",
    humidity: "Humidity (%)",
    airPressure: "Air Pressure (hPa)",
    irradiation: "Irradiation (W/m²)",
    oxygen: "Oxygen (%)",
    rainfall: "Rainfall (mm)",
    windspeed: "Wind Speed (km/h)",
    windDirection: "Wind Direction (°)",
    waterTemperature: "Water Temperature (°C)",
  };

  // Convert timestamp to Date objects
  const parsedData = data.map((item) => ({
    ...item,
    timestamp: new Date(item.timestamp).getTime(),
  }));

  // Filter per day (ambil satu data per tanggal)
  const filterDataPerDay = () => {
    const seenDates = new Set();
    return parsedData.filter((item) => {
      const dateOnly = new Date(item.timestamp).toISOString().split("T")[0];
      if (seenDates.has(dateOnly)) return false;
      seenDates.add(dateOnly);
      return true;
    });
  };

  // Filter per interval (15 atau 30 menit)
  const filterDataByInterval = (intervalMinutes) => {
    const filtered = [];
    let last = null;
    for (let i = 0; i < parsedData.length; i++) {
      const now = parsedData[i].timestamp;
      if (!last || now - last >= intervalMinutes * 60 * 1000) {
        filtered.push(parsedData[i]);
        last = now;
      }
    }
    return filtered;
  };

  // Hitung domain waktu X
  const getXAxisDomain = (filtered) => {
    if (filtered.length < 2) return ["auto", "auto"];
    const times = filtered.map((d) => d.timestamp);
    const min = Math.min(...times);
    const max = Math.max(...times);
    return [min, max];
  };

  // Domain Y: 10% lebih tinggi dari nilai max
  const getYAxisDomain = (data, metric) => {
    const values = data.map((d) => d[metric]).filter((v) => typeof v === "number");
    const max = Math.max(...values);
    const min = Math.min(...values);
    return [Math.floor(min - 0.1 * Math.abs(min)), Math.ceil(max + 0.1 * Math.abs(max))];
  };

  return (
    <>
      <Row>
        {Object.keys(metricLabels).map((metric) => (
          <Col md={4} key={metric} className="mb-4">
            <div
              style={{
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                cursor: "pointer",
              }}
              onClick={() => {
                setSelectedMetric(metric);
                setShowDetail(true);
              }}
            >
              <h6 className="text-center" style={{ color: "#007bff" }}>
                {metricLabels[metric]}
              </h6>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={filterDataPerDay()}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    type="number"
                    domain={getXAxisDomain(filterDataPerDay())}
                    tickFormatter={(tick) =>
                      new Date(tick).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                      })
                    }
                  />
                  <YAxis domain={getYAxisDomain(filterDataPerDay(), metric)} />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(label).toLocaleString("id-ID")
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={metric}
                    stroke="#007bff"
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Col>
        ))}
      </Row>

      {/* Modal Detail Chart */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedMetric ? metricLabels[selectedMetric] : "Detail"}
          </Modal.Title>
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
            <LineChart
              data={filterDataByInterval(interval)}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={getXAxisDomain(filterDataByInterval(interval))}
                tickFormatter={(tick) =>
                  new Date(tick).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
              />
              <YAxis
                domain={getYAxisDomain(filterDataByInterval(interval), selectedMetric)}
              />
              <Tooltip
                labelFormatter={(label) =>
                  new Date(label).toLocaleString("id-ID")
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke="#007bff"
                activeDot={{ r: 6 }}
              />
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
