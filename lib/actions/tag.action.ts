'use server';

import Question from '@/database/question.model';
import Tag, { ITagDoc } from '@/database/tag.model';
import {
  ActionResponse,
  ErrorResponse,
  GetTagQuestionsParams,
  PaginatedSearchParams,
  QuestionParams,
  TagParams,
} from '@/types/global';
import { QueryFilter } from 'mongoose';
import action from '../handlers/action';
import handleError from '../handlers/error';
import { NotFoundError } from '../http-errors';
import {
  GetTagQuestionsSchema,
  PaginatedSearchParamsSchema,
} from '../validation';

export async function getTags(
  params: PaginatedSearchParams,
): Promise<ActionResponse<{ tags: TagParams[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: false,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, filter, query } = validationResult.params!;
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  const filterQuery: QueryFilter<ITagDoc> = {};
  if (query) {
    filterQuery.$or = [{ name: { $regex: query, $options: 'i' } }];
  }

  let sortCriteria = {};

  switch (filter) {
    case 'popular':
      sortCriteria = { questions: -1 };
      break;
    case 'recent':
      sortCriteria = { createdAt: -1 };
      break;
    case 'oldest':
      sortCriteria = { createdAt: 1 };
      break;
    case 'name':
      sortCriteria = { name: 1 };
      break;
    default:
      sortCriteria = { questions: -1 };
      break;
  }

  try {
    const tags = await Tag.find(filterQuery)
      .sort(sortCriteria)
      .limit(limit)
      .skip(skip);
    const totalTags = await Tag.countDocuments(filterQuery);
    const isNext = totalTags > skip + tags.length;

    return {
      success: true,
      data: { tags: JSON.parse(JSON.stringify(tags)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getTagQuestions(params: GetTagQuestionsParams): Promise<
  ActionResponse<{
    tag: TagParams;
    questions: QuestionParams[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetTagQuestionsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, tagId } = validationResult.params!;
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  try {
    const tag = await Tag.findById(tagId);
    if (!tag) throw new NotFoundError('Tag');

    const filterQuery: QueryFilter<typeof Question> = {
      tags: { $in: [tagId] },
    };
    if (query) {
      filterQuery.title = { $regex: query, $options: 'i' };
    }

    const questions = await Question.find(filterQuery)
      .select('_id title author createdAt upvotes downvotes answers views')
      .populate([
        { path: 'author', select: 'name image' },
        { path: 'tags', select: 'name' },
      ])
      .skip(skip)
      .limit(limit);

    const totalQuestions = await Question.countDocuments(filterQuery);

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: {
        tag: JSON.parse(JSON.stringify(tag)),
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
