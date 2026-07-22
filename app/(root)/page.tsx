import QuestionCard from '@/components/cards/question-card';
import DataRenderer from '@/components/common/data-renderer';
import HomeFilter from '@/components/filters/home-filter';
import LocalSearch from '@/components/search/local-search';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { EMPTY_QUESTION } from '@/constants/states';
import { getQuestions } from '@/lib/actions/question.action';

import Link from 'next/link';

interface QuestionSearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

export const metadata = {
  title: 'Home',
};

export default async function Home({ searchParams }: QuestionSearchParams) {
  const { page, pageSize, query, filter } = await searchParams;

  const { success, data, error } = await getQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    filter,
  });

  const { questions } = data || {};

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

      {/* Data Renderer */}
      <DataRenderer
        success={success}
        error={error}
        data={questions}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className="flex flex-col mt-10 w-full gap-6">
            {questions?.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      />
    </>
  );
}
