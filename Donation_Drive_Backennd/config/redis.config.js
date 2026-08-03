import Redis from "ioredis";

export const createRedisConnection = () => {
    const connection = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
        maxRetriesPerRequest: null, //whenever the connection fails the redis try multiple times to connect with it but considering the bullMq enviroment it is considered that it should not try much
        enableReadyCheck: true, //enable ready check Redis connect hone ke baad bhi immediately usable nahi hota. thats why enableReady check perform the ping pong to the server and once everything is good we can start operations on redis
    });

    return connection;
};

const redisConnection = createRedisConnection();

redisConnection.on("connect", () => {
    console.log("Redis Connected Successfully");  //it is connecting redis to the socket
});

redisConnection.on("ready", () => {
    console.log("Redis Ready");  //it actually shows that redis is now ready for the operations
});

redisConnection.on("error", (err) => {
    console.error("Redis Error:", err.message);
});

redisConnection.on("close", () => {
    console.log("Redis Connection Closed");
});

export { redisConnection };
export default redisConnection;