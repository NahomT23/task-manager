import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import Message from '../models/Message';
import Organization from '../models/Organization';

const msgRoute = Router();

// Get messages for organization
msgRoute.get('/', protect, async (req, res) => {
    try {
        const orgName = req.query.org as string;
        
        // Find organization by name
        const organization = await Organization.findOne({ name: orgName });
        if (!organization) {
            res.status(404).json({ message: 'Organization not found' });
            return
        }

        // Find messages for this organization
        const messages = await Message.find({ organization: organization._id })
            .populate('sender', 'name profileImageUrl pseudo_name')
            .sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default msgRoute;