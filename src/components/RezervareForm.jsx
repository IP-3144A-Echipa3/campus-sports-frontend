import { useEffect, useState } from 'react';
import api from '../services/api';

function RezervareForm({ onRezervareCreated }) {
  const [utilizatori, setUtilizatori] = useState([]);
  const [terenuri, setTerenuri] = useState([]);
  const [formData, setFormData] = useState({
    UtilizatorID: '',
    TerenID: '',
    OraStart: '',
    OraFinal: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [usersRes, terenuriRes] = await Promise.all([
          api.get('/utilizatori'),
          api.get('/terenuri'),
        ]);
        setUtilizatori(usersRes.data);
        setTerenuri(terenuriRes.data.filter((t) => t.Disponibil));
      } catch (err) {
        console.error(err);
        setErrorMessage('Nu s-au putut încărca utilizatorii sau terenurile.');
      }
    };

    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await api.post('/rezervari', {
        UtilizatorID: Number(formData.UtilizatorID),
        TerenID: Number(formData.TerenID),
        OraStart: formData.OraStart,
        OraFinal: formData.OraFinal,
      });

      setSuccessMessage('Rezervarea a fost confirmată!');
      setFormData({
        UtilizatorID: '',
        TerenID: '',
        OraStart: '',
        OraFinal: '',
      });

      if (onRezervareCreated) onRezervareCreated();
    } catch (error) {
      console.error(error);
      const serverError = error.response?.data?.error;
      setErrorMessage(serverError || 'A apărut o eroare la crearea rezervării.');
    }
  };

  return (
    <div style={{ maxWidth: '450px', marginBottom: '30px' }}>
      <h2>Rezervă un Teren</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Utilizator</label><br />
          <select
            name="UtilizatorID"
            value={formData.UtilizatorID}
            onChange={handleChange}
            required
          >
            <option value="">-- Selectează utilizator --</option>
            {utilizatori.map((u) => (
              <option key={u.UtilizatorID} value={u.UtilizatorID}>
                {u.Nume} ({u.Email})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Teren Sportiv</label><br />
          <select
            name="TerenID"
            value={formData.TerenID}
            onChange={handleChange}
            required
          >
            <option value="">-- Selectează teren --</option>
            {terenuri.map((t) => (
              <option key={t.TerenID} value={t.TerenID}>
                {t.Denumire} - {t.Sport} ({t.TarifOrar} RON/h)
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Data și Ora Start</label><br />
          <input
            type="datetime-local"
            name="OraStart"
            value={formData.OraStart}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Data și Ora Final</label><br />
          <input
            type="datetime-local"
            name="OraFinal"
            value={formData.OraFinal}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Confirmă Rezervarea</button>
      </form>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}

export default RezervareForm;