const express = require("express");
const { getImageData } = require("../queries");

const router = express.Router();

// Public: serve image bytes straight from Postgres.
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).send("Bad image id");

    const img = await getImageData(id);
    if (!img) return res.status(404).send("Image not found");

    res.set("Content-Type", img.mime_type);
    // Content is immutable per id — a new upload gets a new id.
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.send(Buffer.from(img.data));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
