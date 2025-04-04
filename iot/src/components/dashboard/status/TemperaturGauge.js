import React from "react";
import "./TemperatureGauge.css";

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

  // Hitung rotasi jarum berdasarkan suhu
  const needleRotation = ((temperature - 10) / 30) * 180 - 90;

  return (
    <div className="gauge-container">
      <div className="gauge">
        {/* Angka-angka pada gauge */}
        <span>10</span>
        <span>15</span>
        <span>20</span>
        <span>25</span>
        <span>30</span>
        <span>35</span>
        <span>40</span>
        <div
          className="needle"
          style={{ transform: `rotate(${needleRotation}deg)` }}
        ></div>
        <div className="center"></div>
        {/* Temperature display di dalam lingkaran */}
        <div className="temperature-display">
          <p>{temperature.toFixed(1)}°C</p>
          <br />
          <p>{getCategory(temperature)}</p>
        </div>
      </div>
    </div>
  );
};

export default TemperatureGauge;