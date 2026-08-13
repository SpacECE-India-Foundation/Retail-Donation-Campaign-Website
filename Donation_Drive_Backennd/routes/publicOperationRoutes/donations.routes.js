import express from "express"
import { registerDonation, scanPaymentScreenshot } from "../../controllers/publicDonations/donation.public.controller.js"
import { upload } from "../../utils/upload.utils.js"
import { fetchDonorDetails } from "../../controllers/publicDonations/donation.public.controller.js"
import { editDonationSubmission } from "../../controllers/publicDonations/donation.public.controller.js"
import { generateEightyGCertificate } from "../../controllers/publicDonations/donation.public.controller.js"
const donationPublicRoutes = express.Router()

donationPublicRoutes.post('/scan-payment-screenshot',upload.single("paymentscreenshot"),scanPaymentScreenshot)
donationPublicRoutes.post('/new-donation',upload.single("paymentscreenshot"),registerDonation)
donationPublicRoutes.post('/donation-details',fetchDonorDetails)
donationPublicRoutes.patch('/re-donation/:donationId',upload.single("paymentscreenshotEdited"),editDonationSubmission)
donationPublicRoutes.post('/:donationId/generate-80g-certificate',generateEightyGCertificate)


export default donationPublicRoutes
