export default function CalendarCard({ kalendar, onSelect, onDelete }) {
  const handleDeleteClick = (e) => {
    e.stopPropagation();  
    onDelete(kalendar);
  };

  return (
    <button
      type="button"
      className="calendar-item"
      onClick={() => onSelect(kalendar)}
    >
      <div className="calendar-item-main">
        <div className="calendar-item-title">{kalendar.naziv}</div>
        <div className="calendar-item-sub">ID: {kalendar.id}</div>
      </div>

      <button
        type="button"
        className="calendar-delete"
        onClick={handleDeleteClick}
        aria-label={`Obriši kalendar ${kalendar.naziv}`}
        title="Obriši"
      >
        Obriši
      </button>
    </button>
  );
}
