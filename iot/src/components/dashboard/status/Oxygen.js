import React from "react";
import GaugeChart from "react-gauge-chart";

const OxygenGauge = ({ oxygen }) => {
  // Fungsi untuk menentukan kategori berdasarkan kadar oksigen
  const getCategory = (oxy) => {
    if (oxy < 19.5) return "Kekurangan Oksigen";
    if (oxy <= 23.5) return "Aman";
    return "Kelebihan Oksigen";
  };

  // Hitung nilai persen untuk GaugeChart
  const percentValue = (oxygen - 18) / 6; // Asumsi rentang oksigen adalah 18% hingga 24%

  return (
    <div style={{ width: "200px", margin: "0 auto" }}>
      <GaugeChart
        id="oxygen-gauge"
        nrOfLevels={100}
        arcsLength={[percentValue, 1 - percentValue]}
        colors={["#32CD32", "#e6e6e6"]}
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