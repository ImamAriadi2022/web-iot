import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, ButtonGroup, Button } from 'react-bootstrap';
import { FaThermometerHalf, FaTint, FaTachometerAlt, FaSun } from 'react-icons/fa';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

// memasukan komponen yang dibutuhkan
import TemperatureGauge from './status/TemperaturGauge';
import HumidityGauge from './status/HumidityGauge';
import AirPressureGauge from './status/AirPressure';

const allData = [
    { timestamp: '2025-03-01', humidity: 65, temperature: 28, airPressure: 1012, irradiation: 500, oxygen: 21, rainfall: 10, windspeed: 15, windDirection: 'N' },
    { timestamp: '2025-03-02', humidity: 70, temperature: 30, airPressure: 1010, irradiation: 520, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 'NE' },
    { timestamp: '2025-03-03', humidity: 60, temperature: 27, airPressure: 1015, irradiation: 480, oxygen: 20.9, rainfall: 8, windspeed: 12, windDirection: 'E' },
    { timestamp: '2025-03-04', humidity: 75, temperature: 29, airPressure: 1011, irradiation: 510, oxygen: 20.7, rainfall: 12, windspeed: 14, windDirection: 'S' },
    { timestamp: '2025-03-05', humidity: 68, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 'W' },
    { timestamp: '2025-03-06', humidity: 72, temperature: 31, airPressure: 1010, irradiation: 530, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 'NW' },
    { timestamp: '2025-03-07', humidity: 66, temperature: 28, airPressure: 1014, irradiation: 495, oxygen: 20.9, rainfall: 9, windspeed: 13, windDirection: 'N' },
    { timestamp: '2025-03-08', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 505, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 'NE' },
    { timestamp: '2025-03-09', humidity: 63, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 11, windspeed: 12, windDirection: 'E' },
    { timestamp: '2025-03-10', humidity: 74, temperature: 30, airPressure: 1011, irradiation: 520, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 'S' },
    { timestamp: '2025-03-11', humidity: 67, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 8, windspeed: 9, windDirection: 'W' },
    { timestamp: '2025-03-12', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 7, windspeed: 11, windDirection: 'NW' },
    { timestamp: '2025-03-13', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 'N' },
    { timestamp: '2025-03-14', humidity: 68, temperature: 29, airPressure: 1012, irradiation: 510, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 'NE' },
    { timestamp: '2025-03-15', humidity: 62, temperature: 27, airPressure: 1016, irradiation: 480, oxygen: 21, rainfall: 12, windspeed: 12, windDirection: 'E' },
    { timestamp: '2025-03-16', humidity: 73, temperature: 30, airPressure: 1011, irradiation: 525, oxygen: 20.7, rainfall: 14, windspeed: 14, windDirection: 'S' },
    { timestamp: '2025-03-17', humidity: 66, temperature: 26, airPressure: 1013, irradiation: 495, oxygen: 21, rainfall: 9, windspeed: 9, windDirection: 'W' },
    { timestamp: '2025-03-18', humidity: 70, temperature: 31, airPressure: 1010, irradiation: 535, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 'NW' },
    { timestamp: '2025-03-19', humidity: 65, temperature: 28, airPressure: 1014, irradiation: 505, oxygen: 20.9, rainfall: 11, windspeed: 13, windDirection: 'N' },
    { timestamp: '2025-03-20', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 515, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 'NE' },
    { timestamp: '2025-03-21', humidity: 61, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 8, windspeed: 12, windDirection: 'E' },
    { timestamp: '2025-03-22', humidity: 72, temperature: 30, airPressure: 1011, irradiation: 530, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 'S' },
    { timestamp: '2025-03-23', humidity: 67, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 'W' },
    { timestamp: '2025-03-24', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 'NW' },
    { timestamp: '2025-03-25', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 'N' },
    { timestamp: '2025-03-26', humidity: 68, temperature: 29, airPressure: 1012, irradiation: 510, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 'NE' },
    { timestamp: '2025-03-27', humidity: 62, temperature: 27, airPressure: 1016, irradiation: 480, oxygen: 21, rainfall: 12, windspeed: 12, windDirection: 'E' },
    { timestamp: '2025-03-28', humidity: 73, temperature: 30, airPressure: 1011, irradiation: 525, oxygen: 20.7, rainfall: 14, windspeed: 14, windDirection: 'S' },
    { timestamp: '2025-03-29', humidity: 66, temperature: 26, airPressure: 1013, irradiation: 495, oxygen: 21, rainfall: 9, windspeed: 9, windDirection: 'W' },
    { timestamp: '2025-03-30', humidity: 70, temperature: 31, airPressure: 1010, irradiation: 535, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 'NW' },
    { timestamp: '2025-03-31', humidity: 65, temperature: 28, airPressure: 1014, irradiation: 505, oxygen: 20.9, rainfall: 11, windspeed: 13, windDirection: 'N' },
    { timestamp: '2025-04-01', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 515, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 'NE' },
    { timestamp: '2025-04-02', humidity: 61, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 8, windspeed: 12, windDirection: 'E' },
    { timestamp: '2025-04-03', humidity: 72, temperature: 30, airPressure: 1011, irradiation: 530, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 'S' },
    { timestamp: '2025-04-04', humidity: 100, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 'W' },
    { timestamp: '2025-04-05', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 'NW' },
    { timestamp: '2025-04-06', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 'N' },
    { timestamp: '2025-04-07', humidity: 68, temperature: 29, airPressure: 1012, irradiation: 510, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 'NE' },
    { timestamp: '2025-04-08', humidity: 62, temperature: 27, airPressure: 1016, irradiation: 480, oxygen: 21, rainfall: 12, windspeed: 12, windDirection: 'E' },
    { timestamp: '2025-04-09', humidity: 73, temperature: 30, airPressure: 1011, irradiation: 525, oxygen: 20.7, rainfall: 14, windspeed: 14, windDirection: 'S' },
    { timestamp: '2025-04-10', humidity: 66, temperature: 26, airPressure: 1013, irradiation: 495, oxygen: 21, rainfall: 9, windspeed: 9, windDirection: 'W' },
    { timestamp: '2025-04-11', humidity: 70, temperature: 31, airPressure: 1010, irradiation: 535, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 'NW' },
    { timestamp: '2025-04-12', humidity: 65, temperature: 28, airPressure: 1014, irradiation: 505, oxygen: 20.9, rainfall: 11, windspeed: 13, windDirection: 'N' },
    { timestamp: '2025-04-13', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 515, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 'NE' },
    { timestamp: '2025-04-14', humidity: 61, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 8, windspeed: 12, windDirection: 'E' },
    { timestamp: '2025-04-15', humidity: 72, temperature: 30, airPressure: 1011, irradiation: 530, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 'S' },
    { timestamp: '2025-04-16', humidity: 67, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 'W' },
    { timestamp: '2025-04-17', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 'NW' },
    { timestamp: '2025-04-18', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 'N' },
    { timestamp: '2025-04-19', humidity: 68, temperature: 29, airPressure: 1012, irradiation: 510, oxygen: 20.8, rainfall: 5, windspeed: 10, windDirection: 'NE' },
    { timestamp: '2025-04-20', humidity: 62, temperature: 27, airPressure: 1016, irradiation: 480, oxygen: 21, rainfall: 12, windspeed: 12, windDirection: 'E' },
    { timestamp: '2025-04-21', humidity: 73, temperature: 30, airPressure: 1011, irradiation: 525, oxygen: 20.7, rainfall: 14, windspeed: 14, windDirection: 'S' },
    { timestamp: '2025-04-22', humidity: 66, temperature: 26, airPressure: 1013, irradiation: 495, oxygen: 21, rainfall: 9, windspeed: 9, windDirection: 'W' },
    { timestamp: '2025-04-23', humidity: 70, temperature: 31, airPressure: 1010, irradiation: 535, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 'NW' },
    { timestamp: '2025-04-24', humidity: 65, temperature: 28, airPressure: 1014, irradiation: 505, oxygen: 20.9, rainfall: 11, windspeed: 13, windDirection: 'N' },
    { timestamp: '2025-04-25', humidity: 69, temperature: 29, airPressure: 1012, irradiation: 515, oxygen: 20.8, rainfall: 4, windspeed: 10, windDirection: 'NE' },
    { timestamp: '2025-04-26', humidity: 61, temperature: 27, airPressure: 1016, irradiation: 485, oxygen: 21, rainfall: 8, windspeed: 12, windDirection: 'E' },
    { timestamp: '2025-04-27', humidity: 72, temperature: 30, airPressure: 1011, irradiation: 530, oxygen: 20.7, rainfall: 13, windspeed: 14, windDirection: 'S' },
    { timestamp: '2025-04-28', humidity: 67, temperature: 26, airPressure: 1013, irradiation: 490, oxygen: 21, rainfall: 7, windspeed: 9, windDirection: 'W' },
    { timestamp: '2025-04-29', humidity: 71, temperature: 32, airPressure: 1010, irradiation: 540, oxygen: 20.6, rainfall: 6, windspeed: 11, windDirection: 'NW' },
    { timestamp: '2025-04-30', humidity: 64, temperature: 28, airPressure: 1014, irradiation: 500, oxygen: 20.9, rainfall: 10, windspeed: 13, windDirection: 'N' },
];

