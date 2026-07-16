import { auth } from '@/auth';
import { Session } from 'next-auth';
import { ZodError, ZodSchema } from 'zod';
import {
  RequestError,
  UnauthorizedError,
  ValidationError,
} from '../http-errors';
import dbConnect from '../mongoose';

type ActionOptions<T> = {
  params?: T;
  schema?: ZodSchema<T>;
  authorize?: boolean;
};

type ActionResult<T> =
  | ValidationError
  | RequestError
  | UnauthorizedError
  | { params: T | undefined; session: Session | null };

async function action<T>({
  params,
  schema,
  authorize = false,
}: ActionOptions<T>): Promise<ActionResult<T>> {
  if (params && schema) {
    try {
      schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        return new ValidationError(
          error.flatten().fieldErrors as Record<string, string[]>,
        );
      } else {
        return new RequestError(400, 'Schema validation failed');
      }
    }
  }

  let session: Session | null = null;

  if (authorize) {
    session = await auth();

    if (!session) {
      return new UnauthorizedError();
    }
  }

  await dbConnect();

  return { params, session };
}

export default action;
