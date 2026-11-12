import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TerenuriList from './components/TerenuriList';

function App() {
  return (
    <Router>
      <div className="App">
        <header style={{ padding: '20px', backgroundColor: '#f5f5f5', marginBottom: '20px' }}>
          <h1>Campus Sports Booking</h1>
          {/* TODO: Integrate Navbar component here */}
        </header>
        
        <main style={{ padding: '0 20px' }}>
          <Routes>
            <Route path="/" element={<TerenuriList />} />
            {/* TODO: Add routes for /login, /rezervari, /admin later */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;