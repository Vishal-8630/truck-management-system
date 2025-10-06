import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => req.body.username || req.ip,
    message: { message: "Too many login attempts, please try again later" }
});

export default rateLimiter;