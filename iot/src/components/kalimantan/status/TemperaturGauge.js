import React from "react";
import GaugeChart from "react-gauge-chart";

const TemperatureGauge = ({ temperature }) => {
  // Fungsi untuk menentukan kategori berdasarkan suhu
  const getCategory = (temp) => {
    if (temp < 15) return "Dingin";
    if (temp < 20) return "Sejuk";
    if (temp < 25) return "Nyaman";
    if (temp < 30) return "Hangat";
    if (temp < 35) return "Panas";
    return "Sangat Panas";
  };

  // Fungsi untuk menentukan warna berdasarkan kategori
  const getColor = (temp) => {
    if (temp < 15) return ["#0000FF", "#e6e6e6"]; // Biru
    if (temp < 20) return ["#87CEEB", "#e6e6e6"]; // Biru Muda
    if (temp < 25) return ["#00FF00", "#e6e6e6"]; // Hijau
    if (temp < 30) return ["#FFD700", "#e6e6e6"]; // Kuning
    if (temp < 35) return ["#FFA500", "#e6e6e6"]; // Orange
    return ["#FF4500", "#e6e6e6"]; // Merah
  };

  // Hitung nilai persen untuk GaugeChart
  const percentValue = (temperature - 10) / 30; // Asumsi rentang suhu adalah 10°C hingga 40°C

  return (
    <div style={{ width: "200px", margin: "0 auto" }}>
      <GaugeChart
        id="temperature-gauge"
        nrOfLevels={100}
        arcsLength={[percentValue, 1 - percentValue]}
        colors={getColor(temperature)} // Warna berdasarkan kategori
        percent={percentValue}
        arcPadding={0.01}
        cornerRadius={3}
        needleColor="#464A4F"
        needleBaseColor="#464A4F"
        textColor="#000000"
        formatTextValue={() => `${temperature.toFixed(1)}°C`}
      />
      <p style={{ textAlign: "center", marginTop: "-10px", fontWeight: "bold" }}>
        {getCategory(temperature)}
      </p>
    </div>
  );
};

export default TemperatureGauge;