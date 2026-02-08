export default function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
}) {
  return (
    <div className="form-field">
      {label && <label className="form-label" htmlFor={name}>{label}</label>}

      <input
        id={name}
        className="input"
        type={type}
        name={name}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={onChange}
        autoComplete={autoComplete}
      />

      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
