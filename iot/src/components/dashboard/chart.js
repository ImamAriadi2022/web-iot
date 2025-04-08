import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Dropdown, DropdownButton } from "react-bootstrap";

const TrendChart = ({ data }) => {
  // State untuk menentukan data yang akan ditampilkan di chart
  const [selectedMetric, setSelectedMetric] = useState("temperature");

  // Label untuk setiap metrik
  const metricLabels = {
    temperature: "Temperature (°C)",
    humidity: "Humidity (%)",
    airPressure: "Air Pressure (hPa)",
    irradiation: "Irradiation (W/m²)",
    oxygen: "Oxygen (%)",
    rainfall: "Rainfall (mm)",
    windspeed: "Wind Speed (km/h)",
    windDirection: "Wind Direction (°)", // Menambahkan Wind Direction
  };

  // Fungsi untuk menangani perubahan metrik
  const handleMetricChange = (metric) => {
    setSelectedMetric(metric);
  };

  return (
    <div>
      <h4 style={{ color: "#007bff", textAlign: "center" }}>Trend Chart</h4>

      {/* Dropdown untuk memilih metrik */}
      <div className="d-flex justify-content-center mb-3">
        <DropdownButton
          id="dropdown-metric-selector"
          title={`Pilih Chart: ${metricLabels[selectedMetric].split(" ")[0]}`}
          variant="primary"
        >
          {Object.keys(metricLabels).map((metric) => (
            <Dropdown.Item
              key={metric}
              onClick={() => handleMetricChange(metric)}
              active={selectedMetric === metric}
            >
              {metricLabels[metric]}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={selectedMetric} stroke="#007bff" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;