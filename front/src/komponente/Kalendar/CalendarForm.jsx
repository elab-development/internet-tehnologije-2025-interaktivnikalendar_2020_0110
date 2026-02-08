import { useState } from "react"; 
import FormInput from "../FormInput/FormInput";
export default function CalendarForm({ onCreate, loading }) {
  const [naziv, setNaziv] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmed = naziv.trim();
    if (!trimmed) {
      setError("Naziv kalendara je obavezan.");
      return;
    }

    const ok = await onCreate(trimmed);
    if (ok) setNaziv("");
  };

  return (
    <form className="calendar-create" onSubmit={submit}>
      <div className="calendar-create-row">
        <FormInput
          label="Dodaj novi kalendar"
          name="naziv"
          placeholder="npr. Moj posao / Privatno / Tim"
          value={naziv}
          onChange={(e) => setNaziv(e.target.value)}
          error={error}
          autoComplete="off"
        />

        <button className="btn-primary calendar-create-btn" type="submit" disabled={loading}>
          {loading ? "Dodajem..." : "Dodaj"}
        </button>
      </div>
    </form>
  );
}
