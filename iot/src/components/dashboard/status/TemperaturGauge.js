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

  // Hitung nilai persen untuk GaugeChart
  const percentValue = (temperature - 10) / 30;

  return (
    <div style={{ width: "200px", margin: "0 auto" }}>
      <GaugeChart
        id="temperature-gauge"
        nrOfLevels={100}
        arcsLength={[percentValue, 1 - percentValue]}
        colors={["#FF4500", "#e6e6e6"]}
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