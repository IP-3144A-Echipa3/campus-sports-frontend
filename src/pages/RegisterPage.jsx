import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export function RegisterPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    Nume: "",
    Email: "",
    Telefon: "",
    TipUser: "Student",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post("/utilizatori/register", {
        Nume: form.Nume.trim(),
        Email: form.Email.trim(),
        Telefon: form.Telefon.trim(),
        TipUser: form.TipUser,
      });
      onLoginSuccess(response.data);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Nu am putut crea contul. Verifică datele introduse."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="cs-auth-page">
      <section className="cs-auth-card">
        <div className="cs-login-mark">CS</div>

        <h1 className="cs-login-title">Creare cont</h1>
        <p className="cs-login-subtitle">
          Înregistrează-te pentru a rezerva bazele sportive
        </p>

        <form className="cs-login-form" onSubmit={handleSubmit}>
          <label className="cs-field-label" htmlFor="reg-nume">
            Nume complet
          </label>
          <input
            className="cs-input"
            id="reg-nume"
            onChange={(e) => setForm({ ...form, Nume: e.target.value })}
            placeholder="Ion Popescu"
            required
            type="text"
            value={form.Nume}
          />

          <label className="cs-field-label" htmlFor="reg-email">
            Email instituțional
          </label>
          <input
            className="cs-input"
            id="reg-email"
            onChange={(e) => setForm({ ...form, Email: e.target.value })}
            placeholder="ion.popescu@student.usv.ro"
            required
            type="email"
            value={form.Email}
          />

          <label className="cs-field-label" htmlFor="reg-telefon">
            Telefon
          </label>
          <input
            className="cs-input"
            id="reg-telefon"
            onChange={(e) => setForm({ ...form, Telefon: e.target.value })}
            placeholder="0740123456"
            required
            type="tel"
            value={form.Telefon}
          />

          <label className="cs-field-label" htmlFor="reg-tip">
            Rol în campus
          </label>
          <select
            className="cs-input"
            id="reg-tip"
            onChange={(e) => setForm({ ...form, TipUser: e.target.value })}
            value={form.TipUser}
          >
            <option value="Student">Student</option>
            <option value="Profesor">Profesor</option>
          </select>

          {error && (
            <p aria-live="polite" className="cs-form-error">
              {error}
            </p>
          )}

          <button
            className="cs-button cs-button-primary cs-login-submit"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Se creează contul..." : "Creează cont"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "14px" }}>
          <Link to="/login" className="cs-text-button" style={{ textDecoration: "none" }}>
            Ai deja cont? Autentifică-te
          </Link>
        </div>
      </section>
    </main>
  );
}