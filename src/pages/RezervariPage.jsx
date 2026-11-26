import { useEffect, useState } from 'react';
import api from '../services/api';
import RezervareForm from '../components/RezervareForm';

function RezervariPage() {
  const [rezervari, setRezervari] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRezervari = async () => {
    try {
      const res = await api.get('/rezervari');
      setRezervari(res.data);
    } catch (err) {
      console.error('Eroare la încărcarea rezervărilor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRezervari();
  }, []);

  const handleCancel = async (id) => {
    try {
      await api.put(`/rezervari/${id}/status`, { Status: 'Anulata' });
      fetchRezervari();
    } catch (err) {
      console.error('Eroare la anularea rezervării:', err);
    }
  };

  return (
    <div>
      <RezervareForm onRezervareCreated={fetchRezervari} />

      <hr />

      <h2>Rezervări Existente</h2>
      {loading ? (
        <p>Se încarcă rezervările...</p>
      ) : rezervari.length === 0 ? (
        <p>Nu există rezervări înregistrate.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {rezervari.map((rez) => (
            <li
              key={rez.RezervareID}
              style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px' }}
            >
              <p>
                <strong>Rezervare #{rez.RezervareID}</strong> — Teren ID: {rez.TerenID} | Utilizator ID: {rez.UtilizatorID}
              </p>
              <p>
                <strong>Interval:</strong>{' '}
                {new Date(rez.OraStart).toLocaleString('ro-RO')} –{' '}
                {new Date(rez.OraFinal).toLocaleString('ro-RO')}
              </p>
              <p>
                <strong>Status:</strong> {rez.Status}
              </p>
              {rez.Status !== 'Anulata' && (
                <button onClick={() => handleCancel(rez.RezervareID)}>
                  Anulează Rezervarea
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RezervariPage;