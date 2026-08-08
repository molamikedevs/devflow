import { siteConfig } from '@/config/site';
import { EMPTY_QUESTION } from '@/constants/states';
import { getTagQuestions } from '@/lib/actions/tag.action';
import { RouteParams } from '@/types/global';

import QuestionCard from '@/components/cards/question-card';
import DataRenderer from '@/components/common/data-renderer';
import CommonFilter from '@/components/filters/common-filter';
import LocalSearch from '@/components/search/local-search';
import { TagFilters } from '@/constants/filters';

export const metadata = {
  title: 'Tag Details',
};

export default async function TagDetails({
  params,
  searchParams,
}: RouteParams) {
  const { id } = await params;
  const { page, pageSize, query } = await searchParams;

  const { success, data, error } = await getTagQuestions({
    tagId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
  });

  const { tag, questions } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900 capitalize">
          {tag?.name}
        </h1>
      </section>
      <section className="mt-11">
        <LocalSearch
          route={siteConfig.ROUTES.TAG(id)}
          imgSrc="/icons/search.svg"
          placeholder="Search..."
          otherClasses="flex-1"
        />

        <CommonFilter
          filters={TagFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </section>
      <DataRenderer
        success={success}
        error={error}
        data={questions}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      />
    </>
  );
}
