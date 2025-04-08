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

  // Hitung nilai persen untuk GaugeChart
  const percentValue = humidity / 100;

  return (
    <div style={{ width: "200px", margin: "0 auto" }}>
      <GaugeChart
        id="humidity-gauge"
        nrOfLevels={100}
        arcsLength={[percentValue, 1 - percentValue]}
        colors={["#1E90FF", "#e6e6e6"]}
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