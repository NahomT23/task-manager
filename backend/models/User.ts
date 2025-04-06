import mongoose from 'mongoose';
import { generateUniquePseudo } from '../services/generate';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['idle', 'admin', 'member'],
      default: 'idle',
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },

    pseudo_name: {
      type: String,
      required: true,
      unique: true,
    },
    pseudo_email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);


UserSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  
  this.pseudo_name = await generateUniquePseudo(User, 'user', 'pseudo_name');
  this.pseudo_email = await generateUniquePseudo(User, 'email', 'pseudo_email');
  next();
});


const User = mongoose.model('User', UserSchema);

export default User;
