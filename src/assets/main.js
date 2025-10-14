// HUD button wiring (example actions; update to your links later)
const map = [
  { id: "btn-1", action: () => console.log("Action 1") },
  { id: "btn-2", action: () => console.log("Action 2") },
  { id: "btn-3", action: () => console.log("Action 3") },
];

map.forEach(({ id, action }) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", action);
});

// no hover popups, no toggle; clean HUD always visible
console.log("HUD ready. Scene background is transparent and demo meshes removed.");
