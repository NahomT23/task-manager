import { Request, Response } from 'express';
import crypto from 'crypto';
import Organization from '../models/Organization';
import User from '../models/User';


export const generateInvitationCode = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Only admins can generate invitation codes' });
      return;
    }

    const organizationId = req.user.organization;
    if (!organizationId) {
      res.status(400).json({ message: 'User is not associated with any organization' });
      return;
    }


    const generateCode = () => {
      const hexChars = '0123456789abcdef';

      let code = '';
      for (let i = 0; i < 10; i++) {
        code += hexChars.charAt(crypto.randomInt(hexChars.length));
      }

      return code;
    };

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); 


    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      { $push: { invitations: { token: code, expiresAt } } },
      { new: true }
    );

    if (!organization) {
      res.status(404).json({ message: 'Organization not found' });
      return;
    }

    res.status(200).json({ invitationToken: code, expiresAt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const createOrganization = async (req: Request, res: Response): Promise<void> => {
  try {

    if (!req.user || req.user.role !== 'idle') {
      res.status(403).json({ message: 'Unauthorized to create organization' });
      return;
    }

    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Organization name required' });
      return;
    }

    // Check if user is already an admin elsewhere
    const existingOrg = await Organization.findOne({ admin: req.user.id });
    if (existingOrg) {
      res.status(400).json({ message: 'User is already an admin' });
      return;
    }

    // Create organization
    const organization = new Organization({
      name,
      admin: req.user.id,
      members: [req.user.id],
      invitations: [],
    });

    await organization.save();

    // Update user role and organization
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { role: 'admin', organization: organization._id },
      { new: true }
    );

    res.status(201).json({
      message: 'Organization created',
      organization,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const joinOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'idle') {
      res.status(403).json({ message: 'Unauthorized to join organization' });
      return;
    }

    const { invitationToken } = req.body;
    if (!invitationToken) {
      res.status(400).json({ message: 'Invitation token required' });
      return;
    }


    const organization = await Organization.findOne({
      "invitations.token": invitationToken,
    });
    if (!organization) {
      res.status(400).json({ message: 'Invalid token' });
      return;
    }

    const invitation = organization.invitations.find(
      (inv) => inv.token === invitationToken && !inv.used && inv.expiresAt > new Date()
    );
    if (!invitation) {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }

    // Check if user is already a member
    if (organization.members.includes(req.user.id)) {
      res.status(400).json({ message: 'User already in organization' });
      return;
    }

    // Update invitation and add user
    invitation.used = true;
    organization.members.push(req.user.id);
    await organization.save();

    // Update user role and organization
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { role: 'member', organization: organization._id },
      { new: true }
    );

    res.status(200).json({
      message: `Joined ${organization.name} successfully`,
      organization,
      user,
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getOrganizationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organization = await Organization.findById(id);
    
    if (!organization) {
      res.status(404).json({ message: 'Organization not found' });
      return;
    }
    
    res.status(200).json(organization);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const updateOrganizationName = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const userId = req.user?._id;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ message: 'Valid organization name required' });
      return;
    }

    const user = await User.findById(userId).populate('organization');
    if (!user?.organization) {
      res.status(400).json({ message: 'User not associated with any organization' });
      return;
    }

    const organization = await Organization.findByIdAndUpdate(
      user.organization._id,
      { name: name.trim() },
      { new: true }
    );

    res.status(200).json({
      message: 'Organization name updated successfully',
      organization
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};