const carapi = require("../services/carapiService");
const { getCarImage } = require("../services/unsplashService");
const { estimatePrice } = require("../services/priceService");

exports.search = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ error: "q is required" });

    const models = await carapi.searchModelsByText(q);

    // Берём trims первых моделей
    const cards = [];
    for (const m of models) {
      const trims = await carapi.getTrimsByModelId(m.id);

      for (const t of trims.slice(0, 3)) {
        const title = `${t.year} ${t.make} ${t.model} ${t.trim || ""}`.trim();
        const imageUrl = await getCarImage(`${t.make} ${t.model}`);

        cards.push({
          trimId: t.id,
          title,
          year: t.year,
          imageUrl,
          estimatedPrice: estimatePrice({ msrp: t.msrp, year: t.year })
        });

        if (cards.length >= 12) break;
      }
      if (cards.length >= 12) break;
    }

    res.json(cards);
  } catch (e) { next(e); }
};

exports.details = async (req, res, next) => {
  try {
    const trimId = Number(req.params.trimId);
    if (!trimId) return res.status(400).json({ error: "trimId invalid" });

    const details = await carapi.getTrimDetails(trimId);
    res.json(details);
  } catch (e) { next(e); }
};
