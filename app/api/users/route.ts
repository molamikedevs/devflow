import User from '@/database/user.model';
import handleError from '@/lib/handlers/error';
import { ConflictError, ValidationError } from '@/lib/http-errors';
import dbConnect from '@/lib/mongoose';
import { UserSchema } from '@/lib/validation';
import { APIErrorResponse } from '@/types/global';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();

    // Fetches all users
    const users = await User.find();

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    // Routes the error through the centralized handler for a consistent API response
    return handleError(error, 'api') as APIErrorResponse;
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const validatedData = UserSchema.safeParse(body);
    if (!validatedData.success) {
      // Converts Zod's field errors into a ValidationError
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }

    const { email, username } = validatedData.data;

    // Checks for an existing user with the same email
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ConflictError('User already exists');

    // Checks for an existing user with the same username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) throw new ConflictError('Username already exists');

    const newUser = await User.create(validatedData.data);

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    return handleError(error, 'api') as APIErrorResponse;
  }
}
