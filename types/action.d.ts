export interface OauthSigninParams {
  provider: 'github' | 'google';
  providerAccountId: string;
  user: {
    name: string;
    username: string;
    email: string;
    image: string;
  };
}

export interface AuthCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface CreateQuestionParams {
  title: string;
  content: string;
  tags: string[];
}

export interface EditQuestionParams extends CreateQuestionParams {
  questionId: string;
}
export interface GetQuestionParams {
  questionId: string;
}

export interface CreateAnswerParams {
  questionId: string;
  content: string;
}

export interface CreateVoteParams {
  targetId: string;
  targetType: 'question' | 'answer';
  voteType: 'upvotes' | 'downvotes';
}
export interface UpdateVoteCountParams extends CreateVoteParams {
  change: 1 | -1;
}

export type HasVotedParams = pick<CreateVoteParams, 'targetId' | 'targetType'>;

export interface HasVotedResponse {
  hasupVoted: boolean;
  hasdownVoted: boolean;
}
