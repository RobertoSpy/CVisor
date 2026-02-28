const express = require("express");
const router = express.Router();
const studentService = require("../../services/StudentService");
const verifyToken = require("../../middleware/verifyToken");
const { validate, userProfileSchema } = require("../../middleware/validation");

// GET /api/users/me
router.get("/me", verifyToken, async (req, res) => {
  try {
    const result = await studentService.getFullProfile(req.user.id);
    res.json(result);
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ message: "User not found" });
    }
    console.error("[GET /me] Error:", err.message);
    res.status(500).json({ message: "DB error", error: err.message });
  }
});

// PUT /api/users/me
router.put("/me", verifyToken, validate(userProfileSchema), async (req, res) => {
  try {
    const result = await studentService.updateProfile(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    console.error("[PUT /me] Error:", err.message);
    res.status(500).json({ message: "DB error", error: err.message });
  }
});

// GET /api/users/all - List all users (public/protected)
router.get("/all", verifyToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
    const minPoints = Math.max(0, parseInt(req.query.minPoints) || 0);
    const minLevel = Math.max(0, parseInt(req.query.minLevel) || 0);

    const result = await studentService.getAllUsers({ page, limit, minPoints, minLevel });
    res.json(result);
  } catch (err) {
    console.error("[GET /all] Error:", err.message);
    res.status(500).json({ message: "DB error", error: err.message });
  }
});

// GET /api/users/:id - Public/Shared view
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const result = await studentService.getFullProfile(req.params.id);
    res.json(result);
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ message: "User not found" });
    }
    console.error("[GET /:id] Error:", err.message);
    res.status(500).json({ message: "DB error", error: err.message });
  }
});

module.exports = router;
