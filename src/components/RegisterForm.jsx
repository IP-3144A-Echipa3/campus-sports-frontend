import { useState } from 'react';
import api from '../services/api';
const initialState = {
Nume: '',
Email: '',
Telefon: '',
TipUser: 'Client',
};
function RegisterForm() {
const [formData, setFormData] = useState(initialState);
const [successMessage, setSuccessMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');
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
await api.post('/utilizatori/register', formData);
setSuccessMessage('Contul a fost creat cu succes!');
setFormData(initialState);
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
<label>Email</label><br />
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
<label>Tip utilizator</label><br />
<select
name="TipUser"
value={formData.TipUser}
onChange={handleChange}
>
<option value="Client">Client</option>
<option value="Admin">Admin</option>
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