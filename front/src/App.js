 
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Pocetna from "./stranice/Pocetna/Pocetna"; 
 import './App.css';
import Login from "./stranice/Auth/Login";
import Register from "./stranice/Auth/Register";
import Kalendari from "./stranice/Kalendari/Kalendari";
import KalendarDetalji from "./stranice/Kalendari/KalendarDetalji";
import Navbar from "./komponente/Navigacija/Navbar";
function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={<Pocetna />} />
         <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 


         <Route path="/kalendari" element={<Kalendari />} />
          <Route path="/kalendari/:id" element={<KalendarDetalji />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
