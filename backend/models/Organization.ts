import mongoose from 'mongoose';
import { generateUniquePseudo } from '../services/generate';

const InvitationSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    pseudo_token: { type: String, unique: true }, 
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    acceptedAt: { type: Date } 
  },
  {
    timestamps: true,
  }
);

InvitationSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  this.pseudo_token = await generateUniquePseudo(
    mongoose.model('Organization'),
    'inv',
    'pseudo_token'
  );
  next();
});




const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    pseudo_name: { type: String, required: true, unique: true }, 
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invitations: [InvitationSchema],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);




const Organization = mongoose.model('Organization', OrganizationSchema);

export default Organization;

