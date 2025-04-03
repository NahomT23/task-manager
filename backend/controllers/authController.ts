import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import Organization from '../models/Organization';
import mongoose from 'mongoose';

// Generate JWT Token
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

// SIGN UP 
const signup = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { name, email, password, invitationCode } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const profileImageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : '';

    let organizationId: mongoose.Types.ObjectId | null = null;
    let assignedRole = 'idle'; 

    if (invitationCode) {
      const organization = await Organization.findOne({ "invitations.token": invitationCode });
      if (!organization) {
        res.status(400).json({ message: 'Invalid invitation token' });
        return;
      }

      const invitation = organization.invitations.find(inv => inv.token === invitationCode);
      if (!invitation || invitation.used || invitation.expiresAt < new Date()) {
        res.status(400).json({ message: 'Invalid or expired token' });
        return;
      }

      invitation.used = true;
      await organization.save();

      organizationId = organization._id;
      assignedRole = 'member';
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
      role: assignedRole,
      organization: organizationId,
    });

    await newUser.save();

    if (invitationCode && organizationId) {
      await Organization.findByIdAndUpdate(organizationId, {
        $push: { members: newUser._id },
      });
    }

    const token = generateToken(newUser._id.toString());

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profileImageUrl: newUser.profileImageUrl,
        organization: newUser.organization,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// SIGN IN 
const signin = async (req: Request, res: Response): Promise<void> => {
  const { email, password }: { email: string; password: string } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      message: 'User signed in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        organization: user.organization,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET USER PROFILE 
const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      organization: user.organization,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE USER PROFILE  (only the name, password and profile)
const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const { name, password } = req.body;

  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }


    if (name) {
      user.name = name;
    }


    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      user.profileImageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        organization: user.organization,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { signup, signin, getUserProfile, updateUserProfile };
