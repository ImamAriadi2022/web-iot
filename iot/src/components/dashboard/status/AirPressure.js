import React from "react";
import "./AirPressureGauge.css";

const AirPressureGauge = ({ airPressure }) => {
  // Fungsi untuk menentukan kategori berdasarkan tekanan udara
  const getCategory = (pressure) => {
    if (pressure < 1000) return "Rendah";
    if (pressure <= 1020) return "Sedang";
    return "Tinggi";
  };

  // Hitung rotasi jarum berdasarkan tekanan udara
  const needleRotation = ((airPressure - 950) / 100) * 180 - 90;

  return (
    <div className="gauge-container">
      <div className="gauge">
        {/* Angka-angka pada gauge */}
        <span>950</span>
        <span>970</span>
        <span>990</span>
        <span>1010</span>
        <span>1030</span>
        <span>1050</span>
        <span>1070</span>
        <div
          className="needle"
          style={{ transform: `rotate(${needleRotation}deg)` }}
        ></div>
        <div className="center"></div>
        {/* Air Pressure display di dalam lingkaran */}
        <div className="air-pressure-display">
          <p>{airPressure.toFixed(1)} hPa</p>
          <br />
          <p>{getCategory(airPressure)}</p>
        </div>
      </div>
    </div>
  );
};

export default AirPressureGauge;