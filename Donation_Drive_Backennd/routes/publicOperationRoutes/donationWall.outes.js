import express from 'express'
import { fetchDonationsForDonationWall } from '../../controllers/publicDonations/donationWall.publicDonations.controller.js'


const donationWallRoute = express.Router()

donationWallRoute.get('/fetch-donationwall',fetchDonationsForDonationWall)

export default donationWallRoute