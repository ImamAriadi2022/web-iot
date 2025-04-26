import React from "react";
import GaugeChart from "react-gauge-chart";

const AirPressureGauge = ({ airPressure }) => {
  // Fungsi untuk menentukan kategori berdasarkan tekanan udara
  const getCategory = (pressure) => {
    if (pressure < 1000) return "Rendah";
    if (pressure <= 1020) return "Sedang";
    if (pressure <= 1040) return "Tinggi";
    return "Sangat Tinggi";
  };

  // Fungsi untuk menentukan warna berdasarkan kategori
  const getColor = (pressure) => {
    if (pressure < 1000) return ["#00FF00", "#e6e6e6"]; // Hijau
    if (pressure <= 1020) return ["#ADFF2F", "#e6e6e6"]; // Hijau Muda
    if (pressure <= 1040) return ["#FFD700", "#FFA500"]; // Kuning dan Orange
    return ["#FF4500", "#e6e6e6"]; // Merah
  };

  // Hitung nilai persen untuk GaugeChart
  const percentValue = (airPressure - 950) / 120;

  return (
    <div style={{ width: "200px", margin: "0 auto" }}>
      <GaugeChart
        id="air-pressure-gauge"
        nrOfLevels={100}
        arcsLength={[percentValue, 1 - percentValue]}
        colors={getColor(airPressure)} // Warna berdasarkan kategori
        percent={percentValue}
        arcPadding={0.01}
        cornerRadius={3}
        needleColor="#464A4F"
        needleBaseColor="#464A4F"
        textColor="#000000"
        formatTextValue={() => `${airPressure.toFixed(1)} hPa`}
      />
      <p style={{ textAlign: "center", marginTop: "-10px", fontWeight: "bold" }}>
        {getCategory(airPressure)}
      </p>
    </div>
  );
};

export default AirPressureGauge;