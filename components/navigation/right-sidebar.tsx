import DataRenderer from '@/components/common/data-renderer';
import { siteConfig } from '@/config/site';
import { getHotQuestions } from '@/lib/actions/question.action';
import { getTopTags } from '@/lib/actions/tag.action';
import Image from 'next/image';
import Link from 'next/link';
import TagCard from '../cards/Tag-card';

export default async function RightSidebar() {
  const [
    { success, data: questions, error },
    { success: tagSuccess, data: popularTags, error: tagError },
  ] = await Promise.all([getHotQuestions(), getTopTags()]);

  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 right-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 pt-36 max-xl:hidden dark:shadow-none">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <DataRenderer
          success={success}
          error={error}
          data={questions}
          empty={{
            title: 'No data found!',
            message: 'No questions yet, ask questions',
          }}
          render={(questions) => (
            <div className="mt-7 flex flex-col gap-[30px]">
              {questions.map(({ _id, title }) => (
                <Link
                  className="flex justify-between items-center gap-7"
                  key={_id}
                  href={siteConfig.ROUTES.QUESTION(_id)}
                >
                  <span className="body-medium text-dark500_light700">
                    {title}
                  </span>

                  <Image
                    src="/icons/chevron-right.svg"
                    alt="chevron"
                    width={20}
                    height={20}
                    className="invert-colors"
                  />
                </Link>
              ))}
            </div>
          )}
        />
      </div>

      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <DataRenderer
          success={tagSuccess}
          error={tagError}
          data={popularTags}
          empty={{ title: 'No tags yet', message: 'Ask question to get tags' }}
          render={(popularTags) => (
            <div className="mt-7 flex flex-col gap-4">
              {popularTags.map(({ _id, name, questions }) => (
                <TagCard
                  key={_id}
                  _id={_id}
                  name={name}
                  questions={questions}
                  showCount
                  compact
                />
              ))}
            </div>
          )}
        />
      </div>
    </section>
  );
}
