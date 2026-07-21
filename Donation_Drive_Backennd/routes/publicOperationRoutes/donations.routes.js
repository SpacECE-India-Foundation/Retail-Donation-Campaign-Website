import express from "express"
import { registerDonation } from "../../controllers/publicDonations/donation.public.controller.js"
import { upload } from "../../utils/upload.utils.js"
import { fetchDonorDetails } from "../../controllers/publicDonations/donation.public.controller.js"
import { editDonationSubmission } from "../../controllers/publicDonations/donation.public.controller.js"
const donationPublicRoutes = express.Router()

donationPublicRoutes.post('/new-donation',upload.single("paymentscreenshot"),registerDonation)
donationPublicRoutes.post('/donation-details',fetchDonorDetails)
donationPublicRoutes.patch('/re-donation/:donationId',upload.single("paymentscreenshotEdited"),editDonationSubmission)


export default donationPublicRoutes