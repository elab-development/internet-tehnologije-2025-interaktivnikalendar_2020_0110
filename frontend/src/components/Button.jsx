function Button({ text, onClick, type = "button", variant = "primary" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn btn-${variant} me-2`}
    >
      {text}
    </button>
  );
}

export default Button;
