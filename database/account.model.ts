import { Document, model, models, Schema, Types } from 'mongoose';

export interface IAccount {
  userId: Types.ObjectId;
  name: string;
  password?: string;
  image?: string;
  provider: string;
  providerAccountId: string;
}

export interface IAccountDoc extends IAccount, Document {}

const AccountSchema = new Schema<IAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    password: { type: String },
    image: { type: String },
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true },
  },
  { timestamps: true },
);

// one account per provider per external account id
AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

const Account = models?.Account || model<IAccount>('Account', AccountSchema);

export default Account;
