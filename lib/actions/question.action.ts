'use server';

import Question, { IQuestionDoc } from '@/database/question.model';
import Tag, { ITagDoc } from '@/database/tag.model';
import TagQuestion from '@/database/tag.question.model';

import {
  CreateQuestionParams,
  EditQuestionParams,
  GetQuestionParams,
} from '@/types/action';
import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
  QuestionParams,
} from '@/types/global';
import mongoose, { QueryFilter } from 'mongoose';
import action from '../handlers/action';
import handleError from '../handlers/error';
import { NotFoundError, RequestError, UnauthorizedError } from '../http-errors';
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  PaginatedSearchParamsSchema,
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
): Promise<ActionResponse<IQuestionDoc>> {
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

export async function getQuestions(
  params: PaginatedSearchParams,
): Promise<ActionResponse<{ questions: QuestionParams[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, filter, query } = validationResult.params!;
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  const filterQuery: QueryFilter<IQuestionDoc> = {};

  if (filter === 'recommended')
    return { success: true, data: { questions: [], isNext: false } };

  if (query) {
    filterQuery.$or = [
      { title: { $regex: new RegExp(query, 'i') } },
      { content: { $regex: new RegExp(query, 'i') } },
    ];
  }

  let sortCriteria = {};
  switch (filter) {
    case 'newest':
      sortCriteria = { createdAt: -1 };
      break;
    case 'unanswered':
      filterQuery.answers = 0;
      sortCriteria = { createdAt: -1 };
      break;
    case 'popular':
      sortCriteria = { upvotes: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const questions = await Question.find(filterQuery)
      .populate('tags', 'name')
      .populate('author', 'name image')
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();

    // Determine if there is a next page
    const totalQuestions = await Question.countDocuments(filterQuery);
    const isNext = totalQuestions > skip + questions.length;

    // Return success response with questions and isNext flag
    return {
      success: true,
      data: { questions: JSON.parse(JSON.stringify(questions)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
