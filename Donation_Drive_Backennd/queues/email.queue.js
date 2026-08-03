import { Queue } from "bullmq";
import redisConnection from "../config/redis.config.js";

export const emailQueue = new Queue(

    "email-service",

    {

        connection: redisConnection,

        defaultJobOptions: {

            attempts: 5,

            backoff: {

                type: "exponential",

                delay: 5000

            }

        }

    }

);