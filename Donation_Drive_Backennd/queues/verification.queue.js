import { Queue } from "bullmq";
import redisConnection, { createRedisConnection } from "../config/redis.config.js";

export const verificationQueue = new Queue(
    "donation-verification",
    {
        connection: redisConnection,
        defaultJobOptions: {
            removeOnComplete: 1000,
            removeOnFail: 5000,
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 3000,
            },
        },
    }
);