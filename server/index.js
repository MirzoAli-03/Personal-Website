require("dotenv").config();
const app = require("./app");

const port = process.env.PORT || 5173;
app.listen(port, () => {
  console.log(`Site running at http://localhost:${port}`);
  console.log(`Admin panel at http://localhost:${port}/admin`);
});
