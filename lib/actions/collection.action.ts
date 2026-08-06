'use server';

import { siteConfig } from '@/config/site';
import Collection from '@/database/collection.model';
import Question from '@/database/question.model';
import { CollectionBaseParams } from '@/types/action';
import { ActionResponse, ErrorResponse } from '@/types/global';
import { revalidatePath } from 'next/cache';
import action from '../handlers/action';
import handleError from '../handlers/error';
import { NotFoundError } from '../http-errors';
import { CollectionBaseSchema } from '../validation';

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

    if (collection) {
      await Collection.findByIdAndDelete(collection.id);

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
