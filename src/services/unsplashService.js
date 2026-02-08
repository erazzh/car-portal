const axios = require("axios");

async function getCarImage(query) {
  const url = "https://api.unsplash.com/search/photos";
  const { data } = await axios.get(url, {
    params: { query, per_page: 1, orientation: "landscape" },
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` // так требует Unsplash :contentReference[oaicite:12]{index=12}
    }
  });

  const first = data.results?.[0];
  return first?.urls?.regular || "https://via.placeholder.com/800x450?text=Car";
}

module.exports = { getCarImage };
