const express = require("express");
const verifyToken = require("../../middleware/verifyToken");
const verifyOrg = require("../../middleware/verifyOrg");
const opportunityService = require("../../services/OpportunityService");
const { validate, opportunitySchema } = require("../../middleware/validation");

const router = express.Router();

// Creează oportunitate (POST /api/organizations/opportunities)
router.post("/", verifyToken, verifyOrg, validate(opportunitySchema), async (req, res) => {
  try {
    const result = await opportunityService.createOpportunity(
      req.user.id,
      req.body,
      req.user.full_name
    );
    res.json(result);
  } catch (e) {
    if (e.message.includes("Lipsesc câmpuri") || e.message.includes("Deadline")) {
      return res.status(400).json({ message: e.message });
    }
    console.error("Create opportunity error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});

// Editează oportunitate (PUT /api/organizations/opportunities/:id)
router.put("/:id", verifyToken, verifyOrg, validate(opportunitySchema), async (req, res) => {
  try {
    const result = await opportunityService.updateOpportunity(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (e) {
    if (e.message.includes("Deadline")) {
      return res.status(400).json({ message: e.message });
    }
    if (e.message.includes("Not found") || e.message.includes("unauthorized")) {
      return res.status(404).json({ message: e.message });
    }
    console.error("Update opportunity error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});

// Șterge oportunitate (DELETE /api/organization/opportunities/:id)
router.delete("/:id", verifyToken, verifyOrg, async (req, res) => {
  try {
    const result = await opportunityService.deleteOpportunity(
      req.params.id,
      req.user.id
    );
    res.json(result);
  } catch (e) {
    if (e.message.includes("Not found")) {
      return res.status(404).json({ message: "Not found" });
    }
    console.error("Delete opportunity error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});

// Vezi detalii oportunitate explorată (GET /api/organization/opportunities/explore/:id)
router.get("/explore/:id", verifyToken, verifyOrg, async (req, res) => {
  try {
    const result = await opportunityService.getExploreOpportunity(req.params.id);
    res.json(result);
  } catch (e) {
    if (e.message === "Opportunity not found") {
      return res.status(404).json({ message: "Not found" });
    }
    console.error("Explore opportunity error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});

// Vezi oportunitățile altor organizații (GET /api/organization/opportunities/explore)
router.get("/explore", verifyToken, verifyOrg, async (req, res) => {
  try {
    const result = await opportunityService.getExploreOthers(req.user.id);
    res.json(result);
  } catch (e) {
    console.error("Explore others error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});

// Vezi toate oportunitățile tale (GET /api/organization/opportunities?status=active|archived)
router.get("/", verifyToken, verifyOrg, async (req, res) => {
  try {
    const allowedStatuses = ['active', 'archived'];
    const status = allowedStatuses.includes(req.query.status) ? req.query.status : 'active';
    const result = await opportunityService.getMyOpportunities(req.user.id, status);
    res.json(result);
  } catch (e) {
    console.error("Get my opportunities error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});

// Public: Get opportunities for a specific organization (GET /api/organization/opportunities/public/:userId)
router.get("/public/:userId", async (req, res) => {
  try {
    const result = await opportunityService.getPublicOpportunities(req.params.userId);
    res.json(result);
  } catch (e) {
    console.error("Get public opportunities error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});

router.get("/:id", verifyToken, verifyOrg, async (req, res) => {
  try {
    const result = await opportunityService.getOpportunityForOrg(req.params.id, req.user.id);
    res.json(result);
  } catch (e) {
    if (e.message === "Not found") {
      return res.status(404).json({ message: "Not found" });
    }
    console.error("Get opportunity error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
});

module.exports = router;