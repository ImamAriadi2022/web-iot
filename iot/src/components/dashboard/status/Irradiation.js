import React from "react";
import GaugeChart from "react-gauge-chart";

const IrradiationGauge = ({ irradiation }) => {
  // Fungsi untuk menentukan kategori berdasarkan radiasi
  const getCategory = (irr) => {
    if (irr <= 200) return "Rendah";
    if (irr <= 400) return "Sedang";
    if (irr <= 600) return "Tinggi";
    return "Sangat Tinggi";
  };

  // Fungsi untuk menentukan warna berdasarkan kategori
  const getColor = (irr) => {
    if (irr <= 200) return ["#00FF00", "#e6e6e6"]; // Hijau
    if (irr <= 400) return ["#ADFF2F", "#e6e6e6"]; // Hijau Muda
    if (irr <= 600) return ["#FFD700", "#e6e6e6"]; // Kuning
    return ["#FF4500", "#e6e6e6"]; // Orange Merah
  };

  // Hitung nilai persen untuk GaugeChart
  const percentValue = irradiation / 800; // Asumsi nilai maksimum adalah 800 W/m²

  return (
    <div style={{ width: "200px", margin: "0 auto" }}>
      <GaugeChart
        id="irradiation-gauge"
        nrOfLevels={100}
        arcsLength={[percentValue, 1 - percentValue]}
        colors={getColor(irradiation)} // Warna berdasarkan kategori
        percent={percentValue}
        arcPadding={0.01}
        cornerRadius={3}
        needleColor="#464A4F"
        needleBaseColor="#464A4F"
        textColor="#000000"
        formatTextValue={() => `${irradiation.toFixed(1)} W/m²`}
      />
      <p style={{ textAlign: "center", marginTop: "-10px", fontWeight: "bold" }}>
        {getCategory(irradiation)}
      </p>
    </div>
  );
};

export default IrradiationGauge;