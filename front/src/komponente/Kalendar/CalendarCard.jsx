export default function CalendarCard({ kalendar, onSelect }) {
  return (
    <button
      type="button"
      className="calendar-item"
      onClick={() => onSelect(kalendar)}
    >
      <div className="calendar-item-title">{kalendar.naziv}</div>
      <div className="calendar-item-sub">ID: {kalendar.id}</div>
    </button>
  );
}
