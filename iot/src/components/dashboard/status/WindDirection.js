import React from "react";
import GaugeChart from "react-gauge-chart";

const WindDirectionGauge = ({ windDirection }) => {
  // Fungsi untuk menentukan kategori berdasarkan arah angin
  const getCategory = (direction) => {
    if (direction === 0) return "Utara (U)";
    if (direction > 0 && direction <= 45) return "Timur Laut (TL)";
    if (direction > 45 && direction <= 90) return "Timur (T)";
    if (direction > 90 && direction <= 135) return "Tenggara (TG)";
    if (direction > 135 && direction <= 180) return "Selatan (S)";
    if (direction > 180 && direction <= 225) return "Barat Daya (BD)";
    if (direction > 225 && direction <= 270) return "Barat (B)";
    if (direction > 270 && direction <= 315) return "Barat Laut (BL)";
    return "Utara (U)"; // Jika lebih dari 315°, kembali ke Utara
  };

  // Hitung nilai persen untuk GaugeChart
  const percentValue = typeof windDirection === "number" ? windDirection / 360 : 0;

  return (
    <div style={{ width: "200px", margin: "0 auto" }}>
      <GaugeChart
        id="wind-direction-gauge"
        nrOfLevels={360}
        arcsLength={[percentValue, 1 - percentValue]}
        colors={["#FFD700", "#e6e6e6"]}
        percent={percentValue}
        arcPadding={0.01}
        cornerRadius={3}
        needleColor="#464A4F"
        needleBaseColor="#464A4F"
        textColor="#000000"
        formatTextValue={() =>
          typeof windDirection === "number" ? `${windDirection.toFixed(1)}°` : "N/A"
        }
      />
      <p style={{ textAlign: "center", marginTop: "-10px", fontWeight: "bold" }}>
        {typeof windDirection === "number" ? getCategory(windDirection) : "Data Tidak Valid"}
      </p>
    </div>
  );
};

export default WindDirectionGauge;