import React from "react";
import "./HumidityGauge.css";

const HumidityGauge = ({ humidity }) => {
  // Fungsi untuk menentukan kategori berdasarkan kelembapan
  const getCategory = (hum) => {
    if (hum < 30) return "Sangat Kering";
    if (hum < 40) return "Kering";
    if (hum < 60) return "Normal";
    if (hum < 80) return "Lembap";
    return "Sangat Lembap";
  };

  // Hitung rotasi jarum berdasarkan kelembapan
  const needleRotation = (humidity / 120) * 180 - 90;

  return (
    <div className="gauge-container">
      <div className="gauge">
        {/* Angka-angka pada gauge */}
        <span>0</span>
        <span>20</span>
        <span>40</span>
        <span>60</span>
        <span>80</span>
        <span>100</span>
        <span>120</span>
        
        <div
          className="needle"
          style={{ transform: `rotate(${needleRotation}deg)` }}
        ></div>
        <div className="center"></div>
        {/* Humidity display di dalam lingkaran */}
        <div className="humidity-display">
          <p>{humidity.toFixed(1)}%</p>
          <br />
          <p>{getCategory(humidity)}</p>
        </div>
      </div>
    </div>
  );
};

export default HumidityGauge;