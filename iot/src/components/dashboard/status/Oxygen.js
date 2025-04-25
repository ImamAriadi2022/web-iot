import React from "react";
import GaugeChart from "react-gauge-chart";

const OxygenGauge = ({ oxygen }) => {
  // Fungsi untuk menentukan kategori berdasarkan kadar oksigen
  const getCategory = (oxy) => {
    if (oxy < 19.5) return "Kekurangan Oksigen";
    if (oxy <= 23.5) return "Aman";
    if (oxy <= 25) return "Kelebihan Oksigen";
    return "Overload";
  };

  // Fungsi untuk menentukan warna berdasarkan kategori
  const getColor = (oxy) => {
    if (oxy < 19.5) return ["#FFA500", "#e6e6e6"]; // Orange
    if (oxy <= 23.5) return ["#32CD32", "#e6e6e6"]; // Hijau
    if (oxy <= 25) return ["#FFD700", "#e6e6e6"]; // Kuning
    return ["#FF4500", "#e6e6e6"]; // Merah (Overload)
  };

  // Hitung nilai persen untuk GaugeChart
  const percentValue = (oxygen - 18) / 7; // Asumsi rentang oksigen adalah 18% hingga 25%

  return (
    <div style={{ width: "200px", margin: "0 auto" }}>
      <GaugeChart
        id="oxygen-gauge"
        nrOfLevels={100}
        arcsLength={[percentValue, 1 - percentValue]}
        colors={getColor(oxygen)} // Warna berdasarkan kategori
        percent={percentValue}
        arcPadding={0.01}
        cornerRadius={3}
        needleColor="#464A4F"
        needleBaseColor="#464A4F"
        textColor="#000000"
        formatTextValue={() => `${oxygen.toFixed(1)}%`}
      />
      <p style={{ textAlign: "center", marginTop: "-10px", fontWeight: "bold" }}>
        {getCategory(oxygen)}
      </p>
    </div>
  );
};

export default OxygenGauge;