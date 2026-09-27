import rateLimit from "express-rate-limit";

const authRateLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    limit: 5,
    message: {
        success: false,
        message: "Too many requests, please try again later.",
    },
});

export default authRateLimiter;