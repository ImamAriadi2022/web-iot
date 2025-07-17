import { useState } from "react";
import { Button, ButtonGroup, Col, Modal, Row } from "react-bootstrap";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Fungsi ini tidak dipakai lagi untuk chart utama
// const getOneDataPerDay = (data) => { ... }

const TrendChart = ({ data, fields }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [interval, setInterval] = useState(15); // Default interval: 15 minutes

  // Untuk chart utama: tampilkan semua data hasil filter waktu
  const mainChartData = data;

  // Untuk modal detail: filter interval jika ingin, atau tampilkan semua data
  const filterDataByInterval = (data, intervalMinutes) => {
    if (!data || data.length === 0) return [];
    // Urutkan data dari waktu paling awal ke paling akhir
    const sorted = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    // Jika data sudah berinterval 15/30 menit, bisa langsung return sorted
    // Jika ingin filter berdasarkan menit pada jam:
    return sorted.filter(item => {
      const date = new Date(item.timestamp);
      return date.getMinutes() % intervalMinutes === 0;
    });
  };

  const modalData =
    showDetail && selectedMetric
      ? filterDataByInterval(data, interval)
      : [];

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
                <LineChart data={mainChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) =>
                      value ? value.replace("T", " ").slice(0, 16) : ""
                    }
                  />
                  <YAxis 
                    domain={['dataMin - 5', 'dataMax + 10']}
                    tickCount={6}
                  />
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
                    strokeWidth={2}
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
            <LineChart data={modalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) =>
                  value ? value.replace("T", " ").slice(0, 16) : ""
                }
              />
              <YAxis 
                domain={['dataMin - 5', 'dataMax + 10']}
                tickCount={8}
              />
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
                strokeWidth={2}
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