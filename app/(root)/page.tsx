import QuestionCard from '@/components/cards/question-card';
import HomeFilter from '@/components/filters/home-filter';
import LocalSearch from '@/components/search/local-search';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { questions } from '@/constants/index';

import Link from 'next/link';

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
      {/* Home filter */}
      <HomeFilter />

      <div className="flex flex-col mt-10 gap-6 w-full">
        {filteredQuestions.map((question) => (
          <QuestionCard key={question._id} question={question} />
        ))}
      </div>
    </>
  );
}
