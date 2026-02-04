import Button from "../components/Button";

function AddEvent() {
  return (
    <div>
      <h2>Dodaj događaj</h2>
        <p>Forma za dodavanje novih događaja u kalendar.</p>
      <Button text="Sačuvaj" onClick={() => alert("Sačuvano")} />
      <Button text="Otkaži" onClick={() => alert("Otkazano")} />
    </div>
  );
}

export default AddEvent;


