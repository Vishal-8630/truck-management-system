import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => {
    return req.body?.username || ipKeyGenerator(req);
  },
  message: { message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
