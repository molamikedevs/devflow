'use server';

import Tag, { ITagDoc } from '@/database/tag.model';
import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
  TagParams,
} from '@/types/global';
import { QueryFilter } from 'mongoose';
import action from '../handlers/action';
import handleError from '../handlers/error';
import { PaginatedSearchParamsSchema } from '../validation';

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
    const totalTags = await Tag.countDocuments();
    const isNext = totalTags > skip + tags.length;

    return {
      success: true,
      data: { tags: JSON.parse(JSON.stringify(tags)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
