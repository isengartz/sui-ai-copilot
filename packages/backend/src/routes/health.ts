import express, { Router } from "express";
import HealthController from "../controllers/healthController";

// Create router
const router: Router = express.Router();

/**
 * @route GET /api/health
 * @description Check API health status
 * @access Public
 */
router.get("/", HealthController.healthCheck);

export default router;
