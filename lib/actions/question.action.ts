'use server';

import Question from '@/database/question.model';
import Tag from '@/database/tag.model';
import TagQuestion from '@/database/tag.question.model';
import { CreateQuestionParams } from '@/types/action';
import { ActionResponse, ErrorResponse, QuestionParams } from '@/types/global';
import mongoose from 'mongoose';
import action from '../handlers/action';
import handleError from '../handlers/error';
import { RequestError } from '../http-errors';
import { AskQuestionSchema } from '../validation';

export async function createQuestion(
  params: CreateQuestionParams,
): Promise<ActionResponse<QuestionParams>> {
  // validate and authorize request
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  // Extract validated params and user ID
  const { title, content, tags } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  // start mongoose session and transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create the question within the transaction
    const [question] = await Question.create(
      [{ title, content, author: userId }],
      { session },
    );

    if (!question) {
      throw new RequestError(500, 'Failed to create question');
    }

    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagQuestionDocuments = [];

    for (const tag of tags) {
      const safeTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const existingTag = await Tag.findOneAndUpdate(
        {
          name: { $regex: new RegExp(`^${safeTag}$`, 'i') },
        },
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
        { upsert: true, new: true, session },
      );

      // Push tag and TagQuestion document to respective arrays
      tagIds.push(existingTag._id);
      tagQuestionDocuments.push({
        tag: existingTag._id,
        question: question._id,
      });
    }

    await TagQuestion.insertMany(tagQuestionDocuments, { session });
    await Question.findByIdAndUpdate(
      question._id,
      { $push: { tags: { $each: tagIds } } },
      { session },
    );

    // commit transactions
    await session.commitTransaction();

    // Return success response and serialize the question object
    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}
