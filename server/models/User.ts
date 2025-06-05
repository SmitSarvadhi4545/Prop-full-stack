// import mongoose, { Schema, Document } from 'mongoose';
// import { User } from '@shared/schema';

// export interface IUser extends Omit<User, '_id'>, Document {
//   _id: string;
// }

// const userSchema = new Schema<IUser>({
//   username: {
//     type: String,
//     required: true,
//     unique: true, // `unique: true` automatically creates an index
//     trim: true,
//     minlength: 3,
//     maxlength: 50
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true, // `unique: true` automatically creates an index
//     trim: true,
//     lowercase: true
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 100
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6
//   }
// }, {
//   timestamps: true,
//   toJSON: {
//     transform: function(doc, ret) {
//       delete ret.password;
//       delete ret.__v;
//       return ret;
//     }
//   }
// });

// // Remove explicit index definitions for fields with `unique: true`
// export const UserModel = mongoose.model<IUser>('User', userSchema);

import mongoose, { Schema, Document } from "mongoose";
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  name: string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model<IUser>("User", UserSchema);
