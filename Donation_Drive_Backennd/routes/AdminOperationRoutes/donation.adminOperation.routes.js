import express from "express"
import { adminAuth } from "../../middelwares/adminAuth.middelware.js"
import {  fetchDonations } from "../../controllers/adminOpeartions/donation.adminOperations.controller.js"
import { fetchPendingRejectedDonations } from "../../controllers/adminOpeartions/donation.adminOperations.controller.js"
import { verifyDonation } from "../../controllers/adminOpeartions/donation.adminOperations.controller.js"
import { rejectDonation } from "../../controllers/adminOpeartions/donation.adminOperations.controller.js"

const donationAdminOperationsRoutes = express.Router()

donationAdminOperationsRoutes.get("/fetch-donations", adminAuth, fetchDonations)
// donationAdminOperationsRoutes.patch("/:id/verify", adminAuth, verifyDonation)
donationAdminOperationsRoutes.get('/pending-donation',adminAuth,fetchPendingRejectedDonations)
donationAdminOperationsRoutes.post('/verify-donation/:donationId',adminAuth,verifyDonation)
donationAdminOperationsRoutes.post('/reject-donation/:donationId',adminAuth,rejectDonation)

export default donationAdminOperationsRoutes
