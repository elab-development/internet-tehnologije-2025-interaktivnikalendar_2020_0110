import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
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
      const res = await api.post("/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setMessage(err.response?.data?.message || "Greška pri prijavi");
      }
    }
  };

  return (
    <div className="page auth-wrap">
      <div className="auth-card">
        <h2 className="auth-title">Prijava</h2>
        <p className="auth-subtitle">Prijavi se na svoj nalog.</p>

        {message && <div className="alert alert-error">{message}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
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
              placeholder="Unesi lozinku"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="field-error">{errors.password[0]}</p>
            )}
          </div>

          <div className="auth-actions">
            <button className="btn-primary" type="submit">
              Prijavi se
            </button>
            <Link className="btn-outline" to="/register" style={{ textAlign: "center", textDecoration: "none", display: "inline-block" }}>
              Nemam nalog
            </Link>
          </div>
        </form>

        <p className="auth-hint">
          Nemaš nalog?{" "}
          <Link className="auth-link" to="/register">
            Registruj se
          </Link>
        </p>
      </div>
    </div>
  );
}
