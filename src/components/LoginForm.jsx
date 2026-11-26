import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function LoginForm({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await api.post('/utilizatori/login', { Email: email });
      const user = response.data;

      localStorage.setItem('currentUser', JSON.stringify(user));
      if (onAuthSuccess) onAuthSuccess(user);

      navigate('/');
    } catch (error) {
      console.error(error);
      const serverError = error.response?.data?.error;
      setErrorMessage(serverError || 'Eroare la autentificare.');
    }
  };

  return (
    <div style={{ maxWidth: '400px' }}>
      <h2>Autentificare</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ex: admin@campus.ro"
            required
          />
        </div>

        <button type="submit">Intră în cont</button>
      </form>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}

export default LoginForm;