import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/dashboard';
import Kalimantan from './pages/kalimantan';
import Petengoran from './pages/petengoran';
import Sebesi from './pages/sebesi';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/kalimantan/*" element={<Kalimantan />} />
        <Route path="/sebesi/*" element={<Sebesi />} />
        <Route path="/petengoran/*" element={<Petengoran />} />
      </Routes>
    </Router>
  );
};

export default App;