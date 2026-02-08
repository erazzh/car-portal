const axios = require("axios");

const BASE = "https://carapi.app/api";

async function searchModelsByText(q) {
  
  // 1) берём models и фильтруем через "json" по name/make если возможно
  // 2) если вдруг API ограничит — будем просто брать первые N и фильтровать на сервере
  const url = `${BASE}/models?limit=100`;
  const { data } = await axios.get(url, { headers: { accept: "application/json" } });
  const items = data.data || [];
  const lower = q.toLowerCase();

  return items.filter(m =>
    `${m.make} ${m.name}`.toLowerCase().includes(lower)
  ).slice(0, 10);
}

async function getTrimsByModelId(modelId) {
  const url = `${BASE}/trims?model_id=${modelId}&limit=20`;
  const { data } = await axios.get(url, { headers: { accept: "application/json" } });
  return data.data || [];
}

async function getTrimDetails(trimId) {
  const url = `${BASE}/trims/${trimId}`;
  const { data } = await axios.get(url, { headers: { accept: "application/json" } });
  return data;
}

module.exports = { searchModelsByText, getTrimsByModelId, getTrimDetails };
