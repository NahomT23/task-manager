import { Request, Response } from 'express';
import Message from '../models/Message';
import Organization from '../models/Organization';


export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const orgName = req.query.org as string;
      
      // Use cached organization ID if possible
      const organization = await Organization.findOne({ name: orgName })
      
      if (!organization) {
        res.status(404).json({ message: 'Organization not found' });
        return;
      }
  
      const messages = await Message.find({ organization: organization._id })
        .populate('sender', 'name profileImageUrl')
        .sort({ timestamp: -1 }) 
        .limit(100); 
      res.status(200).json(messages.reverse()); // Reverse for correct order
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Server error' });
    }
};

export const createMessage = async (
  messageText: string,
  senderId: string,
  orgId: string
) => {
  try {

    const message = new Message({
      text: messageText,
      sender: senderId,
      organization: orgId,
    });

    await message.save();

    const populatedMessage = await message.populate({
      path: 'sender',
      select: 'name profileImageUrl name'
    });

    return populatedMessage;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
};

export const saveMessage = async (text: string, userId: string, orgId: string) => {
    try {
        const message = new Message({
            text,
            sender: userId,
            organization: orgId,
        });

        await message.save();


        const populatedMessage = await message.populate({
            path: 'sender',
            select: 'name profileImageUrl name',
        });

        return populatedMessage;
    } catch (error) {
        console.error('Error saving message:', error);
        throw new Error('Error saving message');
    }
};


export const clearMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.user?.organization;
      
      if (!organizationId) {
        res.status(403).json({ message: 'Not authorized to clear messages' });
        return;
      }
  
      await Message.deleteMany({ organization: organizationId });
      res.status(200).json({ message: 'Chat history cleared successfully' });
    } catch (error) {
      console.error('Error clearing messages:', error);
      res.status(500).json({ message: 'Server error' });
    }
};
