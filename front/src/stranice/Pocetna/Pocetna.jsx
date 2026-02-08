import React from "react";
import {
  FiCalendar,
  FiBell,
  FiRepeat,
  FiUsers,
  FiLock,
  FiCheckCircle,
} from "react-icons/fi"; 
import { useNavigate } from "react-router-dom";
export default function Pocetna() {
    const navigate = useNavigate();
  return (
    <div className="page">
      {/* HERO */}
      <section className="hero">
        <h1>Interaktivni Kalendar</h1>
        <p>
          Planirajte događaje, upravljajte kalendarima i primajte pametne
          notifikacije — sve na jednom mestu. Jednostavno, brzo i pregledno.
        </p>

        <div className="hero-buttons">
          <button
            className="btn-primary"
            onClick={() => navigate("/login")}
          >
            Započni
          </button>

          <button
            className="btn-outline"
            onClick={() => navigate("/register")}
          >
            Saznaj više
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <Feature
          icon={<FiCalendar size={26} />}
          title="Upravljanje kalendarima"
          text="Kreirajte i organizujte više kalendara za različite potrebe — posao, lično ili tim."
        />

        <Feature
          icon={<FiRepeat size={26} />}
          title="Ponavljajući događaji"
          text="Automatski planirajte dnevne, nedeljne ili mesečne događaje bez ručnog unosa."
        />

        <Feature
          icon={<FiBell size={26} />}
          title="Pametne notifikacije"
          text="Dobijajte podsetnike putem email-a kako nikada ne biste propustili važan događaj."
        />

        <Feature
          icon={<FiUsers size={26} />}
          title="Rad sa timom"
          text="Dodajte učesnike i organizujte sastanke sa više korisnika u jednom kalendaru."
        />

        <Feature
          icon={<FiLock size={26} />}
          title="Sigurna autentifikacija"
          text="Sanctum autentifikacija obezbeđuje bezbedan pristup i zaštitu vaših podataka."
        />

        <Feature
          icon={<FiCheckCircle size={26} />}
          title="Jednostavno korišćenje"
          text="Minimalistički dizajn i intuitivan interfejs omogućavaju brzo i lako upravljanje."
        />
      </section>

      {/* HOW IT WORKS */}
      <section className="steps">
        <h2>Kako funkcioniše</h2>

        <div className="steps-grid">
          <Step
            number="1"
            title="Kreiraj nalog"
            text="Registruj se i prijavi kako bi započeo upravljanje kalendarom."
          />

          <Step
            number="2"
            title="Dodaj događaje"
            text="Planiraj sastanke, obaveze i ponavljajuće događaje."
          />

          <Step
            number="3"
            title="Primaj podsetnike"
            text="Dobij notifikacije i uvek budi organizovan."
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        © {new Date().getFullYear()} Interaktivni Kalendar — MVP verzija
      </footer>
    </div>
  );
}

/* ---------- Feature Card ---------- */
function Feature({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

/* ---------- Step Card ---------- */
function Step({ number, title, text }) {
  return (
    <div className="step-card">
      <div className="step-number">{number}</div>
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}
