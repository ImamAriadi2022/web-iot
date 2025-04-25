import React from "react";
import GaugeChart from "react-gauge-chart";

const HumidityGauge = ({ humidity }) => {
  // Fungsi untuk menentukan kategori berdasarkan kelembapan
  const getCategory = (hum) => {
    if (hum < 30) return "Sangat Kering";
    if (hum < 40) return "Kering";
    if (hum < 60) return "Normal";
    if (hum < 80) return "Lembap";
    return "Sangat Lembap";
  };

  // Fungsi untuk menentukan warna berdasarkan kategori
  const getColor = (hum) => {
    if (hum < 30) return ["#FFA500", "#e6e6e6"]; // Orange
    if (hum < 40) return ["#ADFF2F", "#e6e6e6"]; // Hijau Muda
    if (hum < 60) return ["#00FF00", "#e6e6e6"]; // Hijau
    if (hum < 80) return ["#FFD700", "#e6e6e6"]; // Kuning
    return ["#FF4500", "#e6e6e6"]; // Orange (Sangat Lembap)
  };

  // Hitung nilai persen untuk GaugeChart
  const percentValue = humidity / 100;

  return (
    <div style={{ width: "200px", margin: "0 auto" }}>
      <GaugeChart
        id="humidity-gauge"
        nrOfLevels={100}
        arcsLength={[percentValue, 1 - percentValue]}
        colors={getColor(humidity)} // Warna berdasarkan kategori
        percent={percentValue}
        arcPadding={0.01}
        cornerRadius={3}
        needleColor="#464A4F"
        needleBaseColor="#464A4F"
        textColor="#000000"
        formatTextValue={() => `${humidity.toFixed(1)}%`}
      />
      <p style={{ textAlign: "center", marginTop: "-10px", fontWeight: "bold" }}>
        {getCategory(humidity)}
      </p>
    </div>
  );
};

export default HumidityGauge;