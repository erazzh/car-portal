const app = require("./src/app");
const connectDB = require("./src/config/db");

(async () => {
  await connectDB(process.env.MONGO_URI);
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on ${port}`));
})();
