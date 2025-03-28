import mongoose from 'mongoose';

const InvitationSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
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

