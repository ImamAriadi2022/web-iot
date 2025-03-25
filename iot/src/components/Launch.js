import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaArrowRight } from 'react-icons/fa';
import { Slide } from 'react-awesome-reveal';

const Launch = () => {
  return (
    <section className="launch-section py-5">
      <Container>
        <Row className="align-items-center">
          {/* Bagian Kiri */}
          <Col md={6}>
            <Slide direction="left" triggerOnce>
              <h4>Launch Now!</h4>
              <h2 className="fw-bold mt-3">Dashboard Microclimate</h2>
              <p className="mt-3">
                To access the full data of the microclimate device, please access the link below
              </p>
              <Button variant="primary" className="mt-3" href="/dashboard">
                Dashboard <FaArrowRight />
              </Button>
            </Slide>
          </Col>

          {/* Bagian Kanan */}
          <Col md={6}>
            <Slide direction="right" triggerOnce>
              <img
                src="./img/dashboard.png" // Ganti dengan path gambar Anda
                alt="Launch"
                className="img-fluid"
              />
            </Slide>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Launch;