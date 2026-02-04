function Input({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div className="mb-3">
      {label && <label className="form-label">{label}</label>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="form-control"
      />
    </div>
  );
}

export default Input;
