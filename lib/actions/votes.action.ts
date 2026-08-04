'use server';

import Answer from '@/database/answer.model';
import Question from '@/database/question.model';
import Vote from '@/database/vote.model';
import {
  CreateVoteParams,
  HasVotedParams,
  HasVotedResponse,
  UpdateVoteCountParams,
} from '@/types/action';
import { ActionResponse, ErrorResponse } from '@/types/global';
import mongoose, { ClientSession } from 'mongoose';
import { revalidatePath } from 'next/cache';
import action from '../handlers/action';
import handleError from '../handlers/error';
import { NotFoundError, RequestError, UnauthorizedError } from '../http-errors';
import {
  CreateVoteSchema,
  HasVotedSchema,
  UpdateVoteCountSchema,
} from '../validation';

export async function updateVoteCount(
  params: UpdateVoteCountParams,
  session?: ClientSession,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: UpdateVoteCountSchema,
  });

  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { targetId, targetType, voteType, change } = validationResult.params!;
  const Model = targetType === 'question' ? Question : Answer;
  const voteField = voteType === 'upvotes' ? 'upvotes' : 'downvotes';

  try {
    const result = await Model.findByIdAndUpdate(
      targetId,
      { $inc: { [voteField]: change } },
      { new: true, session },
    );
    if (!result) throw new RequestError(500, 'Failed to update vote count');

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createVote(
  params: CreateVoteParams,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });

  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { targetId, targetType, voteType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;
  if (!userId) throw new UnauthorizedError('Votes');

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const Model = targetType === 'question' ? Question : Answer;
    const contentDoc = await Model.findById(targetId).session(session);
    if (!contentDoc) throw new NotFoundError('Content not found');

    const existingVote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    }).session(session);

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.deleteOne({ _id: existingVote._id }).session(session);
        await updateVoteCount(
          {
            targetId,
            targetType,
            voteType,
            change: -1,
          },
          session,
        );
      } else {
        // If user is changing their vote, update voteType and adjust counts
        await Vote.findByIdAndUpdate(
          existingVote._id,
          { voteType },
          { new: true, session },
        );
        await updateVoteCount(
          {
            targetId,
            targetType,
            voteType: existingVote.voteType,
            change: -1,
          },
          session,
        );
        await updateVoteCount(
          {
            targetId,
            targetType,
            voteType,
            change: 1,
          },
          session,
        );
      }
    } else {
      // First-time vote creation
      await Vote.create(
        [
          {
            author: userId,
            actionId: targetId,
            actionType: targetType,
            voteType,
          },
        ],
        { session },
      );
      await updateVoteCount(
        {
          targetId,
          targetType,
          voteType,
          change: 1,
        },
        session,
      );
    }

    await session.commitTransaction();
    session.endSession();

    revalidatePath(`/questions/${targetId}`);

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function hasVoted(
  params: HasVotedParams,
): Promise<ActionResponse<HasVotedResponse>> {
  const validationResult = await action({
    params,
    schema: HasVotedSchema,
    authorize: true,
  });
  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { targetId, targetType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const vote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    });

    if (!vote) {
      return {
        success: false,
        data: { hasdownVoted: false, hasupVoted: false },
      };
    } else {
      return {
        success: true,
        data: {
          hasupVoted: vote.voteType === 'upvotes',
          hasdownVoted: vote.voteType === 'downvotes',
        },
      };
    }
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
