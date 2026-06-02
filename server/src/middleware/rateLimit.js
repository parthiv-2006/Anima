import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Upstash is optional: when its env vars are absent (e.g. local dev) the limiters
// are disabled and every request passes through. This keeps `npm run dev` working
// without a Redis instance while preserving real limits in production.
const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasUpstash ? Redis.fromEnv() : null;

// Mirrors the previous express-rate-limit config:
//   general: 100 requests / 15 minutes
//   auth:    10 requests / 1 hour
const generalLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '15 m'), prefix: 'anima:rl:general' })
  : null;

const authLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 h'), prefix: 'anima:rl:auth' })
  : null;

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function makeMiddleware(limiter, message) {
  return async (req, res, next) => {
    if (!limiter) return next(); // disabled when Upstash is not configured
    try {
      const { success, limit, remaining, reset } = await limiter.limit(clientIp(req));
      res.setHeader('RateLimit-Limit', limit);
      res.setHeader('RateLimit-Remaining', Math.max(0, remaining));
      res.setHeader('RateLimit-Reset', Math.ceil(reset / 1000));
      if (!success) {
        return res.status(429).json({ message });
      }
      return next();
    } catch (err) {
      // Fail open: a Redis outage must not take the API down
      console.error('Rate limiter error (failing open):', err?.message || err);
      return next();
    }
  };
}

export const generalRateLimit = makeMiddleware(
  generalLimiter,
  'Too many requests, please try again later.'
);

export const authRateLimit = makeMiddleware(
  authLimiter,
  'Too many login attempts, please try again after an hour'
);
