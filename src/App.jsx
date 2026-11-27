import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import api from "./services/api";
import { LoginPage } from "./pages/LoginPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { ReservationsPage } from "./pages/ReservationsPage";
import { AppShell } from "./components/AppShell";
import TerenForm from "./components/TerenForm";

function AppContent() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const extractUser = (data) => {
    if (Array.isArray(data)) return data[0] || null;
    if (data?.user) return data.user;
    return data;
  };

  const saveUserSession = (rawUser) => {
    const normalizedUser = {
      ...rawUser,
      id: rawUser.UtilizatorID,
      name: rawUser.Nume,
      email: rawUser.Email,
      role: rawUser.TipUser,
    };
    localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setCurrentUser(normalizedUser);
  };

  const handleSignIn = async (email) => {
    const res = await api.post("/utilizatori/login", { Email: email });
    const user = extractUser(res.data);

    if (!user || !user.UtilizatorID) {
      throw new Error("Răspuns invalid de la server la autentificare.");
    }

    saveUserSession(user);
    navigate("/");
  };

  const handleSignUp = async (payload) => {
    const res = await api.post("/utilizatori/register", payload);
    const user = extractUser(res.data);

    if (!user || !user.UtilizatorID) {
      throw new Error("Răspuns invalid de la server la înregistrare.");
    }

    saveUserSession(user);
    navigate("/");
  };

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <FacilitiesPage
            currentUser={currentUser}
            onSignOut={handleSignOut}
          />
        }
      />

      <Route
        path="/login"
        element={
          <LoginPage onSignIn={handleSignIn} onSignUp={handleSignUp} />
        }
      />

      <Route
        path="/rezerva/:id"
        element={
          currentUser ? (
            <BookingPage
              currentUser={currentUser}
              onSignOut={handleSignOut}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/confirmare"
        element={
          currentUser ? (
            <ConfirmationPage
              currentUser={currentUser}
              onSignOut={handleSignOut}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/rezervari"
        element={
          currentUser ? (
            <ReservationsPage
              currentUser={currentUser}
              onSignOut={handleSignOut}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/notificari"
        element={
          currentUser ? (
            <NotificationsPage
              currentUser={currentUser}
              onSignOut={handleSignOut}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/adauga-teren"
        element={
          currentUser?.TipUser === "Admin" ? (
            <AppShell currentUser={currentUser} onSignOut={handleSignOut}>
              <TerenForm />
            </AppShell>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}