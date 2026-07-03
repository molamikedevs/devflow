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
