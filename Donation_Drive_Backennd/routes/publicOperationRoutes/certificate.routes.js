import express from "express";
import {
  verifyCertificate,
  getCertificateAnalytics,
  verifyMultipleCertificates,
} from "../../controllers/publicCampaigns/certificate.public.controller.js";
import { adminAuth } from "../../middelwares/adminAuth.middelware.js";

const certificatePublicRoutes = express.Router();

/**
 * Public routes - No authentication required
 */

// Verify a single certificate by ID
certificatePublicRoutes.get("/verify/:certificateId", verifyCertificate);

// Batch verify multiple certificates
certificatePublicRoutes.post("/verify-batch", verifyMultipleCertificates);

/**
 * Admin routes - Authentication required
 */

// Get analytics for a certificate (admin only)
certificatePublicRoutes.get(
  "/analytics/:certificateId",
  adminAuth,
  getCertificateAnalytics
);

export default certificatePublicRoutes;
