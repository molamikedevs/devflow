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

export interface QuestionParams {
  _id: string;
  title: string;
  content: string;
  createdAt: Date;
  upvote: number;
  downvote: number;
  answers: number;
  views: number;
  author: Author;
  tags: Tag[];
}

// Standardized response type for API actions
type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  status?: number;
};

// Successful response type
type SuccessResponse<T = null> = ActionResponse<T> & { success: true };

// Error response type
type ErrorResponse = ActionResponse<undefined> & { success: false };

// Next.js specific response types
type APIErrorResponse = NextResponse<ErrorResponse>;

// Generic API response type
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}
