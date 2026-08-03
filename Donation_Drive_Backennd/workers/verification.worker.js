import { Worker } from "bullmq";
import redisConnection from "../config/redis.config.js";
import statementProcessorService from "../services/statementProcessor.service.js";

export const verificationWorker = new Worker(
    //worker never stops and never wait for the request it continuously look at the redis if there is any job in the que and process it
    //worker has to be establish connection with the redis as all the jobs are stored in the redis storage
    "donation-verification",
    async (job) => {
        console.log(`Processing Job : ${job.name}`);
        switch (job.name) {
            //this is modular design this worker can later swith to other jobs also but as of now we are handling only the PROCESS_BANK_STATEMENT jobs
            case "PROCESS_BANK_STATEMENT":
                await statementProcessorService.processStatement(
                    job.data.statementId
                );
                break;
            default:
                console.log(`Unknown Job : ${job.name}`);
        }
    },
    {
        connection: redisConnection,
        concurrency: 5  //concurrency 5 means that with in a single worker instance parallely 5 jobs can be processed
        //here, not seperate 5 different workers work simultaneously but Worker instance hai jo asynchronous tareeke se 5 jobs concurrently handle kar sakta hai.
    }

);

verificationWorker.on(

    "completed",

    (job) => {

        console.log(

            `Verification Job ${job.id} Completed`

        );

    }

);

verificationWorker.on(

    "failed",

    (job, error) => {

        console.log(

            `Verification Job ${job?.id} Failed`

        );

        console.error(error.message);

    }

);

verificationWorker.on(

    "error",

    (error) => {

        console.error(

            "Verification Worker Error:",

            error.message

        );

    }

);