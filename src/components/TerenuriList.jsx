import React, { useEffect, useState } from 'react';
import api from '../services/api';

const TerenuriList = () => {
  const [terenuri, setTerenuri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTerenuri = async () => {
      try {
        const response = await api.get('/terenuri');
        setTerenuri(response.data);
      } catch (err) {
        setError('Eroare la încărcarea terenurilor.');
      } finally {
        setLoading(false);
      }
    };

    fetchTerenuri();
  }, []);

  if (loading) return <p>Se încarcă...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="terenuri-container">
      <h2>Terenuri Sportive Disponibile</h2>
      {terenuri.length === 0 ? (
        <p>Nu există terenuri adăugate momentan.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {terenuri.map((teren) => (
            <li key={teren.TerenID} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px' }}>
              <h3>{teren.Denumire}</h3>
              <p><strong>Sport:</strong> {teren.Sport}</p>
              <p><strong>Program:</strong> {teren.OraDeschidere} - {teren.OraInchidere}</p>
              {/* TODO: Add 'Rezervă Acum' button in future commits */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TerenuriList;