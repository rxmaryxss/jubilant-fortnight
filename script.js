const STORAGE_KEY = "pinstock-items-v1";

const form = document.getElementById("pin-form");
const inventoryEl = document.getElementById("inventory");
const emptyStateEl = document.getElementById("empty-state");
const clearAllBtn = document.getElementById("clear-all");

let items = loadItems();

render();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const newItem = {
    id: crypto.randomUUID(),
    title: String(formData.get("title") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    board: String(formData.get("board") || "").trim(),
    stock: Number(formData.get("stock") || 0),
    status: String(formData.get("status") || "Draft"),
    url: String(formData.get("url") || "").trim(),
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = items.findIndex(
    (item) => item.title.toLowerCase() === newItem.title.toLowerCase() && item.board.toLowerCase() === newItem.board.toLowerCase()
  );

  if (existingIndex >= 0) {
    items[existingIndex] = { ...items[existingIndex], ...newItem, id: items[existingIndex].id };
  } else {
    items.unshift(newItem);
  }

  saveItems();
  render();
  form.reset();
});

clearAllBtn.addEventListener("click", () => {
  if (!items.length) return;
  const confirmClear = window.confirm("Clear all pin stock items?");
  if (!confirmClear) return;

  items = [];
  saveItems();
  render();
});

function removeItem(id) {
  items = items.filter((item) => item.id !== id);
  saveItems();
  render();
}

function render() {
  emptyStateEl.style.display = items.length ? "none" : "block";

  inventoryEl.innerHTML = "";

  for (const item of items) {
    const card = document.createElement("article");
    card.className = "pin-card";

    card.innerHTML = `
      <h3>${escapeHtml(item.title)}</h3>
      <span class="status ${escapeHtml(item.status)}">${escapeHtml(item.status)}</span>
      <p class="meta">Board: ${escapeHtml(item.board)}</p>
      <p class="meta">Category: ${escapeHtml(item.category)}</p>
      <p class="meta">Stock left: ${Number(item.stock)}</p>
      <p class="meta">Updated: ${new Date(item.updatedAt).toLocaleString()}</p>
      <div class="pin-actions">
        ${
          item.url
            ? `<a href="${encodeURI(item.url)}" target="_blank" rel="noreferrer">Open Pin ↗</a>`
            : "<span class=\"meta\">No URL linked</span>"
        }
        <button type="button" data-remove="${item.id}">Remove</button>
      </div>
    `;

    card.querySelector("[data-remove]").addEventListener("click", () => removeItem(item.id));

    inventoryEl.appendChild(card);
  }
}

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
