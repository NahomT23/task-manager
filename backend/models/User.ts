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



const User = mongoose.model('User', UserSchema);

export default User;
