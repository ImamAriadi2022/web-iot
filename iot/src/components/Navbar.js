import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CustomNavbar = () => {
  return (
    <Navbar bg="light" expand="lg" fixed="top">
      <Container>
        {/* Logo dan Nama Produk */}
        <Navbar.Brand as={Link} to="/">
          <img
            src="./img/logo.png" // Ganti dengan path logo Anda
            alt="Logo"
            width="200"
            height="40"
            className="d-inline-block align-top"
          />{' '}
        </Navbar.Brand>

        {/* Tombol Toggle untuk Navbar di layar kecil */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Link di sebelah kiri */}
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/features">Fitur</Nav.Link>
            <Nav.Link as={Link} to="/faq">FAQ</Nav.Link>
            <Nav.Link as={Link} to="/help">Bantuan</Nav.Link>
          </Nav>

          {/* Tombol Sign In dan Sign Up di sebelah kanan */}
          <Nav>
            <Button variant="outline-primary" as={Link} to="/signin" className="me-2">
              Sign In
            </Button>
            <Button variant="primary" as={Link} to="/signup">
              Sign Up
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;