import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests from this IP, please try again later." },});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skip: req => req.path === '/me' && req.method === 'GET',
  message: { error: "Too many login/register attempts, please wait a moment." },
});