import React from "react";
import GaugeChart from "react-gauge-chart";

const WindspeedGauge = ({ windspeed }) => {
  // Fungsi untuk menentukan kategori berdasarkan kecepatan angin
  const getCategory = (speed) => {
    if (speed < 1) return "Tenang";
    if (speed <= 5) return "Sepoi-sepoi";
    if (speed <= 11) return "Lemah";
    if (speed <= 19) return "Sedang";
    if (speed <= 28) return "Cukup Kuat";
    if (speed <= 38) return "Kuat";
    if (speed <= 49) return "Kencang";
    if (speed <= 61) return "Sangat Kencang";
    if (speed <= 74) return "Ribut";
    if (speed <= 88) return "Sangat Ribut";
    if (speed <= 102) return "Badai";
    if (speed <= 117) return "Dahsyat";
    return "Topan";
  };

  // Fungsi untuk menentukan warna berdasarkan kecepatan angin
  const getColor = (speed) => {
    const hue = 120 - (speed / 120) * 120; // 120° (Hijau) ke 0° (Merah)
    return `hsl(${hue}, 100%, 50%)`;
  };

  // Hitung nilai persen untuk GaugeChart
  const percentValue = windspeed / 120; // Asumsi nilai maksimum adalah 120 km/h

  return (
    <div style={{ width: "200px", margin: "0 auto" }}>
      <GaugeChart
        id="windspeed-gauge"
        nrOfLevels={100}
        arcsLength={[percentValue, 1 - percentValue]}
        colors={[getColor(windspeed), "#e6e6e6"]} // Warna berdasarkan kecepatan angin
        percent={percentValue}
        arcPadding={0.01}
        cornerRadius={3}
        needleColor="#464A4F"
        needleBaseColor="#464A4F"
        textColor="#000000"
        formatTextValue={() => `${windspeed.toFixed(1)} km/h`}
      />
      <p style={{ textAlign: "center", marginTop: "-10px", fontWeight: "bold" }}>
        {getCategory(windspeed)}
      </p>
    </div>
  );
};

export default WindspeedGauge;