import { Document, model, models, Schema, Types } from 'mongoose';

export interface ITagQuestion {
  name: Types.ObjectId;
  question: Types.ObjectId;
}

export interface ITagQuestionDoc extends ITagQuestion, Document {}

const TagQuestionSchema = new Schema<ITagQuestion>(
  {
    name: { type: Schema.Types.ObjectId, ref: 'Tag', required: true },
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  },
  { timestamps: true },
);

// prevent the same tag being linked to the same question twice
TagQuestionSchema.index({ name: 1, question: 1 }, { unique: true });

const TagQuestion =
  models?.TagQuestion || model<ITagQuestion>('TagQuestion', TagQuestionSchema);
export default TagQuestion;
