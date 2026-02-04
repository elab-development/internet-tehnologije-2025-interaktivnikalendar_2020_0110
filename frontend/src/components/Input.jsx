function Input({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      {label && <label style={{ display: "block", marginBottom: "4px" }}>{label}</label>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        style={{ padding: "8px", width: "260px" }}
      />
    </div>
  );
}

export default Input;
