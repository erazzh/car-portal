const API = "http://localhost:3000/api";
const errorEl = document.getElementById("authError");

function setError(msg) {
  errorEl.textContent = msg || "";
}

async function auth(path) {
  setError("");
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const body = path === "register"
    ? { name: "User", email, password }
    : { email, password };

  const res = await fetch(`${API}/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) return setError(data.error || "Auth error");

  localStorage.setItem("token", data.token);
  window.location.href = "app.html";
}

document.getElementById("loginBtn").onclick = () => auth("login");
document.getElementById("registerBtn").onclick = () => auth("register");
