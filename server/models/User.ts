import mongoose, { Schema, Document } from 'mongoose';
import { User } from '@shared/schema';

export interface IUser extends Omit<User, '_id'>, Document {
  _id: string;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

export const UserModel = mongoose.model<IUser>('User', userSchema);
