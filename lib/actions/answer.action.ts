'use server';

import { siteConfig } from '@/config/site';
import Answer, { IAnswerDoc } from '@/database/answer.model';
import Question from '@/database/question.model';
import { revalidatePath } from 'next/cache';

import { CreateAnswerParams } from '@/types/action';
import { ActionResponse, ErrorResponse } from '@/types/global';
import mongoose from 'mongoose';
import action from '../handlers/action';
import handleError from '../handlers/error';
import { NotFoundError, RequestError } from '../http-errors';
import { AnswerServerSchema } from '../validation';

export async function createAnswer(
  params: CreateAnswerParams,
): Promise<ActionResponse<IAnswerDoc>> {
  const validationResult = await action({
    params,
    schema: AnswerServerSchema,
    authorize: true,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { content, questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId);
    if (!question) throw new NotFoundError('Question');

    const [newAnswer] = await Answer.create(
      [
        {
          author: userId,
          question: questionId,
          content,
        },
      ],
      { session },
    );

    if (!newAnswer) throw new RequestError(500, 'Failed to create answer');

    question.answer += 1;
    await question.save({ session });
    revalidatePath(siteConfig.ROUTES.QUESTION(questionId));

    return { success: true, data: JSON.parse(JSON.stringify(newAnswer)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
