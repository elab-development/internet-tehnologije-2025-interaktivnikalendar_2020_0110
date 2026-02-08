import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import FormInput from "../../komponente/FormInput/FormInput";

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
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
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
        <p className="auth-subtitle">Kreiraj nalog</p>

        {message && <div className="alert alert-error">{message}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <FormInput
            label="Ime"
            name="name"
            placeholder="Unesi svoje ime"
            value={form.name}
            onChange={handleChange}
            error={errors.name?.[0]}
            autoComplete="name"
          />

          <FormInput
            label="Email"
            name="email"
            type="email"
            placeholder="Unesi email adresu"
            value={form.email}
            onChange={handleChange}
            error={errors.email?.[0]}
            autoComplete="email"
          />

          <FormInput
            label="Lozinka"
            name="password"
            type="password"
            placeholder="Min 6 karaktera"
            value={form.password}
            onChange={handleChange}
            error={errors.password?.[0]}
            autoComplete="new-password"
          />

          <FormInput
            label="Potvrda lozinke"
            name="password_confirmation"
            type="password"
            placeholder="Ponovi lozinku"
            value={form.password_confirmation}
            onChange={handleChange}
            error={errors.password_confirmation?.[0]}
            autoComplete="new-password"
          />

          {/* uloga je skrivena, uvek zaposleni */}
          <input type="hidden" name="uloga" value="zaposleni" />

          <div className="auth-actions">
            <button className="btn-primary" type="submit">
              Registruj se
            </button>

            <Link className="btn-outline btn-link" to="/login">
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
