import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later',
  validate: { trustProxy: false } 
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts, please try again later',
  validate: { trustProxy: false }  
});


export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many file uploads, please try again later',
  
});

export const chatbotLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 20, 
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  message: 'Too many chatbot requests, please wait',
  validate: { trustProxy: true },
  standardHeaders: 'draft-7',
  legacyHeaders: false
});