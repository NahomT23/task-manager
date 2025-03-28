import { configDotenv } from 'dotenv';
import User from '../models/User';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
configDotenv();

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
        return;
    }
};


export const adminOnly = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Make sure that the protect middleware has set req.user
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Not authorized, no user found' });
        return;
    }

    try {
        const user = await User.findById(req.user?.id).select('-password');


        if (!user || user.role !== 'admin') {
            res.status(403).json({ message: 'Admin access required' });
            return;
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

