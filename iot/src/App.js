import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/dashboard';
import Kalimantan from './pages/kalimantan';
import Sebesi from './pages/sebesi';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/kalimantan/*" element={<Kalimantan />} />
        <Route path="/sebesi/*" element={<Sebesi />} />
      </Routes>
    </Router>
  );
};

export default App;