import React from "react";
import GaugeChart from "react-gauge-chart";

// Logic is now for water temperature (lower), but variable name remains 'oxygen'
const OxygenGauge = ({ oxygen }) => {
  // Function to determine category based on water temperature (lower)
  const getCategory = (temp) => {
    if (temp < 15) return "Cold";
    if (temp < 20) return "Cool";
    if (temp < 25) return "Comfortable";
    if (temp < 30) return "Warm";
    if (temp < 35) return "Hot";
    return "Very Hot";
  };

  // Function to determine color based on water temperature (lower)
  const getColor = (temp) => {
    if (temp < 15) return ["#0000FF", "#e6e6e6"]; // Blue
    if (temp < 20) return ["#87CEEB", "#e6e6e6"]; // Light Blue
    if (temp < 25) return ["#00FF00", "#e6e6e6"]; // Green
    if (temp < 30) return ["#FFD700", "#e6e6e6"]; // Yellow
    if (temp < 35) return ["#FFA500", "#e6e6e6"]; // Orange
    return ["#FF4500", "#e6e6e6"]; // Red
  };

  // Calculate percent value for GaugeChart (water temp range 10°C to 40°C)
  const percentValue = (oxygen - 10) / 30;

  return (
    <div style={{ width: "200px", margin: "0 auto" }}>
      <GaugeChart
        id="oxygen-gauge"
        nrOfLevels={100}
        arcsLength={[percentValue, 1 - percentValue]}
        colors={getColor(oxygen)}
        percent={percentValue}
        arcPadding={0.01}
        cornerRadius={3}
        needleColor="#464A4F"
        needleBaseColor="#464A4F"
        textColor="#000000"
        formatTextValue={() => `${oxygen.toFixed(1)}°C`}
      />
      <p style={{ textAlign: "center", marginTop: "-10px", fontWeight: "bold" }}>
        {getCategory(oxygen)}
      </p>
    </div>
  );
};

export default OxygenGauge;