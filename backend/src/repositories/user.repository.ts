import { User, IUser } from "../models/user.model.js";
import { Types } from "mongoose";

export const UserRepository = {
  async create(data: Partial<IUser>): Promise<IUser> {
    return User.create(data);
  },
  async findByEmail(email: string, withPassword = false): Promise<IUser | null> {
    const query = User.findOne({ email: email.toLowerCase() });
    if (withPassword) query.select("+passwordHash");
    return query.exec();
  },
  async findById(id: string | Types.ObjectId): Promise<IUser | null> {
    return User.findById(id).exec();
  },
  async markEmailVerified(id: string | Types.ObjectId): Promise<void> {
    await User.updateOne({ _id: id }, { isEmailVerified: true }).exec();
  },
  async updatePassword(id: string | Types.ObjectId, passwordHash: string): Promise<void> {
    await User.updateOne({ _id: id }, { passwordHash }).exec();
  },
  async updateProfile(id: string | Types.ObjectId, data: { name?: string; avatarUrl?: string }): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true }).exec();
  },
};
