import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";

function AddEvent() {
 const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  return (
    <div>
     <p>Forma za dodavanje novih događaja u kalendar.</p>

      <h2>Dodaj događaj</h2>

       <Input
        label="Naziv događaja"
        placeholder="npr. Sastanak"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Input
        label="Datum"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <Button text="Sačuvaj" onClick={() => alert("Sačuvano")} />
      <Button text="Otkaži" onClick={() => alert("Otkazano")} />
    </div>
  );
}

export default AddEvent;
