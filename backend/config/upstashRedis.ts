import { Redis } from '@upstash/redis';
import { configDotenv } from "dotenv";
configDotenv();

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN
});

export default redis;


async function checkRedisConnection() {
  try {
    const response = await redis.ping();
    console.log('Redis connection status:', response); 
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
}

checkRedisConnection();

export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const response = await redis.ping();
    console.log(`Redis Health Check: ${response}`); 
    return response === "PONG";
  } catch (error) {
    console.error('Error connecting to Upstash Redis:', error);
    return false;
  }
};

// Immediately invoke the health check when the module loads
(async function initialHealthCheck() {
  const healthy = await checkRedisHealth();
  if (healthy) {
    console.log('Upstash Redis is healthy.');
  } else {
    console.error('Upstash Redis is NOT healthy.');
  }
})();