const Station1 = () => {
  const [filter, setFilter] = useState('1d');
  // const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [chartData, setChartData] = useState([]);


    // Fungsi untuk mengambil data dari API
    // const fetchData = async () => {
    //   try {
    //     const response = await fetch('https://example.com/api/environment-data'); // Ganti dengan URL API Anda
    //     const data = await response.json();
    //     setAllData(data); // Simpan data dari API ke state
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //   }
    // };
  // Fungsi untuk memfilter data berdasarkan waktu
  const handleFilterChange = (filterType) => {
    setFilter(filterType);

    const now = new Date();
    let filtered;

    if (filterType === '1d') {
      filtered = allData.filter((item) => {
        const itemDate = new Date(item.timestamp);
        return itemDate.toDateString() === now.toDateString(); // Hanya data hari ini
      });
    } else if (filterType === '7d') {
      filtered = allData.filter((item) => {
        const itemDate = new Date(item.timestamp);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return itemDate >= sevenDaysAgo && itemDate <= now; // 7 hari terakhir
      });
    } else if (filterType === '1m') {
      filtered = allData.filter((item) => {
        const itemDate = new Date(item.timestamp);
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(now.getDate() - 30);
        return itemDate >= oneMonthAgo && itemDate <= now; // 30 hari terakhir
      });
    }

    setFilteredData(filtered);
  };

  // Perbarui data untuk chart berdasarkan data yang difilter
  useEffect(() => {
    if (filteredData.length > 0) {
      const avgHumidity = filteredData.reduce((sum, item) => sum + item.humidity, 0) / filteredData.length;
      const avgTemperature = filteredData.reduce((sum, item) => sum + item.temperature, 0) / filteredData.length;
      const avgAirPressure = filteredData.reduce((sum, item) => sum + item.airPressure, 0) / filteredData.length;
      const avgIrradiation = filteredData.reduce((sum, item) => sum + item.irradiation, 0) / filteredData.length;
      const avgOxygen = filteredData.reduce((sum, item) => sum + item.oxygen, 0) / filteredData.length;
      const avgRainfall = filteredData.reduce((sum, item) => sum + item.rainfall, 0) / filteredData.length;
      const avgWindspeed = filteredData.reduce((sum, item) => sum + item.windspeed, 0) / filteredData.length;
  

      setChartData([
        { name: 'Humidity', value: avgHumidity, fill: '#8884d8' },
        { name: 'Temperature', value: avgTemperature, fill: '#83a6ed' },
        { name: 'Windspeed', value: avgWindspeed, fill: '#8dd1e1' },
        { name: 'Air Pressure', value: avgAirPressure, fill: '#82ca9d' },
        { name: 'Irradiation', value: avgIrradiation, fill: '#ffc658' },
        { name: 'Oxygen', value: avgOxygen, fill: '#ff7300' },
        { name: 'Rainfall', value: avgRainfall, fill: '#ff0000' },
      ]);
    } else {
      setChartData([]);
    }
  }, [filteredData]);

  // Jalankan filter default (1 hari terakhir) saat komponen pertama kali dimuat
  useEffect(() => {
    handleFilterChange(filter);
  }, []);

  return (
    <section
      style={{
        backgroundColor: '#f8f9fa',
        color: '#212529',
        minHeight: '100vh',
        padding: '20px 0',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <Container>
        <Row className="mb-5">
          <Col>
            <h2 className="text-center" style={{ color: '#007bff' }}>Environment Status</h2>
            <p className="text-center">Data collected from the station 1</p>
          </Col>
        </Row>
        <Row className="g-4">
          <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <HumidityGauge humidity={filteredData.length > 0 ? filteredData[0].humidity : 0} />
              <h5>Humidity</h5>
              <p>{filteredData.length > 0 ? `${filteredData[0].humidity}%` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10</Col>px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <TemperatureGauge temperature={filteredData.length > 0 ? filteredData[0].temperature : 0} />
              <h5>Temperature</h5>
              <p>{filteredData.length > 0 ? `${filteredData[0].temperature}°C` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <AirPressureGauge airPressure={filteredData.length > 0 ? filteredData[0].airPressure : 0} />
              <h5>Air Pressure</h5>
              <p>{filteredData.length > 0 ? `${filteredData[0].airPressure} hPa` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <FaSun size={40} color="#007bff" />
              <h5>Irradiation</h5>
              <p>{filteredData.length > 0 ? `${filteredData[0].irradiation} W/m²` : 'N/A'}</p>
            </div>
          </Col>
          <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <FaTint size={40} color="#007bff" />
              <h5>Oxygen</h5>
              <p>{filteredData.length > 0 ? `${filteredData[0].oxygen}%` : 'N/A'}</p>
            </div>
            </Col>
            <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <FaTint size={40} color="#007bff" />
              <h5>Rainfall</h5>
              <p>{filteredData.length > 0 ? `${filteredData[0].rainfall} mm` : 'N/A'}</p>
            </div>
          </Col>
            <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <FaTint size={40} color="#007bff" />
              <h5>Windspeed</h5>
              <p>{filteredData.length > 0 ? `${filteredData[0].windspeed} km/h` : 'N/A'}</p>
            </div>
            </Col>
            <Col md={3} className="text-center">
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <FaTint size={40} color="#007bff" />
              <h5>Wind Direction</h5>
              <p>{filteredData.length > 0 ? filteredData[0].windDirection : 'N/A'}</p>
            </div>
            </Col>
        </Row>

        <Row className="mt-5">
          <Col>
            <h2 className="text-center" style={{ color: '#007bff' }}>Chart Status</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <ButtonGroup className="mb-3 d-flex justify-content-center">
              <Button
                variant={filter === '1d' ? 'primary' : 'outline-primary'}
                onClick={() => handleFilterChange('1d')}
              >
                1 Day
              </Button>
              <Button
                variant={filter === '7d' ? 'primary' : 'outline-primary'}
                onClick={() => handleFilterChange('7d')}
              >
                7 Days
              </Button>
              <Button
                variant={filter === '1m' ? 'primary' : 'outline-primary'}
                onClick={() => handleFilterChange('1m')}
              >
                1 Month
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
        <Row>

            <Col md={6}>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              {chartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="20%"
                      outerRadius="90%"
                      barSize={10}
                      data={chartData}
                    >
                      <RadialBar minAngle={15} background clockWise dataKey="value" />
                      <Legend
                        iconSize={10}
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ color: '#212529' }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  {/* Tampilkan nilai-nilai dari chartData */}
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    {chartData.map((item, index) => (
                      <p key={index} style={{ margin: '5px 0', color: '#007bff', fontWeight: 'bold' }}>
                        {item.name}: {item.value.toFixed(1)}
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center" style={{ color: '#007bff' }}>Alat sedang rusak</p>
              )}
            </div>
          </Col>

          {/* ini buat maps */}
          <Col md={6}>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' }}>
              <h4 style={{ color: '#007bff' }}>Location</h4>
              <iframe src="https://www.google.com/maps/embed?pb=!4v1742927582633!6m8!1m7!1semWwMLjxPNBvkFSf0-d_fQ!2m2!1d-5.570831564383814!2d105.240617222604!3f101.32!4f28.680000000000007!5f0.42518105702959824" style={{ width: '100%', height: '300px', border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </Col>
          {/* ini buat maps */}
        </Row>

        <Row className="mt-5">
          <Col>
            <h2 className="text-center" style={{ color: '#007bff' }}>Table Status</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)', overflowX: 'auto' }}>
              {filteredData.length > 0 ? (
                <Table striped bordered hover variant="light" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Humidity</th>
                      <th>Temperature</th>
                      <th>Air Pressure</th>
                      <th>Irradiation</th>
                      <th>Oxygen</th>
                      <th>Rainfall</th>
                      <th>Windspeed</th>
                      <th>Wind Direction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.timestamp}</td>
                        <td>{item.humidity}%</td>
                        <td>{item.temperature}°C</td>
                        <td>{item.airPressure} hPa</td>
                        <td>{item.irradiation} W/m²</td>
                        <td>{item.oxygen}%</td>
                        <td>{item.rainfall} mm</td>
                        <td>{item.windspeed} km/h</td>
                        <td>{item.windDirection}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center" style={{ color: '#007bff' }}>No data available for the selected filter</p>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Station1;