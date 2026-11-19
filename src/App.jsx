import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TerenuriList from './components/TerenuriList';
import TerenForm from './components/TerenForm';
import RegisterForm from './components/RegisterForm';
function App() {
  return (
    <Router>
      <div className="App">
        <header style={{ padding: '20px', backgroundColor: '#f5f5f5', marginBottom: '20px' }}>
          <h1>Campus Sports Booking</h1>
          <nav style={{ marginTop: '10px' }}>
            <Link to="/" style={{ marginRight: '15px' }}>Facilitati</Link>
            <Link to="/adauga-teren" style={{ marginRight: '15px' }}>Adaugă Teren</Link>
            <Link to="/inregistrare">Înregistrare</Link>
          </nav>
          {/* TODO: Integrate Navbar component here */}
        </header>
        <main style={{ padding: '0 20px' }}>
          <Routes>
            <Route path="/" element={<TerenuriList />} />
            <Route path="/adauga-teren" element={<TerenForm />} />
            <Route path="/inregistrare" element={<RegisterForm />} />
            {/* TODO: Add routes for /login, /rezervari, /admin later */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;