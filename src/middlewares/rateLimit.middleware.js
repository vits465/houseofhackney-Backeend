import AppError from "../shared/errors/AppError.js";

const requestsStore = new Map();

/**
 * In-memory sliding window rate limiter middleware
 * @param {Object} options - { windowMs: number, max: number, message: string }
 */
export const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 0.1 * 60 * 1000; // Default 1 minute
  const max = options.max || 1000; // Default 1000 requests per window
  const message = options.message || "Too many requests, please try again later.";

  // Periodic store cleanup every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, records] of requestsStore.entries()) {
      const validRecords = records.filter((timestamp) => now - timestamp < windowMs);
      if (validRecords.length === 0) {  
        requestsStore.delete(key);
      } else {
        requestsStore.set(key, validRecords);
      }
    }
  }, 1 * 60 * 10).unref();

  return (req, res, next) => {
    const key = `${req.ip}_${req.originalUrl || req.url}`;
    const now = Date.now();

    const userRecords = requestsStore.get(key) || [];
    const recentRecords = userRecords.filter((timestamp) => now - timestamp < windowMs);

    if (recentRecords.length >= max) {
      const retryAfterSeconds = Math.ceil((recentRecords[0] + windowMs - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      return next(new AppError(message, 429));
    }

    recentRecords.push(now);
    requestsStore.set(key, recentRecords);
    next();
  };
};

export default createRateLimiter;
