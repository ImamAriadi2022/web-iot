import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero-section bg-light py-5">
      <Container>
        <Row className="align-items-center">
          {/* Grid Kiri */}
          <Col md={6}>
            <h4>Hello, Welcome to</h4>
            <h1 className="display-4">Microclimate Dashboard Monitoring System</h1>
            <p className="mt-3">
              Discover the power of real-time climate monitoring and analysis. Our intuitive platform brings together essential environmental data—temperature, humidity, rainfall, wind speed, and more—into one comprehensive system. Whether you're a researcher, policymaker, or environmental enthusiast, this dashboard empowers you to make informed decisions, track trends, and respond swiftly to climate changes. Together, let's embrace innovation for a sustainable future.
            </p>
            <Button variant="primary" as={Link} to="/dashboard">
              Get Started
            </Button>
          </Col>

          {/* Grid Kanan */}
          <Col md={6}>
            {/* Tambahkan gambar atau ilustrasi di sini */}
            <img
              src="/path/to/illustration.png" // Ganti dengan path gambar ilustrasi Anda
              alt="Illustration"
              className="img-fluid"
            />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;