const express = require("express");
const opportunityService = require("../../services/OpportunityService");

const router = express.Router();

// GET /api/opportunities?q=...
router.get("/", async (req, res) => {
  try {
    const results = await opportunityService.getOpportunities(req.query);
    res.json(results);
  } catch (e) {
    console.error("Get opportunities error:", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// GET /api/opportunities/:id (opțional, pentru pagina de detaliu)
router.get("/:id", async (req, res) => {
  try {
    const result = await opportunityService.getOpportunityDetails(req.params.id);
    res.json(result);
  } catch (e) {
    if (e.message === "Opportunity not found") {
      return res.status(404).json({ message: "Not found" });
    }
    console.error("Get opportunity details error:", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

module.exports = router;
