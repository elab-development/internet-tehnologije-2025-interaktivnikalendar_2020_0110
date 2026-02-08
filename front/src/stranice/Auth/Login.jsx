import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import FormInput from "../../komponente/FormInput/FormInput";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "test22@test.com", password: "123456" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    try {
      const res = await api.post("/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

     navigate("/kalendari");
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
          <FormInput
            label="Email"
            name="email"
            type="email"
            placeholder="npr. vanja@gmail.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email?.[0]}
            autoComplete="email"
          />

          <FormInput
            label="Lozinka"
            name="password"
            type="password"
            placeholder="Unesi lozinku"
            value={form.password}
            onChange={handleChange}
            error={errors.password?.[0]}
            autoComplete="current-password"
          />

          <div className="auth-actions">
            <button className="btn-primary" type="submit">
              Prijavi se
            </button>

            <Link className="btn-outline btn-link" to="/register">
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
