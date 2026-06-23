import LocalSearch from '@/components/search/local-search';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import Link from 'next/link';

const questions = [
  {
    _id: '1',
    title: 'How to manage state in React?',
    description:
      'I am building a React application and I want to understand the best way to manage state between components.',
    tags: [
      { _id: '1', name: 'react' },
      { _id: '2', name: 'javascript' },
    ],
    author: {
      _id: '1',
      name: 'John Doe',
      upvotes: 15,
      downvotes: 1,
      answers: 8,
      views: 240,
      created_at: new Date(),
    },
  },
  {
    _id: '2',
    title: 'How does async/await work in JavaScript?',
    description:
      'I understand promises but I am confused about how async and await work behind the scenes.',
    tags: [
      { _id: '3', name: 'javascript' },
      { _id: '4', name: 'promises' },
    ],
    author: {
      _id: '2',
      name: 'Sarah Smith',
      upvotes: 22,
      downvotes: 3,
      answers: 12,
      views: 560,
      created_at: new Date(),
    },
  },
  {
    _id: '3',
    title: 'How to create a responsive layout with Tailwind CSS?',
    description:
      'I want to make my website responsive using Tailwind CSS but I am not sure how to structure my classes.',
    tags: [
      { _id: '5', name: 'tailwindcss' },
      { _id: '6', name: 'css' },
    ],
    author: {
      _id: '3',
      name: 'Michael Brown',
      upvotes: 30,
      downvotes: 4,
      answers: 15,
      views: 890,
      created_at: new Date(),
    },
  },
  {
    _id: '4',
    title: 'What is the difference between Next.js and React?',
    description:
      'I already know React and I want to understand what benefits Next.js provides.',
    tags: [
      { _id: '7', name: 'nextjs' },
      { _id: '8', name: 'react' },
    ],
    author: {
      _id: '4',
      name: 'Emily Johnson',
      upvotes: 18,
      downvotes: 2,
      answers: 7,
      views: 420,
      created_at: new Date(),
    },
  },
  {
    _id: '5',
    title: 'How to optimize a website performance?',
    description:
      'My website is loading slowly. What techniques can I use to improve performance?',
    tags: [
      { _id: '9', name: 'performance' },
      { _id: '10', name: 'web-development' },
    ],
    author: {
      _id: '5',
      name: 'David Wilson',
      upvotes: 25,
      downvotes: 5,
      answers: 10,
      views: 720,
      created_at: new Date(),
    },
  },
];

interface QuestionSearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function Home({ searchParams }: QuestionSearchParams) {
  const { query = '' } = await searchParams;

  const filteredQuestions = questions.filter((question) =>
    question.title.toLowerCase().includes(query?.toLowerCase()),
  );

  return (
    <>
      <section className="flex flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Button
          className="primary-gradient min-h-11.5 px-3 text-light-900!"
          asChild
        >
          <Link href={siteConfig.ROUTES.ASK_QUESTION}>Ask a question</Link>
        </Button>
      </section>

      <section className="mt-11">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          otherClasses="flex-1"
          iconPosition="left"
          placeholder="Search questions..."
        />
      </section>
      {/* <p>Home Filters</p> */}

      <div className="flex flex-col mt-10 gap-6 w-full">
        {filteredQuestions.map((question) => (
          <h1 key={question._id}>{question.title}</h1>
        ))}
      </div>
    </>
  );
}
