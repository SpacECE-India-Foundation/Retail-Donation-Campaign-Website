import express from "express"
import { registerDonation } from "../../controllers/publicDonations/donation.public.controller.js"
import { upload } from "../../utils/upload.utils.js"
const donationPublicRoutes = express.Router()

donationPublicRoutes.post('/new-donation',upload.single("paymentscreenshot"),registerDonation)


export default donationPublicRoutes