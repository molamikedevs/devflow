import { Document, Schema, Types, model, models } from 'mongoose';

export interface IVote {
  author: Types.ObjectId;
  actionId: Types.ObjectId;
  type: 'question' | 'answer';
  voteType: 'upvote' | 'downvote';
}

export interface IVoteDoc extends IVote, Document {}

const VoteSchema = new Schema<IVote>(
  {
    actionId: { type: Schema.Types.ObjectId, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['question', 'answer'],
      required: true,
    },
    voteType: {
      type: String,
      enum: ['upvote', 'downvote'],
      required: true,
    },
  },
  { timestamps: true },
);

// one vote per user per item — prevents duplicate votes
VoteSchema.index({ author: 1, actionId: 1, type: 1 }, { unique: true });

const Vote = models?.Vote || model<IVote>('Vote', VoteSchema);
export default Vote;
