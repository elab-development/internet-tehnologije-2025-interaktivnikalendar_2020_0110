import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    uloga: "zaposleni", 
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    try {
      const res = await api.post("/register", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setMessage(err.response?.data?.message || "Greška pri registraciji");
      }
    }
  };

  return (
    <div className="page auth-wrap">
      <div className="auth-card">
        <h2 className="auth-title">Registracija</h2>
        <p className="auth-subtitle">Kreiraj nalog  </p>

        {message && <div className="alert alert-error">{message}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Ime</label>
            <input
              className="input"
              type="text"
              name="name"
              placeholder="npr. Vanja"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className="field-error">{errors.name[0]}</p>}
          </div>

          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="npr. vanja@gmail.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <p className="field-error">{errors.email[0]}</p>}
          </div>

          <div className="form-field">
            <label className="form-label">Lozinka</label>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="Min 6 karaktera"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="field-error">{errors.password[0]}</p>
            )}
          </div>

          <div className="form-field">
            <label className="form-label">Potvrda lozinke</label>
            <input
              className="input"
              type="password"
              name="password_confirmation"
              placeholder="Ponovi lozinku"
              value={form.password_confirmation}
              onChange={handleChange}
            />
          </div>

          {/* uloga je skrivena, uvek zaposleni */}
          <input type="hidden" name="uloga" value="zaposleni" />

          <div className="auth-actions">
            <button className="btn-primary" type="submit">
              Registruj se
            </button>
            <Link className="btn-outline" to="/login" style={{ textAlign: "center", textDecoration: "none", display: "inline-block" }}>
              Imam nalog
            </Link>
          </div>
        </form>

        <p className="auth-hint">
          Već imaš nalog?{" "}
          <Link className="auth-link" to="/login">
            Prijavi se
          </Link>
        </p>
      </div>
    </div>
  );
}
