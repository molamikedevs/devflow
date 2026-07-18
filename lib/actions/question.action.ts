'use server';

import Question from '@/database/question.model';
import Tag, { ITagDoc } from '@/database/tag.model';
import TagQuestion from '@/database/tag.question.model';
import {
  CreateQuestionParams,
  EditQuestionParams,
  GetQuestionParams,
} from '@/types/action';
import { ActionResponse, ErrorResponse, QuestionParams } from '@/types/global';
import mongoose from 'mongoose';
import action from '../handlers/action';
import handleError from '../handlers/error';
import { NotFoundError, RequestError, UnauthorizedError } from '../http-errors';
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
} from '../validation';

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

export async function editQuestion(
  params: EditQuestionParams,
): Promise<ActionResponse<QuestionParams>> {
  // validate and authorize request
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  // extract validated result
  const { title, content, tags, questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  // start session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId).populate('tags');
    if (!question) throw new NotFoundError('Question');

    if (question.author.toString() !== userId)
      throw new UnauthorizedError('Unauthorized');

    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
      await question.save({ session });
    }

    // Determine tags to add and remove
    const tagsToAdd = tags.filter(
      (tag) =>
        !question.tags.some(
          (t: ITagDoc) => t.name.toLowerCase() === tag.toLowerCase(),
        ),
    );

    const tagsToRemove = question.tags.filter(
      (tag: ITagDoc) =>
        !tags.some((t) => t.toLowerCase() === tag.name.toLowerCase()),
    );

    const newTagDocument = [];
    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        const safeTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existingTag = await Tag.findOneAndUpdate(
          {
            name: { $regex: new RegExp(`^${safeTag}$`, 'i') },
          },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session },
        );

        if (existingTag) {
          newTagDocument.push({
            tag: existingTag._id,
            question: questionId,
          });

          question.tags.push(existingTag._id);
        }
      }
    }

    // Remove tags
    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((tag: ITagDoc) => tag._id);

      await Tag.updateMany(
        { _id: { $in: tagIdsToRemove } },
        { $inc: { questions: -1 } },
        { session },
      );

      await TagQuestion.deleteMany(
        { tag: { $in: tagIdsToRemove }, question: questionId },
        { session },
      );

      question.tags = question.tags.filter(
        (tag: mongoose.Types.ObjectId) =>
          !tagIdsToRemove.some((id: mongoose.Types.ObjectId) =>
            id.equals(tag._id),
          ),
      );
    }

    // Insert new TagQuestion documents
    if (newTagDocument.length > 0) {
      await TagQuestion.insertMany(newTagDocument, { session });
    }

    // Save the updated question
    await question.save({ session });
    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

export async function getQuestion(
  params: GetQuestionParams,
): Promise<ActionResponse<QuestionParams>> {
  // validate and authorize request
  const validationResult = await action({
    params,
    schema: GetQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  // extract validated result
  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findById(questionId).populate('tags');
    if (!question) throw new NotFoundError('Question');
    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
