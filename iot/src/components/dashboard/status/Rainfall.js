import React from "react";
import GaugeChart from "react-gauge-chart";

const RainfallGauge = ({ rainfall }) => {
  // Fungsi untuk menentukan kategori berdasarkan curah hujan
  const getCategory = (rain) => {
    if (rain <= 20) return "Ringan";
    if (rain <= 50) return "Sedang";
    if (rain <= 100) return "Lebat";
    return "Sangat Lebat";
  };

  // Hitung nilai persen untuk GaugeChart
  const percentValue = rainfall / 150; // Asumsi nilai maksimum adalah 150 mm

  return (
    <div style={{ width: "200px", margin: "0 auto" }}>
      <GaugeChart
        id="rainfall-gauge"
        nrOfLevels={100}
        arcsLength={[percentValue, 1 - percentValue]}
        colors={["#1E90FF", "#e6e6e6"]}
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