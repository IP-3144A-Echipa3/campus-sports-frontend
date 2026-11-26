import { useState, type FormEvent } from "react";

interface LoginPageProps {
  onSignIn: (email: string) => Promise<void> | void;
  onSignUp: (data: { Nume: string; Email: string; Telefon: string; TipUser: string }) => Promise<void> | void;
}

export function LoginPage({ onSignIn, onSignUp }: LoginPageProps) {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [nume, setNume] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [tipUser, setTipUser] = useState("Student");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isSigningUp) {
        await onSignUp({ Nume: nume, Email: email, Telefon: telefon, TipUser: tipUser });
      } else {
        await onSignIn(email);
      }
    } catch (submissionError: any) {
      setError(
        submissionError?.response?.data?.error ||
          (submissionError instanceof Error
            ? submissionError.message
            : "Nu am putut procesa solicitarea."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="cs-auth-page">
      <section className="cs-auth-card" data-node-id="1:3">
        <div className="cs-login-mark">CS</div>

        <h1 className="cs-login-title">Campus Sports Booking</h1>
        <p className="cs-login-subtitle">
          Rezervă facilitățile sportive ale campusului
        </p>

        <form className="cs-login-form" onSubmit={handleSubmit}>
          {isSigningUp && (
            <>
              <label className="cs-field-label" htmlFor="campus-name">
                Nume complet
              </label>
              <input
                className="cs-input"
                id="campus-name"
                onChange={(e) => setNume(e.target.value)}
                placeholder="Ion Popescu"
                required
                type="text"
                value={nume}
              />
            </>
          )}

          <label className="cs-field-label" htmlFor="campus-email">
            Email instituțional
          </label>
          <input
            autoComplete="email"
            className="cs-input"
            id="campus-email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@univ.ro"
            required
            type="email"
            value={email}
          />

          {isSigningUp && (
            <>
              <label className="cs-field-label" htmlFor="campus-phone">
                Telefon
              </label>
              <input
                className="cs-input"
                id="campus-phone"
                onChange={(e) => setTelefon(e.target.value)}
                placeholder="0740123456"
                type="tel"
                value={telefon}
              />

              <label className="cs-field-label" htmlFor="campus-role">
                Rol
              </label>
              <select
                className="cs-input"
                id="campus-role"
                onChange={(e) => setTipUser(e.target.value)}
                value={tipUser}
              >
                <option value="Student">Student</option>
                <option value="Profesor">Profesor</option>
              </select>
            </>
          )}

          <label className="cs-field-label" htmlFor="campus-password">
            Parolă
          </label>
          <input
            autoComplete={isSigningUp ? "new-password" : "current-password"}
            className="cs-input"
            id="campus-password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            value={password}
          />

          <p aria-live="polite" className="cs-form-error">
            {error}
          </p>

          <button
            className="cs-button cs-button-primary cs-login-submit"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "Se procesează..."
              : isSigningUp
                ? "Creează cont"
                : "Autentificare"}
          </button>
        </form>

        <p className="cs-login-footnote">
          Acces diferențiat: Student · Cadru didactic
        </p>

        <button
          className="cs-text-button cs-account-toggle"
          onClick={() => {
            setIsSigningUp((current) => !current);
            setError("");
          }}
          type="button"
        >
          {isSigningUp ? "Ai deja cont? Autentifică-te" : "Creează un cont"}
        </button>
      </section>
    </main>
  );
}