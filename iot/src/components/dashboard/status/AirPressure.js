import React from "react";
import GaugeChart from "react-gauge-chart";

const AirPressureGauge = ({ airPressure }) => {
  // Fungsi untuk menentukan kategori berdasarkan tekanan udara
  const getCategory = (pressure) => {
    if (pressure < 1000) return "Rendah";
    if (pressure <= 1020) return "Sedang";
    return "Tinggi";
  };

  // Hitung nilai persen untuk GaugeChart
  const percentValue = (airPressure - 950) / 120;

  return (
    <div style={{ width: "200px", margin: "0 auto" }}>
      <GaugeChart
        id="air-pressure-gauge"
        nrOfLevels={100}
        arcsLength={[percentValue, 1 - percentValue]}
        colors={["#1E90FF", "#e6e6e6"]}
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