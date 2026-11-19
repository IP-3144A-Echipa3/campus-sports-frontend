import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const initialState = {
  Nume: '',
  Email: '',
  Telefon: '',
  TipUser: 'Student',
};

function RegisterForm({ onAuthSuccess }) {
  const [formData, setFormData] = useState(initialState);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

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
      const response = await api.post('/utilizatori/register', formData);
      const createdUser = response.data;

      // Save user session locally until full JWT login is added
      localStorage.setItem('currentUser', JSON.stringify(createdUser));
      if (onAuthSuccess) onAuthSuccess(createdUser);

      setSuccessMessage('Contul a fost creat cu succes!');
      setFormData(initialState);
      navigate('/');
    } catch (error) {
      console.error(error);
      const serverError = error.response?.data?.error;
      setErrorMessage(serverError || 'A apărut o eroare la înregistrare.');
    }
  };

  return (
    <div style={{ maxWidth: '400px' }}>
      <h2>Înregistrare Utilizator</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Nume complet</label><br />
          <input
            type="text"
            name="Nume"
            value={formData.Nume}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Email instituțional</label><br />
          <input
            type="email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Telefon</label><br />
          <input
            type="tel"
            name="Telefon"
            value={formData.Telefon}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Rol</label><br />
          <select
            name="TipUser"
            value={formData.TipUser}
            onChange={handleChange}
          >
            <option value="Student">Student</option>
            <option value="Profesor">Profesor</option>
          </select>
        </div>

        <button type="submit">Creează cont</button>
      </form>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}

export default RegisterForm;