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
