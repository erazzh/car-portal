const API = "http://localhost:3000/api";
const token = localStorage.getItem("token");

if (!token) window.location.href = "index.html";

document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("token");
  window.location.href = "index.html";
};

async function apiGet(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request error");
  return data;
}

function renderCards(items) {
  const root = document.getElementById("cards");
  root.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${item.imageUrl}" />
      <h3>${item.title}</h3>
      <p>Year: ${item.year}</p>
      <p>Estimated price: $${item.estimatedPrice}</p>
      <button>Open</button>
    `;
    div.querySelector("button").onclick = async () => {
      const details = await apiGet(`${API}/cars/${item.trimId}`);
      document.getElementById("details").textContent = JSON.stringify(details, null, 2);
    };

    root.appendChild(div);
  });
}
function renderRecommended(items) {
  const root = document.getElementById("recommended");
  root.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${item.imageUrl}" />
      <h3>${item.title}</h3>
      <p>Year: ${item.year}</p>
      <p>Estimated price: $${item.estimatedPrice}</p>
      <button>Open</button>
    `;

    div.querySelector("button").onclick = async () => {
      const details = await apiGet(`${API}/cars/${item.trimId}`);
      document.getElementById("details").textContent =
        JSON.stringify(details, null, 2);
    };

    root.appendChild(div);
  });
}


document.getElementById("searchBtn").onclick = async () => {
  const q = document.getElementById("searchInput").value.trim();
  if (!q) return;

  const items = await apiGet(`${API}/cars/search?q=${encodeURIComponent(q)}`);
  renderCards(items);
};
