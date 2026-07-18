'use server';

import { signIn } from '@/auth';
import Account from '@/database/account.model';
import User from '@/database/user.model';
import { AuthCredentials } from '@/types/action';
import { ActionResponse, ErrorResponse } from '@/types/global';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import action from '../handlers/action';
import handleError from '../handlers/error';
import { ConflictError, NotFoundError, RequestError } from '../http-errors';
import { SignInSchema, SignUpSchema } from '../validation';

export async function signUpWithCredentials(
  params: AuthCredentials,
): Promise<ActionResponse> {
  // 1. Validate the input data
  const validationResult = await action({ params, schema: SignUpSchema });
  if (validationResult instanceof Error) {
    return handleError(validationResult, 'server') as ErrorResponse;
  }

  const { name, username, email, password } = validationResult.params!;

  // 2. Start a mongoose session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 3. Check for existing user by email
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    // 4. Check for existing username
    const existingUsername = await User.findOne({ username }).session(session);
    if (existingUsername) {
      throw new ConflictError('Username already exists');
    }

    // 5. Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Create the user and account documents
    const [newUser] = await User.create([{ username, name, email }], {
      session,
    });

    await Account.create(
      [
        {
          userId: newUser._id,
          name,
          provider: 'credentials',
          providerAccountId: email,
          password: hashedPassword,
        },
      ],
      { session },
    );

    // 7. Commit — the transaction's job ends here
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    return handleError(error, 'server') as ErrorResponse;
  } finally {
    await session.endSession();
  }

  // 8. Sign in is a separate concern from the transaction — data is already
  // durable at this point, so a signIn failure shouldn't (and can't) trigger a rollback
  try {
    await signIn('credentials', { email, password, redirect: false });
  } catch (error) {
    return handleError(error, 'server') as ErrorResponse;
  }

  return { success: true, data: null };
}

export async function signInWithCredentials(
  params: Pick<AuthCredentials, 'email' | 'password'>,
): Promise<ActionResponse> {
  // 1. Validate the input data
  const validationFields = await action({ params, schema: SignInSchema });
  if (validationFields instanceof Error) {
    return handleError(validationFields, 'server') as ErrorResponse;
  }

  const { email, password } = validationFields.params!;

  try {
    // 2. check existing user by email
    const existingUser = await User.findOne({ email });
    if (!existingUser) throw new NotFoundError('User');

    // 3. check existing account by provider
    const existingAccount = await Account.findOne({
      provider: 'credentials',
      providerAccountId: email,
    });
    if (!existingAccount) throw new NotFoundError('Account');

    // 4. compare the hashed password
    const passwordMatch = await bcrypt.compare(
      password,
      existingAccount.password,
    );
    if (!passwordMatch) throw new RequestError(401, 'Password does not match');

    // 5. signin if all checks are successful
    await signIn('credentials', { email, password, redirect: false });
    return { success: true, data: null };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
