'use server';

import User from '@/database/user.model';
import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
  UserParams,
} from '@/types/global';
import { QueryFilter } from 'mongoose';
import action from '../handlers/action';
import handleError from '../handlers/error';
import { PaginatedSearchParamsSchema } from '../validation';

export async function getUsers(
  params: PaginatedSearchParams,
): Promise<ActionResponse<{ users: UserParams[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { page = 1, pageSize = 10, filter, query } = validationResult.params!;
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  const queryFilter: QueryFilter<typeof User> = {};

  if (query) {
    queryFilter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
    ];
  }

  let sortCriteria = {};

  switch (filter) {
    case 'newest':
      sortCriteria = { createdAt: -1 };
      break;
    case 'oldest':
      sortCriteria = { createdAt: 1 };
      break;
    case 'popular':
      sortCriteria = { reputation: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const totalUser = await User.countDocuments(queryFilter);
    const users = await User.find(queryFilter)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalUser > skip + users.length;

    return {
      success: true,
      data: { users: JSON.parse(JSON.stringify(users)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
