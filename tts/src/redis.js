const Redis = require("ioredis");
const { logger } = require("./logger/logger");

let redisClient = null;

const createRedisConnection = async () => {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const redisConfig = new URL(redisUrl);
  try {
    redisClient = new Redis({
      host: redisConfig.hostname,
      port: Number(redisConfig.port),
      password: redisConfig.password || undefined,
      maxRetriesPerRequest: 5, // Retry a few times on failure
      enableOfflineQueue: true, // Queue commands during connection issues
    });

    redisClient.on("connect", () => {
      logger.info("Connected to Redis");
    });

    redisClient.on("error", (error) => {
      logger.error(`Redis error: ${error}`);
    });

    redisClient.on("close", () => {
      logger.info("Redis connection closed");
    });
  } catch (error) {
    logger.error(`Failed to connect to Redis: ${error}`);
    throw error;
  }
};

const closeRedisConnection = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info("Redis connection closed successfully");
    } catch (error) {
      logger.error(`Error closing Redis connection: ${error}`);
    }
  }
};

const checkRedisConnection = () => {
  if (!redisClient) {
    logger.error("Redis client not connected");
    throw new Error("Redis client not connected");
  }
};

const setRedisKey = async (redisData) => {
  checkRedisConnection();

  const { key, value, ttl } = redisData;
  try {
    await redisClient.set(key, value);
    if (ttl) {
      await redisClient.expire(key, ttl);
    }
    // logger.info(`Set key "${key}" with value "${value}" in Redis`);
  } catch (error) {
    logger.error(`Error setting key "${key}": ${error}`);
    throw error;
  }
};

const getByKey = async (key) => {
  checkRedisConnection();

  try {
    const value = await redisClient.get(key);
    // if (value) {
    //   logger.info(`Retrieved value for key "${key}": ${value}`);
    // } else {
    //   logger.warn(`Key "${key}" not found in Redis`);
    // }
    return value;
  } catch (error) {
    logger.error(`Error getting key "${key}": ${error}`);
    throw error;
  }
};

const deleteByKey = async (key) => {
  checkRedisConnection();

  try {
    const result = await redisClient.del(key);
    // if (result === 1) {
    //   logger.info(`Deleted key "${key}" from Redis`);
    // } else {
    //   logger.warn(`Key "${key}" not found in Redis`);
    // }
    return result;
  } catch (error) {
    logger.error(`Error deleting key "${key}": ${error}`);
    throw error;
  }
};

const getAllKeys = async (pattern = "*") => {
  checkRedisConnection();

  try {
    const keys = await redisClient.keys(pattern);
    // if (keys.length > 0) {
    //   logger.info(`Retrieved keys matching pattern "${pattern}": ${keys}`);
    // } else {
    //   logger.warn(`No keys found matching pattern "${pattern}"`);
    // }
    return keys;
  } catch (error) {
    logger.error(
      `Error retrieving keys matching pattern "${pattern}": ${error}`
    );
    throw error;
  }
};

const getTotalNoOfKeys = async (pattern = "*") => {
  checkRedisConnection();

  try {
    const keys = await redisClient.keys(pattern);
    const count = keys.length;
    // logger.info(`Total number of keys matching pattern "${pattern}": ${count}`);
    return count;
  } catch (error) {
    logger.error(
      `Error retrieving total number of keys matching pattern "${pattern}": ${error}`
    );
    throw error;
  }
};

module.exports = {
  createRedisConnection,
  closeRedisConnection,
  checkRedisConnection,
  setRedisKey,
  getByKey,
  deleteByKey,
  getAllKeys,
  getTotalNoOfKeys,
};
