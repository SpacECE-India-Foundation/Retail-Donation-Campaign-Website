import { Queue } from "bullmq";
import redisConnection from "../config/redis.config.js";

export const certificateQueue = new Queue(
    "certificate-generation",
    {
        connection: redisConnection,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
            removeOnComplete: 100,
            removeOnFail: 500,
        },
    }
);