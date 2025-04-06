import crypto from 'crypto';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  };


export const generateSecureHash = (length = 10): string => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

export const generateUniquePseudo = async (
  model: mongoose.Model<any>,
  prefix: string,
  field: string,
  existingId?: mongoose.Types.ObjectId
): Promise<string> => {
  let pseudo: string;
  let exists: boolean;

  do {
    const randomHash = generateSecureHash(10);
    pseudo = `${prefix}_${randomHash}`;

    const query: any = { [field]: pseudo };
    if (existingId) {
      query._id = { $ne: existingId };
    }

    // Use countDocuments to check for existing pseudo
    const count = await model.countDocuments(query);
    exists = count > 0;
  } while (exists);

  return pseudo;
};
