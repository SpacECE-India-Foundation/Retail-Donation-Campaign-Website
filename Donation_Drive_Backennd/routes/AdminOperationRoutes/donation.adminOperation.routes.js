import express from "express"
import { adminAuth } from "../../middelwares/adminAuth.middelware.js"
import { verifyDonation, fetchDonations } from "../../controllers/adminOpeartions/donation.adminOperations.controller.js"

const donationAdminOperationsRoutes = express.Router()

donationAdminOperationsRoutes.get("/", adminAuth, fetchDonations)
donationAdminOperationsRoutes.patch("/:id/verify", adminAuth, verifyDonation)

export default donationAdminOperationsRoutes
