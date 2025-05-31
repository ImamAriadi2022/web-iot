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

// Ambil hanya 1 data (terbaru) per hari
const getOneDataPerDay = (data) => {
  const map = {};
  data.forEach(item => {
    const date = item.timestamp ? item.timestamp.slice(0, 10) : '';
    if (date) map[date] = item;
  });
  return Object.values(map).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
};

const TrendChart = ({ data, fields }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [interval, setInterval] = useState(15); // Default interval: 15 minutes

  // Filter data berdasarkan interval menit (khusus modal)
    const filterDataByInterval = (data, intervalMinutes) => {
      if (!data || data.length === 0) return [];
      // Urutkan data dari waktu paling awal ke paling akhir
      const sorted = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const filtered = [];
      let lastTimestamp = null;
  
      sorted.forEach((item) => {
        const currentTimestamp = new Date(item.timestamp).getTime();
        if (
          !lastTimestamp ||
          currentTimestamp - lastTimestamp >= intervalMinutes * 60 * 1000
        ) {
          filtered.push(item);
          lastTimestamp = currentTimestamp;
        }
      });
  
      return filtered;
    };

  // Data untuk chart utama: hanya 1 data per hari
  const mainChartData = getOneDataPerDay(data);

  // Data untuk modal: gunakan data asli (bukan mainChartData), filter interval
  const modalData =
    showDetail && selectedMetric
      ? filterDataByInterval(data, interval)
      : [];
    
  if (showDetail && selectedMetric) {
    console.log("Modal data by interval:", modalData);
  }

  return (
    <>
      <Row>
        {fields.map((field) => (
          <Col md={4} className="mb-4" key={field.key}>
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
              }}
              onClick={() => {
                setSelectedMetric(field.key);
                setShowDetail(true);
              }}
            >
              <h5 style={{ color: "#007bff", textAlign: "center" }}>
                {field.label}
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mainChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) =>
                      value ? value.slice(0, 10) : ""
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      value ? value.replace("T", " ") : ""
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={field.key}
                    stroke="#007bff"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Col>
        ))}
      </Row>

      {/* Modal untuk Detail Chart */}
      <Modal
        show={showDetail}
        onHide={() => setShowDetail(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedMetric
              ? fields.find((f) => f.key === selectedMetric)?.label
              : "Detail Chart"}
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
            <LineChart data={modalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) =>
                  value ? value.replace("T", " ").slice(0, 16) : ""
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) =>
                  value ? value.replace("T", " ") : ""
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke="#007bff"
                activeDot={{ r: 8 }}
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