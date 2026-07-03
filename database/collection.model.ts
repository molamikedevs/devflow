import { Document, Schema, Types, model, models } from 'mongoose';

export interface ICollection {
  author: Types.ObjectId;
  question: Types.ObjectId;
}

export interface ICollectionDoc extends ICollection, Document {}

const CollectionSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  },
  { timestamps: true },
);

// a user can save a given question only once
CollectionSchema.index({ author: 1, question: 1 }, { unique: true });

const Collection =
  models?.Collection || model<ICollection>('Collection', CollectionSchema);
export default Collection;
