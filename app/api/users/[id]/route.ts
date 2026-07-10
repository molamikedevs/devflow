import User from '@/database/user.model';
import handler from '@/lib/handlers/error';
import { NotFoundError } from '@/lib/http-errors';
import dbConnect from '@/lib/mongoose';
import { UserSchema } from '@/lib/validation';
import { APIErrorResponse } from '@/types/global';
import { NextResponse } from 'next/server';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) throw new NotFoundError('User');

  try {
    await dbConnect();
    // Looks up the user by their Mongo _id
    const user = await User.findById(id);
    if (!user) throw new NotFoundError('User');

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    return handler(error, 'api') as APIErrorResponse;
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) throw new NotFoundError('User');

  try {
    await dbConnect();
    // Deletes the user by id and returns the deleted document
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new NotFoundError('User');

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    return handler(error, 'api') as APIErrorResponse;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) throw new NotFoundError('User');

  try {
    await dbConnect();
    const body = await request.json();
    // Allows partial updates — only fields present in the body are validated
    const validatedData = UserSchema.partial().safeParse(body);

    // Updates the user and returns the updated document
    const updatedUser = await User.findByIdAndUpdate(id, validatedData, {
      new: true,
    });
    if (!updatedUser) throw new NotFoundError('User');

    return NextResponse.json(
      { success: true, data: updatedUser },
      { status: 200 },
    );
  } catch (error) {
    return handler(error, 'api') as APIErrorResponse;
  }
}
