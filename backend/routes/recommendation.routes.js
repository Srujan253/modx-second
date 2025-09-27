const express = require("express");
const router = express.Router();
const recController = require("../controller/recommendation.controller");
const protect = require("../middleware/authMiddleware"); // Or your 'protect' middleware

router.get("/recommendations/user", protect, recController.recommendForUser);
router.get(
  "/recommendations/related/:id",
  protect,
  recController.recommendRelated
);
router.get("/search", protect, recController.searchByQuery);

module.exports = router;
