import { NextResponse } from 'next/server';

export interface Tag {
  _id: string;
  name: string;
}

export interface Author {
  _id: string;
  name: string;
  image: string;
}

export interface Question {
  _id: string;
  title: string;
  description: string;
  createdAt: Date;
  upvote: number;
  downvote: number;
  answers: number;
  views: number;
  author: Author;
  tags: Tag[];
}

export type ActionResponse<T = null> = {
  seccess: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  status?: number;
};

export type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
export type ErrorResponse = ActionResponse<undefined> & { success: false };

export type APIErrorResponse = NextResponse<ErrorResponse>;
export type APIResponse<T = null> = NextResponse<SuccessResponse<T>>;
