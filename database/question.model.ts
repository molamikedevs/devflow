import { Document, model, models, Schema, Types } from 'mongoose';

export interface IQuestion {
  title: string;
  content: string;
  answers: number;
  views: number;
  upvote: number;
  downvote: number;
  author: Types.ObjectId;
  tags: Types.ObjectId[];
}

export interface IQuestionDoc extends IQuestion, Document {}

const QuestionSchema = new Schema<IQuestion>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    answers: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    upvote: { type: Number, default: 0 },
    downvote: { type: Number, default: 0 },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

const Question =
  models?.Question || model<IQuestion>('Question', QuestionSchema);

export default Question;
