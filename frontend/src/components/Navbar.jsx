function Navbar() {
  return (
    <nav style={{ display: "flex", gap: "12px", padding: "12px 0" }}>
      <a href="/">Home</a>
      <a href="/add">Add Event</a>
      <a href="/about">About</a>
    </nav>
  );
}

export default Navbar;
