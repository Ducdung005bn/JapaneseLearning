import aj from '../config/arcjet.js';

export const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, {requested: 1}); //take 1 token from the bucket

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ message: 'Too many requests - try again later' });
            }
            return res.status(403).json({ message: 'Access denied by Arcjet' });
        }
        next();
    } catch (error) {
        next(error);
    }
};

export default arcjetMiddleware;