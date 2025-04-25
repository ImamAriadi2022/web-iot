import React from "react";
import GaugeChart from "react-gauge-chart";

const RainfallGauge = ({ rainfall }) => {
  // Fungsi untuk menentukan kategori berdasarkan curah hujan
  const getCategory = (rain) => {
    if (rain <= 20) return "Ringan";
    if (rain <= 50) return "Sedang";
    if (rain <= 100) return "Lebat";
    if (rain <= 150) return "Sangat Lebat";
    return "Overload";
  };

  // Fungsi untuk menentukan warna berdasarkan kategori
  const getColor = (rain) => {
    if (rain <= 20) return ["#00FF00", "#e6e6e6"]; // Hijau
    if (rain <= 50) return ["#ADFF2F", "#e6e6e6"]; // Hijau Muda
    if (rain <= 100) return ["#FFD700", "#e6e6e6"]; // Kuning
    if (rain <= 150) return ["#FFA500", "#e6e6e6"]; // Orange
    return ["#FF4500", "#e6e6e6"]; // Merah (Overload)
  };

  // Hitung nilai persen untuk GaugeChart
  const percentValue = rainfall / 150; // Asumsi nilai maksimum adalah 150 mm

  return (
    <div style={{ width: "200px", margin: "0 auto" }}>
      <GaugeChart
        id="rainfall-gauge"
        nrOfLevels={100}
        arcsLength={[percentValue, 1 - percentValue]}
        colors={getColor(rainfall)} // Warna berdasarkan kategori
        percent={percentValue}
        arcPadding={0.01}
        cornerRadius={3}
        needleColor="#464A4F"
        needleBaseColor="#464A4F"
        textColor="#000000"
        formatTextValue={() => `${rainfall.toFixed(1)} mm`}
      />
      <p style={{ textAlign: "center", marginTop: "-10px", fontWeight: "bold" }}>
        {getCategory(rainfall)}
      </p>
    </div>
  );
};

export default RainfallGauge;