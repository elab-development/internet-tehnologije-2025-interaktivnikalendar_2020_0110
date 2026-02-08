 
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Pocetna from "./stranice/Pocetna/Pocetna"; 
 import './App.css';
import Login from "./stranice/Auth/Login";
import Register from "./stranice/Auth/Register";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Pocetna />} />
         <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
      </Routes>
    </BrowserRouter>
  );
}
export default App;
