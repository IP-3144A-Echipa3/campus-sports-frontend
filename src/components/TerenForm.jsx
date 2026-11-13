import { useState } from 'react';
import api from '../services/api';

const initialState = {
  Denumire: '',
  OraDeschidere: '',
  OraInchidere: '',
  Sport: '',
  TarifOrar: '',
  Disponibil: true,
};

function TerenForm() {
  const [formData, setFormData] = useState(initialState);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await api.post('/terenuri', {
        ...formData,
        TarifOrar: Number(formData.TarifOrar),
      });
      setSuccessMessage('Terenul a fost adăugat cu succes!');
      setFormData(initialState);
    } catch (error) {
      console.error(error);
      setErrorMessage('A apărut o eroare la adăugarea terenului.');
    }
  };

  return (
    <div style={{ maxWidth: '400px' }}>
      <h2>Adaugă teren nou</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Denumire</label><br />
          <input
            type="text"
            name="Denumire"
            value={formData.Denumire}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Ora deschidere</label><br />
          <input
            type="time"
            name="OraDeschidere"
            value={formData.OraDeschidere}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Ora închidere</label><br />
          <input
            type="time"
            name="OraInchidere"
            value={formData.OraInchidere}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Sport</label><br />
          <input
            type="text"
            name="Sport"
            value={formData.Sport}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Tarif orar</label><br />
          <input
            type="number"
            name="TarifOrar"
            value={formData.TarifOrar}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            <input
              type="checkbox"
              name="Disponibil"
              checked={formData.Disponibil}
              onChange={handleChange}
            />
            {' '}Disponibil
          </label>
        </div>

        <button type="submit">Adaugă teren</button>
      </form>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}

export default TerenForm;