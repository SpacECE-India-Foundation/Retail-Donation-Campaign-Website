import express from "express";
import { subscribeToUpdates } from "../../controllers/publicSubscribers/subscribe.public.controller.js";

const subscriberPublicRoutes = express.Router();

subscriberPublicRoutes.post("/subscribe", subscribeToUpdates);

export default subscriberPublicRoutes;
