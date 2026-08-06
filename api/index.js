// Vercel serverless entry point. Environment variables come from the Vercel
// dashboard in production, so dotenv is only a local convenience.
require("dotenv").config();
module.exports = require("../server/app");
