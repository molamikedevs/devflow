'use server';

import { siteConfig } from '@/config/site';
import { Collection, Question } from '@/database';
import { CollectionBaseParams } from '@/types/action';
import {
  ActionResponse,
  CollectionParams,
  ErrorResponse,
  PaginatedSearchParams,
} from '@/types/global';
import mongoose, { PipelineStage } from 'mongoose';
import { revalidatePath } from 'next/cache';
import action from '../handlers/action';
import handleError from '../handlers/error';
import { NotFoundError } from '../http-errors';
import {
  CollectionBaseSchema,
  PaginatedSearchParamsSchema,
} from '../validation';

export async function toggledSavedQuestions(
  params: CollectionBaseParams,
): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const question = await Question.findById(questionId);
    if (!question) throw new NotFoundError('Question');

    const collection = await Collection.findOne({
      question: questionId,
      author: userId,
    });

    // delete and revalidate if question exist
    if (collection) {
      await Collection.findByIdAndDelete(collection._id);
      revalidatePath(siteConfig.ROUTES.QUESTION(questionId));
      return { success: true, data: { saved: false } };
    }

    await Collection.create({
      question: questionId,
      author: userId,
    });

    revalidatePath(siteConfig.ROUTES.QUESTION(questionId));

    return { success: true, data: { saved: true } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function hasSavedQuestion(
  params: CollectionBaseParams,
): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const collection = await Collection.findOne({
      question: questionId,
      author: userId,
    });

    return { success: true, data: { saved: !!collection } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getSavedQuestions(
  params: PaginatedSearchParams,
): Promise<
  ActionResponse<{ collections: CollectionParams[]; isNext: boolean }>
> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });
  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { page = 1, pageSize = 10, query, filter } = params;
  const userId = validationResult.session?.user?.id;
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  const sortOptions: Record<string, Record<string, 1 | -1>> = {
    mostRecent: { 'question.createdAt': -1 },
    oldest: { 'question.createdAt': 1 },
    mostVoted: { 'question.upVotes': -1 },
    mostViewed: { 'question.views': -1 },
    mostAnswered: { 'question.answers': -1 },
  };

  const sortCriteria = sortOptions[filter as keyof typeof sortOptions] || {
    'question.createdAt': -1,
  };

  try {
    const pipeline: PipelineStage[] = [
      // 1. Filter: Get answers by the specific user
      { $match: { author: new mongoose.Types.ObjectId(userId) } },

      // 2. Join: Fetch the related Question details
      {
        $lookup: {
          from: 'questions',
          localField: 'question',
          foreignField: '_id',
          as: 'question',
        },
      },

      // 3. Flatten: Convert the 'question' array into a single object
      { $unwind: '$question' },

      // 4. Nested Join: Get the Author of that Question
      {
        $lookup: {
          from: 'users',
          localField: 'question.author',
          foreignField: '_id',
          as: 'question.author',
        },
      },
      { $unwind: '$question.author' }, // Flatten author array

      // 5. Nested Join: Get Tags associated with the Question
      {
        $lookup: {
          from: 'tags',
          localField: 'question.tags',
          foreignField: '_id',
          as: 'question.tags',
        },
      },
    ];

    if (query) {
      pipeline.push({
        $match: {
          $or: [
            { 'question.title': { $regex: query, $options: 'i' } },
            { 'question.content': { $regex: query, $options: 'i' } },
          ],
        },
      });
    }

    const countResult = await Collection.aggregate([
      ...pipeline,
      { $count: 'count' },
    ]);
    const totalCount = countResult[0]?.count || 0;

    pipeline.push({ $sort: sortCriteria }, { $skip: skip }, { $limit: limit });
    pipeline.push({ $project: { question: 1, author: 1 } });

    const questions = await Collection.aggregate(pipeline);

    const isNext = totalCount.count > skip + questions.length;

    return {
      success: true,
      data: { collections: JSON.parse(JSON.stringify(questions)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
