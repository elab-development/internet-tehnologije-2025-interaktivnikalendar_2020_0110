import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import AddEvent from "./pages/AddEvent";
import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <h1>Interaktivni kalendar</h1>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddEvent />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
